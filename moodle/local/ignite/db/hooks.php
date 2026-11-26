<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$callbacks = [
    ['hook' => \core\hook\output\before_footer_html_generation::class,
        'callback' => '\local_ignite\xp::activity_receipt'],
    ['hook' => \core\hook\output\before_footer_html_generation::class,
        'callback' => '\local_ignite\course_catalog::footer'],
    ['hook' => \core_completion\hook\after_cm_completion_updated::class,
        'callback' => '\local_ignite\xp::completion_updated'],
    ['hook' => \core_user\hook\extend_user_menu::class,
        'callback' => '\local_ignite\navigation::user_menu'],
    ['hook' => \core\hook\navigation\primary_extend::class,
        'callback' => '\local_ignite\navigation::primary'],
];
