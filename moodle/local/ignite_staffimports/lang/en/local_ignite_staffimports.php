<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Ignite staff imports';
$string['enabled'] = 'Default staff uploads to Course Developer';
$string['enabled_desc'] = 'For new accounts created by Upload users CSV rows with no role, course, category, or cohort assignment, '
    . 'assign Course Developer after the upload completes. Existing roles and explicit CSV assignments take precedence. '
    . 'Public sign-ups and accounts created outside Upload users are not affected.';
$string['privacy:metadata'] = 'This plugin stores no personal data of its own. '
    . 'Role assignments and their audit events are stored by Moodle core.';
