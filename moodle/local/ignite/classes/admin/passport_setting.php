<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\admin;

defined('MOODLE_INTERNAL') || die();

final class passport_setting extends \admin_setting_configtextarea {
    public function validate($data) {
        try {
            \local_ignite\passport_catalog::parse((string)$data);
            return true;
        } catch (\moodle_exception $e) {
            return get_string('passport_invalidcatalog', 'local_ignite');
        }
    }
}
