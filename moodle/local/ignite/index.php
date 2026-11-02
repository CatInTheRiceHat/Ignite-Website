<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');

require_login();
if (!\local_ignite\access::enabled()) {
    // Keep bookmarks useful without creating a redirect loop or changing user preferences.
    redirect(new moodle_url('/my/'));
}
\local_ignite\access::learner();
$PAGE->set_context(context_system::instance());
$PAGE->set_url(new moodle_url('/local/ignite/index.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('pluginname', 'local_ignite'));
$PAGE->set_heading(get_string('homeheading', 'local_ignite'));
$isdashboard = \local_ignite\access::enabled('dashboard');
if ($isdashboard) { $PAGE->add_body_class('ignite-learner-home'); }
$PAGE->requires->css(new moodle_url('/local/ignite/' . ($isdashboard ? 'dashboard.css' : 'styles.css')));
$data = $isdashboard ? \local_ignite\dashboard::data() : \local_ignite\home::data();
// Reuse the installed Timeline block's renderable, preferences, AMD and native action-event APIs.
// The native Dashboard keeps its own Timeline block; only the standalone home embeds it here.
if ($isdashboard && $DB->record_exists('block', ['name' => 'timeline', 'visible' => 1]) &&
        has_capability('moodle/block:view', context_user::instance($USER->id))) {
    $timeline = new \block_timeline\output\main(get_user_preferences('block_timeline_user_sort_preference'),
        get_user_preferences('block_timeline_user_filter_preference'), get_user_preferences('block_timeline_user_limit_preference'));
    $data['timeline'] = $PAGE->get_renderer('block_timeline')->render($timeline);
    $data['timelinetitle'] = get_string('pluginname', 'block_timeline');
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/' . ($isdashboard ? 'dashboard' : 'home'), $data);
if (!empty($data['showinvitation']) || !empty($data['offer'])) {
    \local_ignite\invitations::shown();
}
echo $OUTPUT->footer();
