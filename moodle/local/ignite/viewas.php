<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

use local_ignite\campfire;
use local_ignite\houses;

\local_ignite\access::administrator();
admin_externalpage_setup('local_ignite_viewas');
$url = new moodle_url('/local/ignite/viewas.php');
if (!\local_ignite\access::enabled('houses')) {
    echo $OUTPUT->header();
    echo $OUTPUT->heading(get_string('viewas', 'local_ignite'));
    echo $OUTPUT->notification(get_string('viewas_off', 'local_ignite'), \core\output\notification::NOTIFY_INFO);
    echo $OUTPUT->footer();
    exit;
}
// Only the staff member's own account changes: houses::set_current() accepts no other learner.
$ids = campfire::ids();
$available = houses::available();
$teams = [];
foreach (campfire::ORDER as $code) {
    if (isset($ids[$code], $available[$ids[$code]])) {
        $teams[$code] = campfire::TEAMS[$code];
    }
}
if (data_submitted()) {
    require_sesskey();
    $team = required_param('team', PARAM_ALPHA);
    if ($team !== 'none' && !isset($teams[$team])) {
        throw new moodle_exception('invalidhearth', 'local_ignite');
    }
    houses::set_current($team === 'none' ? null : (int)$ids[$team]);
    redirect($url, $team === 'none' ? get_string('viewas_now_none', 'local_ignite') :
        get_string('viewas_now_team', 'local_ignite', $teams[$team]), null, \core\output\notification::NOTIFY_SUCCESS);
}
$current = houses::get_current();
$currentcode = $current ? (array_search((int)$current->id, array_map('intval', $ids), true) ?: '') : 'none';
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('viewas', 'local_ignite'));
echo html_writer::tag('p', get_string('viewas_intro', 'local_ignite'));
echo html_writer::tag('p', html_writer::tag('strong', !$current ? get_string('viewas_now_none', 'local_ignite') :
    get_string('viewas_now_team', 'local_ignite', s($teams[$currentcode] ?? $current->name))));
foreach (['none' => get_string('viewas_none', 'local_ignite')] + $teams as $code => $label) {
    $button = new single_button(new moodle_url($url, ['team' => $code]), $label, 'post');
    $button->disabled = $code === $currentcode;
    echo $OUTPUT->render($button);
}
echo html_writer::tag('p', get_string('viewas_open', 'local_ignite') . ' ' .
    html_writer::link(new moodle_url('/local/ignite/passport.php'), get_string('passport', 'local_ignite')) . ' · ' .
    html_writer::link(new moodle_url('/my/'), get_string('home')), ['class' => 'mt-3']);
echo $OUTPUT->footer();
