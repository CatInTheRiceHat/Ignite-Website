<?php
// Real Moodle dashboard checks; creates only disposable private fixtures.
if (PHP_SAPI !== 'cli' || $argc < 2) { exit("Supply a private Moodle fixture root.\n"); }
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_p5_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:') ||
        !str_starts_with($CFG->dataroot, '/tmp/ignite-p5-runtime/')) {
    throw new RuntimeException('Private dashboard fixture required.');
}
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->libdir . '/completionlib.php');
require_once($CFG->libdir . '/badgeslib.php');
require_once($CFG->libdir . '/adminlib.php');
require_once($CFG->dirroot . '/my/lib.php');

use local_ignite\access;
use local_ignite\dashboard;
use local_ignite\learner_read_model;
use local_ignite\preferences;
use local_ignite\heat_stages;
use local_ignite\houses;
use local_ignite\challenges;
use local_ignite\passport;
use local_ignite\invitations;
use core_badges\badge;

$checks = 0;
function check(bool $ok, string $message): void {
    global $checks;
    if (!$ok) { throw new RuntimeException($message); }
    $checks++;
    echo "PASS $message\n";
}
function as_user(stdClass $user): void {
    core\session\manager::set_user($user);
    $_POST = ['sesskey' => sesskey()]; $_GET = [];
    learner_read_model::invalidate();
}
function change_fixture(callable $change): void {
    // Direct fixture DB writes do not emit native invalidation events; production updates use Moodle APIs.
    $change();
    learner_read_model::invalidate();
}
function rejected(callable $call, string $message): void {
    try { $call(); } catch (moodle_exception $e) { check(true, $message); return; }
    throw new RuntimeException('Expected rejection: ' . $message);
}
function evidence(stdClass $course, int $cmid, int $state): void {
    (new completion_info($course))->update_state(get_fast_modinfo($course)->get_cm($cmid), $state);
}
function native_badge(string $name, stdClass $course, int $cmid): badge {
    global $CFG;
    $badge = badge::create_badge((object)['name' => $name, 'version' => '1', 'language' => 'en',
        'description' => 'Build and check your practical weekly plan.', 'imagecaption' => '',
        'issuername' => 'Ignite fixture', 'issuerurl' => $CFG->wwwroot, 'issuercontact' => 'fixture@example.invalid'], $course->id);
    award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => BADGE_CRITERIA_TYPE_OVERALL])
        ->save(['agg' => BADGE_CRITERIA_AGGREGATION_ALL]);
    award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => BADGE_CRITERIA_TYPE_ACTIVITY])
        ->save(['module_' . $cmid => $cmid]);
    $image = make_request_directory() . '/badge.png';
    copy($CFG->dirroot . '/local/ignite/pix/sol.png', $image);
    badges_process_badge_image($badge, $image);
    $badge = new badge($badge->id); $badge->set_status(BADGE_STATUS_ACTIVE);
    return $badge;
}

as_user(get_admin());
$PAGE->set_context(context_system::instance()); $PAGE->set_url('/local/ignite/index.php');
$fixturetransaction = $DB->start_delegated_transaction();
check((int)get_config('local_ignite', 'version') === 2026110501, 'Dashboard native upgrade version');
check(!get_config('local_ignite', 'dashboard') && !get_config('local_ignite', 'dashboardlanding') &&
    !get_config('local_ignite', 'levels'), 'Dashboard, landing override and heat stages default off');
$homepage = get_config('core', 'defaulthomepage');
foreach (['enabled', 'dashboard', 'onboarding', 'houses', 'passport'] as $flag) { set_config($flag, 1, 'local_ignite'); }
set_config('levels', 0, 'local_ignite'); set_config('enablecompletion', 1); $CFG->enablecompletion = 1;
set_config('enablebadges', 1); $CFG->enablebadges = 1;
set_config('badges_allowcoursebadges', 1); $CFG->badges_allowcoursebadges = 1;
$DB->set_field('tool_usertours_tours', 'enabled', 0);
$tag = 'dash_' . bin2hex(random_bytes(4));
$users = [];
foreach (['learner', 'new', 'teacher', 'complete', 'deferred'] as $key) {
    $id = user_create_user((object)['username' => $tag . '_' . $key, 'firstname' => ucfirst($key),
        'lastname' => 'Fixture', 'email' => $tag . '_' . $key . '@example.invalid', 'password' => 'FixtureOnly!4829aZ',
        'auth' => 'manual', 'confirmed' => 1, 'policyagreed' => 1, 'mnethostid' => $CFG->mnet_localhost_id]);
    $users[$key] = core_user::get_user($id, '*', MUST_EXIST);
}
$category = $DB->get_field('course_categories', 'id', [], IGNORE_MULTIPLE);
$course = create_course((object)['fullname' => 'Budget with confidence', 'shortname' => $tag,
    'category' => $category, 'enablecompletion' => 1, 'startdate' => time() - 86400]);
$nextcourse = create_course((object)['fullname' => 'Money next steps', 'shortname' => $tag . '_next',
    'category' => $category, 'enablecompletion' => 1, 'startdate' => time() - 86400]);
$deletedcourse = create_course((object)['fullname' => 'Unavailable fixture target', 'shortname' => $tag . '_deleted',
    'category' => $category, 'enablecompletion' => 1]);
$cms = [];
foreach (['Make a weekly plan', 'Check your plan', 'Reflect on a change'] as $name) {
    $page = add_moduleinfo((object)['modulename' => 'page',
        'module' => $DB->get_field('modules', 'id', ['name' => 'page']), 'course' => $course->id,
        'section' => 0, 'name' => $name, 'intro' => '', 'introformat' => FORMAT_HTML,
        'content' => 'A real private learning activity.', 'contentformat' => FORMAT_HTML, 'display' => 5,
        'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0, 'completion' => COMPLETION_TRACKING_MANUAL], $course);
    $cms[] = (int)$page->coursemodule;
}
$criterion = completion_criteria::factory(['criteriatype' => COMPLETION_CRITERIA_TYPE_ACTIVITY, 'course' => $course->id]);
$completionconfig = (object)['id' => $course->id, 'criteria_activity' => array_fill_keys($cms, 1)];
$criterion->update_config($completionconfig);
$manual = enrol_get_plugin('manual');
$instance = array_values(array_filter(enrol_get_instances($course->id, false), fn($r) => $r->enrol === 'manual'))[0];
foreach (['learner', 'complete', 'teacher'] as $key) {
    $role = $DB->get_field('role', 'id', ['shortname' => $key === 'teacher' ? 'editingteacher' : 'student']);
    $manual->enrol_user($instance, $users[$key]->id, $role);
}
$self = enrol_get_plugin('self');
$self->add_instance($nextcourse, ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1,
    'roleid' => $DB->get_field('role', 'id', ['shortname' => 'student'])]);
$catalog = ['interests' => ['money' => ['name' => 'Money skills',
    'courseids' => [(int)$course->id, (int)$nextcourse->id]]], 'paths' => (object)[]];
set_config('catalog', json_encode($catalog), 'local_ignite');
set_config('onboardingconfig', json_encode(['starters' => [], 'outcomes' => [
    'course:' . $course->id => 'Build a practical weekly plan.',
    'course:' . $nextcourse->id => 'Practice everyday money decisions.']]), 'local_ignite');
set_config('hearthselectionroute', '/local/ignite/choosehearth.php', 'local_ignite');
set_config('hearthtiming', 'initial', 'local_ignite');
$earned = native_badge('Planning starter', $course, $cms[0]);
$nextbadge = native_badge('Thoughtful planner', $course, $cms[2]);
set_config('passportcatalog', json_encode(['badges' => [
    $earned->id => ['category' => 'starter', 'courseid' => (int)$course->id, 'artwork' => 'native'],
    $nextbadge->id => ['category' => 'skill', 'courseid' => (int)$course->id, 'artwork' => 'native'],
]]), 'local_ignite');
$hearths = array_values(houses::available());
check(count($hearths) >= 2, 'Reuses configured Hearth identities');
foreach (array_slice($hearths, 0, 2) as $hearth) {
    houses::configure((int)$hearth->id, ['name' => $hearth->name, 'description' => $hearth->description,
        'accent' => $hearth->accent, 'emblem' => $hearth->emblem, 'active' => 1, 'mascot' => 'sol']);
}

as_user($users['learner']);
preferences::save_current(['interests' => ['money'], 'status' => 'complete', 'currentstep' => 'done']);
change_fixture(fn() => $DB->set_field('local_ignite_prefs', 'targetkey', 'course:' . $course->id, ['userid' => $USER->id]));
$data = dashboard::data();
check($data['course']['known'] && $data['course']['percent'] === 0 && $data['course']['done'] === 0,
    'Zero percent is used only for real tracked zero completion');
check($data['primary']['url'] === get_fast_modinfo($course)->get_cm($cms[0])->url->out(false), 'Primary action is the first real ordered activity');
check($data['passport']['next']['badgeid'] === (int)$earned->id && !empty($data['passport']['next']['criteria']),
    'Real next badge includes native visible requirements');
check($data['heat'] === false, 'No heat stages leak while flag is off');
check($data['offer'] && !$data['hearth'], 'Eligible invitation is nonblocking without membership');
invitations::defer();
$data = dashboard::data();
check(!$data['offer'] && $data['deferred'], 'Deferred invitation is not reissued on dashboard reads');
evidence($course, $cms[0], COMPLETION_COMPLETE);
$data = dashboard::data();
check($data['course']['done'] === 1 && $data['course']['total'] === 3 && $data['course']['percent'] === 33,
    'Real native completion produces textual count and matching percentage');
check($data['primary']['url'] === get_fast_modinfo($course)->get_cm($cms[1])->url->out(false), 'Next action advances after completion');
check($data['passport']['recent'][0]['earned'], 'Only server-confirmed native award appears as earned');
passport::save_featured_current([(int)$earned->id]);
check(count(dashboard::data()['passport']['featured']) === 1, 'Featured badges reuse owned native award instances');
$awardsbefore = $DB->get_records('badge_issued', ['userid' => $USER->id]);

// Native availability prevents a jump over an earlier locked incomplete activity.
change_fixture(function() use ($DB, $cms, $course) {
    $DB->set_field('course_modules', 'availability', json_encode(['op' => '&', 'showc' => [true],
        'c' => [['type' => 'date', 'd' => '>=', 't' => time() + 86400]]]), ['id' => $cms[1]]);
    rebuild_course_cache($course->id, true);
});
$data = dashboard::data();
check(!$data['primary'] && !$data['course']['next'], 'Unavailable next activity is not replaced with a later sequence activity');
check(!str_contains(json_encode($data['course']), 'Check your plan'), 'Restricted next activity name is not disclosed');
change_fixture(function() use ($DB, $cms, $course) {
    $DB->set_field('course_modules', 'availability', null, ['id' => $cms[1]]); rebuild_course_cache($course->id, true);
});
change_fixture(function() use ($DB, $cms, $course) {
    $DB->set_field('course_modules', 'availability', json_encode(['op' => '&', 'showc' => [true],
        'c' => [['type' => 'completion', 'cm' => $cms[0], 'e' => 1]]]), ['id' => $cms[1]]);
    rebuild_course_cache($course->id, true);
});
check(local_ignite\recommendations::target('activity:' . $cms[1]) !== null,
    'Native completion prerequisite permits the next activity when satisfied');
evidence($course, $cms[0], COMPLETION_INCOMPLETE);
check(local_ignite\recommendations::target('activity:' . $cms[1]) === null &&
    dashboard::data()['primary']['url'] === get_fast_modinfo($course)->get_cm($cms[0])->url->out(false),
    'Reversed prerequisite blocks its dependent and returns to the real earlier activity');
evidence($course, $cms[0], COMPLETION_COMPLETE);
check(local_ignite\recommendations::target('activity:' . $cms[1]) !== null,
    'Native recompletion makes the dependent available again without granting duplicate awards');
change_fixture(function() use ($DB, $cms, $course) {
    $DB->set_field('course_modules', 'availability', null, ['id' => $cms[1]]); rebuild_course_cache($course->id, true);
});

as_user(get_admin());
$heatjson = json_encode(['thresholds' => [0, 1, 3, 6, 10], 'milestones' => array_fill_keys($cms, 'complete')]);
heat_stages::parse($heatjson);
set_config('heatconfig', $heatjson, 'local_ignite'); set_config('levels', 1, 'local_ignite');
$setting = new local_ignite\admin\heat_setting('local_ignite/heatconfig', 'Heat', '', heat_stages::EMPTY);
check($setting->write_setting('{"thresholds":[0,1,1,6,10],"milestones":{}}') !== '' &&
    get_config('local_ignite', 'heatconfig') === $heatjson, 'Invalid editable thresholds preserve the previous configuration');
rejected(fn() => heat_stages::parse(json_encode(['thresholds' => [0,1,3,6,10],
    'milestones' => [$cms[0] => 'pass']])), 'Pass milestone requires native passing-grade configuration');
// New future period seeds previous completions as excluded, then fixture time advances into it.
$DB->set_field('local_ignite_challenge', 'active', 0);
$period = challenges::configure(0, ['name' => 'Small steps, shared fire', 'description' => 'Build useful plans together.',
    'target' => 10, 'timestart' => time() + 60, 'timeend' => time() + 86400, 'timezone' => 'UTC', 'active' => 1],
    array_fill_keys($cms, 'complete'));
change_fixture(fn() => $DB->set_field('local_ignite_challenge', 'timestart', time() - 100, ['id' => $period]));
as_user($users['learner']);
check(heat_stages::current()['count'] === 1 && heat_stages::current()['stage'] === 'Ember', 'Historical completion counts once toward personal heat without Hearth membership');
houses::set_current((int)$hearths[0]->id);
change_fixture(fn() => $DB->set_field('local_ignite_history', 'timebegin', time() - 50, ['userid' => $USER->id, 'timeend' => 0]));
check(challenges::progress($period, (int)$hearths[0]->id)['own'] === 0, 'Historical pre-membership work receives no retroactive Hearth credit');
evidence($course, $cms[1], COMPLETION_COMPLETE);
$data = dashboard::data();
check(heat_stages::current()['count'] === 2 && str_contains(heat_stages::current()['next'], '1 more'), 'Exact next-stage requirement uses distinct milestones');
check(str_contains($data['hearth']['challenge']['own'], '1') && challenges::progress($period, (int)$hearths[0]->id)['total'] === 1,
    'Own and shared totals agree immediately after native completion before cron');
evidence($course, $cms[1], COMPLETION_INCOMPLETE);
check(heat_stages::current()['count'] === 1 && challenges::progress($period, (int)$hearths[0]->id)['total'] === 0,
    'Native reversal removes personal count and withdraws shared credit consistently');
evidence($course, $cms[1], COMPLETION_COMPLETE);
check(heat_stages::current()['count'] === 2 && challenges::progress($period, (int)$hearths[0]->id)['total'] === 0,
    'Recompletion restores at most one personal count and never restores withdrawn period credit');
houses::set_current((int)$hearths[1]->id);
check(heat_stages::current()['count'] === 2 && challenges::progress($period, (int)$hearths[1]->id)['own'] === 0 &&
    $DB->get_records('badge_issued', ['userid' => $USER->id]) == $awardsbefore,
    'Changed Hearth updates current summary while preserving personal learning and native ownership');
houses::set_current((int)$hearths[0]->id);
$reads = $DB->perf_get_reads(); learner_read_model::evidence([(int)$course->id]);
$warm = $DB->perf_get_reads(); learner_read_model::evidence([(int)$course->id]);
check($DB->perf_get_reads() === $warm && $warm - $reads <= 1, 'Completion evidence is batched and request cached');

// Tracking and visibility changes use native APIs where available; direct setup writes invalidate explicitly.
change_fixture(function() use ($course) { update_course((object)['id' => $course->id, 'enablecompletion' => 0]); });
$data = dashboard::data();
check(!$data['course']['known'] && !isset($data['course']['percent']) && !heat_stages::current()['available'],
    'Disabled course tracking never displays invented zero percent or personal stage');
change_fixture(function() use ($course) { update_course((object)['id' => $course->id, 'enablecompletion' => 1]); });
$CFG->enablecompletion = 0; learner_read_model::invalidate();
check(!dashboard::data()['course']['known'] && !heat_stages::current()['available'], 'Disabled site tracking makes course and personal progress unavailable');
$CFG->enablecompletion = 1; learner_read_model::invalidate();
change_fixture(fn() => update_course((object)['id' => $course->id, 'visible' => 0]));
$data = dashboard::data();
check(!$data['course'] && !str_contains(json_encode($data), 'Budget with confidence'), 'Hidden selected course and its title are omitted');
change_fixture(fn() => update_course((object)['id' => $course->id, 'visible' => 1]));
as_user(get_admin());
delete_course($deletedcourse, false);
as_user($users['learner']);
change_fixture(fn() => $DB->set_field('local_ignite_prefs', 'targetkey', 'course:' . $deletedcourse->id, ['userid' => $USER->id]));
check(dashboard::data()['selectionunavailable'] && dashboard::data()['course']['id'] === (int)$course->id,
    'Native course deletion leaves a useful fallback to real accessible enrollment');
change_fixture(fn() => $DB->set_field('local_ignite_prefs', 'targetkey', 'course:' . $course->id, ['userid' => $USER->id]));
as_user($users['complete']);
preferences::save_current(['interests' => ['money'], 'status' => 'complete', 'currentstep' => 'done']);
change_fixture(fn() => $DB->set_field('local_ignite_prefs', 'targetkey', 'course:' . $course->id, ['userid' => $USER->id]));
foreach ($cms as $id) { evidence($course, $id, COMPLETION_COMPLETE); }
core_completion\api::mark_course_completions_activity_criteria();
$completionid = (int)$DB->get_field('course_completions', 'id', ['course' => $course->id, 'userid' => $USER->id]);
aggregate_completions($completionid); learner_read_model::invalidate();
$data = dashboard::data();
check($data['course']['complete'] && $data['course']['percent'] === 100 && !$data['course']['next'], 'Native completed course has an accurate completed state');
check(!empty($data['primary']['enrol']) && str_contains($data['primary']['url'], '/enrol/index.php'),
    'Completed learner continues only to actual normal enrollment options');
as_user($users['new']);
$data = dashboard::data();
check(!$data['course'] && !$data['hearth'] && !$data['passport']['hasrecent'], 'New learner sees honest no enrollment, no Hearth and no badges states');
check(!empty($data['primary']['enrol']), 'New learner primary opens an eligible enrollment page');
as_user($users['teacher']);
$data = dashboard::data();
check(!$data['course']['known'] && !isset($data['course']['percent']) && !$data['course']['next'], 'Teacher session has no fabricated learner percentage or next completion');
as_user(get_admin());
check(!dashboard::data()['course'], 'Administrator sees own enrollment state, never another learner’s dashboard');
check(get_config('core', 'defaulthomepage') === $homepage, 'No native default homepage or user homepage preference is changed');

// Prepare real native dashboard blocks, preserving Timeline and Course overview.
$default = my_get_page(null, MY_PAGE_PRIVATE);
$page = new moodle_page(); $page->set_context(context_system::instance()); $page->set_url('/my/indexsys.php');
$page->set_pagetype('my-index'); $page->set_pagelayout('mydashboard'); $page->set_subpage($default->id);
$page->blocks->add_region('content', true);
$location = ['blockname' => 'ignite', 'parentcontextid' => context_system::instance()->id,
    'pagetypepattern' => 'my-index', 'subpagepattern' => (string)$default->id];
if (!$DB->record_exists('block_instances', $location)) {
    $page->blocks->add_block('ignite', 'content', -10, false, 'my-index', $default->id);
}
$block = $DB->get_record('block_instances', $location, '*', MUST_EXIST);
check($block->pagetypepattern === 'my-index' && $DB->record_exists('block_instances', ['blockname' => 'myoverview']),
    'Uses native dashboard block manager and retains Course overview');
// Leave stage system off, and completed onboarding for browser navigation checks.
set_config('levels', 0, 'local_ignite'); set_config('dashboardlanding', 0, 'local_ignite');
as_user($users['deferred']); invitations::defer();
preferences::save_current(['interests' => ['money'], 'status' => 'complete', 'currentstep' => 'done']);
as_user($users['learner']);
echo 'DASHBOARD_FIXTURE=' . json_encode(['users' => array_map(fn($u) => $u->username, $users),
    'courseid' => (int)$course->id, 'cmids' => $cms, 'hearthid' => (int)$hearths[0]->id,
    'badgeid' => (int)$earned->id, 'checks' => $checks]) . "\n";
$fixturetransaction->allow_commit();
echo "Dashboard checks: $checks passed\n";
