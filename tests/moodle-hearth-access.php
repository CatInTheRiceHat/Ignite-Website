<?php
// Real capability checks after the main suite; private fixture only.
if (PHP_SAPI !== 'cli' || $argc < 2) { exit("Supply the private Moodle fixture root.\n"); }
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
require_once($CFG->libdir . '/completionlib.php');
if (!str_contains($CFG->dbname, 'ignite_lms_test_p3_') || !$CFG->noemailever ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) { throw new RuntimeException('Unsafe fixture'); }
$context = context_system::instance();
$bob = $DB->get_record_sql("SELECT * FROM {user} WHERE username LIKE 'hearth_fixture_%_bob' ORDER BY id DESC LIMIT 1");
\core\session\manager::set_user(get_admin());
$roleid = create_role('Hearth fixture restricted access', 'hearthrestricted' . time(), 'Temporary fixture capability test');
try {
    assign_capability('local/ignite:use', CAP_PROHIBIT, $roleid, $context->id);
    role_assign($roleid, $bob->id, $context->id);
    \core\session\manager::set_user($bob);
    $_POST = ['sesskey' => sesskey()];
    try {
        \local_ignite\houses::available();
        throw new RuntimeException('Restricted learner could use Hearth service');
    } catch (required_capability_exception $e) {
        echo "PASS Restricted authenticated learner cannot use Hearth services\n";
    }
    \core\session\manager::set_user(get_admin());
    $challenge = \local_ignite\challenges::current();
    $milestones = $DB->get_records('local_ignite_milestone', ['challengeid' => $challenge->id], 'id');
    $milestone = reset($milestones);
    $cm = get_coursemodule_from_id(null, $milestone->cmid, 0, false, MUST_EXIST);
    $completion = new completion_info(get_course($cm->course));
    $completion->update_state($cm, COMPLETION_INCOMPLETE, $bob->id);
    $completion->update_state($cm, COMPLETION_COMPLETE, $bob->id);
    if ($DB->record_exists('local_ignite_credit', ['userid' => $bob->id])) {
        throw new RuntimeException('Completion observer bypassed local/ignite:use');
    }
    echo "PASS Native completion event cannot bypass the learner capability\nCapability checks: 2 passed\n";
} finally {
    role_unassign($roleid, $bob->id, $context->id);
    delete_role($roleid);
}
