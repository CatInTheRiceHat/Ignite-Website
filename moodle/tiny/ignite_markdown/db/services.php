<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$functions = [
    'tiny_ignite_markdown_convert' => [
        'classname' => 'tiny_ignite_markdown\external\convert',
        'methodname' => 'execute',
        'description' => 'Render the current Markdown draft as safe HTML for preview and native form saving.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'tiny/ignite_markdown:use',
    ],
];
