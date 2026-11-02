<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('passport');
$id = required_param('id', PARAM_INT);
$PAGE->set_context(context_user::instance($USER->id));
$PAGE->set_url(new moodle_url('/local/ignite/badge.php', ['id' => $id]));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('passport', 'local_ignite'));
$PAGE->set_heading(get_string('passport', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/passport.css'));
$data = \local_ignite\passport::badge_current($id);
if (!$data) {
    throw new moodle_exception('passport_unavailable', 'local_ignite', new moodle_url('/local/ignite/passport.php'));
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/passport_badge', $data);
echo $OUTPUT->footer();
