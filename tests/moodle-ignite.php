<?php
// Real Moodle integration checks. Never run against a production installation.
// Usage: php tests/moodle-ignite.php PRIVATE_MOODLE_ROOT [--worker USERID HOUSEID | --upgrade-check]
if (PHP_SAPI !== 'cli' || $argc < 2) {
    exit("Usage: php moodle-ignite.php PRIVATE_MOODLE_ROOT [--upgrade-check]\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) {
    throw new RuntimeException('Requires a private Ignite test DB, loopback wwwroot, and disabled email.');
}
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->libdir . '/adminlib.php');
require_once($CFG->dirroot . '/local/ignite/lib.php');

use local_ignite\access;
use local_ignite\catalog;
use local_ignite\houses;
use local_ignite\preferences;
use local_ignite\privacy\provider;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\userlist;
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
function rejected(callable $operation, string $message, string $type = moodle_exception::class): void {
    try {
        $operation();
    } catch (Throwable $e) {
        verify($e instanceof $type, $message . ' (' . get_class($e) . ')');
        return;
    }
    throw new RuntimeException('Expected rejection: ' . $message);
}
function as_user(stdClass $user): void {
    \core\session\manager::set_user($user);
    $_POST = ['sesskey' => sesskey()];
    $_GET = [];
}

if (($argv[2] ?? '') === '--worker') {
    as_user(core_user::get_user((int)$argv[3], '*', MUST_EXIST));
    for ($i = 0; $i < 8; $i++) {
        houses::set_current((int)$argv[4]);
    }
    exit(0);
}
as_user(get_admin());
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/index.php');

if (($argv[2] ?? '') === '--upgrade-check') {
    verify((int)get_config('local_ignite', 'version') === 2026110101, 'Native CLI upgrade reached current version');
    verify($DB->count_records('local_ignite_house') === 4, 'Upgrade preserved exactly four houses');
    verify($DB->get_field('local_ignite_house', 'name', ['code' => 'ember']) === 'Renamed by administrator',
        'Upgrade preserved administrator house edits');
    verify($DB->count_records('local_ignite_member') === 1, 'Upgrade preserved learner membership');
    verify($DB->count_records('local_ignite_prefs') === 1, 'Upgrade preserved preferences');
    echo "Upgrade checks: $checks passed\n";
    exit(0);
}

verify((int)get_config('local_ignite', 'version') === 2026110101, 'Native installation registered plugin version');
verify(!access::enabled(), 'Ignite starts disabled');
verify($DB->count_records('local_ignite_house') === 4, 'Installation seeded four example houses');
foreach ($DB->get_records('local_ignite_house') as $house) {
    verify(houses::valid_accent($house->accent), 'Example accent meets 4.5:1 white contrast: ' . $house->code);
}
$homepage = $CFG->defaulthomepage ?? null;
// Keep native Moodle welcome tours from covering browser fixture controls.
$DB->set_field('tool_usertours_tours', 'enabled', 0);
set_config('enabled', 1, 'local_ignite');
foreach (access::FEATURES as $feature) {
    set_config($feature, 1, 'local_ignite');
}

$tag = 'ignite_fixture_' . bin2hex(random_bytes(4));
$users = [];
foreach (['alice', 'bob'] as $name) {
    $id = user_create_user((object)['username' => $tag . '_' . $name, 'firstname' => ucfirst($name),
        'lastname' => 'Fixture', 'email' => $tag . '_' . $name . '@example.invalid',
        'password' => 'FixtureOnly!4829aZ', 'auth' => 'manual', 'confirmed' => 1,
        'mnethostid' => $CFG->mnet_localhost_id]);
    $users[$name] = core_user::get_user($id, '*', MUST_EXIST);
}
echo 'Fixture learner for browser checks: ' . $users['alice']->username . "\n";
$course = create_course((object)['fullname' => 'Ignite private course', 'shortname' => $tag,
    'category' => $DB->get_field('course_categories', 'id', [], IGNORE_MULTIPLE)]);
$page = add_moduleinfo((object)[
    'modulename' => 'page', 'module' => $DB->get_field('modules', 'id', ['name' => 'page']),
    'course' => $course->id, 'section' => 0, 'name' => 'Starter activity',
    'intro' => '', 'introformat' => FORMAT_HTML, 'content' => 'A private starter activity.',
    'contentformat' => FORMAT_HTML, 'display' => 5, 'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0,
], $course);
$mapping = json_encode(['interests' => ['money' => ['name' => 'Money skills', 'courseids' => [(int)$course->id],
    'activityids' => [(int)$page->coursemodule]]], 'paths' => ['starter' => ['name' => 'Starter path', 'interestids' => ['money']]]]);
verify(catalog::parse($mapping)['interests']['money']['activityids'] === [(int)$page->coursemodule],
    'Mappings accept real course and course-module IDs');
$setting = new \local_ignite\admin\catalog_setting('local_ignite/catalog', 'Catalog', '', catalog::EMPTY);
verify($setting->write_setting($mapping) === '', 'Native admin setting saves validated mapping');
$previous = get_config('local_ignite', 'catalog');
verify($setting->write_setting('{broken') !== '', 'Invalid JSON fails admin validation');
verify(get_config('local_ignite', 'catalog') === $previous, 'Invalid mapping leaves prior configuration unchanged');
rejected(fn() => catalog::parse('{"interests":{"bad":{"name":"Bad","courseids":[2147483647]}},"paths":{}}'),
    'Nonexistent course rejected');
rejected(fn() => catalog::parse('{"interests":{"bad":{"name":"Bad","activityids":[2147483647]}},"paths":{}}'),
    'Nonexistent activity rejected');
rejected(fn() => catalog::parse('{"interests":{},"paths":{"bad":{"name":"Bad","interestids":["missing"]}}}'),
    'Unknown path interest rejected');
$houseids = array_values($DB->get_fieldset_select('local_ignite_house', 'id', 'active = 1'));
$ember = (int)$DB->get_field('local_ignite_house', 'id', ['code' => 'ember']);
$config = ['name' => 'Renamed by administrator', 'description' => 'An editable house.',
    'accent' => '#934214', 'emblem' => 'sol', 'active' => 1];
houses::configure($ember, $config);
\local_ignite\installation::seed_houses();
\local_ignite\installation::seed_houses();
verify($DB->get_field('local_ignite_house', 'name', ['id' => $ember]) === $config['name'],
    'Repeated seeding preserves administrator edits');
verify($DB->count_records('local_ignite_house') === 4, 'Repeated seeding does not duplicate houses');
rejected(fn() => houses::configure($ember, array_replace($config, ['accent' => '#F07B2A'])),
    'Inaccessible house accent rejected');
rejected(fn() => houses::configure($ember, array_replace($config, ['emblem' => '../bad'])), 'Invalid emblem rejected');

as_user($users['alice']);
verify(preferences::get_current()->interests === [], 'New learner has useful empty preferences');
rejected(fn() => houses::configure($ember, $config), 'Learner cannot configure houses');
verify(!has_capability('moodle/site:config', context_system::instance()) &&
    !has_capability('local/ignite:configure', context_system::instance()), 'Configuration capabilities absent for learner');
$prefs = ['interests' => ['money', 'money'], 'goals' => 'Build a weekly budget',
    'status' => 'inprogress', 'currentstep' => 'path', 'pathid' => 'starter'];
preferences::save_current($prefs);
preferences::save_current($prefs);
verify($DB->count_records('local_ignite_prefs', ['userid' => $users['alice']->id]) === 1,
    'Repeated preference saves keep one row');
verify(preferences::get_current()->interests === ['money'], 'Selected interests persist without duplicates');
rejected(fn() => preferences::save_current($prefs + ['userid' => $users['bob']->id]), 'Spoofed learner ID rejected');
rejected(fn() => preferences::save_current(array_replace($prefs, ['status' => 'complete'])),
    'Inconsistent onboarding state rejected');
rejected(fn() => preferences::save_current(array_replace($prefs, ['pathid' => 'unknown'])), 'Unknown path rejected');
rejected(fn() => preferences::save_current(array_replace($prefs, ['interests' => ['unknown']])), 'Unknown interest rejected');
$_POST['sesskey'] = 'invalid';
rejected(fn() => preferences::save_current($prefs), 'Preference save requires valid CSRF token');
rejected(fn() => houses::set_current($ember), 'House change requires valid CSRF token');
$_POST['sesskey'] = sesskey();
$enrolbefore = $DB->count_records('user_enrolments');
houses::set_current($ember);
houses::set_current($ember);
verify($DB->count_records('local_ignite_member', ['userid' => $users['alice']->id]) === 1,
    'Repeated house joins keep one membership');
$duplicate = $DB->get_record('local_ignite_member', ['userid' => $users['alice']->id]);
unset($duplicate->id);
rejected(fn() => $DB->insert_record('local_ignite_member', $duplicate),
    'Database unique key rejects duplicate membership', dml_write_exception::class);
houses::set_current((int)$houseids[1]);
verify((int)houses::get_current()->id === (int)$houseids[1], 'House can change using a stable ID');
verify($DB->count_records('user_enrolments') === $enrolbefore, 'House join and change never enroll a learner');
houses::set_current(null);
verify(houses::get_current() === null, 'Leaving a house clears only current membership');
houses::set_current($ember);

// Exercise actual independent PHP processes and PostgreSQL locks, not a mocked upsert.
houses::set_current(null);
$processes = [];
foreach (range(0, 5) as $i) {
    $command = [PHP_BINARY, __FILE__, $argv[1], '--worker', (string)$users['alice']->id, (string)$houseids[$i % 4]];
    $pipes = [];
    $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    fclose($pipes[0]);
    $processes[] = [$process, $pipes];
}
foreach ($processes as [$process, $pipes]) {
    $output = stream_get_contents($pipes[1]) . stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    verify(proc_close($process) === 0, 'Concurrent membership worker completed: ' . trim($output));
}
verify($DB->count_records('local_ignite_member', ['userid' => $users['alice']->id]) === 1,
    'Concurrent saves leave exactly one membership');
houses::set_current($ember);
as_user($users['bob']);
verify(preferences::get_current()->status === 'notstarted' && houses::get_current() === null,
    'Another learner cannot read Alice’s preferences or membership');
preferences::save_current(['interests' => [], 'goals' => null]);
houses::set_current((int)$houseids[1]);
as_user(get_admin());
houses::configure($ember, array_replace($config, ['active' => 0]));
as_user($users['alice']);
verify((int)houses::get_current()->id === $ember, 'Inactive house retains existing membership');
verify(!isset(houses::available()[$ember]), 'Inactive house is unavailable to new members');
houses::set_current($ember);
as_user($users['bob']);
rejected(fn() => houses::set_current($ember), 'Inactive house rejects new membership');
verify((int)houses::get_current()->id === (int)$houseids[1], 'Failed save rolls back without losing membership');

as_user($users['alice']);
$home = \local_ignite\home::data();
verify(!$home['hascourses'] && $home['hashouse'] && $home['houseinactive'], 'Home displays real empty course and house state');
$html = $OUTPUT->render_from_template('local_ignite/home', $home);
verify(str_contains($html, 'Back to your Moodle dashboard') && str_contains($html, 'No active courses yet'),
    'Home template renders useful empty states and native navigation');
$nav = new \core\navigation\views\primary($PAGE);
\local_ignite\navigation::primary(new \core\hook\navigation\primary_extend($nav));
verify((bool)$nav->find('local_ignite', navigation_node::TYPE_CUSTOM), 'Enabled Ignite adds primary navigation');
as_user(get_admin());
$manual = enrol_get_plugin('manual');
$instances = enrol_get_instances($course->id, false);
$instance = array_values(array_filter($instances, fn($record) => $record->enrol === 'manual'))[0];
$studentrole = $DB->get_field('role', 'id', ['shortname' => 'student'], MUST_EXIST);
$manual->enrol_user($instance, $users['alice']->id, $studentrole);
as_user($users['alice']);
verify(\local_ignite\home::data()['hascourses'], 'Home uses real Moodle enrollment data');
$enrollments = $DB->get_records('user_enrolments', ['userid' => $users['alice']->id]);
houses::set_current((int)$houseids[1]);
houses::set_current((int)$houseids[2]);
verify($DB->get_records('user_enrolments', ['userid' => $users['alice']->id]) == $enrollments,
    'Changing houses preserves existing Moodle enrollments exactly');
$mycourses = $CFG->enablemycourses ?? 0;
$dashboard = $CFG->enabledashboard ?? 0;
$CFG->enablemycourses = 0;
$CFG->enabledashboard = 1;
verify(str_ends_with(\local_ignite\home::data()['coursesurl'], '/my/'), 'Disabled My courses falls back to Dashboard');
$CFG->enabledashboard = 0;
verify(str_ends_with(\local_ignite\home::data()['coursesurl'], '/course/index.php'),
    'Disabled Dashboard and My courses fall back to course catalog');
$CFG->enablemycourses = $mycourses;
$CFG->enabledashboard = $dashboard;
set_config('houses', 0, 'local_ignite');
verify(!\local_ignite\home::data()['houses'], 'House flag hides only the house surface');
rejected(fn() => houses::set_current((int)$houseids[1]), 'House feature flag blocks writes');
set_config('onboarding', 0, 'local_ignite');
rejected(fn() => preferences::save_current($prefs), 'Onboarding feature flag blocks writes');
set_config('enabled', 0, 'local_ignite');
$nav = new \core\navigation\views\primary($PAGE);
\local_ignite\navigation::primary(new \core\hook\navigation\primary_extend($nav));
verify(!$nav->find('local_ignite', navigation_node::TYPE_CUSTOM), 'Disabled Ignite adds no primary navigation');
verify(can_access_course($course), 'Disabling Ignite preserves enrolled course access');
verify(($CFG->defaulthomepage ?? null) === $homepage, 'Ignite never changes Moodle default landing page');
rejected(fn() => preferences::get_current(), 'Disabled Ignite blocks learner services');

$alicecontext = context_user::instance($users['alice']->id);
$bobcontext = context_user::instance($users['bob']->id);
verify(in_array($alicecontext->id, provider::get_contexts_for_userid($users['alice']->id)->get_contextids()),
    'Privacy discovers private learner context while disabled');
$userlist = new userlist($alicecontext, 'local_ignite');
provider::get_users_in_context($userlist);
verify(array_values($userlist->get_userids()) === [(int)$users['alice']->id], 'Privacy lists only context owner');
writer::reset();
provider::export_user_data(new approved_contextlist($users['alice'], 'local_ignite', [$alicecontext->id]));
$zip = writer::with_context($alicecontext)->finalise_content();
$exportdir = make_request_directory();
get_file_packer('application/zip')->extract_to_pathname($zip, $exportdir);
$export = '';
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($exportdir, FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file->getFilename() === 'data.json') {
        $export .= file_get_contents($file->getPathname());
    }
}
verify(str_contains($export, 'Build a weekly budget') && str_contains($export, 'houseid') &&
    !str_contains($export, $users['bob']->username), 'Real privacy export contains preferences and membership for owner only');
provider::delete_data_for_user(new approved_contextlist($users['alice'], 'local_ignite', [$bobcontext->id]));
verify($DB->record_exists('local_ignite_prefs', ['userid' => $users['alice']->id]), 'Unapproved privacy context cannot delete owner data');
provider::delete_data_for_users(new approved_userlist($bobcontext, 'local_ignite', [$users['alice']->id]));
verify($DB->record_exists('local_ignite_prefs', ['userid' => $users['alice']->id]), 'Bulk deletion cannot cross learner context');
provider::delete_data_for_user(new approved_contextlist($users['alice'], 'local_ignite', [$alicecontext->id]));
verify(!$DB->record_exists('local_ignite_prefs', ['userid' => $users['alice']->id]) &&
    !$DB->record_exists('local_ignite_member', ['userid' => $users['alice']->id]), 'Approved privacy deletion removes both private records');
verify($DB->record_exists('local_ignite_member', ['userid' => $users['bob']->id]), 'Privacy deletion preserves other learners');
provider::delete_data_for_users(new approved_userlist($bobcontext, 'local_ignite', [$users['bob']->id]));
verify(!$DB->record_exists('local_ignite_prefs', ['userid' => $users['bob']->id]), 'Approved bulk privacy deletion works');
verify($DB->record_exists('user_enrolments', ['userid' => $users['alice']->id]), 'Privacy deletion preserves core enrollment');
verify($DB->count_records('local_ignite_house') === 4, 'Privacy deletion preserves shared house configuration');

as_user(get_admin());
set_config('enabled', 1, 'local_ignite');
set_config('onboarding', 1, 'local_ignite');
set_config('houses', 1, 'local_ignite');
houses::configure($ember, $config);
as_user($users['alice']);
preferences::save_current($prefs);
houses::set_current($ember);
as_user($users['bob']);
preferences::save_current(['interests' => []]);
houses::set_current($ember);
provider::delete_data_for_all_users_in_context($bobcontext);
verify(!$DB->record_exists('local_ignite_member', ['userid' => $users['bob']->id]) &&
    $DB->record_exists('local_ignite_member', ['userid' => $users['alice']->id]),
    'Whole user-context deletion preserves other learners');
preferences::save_current(['interests' => []]);
houses::set_current($ember);
as_user(get_admin());
delete_user($users['bob']);
verify(!$DB->record_exists('local_ignite_prefs', ['userid' => $users['bob']->id]) &&
    !$DB->record_exists('local_ignite_member', ['userid' => $users['bob']->id]),
    'Native account deletion observer removes Ignite records');
as_user(core_user::get_user($CFG->siteguest));
rejected(fn() => preferences::get_current(), 'Guests cannot access private services');
as_user(get_admin());
// Prepare a genuine native upgrade run; the caller now runs admin/cli/upgrade.php.
set_config('version', 2026110100, 'local_ignite');
unset_config('allversionshash');
\core_plugin_manager::reset_caches();
echo "Foundation checks: $checks passed. Run native upgrade, then --upgrade-check.\n";
