<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('houses');
$PAGE->set_url('/local/ignite/hearth.php');
$PAGE->set_context(context_system::instance());
$PAGE->set_title(get_string('hearthhub', 'local_ignite'));
$PAGE->set_heading(get_string('hearthhub', 'local_ignite'));
$PAGE->requires->css('/local/ignite/hearths.css');
$house = \local_ignite\houses::get_current();
$challenge = \local_ignite\challenges::current();
$data = ['house' => $house ? \local_ignite\hearth_ui::identity($house) : null,
    'chooseurl' => (new moodle_url('/local/ignite/choosehearth.php', ['returnurl' => '/local/ignite/hearth.php']))->out(false),
    'homeurl' => (new moodle_url('/local/ignite/index.php'))->out(false),
    'coursesurl' => (new moodle_url('/course/index.php'))->out(false)];
if ($house && $challenge) {
    $progress = \local_ignite\challenges::progress((int)$challenge->id, (int)$house->id);
    $fillheight = min(120, (int)floor($progress['total'] / $challenge->target * 120));
    $data['challenge'] = ['fillheight' => $fillheight, 'filly' => 120 - $fillheight, 'name' => $challenge->name, 'description' => $challenge->description,
        'progress' => get_string('hearthprogress', 'local_ignite', (object)[
            'count' => $progress['total'], 'target' => $challenge->target]),
        'own' => get_string('owncontribution', 'local_ignite', $progress['own']),
        'target' => $challenge->target, 'value' => min($progress['total'], $challenge->target),
        'asof' => $progress['updated'] ? userdate($progress['updated']) : '',
        'period' => userdate($challenge->timestart, '%d %B %Y, %H:%M', $challenge->timezone) . ' – ' .
            userdate($challenge->timeend, '%d %B %Y, %H:%M', $challenge->timezone) . ' (' . $challenge->timezone . ')',
    ];
    $data['next'] = \local_ignite\hearth_ui::next_action($challenge);
}
if ($house && empty($data['next'])) {
    $home = \local_ignite\home::data();
    $data['learningcourse'] = $home['courses'][0] ?? null;
}
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/hearth', $data);
echo $OUTPUT->footer();
