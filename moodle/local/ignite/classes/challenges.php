<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Shared periods apply equally to all Hearths. No enrollments, badges, or grades are mutated. */
final class challenges {
    /** Local wall-clock input is rejected when ambiguous/nonexistent, including DST transitions. */
    public static function timestamp(string $input, string $timezone): int {
        if (!in_array($timezone, \DateTimeZone::listIdentifiers(), true)) {
            throw new \invalid_parameter_exception('Choose an IANA timezone');
        }
        $tz = new \DateTimeZone($timezone);
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d H:i', $input, $tz);
        if (!$date || $date->format('Y-m-d H:i') !== $input) {
            throw new \invalid_parameter_exception('Invalid or nonexistent local date');
        }
        $time = $date->getTimestamp();
        // Reject repeated local times. The administrator can choose a boundary outside the repeated hour.
        foreach ($tz->getTransitions($time - 86400, $time + 86400) as $transition) {
            $candidate = \DateTimeImmutable::createFromFormat('!Y-m-d H:i', $input, new \DateTimeZone('UTC'));
            $alternate = $candidate->getTimestamp() - $transition['offset'];
            if ($alternate !== $time && (new \DateTimeImmutable('@' . $alternate))->setTimezone($tz)->format('Y-m-d H:i') === $input) {
                throw new \invalid_parameter_exception('Ambiguous local date; choose a different boundary');
            }
        }
        return $time;
    }

    /** Future periods can be edited. Started periods are immutable; disabling is always supported. */
    public static function configure(int $id, array $data, array $milestones): int {
        global $DB, $CFG;
        access::administrator();
        require_sesskey();
        require_once($CFG->libdir . '/completionlib.php');
        $fields = ['name', 'description', 'target', 'timestart', 'timeend', 'timezone', 'active'];
        if (array_diff($fields, array_keys($data)) || array_diff(array_keys($data), $fields)) {
            throw new \invalid_parameter_exception('Invalid challenge fields');
        }
        foreach (['name' => 100, 'description' => 2000] as $key => $limit) {
            if (!isset($data[$key]) || !is_string($data[$key]) || \core_text::strlen($data[$key]) > $limit ||
                    clean_param($data[$key], PARAM_TEXT) !== $data[$key]) {
                throw new \invalid_parameter_exception('Invalid challenge text');
            }
        }
        if (trim($data['name']) === '' || !is_int($data['target']) || $data['target'] < 1 || $data['target'] > 1000000 ||
                !is_int($data['timestart']) || !is_int($data['timeend']) || $data['timestart'] >= $data['timeend'] ||
                !in_array($data['timezone'], \DateTimeZone::listIdentifiers(), true) ||
                !in_array($data['active'], [0, 1], true) || !$milestones || count($milestones) > 200) {
            throw new \invalid_parameter_exception('Invalid challenge period or target');
        }
        foreach ($milestones as $cmid => $condition) {
            if (!ctype_digit((string)$cmid) || !in_array($condition, ['complete', 'pass'], true)) {
                throw new \invalid_parameter_exception('Invalid milestone');
            }
            $cm = get_coursemodule_from_id(null, (int)$cmid, 0, false, MUST_EXIST);
            $course = get_course($cm->course);
            if (!empty($cm->deletioninprogress) || !$course->enablecompletion || !$cm->completion ||
                    ($condition === 'pass' && ((int)$cm->completion !== COMPLETION_TRACKING_AUTOMATIC ||
                    $cm->completiongradeitemnumber === null || empty($cm->completionpassgrade)))) {
                throw new \invalid_parameter_exception('Enable native completion / passing-grade completion first');
            }
        }
        return access::locked('hearth-accounting', static function() use ($DB, $id, $data, $milestones) {
            if ($id) {
                $old = $DB->get_record('local_ignite_challenge', ['id' => $id], '*', MUST_EXIST);
                if ($old->timestart <= time()) {
                    throw new \invalid_parameter_exception('Started challenge is immutable; create a new period');
                }
            }
            if ($data['timestart'] <= time()) {
                throw new \invalid_parameter_exception('Configured challenges must start in the future');
            }
            // One visible shared challenge at a time; equal opportunity across Hearths.
            if ($data['active'] && $DB->record_exists_select('local_ignite_challenge',
                    'active = 1 AND id <> ? AND timestart < ? AND timeend > ?', [$id, $data['timeend'], $data['timestart']])) {
                throw new \invalid_parameter_exception('Active challenge periods must not overlap');
            }
            $record = (object)array_intersect_key($data, array_flip([
                'name', 'description', 'target', 'timestart', 'timeend', 'timezone', 'active',
            ]));
            if ($id) {
                $record->id = $id;
                $DB->update_record('local_ignite_challenge', $record);
                $DB->delete_records('local_ignite_milestone', ['challengeid' => $id]);
            } else {
                $record->timecreated = time();
                $id = $DB->insert_record('local_ignite_challenge', $record);
            }
            foreach ($milestones as $cmid => $condition) {
                $DB->insert_record('local_ignite_milestone', (object)[
                    'challengeid' => $id, 'cmid' => (int)$cmid, 'conditiontype' => $condition,
                ]);
                // Existing completions cannot become new Hearth work through a later reset.
                $evidence = $DB->get_recordset('course_modules_completion', ['coursemoduleid' => (int)$cmid]);
                foreach ($evidence as $completion) {
                    $key = ['challengeid' => $id, 'userid' => $completion->userid, 'cmid' => (int)$cmid];
                    if (self::qualifies((int)$completion->completionstate, $condition) &&
                            !$DB->record_exists('local_ignite_credit', $key)) {
                        $DB->insert_record('local_ignite_credit', (object)($key + [
                            'houseid' => 0, 'timequalified' => $completion->timemodified,
                            'status' => 'excluded', 'timemodified' => time(),
                        ]));
                    }
                }
                $evidence->close();
            }
            return $id;
        });
    }

    public static function deactivate(int $id): void {
        global $DB;
        access::administrator();
        require_sesskey();
        access::locked('hearth-accounting', static function() use ($DB, $id) {
            $DB->set_field('local_ignite_challenge', 'active', 0, ['id' => $id]);
        });
    }

    /** Internal observer only. Evidence must come from a native event snapshot or completion DB row. */
    public static function observe(\core\event\course_module_completion_updated $event): void {
        global $DB;
        if (!access::enabled('houses')) {
            return;
        }
        $evidence = $event->get_record_snapshot('course_modules_completion', $event->objectid);
        if (!$evidence || (int)$evidence->userid !== (int)$event->relateduserid ||
                (int)$evidence->coursemoduleid !== (int)$event->contextinstanceid) {
            return;
        }
        $userid = (int)$evidence->userid;
        if (!has_capability('local/ignite:use', \context_system::instance(), $userid)) {
            return;
        }
        access::locked('hearth-accounting', static function() use ($DB, $evidence, $userid) {
            access::locked('user:' . $userid, static function() use ($DB, $evidence, $userid) {
                $cmid = (int)$evidence->coursemoduleid;
                $periods = $DB->get_records_sql('SELECT c.*, m.conditiontype FROM {local_ignite_challenge} c
                    JOIN {local_ignite_milestone} m ON m.challengeid = c.id WHERE m.cmid = ? AND c.active = 1', [$cmid]);
                foreach ($periods as $period) {
                    $key = ['challengeid' => $period->id, 'userid' => $userid, 'cmid' => $cmid];
                    $old = $DB->get_record('local_ignite_credit', $key);
                    $qualifies = self::qualifies((int)$evidence->completionstate, $period->conditiontype);
                    if ($old) {
                        // Revocation is permanent for this period, even after recompletion.
                        if (!$qualifies && $old->status === 'credited') {
                            $DB->update_record('local_ignite_credit', (object)[
                                'id' => $old->id, 'status' => 'withdrawn', 'timemodified' => time(),
                            ]);
                        }
                        continue;
                    }
                    if (!$qualifies) {
                        continue;
                    }
                    $when = (int)$evidence->timemodified;
                    $membership = $DB->get_record_sql('SELECT * FROM {local_ignite_history}
                        WHERE userid = ? AND timebegin < ? AND (timeend = 0 OR timeend > ?)
                        ORDER BY timebegin DESC', [$userid, $when, $when], IGNORE_MULTIPLE);
                    $inperiod = $when >= $period->timestart && $when < $period->timeend;
                    $DB->insert_record('local_ignite_credit', (object)($key + [
                        'houseid' => $membership ? $membership->houseid : 0,
                        'timequalified' => $when, 'status' => $inperiod && $membership ? 'credited' : 'excluded',
                        'timemodified' => time(),
                    ]));
                }
            });
        });
    }

    public static function qualifies(int $state, string $condition): bool {
        // Moodle: 0 incomplete, 1 complete, 2 complete/pass, 3 complete/fail.
        return $condition === 'pass' ? $state === 2 : in_array($state, [1, 2], true);
    }

    /** Task only: reconcile resets/deletion, then publish totals. Never called by page rendering. */
    public static function refresh(): void {
        global $DB;
        access::locked('hearth-accounting', static function() use ($DB) {
            $records = $DB->get_recordset_sql('SELECT x.*, cc.completionstate, cc.timemodified AS evidencetime,
                cm.id AS existingcm, cm.deletioninprogress, m.conditiontype, h.id AS validmembership
                FROM {local_ignite_credit} x
                LEFT JOIN {course_modules_completion} cc ON cc.coursemoduleid = x.cmid AND cc.userid = x.userid
                LEFT JOIN {course_modules} cm ON cm.id = x.cmid
                LEFT JOIN {local_ignite_milestone} m ON m.cmid = x.cmid AND m.challengeid = x.challengeid
                LEFT JOIN {local_ignite_history} h ON h.userid = x.userid AND h.houseid = x.houseid
                    AND h.timebegin < x.timequalified AND (h.timeend = 0 OR h.timeend > x.timequalified)
                WHERE x.status = ?', ['credited']);
            foreach ($records as $record) {
                // Changed completion timestamp includes reset + recompletion between task runs.
                if (!$record->validmembership || !$record->existingcm || $record->deletioninprogress || $record->completionstate === null ||
                        !$record->conditiontype || !self::qualifies((int)$record->completionstate, $record->conditiontype) ||
                        (int)$record->evidencetime !== (int)$record->timequalified) {
                    $DB->update_record('local_ignite_credit', (object)[
                        'id' => $record->id, 'status' => 'withdrawn', 'timemodified' => time(),
                    ]);
                }
            }
            $records->close();
            $DB->delete_records('local_ignite_total');
            $totals = $DB->get_records_sql('SELECT MIN(id) AS id, challengeid, houseid, COUNT(1) AS milestones
                FROM {local_ignite_credit} WHERE status = ? GROUP BY challengeid, houseid', ['credited']);
            foreach ($totals as $total) {
                unset($total->id);
                $total->timeupdated = time();
                $DB->insert_record('local_ignite_total', $total);
            }
        });
    }

    public static function current(): ?\stdClass {
        global $DB;
        access::learner('houses');
        return $DB->get_record_select('local_ignite_challenge', 'active = 1 AND timestart <= ? AND timeend > ?',
            [time(), time()]) ?: null;
    }

    public static function progress(int $challengeid, int $houseid): array {
        global $DB;
        $userid = access::learner('houses');
        $total = $DB->get_record('local_ignite_total', ['challengeid' => $challengeid, 'houseid' => $houseid]);
        return ['total' => $total ? (int)$total->milestones : 0, 'updated' => $total ? (int)$total->timeupdated : 0,
            'own' => $DB->count_records('local_ignite_credit', [
                'challengeid' => $challengeid, 'houseid' => $houseid, 'userid' => $userid, 'status' => 'credited',
            ])];
    }
}
