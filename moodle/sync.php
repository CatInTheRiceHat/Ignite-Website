<?php
// CLI only: runs through SSH as the Moodle web-server user, outside the web root.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
define('CLI_SCRIPT', true);
if ($argc !== 4 || !in_array($argv[3], ['--check', '--apply']) &&
        !preg_match('/^--restore=[a-zA-Z0-9_.-]+\.json$/', $argv[3])) {
    fwrite(STDERR, "Usage: sync.php MOODLE_ROOT BACKUP_DIR --check|--apply|--restore=FILE.json\n");
    exit(1);
}
[$script, $root, $backupdir, $mode] = $argv;
require $root . '/config.php';
require_once $CFG->libdir . '/blocklib.php';
require_once $CFG->libdir . '/filelib.php';
if ($CFG->wwwroot !== 'https://learn.ignitefindyourfire.org' || ($CFG->theme ?? '') !== 'boost') {
    throw new RuntimeException('Expected the Ignite Moodle site using Boost. No settings were changed.');
}
$lock = \core\lock\lock_config::get_lock_factory('ignite_deploy')->get_lock('theme_and_blocks', 10);
if (!$lock) {
    throw new RuntimeException('Another Ignite deployment is running.');
}

function ignite_config($instance) {
    $config = unserialize(base64_decode($instance->configdata), ['allowed_classes' => ['stdClass']]);
    return $config instanceof stdClass ? $config : new stdClass();
}

function ignite_kind(string $text): ?string {
    foreach (['navigation' => 'ignite-learning-nav', 'welcome' => 'ignite-learning-welcome'] as $kind => $marker) {
        if (preg_match('/class=["\'][^"\']*\b' . $marker . '\b/', $text)) {
            return $kind;
        }
    }
    return null;
}

try {
    $contextid = context_system::instance()->id;
    $fs = get_file_storage();
    $file = $fs->get_file($contextid, 'theme_boost', 'preset', 0, '/', 'theme.scss');
    $settings = [];
    foreach (['scss', 'preset', 'brandcolor'] as $name) {
        $value = get_config('theme_boost', $name);
        $settings[$name] = $value === false ? null : $value;
    }
    $current = ['url' => $CFG->wwwroot, 'settings' => $settings,
        'preset_content' => $file ? $file->get_content() : null, 'blocks' => []];
    $footer = get_config('core', 'additionalhtmlfooter');
    $current['authentication_footer'] = $footer === false ? null : $footer;
    $instances = $DB->get_records('block_instances', ['blockname' => 'html']);
    $counts = ['navigation' => 0, 'welcome' => 0];
    foreach ($instances as $instance) {
        // Only previously installed Ignite dashboard blocks are managed. No learner data or layouts are reset.
        if ($instance->pagetypepattern !== 'my-index') {
            continue;
        }
        $kind = ignite_kind(ignite_config($instance)->text ?? '');
        if ($kind) {
            $current['blocks'][(string)$instance->id] = $instance->configdata;
            $counts[$kind]++;
        }
    }
    if (str_starts_with($mode, '--restore=')) {
        $path = $backupdir . '/' . substr($mode, strlen('--restore='));
        $desired = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        if (($desired['url'] ?? '') !== $CFG->wwwroot || !isset($desired['settings'], $desired['blocks']) ||
                !array_key_exists('preset_content', $desired)) {
            throw new RuntimeException('Invalid backup for this Moodle site.');
        }
        // Older backups predate the authentication fragment; leave it as-is.
        if (!array_key_exists('authentication_footer', $desired)) {
            $desired['authentication_footer'] = $current['authentication_footer'];
        }
        if ($desired['authentication_footer'] !== null && !is_string($desired['authentication_footer'])) {
            throw new RuntimeException('Invalid authentication footer in backup.');
        }
        foreach ($desired['blocks'] as $id => $configdata) {
            if (!isset($current['blocks'][$id])) {
                throw new RuntimeException("Managed block $id was removed or changed. Restore it separately.");
            }
        }
    } else {
        $desired = $current;
        $desired['settings'] = ['scss' => file_get_contents(__DIR__ . '/raw.scss'),
            'preset' => 'theme.scss', 'brandcolor' => '#F07B2A'];
        $desired['preset_content'] = file_get_contents(__DIR__ . '/theme.scss');
        $start = '<!-- ignite-authentication:start -->';
        $end = '<!-- ignite-authentication:end -->';
        $snippet = trim(file_get_contents(__DIR__ . '/authentication.html'));
        $assets = json_decode(file_get_contents(__DIR__ . '/seasonal-backgrounds.json'), true, 512, JSON_THROW_ON_ERROR);
        $backgrounds = [];
        foreach (['spring', 'summer', 'fall', 'winter'] as $season) {
            $filename = $assets[$season] ?? '';
            if (!is_string($filename) || !preg_match('/^' . $season . '-[a-f0-9]{12}\.jpg$/', $filename)) {
                throw new RuntimeException("Missing or invalid $season background.");
            }
            $backgrounds[$season] = $CFG->wwwroot . '/ignite-assets/' . $filename;
        }
        if (substr_count($snippet, '__IGNITE_SEASONAL_BACKGROUNDS__') !== 1) {
            throw new RuntimeException('Invalid seasonal background placeholder.');
        }
        $snippet = str_replace('__IGNITE_SEASONAL_BACKGROUNDS__', json_encode($backgrounds,
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), $snippet);
        $footer = $current['authentication_footer'] ?? '';
        if (!str_starts_with($snippet, $start) || !str_ends_with($snippet, $end) ||
                substr_count($snippet, $start) !== 1 || substr_count($snippet, $end) !== 1) {
            throw new RuntimeException('Missing or invalid authentication snippet.');
        }
        if (substr_count($footer, $start) > 1 || substr_count($footer, $start) !== substr_count($footer, $end)) {
            throw new RuntimeException('Duplicate or incomplete authentication footer markers.');
        }
        if (str_contains($footer, $start)) {
            // Replace only our fragment, preserving unrelated Additional HTML.
            $desired['authentication_footer'] = preg_replace_callback(
                '/' . preg_quote($start, '/') . '.*?' . preg_quote($end, '/') . '/s',
                static fn() => $snippet, $footer, 1, $replaced);
            if ($replaced !== 1) {
                throw new RuntimeException('Invalid authentication footer marker order.');
            }
        } else {
            $desired['authentication_footer'] = $footer . ($footer === '' ? '' : "\n") . $snippet;
        }
        foreach (['scss' => $desired['settings']['scss'], 'theme.scss' => $desired['preset_content']] as $name => $text) {
            if (!is_string($text) || strlen(trim($text)) < 100) {
                throw new RuntimeException("Missing or empty $name. No settings were changed.");
            }
        }
        foreach ($current['blocks'] as $id => $configdata) {
            $config = ignite_config($instances[$id]);
            $kind = ignite_kind($config->text);
            $text = file_get_contents(__DIR__ . "/dashboard-$kind.html");
            if (!is_string($text) || ignite_kind($text) !== $kind) {
                throw new RuntimeException("Missing or invalid $kind dashboard snippet.");
            }
            $config->text = $text;
            $config->format = FORMAT_HTML;
            $desired['blocks'][$id] = base64_encode(serialize($config));
        }
    }
    $changes = [];
    foreach ($desired['settings'] as $name => $value) {
        if (!array_key_exists($name, $settings)) {
            throw new RuntimeException("Unmanaged setting in backup: $name");
        }
        if ($settings[$name] !== $value) {
            $changes[] = "theme_boost.$name";
        }
    }
    if ($desired['preset_content'] !== $current['preset_content']) {
        $changes[] = 'theme_boost preset: theme.scss';
    }
    if ($desired['authentication_footer'] !== $current['authentication_footer']) {
        $changes[] = 'core.additionalhtmlfooter: Ignite authentication';
    }
    foreach ($desired['blocks'] as $id => $configdata) {
        if ($current['blocks'][$id] !== $configdata) {
            $changes[] = "Ignite dashboard block $id";
        }
    }
    $result = ['mode' => $mode, 'url' => $CFG->wwwroot, 'release' => $CFG->release,
        'changes' => $changes, 'dashboard_blocks' => $counts, 'changed' => false];
    if (!$counts['navigation'] || !$counts['welcome']) {
        $result['note'] = 'Dashboard snippets sync only to installed Ignite blocks. Missing blocks are not created and personal dashboards are not reset.';
    }
    if ($mode !== '--check' && $changes) {
        if (!is_dir($backupdir) || !is_writable($backupdir)) {
            throw new RuntimeException('Backup directory must exist and be writable before deploying.');
        }
        $backup = gmdate('Ymd\THis\Z') . '-' . bin2hex(random_bytes(4)) . '.json';
        $json = json_encode($current, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $previousmask = umask(0077);
        try {
            if (file_put_contents($backupdir . '/' . $backup, $json, LOCK_EX) !== strlen($json)) {
                throw new RuntimeException('Could not write a complete backup.');
            }
        } finally {
            umask($previousmask);
        }
        $transaction = $DB->start_delegated_transaction();
        try {
            if ($desired['authentication_footer'] !== $current['authentication_footer'] &&
                    !set_config('additionalhtmlfooter', $desired['authentication_footer'])) {
                throw new RuntimeException('Failed to save the authentication footer.');
            }
            foreach ($desired['settings'] as $name => $value) {
                if ($settings[$name] !== $value && !set_config($name, $value, 'theme_boost')) {
                    throw new RuntimeException("Failed to save $name");
                }
            }
            if ($desired['preset_content'] !== $current['preset_content']) {
                if ($file) {
                    $file->delete();
                }
                if ($desired['preset_content'] !== null) {
                    $fs->create_file_from_string(['contextid' => $contextid, 'component' => 'theme_boost',
                        'filearea' => 'preset', 'itemid' => 0, 'filepath' => '/', 'filename' => 'theme.scss'],
                        $desired['preset_content']);
                }
            }
            foreach ($desired['blocks'] as $id => $configdata) {
                if ($current['blocks'][$id] !== $configdata) {
                    $block = block_instance('html', $instances[$id]);
                    if (!$block) {
                        throw new RuntimeException("Could not load dashboard block $id");
                    }
                    // Text blocks expect the editor-shaped value. Keep existing embedded files.
                    $config = ignite_config((object)['configdata' => $configdata]);
                    $config->text = ['itemid' => IGNORE_FILE_MERGE, 'format' => $config->format ?? FORMAT_HTML,
                        'text' => $config->text];
                    $block->instance_config_save($config);
                }
            }
            $transaction->allow_commit();
        } catch (Throwable $error) {
            $transaction->rollback($error);
        }
        theme_reset_all_caches();
        $result['changed'] = true;
        $result['backup'] = $backup;
    }
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), "\n";
} finally {
    $lock->release();
}
