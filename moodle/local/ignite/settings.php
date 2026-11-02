<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig && has_capability('local/ignite:configure', context_system::instance())) {
    $settings = new admin_settingpage('local_ignite', get_string('pluginname', 'local_ignite'),
        ['moodle/site:config', 'local/ignite:configure']);
    $settings->add(new admin_setting_configcheckbox('local_ignite/enabled',
        get_string('enabled', 'local_ignite'), get_string('enabled_desc', 'local_ignite'), 0));
    foreach (\local_ignite\access::FEATURES as $feature) {
        $settings->add(new admin_setting_configcheckbox('local_ignite/' . $feature,
            get_string($feature, 'local_ignite'), get_string($feature . '_desc', 'local_ignite'), 0));
    }
    $settings->add(new \local_ignite\admin\catalog_setting('local_ignite/catalog',
        get_string('catalog', 'local_ignite'), get_string('catalog_desc', 'local_ignite'),
        \local_ignite\catalog::EMPTY, PARAM_RAW, 80, 16));
    $ADMIN->add('localplugins', $settings);
    $ADMIN->add('localplugins', new admin_externalpage('local_ignite_houses',
        get_string('managehouses', 'local_ignite'), new moodle_url('/local/ignite/houses.php'),
        ['moodle/site:config', 'local/ignite:configure']));
}
