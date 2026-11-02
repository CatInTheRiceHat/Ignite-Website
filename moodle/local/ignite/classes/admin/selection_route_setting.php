<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\admin;
defined('MOODLE_INTERNAL') || die();

final class selection_route_setting extends \admin_setting_configtext {
    public function validate($data) {
        return \local_ignite\onboarding_config::valid_route($data) ? true :
            get_string('invalidselectionroute', 'local_ignite');
    }
}
