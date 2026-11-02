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
    $settings->add(new admin_setting_configselect('local_ignite/hearthtiming',
        get_string('hearthtiming', 'local_ignite'), get_string('hearthtiming_desc', 'local_ignite'),
        'afterchallenge', ['afterchallenge' => get_string('timing_afterchallenge', 'local_ignite'),
            'initial' => get_string('timing_initial', 'local_ignite')]));
    $settings->add(new \local_ignite\admin\selection_route_setting('local_ignite/hearthselectionroute',
        get_string('selectionroute', 'local_ignite'), get_string('selectionroute_desc', 'local_ignite'), '', PARAM_RAW));
    $onboardingsetting = new \local_ignite\admin\onboarding_setting('local_ignite/onboardingconfig',
        get_string('onboardingconfig', 'local_ignite'), get_string('onboardingconfig_desc', 'local_ignite'),
        \local_ignite\onboarding_config::EMPTY, PARAM_RAW, 80, 12);
    $onboardingsetting->set_updatedcallback('\\local_ignite\\reports::invalidate');
    $settings->add($onboardingsetting);
    // Optional recommendation quiz deliberately has no setting or stored traits in this phase.
    $settings->add(new \local_ignite\admin\passport_setting('local_ignite/passportcatalog',
        get_string('passport_catalog', 'local_ignite'), get_string('passport_catalog_desc', 'local_ignite'),
        \local_ignite\passport_catalog::EMPTY, PARAM_RAW, 80, 16));
    $settings->add(new admin_setting_configcheckbox('local_ignite/dashboardlanding',
        get_string('dash_landing', 'local_ignite'), get_string('dash_landing_desc', 'local_ignite'), 0));
    $settings->add(new \local_ignite\admin\heat_setting('local_ignite/heatconfig',
        get_string('dash_heatconfig', 'local_ignite'), get_string('dash_heatconfig_desc', 'local_ignite'),
        \local_ignite\heat_stages::EMPTY, PARAM_RAW, 80, 12));
    $policy=new \local_ignite\admin\policy_setting('local_ignite/onboardingpolicy',
        get_string('policy_title','local_ignite'),get_string('policy_desc','local_ignite'),
        \local_ignite\onboarding_policy::EMPTY,PARAM_RAW,80,12);
    $policy->set_updatedcallback('\\local_ignite\\reports::invalidate');
    $settings->add($policy);
    $ADMIN->add('localplugins', $settings);
    $ADMIN->add('reports',new admin_externalpage('local_ignite_report',get_string('report_title','local_ignite'),
        new moodle_url('/local/ignite/report.php'),'local/ignite:viewreport'));
    $ADMIN->add('localplugins',new admin_externalpage('local_ignite_setup',get_string('setup_title','local_ignite'),
        new moodle_url('/local/ignite/setup.php'),['moodle/site:config','local/ignite:configure']));
    foreach (['hearthsetup' => 'draftsetup', 'hearthchallenges' => 'hearthchallenges'] as $route => $label) {
        $ADMIN->add('localplugins', new admin_externalpage('local_ignite_' . $route,
            get_string($label, 'local_ignite'), new moodle_url('/local/ignite/' . $route . '.php'),
            ['moodle/site:config', 'local/ignite:configure']));
    }
    $ADMIN->add('localplugins', new admin_externalpage('local_ignite_houses',
        get_string('managehouses', 'local_ignite'), new moodle_url('/local/ignite/houses.php'),
        ['moodle/site:config', 'local/ignite:configure']));
}

if (!$hassiteconfig && has_capability('local/ignite:viewreport',context_system::instance())) {
    $ADMIN->add('reports',new admin_externalpage('local_ignite_report',get_string('report_title','local_ignite'),
        new moodle_url('/local/ignite/report.php'),'local/ignite:viewreport'));
}
