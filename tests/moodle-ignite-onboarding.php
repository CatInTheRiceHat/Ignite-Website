<?php
// Prompt 2 integration checks against real, empty, isolated Moodle fixtures only.
// php tests/moodle-ignite-onboarding.php PRIVATE_MOODLE_ROOT [--prepare-upgrade]
if (PHP_SAPI !== 'cli' || $argc < 2) {
    exit("Usage: php moodle-ignite-onboarding.php PRIVATE_MOODLE_ROOT [--prepare-upgrade]\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
$integrated = in_array('--integrated', $argv, true);
if ($integrated) {
    if (!str_contains($CFG->dbname, 'ignite_lms_test_p5_') || empty($CFG->noemailever) ||
            !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:') ||
            !str_starts_with($CFG->dataroot, '/tmp/ignite-p5-runtime/')) {
        throw new RuntimeException('Requires an isolated combined Ignite fixture.');
    }
} else {
if (!str_contains($CFG->dbname, 'ignite_lms_test_prompt2_') || empty($CFG->noemailever) ||
        $CFG->wwwroot !== 'http://127.0.0.1:8766' || !str_starts_with($CFG->dataroot, '/tmp/ignite-p2-')) {
    throw new RuntimeException('Requires the private Prompt 2 DB, data directory, loopback URL, and no email.');
}
}
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->libdir . '/completionlib.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->libdir . '/adminlib.php');

use local_ignite\access;
use local_ignite\onboarding;
use local_ignite\onboarding_config;
use local_ignite\recommendations;
use local_ignite\invitations;
use local_ignite\preferences;
use local_ignite\houses;
use local_ignite\privacy\provider;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\writer;

$checks = 0;
function verify(bool $condition, string $message): void {
    global $checks;
    if (!$condition) {
        throw new RuntimeException($message);
    }
    $checks++;
    echo "PASS: $message\n";
}
function rejected(callable $call, string $message): void {
    try {
        $call();
    } catch (moodle_exception $e) {
        verify(true, $message);
        return;
    }
    throw new RuntimeException('Expected rejection: ' . $message);
}
function as_user(stdClass $user): void {
    core\session\manager::set_user($user);
    if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
    $_POST = ['sesskey' => sesskey()];
    $_GET = [];
}
function snapshot(): array {
    global $DB;
    $data = [];
    foreach (['local_ignite_prefs', 'local_ignite_member', 'local_ignite_house', 'user_enrolments',
            'grade_grades', 'badge_issued'] as $table) {
        $records = array_values($DB->get_records($table, [], 'id'));
        foreach ($records as $record) {
            unset($record->targetkey);
        }
        $data[$table] = $records;
    }
    return $data;
}
as_user(get_admin());
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/onboarding.php');
if (($argv[2] ?? '') === '--reset') {
    foreach ($DB->get_records_select('course', $DB->sql_like('shortname', ':prefix'), ['prefix' => 'p2_%']) as $course) {
        delete_course($course, false);
    }
    foreach ($DB->get_records_select('user', $DB->sql_like('username', ':prefix'), ['prefix' => 'p2_%']) as $user) {
        delete_user($user);
    }
    set_config('enabled', 0, 'local_ignite');
    exit(0);
}
if (($argv[2] ?? '') === '--prepare-upgrade') {
    verify((int)get_config('local_ignite', 'version') === 2026110101, 'Preparation uses committed Prompt 1 version');
    $DB->set_field('local_ignite_prefs', 'status', 'complete');
    $DB->set_field('local_ignite_prefs', 'currentstep', 'done');
    set_config('prompt2snapshot', json_encode(snapshot()), 'local_ignite');
    echo "Saved Prompt 1 database snapshot\n";
    exit(0);
}
verify((int)get_config('local_ignite', 'version') === ($integrated ? 2026110501 : 2026110200), 'Native installer/upgrade reached Prompt 2 version');
if ($saved = get_config('local_ignite', 'prompt2snapshot')) {
    verify(json_decode($saved) == (object)snapshot(), 'Upgrade preserved all foundation rows, completed walkthroughs, enrollments, grades and badges');
} else if (!$integrated) {
    verify(!access::enabled() && $DB->count_records('local_ignite_house') === 4,
        'Fresh installation retains disabled foundation switches and exactly four stable records');
}
verify($DB->get_manager()->field_exists('local_ignite_prefs', 'targetkey') &&
    $DB->get_manager()->table_exists('local_ignite_invite'), 'Both installation paths include all Prompt 2 data');
set_config('enabled', 1, 'local_ignite');
set_config('onboarding', 1, 'local_ignite');
set_config('houses', 1, 'local_ignite');
set_config('enablecompletion', 1);
$CFG->enablecompletion = 1;
$DB->set_field('tool_usertours_tours', 'enabled', 0);
$tag = 'p2_' . bin2hex(random_bytes(4));
$users = [];
foreach (['new', 'partial', 'skipped', 'returning', 'deep', 'policy', 'profile', 'deleted', 'password', 'teacher', 'initial', 'unconfirmed'] as $name) {
    $id = user_create_user((object)['username' => $tag . '_' . $name, 'firstname' => ucfirst($name),
        'lastname' => 'Fixture', 'email' => $tag . '_' . $name . '@example.invalid',
        'password' => 'FixtureOnly!4829aZ', 'auth' => 'manual', 'confirmed' => 1,
        'mnethostid' => $CFG->mnet_localhost_id]);
    $users[$name] = core_user::get_user($id, '*', MUST_EXIST);
}
$category = $DB->get_field('course_categories', 'id', [], IGNORE_MULTIPLE);
$course = create_course((object)['fullname' => 'Plan everyday spending', 'shortname' => $tag,
    'category' => $category, 'enablecompletion' => 1]);
$module = add_moduleinfo((object)[
    'modulename' => 'assign', 'module' => $DB->get_field('modules', 'id', ['name' => 'assign']),
    'course' => $course->id, 'section' => 0, 'name' => 'Build a real weekly budget', 'visible' => 1,
    'intro' => 'Make a practical weekly budget.', 'introformat' => FORMAT_HTML,
    'completion' => COMPLETION_TRACKING_AUTOMATIC, 'completionusegrade' => 1,
    'completiongradeitemnumber' => 0, 'completionpassgrade' => 1, 'gradepass' => 50,
    'completionsubmit' => 1, 'grade' => 100, 'duedate' => 0, 'cutoffdate' => 0,
    'gradingduedate' => 0, 'markercount' => 1, 'teamsubmissiongroupingid' => 0,
    'allowsubmissionsfromdate' => 0, 'submissiondrafts' => 0, 'requiresubmissionstatement' => 0,
    'sendnotifications' => 0, 'sendlatenotifications' => 0, 'teamsubmission' => 0,
    'requireallteammemberssubmit' => 0, 'blindmarking' => 0, 'markingworkflow' => 0,
    'markingallocation' => 0, 'attemptreopenmethod' => 'none', 'maxattempts' => 1,
    'assignsubmission_onlinetext_enabled' => 1, 'assignsubmission_file_enabled' => 0,
], $course);
$cmid = (int)$module->coursemodule;
$DB->set_field('course_modules', 'completiongradeitemnumber', 0, ['id' => $cmid]);
$DB->set_field('course_modules', 'completionpassgrade', 1, ['id' => $cmid]);
rebuild_course_cache($course->id, true);
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
$manual = enrol_get_plugin('manual');
$instances = enrol_get_instances($course->id, false);
$instance = array_values(array_filter($instances, fn($record) => $record->enrol === 'manual'))[0];
$studentrole = $DB->get_field('role', 'id', ['shortname' => 'student'], MUST_EXIST);
foreach ($users as $user) {
    $manual->enrol_user($instance, $user->id, $studentrole);
}
$mapping = json_encode(['interests' => ['money' => ['name' => 'Money & Life Skills',
    'activityids' => [$cmid], 'courseids' => [(int)$course->id]]], 'paths' => new stdClass()]);
local_ignite\catalog::parse($mapping);
set_config('catalog', $mapping, 'local_ignite');
$config = ['starters' => [['cmid' => $cmid, 'requirepass' => true]],
    'outcomes' => ['activity:' . $cmid => 'Make a weekly budget.', 'course:' . $course->id => 'Plan everyday spending.']];
$setting = new local_ignite\admin\onboarding_setting('local_ignite/onboardingconfig', 'Config', '', onboarding_config::EMPTY);
verify($setting->write_setting(json_encode($config)) === '', 'Native setting validates real starter and outcomes');
verify($setting->write_setting('{broken') !== '', 'Malformed configuration rejected without partial saves');
rejected(fn() => onboarding_config::parse('{"starters":[{"cmid":2147483647,"requirepass":true}],"outcomes":{}}'),
    'Missing starter references rejected');
verify(!onboarding_config::valid_route('https://example.invalid/') &&
    !onboarding_config::valid_route('/local/ignite/../admin/index.php') &&
    !onboarding_config::valid_route('/local/ignite/houses.php'), 'Selection route rejects external, traversal, and admin destinations');
set_config('hearthselectionroute', '', 'local_ignite');
set_config('hearthtiming', 'afterchallenge', 'local_ignite');
as_user($users['partial']);
verify(onboarding::step() === 'welcome', 'New learner starts with Welcome without an implicit preference write');
verify(recommendations::current() !== [], 'Uncertain/new learners can explore mapped eligible targets');
onboarding::save('next', 'welcome');
verify(onboarding::step() === 'interests', 'Welcome saves a resumable server step');
rejected(fn() => onboarding::save('next', 'interests', ['interests' => ['money', 'career', 'creative', 'technology']]),
    'More than three interests rejected server-side');
rejected(fn() => onboarding::save('next', 'interests', ['interests' => ['unsure', 'money']]),
    'Unsure cannot be combined with specific interests');
rejected(fn() => onboarding::save('next', 'interests', ['interests' => ['bad']]), 'Unknown interest rejected');
rejected(fn() => onboarding::save('next', 'interests', ['userid' => $users['new']->id]), 'Cross-user payload rejected');
$_POST['sesskey'] = 'invalid';
rejected(fn() => onboarding::save('skip', 'interests'), 'Walkthrough mutation requires CSRF token');
rejected(fn() => invitations::defer(), 'Invitation dismissal requires CSRF token');
$_POST['sesskey'] = sesskey();
onboarding::save('next', 'interests', ['interests' => ['money']]);
verify(onboarding::step() === 'goal' && preferences::get_current()->interests === ['money'], 'Interest step persists independently');
as_user($users['new']);
verify(onboarding::step() === 'welcome', 'Another learner sees only their own state');
as_user($users['partial']);
verify(onboarding::step() === 'goal', 'A new authenticated session resumes the saved step');
onboarding::save('back', 'goal');
verify(onboarding::step() === 'interests', 'Back persists the previous step');
onboarding::save('next', 'interests', ['interests' => ['money']]);
rejected(fn() => onboarding::save('next', 'goal', ['goals' => 'spoofed']), 'Unknown goal rejected');
onboarding::save('next', 'goal', ['goals' => 'make']);
$recommendations = recommendations::current();
verify(count($recommendations) === 2 && $recommendations[0]['outcome'] === 'Make a weekly budget.',
    'Eligible real targets have a configured outcome, match reason, and native next action');
$enrolbefore = $DB->count_records('user_enrolments');
rejected(fn() => onboarding::save('next', 'path', ['targetkey' => 'activity:2147483647']), 'Forged target rejected');
onboarding::save('next', 'path', ['targetkey' => 'activity:' . $cmid]);
verify(onboarding::step() === 'finish' && !in_array('hearth', onboarding::steps(), true), 'Default timing and missing sibling skip Hearth step');
onboarding::save('home', 'finish');
verify(preferences::get_current()->status === 'complete', 'Finish records only walkthrough completion');
verify(recommendations::completed_starter() === null, 'Finishing/clicking does not complete a challenge');
onboarding::save('saveinterests', 'interests', ['interests' => ['career']], true);
verify(preferences::get_current()->status === 'complete' && recommendations::current() === [],
    'Later interest edits preserve completed state and show an honest no-match result');
verify($DB->count_records('user_enrolments') === $enrolbefore, 'Interests, recommendations, and walkthrough never enroll users');

as_user($users['skipped']);
onboarding::save('skip', 'welcome');
verify(preferences::get_current()->status === 'dismissed', 'Skip persists dismissal separately from completion');
set_config('hearthtiming', 'initial', 'local_ignite');
verify(preferences::get_current()->status === 'dismissed', 'Timing changes preserve dismissal');
onboarding::save('next', 'welcome');
verify(preferences::get_current()->status === 'inprogress', 'Explicit resume continues a skipped walkthrough');
onboarding::save('skip', 'interests');
as_user($users['returning']);
preferences::save_current(['interests' => ['money'], 'status' => 'complete', 'currentstep' => 'done']);
$house = (int)$DB->get_field('local_ignite_house', 'id', ['active' => 1], IGNORE_MULTIPLE);
houses::set_current($house);
verify(invitations::current()->state === 'accepted' && !invitations::can_offer(), 'Existing membership authoritatively accepts invitation');
set_config('hearthtiming', 'afterchallenge', 'local_ignite');
verify(preferences::get_current()->status === 'complete' && (int)houses::get_current()->id === $house,
    'Changed timing preserves completed walkthrough and membership');
as_user($users['partial']);
$manual->enrol_user($instance, $users['partial']->id, $studentrole, 0, time() - 60);
verify(recommendations::target('activity:' . $cmid) === null, 'Expired enrollment cannot expose an activity');
$manual->enrol_user($instance, $users['partial']->id, $studentrole, 0, 0, ENROL_USER_SUSPENDED);
verify(recommendations::target('activity:' . $cmid) === null, 'Revoked/suspended enrollment cannot expose an activity');
$manual->enrol_user($instance, $users['partial']->id, $studentrole, 0, 0, ENROL_USER_ACTIVE);
verify(recommendations::target('activity:' . $cmid) !== null, 'Restored active enrollment restores eligible target');
$DB->set_field('course_modules', 'availability', json_encode(['op' => '&', 'c' => [
    ['type' => 'date', 'd' => '>=', 't' => time() + 86400]], 'showc' => [false]]), ['id' => $cmid]);
rebuild_course_cache($course->id, true);
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
verify(recommendations::target('activity:' . $cmid) === null, 'Native activity availability/prerequisite gate is respected');
$DB->set_field('course_modules', 'availability', null, ['id' => $cmid]);
rebuild_course_cache($course->id, true);
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
$DB->set_field('course', 'visible', 0, ['id' => $course->id]);
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
verify(recommendations::target('course:' . $course->id) === null, 'Hidden courses are not recommended');
$DB->set_field('course', 'visible', 1, ['id' => $course->id]);
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }

as_user(get_admin());
$open = create_course((object)['fullname' => 'Explore making things', 'shortname' => $tag . '_enrol',
    'category' => $category]);
$self = enrol_get_plugin('self');
$openid = $self->add_instance($open, ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1, 'roleid' => $studentrole]);
as_user($users['partial']);
$openaction = recommendations::target('course:' . $open->id);
verify($openaction && str_contains($openaction['url'], '/enrol/index.php') &&
    !is_enrolled(context_course::instance($open->id), $USER, '', true),
    'Eligible unenrolled courses use native enrollment options without silently enrolling');
$openinstance = $DB->get_record('enrol', ['id' => $openid]);
$self->update_instance($openinstance, (object)['customint6' => 0]);
verify(recommendations::target('course:' . $open->id) === null, 'Closed native enrollment removes the recommendation');

// Installed test-only route verifies the seam without implementing the sibling chooser.
$routefile = $CFG->dirroot . '/local/ignite/prompt2_fixture_selection.php';
verify(file_put_contents($routefile, '<?php require_once(__DIR__."/../../config.php"); require_login(); echo "Fixture route only";') !== false, 'Private test route is installed in the writable fixture');
set_config('hearthselectionroute', '/local/ignite/prompt2_fixture_selection.php', 'local_ignite');
try {
    set_config('hearthtiming', 'initial', 'local_ignite');
    as_user($users['initial']);
    onboarding::save('next', 'welcome');
    onboarding::save('next', 'interests', ['interests' => ['money']]);
    onboarding::save('next', 'goal', ['goals' => '']);
    onboarding::save('next', 'path', ['targetkey' => '']);
    verify(onboarding::step() === 'hearth', 'Initial timing inserts the installed sibling invitation before Finish');
    $visit = onboarding::save('visit', 'hearth');
    verify(str_contains($visit->out(false), 'prompt2_fixture_selection.php') &&
        str_contains($visit->out(false), 'returnurl='), 'Initial invitation delegates to installed route with local return destination');
    onboarding::save('next', 'hearth');
    verify(onboarding::step() === 'finish' && invitations::current()->state === 'deferred',
        'Choose later advances the initial walkthrough without membership');
    onboarding::save('home', 'finish');
    as_user($users['partial']);
    verify(invitations::current()->state === 'eligible' && invitations::can_offer(), 'Initial timing offers an installed route');
    invitations::shown();
    $shown = invitations::current()->timeshown;
    invitations::shown();
    verify(invitations::current()->state === 'shown' && invitations::current()->timeshown == $shown,
        'Repeated rendering does not reissue presentation or reset its timestamp');
    invitations::defer();
    verify(invitations::current()->state === 'deferred' && invitations::can_offer(), 'Deferred initial invitation remains manually resumable');
    set_config('hearthtiming', 'afterchallenge', 'local_ignite');
    verify(invitations::current()->state === 'deferred' && !invitations::can_offer(),
        'Changing timing preserves deferral while requiring real completion');
    set_config('hearthtiming', 'initial', 'local_ignite');
    verify(invitations::current()->state === 'deferred' && !local_ignite\home::data()['showinvitation'],
        'Changed settings do not reopen a dismissed invitation');

    as_user($users['deep']);
    set_config('hearthtiming', 'afterchallenge', 'local_ignite');
    verify(invitations::current()->state === 'pending' && !invitations::can_offer(), 'Incomplete starter keeps invitation pending');
    $cm = get_fast_modinfo($course)->get_cm($cmid);
    $completion = new completion_info($course);
    $completion->set_module_viewed($cm, $USER->id);
    verify(!invitations::can_offer(), 'A page visit is insufficient');
    require_once($CFG->dirroot . '/mod/assign/locallib.php');
    $assignment = new assign($cm->context, $cm, $course);
    $data = (object)['onlinetext_editor' => ['text' => 'My real budget draft', 'format' => FORMAT_HTML, 'itemid' => 0]];
    $notices = [];
    $assignment->save_submission($data, $notices);
    verify(!invitations::can_offer(), 'Submitted work awaiting a required grade is insufficient');
    $item = grade_item::fetch(['courseid' => $course->id, 'itemtype' => 'mod', 'itemmodule' => 'assign',
        'iteminstance' => $cm->instance, 'itemnumber' => 0]);
    $item->gradepass = 50;
    $item->update();
    $item->update_final_grade($USER->id, 20, 'fixture');
    grade_regrade_final_grades($course->id);
    $completion->update_state($cm, COMPLETION_UNKNOWN, $USER->id);
    verify(!invitations::can_offer(), 'A failed grade does not qualify');
    $item->update_final_grade($USER->id, 80, 'fixture');
    grade_regrade_final_grades($course->id);
    $completion->update_state($cm, COMPLETION_UNKNOWN, $USER->id);
    verify(recommendations::completed_starter() === $cmid && invitations::current()->state === 'eligible',
        'Native passed completion unlocks invitation without waiting for any badge');
    invitations::shown();
    invitations::defer();
    verify(invitations::current()->state === 'deferred' && invitations::can_offer(), 'Completed starter invitation can be deferred and resumed');
    houses::set_current($house);
    verify(invitations::current()->state === 'accepted' && !invitations::can_offer(),
        'Only real membership confirms acceptance, without an invitation browser claim');
    houses::set_current(null);
    verify(invitations::current()->state === 'accepted', 'Leaving a Hearth does not repeatedly reopen an accepted invitation');
} finally {
    unlink($routefile);
    set_config('hearthselectionroute', '', 'local_ignite');
}
// Automatic view-only and manually ticked activities never count as a starter.
as_user(get_admin());
foreach ([COMPLETION_TRACKING_AUTOMATIC, COMPLETION_TRACKING_MANUAL] as $tracking) {
    $page = add_moduleinfo((object)[
        'modulename' => 'page', 'module' => $DB->get_field('modules', 'id', ['name' => 'page']),
        'course' => $course->id, 'section' => 0, 'name' => 'Read the introduction', 'intro' => '',
        'introformat' => FORMAT_HTML, 'content' => 'Fixture reading.', 'contentformat' => FORMAT_HTML,
        'display' => 5, 'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0,
        'completion' => $tracking, 'completionview' => $tracking === COMPLETION_TRACKING_AUTOMATIC ? 1 : 0,
    ], $course);
    as_user($users['deep']);
    $pagecm = get_fast_modinfo($course)->get_cm($page->coursemodule);
    $completion = new completion_info($course);
    if ($tracking === COMPLETION_TRACKING_MANUAL) {
        $completion->update_state($pagecm, COMPLETION_COMPLETE, $USER->id);
    } else {
        $completion->set_module_viewed($pagecm, $USER->id);
    }
    set_config('onboardingconfig', json_encode(['starters' => [['cmid' => (int)$page->coursemodule,
        'requirepass' => false]], 'outcomes' => new stdClass()]), 'local_ignite');
    verify(recommendations::completed_starter() === null && recommendations::starter_target() === null,
        'View-only/manual native completion is insufficient: ' . $tracking);
    as_user(get_admin());
}
as_user($users['deep']);
set_config('onboardingconfig', json_encode($config), 'local_ignite');
verify(onboarding_config::selection_url() === null && !invitations::can_offer(), 'Missing sibling route degrades to normal learning');
set_config('onboardingconfig', onboarding_config::EMPTY, 'local_ignite');
verify(recommendations::starter_target() === null && recommendations::current() === [], 'No configured starter/outcomes yields honest empty state');
set_config('onboardingconfig', json_encode($config), 'local_ignite');

// Real privacy ZIP includes invitation evidence and selected target, even while disabled.
as_user($users['partial']);
$context = context_user::instance($USER->id);
set_config('enabled', 0, 'local_ignite');
verify(in_array($context->id, provider::get_contexts_for_userid($USER->id)->get_contextids()), 'Privacy discovers invitation data while disabled');
writer::reset();
provider::export_user_data(new approved_contextlist($USER, 'local_ignite', [$context->id]));
$zip = writer::with_context($context)->finalise_content();
$exportdir = make_request_directory();
get_file_packer('application/zip')->extract_to_pathname($zip, $exportdir);
$export = '';
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($exportdir, FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file->getFilename() === 'data.json') {
        $export .= file_get_contents($file->getPathname());
    }
}
verify(str_contains($export, 'invitation') && str_contains($export, 'deferred') && str_contains($export, 'targetkey'),
    'Real privacy ZIP exports invitation state and target');
$wrongcontext = context_user::instance($users['returning']->id);
provider::delete_data_for_user(new approved_contextlist($USER, 'local_ignite', [$wrongcontext->id]));
verify($DB->record_exists('local_ignite_invite', ['userid' => $USER->id]), 'Privacy deletion cannot cross user contexts');
provider::delete_data_for_user(new approved_contextlist($USER, 'local_ignite', [$context->id]));
verify(!$DB->record_exists('local_ignite_invite', ['userid' => $USER->id]) &&
    !$DB->record_exists('local_ignite_prefs', ['userid' => $USER->id]), 'Approved user privacy erasure removes target and invitation');
provider::delete_data_for_users(new approved_userlist(context_user::instance($users['deep']->id), 'local_ignite', [$users['deep']->id]));
verify(!$DB->record_exists('local_ignite_invite', ['userid' => $users['deep']->id]), 'Bulk deletion covers invitation data');
$context = context_user::instance($users['returning']->id);
provider::delete_data_for_all_users_in_context($context);
verify(!$DB->record_exists('local_ignite_invite', ['userid' => $users['returning']->id]), 'Whole-context deletion covers invitations');
verify($DB->count_records('user_enrolments') === $enrolbefore && $DB->record_exists('grade_grades', ['userid' => $users['deep']->id]),
    'Privacy erasure preserves native enrollments and grades');
set_config('enabled', 1, 'local_ignite');
as_user($users['deleted']);
invitations::current();
as_user(get_admin());
delete_user($users['deleted']);
verify(!$DB->record_exists('local_ignite_invite', ['userid' => $users['deleted']->id]), 'Native account deletion erases invitation');

// Browser fixtures: no mock HTTP, available until private runtime is cleaned up.
as_user($users['partial']);
onboarding::save('next', 'welcome');
onboarding::save('next', 'interests', ['interests' => ['money']]);
onboarding::save('next', 'goal', ['goals' => 'make']);
as_user($users['returning']);
preferences::save_current(['interests' => ['money'], 'status' => 'complete', 'currentstep' => 'done']);
set_config('hearthtiming', 'afterchallenge', 'local_ignite');
as_user(get_admin());
foreach ($users as $name => $user) {
    if ($name !== 'deleted') {
        $DB->set_field('user', 'policyagreed', $name === 'policy' ? 0 : 1, ['id' => $user->id]);
    }
}
$DB->set_field('user', 'confirmed', 0, ['id' => $users['unconfirmed']->id]);
$DB->set_field('user', 'lastname', '', ['id' => $users['profile']->id]);
set_user_preference('auth_forcepasswordchange', 1, $users['password']);
$manual->unenrol_user($instance, $users['teacher']->id);
role_assign($DB->get_field('role', 'id', ['shortname' => 'editingteacher']), $users['teacher']->id,
    context_course::instance($course->id));
file_put_contents($CFG->dirroot . '/prompt2-policy.html', '<h1>Private fixture policy</h1><p>Local testing only.</p>');
set_config('sitepolicy', $CFG->wwwroot . '/prompt2-policy.html');
$info = ['users' => array_map(static fn($user) => $user->username, $users), 'courseid' => (int)$course->id,
    'cmid' => $cmid, 'checks' => $checks];
file_put_contents($CFG->dataroot . '/prompt2-browser.json', json_encode($info));
echo 'BROWSER_FIXTURES=' . json_encode($info) . "\n";
echo "Prompt 2 integration checks: $checks passed\n";
