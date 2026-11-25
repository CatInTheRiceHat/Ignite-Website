<?php
// Native Moodle integration fixture. Run on a disposable, loopback-only site.
if (PHP_SAPI !== 'cli' || $argc !== 2) {
    exit("Supply the isolated Moodle installation root.\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_starts_with($CFG->dbname, 'ignite_lms_test_final_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:879') ||
        !str_starts_with($CFG->dataroot, '/tmp/ignite-final-runtime/')) {
    throw new RuntimeException('Private integration fixture required');
}
require_once($CFG->libdir . '/testing/generator/lib.php');
require_once($CFG->libdir . '/completionlib.php');
use local_ignite\campfire;
use local_ignite\houses;
use local_ignite\xp;

function check(bool $ok, string $message): void {
    if (!$ok) {
        throw new RuntimeException($message);
    }
    echo "PASS $message\n";
}
function as_learner(stdClass $user): void {
    core\session\manager::set_user($user);
    $_POST = ['sesskey' => sesskey()];
}
function complete_at($course, $cmid, int $time): void {
    global $USER;
    $cm = get_fast_modinfo($course)->get_cm($cmid);
    $completion = new completion_info($course);
    $data = $completion->get_data($cm, false, $USER->id);
    $data->completionstate = COMPLETION_COMPLETE;
    $data->timemodified = $time;
    $completion->internal_set_data($cm, $data);
}

as_learner(get_admin());
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/passport.php');
foreach (['enabled', 'houses', 'passport'] as $flag) {
    set_config($flag, 1, 'local_ignite');
}
set_config('onboarding', 0, 'local_ignite');
set_config('enablecompletion', 1);
$CFG->enablecompletion = 1;
$ids = campfire::ids();
check(count(array_unique($ids)) === 3 && count(houses::available()) === 3, 'All three Campfires are available to join');
if ($legacy = json_decode(get_config('local_ignite', 'upgradeboardfixture') ?: 'null')) {
    $legacy->earnmonth = 202608;
    check($DB->get_record('local_ignite_xp', ['id' => $legacy->id]) == $legacy &&
        $ids['candlelings'] === (int)$legacy->houseid, 'Upgrade corrects the Pacific month and reuses the original team ID and award');
}
foreach (['2026-03-01 08:00:00 UTC' => '2026-03', '2026-07-01 07:00:00 UTC' => '2026-07'] as $utc => $month) {
    $when = strtotime($utc);
    check(campfire::period($when)->format('Y-m') === $month &&
        campfire::period($when - 1)->format('Y-m') !== $month, "Pacific midnight boundary at $utc");
}
$current = campfire::period(time());
$past = $current->modify('-1 month');
$empty = $past->modify('-1 month');
set_config('xpstart', $empty->getTimestamp(), 'local_ignite');
$generator = new testing_data_generator();
$tag = 'campfire_' . bin2hex(random_bytes(4));
$course = $generator->create_course(['shortname' => $tag, 'enablecompletion' => 1]);
$users = [];
foreach (['switch', 'other', 'solo'] as $key) {
    $user = $generator->create_user(['username' => $tag . '_' . $key, 'password' => 'FixtureOnly!4829aZ',
        'firstname' => 'Campfire', 'lastname' => $key, 'policyagreed' => 1]);
    $generator->enrol_user($user->id, $course->id, 'student');
    $users[$key] = $user;
}
$cmids = [];
foreach (['First practice', 'Second practice', 'Third practice'] as $name) {
    $cmids[] = (int)$generator->create_module('page', ['course' => $course->id, 'name' => $name, 'completion' => 1])->cmid;
}
set_config('heatconfig', json_encode(['thresholds' => [0,1,3,6,10], 'milestones' => array_fill_keys($cmids, 'complete')]), 'local_ignite');
as_learner($users['switch']);
houses::set_current($ids['candlelings']);
houses::set_current($ids['forgelings']);
// Move the two real membership intervals to last month, then deliver the native events out of order.
$mid = $past->modify('+14 days')->getTimestamp();
$DB->set_field('local_ignite_history', 'timebegin', $past->getTimestamp(), ['userid' => $USER->id, 'houseid' => $ids['candlelings']]);
$DB->set_field('local_ignite_history', 'timeend', $mid, ['userid' => $USER->id, 'houseid' => $ids['candlelings']]);
$DB->set_field('local_ignite_history', 'timebegin', $mid, ['userid' => $USER->id, 'houseid' => $ids['forgelings']]);
set_config('xpaward', 20, 'local_ignite');
complete_at($course, $cmids[0], $mid - 1);
complete_at($course, $cmids[2], $current->getTimestamp());
set_config('xpaward', 15, 'local_ignite');
complete_at($course, $cmids[1], $current->getTimestamp() - 1);
as_learner($users['other']);
houses::set_current($ids['lanternlings']);
$DB->set_field('local_ignite_history', 'timebegin', $past->getTimestamp(), ['userid' => $USER->id, 'timeend' => 0]);
set_config('xpaward', 20, 'local_ignite');
complete_at($course, $cmids[0], $mid);
as_learner($users['solo']);
complete_at($course, $cmids[0], time());
$receipt = xp::receipts([$cmids[0]])[$cmids[0]];
check($receipt['label'] === '+20 Regular XP' && !empty($receipt['chooseurl']), 'Teamless completion gives the real award and chooser');
as_learner(get_admin());
set_config('enablebadges', 1);
$CFG->enablebadges = 1;
(new \local_ignite\task\campfire_cups())->execute();
as_learner($users['switch']);
$board = campfire::standings($past->format('Y-m'));
$rows = array_column($board['rows'], null, 'name');
check(array_column($board['rows'], 'rank') === [1, 1, 3] && $rows['Candlelings']['champion'] &&
    $rows['Lanternlings']['champion'] && !$rows['Forgelings']['champion'], 'Equal positive totals share first place and the championship');
check($rows['Candlelings']['own'] === '10' && $rows['Forgelings']['own'] === '7.5' && $rows['Lanternlings']['own'] === '0',
    'Mid-month switch splits own contribution using earning time and excludes other learners');
check($rows['Forgelings']['total'] === '7.5' && $rows['Candlelings']['total'] === '10', 'Delayed XP is included in the archived month');
$board = campfire::standings();
$nowrows = array_column($board['rows'], null, 'name');
check($nowrows['Forgelings']['own'] === '10' && $nowrows['Candlelings']['own'] === '0' &&
    !in_array(true, array_column($board['rows'], 'champion'), true), 'Midnight starts new standings without declaring a current-month champion');
$zero = campfire::standings($empty->format('Y-m'));
check($zero['empty'] && array_column($zero['rows'], 'rank') === [1,1,1] &&
    !in_array(true, array_column($zero['rows'], 'champion'), true), 'A scoreless archived month has three teams and no champion');
$progress = xp::profile_current();
check($progress->xp === 55 && $progress->level === 1 && $progress->withinlevel === 55 &&
    $progress->levelstep === 100, 'Lifetime Regular XP and next-level progress carry across the month');
check(xp::receipts([$cmids[0]])[$cmids[0]]['label'] === '+20 Regular XP · +10 Team XP for the Candlelings',
    'The completion receipt names the team that received the original credit');
echo 'BOARD_FIXTURE=' . json_encode(['user' => $users['switch']->username, 'solo' => $users['solo']->username,
    'cmid' => $cmids[0], 'manualcmid' => $cmids[2], 'past' => $past->format('Y-m'), 'empty' => $empty->format('Y-m')]) . "\n";
