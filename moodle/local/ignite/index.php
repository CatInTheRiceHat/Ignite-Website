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
$PAGE->requires->css(new moodle_url('/local/ignite/styles.css'));
$data = \local_ignite\home::data();
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/home', $data);
echo $OUTPUT->footer();
