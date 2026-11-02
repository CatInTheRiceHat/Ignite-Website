<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Invitation state is independent of walkthrough status and never grants membership. */
final class invitations {
    public const STATES = ['pending', 'eligible', 'shown', 'deferred', 'accepted'];

    /** Reconcile trusted evidence, without reopening deferred/shown/accepted invitations. */
    public static function current(): \stdClass {
        global $DB;
        $userid = access::learner('onboarding');
        $member = $DB->record_exists('local_ignite_member', ['userid' => $userid]);
        $eligible = false;
        $starter = null;
        if (!$member && onboarding_config::selection_url()) {
            if (get_config('local_ignite', 'hearthtiming') === 'initial') {
                $eligible = true;
            } else {
                $starter = recommendations::completed_starter();
                $eligible = $starter !== null;
            }
        }
        return access::locked('user:' . $userid, static function() use ($DB, $userid, $member, $eligible, $starter) {
            $record = $DB->get_record('local_ignite_invite', ['userid' => $userid]);
            if (!$record) {
                $record = (object)['userid' => $userid, 'state' => 'pending', 'startercmid' => null,
                    'timeshown' => 0, 'timecreated' => time(), 'timemodified' => time()];
                $record->id = $DB->insert_record('local_ignite_invite', $record);
            }
            if ($member && $record->state !== 'accepted') {
                $record->state = 'accepted';
            } else if ($eligible && $record->state === 'pending') {
                $record->state = 'eligible';
                $record->startercmid = $starter;
            }
            $record->timemodified = time();
            $DB->update_record('local_ignite_invite', $record);
            return $record;
        });
    }

    /** Eligibility is rechecked after setting changes or revocation, including on a stale form. */
    public static function can_offer(): bool {
        global $DB, $USER;
        $userid = access::learner('onboarding');
        if (!onboarding_policy::eligible($USER) || !onboarding_config::selection_url() ||
                $DB->record_exists('local_ignite_member', ['userid' => $userid])) {
            return false;
        }
        $record = self::current();
        return $record->state !== 'accepted' && (get_config('local_ignite', 'hearthtiming') === 'initial' ||
            recommendations::completed_starter() !== null);
    }

    /** Called only when the invitation is actually rendered, not when navigation is assembled. */
    public static function shown(): void {
        global $DB;
        $userid = access::learner('onboarding');
        if (!self::can_offer()) {
            return;
        }
        access::locked('user:' . $userid, static function() use ($DB, $userid) {
            $record = $DB->get_record('local_ignite_invite', ['userid' => $userid], '*', MUST_EXIST);
            if ($record->state === 'eligible') {
                $record->state = 'shown';
                $record->timeshown = time();
                $record->timemodified = time();
                $DB->update_record('local_ignite_invite', $record);
            }
        });
    }

    public static function defer(): void {
        global $DB;
        $userid = access::learner('onboarding');
        require_sesskey();
        self::current();
        access::locked('user:' . $userid, static function() use ($DB, $userid) {
            $record = $DB->get_record('local_ignite_invite', ['userid' => $userid], '*', MUST_EXIST);
            if ($record->state !== 'accepted') {
                $record->state = 'deferred';
                $record->timemodified = time();
                $DB->update_record('local_ignite_invite', $record);
            }
        });
    }
}
