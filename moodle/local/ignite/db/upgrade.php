<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

function xmldb_local_ignite_upgrade(int $oldversion): bool {
    if ($oldversion < 2026110101) {
        // The initial schema is 2026110100. Never overwrite administrator edits.
        \local_ignite\installation::seed_houses();
        upgrade_plugin_savepoint(true, 2026110101, 'local', 'ignite');
    }
    return true;
}
