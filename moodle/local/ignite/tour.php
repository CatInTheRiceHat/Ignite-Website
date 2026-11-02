<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('onboarding');
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/tour.php');
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('help', 'local_ignite'));
$PAGE->set_heading(get_string('help', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/styles.css'));
echo $OUTPUT->header();
echo html_writer::start_div('ignite-home');
echo html_writer::tag('h2', get_string('tourheading', 'local_ignite'));
foreach (['tourlearning', 'tourinterests', 'tourhearths', 'tourprogress'] as $key) {
    echo html_writer::tag('p', get_string($key, 'local_ignite'));
}
echo html_writer::tag('p', html_writer::link(new moodle_url('/course/index.php'), get_string('explorecourses', 'local_ignite')));
echo html_writer::tag('p', html_writer::link(new moodle_url('/local/ignite/onboarding.php', ['edit' => 1]),
    get_string('editinterests', 'local_ignite')));
echo html_writer::tag('p', html_writer::link(new moodle_url('/local/ignite/index.php'), get_string('gotoignitehome', 'local_ignite')));
echo html_writer::end_div();
echo $OUTPUT->footer();
