<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\form;
defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/formslib.php');
final class hearth_challenge extends \moodleform {
    public function definition(): void {
        $f = $this->_form;
        $f->addElement('hidden', 'id', 0);
        $f->setType('id', PARAM_INT);
        foreach (['name', 'description', 'target', 'timestartlocal', 'timeendlocal', 'timezone', 'milestones'] as $field) {
            $f->addElement(in_array($field, ['description', 'milestones']) ? 'textarea' : 'text',
                $field, get_string('challenge_' . $field, 'local_ignite'));
            $f->setType($field, $field === 'target' ? PARAM_INT : PARAM_TEXT);
            $f->addRule($field, null, 'required', null, 'client');
        }
        $f->setDefault('timezone', 'UTC');
        $f->addElement('static', 'help', '', get_string('challengeconfighelp', 'local_ignite'));
        $f->addElement('advcheckbox', 'active', get_string('houseactive', 'local_ignite'));
        $f->setDefault('active', 1);
        $this->add_action_buttons();
    }
    public static function milestones(string $text): array {
        $result = [];
        foreach (preg_split('/\R/', trim($text)) as $line) {
            if (!preg_match('/^([1-9][0-9]*)\s*:\s*(complete|pass)$/D', trim($line), $matches) || isset($result[(int)$matches[1]])) {
                throw new \invalid_parameter_exception('Use unique cmid:complete or cmid:pass lines');
            }
            $result[(int)$matches[1]] = $matches[2];
        }
        return $result;
    }
    public function validation($data, $files): array {
        $errors = parent::validation($data, $files);
        foreach (['timestartlocal', 'timeendlocal'] as $field) {
            try {
                \local_ignite\challenges::timestamp($data[$field], $data['timezone']);
            } catch (\invalid_parameter_exception $e) {
                $errors[$field] = get_string('challengeinvaliddate', 'local_ignite');
            }
        }
        try {
            self::milestones($data['milestones']);
        } catch (\invalid_parameter_exception $e) {
            $errors['milestones'] = get_string('challengeinvalidmilestones', 'local_ignite');
        }
        return $errors;
    }
}
