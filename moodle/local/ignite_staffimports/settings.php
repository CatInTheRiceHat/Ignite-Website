<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_ignite_staffimports',
        get_string('pluginname', 'local_ignite_staffimports'));
    $settings->add(new admin_setting_configcheckbox('local_ignite_staffimports/enabled',
        get_string('enabled', 'local_ignite_staffimports'),
        get_string('enabled_desc', 'local_ignite_staffimports'), 1));
    $ADMIN->add('localplugins', $settings);
}
