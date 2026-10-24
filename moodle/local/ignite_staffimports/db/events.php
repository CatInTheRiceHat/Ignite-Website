<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$observers = [
    [
        'eventname' => '\\core\\event\\user_created',
        'callback' => '\\local_ignite_staffimports\\import_defaults::observe',
    ],
];
