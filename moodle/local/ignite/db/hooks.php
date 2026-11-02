<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$callbacks = [
    ['hook' => \core_user\hook\extend_user_menu::class,
        'callback' => '\local_ignite\navigation::user_menu'],
    ['hook' => \core\hook\navigation\primary_extend::class,
        'callback' => '\local_ignite\navigation::primary'],
];
