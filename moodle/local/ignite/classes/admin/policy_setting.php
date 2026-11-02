<?php
namespace local_ignite\admin;
defined('MOODLE_INTERNAL') || die();
final class policy_setting extends \admin_setting_configtextarea {
    public function validate($data) {
        if ((string)$data === (string)$this->get_setting()) { return true; }
        try { \local_ignite\onboarding_policy::parse((string)$data); return true; }
        catch (\moodle_exception $e) { return $e->getMessage(); }
    }
}
