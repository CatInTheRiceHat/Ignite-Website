<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

defined('MOODLE_INTERNAL') || die();

final class provider implements \core_privacy\local\metadata\provider,
        \core_privacy\local\request\plugin\provider,
        \core_privacy\local\request\core_userlist_provider {
    public static function get_metadata(collection $collection): collection {
        $collection->add_database_table('local_ignite_prefs', [
            'userid' => 'privacy:userid', 'interests' => 'privacy:interests', 'goals' => 'privacy:goals',
            'targetkey' => 'privacy:targetkey', 'status' => 'privacy:status', 'currentstep' => 'privacy:currentstep', 'pathid' => 'privacy:pathid',
            'timecreated' => 'privacy:timecreated', 'timemodified' => 'privacy:timemodified',
        ], 'privacy:preferences');
        $collection->add_database_table('local_ignite_member', [
            'userid' => 'privacy:userid', 'houseid' => 'privacy:houseid',
            'timecreated' => 'privacy:timecreated', 'timemodified' => 'privacy:timemodified',
        ], 'privacy:membership');
        $collection->add_database_table('local_ignite_history', [
            'userid' => 'privacy:userid', 'houseid' => 'privacy:houseid',
            'timebegin' => 'privacy:timebegin', 'timeend' => 'privacy:timeend',
        ], 'privacy:history');
        $collection->add_database_table('local_ignite_credit', [
            'userid' => 'privacy:userid', 'houseid' => 'privacy:houseid',
            'challengeid' => 'privacy:challengeid', 'cmid' => 'privacy:cmid',
            'timequalified' => 'privacy:timequalified', 'status' => 'privacy:creditstatus',
            'timemodified' => 'privacy:timemodified',
        ], 'privacy:credit');
        $collection->add_database_table('local_ignite_invite', [
            'userid' => 'privacy:userid', 'state' => 'privacy:invitestate', 'startercmid' => 'privacy:startercmid',
            'timeshown' => 'privacy:timeshown', 'timecreated' => 'privacy:timecreated',
            'timemodified' => 'privacy:timemodified',
        ], 'privacy:invitation');
        return $collection;
    }

    public static function get_contexts_for_userid(int $userid): contextlist {
        global $DB;
        $list = new contextlist();
        if ($DB->record_exists('local_ignite_prefs', ['userid' => $userid]) ||
                $DB->record_exists('local_ignite_member', ['userid' => $userid]) ||
                $DB->record_exists('local_ignite_invite', ['userid' => $userid]) ||
                $DB->record_exists('local_ignite_history', ['userid' => $userid]) ||
                $DB->record_exists('local_ignite_credit', ['userid' => $userid])) {
            $list->add_user_context($userid);
        }
        return $list;
    }

    public static function get_users_in_context(userlist $userlist): void {
        global $DB;
        $context = $userlist->get_context();
        if ($context instanceof \context_user &&
                ($DB->record_exists('local_ignite_prefs', ['userid' => $context->instanceid]) ||
                $DB->record_exists('local_ignite_member', ['userid' => $context->instanceid]) ||
                $DB->record_exists('local_ignite_invite', ['userid' => $context->instanceid]) ||
                $DB->record_exists('local_ignite_history', ['userid' => $context->instanceid]) ||
                $DB->record_exists('local_ignite_credit', ['userid' => $context->instanceid]))) {
            $userlist->add_user($context->instanceid);
        }
    }

    public static function export_user_data(approved_contextlist $contextlist): void {
        global $DB;
        $userid = (int)$contextlist->get_user()->id;
        $context = \context_user::instance($userid);
        if (!in_array($context->id, $contextlist->get_contextids())) {
            return;
        }
        $data = (object)[];
        if ($prefs = $DB->get_record('local_ignite_prefs', ['userid' => $userid])) {
            unset($prefs->id, $prefs->userid);
            $prefs->interests = json_decode($prefs->interests, true);
            $data->preferences = $prefs;
        }
        if ($membership = $DB->get_record('local_ignite_member', ['userid' => $userid])) {
            unset($membership->id, $membership->userid);
            $house = $DB->get_record('local_ignite_house', ['id' => $membership->houseid]);
            $membership->housename = $house ? $house->name : null;
            $data->membership = $membership;
        }
        if ($invitation = $DB->get_record('local_ignite_invite', ['userid' => $userid])) {
            unset($invitation->id, $invitation->userid);
            $data->invitation = $invitation;
        }
        foreach (['history', 'credit'] as $table) {
            $records = $DB->get_records('local_ignite_' . $table, ['userid' => $userid], 'id');
            foreach ($records as $record) {
                unset($record->id, $record->userid);
            }
            $data->$table = array_values($records);
        }
        writer::with_context($context)->export_data([get_string('pluginname', 'local_ignite')], $data);
    }

    public static function delete_data_for_all_users_in_context(\context $context): void {
        if ($context instanceof \context_user) {
            self::erase_user((int)$context->instanceid);
        }
    }

    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        $userid = (int)$contextlist->get_user()->id;
        $context = \context_user::instance($userid);
        if (in_array($context->id, $contextlist->get_contextids())) {
            self::erase_user($userid);
        }
    }

    public static function delete_data_for_users(approved_userlist $userlist): void {
        $context = $userlist->get_context();
        if ($context instanceof \context_user && in_array($context->instanceid, $userlist->get_userids())) {
            self::erase_user((int)$context->instanceid);
        }
    }

    /** Privacy requests and account deletion must work even while features are disabled. */
    public static function erase_user(int $userid): void {
        global $DB;
        \local_ignite\access::locked('hearth-accounting', static function() use ($DB, $userid) {
            \local_ignite\access::locked('user:' . $userid, static function() use ($DB, $userid) {
                $DB->delete_records('local_ignite_invite', ['userid' => $userid]);
                $DB->delete_records('local_ignite_prefs', ['userid' => $userid]);
                $DB->delete_records('local_ignite_member', ['userid' => $userid]);
                $DB->delete_records('local_ignite_history', ['userid' => $userid]);
                $DB->delete_records('local_ignite_credit', ['userid' => $userid]);
                // Do not serve stale totals containing erased contributions. The next task republishes totals.
                $DB->delete_records('local_ignite_total');
            });
        });
    }
}
