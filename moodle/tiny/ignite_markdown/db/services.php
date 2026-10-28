<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$functions = [
    'tiny_ignite_markdown_convert' => [
        'classname' => 'tiny_ignite_markdown\external\convert',
        'methodname' => 'execute',
        'description' => 'Convert Markdown to safe HTML for insertion into the editor without saving it.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'tiny/ignite_markdown:use',
    ],
];
