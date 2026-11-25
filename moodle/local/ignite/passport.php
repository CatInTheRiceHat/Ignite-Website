<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('passport');
$PAGE->set_context(context_user::instance($USER->id));
$month = optional_param('month', '', PARAM_RAW_TRIMMED);
$PAGE->set_url('/local/ignite/passport.php', $month === '' ? [] : ['month' => $month]);
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('passport', 'local_ignite'));
$PAGE->set_heading(get_string('passport', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/passport.css'));
$data = \local_ignite\passport::collection_current();
$data['standings'] = \local_ignite\campfire::standings($month);
if ($month === '' && $data['standings']['chooseurl']) {
    $available = \local_ignite\houses::available();
    if ($available) {
        $PAGE->requires->css('/local/ignite/hearths.css');
        $current = \local_ignite\houses::get_current();
        if (!$current) {
            $PAGE->requires->js('/local/ignite/hearth-carousel.js');
        }
        $data['teamintro'] = ['carousel' => !$current,
            'cards' => $current ? \local_ignite\hearth_ui::choice_cards($available) : [],
            'slides' => $current ? [] : \local_ignite\hearth_ui::preview_slides($available),
            'action' => $data['standings']['chooseurl'], 'sesskey' => sesskey()];
    }
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/passport', $data);
echo $OUTPUT->footer();
