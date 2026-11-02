<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class preferences {
    public const STATUSES = ['notstarted', 'inprogress', 'complete', 'dismissed'];
    public const STEPS = ['welcome', 'interests', 'goal', 'path', 'hearth', 'finish', 'house', 'challenge', 'done'];

    public static function get_current(): \stdClass {
        global $DB;
        $userid = access::learner();
        $record = $DB->get_record('local_ignite_prefs', ['userid' => $userid]);
        if (!$record) {
            return (object)['interests' => [], 'goals' => null, 'status' => 'notstarted',
                'currentstep' => 'interests', 'pathid' => null];
        }
        $record->interests = json_decode($record->interests, true, 512, JSON_THROW_ON_ERROR);
        return $record;
    }

    /** Full replacement of the signed-in learner's preferences, with explicit allowed fields. */
    public static function save_current(array $data): void {
        global $DB;
        $userid = access::learner('onboarding');
        require_sesskey();
        $allowed = ['interests', 'goals', 'status', 'currentstep', 'pathid'];
        if (array_diff(array_keys($data), $allowed)) {
            throw new \invalid_parameter_exception('Unknown preference field');
        }
        $catalog = catalog::get();
        $interests = $data['interests'] ?? [];
        $goals = $data['goals'] ?? null;
        $pathid = $data['pathid'] ?? null;
        $status = $data['status'] ?? 'notstarted';
        $step = $data['currentstep'] ?? 'interests';
        if (!is_array($interests) || !array_is_list($interests) || count($interests) > 50) {
            throw new \invalid_parameter_exception('Invalid interests');
        }
        foreach ($interests as $interest) {
            if (!is_string($interest) || (!isset($catalog['interests'][$interest]) && !in_array($interest, onboarding::INTERESTS, true))) {
                throw new \invalid_parameter_exception('Unknown interest');
            }
        }
        if (($goals !== null && (!is_string($goals) || \core_text::strlen($goals) > 2000 ||
                clean_param($goals, PARAM_TEXT) !== $goals)) ||
                ($pathid !== null && (!is_string($pathid) || !isset($catalog['paths'][$pathid]))) ||
                !in_array($status, self::STATUSES, true) || !in_array($step, self::STEPS, true) ||
                (($status === 'complete') !== ($step === 'done'))) {
            throw new \invalid_parameter_exception('Invalid onboarding preferences');
        }
        access::locked('user:' . $userid, static function() use ($DB, $userid, $interests, $goals, $pathid, $status, $step) {
            $existing = $DB->get_record('local_ignite_prefs', ['userid' => $userid]);
            $record = (object)['userid' => $userid, 'interests' => json_encode(array_values(array_unique($interests))),
                'goals' => $goals, 'pathid' => $pathid, 'status' => $status, 'currentstep' => $step,
                'timemodified' => time()];
            if ($existing) {
                $record->id = $existing->id;
                $DB->update_record('local_ignite_prefs', $record);
            } else {
                $record->timecreated = time();
                $DB->insert_record('local_ignite_prefs', $record);
            }
            reports::invalidate();
        });
    }
}
