<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

function xmldb_local_ignite_upgrade(int $oldversion): bool {
    global $DB;
    if ($oldversion < 2026110101) {
        // The initial schema is 2026110100. Never overwrite administrator edits.
        // Legacy identities are never recreated during upgrade.
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
    if ($oldversion < 2026110300) {
        $manager = $DB->get_manager();
        $file = new xmldb_file(__DIR__ . '/install.xml');
        $file->loadXMLStructure();
        $structure = $file->getStructure();
        $house = $structure->getTable('local_ignite_house');
        foreach (['shortname', 'personality', 'mascot'] as $name) {
            $field = $house->getField($name);
            if (!$manager->field_exists($house, $field)) {
                $manager->add_field($house, $field);
            }
        }
        foreach (['history', 'challenge', 'milestone', 'credit', 'total'] as $name) {
            $table = $structure->getTable('local_ignite_' . $name);
            if (!$manager->table_exists($table)) {
                $manager->create_table($table);
            }
        }
        // Earlier switches cannot be reconstructed. Start observation now, never backdate credit.
        $now = time();
        foreach ($DB->get_records('local_ignite_member') as $member) {
            if (!$DB->record_exists('local_ignite_history', ['userid' => $member->userid, 'timeend' => 0])) {
                $DB->insert_record('local_ignite_history', (object)[
                    'userid' => $member->userid, 'houseid' => $member->houseid,
                    'timebegin' => $now, 'timeend' => 0,
                ]);
            }
        }
        upgrade_plugin_savepoint(true, 2026110300, 'local', 'ignite');
    }
    if ($oldversion < 2026110400) {
        // Passport follows the reconciled onboarding and Hearth migrations.
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
        upgrade_plugin_savepoint(true, 2026110400, 'local', 'ignite');
    }
    return true;
}
