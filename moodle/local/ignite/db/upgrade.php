<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

function xmldb_local_ignite_upgrade(int $oldversion): bool {
    global $DB;
    if ($oldversion < 2026110101) {
        // The initial schema is 2026110100. Never overwrite administrator edits.
        \local_ignite\installation::seed_houses();
        upgrade_plugin_savepoint(true, 2026110101, 'local', 'ignite');
    }
    if ($oldversion < 2026110104) {
        // Prompt 4 only. Reconcile sibling migrations sequentially; do not reuse this savepoint.
        $table = new xmldb_table('local_ignite_feature');
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_field('badgeid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_field('issuedid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_field('slot', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('user', XMLDB_KEY_FOREIGN, ['userid'], 'user', ['id']);
        $table->add_index('userslot', XMLDB_INDEX_UNIQUE, ['userid', 'slot']);
        $table->add_index('userbadge', XMLDB_INDEX_UNIQUE, ['userid', 'badgeid']);
        if (!$DB->get_manager()->table_exists($table)) {
            $DB->get_manager()->create_table($table);
        }
        upgrade_plugin_savepoint(true, 2026110104, 'local', 'ignite');
    }
    return true;
}
