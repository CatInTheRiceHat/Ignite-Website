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
    return true;
}
