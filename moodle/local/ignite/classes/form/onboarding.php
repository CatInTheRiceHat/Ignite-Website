<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\form;
defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/formslib.php');

final class onboarding extends \moodleform {
    public function definition(): void {
        $form = $this->_form;
        $step = $this->_customdata['step'];
        $prefs = $this->_customdata['prefs'];
        $edit = $this->_customdata['edit'];
        $form->addElement('hidden', 'step', $step);
        $form->setType('step', PARAM_ALPHA);
        $form->addElement('hidden', 'edit', (int)$edit);
        $form->setType('edit', PARAM_BOOL);
        if ($step === 'interests') {
            $form->addElement('static', 'interesthelp', '', get_string('interesthelp', 'local_ignite'));
            foreach (\local_ignite\onboarding_policy::interest_options() as $key=>$label) {
                $form->addElement('advcheckbox', 'interest_' . $key, '', $label);
                $form->setDefault('interest_' . $key, in_array($key, $prefs->interests, true));
            }
        } else if ($step === 'goal') {
            $form->addElement('radio', 'goals', '', get_string('nogoal', 'local_ignite'), '');
            foreach (\local_ignite\onboarding_policy::get()['goals'] as $key=>$label) {
                $form->addElement('radio', 'goals', '', $label, $key);
            }
            $form->setType('goals', PARAM_ALPHANUMEXT);
            $form->setDefault('goals', array_key_exists($prefs->goals ?? '', \local_ignite\onboarding_policy::get()['goals']) ? $prefs->goals : '');
        } else if ($step === 'path') {
            $recommendations = $this->_customdata['recommendations'];
            if (!$recommendations) {
                $form->addElement('static', 'empty', '', get_string('norecommendations', 'local_ignite'));
                $form->addElement('static', 'catalog', '', \html_writer::link(new \moodle_url('/course/index.php'),
                    get_string('explorecourses', 'local_ignite')));
            }
            $form->addElement('radio', 'targetkey', '', get_string('pathlater', 'local_ignite'), '');
            foreach ($recommendations as $target) {
                $label = \html_writer::tag('strong', s($target['name'])) .
                    \html_writer::tag('span', s($target['outcome']), ['class' => 'ignite-walk__detail']) .
                    \html_writer::tag('span', s($target['reason']), ['class' => 'ignite-walk__detail']) .
                    \html_writer::tag('span', s($target['action']), ['class' => 'ignite-walk__detail']);
                $form->addElement('radio', 'targetkey', '', $label, $target['key']);
            }
            $form->setType('targetkey', PARAM_RAW);
            $keys = array_column($recommendations, 'key');
            $form->setDefault('targetkey', in_array($prefs->targetkey ?? '', $keys, true) ? $prefs->targetkey : '');
        } else if ($step === 'hearth') {
            $form->addElement('static', 'hearthintro', '', get_string('hearthinviteintro', 'local_ignite'));
        } else if ($step === 'finish') {
            $form->addElement('static', 'finishintro', '', get_string('finishintro', 'local_ignite'));
            if (!$this->_customdata['starter']) {
                $form->addElement('static', 'startergap', '', get_string('nostarter', 'local_ignite'));
                $form->addElement('static', 'startercatalog', '', \html_writer::link(new \moodle_url('/course/index.php'),
                    get_string('explorecourses', 'local_ignite')));
            }
        }
        $buttons = [];
        if ($edit) {
            $buttons[] = $form->createElement('submit', 'saveinterests', get_string('saveinterests', 'local_ignite'));
        } else {
            if ($step !== 'welcome') {
                $buttons[] = $form->createElement('submit', 'back', get_string('back'), null, false);
            }
            if ($step === 'finish') {
                $buttons[] = $form->createElement('submit', 'start', $this->_customdata['startlabel'], null, true);
                $buttons[] = $form->createElement('submit', 'home', get_string('gotoignitehome', 'local_ignite'), null, false);
            } else {
                if ($step === 'hearth') {
                    $buttons[] = $form->createElement('submit', 'visit', get_string('meethearths', 'local_ignite'));
                }
                $buttons[] = $form->createElement('submit', 'next',
                    get_string($step === 'hearth' ? 'chooselater' : 'nextstep', 'local_ignite'), null, $step !== 'hearth');
            }
        }
        $buttons[] = $form->createElement('submit', 'skip', get_string('skipfornow', 'local_ignite'), null, false);
        $form->addGroup($buttons, 'actions', '', ' ', false);
        $form->closeHeaderBefore('actions');
    }

    public function validation($data, $files): array {
        $errors = parent::validation($data, $files);
        if ($this->_customdata['step'] === 'interests' &&
                (isset($data['next']) || isset($data['saveinterests']))) {
            $selected = array_filter(array_keys(\local_ignite\onboarding_policy::interest_options()),
                static fn($key) => !empty($data['interest_' . $key]));
            if (count($selected) > 3 || (in_array('unsure', $selected, true) && count($selected) > 1)) {
                $errors['interest_unsure'] = get_string('interesterror', 'local_ignite');
            }
        }
        if ($this->_customdata['step'] === 'path' && isset($data['next']) &&
                !empty($data['targetkey']) && !in_array($data['targetkey'],
                    array_column($this->_customdata['recommendations'], 'key'), true)) {
            $errors['targetkey'] = get_string('recommendationchanged', 'local_ignite');
        }
        return $errors;
    }
}
