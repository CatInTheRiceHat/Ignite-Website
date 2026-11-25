<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

use local_ignite\campfire;
use local_ignite\campfire_cup;

\local_ignite\access::administrator();
admin_externalpage_setup('local_ignite_cupreview');
$url = new moodle_url('/local/ignite/cupreview.php');
if (data_submitted()) {
    require_sesskey();
    $month = required_param('month', PARAM_INT);
    $fingerprint = required_param('fingerprint', PARAM_ALPHANUM);
    \local_ignite\xp::reconcile();
    campfire_cup::finalize($month, $fingerprint);
    redirect($url, get_string('changessaved'));
}
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('cupreview', 'local_ignite'));
$reviews = $DB->get_records('local_ignite_cup', ['reviewneeded' => 1], 'earnmonth DESC');
if (!$reviews) {
    echo html_writer::tag('p', get_string('cupreviewempty', 'local_ignite'));
}
foreach ($reviews as $published) {
    $month = (int)$published->earnmonth;
    $result = campfire_cup::result($month);
    $before = campfire::winners(json_decode($published->totals, true));
    echo $OUTPUT->heading(campfire_cup::title($month), 3);
    foreach (['cuppublished' => $before, 'cupcorrected' => $result['winners']] as $label => $teams) {
        $names = array_map(static fn($team) => campfire::TEAMS[$team], $teams);
        echo html_writer::tag('p', html_writer::tag('strong', get_string($label, 'local_ignite')) . ' · ' .
            ($names ? implode(', ', $names) : get_string('cupnone', 'local_ignite')));
    }
    echo html_writer::tag('p', get_string('cuprecipientcount', 'local_ignite', count($result['recipients'])));
    $action = new moodle_url($url, ['month' => $month, 'fingerprint' => $result['fingerprint']]);
    echo $OUTPUT->single_button($action, get_string('cupapprove', 'local_ignite'), 'post');
}
echo $OUTPUT->footer();
