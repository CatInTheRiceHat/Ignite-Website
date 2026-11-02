<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
if (!\local_ignite\access::enabled('onboarding')) {
    redirect(new moodle_url('/local/ignite/index.php'));
}
\local_ignite\access::learner('onboarding');
$edit = optional_param('edit', false, PARAM_BOOL);
$step = $edit ? 'interests' : \local_ignite\onboarding::step();
$prefs = \local_ignite\preferences::get_current();
$recommendations = $step === 'path' ? \local_ignite\recommendations::current() : [];
$starter = $step === 'finish' ? \local_ignite\recommendations::starter_target() : null;
$selected = $step === 'finish' && !empty($prefs->targetkey) ?
    \local_ignite\recommendations::target($prefs->targetkey) : null;
$startlabel = $starter ? get_string('startchallenge', 'local_ignite') :
    ($selected ? $selected['action'] : get_string('explorecourses', 'local_ignite'));
$url = new moodle_url('/local/ignite/onboarding.php', $edit ? ['edit' => 1] : []);
$form = new \local_ignite\form\onboarding($url, compact('step', 'prefs', 'recommendations', 'edit', 'starter', 'startlabel'));
if ($data = $form->get_data()) {
    $action = null;
    foreach (['next', 'back', 'skip', 'start', 'home', 'saveinterests', 'visit'] as $candidate) {
        if (!empty($data->$candidate)) {
            $action = $candidate;
            break;
        }
    }
    $values = [];
    if ($step === 'interests') {
        $values['interests'] = array_values(array_filter(\local_ignite\onboarding::INTERESTS,
            static fn($key) => !empty($data->{'interest_' . $key})));
    } else if ($step === 'goal') {
        $values['goals'] = $data->goals ?? '';
    } else if ($step === 'path') {
        $values['targetkey'] = $data->targetkey ?? '';
    }
    $destination = \local_ignite\onboarding::save($action ?? '', $data->step, $values, $edit);
    redirect($destination ?? $url);
}
$PAGE->set_context(context_system::instance());
$PAGE->set_url($url);
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('walkthrough', 'local_ignite'));
$PAGE->set_heading(get_string('walkthrough', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/styles.css'));
$PAGE->requires->css(new moodle_url('/local/ignite/onboarding.css'));
echo $OUTPUT->header();
echo html_writer::start_div('ignite-home ignite-walk');
if (!$edit) {
    echo html_writer::start_tag('ol', ['class' => 'ignite-walk__steps',
        'aria-label' => get_string('walkthroughprogress', 'local_ignite')]);
    foreach (\local_ignite\onboarding::steps() as $item) {
        echo html_writer::tag('li', s(get_string('step_' . $item, 'local_ignite')),
            $step === $item ? ['aria-current' => 'step'] : []);
    }
    echo html_writer::end_tag('ol');
}
echo html_writer::start_div('ignite-home__card');
echo html_writer::tag('h2', get_string($edit ? 'editinterests' : 'heading_' . $step, 'local_ignite'));
if ($step === 'welcome') {
    echo html_writer::empty_tag('img', ['src' => $OUTPUT->image_url('sol', 'local_ignite'), 'alt' => '',
        'width' => 120, 'height' => 120]);
    echo html_writer::tag('p', get_string('walkthroughintro', 'local_ignite'));
}
if ($step === 'hearth') {
    \local_ignite\invitations::shown();
}
$form->display();
echo html_writer::end_div();
echo html_writer::tag('p', html_writer::link(new moodle_url('/local/ignite/tour.php'), get_string('help', 'local_ignite')) .
    ' · ' . html_writer::link(new moodle_url('/local/ignite/index.php'), get_string('gotoignitehome', 'local_ignite')));
echo html_writer::end_div();
echo $OUTPUT->footer();
