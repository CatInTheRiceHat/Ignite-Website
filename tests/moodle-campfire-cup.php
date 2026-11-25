<?php
// Start with the real completions, team switch and archived standings in the isolated Moodle fixture.
require __DIR__ . '/moodle-campfire-standings.php';
require_once($CFG->libdir . '/badgeslib.php');
use local_ignite\campfire;
use local_ignite\campfire_cup;
use local_ignite\cup_badges;
use local_ignite\houses;
use local_ignite\passport;
use local_ignite\task\campfire_cups;
use local_ignite\xp;

function issues_for(int $month): array {
    global $DB;
    return $DB->get_records_sql('SELECT i.id, i.userid, i.uniquehash, b.team, b.badgeid
         FROM {badge_issued} i JOIN {local_ignite_cupbadge} b ON b.badgeid = i.badgeid
        WHERE b.earnmonth = ? ORDER BY i.id', [$month]);
}
function join_at($user, string $team, int $time): void {
    global $DB;
    as_learner($user);
    houses::set_current(campfire::ids()[$team]);
    $DB->set_field('local_ignite_history', 'timebegin', $time, ['userid' => $user->id, 'timeend' => 0]);
}
function run_cups(): void {
    as_learner(get_admin());
    (new campfire_cups())->execute();
}

$month = (int)$past->format('Ym');
$first = $empty->modify('-1 month');
$earlier = (int)$first->format('Ym');
set_config('xpstart', $first->getTimestamp(), 'local_ignite');
set_config('enablebadges', 1);
$CFG->enablebadges = 1;
$DB->set_field('local_ignite_history', 'timebegin', $first->getTimestamp(), ['userid' => $users['other']->id, 'timeend' => 0]);
as_learner($users['other']);
complete_at($course, $cmids[1], $first->getTimestamp() + 10);
as_learner(get_admin());
$forge = $generator->create_user();
$generator->enrol_user($forge->id, $course->id, 'student');
join_at($forge, 'forgelings', $first->getTimestamp());
set_config('xpaward', 15, 'local_ignite');
complete_at($course, $cmids[1], $first->getTimestamp() + 10);

as_learner(get_admin());
$extra = [];
foreach (['dual', 'candle', 'lantern'] as $key) {
    $extra[$key] = $generator->create_user();
    $generator->enrol_user($extra[$key]->id, $course->id, 'student');
}
join_at($extra['dual'], 'lanternlings', $past->getTimestamp());
houses::set_current($ids['candlelings']);
$DB->set_field('local_ignite_history', 'timeend', $mid, ['userid' => $extra['dual']->id, 'houseid' => $ids['lanternlings']]);
$DB->set_field('local_ignite_history', 'timebegin', $mid, ['userid' => $extra['dual']->id, 'houseid' => $ids['candlelings']]);
complete_at($course, $cmids[0], $mid - 1);
complete_at($course, $cmids[1], $mid);
$xpcount = $DB->count_records('local_ignite_xp');
run_cups();

$pastissues = issues_for($month);
$byteam = array_column($pastissues, 'team', 'userid');
$winissues = issues_for($earlier);
check(count($winissues) === 1 && reset($winissues)->team === 'lanternlings',
    'A positive outright winner receives the dated team trophy and native badge');
check(count(campfire_cup::trophies($ids['lanternlings'])) === 2 && count(campfire_cup::trophies($ids['candlelings'])) === 1,
    'A team can win trophies in two different months');
check(count($pastissues) === 3 && $byteam[$users['switch']->id] === 'candlelings' &&
    $byteam[$users['other']->id] === 'lanternlings', 'Both co-champions issue badges including to a student who switched away');
check($byteam[$extra['dual']->id] === 'candlelings' && count(array_unique(array_column($pastissues, 'userid'))) === 3,
    'A student who helped both co-champions receives exactly one monthly Cup');
$zero = $DB->get_record('local_ignite_cup', ['earnmonth' => (int)$empty->format('Ym')], '*', MUST_EXIST);
check(!campfire::winners(json_decode($zero->totals, true)) && !issues_for((int)$zero->earnmonth),
    'The all-zero month is finalized with no champion or recipients');
check(!$DB->record_exists('local_ignite_cup', ['earnmonth' => (int)$current->format('Ym')]), 'The open month is never finalized');
as_learner($users['other']);
$collection = cup_badges::owned_current();
check(count($collection) === 2 && count(array_unique(array_column($collection, 'earnmonth'))) === 2,
    'Repeat winner has two separately dated native collectibles');
as_learner($users['switch']);
$collection = cup_badges::owned_current();
$card = passport::badge_current((int)array_key_first($collection), false);
check($card['name'] === 'Campfire Cup · ' . $past->format('F Y') && $card['imageurl'] &&
    str_contains($card['caption'], 'positive net Team XP to the Candlelings') && xp::profile_current()->xp === 55 &&
    $DB->count_records('local_ignite_xp') === $xpcount, 'My Hearth uses native artwork, earning reason and exact month title with zero XP');
$initial = issues_for($month);
run_cups();
check(issues_for($month) == $initial, 'Rerunning the task preserves every existing native issuance and hash');

// Two delayed positive contributions keep the tie. Pause the second native definition after prior awards.
set_config('xpaward', 20, 'local_ignite');
join_at($extra['candle'], 'candlelings', $past->getTimestamp());
complete_at($course, $cmids[0], $mid);
join_at($extra['lantern'], 'lanternlings', $past->getTimestamp());
complete_at($course, $cmids[0], $mid);
as_learner(get_admin());
$badge = new \core_badges\badge($DB->get_field('local_ignite_cupbadge', 'badgeid', ['earnmonth' => $month, 'team' => 'lanternlings']));
$badge->set_status(BADGE_STATUS_INACTIVE_LOCKED);
try {
    run_cups();
    throw new RuntimeException('Expected Moodle issuance to fail');
} catch (moodle_exception $error) {
    check($error->errorcode === 'cupissuance', 'A failed native issuance is surfaced for retry');
}
$partial = issues_for($month);
check(count($partial) === 4 && in_array($extra['candle']->id, array_column($partial, 'userid')) &&
    !in_array($extra['lantern']->id, array_column($partial, 'userid')), 'Awards committed before the interruption survive');
$badge->set_status(BADGE_STATUS_ACTIVE_LOCKED);
run_cups();
$finished = issues_for($month);
check(count($finished) === 5 && $partial == array_intersect_key($finished, $partial),
    'Retry issues the missing badge and preserves previous native issue IDs and hashes');

// Simulate Moodle's bulk completion reset, which does not emit individual reversal events.
$DB->delete_records('course_modules_completion', ['coursemoduleid' => $cmids[1], 'userid' => $users['other']->id]);
run_cups();
$held = $DB->get_record('local_ignite_cup', ['earnmonth' => $earlier], '*', MUST_EXIST);
$heldissues = issues_for($earlier);
check($held->reviewneeded && campfire::winners(json_decode($held->totals, true)) === ['lanternlings'] &&
    reset($heldissues)->team === 'lanternlings', 'Reconciled XP flags a changed published winner and preserves the original badge pending review');
as_learner($users['other']);
$reviewboard = campfire::standings($first->format('Y-m'));
check($reviewboard['reviewneeded'] && $reviewboard['rows'][0]['name'] === 'Lanternlings' && $reviewboard['rows'][0]['trophy'],
    'The archived leaderboard shows the published result during review');
as_learner(get_admin());
try {
    campfire_cup::finalize($earlier, str_repeat('0', 64));
    throw new RuntimeException('Stale approval accepted');
} catch (moodle_exception $error) {
    check($error->errorcode === 'cupstale', 'A stale correction cannot overwrite a newer result');
}
campfire_cup::finalize($earlier, campfire_cup::result($earlier)['fingerprint']);
$corrected = issues_for($earlier);
check(count($corrected) === 1 && reset($corrected)->userid == $forge->id &&
    reset($corrected)->team === 'forgelings' && count(campfire_cup::trophies($ids['forgelings'])) === 1 &&
    !$DB->get_field('local_ignite_cup', 'reviewneeded', ['earnmonth' => $earlier]),
    'Approving the correction moves the trophy, revokes old ownership and issues the corrected recipient');
foreach ($DB->get_fieldset_select('local_ignite_cupbadge', 'badgeid', 'earnmonth = ?', [$earlier]) as $badgeid) {
    $nativetask = new \core\task\badges_adhoc_task();
    $nativetask->set_custom_data(['badgeid' => $badgeid]);
    $nativetask->execute();
}
run_cups();
check(issues_for($earlier) == $corrected && issues_for($month) == $finished,
    'Native badges cron and repeated Cup finalization preserve corrected ownership');

if (getenv('IGNITE_CUP_WEB_REVIEW')) {
    // Prepare a further late completion for the authenticated correction form in the browser suite.
    as_learner($users['other']);
    complete_at($course, $cmids[2], $first->getTimestamp() + 30);
    run_cups();
    check((bool)$DB->get_field('local_ignite_cup', 'reviewneeded', ['earnmonth' => $earlier]),
        'A subsequent change appears in the administrator correction queue');
}
