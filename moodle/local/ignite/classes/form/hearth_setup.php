<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\form;
defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/formslib.php');
final class hearth_setup extends \moodleform {
    public function definition(): void {
        global $DB;
        $form = $this->_form;
        $form->addElement('static', 'explanation', '', get_string('draftsetuphelp', 'local_ignite'));
        $options = [0 => get_string('keepunchanged', 'local_ignite'), -1 => get_string('createnewhearth', 'local_ignite')];
        foreach ($DB->get_records('local_ignite_house', null, 'id') as $house) {
            $options[$house->id] = $house->name . ' [' . $house->code . ', ID ' . $house->id . ']';
        }
        foreach (\local_ignite\hearth_setup::DRAFTS as $code => [$name, $short, $personality]) {
            $form->addElement('header', 'header_' . $code, $name);
            $form->addElement('static', 'personality_' . $code, '', $personality);
            $form->addElement('select', $code, get_string('applyidentityto', 'local_ignite'), $options);
            $form->setType($code, PARAM_INT);
        }
        $form->addElement('header', 'reviewheader', get_string('reviewproposals', 'local_ignite'));
        $form->setExpanded('reviewheader', true);
        $form->addElement('advcheckbox', 'reviewed', get_string('reviewdrafts', 'local_ignite'));
        $this->add_action_buttons(true, get_string('applydrafts', 'local_ignite'));
    }
    public function validation($data, $files): array {
        $errors = parent::validation($data, $files);
        if (empty($data['reviewed'])) {
            $errors['reviewed'] = get_string('required');
        }
        $ids = [];
        foreach (\local_ignite\hearth_setup::DRAFTS as $code => $draft) {
            if ($data[$code] > 0 && in_array($data[$code], $ids)) {
                $errors[$code] = get_string('distincthearths', 'local_ignite');
            }
            $ids[] = $data[$code];
        }
        return $errors;
    }
}
