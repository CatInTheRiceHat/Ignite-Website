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
$PAGE->requires->css(new moodle_url('/local/ignite/' . ($isdashboard ? 'dashboard.css' : 'styles.css')));
$data = $isdashboard ? \local_ignite\dashboard::data() : \local_ignite\home::data();
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/' . ($isdashboard ? 'dashboard' : 'home'), $data);
if (!empty($data['showinvitation']) || !empty($data['offer'])) {
    \local_ignite\invitations::shown();
}
echo $OUTPUT->footer();
