<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$observers = [
    ['eventname' => '\\core\\event\\course_module_completion_updated',
        'callback' => '\\local_ignite\\challenges::observe'],
    ['eventname' => '\core\event\user_deleted', 'callback' => '\local_ignite\observer::user_deleted'],
];
