<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');
\local_ignite\access::administrator();
admin_externalpage_setup('local_ignite_hearthsetup');
$form = new \local_ignite\form\hearth_setup();
if ($form->is_cancelled()) {
    redirect(new moodle_url('/local/ignite/houses.php'));
}
if ($data = $form->get_data()) {
    $targets = [];
    foreach (\local_ignite\hearth_setup::DRAFTS as $code => $draft) {
        $targets[$code] = (int)$data->$code;
    }
    \local_ignite\hearth_setup::apply($targets);
    redirect(new moodle_url('/local/ignite/houses.php'), get_string('changessaved'));
}
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('draftsetup', 'local_ignite'));
$form->display();
echo $OUTPUT->footer();
