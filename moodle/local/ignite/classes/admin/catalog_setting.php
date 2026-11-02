<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\admin;

defined('MOODLE_INTERNAL') || die();

final class catalog_setting extends \admin_setting_configtextarea {
    public function validate($data) {
        try {
            \local_ignite\catalog::parse((string)$data);
            return true;
        } catch (\invalid_parameter_exception $e) {
            return get_string('invalidcatalog', 'local_ignite');
        }
    }
}
