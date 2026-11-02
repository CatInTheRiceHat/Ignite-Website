<?php
defined('MOODLE_INTERNAL') || die();
$capabilities = [
    'block/ignite:myaddinstance' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW], 'clonepermissionsfrom' => 'moodle/my:manageblocks',
    ],
];
