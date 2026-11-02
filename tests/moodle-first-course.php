<?php
// Read-only checks against Moodle's real enrollment and capability decisions.
if (PHP_SAPI !== 'cli' || $argc !== 2) {
    exit("Usage: php moodle-first-course.php MOODLE_ROOT\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';

function check_first_course(bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$transaction = $DB->start_delegated_transaction();
if ($DB->get_dbfamily() === 'postgres') {
    $DB->execute('SET TRANSACTION READ ONLY');
}

$users = $DB->get_records_select('user', 'deleted = 0 AND suspended = 0 AND id <> :guest',
    ['guest' => $CFG->siteguest], 'id');
$cases = [];
foreach ($users as $user) {
    if (is_siteadmin($user)) {
        continue;
    }
    \core\session\manager::set_user($user);
    if (enrol_get_all_users_courses($user->id, true)) {
        $kind = 'enrolled';
    } else {
        $kind = has_capability('moodle/course:create', context_system::instance()) ? 'creator' : 'learner';
    }
    $cases[$kind] ??= $user;
    if (count($cases) === 3) {
        break;
    }
}
check_first_course(count($cases) === 3, 'Checks require existing empty learner, empty creator, and enrolled accounts.');

foreach ($cases as $kind => $user) {
    \core\session\manager::set_user($user);
    $PAGE = new moodle_page();
    $PAGE->set_context(context_system::instance());
    $PAGE->set_url('/my/index.php');
    $PAGE->set_pagetype('my-index');
    $PAGE->set_pagelayout('mydashboard');
    $renderer = $PAGE->get_renderer('block_myoverview');
    $main = new \block_myoverview\output\main(null, null, null, null, null);
    $html = $renderer->render($main);

    if ($kind === 'enrolled') {
        check_first_course(!str_contains($html, 'ignite-first-course'), 'Enrolled users must retain the course list.');
        check_first_course(str_contains($html, 'data-region="courses-view"'), 'The native enrolled course list is missing.');
    } else {
        check_first_course(str_contains($html, 'Add your first course'), 'The empty-course heading is missing.');
        check_first_course(str_contains($html, '/mascots/Puzzled.png'), 'The question mascot is missing.');
        check_first_course(str_contains($html, $CFG->wwwroot . '/course/index.php'), 'The catalog action is missing.');
        check_first_course(str_contains($html, '/course/edit.php') === ($kind === 'creator'),
            'Course creation must follow the native Moodle capability check.');
    }

    $filtered = $renderer->render_from_template('core_course/no-courses', ['nocoursesimg' => '', 'newcourseurl' => '']);
    check_first_course(!str_contains($filtered, 'ignite-first-course'), 'A filtered empty list must not show onboarding.');
}

$path = \core\output\mustache_template_finder::get_template_filepath('block_myoverview/zero-state', 'boost');
check_first_course($path === $CFG->dirroot . '/theme/boost/templates/block_myoverview/zero-state.mustache',
    'Moodle did not select the managed Boost override.');
$transaction->allow_commit();
echo "First-course checks passed: empty learner, empty creator, enrolled account, filtered results, and template resolution.\n";
