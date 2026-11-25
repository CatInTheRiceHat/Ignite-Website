<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('passport');
$PAGE->set_context(context_user::instance($USER->id));
$month = optional_param('month', '', PARAM_RAW_TRIMMED);
$browse = optional_param('browse', false, PARAM_BOOL);
$params = $month === '' ? [] : ['month' => $month];
if ($browse) {
    $params['browse'] = 1;
}
$PAGE->set_url('/local/ignite/passport.php', $params);
$PAGE->set_pagelayout('standard');
$PAGE->add_body_class('ignite-campfire-page');
$PAGE->requires->css(new moodle_url('/local/ignite/campfire-page.css', ['rev' => filemtime(__DIR__ . '/campfire-page.css')]));
$template = 'local_ignite/passport';
$PAGE->set_title(get_string('passport', 'local_ignite'));
$PAGE->set_heading(get_string('passport', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/passport.css'));
$data = \local_ignite\passport::collection_current();
$data['standings'] = \local_ignite\campfire::standings($month);
if (!$browse && $month === '' && $data['standings']['chooseurl']) {
    $available = \local_ignite\houses::available();
    if ($available) {
        $PAGE->requires->css(new moodle_url('/local/ignite/hearths.css', ['rev' => filemtime(__DIR__ . '/hearths.css')]));
        $current = \local_ignite\houses::get_current();
        $choice = ['action' => $data['standings']['chooseurl'], 'sesskey' => sesskey()];
        if ($current) {
            $data['teamintro'] = $choice + ['cards' => \local_ignite\hearth_ui::choice_cards($available)];
        } else {
            $slides = \local_ignite\hearth_ui::preview_slides($available);
            if ($slides) {
                $PAGE->requires->js('/local/ignite/hearth-carousel.js');
                $PAGE->add_body_class('ignite-campfire-choosing');
                $template = 'local_ignite/campfire_chooser';
                $data = $choice + ['slides' => $slides];
            }
        }
    }
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template($template, $data);
echo $OUTPUT->footer();
