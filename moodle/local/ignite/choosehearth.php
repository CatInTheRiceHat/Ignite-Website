<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('houses');
$return = \local_ignite\hearth_ui::return_url(optional_param('returnurl', '', PARAM_RAW));
$selected = optional_param('hearthid', 0, PARAM_INT);
$confirm = optional_param('confirm', 0, PARAM_BOOL);
$current = \local_ignite\houses::get_current();
$available = \local_ignite\houses::available();
$challenge = \local_ignite\challenges::current();
$PAGE->set_url('/local/ignite/choosehearth.php', ['returnurl' => $return->out(false)]);
$PAGE->set_context(context_system::instance());
$PAGE->set_title(get_string('choosehearth', 'local_ignite'));
$PAGE->set_heading(get_string('choosehearth', 'local_ignite'));
$PAGE->requires->css('/local/ignite/hearths.css');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_sesskey();
    if (optional_param('defer', 0, PARAM_BOOL)) {
        // Choosing later leaves existing membership and onboarding state intact.
        redirect($return);
    }
    if (!isset($available[$selected])) {
        throw new moodle_exception('invalidhearth', 'local_ignite');
    }
    if ($confirm) {
        \local_ignite\houses::set_current($selected);
        redirect($return, get_string('hearthjoined', 'local_ignite'), null, \core\output\notification::NOTIFY_SUCCESS);
    }
}
$data = ['action' => $PAGE->url->out(false), 'sesskey' => sesskey(), 'cards' => [],
    'hascards' => (bool)$available, 'switching' => (bool)$current,
    'challenge' => $challenge ? $challenge->name : '',
    'continueurl' => (new moodle_url('/local/ignite/index.php'))->out(false)];
// Confirmation is a separate POST step; a GET can never join/switch.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $selected && !$confirm) {
    $data['confirmation'] = true;
    $data['selected'] = $selected;
    $data['selectedname'] = $available[$selected]->name;
} else {
    foreach ($available as $house) {
        $card = \local_ignite\hearth_ui::identity($house);
        $card['current'] = $current && (int)$current->id === (int)$house->id;
        $data['cards'][] = $card;
    }
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/choosehearth', $data);
echo $OUTPUT->footer();
