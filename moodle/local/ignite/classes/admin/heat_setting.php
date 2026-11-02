<?php
namespace local_ignite\admin;
defined('MOODLE_INTERNAL') || die();
final class heat_setting extends \admin_setting_configtextarea {
    public function validate($data) {
        try {
            \local_ignite\heat_stages::parse((string)$data);
            return true;
        } catch (\moodle_exception $e) {
            return get_string('dash_invalidheat', 'local_ignite');
        }
    }
}
