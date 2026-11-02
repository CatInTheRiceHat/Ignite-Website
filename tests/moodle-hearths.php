<?php
// Private real-Moodle Prompt 3 integration suite. Never run on live data.
// php tests/moodle-hearths.php PRIVATE_MOODLE_ROOT [--worker USERID CMID CHALLENGEID]
if (PHP_SAPI !== 'cli' || $argc < 2) {
    exit("Supply a private Moodle fixture root.\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_p3_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) {
    throw new RuntimeException('Requires isolated Prompt 3 test DB, loopback wwwroot and disabled email.');
}
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->libdir . '/completionlib.php');
require_once($CFG->dirroot . '/local/ignite/lib.php');
use local_ignite\access;
use local_ignite\houses;
use local_ignite\challenges;
use local_ignite\hearth_ui;
use local_ignite\hearth_setup;
use local_ignite\privacy\provider;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\writer;
$checks = 0;
function verify(bool $ok, string $label): void {
    global $checks;
    if (!$ok) {
        throw new RuntimeException($label);
    }
    $checks++;
    echo "PASS $label\n";
}
function rejected(callable $action, string $label): void {
    try {
        $action();
    } catch (moodle_exception $e) {
        verify(true, $label);
        return;
    }
    throw new RuntimeException('Expected rejection: ' . $label);
}
function as_user(stdClass $user): void {
    \core\session\manager::set_user($user);
    $_POST = ['sesskey' => sesskey()];
    $_GET = [];
}
function native_evidence(int $userid, int $cmid, int $when, int $state): stdClass {
    global $DB;
    $cm = get_coursemodule_from_id(null, $cmid, 0, false, MUST_EXIST);
    $completion = new completion_info(get_course($cm->course));
    $data = $completion->get_data($cm, false, $userid);
    $data->completionstate = $state;
    $data->timemodified = $when;
    $data->overrideby = 0;
    $data->viewed = 0;
    $completion->internal_set_data($cm, $data);
    return $DB->get_record('course_modules_completion', ['userid' => $userid, 'coursemoduleid' => $cmid], '*', MUST_EXIST);
}
function snapshot_event(stdClass $data): \core\event\course_module_completion_updated {
    $event = \core\event\course_module_completion_updated::create([
        'objectid' => $data->id, 'context' => context_module::instance($data->coursemoduleid),
        'relateduserid' => $data->userid, 'other' => ['completionstate' => $data->completionstate],
    ]);
    $event->add_record_snapshot('course_modules_completion', $data);
    return $event;
}
if (($argv[2] ?? '') === '--worker') {
    as_user(core_user::get_user((int)$argv[3], '*', MUST_EXIST));
    $data = $DB->get_record('course_modules_completion', ['userid' => (int)$argv[3], 'coursemoduleid' => (int)$argv[4]], '*', MUST_EXIST);
    for ($n = 0; $n < 8; $n++) {
        challenges::observe(snapshot_event($data));
    }
    exit(0);
}
as_user(get_admin());
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/hearth.php');
verify((int)get_config('local_ignite', 'version') === 2026110300, 'Native version installed/upgraded');
$baseline = $DB->get_record('local_ignite_house', ['code' => 'ember']);
if ($baseline) {
    verify($baseline->name === 'Renamed by administrator', 'Upgrade preserved administrator name');
    verify($DB->count_records('local_ignite_house') === 4, 'Upgrade did not recreate identities');
    verify($DB->count_records('local_ignite_member') === 1, 'Upgrade preserved current membership');
    verify($DB->count_records('local_ignite_prefs') === 1, 'Upgrade preserved preferences');
    verify($DB->count_records('local_ignite_history') === 1, 'Upgrade opens conservative membership history');
} else {
    verify($DB->count_records('local_ignite_house') === 0, 'Fresh install creates no unapproved placeholders or Phoenix');
}
set_config('enabled', 1, 'local_ignite');
set_config('houses', 1, 'local_ignite');
$before = $DB->get_records('local_ignite_house', null, 'id');
hearth_setup::apply(['embercrest' => 0, 'cinderwick' => 0]);
verify($before == $DB->get_records('local_ignite_house', null, 'id'), 'Skipped setup leaves configured records untouched');
hearth_setup::apply(array_fill_keys(array_keys(hearth_setup::DRAFTS), -1));
$hearths = $DB->get_records_list('local_ignite_house', 'code', array_keys(hearth_setup::DRAFTS), 'id');
[$h1, $h2, $h3, $h4] = array_values($hearths);
verify(count($hearths) === 4, 'Only explicitly reviewed draft records created');
verify($h1->accent === $h2->accent && $h1->mascot === 'placeholder', 'Neutral common color and labeled mascot placeholder');
rejected(fn() => hearth_setup::apply(['embercrest' => $h1->id, 'cinderwick' => $h1->id]), 'Setup rejects duplicate target IDs');
$original = clone $h1;
houses::configure((int)$h1->id, ['name' => 'Configured & renamed', 'description' => 'Keep this identity',
    'accent' => '#6741A5', 'emblem' => 'lightbulb', 'active' => 1, 'shortname' => 'Configured',
    'personality' => 'Try something together.', 'mascot' => 'sol']);
hearth_setup::apply(['embercrest' => (int)$h1->id]);
$h1 = $DB->get_record('local_ignite_house', ['id' => $h1->id]);
verify($h1->accent === '#6741A5' && $h1->description === 'Keep this identity' && $h1->code === $original->code,
    'Explicit rename preserves stable code, artwork and existing color/description');
$tag = 'hearth_fixture_' . bin2hex(random_bytes(4));
$users = [];
foreach (['alice', 'bob', 'carol'] as $name) {
    $id = user_create_user((object)['username' => $tag . '_' . $name, 'firstname' => ucfirst($name),
        'lastname' => 'Fixture', 'email' => $tag . '_' . $name . '@example.invalid',
        'password' => 'FixtureOnly!4829aZ', 'auth' => 'manual', 'confirmed' => 1, 'mnethostid' => $CFG->mnet_localhost_id]);
    $users[$name] = core_user::get_user($id, '*', MUST_EXIST);
}
$course = create_course((object)['fullname' => 'Hearth fixture skills', 'shortname' => $tag,
    'enablecompletion' => 1, 'category' => $DB->get_field('course_categories', 'id', [], IGNORE_MULTIPLE)]);
$cms = [];
for ($n = 0; $n < 8; $n++) {
    $page = add_moduleinfo((object)[
        'modulename' => 'page', 'module' => $DB->get_field('modules', 'id', ['name' => 'page']),
        'course' => $course->id, 'section' => 0, 'name' => 'Practical milestone ' . $n,
        'intro' => '', 'introformat' => FORMAT_HTML, 'content' => 'A real fixture learning activity.',
        'contentformat' => FORMAT_HTML, 'display' => 5, 'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0,
        'completion' => COMPLETION_TRACKING_MANUAL,
    ], $course);
    $cms[] = (int)$page->coursemodule;
}
$enrol = enrol_get_plugin('manual');
$instances = enrol_get_instances($course->id, false);
$instance = reset($instances);
$studentrole = $DB->get_field('role', 'id', ['shortname' => 'student']);
foreach (['alice', 'bob'] as $name) {
    $enrol->enrol_user($instance, $users[$name]->id, $studentrole);
}
$enrolcount = $DB->count_records('user_enrolments');
$gradecount = $DB->count_records('grade_grades');
$badgecount = $DB->count_records('badge_issued');
$now = time();
$configuration = ['name' => 'Build a little every day', 'description' => 'Complete practical milestones together.',
    'target' => 20, 'timestart' => $now + 3600, 'timeend' => $now + 7200, 'timezone' => 'America/Los_Angeles', 'active' => 1];
$challengeid = challenges::configure(0, $configuration, array_fill_keys($cms, 'complete'));
rejected(fn() => challenges::configure(0, $configuration, [$cms[0] => 'complete']), 'Overlapping active periods rejected');
rejected(fn() => challenges::configure(0, $configuration + [], [$cms[0] => 'pass']), 'Passing condition requires native passing-grade configuration');
verify(challenges::timestamp('2026-11-02 10:00', 'America/Los_Angeles') === 1793642400, 'IANA timezone converts a valid boundary');
rejected(fn() => challenges::timestamp('2026-11-01 01:30', 'America/Los_Angeles'), 'DST repeated hour rejected');
rejected(fn() => challenges::timestamp('2026-03-08 02:30', 'America/Los_Angeles'), 'DST nonexistent hour rejected');
// Deterministic fixture boundaries; administrator UI itself forbids backdated periods.
$start = $now - 100;
$end = $now + 3600;
$DB->update_record('local_ignite_challenge', (object)['id' => $challengeid, 'timestart' => $start, 'timeend' => $end]);
rejected(fn() => challenges::configure($challengeid, $configuration, [$cms[0] => 'complete']), 'Started period immutable');
as_user($users['alice']);
verify(houses::get_current() === null, 'Direct learner service starts without membership');
$_POST = [];
rejected(fn() => houses::set_current((int)$h1->id), 'Membership rejects missing CSRF key');
$_POST = ['sesskey' => sesskey()];
houses::set_current((int)$h1->id);
houses::set_current((int)$h1->id);
verify($DB->count_records('local_ignite_history', ['userid' => $users['alice']->id]) === 1, 'Repeated join is idempotent');
$DB->set_field('local_ignite_history', 'timebegin', $start - 20, ['userid' => $users['alice']->id]);
verify(hearth_ui::next_action(challenges::current()) !== null, 'Eligible enrolled learner gets a real activity action');
$evidence = native_evidence($users['alice']->id, $cms[0], $start, COMPLETION_COMPLETE);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[0]]) === 'credited', 'Native completion event credits inclusive start boundary');
$DB->delete_records('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[0]]);
$workers = [];
for ($n = 0; $n < 6; $n++) {
    $command = [PHP_BINARY, __FILE__, $argv[1], '--worker', $users['alice']->id, $cms[0], $challengeid];
    $workers[] = proc_open($command, [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'a'], 2 => ['file', '/dev/null', 'a']], $pipes);
}
foreach ($workers as $worker) {
    verify(proc_close($worker) === 0, 'Concurrent event worker succeeded');
}
verify($DB->count_records('local_ignite_credit', ['challengeid' => $challengeid, 'userid' => $users['alice']->id, 'cmid' => $cms[0]]) === 1,
    'Concurrent duplicate evidence creates exactly one contribution');
rejected(function() use ($DB, $evidence, $challengeid, $h1) {
    $DB->insert_record('local_ignite_credit', (object)['challengeid' => $challengeid, 'userid' => $evidence->userid,
        'cmid' => $evidence->coursemoduleid, 'houseid' => $h1->id, 'timequalified' => $evidence->timemodified,
        'status' => 'credited', 'timemodified' => time()]);
}, 'Database uniqueness rejects duplicate independently of locks');
native_evidence($users['alice']->id, $cms[1], $start + 1, COMPLETION_INCOMPLETE);
native_evidence($users['alice']->id, $cms[1], $start + 2, COMPLETION_COMPLETE_FAIL);
verify(!$DB->record_exists('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[1]]), 'Pending and failed completion earns no credit');
native_evidence($users['alice']->id, $cms[2], $end, COMPLETION_COMPLETE);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[2]]) === 'excluded', 'Exclusive end boundary earns no credit');
native_evidence($users['alice']->id, $cms[3], $start - 1, COMPLETION_COMPLETE);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[3]]) === 'excluded', 'Completion before period excluded');
// Native snapshot retained for delayed delivery after a real membership switch.
$delayed = native_evidence($users['alice']->id, $cms[4], $now - 5, COMPLETION_COMPLETE);
$event = snapshot_event($delayed);
$DB->delete_records('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[4]]);
houses::set_current((int)$h2->id);
challenges::observe($event);
verify((int)$DB->get_field('local_ignite_credit', 'houseid', ['userid' => $users['alice']->id, 'cmid' => $cms[4]]) === (int)$h1->id,
    'Delayed snapshot after switching credits historical Hearth');
challenges::observe($event);
verify($DB->count_records('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[4]]) === 1, 'Switch cannot duplicate or move prior credit');
$switchwhen = (int)$DB->get_field('local_ignite_history', 'timebegin', ['userid' => $users['alice']->id, 'timeend' => 0]);
native_evidence($users['alice']->id, $cms[5], $switchwhen, COMPLETION_COMPLETE);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[5]]) === 'excluded', 'Ambiguous same-second join/switch conservatively excluded');
// A completion processed before a same-second switch must reach the same conservative result
// as a delayed completion processed after that switch. Make the second boundary deterministic.
$DB->set_field('local_ignite_history', 'timebegin', time() - 2, ['userid' => $users['alice']->id, 'timeend' => 0]);
$boundary = native_evidence($users['alice']->id, $cms[1], time(), COMPLETION_COMPLETE);
$boundaryevent = snapshot_event($boundary);
$interval = $DB->get_record('local_ignite_history', ['userid' => $users['alice']->id, 'timeend' => 0]);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[1]]) === 'credited',
    'Completion before switching initially credits the current Hearth');
houses::set_current((int)$h3->id);
$DB->set_field('local_ignite_history', 'timeend', $boundary->timemodified, ['id' => $interval->id]);
challenges::refresh();
$boundarycredit = $DB->get_record('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[1]]);
verify($boundarycredit->status === 'withdrawn' && (int)$boundarycredit->houseid === (int)$h2->id,
    'Task rechecks closed intervals and withdraws ambiguous switch-second credit without moving it');
challenges::observe($boundaryevent);
verify($DB->count_records('local_ignite_credit', ['userid' => $users['alice']->id, 'cmid' => $cms[1]]) === 1 &&
    $DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[1]]) === 'withdrawn',
    'Replaying boundary evidence after switching cannot restore credit');
houses::set_current((int)$h2->id);
native_evidence($users['alice']->id, $cms[0], $now + 1, COMPLETION_INCOMPLETE);
native_evidence($users['alice']->id, $cms[0], $now + 2, COMPLETION_COMPLETE);
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[0]]) === 'withdrawn', 'Reset plus recompletion never manufactures additional credit');
as_user($users['bob']);
native_evidence($users['bob']->id, $cms[0], $now - 10, COMPLETION_COMPLETE);
houses::set_current((int)$h2->id);
challenges::observe(snapshot_event($DB->get_record('course_modules_completion', ['userid' => $users['bob']->id, 'coursemoduleid' => $cms[0]])));
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['bob']->id, 'cmid' => $cms[0]]) === 'excluded',
    'Starter completed before joining has no retroactive Hearth credit');
houses::set_current(null);
verify(houses::get_current() === null && $DB->count_records('local_ignite_history', ['userid' => $users['bob']->id]) === 1, 'Leaving preserves closed membership history');
as_user($users['carol']);
verify(hearth_ui::next_action(challenges::current()) === null, 'Non-enrolled user receives no protected activity title/action');
rejected(fn() => hearth_setup::apply(['embercrest' => -1]), 'Learner cannot run administrator setup');
as_user(get_admin());
$DB->set_field('local_ignite_house', 'active', 0, ['id' => $h2->id]);
as_user($users['alice']);
verify((int)houses::get_current()->id === (int)$h2->id, 'Inactive Hearth retains existing membership');
as_user($users['bob']);
rejected(fn() => houses::set_current((int)$h2->id), 'Inactive Hearth rejects new membership');
as_user(get_admin());
$DB->set_field('local_ignite_house', 'active', 0);
as_user($users['bob']);
verify(houses::available() === [], 'No active Hearths has an honest empty result');
as_user(get_admin());
$DB->set_field('local_ignite_house', 'active', 1);
// Native task reconciliation also handles bulk resets/deleted completion rows without an event.
$DB->delete_records('course_modules_completion', ['userid' => $users['alice']->id, 'coursemoduleid' => $cms[4]]);
(new \local_ignite\task\hearth_totals())->execute();
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[4]]) === 'withdrawn', 'Task withdraws credit after silent bulk reset');
as_user($users['alice']);
$DB->set_field('local_ignite_history', 'timebegin', $now - 2, ['userid' => $users['alice']->id, 'timeend' => 0]);
native_evidence($users['alice']->id, $cms[6], $now + 1, COMPLETION_COMPLETE);
challenges::refresh();
$progress = challenges::progress($challengeid, (int)$h2->id);
verify($progress['total'] === 1 && $progress['own'] === 1, 'Task publishes aggregate and own contribution without a roster');
$DB->set_field('course_modules', 'deletioninprogress', 1, ['id' => $cms[6]]);
challenges::refresh();
verify($DB->get_field('local_ignite_credit', 'status', ['userid' => $users['alice']->id, 'cmid' => $cms[6]]) === 'withdrawn', 'Deleted activity withdraws contribution without moving it');
verify($DB->count_records('grade_grades') === $gradecount, 'Joining, switching and milestone accounting preserve native grades');
as_user(get_admin());
// Native activity with grade-pass configuration; use Moodle grade API to generate passing evidence.
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');
$quizdata = (object)[
    'modulename' => 'quiz', 'module' => $DB->get_field('modules', 'id', ['name' => 'quiz']),
    'course' => $course->id, 'section' => 0, 'name' => 'Assessed practical milestone',
    'intro' => '', 'introformat' => FORMAT_HTML, 'visible' => 1,
    'cmidnumber' => '', 'grade' => 10, 'gradepass' => 5, 'sumgrades' => 10, 'timeopen' => 0, 'timeclose' => 0,
    'timelimit' => 0, 'overduehandling' => 'autosubmit', 'graceperiod' => 0,
    'preferredbehaviour' => 'deferredfeedback', 'attempts' => 0, 'grademethod' => 1,
    'decimalpoints' => 2, 'questiondecimalpoints' => -1, 'questionsperpage' => 1,
    'navmethod' => 'free', 'shuffleanswers' => 1, 'browsersecurity' => '-', 'quizpassword' => '', 'subnet' => '',
    'completion' => COMPLETION_TRACKING_AUTOMATIC, 'completionusegrade' => 1,
    'completiongradeitemnumber' => 0, 'completionpassgrade' => 1,
];
$quiz = add_moduleinfo($quizdata, $course);
$passconfig = $configuration;
$passconfig['name'] = 'Passing grade period';
$passconfig['timestart'] = time() + 172800;
$passconfig['timeend'] = time() + 259200;
$passid = challenges::configure(0, $passconfig, [(int)$quiz->coursemodule => 'pass']);
$DB->update_record('local_ignite_challenge', (object)['id' => $passid, 'timestart' => $start, 'timeend' => $end]);
$quizcm = get_coursemodule_from_id('quiz', $quiz->coursemodule);
grade_update('mod/quiz', $course->id, 'mod', 'quiz', $quiz->instance, 0,
    (object)['userid' => $users['alice']->id, 'rawgrade' => 3]);
grade_regrade_final_grades($course->id);
$passcompletion = new completion_info(get_course($course->id));
$passcompletion->update_state($quizcm, COMPLETION_UNKNOWN, $users['alice']->id);
verify(!$DB->record_exists('local_ignite_credit', ['challengeid' => $passid, 'userid' => $users['alice']->id]),
    'Native failed/pending grade earns no passing credit');
grade_update('mod/quiz', $course->id, 'mod', 'quiz', $quiz->instance, 0,
    (object)['userid' => $users['alice']->id, 'rawgrade' => 8]);
grade_regrade_final_grades($course->id);
$passcompletion->update_state($quizcm, COMPLETION_UNKNOWN, $users['alice']->id);
verify($DB->get_field('local_ignite_credit', 'status', ['challengeid' => $passid, 'userid' => $users['alice']->id]) === 'credited',
    'Native passing grade produces actual completion evidence and shared credit');
challenges::deactivate($passid);
// Assessment fixture adds grade rows intentionally; membership/accounting itself must not mutate them.
$gradecount = $DB->count_records('grade_grades');
verify($DB->count_records('user_enrolments') === $enrolcount && $DB->count_records('grade_grades') === $gradecount &&
    $DB->count_records('badge_issued') === $badgecount, 'Membership and accounting preserve native enrollment, grades and badge ownership');
foreach (['https://evil.example/my/', '//evil.example/my/', '/admin/index.php', '/local/ignite/missing.php', '/local/ignite/onboarding.php', '/my/../admin/index.php'] as $url) {
    verify(hearth_ui::return_url($url)->get_path() === '/local/ignite/index.php', 'Return destination rejected/falls back: ' . $url);
}
verify(hearth_ui::return_url('/local/ignite/hearth.php?userid=22')->out(false) === $CFG->wwwroot . '/local/ignite/hearth.php', 'Permitted local destination drops untrusted query parameters');
$context = context_user::instance($users['alice']->id);
verify(in_array($context->id, provider::get_contexts_for_userid($users['alice']->id)->get_contextids()), 'Privacy discovers user context with history and credit');
writer::reset();
$approved = new approved_contextlist($users['alice'], 'local_ignite', [$context->id]);
provider::export_user_data($approved);
$zip = writer::with_context($context)->finalise_content();
verify(is_file($zip), 'Real Moodle privacy export archive created');
$extract = make_request_directory() . '/hearth-export';
get_file_packer('application/zip')->extract_to_pathname($zip, $extract);
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($extract));
$export = '';
foreach ($files as $file) {
    if ($file->isFile() && $file->getExtension() === 'json') {
        $export .= file_get_contents($file->getPathname());
    }
}
verify(str_contains($export, 'timebegin') && str_contains($export, 'timequalified') && str_contains($export, 'withdrawn'), 'Export includes membership intervals and contribution status/evidence');
set_config('enabled', 0, 'local_ignite');
provider::delete_data_for_user($approved);
verify(!$DB->record_exists('local_ignite_credit', ['userid' => $users['alice']->id]) &&
    !$DB->record_exists('local_ignite_history', ['userid' => $users['alice']->id]), 'Privacy erases contributions and history while disabled');
$bobcontext = context_user::instance($users['bob']->id);
provider::delete_data_for_users(new approved_userlist($bobcontext, 'local_ignite', [$users['bob']->id]));
verify(!$DB->record_exists('local_ignite_history', ['userid' => $users['bob']->id]) &&
    !$DB->record_exists('local_ignite_credit', ['userid' => $users['bob']->id]), 'Bulk approved user deletion includes new tables');
set_config('enabled', 1, 'local_ignite');
as_user($users['carol']);
houses::set_current((int)$h3->id);
native_evidence($users['carol']->id, $cms[0], $now - 10, COMPLETION_COMPLETE);
as_user(get_admin());
delete_user($users['carol']);
verify(!$DB->record_exists('local_ignite_history', ['userid' => $users['carol']->id]) &&
    !$DB->record_exists('local_ignite_credit', ['userid' => $users['carol']->id]), 'Native account deletion removes history and contributions');
as_user($users['alice']);
houses::set_current((int)$h1->id);
$DB->set_field('local_ignite_challenge', 'timeend', time() + 86400, ['id' => $challengeid]);
$DB->set_field('tool_usertours_tours', 'enabled', 0);
echo 'Browser learner: ' . $users['alice']->username . "\n";
echo 'Browser Hearth IDs: ' . $h1->id . ',' . $h2->id . "\n";
echo "Hearth checks: $checks passed\n";
