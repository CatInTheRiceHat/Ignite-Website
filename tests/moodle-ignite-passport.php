<?php
// Real, destructive-to-fixtures Moodle integration checks. Never use a production DB/data copy.
// php tests/moodle-ignite-passport.php PRIVATE_MOODLE_ROOT [--baseline | --fresh]
if (PHP_SAPI !== 'cli' || $argc < 2) {
    exit("Usage: php moodle-ignite-passport.php PRIVATE_MOODLE_ROOT [--baseline | --fresh]\n");
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
if (!str_contains($CFG->dbname, 'ignite_lms_test_passport') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) {
    throw new RuntimeException('Requires isolated Passport test DB, loopback URL, and disabled email.');
}
}
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->libdir . '/badgeslib.php');
require_once($CFG->libdir . '/completionlib.php');
require_once($CFG->libdir . '/adminlib.php');
require_once($CFG->dirroot . '/mod/assign/locallib.php');

use local_ignite\passport;
use local_ignite\passport_catalog;
use local_ignite\badge_state;
use local_ignite\houses;
use local_ignite\privacy\provider;
use core_badges\badge;
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
function rejected(callable $fn, string $message): void {
    try {
        $fn();
    } catch (moodle_exception $e) {
        verify(true, $message . ' (' . get_class($e) . ')');
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
    $result = [];
    foreach (['local_ignite_house', 'local_ignite_member', 'local_ignite_prefs', 'course', 'user_enrolments', 'grade_grades',
            'badge', 'badge_issued'] as $table) {
        $result[$table] = $DB->get_records($table, null, 'id');
    }
    foreach ($result['course'] as $course) {
        unset($course->cacherev); // Native upgrade/cache purge deliberately changes this cache token.
    }
    $result['catalog'] = get_config('local_ignite', 'catalog');
    return $result;
}
function newbadge(string $name, ?int $courseid, int $type, array $params): badge {
    global $CFG;
    $badge = badge::create_badge((object)[
        'name' => $name, 'version' => '1', 'language' => 'en', 'description' => 'A real fixture achievement.',
        'imagecaption' => '', 'issuername' => 'Ignite fixture', 'issuerurl' => $CFG->wwwroot,
        'issuercontact' => 'fixture@example.invalid',
    ], $courseid);
    award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => BADGE_CRITERIA_TYPE_OVERALL])
        ->save(['agg' => BADGE_CRITERIA_AGGREGATION_ALL]);
    award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => $type])->save($params);
    $image = make_request_directory() . '/approved.png';
    copy($CFG->dirroot . '/local/ignite/pix/sol.png', $image);
    badges_process_badge_image($badge, $image);
    $badge = new badge($badge->id);
    $badge->set_status(BADGE_STATUS_ACTIVE);
    return $badge;
}
function awardmanual(badge $badge, int $userid, int $roleid): void {
    global $USER;
    core_badges\award_manager::process_manual_award($userid, $USER->id, $roleid, $badge->id);
    badges_award_handle_manual_criteria_review((object)[
        'crit' => $badge->criteria[BADGE_CRITERIA_TYPE_MANUAL], 'userid' => $userid,
    ]);
}
function savecatalog(array $map): void {
    $json = json_encode(['badges' => (object)$map], JSON_THROW_ON_ERROR);
    passport_catalog::parse($json);
    set_config('passportcatalog', $json, 'local_ignite');
}

as_user(get_admin());
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/passport.php');
if (($argv[2] ?? '') === '--baseline') {
    verify((int)get_config('local_ignite', 'version') === 2026110101, 'Snapshot starts from completed Prompt 1 version');
    set_config('passportfixturebaseline', json_encode(snapshot(), JSON_THROW_ON_ERROR), 'local_ignite');
    exit(0);
}
verify((int)get_config('local_ignite', 'version') === ($integrated ? 2026110501 : 2026110104), 'Native installation or upgrade reached Passport version');
if (!$integrated && ($argv[2] ?? '') !== '--fresh') {
    $baseline = json_decode(get_config('local_ignite', 'passportfixturebaseline'), true);
    foreach ($baseline['course'] as &$baselinecourse) {
        unset($baselinecourse['cacherev']);
    }
    unset($baselinecourse);
    verify($baseline === json_decode(json_encode(snapshot()), true), 'Upgrade preserved foundation IDs, names, colors, memberships, preferences, courses, enrollment, grades and credentials');
} else if (!$integrated) {
    verify(!local_ignite\access::enabled(), 'Fresh installation remains disabled by default');
    verify($DB->count_records('local_ignite_feature') === 0, 'Fresh installation has no personal choices');
    verify($DB->count_records('badge') === 0, 'Fresh installation does not create native example badges');
}
foreach (['enabled', 'passport'] as $flag) {
    set_config($flag, 1, 'local_ignite');
}
set_config('houses', 0, 'local_ignite');
set_config('onboarding', 0, 'local_ignite');
set_config('enablebadges', 1);
set_config('badges_allowcoursebadges', 1);
$DB->set_field('tool_usertours_tours', 'enabled', 0);
$tag = 'passport_' . bin2hex(random_bytes(4));
$users = [];
foreach (['alice', 'bob', 'empty', 'delete', 'mentor'] as $name) {
    $id = user_create_user((object)['username' => $tag . '_' . $name, 'firstname' => ucfirst($name), 'lastname' => 'Passport',
        'email' => $tag . '_' . $name . '@example.invalid', 'password' => 'FixtureOnly!4829aZ',
        'auth' => 'manual', 'confirmed' => 1, 'mnethostid' => $CFG->mnet_localhost_id]);
    $users[$name] = core_user::get_user($id, '*', MUST_EXIST);
}
$course = create_course((object)['fullname' => 'Passport practical course ' . $tag, 'shortname' => $tag,
    'category' => $DB->get_field('course_categories', 'id', [], IGNORE_MULTIPLE), 'enablecompletion' => 1,
    'startdate' => time() - 86400]);
$page = add_moduleinfo((object)[
    'modulename' => 'page', 'module' => $DB->get_field('modules', 'id', ['name' => 'page']),
    'course' => $course->id, 'section' => 0, 'name' => 'A real starter challenge',
    'intro' => '', 'introformat' => FORMAT_HTML, 'content' => 'Complete this fixture challenge.',
    'contentformat' => FORMAT_HTML, 'display' => 5, 'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0,
    'completion' => COMPLETION_TRACKING_MANUAL,
], $course);
$coursecriterion = completion_criteria::factory(['criteriatype' => COMPLETION_CRITERIA_TYPE_ACTIVITY, 'course' => $course->id]);
$completionconfig = (object)['id' => $course->id, 'criteria_activity' => [$page->coursemodule => 1]];
$coursecriterion->update_config($completionconfig);
$studentrole = (int)$DB->get_field('role', 'id', ['shortname' => 'student'], MUST_EXIST);
$teacherrole = (int)$DB->get_field('role', 'id', ['shortname' => 'editingteacher'], MUST_EXIST);
$manual = enrol_get_plugin('manual');
$instance = array_values(array_filter(enrol_get_instances($course->id, false), fn($r) => $r->enrol === 'manual'))[0];
foreach ($users as $user) {
    $manual->enrol_user($instance, $user->id, $studentrole);
}
$first = newbadge('First Spark ' . $tag, $course->id, BADGE_CRITERIA_TYPE_ACTIVITY, ['module_' . $page->coursemodule => $page->coursemodule]);
$primary = newbadge('Course achievement ' . $tag, $course->id, BADGE_CRITERIA_TYPE_COURSE, ['course_' . $course->id => $course->id]);
$manuals = [];
foreach (['Collaborator', 'Project', 'Extra', 'Other learner'] as $name) {
    $manuals[] = newbadge($name . ' ' . $tag, null, BADGE_CRITERIA_TYPE_MANUAL,
        ['role_' . $teacherrole => $teacherrole, 'description' => 'Useful, specific contribution; respectful and accurate; mentor checks evidence.']);
}
$map = [
    $first->id => ['category' => 'starter', 'courseid' => (int)$course->id, 'artwork' => 'native'],
    $primary->id => ['category' => 'skill', 'courseid' => (int)$course->id, 'primary' => true],
];
foreach ($manuals as $index => $b) {
    $map[$b->id] = ['category' => $index === 1 ? 'project' : 'collaborator', 'artwork' => 'native'];
}
savecatalog($map);
verify(passport_catalog::get()[$primary->id]['primary'], 'Primary mapping requires real course completion');
rejected(fn() => savecatalog($map + [2147483647 => ['category' => 'skill']]), 'Nonexistent native badge rejected');
$badmap = $map;
$badmap[$first->id]['primary'] = true;
$badmap[$first->id]['category'] = 'skill';
rejected(fn() => savecatalog($badmap), 'Activity-only badge cannot become a course primary or duplicate its course collectible');
$badmap = $map;
$badmap[$first->id]['courseid'] = 2147483647;
rejected(fn() => savecatalog($badmap), 'Mismatched or nonexistent real course rejected');
$badmap = $map;
$badmap[$first->id]['artwork'] = 'https://example.invalid/unapproved.png';
rejected(fn() => savecatalog($badmap), 'Arbitrary unapproved artwork rejected');
$setting = new local_ignite\admin\passport_setting('local_ignite/passportcatalog', 'Passport', '', passport_catalog::EMPTY);
$before = get_config('local_ignite', 'passportcatalog');
verify($setting->write_setting('{broken') !== '' && get_config('local_ignite', 'passportcatalog') === $before,
    'Invalid admin JSON preserves prior configuration');

as_user($users['alice']);
$empty = passport::collection_current();
verify(!$empty['hashearth'] && !$empty['hasearned'] && $empty['haspursue'], 'Standalone Passport works without onboarding or Hearth membership');
verify(!$DB->record_exists('local_ignite_prefs', ['userid' => $users['alice']->id]), 'Opening Passport creates no onboarding state');
verify(badge_state::get_current($first->id)['state'] === 'unearned' && !$first->is_issued($users['alice']->id), 'No early badge on opening Passport');
$html = $OUTPUT->render_from_template('local_ignite/passport', $empty);
verify(str_contains($html, 'Artwork awaiting approval') && str_contains($html, 'Not earned'), 'Labeled placeholders and textual unearned states render');
$detail = passport::badge_current($first->id);
verify(str_contains($detail['criteria'], 'A real starter challenge') && !$detail['earned'], 'Details show real native activity criteria without a false celebration');
verify(!$detail['placeholder'] && str_ends_with($detail['imageurl'], '/f3'), 'Approved native artwork uses the installed extensionless image size route');
as_user(get_admin());
get_file_storage()->create_file_from_pathname([
    'contextid' => context_course::instance($course->id)->id, 'component' => 'course', 'filearea' => 'overviewfiles',
    'itemid' => 0, 'filepath' => '/', 'filename' => 'approved-fixture.png',
], $CFG->dirroot . '/local/ignite/pix/graduation.png');
cache::make('core', 'course_image')->delete($course->id);
$map[$primary->id]['artwork'] = 'course';
savecatalog($map);
as_user($users['alice']);
$courseart = passport::badge_current($primary->id, false);
verify(!$courseart['placeholder'] && str_contains($courseart['imageurl'], '/course/overviewfiles/'),
    'Approved existing course artwork is reused through the native course image API');
rejected(fn() => passport::save_featured_current([$first->id]), 'Unearned badge cannot be featured');
$_POST = [];
rejected(fn() => passport::save_featured_current([]), 'Featured mutation requires CSRF protection');
$_POST = ['sesskey' => sesskey()];
(new completion_info($course))->update_state(get_fast_modinfo($course)->get_cm($page->coursemodule), COMPLETION_COMPLETE, $users['alice']->id);
$state = badge_state::get_current($first->id);
verify($state['earned'] && $first->is_issued($users['alice']->id), 'Native activity completion observer genuinely issues First Spark');
verify($DB->count_records('badge_issued', ['badgeid' => $first->id, 'userid' => $USER->id]) === 1, 'Exactly one native starter award is created');
(new completion_info($course))->update_state(get_fast_modinfo($course)->get_cm($page->coursemodule), COMPLETION_COMPLETE, $users['alice']->id);
(new badge($first->id))->review_all_criteria();
verify($DB->count_records('badge_issued', ['badgeid' => $first->id, 'userid' => $users['alice']->id]) === 1, 'Duplicate completion and review do not duplicate awards');
verify(passport::badge_current($first->id)['earned'], 'Only server-confirmed award permits celebration');

as_user(get_admin());
$secondcourse = create_course((object)['fullname' => 'Another practical skill ' . $tag, 'shortname' => $tag . '_second',
    'category' => $course->category, 'enablecompletion' => 1, 'startdate' => time() - 86400]);
$secondpage = add_moduleinfo((object)[
    'modulename' => 'page', 'module' => $DB->get_field('modules', 'id', ['name' => 'page']),
    'course' => $secondcourse->id, 'section' => 0, 'name' => 'Another real challenge',
    'intro' => '', 'introformat' => FORMAT_HTML, 'content' => 'Complete another skill.',
    'contentformat' => FORMAT_HTML, 'display' => 5, 'visible' => 1, 'printintro' => 0, 'printlastmodified' => 0,
    'completion' => COMPLETION_TRACKING_MANUAL,
], $secondcourse);
$secondcriterion = completion_criteria::factory(['criteriatype' => COMPLETION_CRITERIA_TYPE_ACTIVITY,
    'course' => $secondcourse->id]);
$secondcompletionconfig = (object)['id' => $secondcourse->id, 'criteria_activity' => [$secondpage->coursemodule => 1]];
$secondcriterion->update_config($secondcompletionconfig);
$secondinstance = array_values(array_filter(enrol_get_instances($secondcourse->id, false), fn($r) => $r->enrol === 'manual'))[0];
$manual->enrol_user($secondinstance, $users['alice']->id, $studentrole);
$explorer = newbadge('Explorer ' . $tag, null, BADGE_CRITERIA_TYPE_COURSESET,
    ['course_' . $course->id => $course->id, 'course_' . $secondcourse->id => $secondcourse->id,
        'agg' => BADGE_CRITERIA_AGGREGATION_ALL]);
$map[$explorer->id] = ['category' => 'explorer'];
savecatalog($map);
as_user($users['alice']);
// Native completion aggregation from actual completed activity evidence, not browser assertions.
\core_completion\api::mark_course_completions_activity_criteria();
$coursecompletionid = (int)$DB->get_field('course_completions', 'id', ['course' => $course->id, 'userid' => $USER->id]);
aggregate_completions($coursecompletionid);
verify(badge_state::get_current($primary->id)['earned'] && badge_state::get_current($primary->id)['coursecomplete'],
    'Actual native course rule aggregation issues the primary course collectible');
verify(!badge_state::get_current($explorer->id)['earned'], 'Explorer is not earned after just one of its distinct courses');
(new completion_info($secondcourse))->update_state(get_fast_modinfo($secondcourse)->get_cm($secondpage->coursemodule),
    COMPLETION_COMPLETE, $USER->id);
\core_completion\api::mark_course_completions_activity_criteria();
$secondcompletionid = (int)$DB->get_field('course_completions', 'id', ['course' => $secondcourse->id, 'userid' => $USER->id]);
aggregate_completions($secondcompletionid);
verify(badge_state::get_current($explorer->id)['earned'], 'Native site course-set criterion issues Explorer only after both different courses complete');

as_user(get_admin());
$manual->enrol_user($instance, $users['mentor']->id, $teacherrole);
as_user($users['mentor']);
verify(has_capability('moodle/badges:awardbadge', context_course::instance($course->id)) &&
    !has_capability('moodle/badges:awardbadge', context_system::instance()),
    'Course mentor role alone does not authorize site-badge awards');
as_user(get_admin());
role_assign($teacherrole, $users['mentor']->id, context_system::instance());
as_user($users['mentor']);
verify(has_capability('moodle/badges:awardbadge', context_system::instance()), 'Explicit system role authorizes selected mentor for native site badge awards');
awardmanual($manuals[0], $users['alice']->id, $teacherrole);
as_user(get_admin());
awardmanual($manuals[1], $users['alice']->id, $teacherrole);
awardmanual($manuals[2], $users['alice']->id, $teacherrole);
awardmanual($manuals[3], $users['bob']->id, $teacherrole);
as_user($users['alice']);
verify(!has_capability('moodle/badges:awardbadge', context_system::instance()), 'Learner lacks native manual-award capability');
rejected(fn() => passport::save_featured_current([$manuals[3]->id]), 'Another learner’s badge ID cannot be featured');
$featuredids = array_map('intval', [$first->id, $manuals[0]->id, $manuals[1]->id]);
passport::save_featured_current($featuredids);
passport::save_featured_current($featuredids);
verify(array_column(passport::collection_current()['featured'], 'badgeid') === $featuredids &&
    $DB->count_records('local_ignite_feature', ['userid' => $users['alice']->id]) === 3, 'Up to three owned featured badges persist idempotently');
rejected(fn() => passport::save_featured_current([...$featuredids, $manuals[2]->id]), 'Four featured badges rejected');
rejected(fn() => passport::save_featured_current([$first->id, $first->id]), 'Duplicate featured IDs rejected');
rejected(fn() => passport::save_featured_current(['userid' => $users['bob']->id]), 'Forged learner field cannot grant badge ownership');
rejected(fn() => passport::save_featured_current([['badgeid' => $first->id]]), 'Malformed featured ID rejected');
verify(count(passport::collection_current()['featured']) === 3, 'Failed writes preserve prior featured choices');

// Native manual contribution evidence can exist before issuance is processed.
as_user(get_admin());
$delayed = newbadge('Delayed native award ' . $tag, null, BADGE_CRITERIA_TYPE_MANUAL, ['role_' . $teacherrole => $teacherrole]);
$map[$delayed->id] = ['category' => 'collaborator'];
savecatalog($map);
core_badges\award_manager::process_manual_award($users['alice']->id, $USER->id, $teacherrole, $delayed->id);
as_user($users['alice']);
verify(badge_state::get_current($delayed->id)['state'] === 'pendingissuance' && !$delayed->is_issued($USER->id), 'Real manual evidence without issuance is pending, not earned');
rejected(fn() => passport::save_featured_current([$delayed->id]), 'Pending issuance cannot be featured');
as_user(get_admin());
badges_award_handle_manual_criteria_review((object)['crit' => $delayed->criteria[BADGE_CRITERIA_TYPE_MANUAL], 'userid' => $users['alice']->id]);
as_user($users['alice']);
verify(badge_state::get_current($delayed->id)['earned'], 'Delayed native issuance changes pending to earned');

// Real submitted assignment; grade-dependent completion, no grading or invented completion evidence.
as_user(get_admin());
$assignment = add_moduleinfo((object)[
    'modulename' => 'assign', 'module' => $DB->get_field('modules', 'id', ['name' => 'assign']),
    'course' => $course->id, 'section' => 0, 'name' => 'Project awaiting assessment', 'intro' => '', 'introformat' => FORMAT_HTML,
    'visible' => 1, 'completion' => COMPLETION_TRACKING_AUTOMATIC, 'completionusegrade' => 1,
    'completionpassgrade' => 1, 'grade' => 100, 'gradepass' => 60,
    'assignsubmission_onlinetext_enabled' => 1, 'assignsubmission_file_enabled' => 0,
    'submissiondrafts' => 0, 'requiresubmissionstatement' => 0, 'teamsubmission' => 0,
    'alwaysshowdescription' => 1, 'allowsubmissionsfromdate' => 0, 'duedate' => 0, 'cutoffdate' => 0,
    'gradingduedate' => 0, 'attemptreopenmethod' => 'none', 'maxattempts' => 1, 'markingworkflow' => 0,
    'markingallocation' => 0, 'blindmarking' => 0, 'sendnotifications' => 0, 'sendlatenotifications' => 0,
    'sendstudentnotifications' => 0, 'requireallteammemberssubmit' => 0, 'teamsubmissiongroupingid' => 0,
], $course);
$project = newbadge('Project Builder ' . $tag, $course->id, BADGE_CRITERIA_TYPE_ACTIVITY,
    ['module_' . $assignment->coursemodule => $assignment->coursemodule]);
$map[$project->id] = ['category' => 'project', 'courseid' => (int)$course->id];
savecatalog($map);
as_user($users['alice']);
$cm = get_fast_modinfo($course)->get_cm($assignment->coursemodule);
$assign = new assign(context_module::instance($cm->id), $cm, $course);
$notices = [];
$assign->save_submission((object)['userid' => $USER->id, 'onlinetext_editor' => ['text' => '<p>My real project submission</p>',
    'format' => FORMAT_HTML, 'itemid' => 0]], $notices);
verify(badge_state::get_current($project->id)['state'] === 'pendinggrading' && !$project->is_issued($USER->id), 'Submitted ungraded native Assign work shows pending grading, never earned');

// Native revocation must immediately remove featured status without an Ignite event observer/cache.
as_user(get_admin());
core_badges\award_manager::process_manual_revoke($users['alice']->id, 0, $teacherrole, $manuals[0]->id);
as_user($users['alice']);
verify(!in_array($manuals[0]->id, array_column(passport::collection_current()['featured'], 'badgeid')), 'Native revocation immediately removes featured display');
rejected(fn() => passport::save_featured_current([$manuals[0]->id]), 'Revoked badge cannot be featured');
as_user(get_admin());
awardmanual($manuals[0], $users['alice']->id, $teacherrole);
as_user($users['alice']);
verify(!in_array($manuals[0]->id, array_column(passport::collection_current()['featured'], 'badgeid')), 'Reissued badge does not reuse the old featured award instance');
passport::save_featured_current($featuredids);
as_user(get_admin());
(new badge($manuals[1]->id))->set_status(BADGE_STATUS_INACTIVE_LOCKED);
as_user($users['alice']);
verify(badge_state::get_current($manuals[1]->id)['state'] === 'earned_unavailable' &&
    !in_array($manuals[1]->id, array_column(passport::collection_current()['featured'], 'badgeid')), 'Disabled earned badge remains honestly labeled and is no longer featured');
rejected(fn() => passport::save_featured_current([$manuals[1]->id]), 'Disabled badge cannot be newly featured');
as_user(get_admin());
(new badge($manuals[1]->id))->set_status(BADGE_STATUS_ACTIVE_LOCKED);
$DB->set_field('badge_issued', 'visible', 0, ['badgeid' => $manuals[1]->id, 'userid' => $users['alice']->id]);
// Direct fixture mutation has no native event; invalidate this request's evidence snapshot.
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
as_user($users['alice']);
verify(passport::badge_current($manuals[1]->id) === null, 'Native private badge is not exposed by Passport');
as_user(get_admin());
$DB->set_field('badge_issued', 'visible', 1, ['badgeid' => $manuals[1]->id, 'userid' => $users['alice']->id]);
// Direct fixture mutation has no native event; invalidate this request's evidence snapshot.
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
course_change_visibility($course->id, 0);
as_user($users['alice']);
verify(passport::badge_current($first->id) === null && !in_array($first->id,
    array_column(passport::collection_current()['featured'], 'badgeid')), 'Hidden course hides its badge details and featured frame');
as_user(get_admin());
course_change_visibility($course->id, 1);
set_coursemodule_visible($page->coursemodule, 0);
rebuild_course_cache($course->id, true);
as_user($users['alice']);
verify(passport::badge_current($first->id) === null, 'Hidden criterion activity cannot leak through badge details');
as_user(get_admin());
set_coursemodule_visible($page->coursemodule, 1);
rebuild_course_cache($course->id, true);
$map[$manuals[2]->id]['enabled'] = false;
savecatalog($map);
as_user($users['alice']);
verify(passport::badge_current($manuals[2]->id) === null, 'Disabled Passport mapping hides that collectible');
passport::save_featured_current($featuredids);
// Expiry is a native award field; simulate time passing only in the guarded fixture.
$DB->set_field('badge_issued', 'dateexpire', time() - 1, ['badgeid' => $manuals[1]->id, 'userid' => $USER->id]);
// Direct fixture mutation has no native event; invalidate this request's evidence snapshot.
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
verify(badge_state::get_current($manuals[1]->id)['state'] === 'expired' &&
    !in_array($manuals[1]->id, array_column(passport::collection_current()['featured'], 'badgeid')),
    'Expired native award is labeled and cannot remain featured');
rejected(fn() => passport::save_featured_current([$manuals[1]->id]), 'Expired badge cannot be featured');
$DB->set_field('badge_issued', 'dateexpire', null, ['badgeid' => $manuals[1]->id, 'userid' => $USER->id]);
// Direct fixture mutation has no native event; invalidate this request's evidence snapshot.
if (class_exists(\local_ignite\learner_read_model::class)) { \local_ignite\learner_read_model::invalidate(); }
as_user(get_admin());
(new badge($manuals[2]->id))->delete(true);
as_user($users['alice']);
verify(passport::badge_current($manuals[2]->id) === null, 'Native archived badge is unavailable');
$credentials = $DB->get_records('badge_issued', ['userid' => $users['alice']->id], 'id');
set_config('houses', 1, 'local_ignite');
$hearths = array_values($DB->get_records('local_ignite_house', ['active' => 1]));
houses::set_current((int)$hearths[0]->id);
verify(passport::collection_current()['hearthname'] === $hearths[0]->name, 'Frame reads current configured Hearth name');
as_user(get_admin());
houses::configure((int)$hearths[0]->id, ['name' => 'A renamed Hearth', 'description' => 'Equal opportunity',
    'accent' => '#6741A5', 'emblem' => 'sol', 'active' => 1]);
as_user($users['alice']);
verify(passport::collection_current()['hearthname'] === 'A renamed Hearth' &&
    passport::collection_current()['framecolor'] === '#6741A5', 'Renamed Hearth and configured accent update decoration');
houses::set_current((int)$hearths[1]->id);
houses::set_current(null);
verify(!$DB->record_exists('local_ignite_member', ['userid' => $USER->id]) &&
    $DB->get_records('badge_issued', ['userid' => $USER->id], 'id') == $credentials &&
    count(passport::collection_current()['featured']) === 3, 'Switching and leaving Hearths preserves original credential evidence and featured choices');
set_config('enablebadges', 0);
verify(!passport::collection_current()['nativeenabled'] && badge_state::get_current($first->id) === null, 'Native badges disabled produces a useful learning fallback');
rejected(fn() => passport::save_featured_current([$first->id]), 'Native badges disabled rejects feature writes');
set_config('enablebadges', 1);
as_user(get_admin());
$restrictedrole = create_role('Passport restricted fixture', $tag . '_restricted', '', 'user');
assign_capability('moodle/badges:manageownbadges', CAP_PROHIBIT, $restrictedrole, context_system::instance());
role_assign($restrictedrole, $users['alice']->id, context_system::instance());
as_user($users['alice']);
verify(!passport::collection_current()['canview'] && badge_state::get_current($first->id) === null,
    'Native manage-own-badges capability restriction is respected');
rejected(fn() => passport::save_featured_current([]), 'Restricted user cannot mutate featured choices even with an empty list');
as_user(get_admin());
role_unassign($restrictedrole, $users['alice']->id, context_system::instance()->id);
as_user($users['alice']);
set_config('passport', 0, 'local_ignite');
verify(badge_state::get_current($first->id)['earned'], 'Badge-state integration remains available without Passport feature');
rejected(fn() => passport::collection_current(), 'Passport feature switch enforced');
set_config('passport', 1, 'local_ignite');

// Privacy users with only featured choices must still be discovered, exported and erased while disabled.
as_user(get_admin());
foreach (['bob', 'delete'] as $name) {
    awardmanual($manuals[0], $users[$name]->id, $teacherrole);
    as_user($users[$name]);
    passport::save_featured_current([$manuals[0]->id]);
    as_user(get_admin());
}
$alicecontext = context_user::instance($users['alice']->id);
$bobcontext = context_user::instance($users['bob']->id);
set_config('enabled', 0, 'local_ignite');
verify(in_array($alicecontext->id, provider::get_contexts_for_userid($users['alice']->id)->get_contextids()), 'Privacy discovers feature-only user data while disabled');
$metadata = provider::get_metadata(new \core_privacy\local\metadata\collection('local_ignite'));
verify(count($metadata->get_collection()) === ($integrated ? 6 : 3), 'Privacy metadata describes every integrated personal table');
$list = new userlist($alicecontext, 'local_ignite');
provider::get_users_in_context($list);
verify(array_values($list->get_userids()) === [(int)$users['alice']->id], 'Privacy lists only feature record owner');
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
verify(str_contains($export, 'passportfeatures') && str_contains($export, 'issuedid') && str_contains($export, 'slot'), 'Real privacy ZIP exports featured choices and award-instance references');
provider::delete_data_for_user(new approved_contextlist($users['alice'], 'local_ignite', [$bobcontext->id]));
provider::delete_data_for_users(new approved_userlist($bobcontext, 'local_ignite', [$users['alice']->id]));
verify($DB->count_records('local_ignite_feature', ['userid' => $users['alice']->id]) === 3, 'Unapproved and cross-user privacy deletion cannot erase featured choices');
provider::delete_data_for_user(new approved_contextlist($users['alice'], 'local_ignite', [$alicecontext->id]));
verify(!$DB->record_exists('local_ignite_feature', ['userid' => $users['alice']->id]) &&
    $DB->record_exists('local_ignite_feature', ['userid' => $users['bob']->id]), 'Approved single-user erasure preserves other learners');
verify($DB->get_records('badge_issued', ['userid' => $users['alice']->id], 'id') == $credentials,
    'Ignite privacy erasure leaves native credentials and evidence unchanged');
provider::delete_data_for_users(new approved_userlist($bobcontext, 'local_ignite', [$users['bob']->id]));
verify(!$DB->record_exists('local_ignite_feature', ['userid' => $users['bob']->id]), 'Approved bulk feature erasure works');
provider::delete_data_for_all_users_in_context(context_system::instance());
verify($DB->record_exists('local_ignite_feature', ['userid' => $users['delete']->id]), 'System-context erasure does not erase user-context features');
provider::delete_data_for_all_users_in_context(context_user::instance($users['delete']->id));
verify(!$DB->record_exists('local_ignite_feature', ['userid' => $users['delete']->id]), 'Whole user-context erasure removes featured choices');
set_config('enabled', 1, 'local_ignite');
as_user($users['delete']);
passport::save_featured_current([$manuals[0]->id]);
as_user(get_admin());
delete_user($users['delete']);
verify(!$DB->record_exists('local_ignite_feature', ['userid' => $users['delete']->id]), 'Native account deletion observer erases featured choices');
as_user(core_user::get_user($CFG->siteguest));
rejected(fn() => passport::collection_current(), 'Guest cannot read Passport');

// Leave a real learner collection and empty account for authenticated browser checks.
as_user($users['alice']);
passport::save_featured_current($featuredids);
set_config('houses', 0, 'local_ignite');
echo 'PASSPORT_FIXTURE=' . json_encode(['learner' => $users['alice']->username, 'empty' => $users['empty']->username,
    'badgeid' => $first->id, 'projectid' => $project->id, 'manualid' => $manuals[0]->id]) . "\n";
echo "Passport checks: $checks passed\n";
