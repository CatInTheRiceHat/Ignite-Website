<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
if (!\local_ignite\access::enabled('onboarding')) {
    redirect(new moodle_url('/local/ignite/index.php'));
}
\local_ignite\access::learner('onboarding');
$homeurl = new moodle_url('/local/ignite/index.php');
$canoffer = \local_ignite\invitations::can_offer();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_sesskey();
    $action = required_param('action', PARAM_ALPHA);
    if ($action === 'defer') {
        \local_ignite\invitations::defer();
        redirect($homeurl);
    } else if ($action === 'visit' && $canoffer) {
        $destination = \local_ignite\onboarding_config::selection_url();
        $destination->param('returnurl', $homeurl->out(false));
        redirect($destination);
    } else {
        throw new invalid_parameter_exception('Invitation unavailable');
    }
}
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/invitation.php');
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('hearthinvitation', 'local_ignite'));
$PAGE->set_heading(get_string('hearthinvitation', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/styles.css'));
echo $OUTPUT->header();
echo html_writer::start_div('ignite-home');
if ($canoffer) {
    \local_ignite\invitations::shown();
    echo html_writer::tag('p', get_string('hearthinviteintro', 'local_ignite'));
    echo html_writer::start_tag('form', ['method' => 'post', 'action' => $PAGE->url]);
    echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]);
    echo html_writer::tag('button', get_string('meethearths', 'local_ignite'),
        ['type' => 'submit', 'name' => 'action', 'value' => 'visit', 'class' => 'btn btn-primary']);
    echo ' ' . html_writer::tag('button', get_string('chooselater', 'local_ignite'),
        ['type' => 'submit', 'name' => 'action', 'value' => 'defer', 'class' => 'btn btn-secondary']);
    echo html_writer::end_tag('form');
} else {
    echo html_writer::tag('p', get_string('invitationunavailable', 'local_ignite'));
}
echo html_writer::tag('p', html_writer::link($homeurl, get_string('gotoignitehome', 'local_ignite')));
echo html_writer::end_div();
echo $OUTPUT->footer();
