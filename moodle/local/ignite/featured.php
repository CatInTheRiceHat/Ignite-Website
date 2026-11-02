<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('passport');
$PAGE->set_context(context_user::instance($USER->id));
$PAGE->set_url(new moodle_url('/local/ignite/featured.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('passport_featuretitle', 'local_ignite'));
$PAGE->set_heading(get_string('passport_featuretitle', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/passport.css'));
$collection = \local_ignite\passport::collection_current();
if (!$collection['canview']) {
    redirect(new moodle_url('/local/ignite/passport.php'));
}
$options = [];
foreach ($collection['earned'] as $card) {
    if ($card['featureable']) {
        $options[$card['badgeid']] = $card['name'];
    }
}
$form = new \local_ignite\form\featured(null, ['options' => $options]);
$returnurl = new moodle_url('/local/ignite/passport.php');
if ($form->is_cancelled()) {
    redirect($returnurl);
}
if ($data = $form->get_data()) {
    try {
        \local_ignite\passport::save_featured_current($data->badgeids ?? []);
        redirect($returnurl);
    } catch (invalid_parameter_exception $e) {
        // An award may have become unavailable between form validation and the locked save.
        \core\notification::error(get_string('passport_invalidfeature', 'local_ignite'));
    }
}
$form->set_data((object)['badgeids' => array_column($collection['featured'], 'badgeid')]);
echo $OUTPUT->header();
echo html_writer::start_div('ignite-passport');
echo html_writer::link($returnurl, get_string('passport_back', 'local_ignite'));
if (!$options) {
    echo html_writer::tag('p', get_string('passport_noeligible', 'local_ignite'));
}
$form->display();
echo html_writer::end_div();
echo $OUTPUT->footer();
