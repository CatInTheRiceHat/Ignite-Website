<?php
// Add the Ignite dashboard panels through Moodle's block APIs without resetting dashboards.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
define('CLI_SCRIPT', true);
if ($argc !== 4 || !in_array($argv[3], ['--check', '--apply']) &&
        !preg_match('/^--restore=[a-zA-Z0-9_.-]+\.json$/', $argv[3])) {
    fwrite(STDERR, "Usage: install-dashboard.php MOODLE_ROOT BACKUP_DIR --check|--apply|--restore=FILE.json\n");
    exit(1);
}
[$script, $root, $backupdir, $mode] = $argv;
require $root . '/config.php';
require_once $CFG->dirroot . '/my/lib.php';
require_once $CFG->libdir . '/filelib.php';
if ($CFG->wwwroot !== 'https://learn.ignitefindyourfire.org' || ($CFG->theme ?? '') !== 'boost') {
    throw new RuntimeException('Expected Ignite Moodle with the Boost theme.');
}
if (empty($CFG->enabledashboard)) {
    throw new RuntimeException('The Moodle dashboard must be enabled before installing these panels.');
}
$lock = \core\lock\lock_config::get_lock_factory('ignite_deploy')->get_lock('theme_and_blocks', 10);
if (!$lock) {
    throw new RuntimeException('Another Ignite deployment is running.');
}
try {
    if (str_starts_with($mode, '--restore=')) {
        $manifest = json_decode(file_get_contents($backupdir . '/' . substr($mode, 10)), true, 512, JSON_THROW_ON_ERROR);
        if (($manifest['url'] ?? '') !== $CFG->wwwroot || ($manifest['type'] ?? '') !== 'ignite_dashboard_install') {
            throw new RuntimeException('Expected an Ignite dashboard installation backup.');
        }
        $transaction = $DB->start_delegated_transaction();
        try {
            if (!set_config('enablemycourses', $manifest['enablemycourses'])) {
                throw new RuntimeException('Could not restore the My courses setting.');
            }
            foreach ($manifest['created'] as $record) {
                $instance = $DB->get_record('block_instances', ['id' => $record['id']]);
                if (!$instance) {
                    continue;
                }
                if ($instance->blockname !== 'html' || $instance->parentcontextid != $record['contextid'] ||
                        $instance->subpagepattern != $record['pageid'] || $instance->pagetypepattern !== 'my-index') {
                    throw new RuntimeException('A created block has changed ownership; it must be reviewed separately.');
                }
                blocks_delete_instance($instance);
            }
            $transaction->allow_commit();
        } catch (Throwable $error) {
            $transaction->rollback($error);
        }
        echo json_encode(['url' => $CFG->wwwroot, 'changed' => true, 'restored' => true]), "\n";
        return;
    }
    $panels = [];
    foreach (['navigation' => 'ignite-learning-nav', 'welcome' => 'ignite-learning-welcome'] as $kind => $marker) {
        $text = file_get_contents(__DIR__ . "/dashboard-$kind.html");
        if (!is_string($text) || !str_contains($text, 'class="' . $marker . '"')) {
            throw new RuntimeException("Invalid $kind dashboard panel.");
        }
        $panels[$kind] = ['text' => $text, 'marker' => $marker];
    }
    $pages = $DB->get_records('my_pages', ['name' => MY_PAGE_DEFAULT, 'private' => MY_PAGE_PRIVATE]);
    $plan = [];
    foreach ($pages as $dashboard) {
        $context = $dashboard->userid ? context_user::instance($dashboard->userid) : context_system::instance();
        $instances = $DB->get_records('block_instances', ['parentcontextid' => $context->id,
            'pagetypepattern' => 'my-index', 'subpagepattern' => (string)$dashboard->id]);
        foreach ($panels as $kind => $panel) {
            $matches = [];
            foreach ($instances as $instance) {
                if ($instance->blockname !== 'html') {
                    continue;
                }
                $config = unserialize(base64_decode($instance->configdata), ['allowed_classes' => ['stdClass']]);
                if (preg_match('/class=["\'][^"\']*\b' . $panel['marker'] . '\b/', $config->text ?? '')) {
                    $matches[] = $instance;
                }
            }
            if (count($matches) > 1) {
                throw new RuntimeException('Duplicate Ignite panels must be reviewed before installation.');
            }
            if ($matches && $matches[0]->defaultregion !== 'content') {
                throw new RuntimeException('An existing Ignite panel is outside the main content region.');
            }
            if (!$matches) {
                $plan[] = ['pageid' => (int)$dashboard->id, 'contextid' => $context->id, 'kind' => $kind];
            }
        }
    }
    $enablemycourses = get_config('core', 'enablemycourses');
    $enablecourses = empty($CFG->enablemycourses);
    $result = ['mode' => $mode, 'url' => $CFG->wwwroot, 'dashboards_checked' => count($pages),
        'panels_to_add' => count($plan), 'enable_my_courses' => $enablecourses, 'changed' => false];
    if ($mode === '--apply' && ($plan || $enablecourses)) {
        $backup = gmdate('Ymd\THis\Z') . '-dashboard-' . bin2hex(random_bytes(4)) . '.json';
        $manifest = ['type' => 'ignite_dashboard_install', 'url' => $CFG->wwwroot, 'plan' => $plan, 'created' => [],
            'enablemycourses' => $enablemycourses === false ? null : $enablemycourses];
        $write = static function () use (&$manifest, $backupdir, $backup) {
            $json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
            $oldmask = umask(0077);
            try {
                if (file_put_contents($backupdir . '/' . $backup, $json, LOCK_EX) !== strlen($json)) {
                    throw new RuntimeException('Could not save the dashboard installation backup.');
                }
            } finally {
                umask($oldmask);
            }
        };
        $write();
        $transaction = $DB->start_delegated_transaction();
        try {
            if ($enablecourses && !set_config('enablemycourses', 1)) {
                throw new RuntimeException('Could not enable My courses.');
            }
            foreach ($plan as $item) {
                $page = new moodle_page();
                $page->set_context(context::instance_by_id($item['contextid']));
                $page->set_url('/my/index.php');
                $page->set_pagelayout('mydashboard');
                $page->set_pagetype('my-index');
                $page->set_subpage($item['pageid']);
                $page->blocks->add_region('content');
                $block = $page->blocks->add_block('html', 'content', $item['kind'] === 'navigation' ? -20 : -19,
                    false, 'my-index', (string)$item['pageid']);
                if (!$block) {
                    throw new RuntimeException('Could not create an Ignite dashboard block.');
                }
                $block->instance_config_save((object)['title' => '',
                    'text' => ['itemid' => IGNORE_FILE_MERGE, 'format' => FORMAT_HTML,
                        'text' => $panels[$item['kind']]['text']]]);
                $manifest['created'][] = $item + ['id' => (int)$block->instance->id];
            }
            $write();
            $transaction->allow_commit();
        } catch (Throwable $error) {
            $transaction->rollback($error);
        }
        $result['changed'] = true;
        $result['backup'] = $backup;
        $result['panels_added'] = count($manifest['created']);
    }
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), "\n";
} finally {
    $lock->release();
}
