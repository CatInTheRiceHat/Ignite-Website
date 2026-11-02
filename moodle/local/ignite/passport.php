<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('passport');
$PAGE->set_context(context_user::instance($USER->id));
$PAGE->set_url(new moodle_url('/local/ignite/passport.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('passport', 'local_ignite'));
$PAGE->set_heading(get_string('passport', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/passport.css'));
$data = \local_ignite\passport::collection_current();
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/passport', $data);
echo $OUTPUT->footer();
