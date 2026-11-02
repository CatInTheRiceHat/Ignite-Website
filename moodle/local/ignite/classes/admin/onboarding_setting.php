<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\admin;
defined('MOODLE_INTERNAL') || die();

final class onboarding_setting extends \admin_setting_configtextarea {
    public function validate($data) {
        // Retaining an old reference must not block disabling features after an activity disappears.
        if ((string)$data === (string)$this->get_setting()) { return true; }
        try {
            \local_ignite\onboarding_config::parse($data);
            return true;
        } catch (\moodle_exception $e) {
            return get_string('invalidonboardingconfig', 'local_ignite') . ' ' . $e->getMessage();
        }
    }
}
