<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

\local_ignite\access::administrator();
admin_externalpage_setup('local_ignite_houses');
$id = optional_param('id', 0, PARAM_INT);
$baseurl = new moodle_url('/local/ignite/houses.php');

if ($id) {
    $record = $DB->get_record('local_ignite_house', ['id' => $id], '*', MUST_EXIST);
    $form = new \local_ignite\form\house(new moodle_url('/local/ignite/houses.php', ['id' => $id]));
    if ($form->is_cancelled()) {
        redirect($baseurl);
    }
    if ($data = $form->get_data()) {
        require_sesskey();
        \local_ignite\houses::configure($id, [
            'shortname' => $data->shortname, 'personality' => $data->personality, 'mascot' => $data->mascot,
            'name' => $data->name, 'description' => $data->description,
            'accent' => $data->accent, 'emblem' => $data->emblem, 'active' => (int)$data->active,
        ]);
        \local_ignite\hearth_assets::save($id, ['emblem' => (int)$data->emblemfile, 'mascot' => (int)$data->mascotfile]);
        redirect($baseurl, get_string('changessaved'), null, \core\output\notification::NOTIFY_SUCCESS);
    }
    foreach (['emblem', 'mascot'] as $area) {
        $draftid = file_get_submitted_draft_itemid($area . 'file');
        file_prepare_draft_area($draftid, context_system::instance()->id, 'local_ignite', $area, $id,
            \local_ignite\hearth_assets::OPTIONS);
        $record->{$area . 'file'} = $draftid;
    }
    $form->set_data($record);
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('managehouses', 'local_ignite'));
echo html_writer::tag('p', get_string('houseconfiguration', 'local_ignite'));
if (isset($form)) {
    $form->display();
} else {
    echo html_writer::link(new moodle_url('/local/ignite/hearthsetup.php'), get_string('draftsetup', 'local_ignite'));
    $table = new html_table();
    $table->head = [get_string('housecode', 'local_ignite'), get_string('housename', 'local_ignite'),
        get_string('houseactive', 'local_ignite'), get_string('edit')];
    foreach ($DB->get_records('local_ignite_house', null, 'id') as $house) {
        $table->data[] = [s($house->code), s($house->name), get_string($house->active ? 'yes' : 'no'),
            html_writer::link(new moodle_url($baseurl, ['id' => $house->id]),
                get_string('edithouse', 'local_ignite', s($house->name)))];
    }
    echo html_writer::table($table);
}
echo $OUTPUT->footer();
