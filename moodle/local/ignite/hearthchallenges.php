<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');
\local_ignite\access::administrator();
admin_externalpage_setup('local_ignite_hearthchallenges');
$id = optional_param('id', 0, PARAM_INT);
$edit = optional_param('edit', 0, PARAM_BOOL);
$base = new moodle_url('/local/ignite/hearthchallenges.php');
if ($_SERVER['REQUEST_METHOD'] === 'POST' && optional_param('deactivate', 0, PARAM_INT)) {
    \local_ignite\challenges::deactivate(required_param('deactivate', PARAM_INT));
    redirect($base);
}
if ($edit) {
    $form = new \local_ignite\form\hearth_challenge(new moodle_url($base, ['edit' => 1, 'id' => $id]));
    if ($form->is_cancelled()) {
        redirect($base);
    }
    if ($data = $form->get_data()) {
        try {
            \local_ignite\challenges::configure($id, [
                'name' => $data->name, 'description' => $data->description, 'target' => (int)$data->target,
                'timestart' => \local_ignite\challenges::timestamp($data->timestartlocal, $data->timezone),
                'timeend' => \local_ignite\challenges::timestamp($data->timeendlocal, $data->timezone),
                'timezone' => $data->timezone, 'active' => (int)$data->active,
            ], \local_ignite\form\hearth_challenge::milestones($data->milestones));
            redirect($base, get_string('changessaved'));
        } catch (invalid_parameter_exception $e) {
            $error = get_string('challengeinvalid', 'local_ignite') . ' ' . s($e->debuginfo ?? '');
        }
    }
    if ($id) {
        $record = $DB->get_record('local_ignite_challenge', ['id' => $id], '*', MUST_EXIST);
        foreach (['timestart', 'timeend'] as $field) {
            $record->{$field . 'local'} = (new DateTimeImmutable('@' . $record->$field))->setTimezone(new DateTimeZone($record->timezone))->format('Y-m-d H:i');
        }
        $lines = [];
        foreach ($DB->get_records('local_ignite_milestone', ['challengeid' => $id]) as $milestone) {
            $lines[] = $milestone->cmid . ':' . $milestone->conditiontype;
        }
        $record->milestones = implode("\n", $lines);
        $form->set_data($record);
    }
}
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('hearthchallenges', 'local_ignite'));
echo html_writer::tag('p', get_string('challengeconfighelp', 'local_ignite'));
if (isset($form)) {
    if (isset($error)) {
        echo $OUTPUT->notification($error);
    }
    $form->display();
} else {
    echo html_writer::link(new moodle_url($base, ['edit' => 1]), get_string('newchallenge', 'local_ignite'));
    $table = new html_table();
    $table->head = [get_string('challenge_name', 'local_ignite'), get_string('houseactive', 'local_ignite'), get_string('edit'), get_string('deactivatechallenge', 'local_ignite')];
    foreach ($DB->get_records('local_ignite_challenge', null, 'timestart DESC') as $record) {
        $button = new single_button(new moodle_url($base, ['deactivate' => $record->id]), get_string('deactivatechallenge', 'local_ignite'), 'post');
        $table->data[] = [s($record->name), get_string($record->active ? 'yes' : 'no'),
            $record->timestart > time() ? html_writer::link(new moodle_url($base, ['edit' => 1, 'id' => $record->id]), get_string('edit')) : get_string('challengeimmutable', 'local_ignite'),
            $record->active ? $OUTPUT->render($button) : ''];
    }
    echo html_writer::table($table);
}
echo $OUTPUT->footer();
