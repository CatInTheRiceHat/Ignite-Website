<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\form;

defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/formslib.php');

final class house extends \moodleform {
    public function definition(): void {
        $form = $this->_form;
        $form->addElement('hidden', 'id');
        $form->setType('id', PARAM_INT);
        $form->addElement('static', 'code', get_string('housecode', 'local_ignite'));
        $form->addElement('text', 'name', get_string('housename', 'local_ignite'), ['maxlength' => 100]);
        $form->setType('name', PARAM_TEXT);
        $form->addRule('name', null, 'required', null, 'client');
        $form->addElement('textarea', 'description', get_string('housedescription', 'local_ignite'),
            ['rows' => 4, 'maxlength' => 2000]);
        $form->setType('description', PARAM_TEXT);
        $form->addElement('text', 'accent', get_string('houseaccent', 'local_ignite'), ['maxlength' => 7]);
        $form->setType('accent', PARAM_RAW_TRIMMED);
        $form->addElement('static', 'accenthelp', '', get_string('accenthelp', 'local_ignite'));
        $emblems = [];
        foreach (\local_ignite\houses::EMBLEMS as $emblem) {
            $emblems[$emblem] = get_string('emblem_' . $emblem, 'local_ignite');
        }
        $form->addElement('select', 'emblem', get_string('houseemblem', 'local_ignite'), $emblems);
        $form->addElement('text', 'shortname', get_string('hearthshortname', 'local_ignite'), ['maxlength' => 100]);
        $form->setType('shortname', PARAM_TEXT);
        $form->addElement('textarea', 'personality', get_string('hearthpersonality', 'local_ignite'), ['maxlength' => 2000]);
        $form->setType('personality', PARAM_TEXT);
        $mascots = ['placeholder' => get_string('mascotpending', 'local_ignite')] + $emblems;
        $form->addElement('select', 'mascot', get_string('hearthmascot', 'local_ignite'), $mascots);
        $form->addElement('static', 'artworkhelp', '', get_string('approvedarthelp', 'local_ignite'));
        foreach (['emblem', 'mascot'] as $area) {
            $form->addElement('filemanager', $area . 'file', get_string('approved' . $area, 'local_ignite'),
                null, \local_ignite\hearth_assets::OPTIONS);
        }
        $form->addElement('advcheckbox', 'active', get_string('houseactive', 'local_ignite'));
        $this->add_action_buttons(true, get_string('savechanges'));
    }

    public function validation($data, $files): array {
        $errors = parent::validation($data, $files);
        if (!\local_ignite\houses::valid_accent($data['accent'])) {
            $errors['accent'] = get_string('invalidaccent', 'local_ignite');
        }
        if (trim($data['name']) === '' || \core_text::strlen($data['name']) > 100) {
            $errors['name'] = get_string('required');
        }
        foreach (['emblemfile', 'mascotfile'] as $field) {
            if (!\local_ignite\hearth_assets::validate((int)$data[$field])) {
                $errors[$field] = get_string('invalidapprovedasset', 'local_ignite');
            }
        }
        if (\core_text::strlen($data['personality']) > 2000 || \core_text::strlen($data['description']) > 2000) {
            $errors['personality'] = get_string('identitytoolong', 'local_ignite');
        }
        return $errors;
    }
}
