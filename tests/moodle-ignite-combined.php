<?php
// Verify reconciliation of Prompts 2–4 using an empty private runtime, never production.
if (PHP_SAPI !== 'cli' || $argc < 2) { exit("Supply private Moodle root [--snapshot].\n"); }
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_p5_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:') ||
        !str_starts_with($CFG->dataroot, '/tmp/ignite-p5-runtime/')) {
    throw new RuntimeException('Private combined fixture required.');
}
\core\session\manager::set_user(get_admin());
function combined_snapshot(): array {
    global $DB;
    $rows = [];
    foreach (['local_ignite_prefs', 'local_ignite_member', 'local_ignite_house', 'user_enrolments',
            'grade_grades', 'badge', 'badge_issued'] as $table) {
        $rows[$table] = array_values($DB->get_records($table, [], 'id'));
        foreach ($rows[$table] as $row) {
            unset($row->targetkey, $row->shortname, $row->personality, $row->mascot);
        }
    }
    $rows['catalog'] = get_config('local_ignite', 'catalog');
    return $rows;
}
if (($argv[2] ?? '') === '--snapshot') {
    if ((int)get_config('local_ignite', 'version') !== 2026110101) { throw new RuntimeException('Prompt 1 required'); }
    set_config('combinedsnapshot', json_encode(combined_snapshot()), 'local_ignite');
    exit("Saved completed Prompt 1 records.\n");
}
$checks = 0;
function combined_check(bool $ok, string $message): void {
    global $checks;
    if (!$ok) { throw new RuntimeException($message); }
    $checks++;
    echo "PASS $message\n";
}
combined_check((int)get_config('local_ignite', 'version') >= 2026110400, 'Combined native plugin version');
$before = get_config('local_ignite', 'combinedsnapshot');
if ($before) {
    combined_check(json_decode($before) == (object)combined_snapshot(),
        'Upgrade preserved foundation records, identities, configuration and native learning/credentials');
} else {
    combined_check(!\local_ignite\access::enabled() && $DB->count_records('local_ignite_house') === 0,
        'Fresh install is disabled and creates no unapproved identities');
}
foreach (['prefs', 'member', 'house', 'invite', 'history', 'challenge', 'milestone', 'credit', 'total', 'feature'] as $name) {
    combined_check($DB->get_manager()->table_exists('local_ignite_' . $name), 'Combined table: ' . $name);
}
$metadata = \local_ignite\privacy\provider::get_metadata(new \core_privacy\local\metadata\collection('local_ignite'));
$tables = [];
foreach ($metadata->get_collection() as $item) { $tables[] = $item->get_name(); }
foreach (['prefs', 'member', 'invite', 'history', 'credit', 'feature'] as $name) {
    combined_check(in_array('local_ignite_' . $name, $tables), 'Privacy metadata includes ' . $name);
}
echo "Combined checks: $checks passed\n";
