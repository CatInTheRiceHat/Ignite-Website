<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\form;

defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/formslib.php');

final class featured extends \moodleform {
    public function definition(): void {
        $mform = $this->_form;
        $mform->addElement('static', 'instructions', '', get_string('passport_featurehelp', 'local_ignite'));
        $select = $mform->addElement('select', 'badgeids', get_string('passport_featurechoose', 'local_ignite'),
            $this->_customdata['options'], ['size' => min(10, max(3, count($this->_customdata['options'])))]);
        $select->setMultiple(true);
        $mform->setType('badgeids', PARAM_INT);
        $this->add_action_buttons(true, get_string('savechanges'));
    }

    public function validation($data, $files): array {
        $errors = parent::validation($data, $files);
        try {
            \local_ignite\passport::validate_featured_current($data['badgeids'] ?? []);
        } catch (\invalid_parameter_exception $e) {
            $errors['badgeids'] = get_string('passport_invalidfeature', 'local_ignite');
        }
        return $errors;
    }
}
