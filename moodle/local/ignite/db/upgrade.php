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
    if ($oldversion < 2026110200) {
        $dbman = $DB->get_manager();
        $table = new xmldb_table('local_ignite_prefs');
        $field = new xmldb_field('targetkey', XMLDB_TYPE_CHAR, '64', null, null, null, null, 'pathid');
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }
        $table = new xmldb_table('local_ignite_invite');
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_field('state', XMLDB_TYPE_CHAR, '20', null, XMLDB_NOTNULL, null, 'pending');
        $table->add_field('startercmid', XMLDB_TYPE_INTEGER, '10');
        $table->add_field('timeshown', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('user', XMLDB_KEY_FOREIGN_UNIQUE, ['userid'], 'user', ['id']);
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }
        upgrade_plugin_savepoint(true, 2026110200, 'local', 'ignite');
    }
    return true;
}
