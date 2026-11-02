<?php
// Private fixture regression checks for administrator configuration validation.
if (PHP_SAPI !== 'cli' || $argc < 2) { exit("Supply private fixture root.\n"); }
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_p3_') || !$CFG->noemailever ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) { throw new RuntimeException('Unsafe fixture'); }
\core\session\manager::set_user(get_admin());
$_POST = ['sesskey' => sesskey()];
$milestone = $DB->get_record_sql('SELECT * FROM {local_ignite_milestone} ORDER BY id DESC LIMIT 1');
$data = ['name' => 'Future configuration fixture', 'description' => 'Not learner-facing fixture content.',
    'target' => 20, 'timestart' => time() + 604800, 'timeend' => time() + 608400,
    'timezone' => 'UTC', 'active' => 0];
function reject_config(callable $operation, string $label): void {
    try { $operation(); } catch (moodle_exception $e) { echo "PASS $label\n"; return; }
    throw new RuntimeException('Expected rejection: ' . $label);
}
$milestones = [(int)$milestone->cmid => 'complete'];
reject_config(fn() => \local_ignite\challenges::configure(0, ['name' => 'Incomplete fields'], $milestones),
    'Incomplete configuration is rejected without undefined-field notices');
$id = \local_ignite\challenges::configure(0, $data, $milestones);
try {
    reject_config(fn() => \local_ignite\challenges::configure($id, array_replace($data, ['timestart' => time() - 60]), $milestones),
        'Editing a future period cannot backdate its start');
    if ((int)$DB->get_field('local_ignite_challenge', 'timestart', ['id' => $id]) !== $data['timestart']) {
        throw new RuntimeException('Rejected edit changed the original period');
    }
    echo "PASS Rejected edit preserves the configured period\n";
    $_POST = [];
    reject_config(fn() => \local_ignite\challenges::deactivate($id), 'Challenge mutation rejects missing CSRF key');
} finally {
    foreach (['credit', 'milestone', 'total'] as $table) { $DB->delete_records('local_ignite_' . $table, ['challengeid' => $id]); }
    $DB->delete_records('local_ignite_challenge', ['id' => $id]);
}
$dashboard = $CFG->enabledashboard ?? null;
$CFG->enabledashboard = 0;
if (\local_ignite\hearth_ui::return_url('/my/')->get_path() !== '/local/ignite/index.php') {
    throw new RuntimeException('Unavailable dashboard did not fall back to Ignite home');
}
$CFG->enabledashboard = $dashboard;
echo "PASS Unavailable dashboard return destination falls back to Ignite home\n";
$mycourses = $CFG->enablemycourses ?? null;
$CFG->enablemycourses = 0;
if (\local_ignite\hearth_ui::return_url('/my/courses.php')->get_path() !== '/local/ignite/index.php') {
    throw new RuntimeException('Unavailable My courses did not fall back to Ignite home');
}
$CFG->enablemycourses = $mycourses;
echo "PASS Unavailable My courses return destination falls back to Ignite home\nConfiguration checks: 6 passed\n";
