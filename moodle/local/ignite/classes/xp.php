<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** One native first completion supplies both the lifetime and the monthly Campfire balance. */
final class xp {
    public const DEFAULT_AWARD = 20;
    public const DEFAULT_LEVEL_STEP = 100;

    private static function month(int $time): int {
        return (int)campfire::period($time)->format('Ym');
    }

    /** Reuse designated starters, personal milestones and in-period challenge milestones. */
    private static function condition(\cm_info $cm, int $when): ?string {
        global $DB;
        foreach (onboarding_config::get()['starters'] as $starter) {
            if ($starter['cmid'] === (int)$cm->id) {
                if (!recommendations::substantive_starter($cm)) {
                    return null;
                }
                return $starter['requirepass'] ? 'pass' : 'complete';
            }
        }
        $heat = heat_stages::parse(get_config('local_ignite', 'heatconfig') ?: heat_stages::EMPTY, false);
        $personal = $heat['milestones'][$cm->id] ?? null;
        $period = $DB->get_field_sql('SELECT m.conditiontype FROM {local_ignite_milestone} m
            JOIN {local_ignite_challenge} c ON c.id = m.challengeid
            WHERE m.cmid = ? AND c.active = 1 AND c.timestart <= ? AND c.timeend > ?', [$cm->id, $when, $when]);
        $designated = $personal === 'complete' || $period === 'complete' ? 'complete' : ($personal ?? ($period ?: null));
        // With the monthly fuse on, every activity that completes by its grade earns XP without being designated.
        if ($designated === null && access::enabled('fuse') && (int)$cm->completion === 2 &&
                $cm->completiongradeitemnumber !== null) {
            return empty($cm->completionpassgrade) ? 'complete' : 'pass';
        }
        return $designated;
    }

    public static function observe(\core\event\course_module_completion_updated $event): void {
        $record = $event->get_record_snapshot('course_modules_completion', $event->objectid);
        if (!$record || (int)$record->userid !== (int)$event->relateduserid ||
                (int)$record->coursemoduleid !== (int)$event->contextinstanceid) {
            return;
        }
        self::apply($record, (int)$event->courseid);
    }

    /** Moodle also issues this hook for bulk grade updates that suppress the normal completion event. */
    public static function completion_updated(\core_completion\hook\after_cm_completion_updated $hook): void {
        self::apply($hook->data, (int)$hook->cm->course);
    }

    private static function needs_update($award, \stdClass $record): bool {
        $state = (int)$record->completionstate;
        if (!$award) {
            return access::enabled() && milestone_eligibility::state_matches($state, 'complete');
        }
        return !$award->reversed && $record->id == $award->completionid && $record->timemodified >= $award->timeearned &&
            !milestone_eligibility::state_matches($state, $award->conditiontype);
    }

    private static function apply(\stdClass $record, int $courseid): void {
        global $DB;
        $userid = (int)$record->userid;
        $key = ['userid' => $userid, 'cmid' => (int)$record->coursemoduleid];
        if ($record->timemodified < (int)get_config('local_ignite', 'xpstart') ||
                !self::needs_update($DB->get_record('local_ignite_xp', $key), $record)) {
            return;
        }
        access::locked('user:' . $userid, static function() use ($DB, $key, $record, $courseid) {
            $award = $DB->get_record('local_ignite_xp', $key);
            if (!self::needs_update($award, $record)) {
                return;
            }
            if ($award) {
                // At second precision a replay of an earlier failure can tie the first success.
                if ($record->timemodified == $award->timeearned && !$DB->record_exists('course_modules_completion',
                        ['id' => $record->id, 'completionstate' => $record->completionstate, 'timemodified' => $record->timemodified])) {
                    return;
                }
                $DB->set_field('local_ignite_xp', 'reversed', 1, ['id' => $award->id]);
                return;
            }
            self::record_first($key, $record, $courseid);
        });
    }

    /** Called under the learner lock, shared with Campfire membership changes. */
    private static function record_first(array $key, \stdClass $record, int $courseid): void {
        global $DB, $CFG;
        $userid = $key['userid'];
        $cmid = $key['cmid'];
        $when = (int)$record->timemodified;
        $state = (int)$record->completionstate;
        if (!has_capability('local/ignite:use', \context_system::instance(), $userid)) {
            return;
        }
        $course = $DB->get_record('course', ['id' => $courseid]);
        if (!$course) {
            return;
        }
        $cm = get_fast_modinfo($course, $userid)->get_cms()[$cmid] ?? null;
        if (!$cm || !($condition = self::condition($cm, $when))) {
            return;
        }
        // A box the learner ticks themselves is not proof of anything, so it earns no XP once the fuse is on.
        if (access::enabled('fuse') && (int)$cm->completion === 1) {
            return;
        }
        require_once($CFG->libdir . '/completionlib.php');
        if (!empty($cm->completionpassgrade)) {
            $condition = 'pass';
        }
        if (!(new \completion_info($course))->is_tracked_user($userid) ||
                !milestone_eligibility::qualifies($cm, $course, $state, $condition) ||
                !activity_evidence::valid($cm, $course, $state, $userid, $condition === 'pass')) {
            return;
        }
        // A late completion can arrive after the native evidence was reset or withdrawn.
        $current = $DB->get_record('course_modules_completion', ['id' => $record->id]);
        $reversed = !$current || !milestone_eligibility::state_matches((int)$current->completionstate, $condition);
        $houseid = $DB->get_field_sql('SELECT houseid FROM {local_ignite_history}
            WHERE userid = ? AND timebegin <= ? AND (timeend = 0 OR timeend > ?)', [$userid, $when, $when]);
        $points = (int)(get_config('local_ignite', 'xpaward') ?: self::DEFAULT_AWARD);
        $DB->insert_record('local_ignite_xp', (object)($key + [
            'completionid' => $record->id, 'conditiontype' => $condition,
            'regularxp' => $points, 'houseid' => $houseid ?: 0, 'timeearned' => $when,
            'earnmonth' => self::month($when), 'reversed' => (int)$reversed,
        ]));
    }

    /** Bulk Moodle resets can remove or invalidate completion evidence without individual events. */
    public static function reconcile(): void {
        global $DB;
        $DB->set_field_select('local_ignite_xp', 'reversed', 1, "reversed = 0 AND EXISTS (
            SELECT 1 FROM {course_modules} cm WHERE cm.id = {local_ignite_xp}.cmid AND cm.deletioninprogress = 0
        ) AND NOT EXISTS (
            SELECT 1 FROM {course_modules_completion} cc WHERE cc.id = {local_ignite_xp}.completionid
            AND (cc.completionstate = 2 OR (cc.completionstate = 1 AND {local_ignite_xp}.conditiontype = 'complete'))
        )");
    }

    /** Read the original, still-valid awards for the signed-in learner's displayed activities. */
    public static function receipts(array $cmids): array {
        global $DB;
        $userid = access::learner();
        if (!$cmids) {
            return [];
        }
        [$sql, $params] = $DB->get_in_or_equal($cmids, SQL_PARAMS_NAMED);
        $awards = $DB->get_records_sql("SELECT x.cmid, x.regularxp, x.houseid, h.name
            FROM {local_ignite_xp} x LEFT JOIN {local_ignite_house} h ON h.id = x.houseid
            WHERE x.userid = :userid AND x.reversed = 0 AND x.cmid $sql", $params + ['userid' => $userid]);
        $receipts = [];
        $teamcodes = array_flip(campfire::ids());
        $chooseurl = null;
        foreach ($awards as $award) {
            $name = campfire::TEAMS[$teamcodes[$award->houseid] ?? ''] ?? $award->name;
            $label = $award->houseid ? get_string('awardteam', 'local_ignite', (object)[
                'regular' => $award->regularxp, 'team' => self::team_points((int)$award->regularxp), 'name' => $name,
            ]) : get_string('awardregular', 'local_ignite', $award->regularxp);
            if (!$award->houseid && $chooseurl === null) {
                $chooseurl = access::enabled('houses') && !$DB->record_exists('local_ignite_member', ['userid' => $userid])
                    ? (new \moodle_url('/local/ignite/choosehearth.php'))->out(false) : '';
            }
            $receipts[$award->cmid] = ['label' => $label, 'chooseurl' => $award->houseid ? '' : $chooseurl];
        }
        return $receipts;
    }

    /** Render after the native activity has finished updating completion (including Quiz review). */
    public static function activity_receipt(\core\hook\output\before_footer_html_generation $hook): void {
        global $CFG, $PAGE, $SCRIPT;
        if (!str_starts_with($SCRIPT ?? '', '/mod/') || !isloggedin() || isguestuser() || !access::enabled() ||
                !$PAGE->cm || !$PAGE->cm->uservisible ||
                !has_capability('local/ignite:use', \context_system::instance())) {
            return;
        }
        require_once($CFG->libdir . '/completionlib.php');
        $cmid = (int)$PAGE->cm->id;
        $receipt = self::receipts([$cmid])[$cmid] ?? null;
        if ($PAGE->cm->completion == COMPLETION_TRACKING_MANUAL && !access::enabled('fuse')) {
            $hook->add_html($hook->renderer->render_from_template('local_ignite/manual_xp_receipt',
                ['cmid' => $cmid, 'contextid' => $PAGE->cm->context->id, 'receipt' => $receipt]));
        } else if ($receipt) {
            $hook->add_html($hook->renderer->render_from_template('local_ignite/xp_receipt', $receipt));
        }
    }

    public static function profile_current(): \stdClass {
        global $DB;
        $userid = access::learner();
        $points = (int)$DB->get_field_sql('SELECT SUM(regularxp) FROM {local_ignite_xp}
            WHERE userid = ? AND reversed = 0', [$userid]);
        $step = (int)(get_config('local_ignite', 'xplevelstep') ?: self::DEFAULT_LEVEL_STEP);
        $level = 1 + intdiv($points, $step);
        return (object)['xp' => $points, 'level' => $level, 'nextlevel' => $level + 1,
            'withinlevel' => $points % $step, 'levelstep' => $step];
    }

    /** Team XP as it is shown: the XP itself once the monthly fuse is on, and half of it before. */
    public static function team_points(int $halves): string {
        return access::enabled('fuse') ? (string)$halves : intdiv($halves, 2) . ($halves % 2 ? '.5' : '');
    }

    public static function team_current(): string {
        global $DB;
        $userid = access::learner('houses');
        $houseid = (int)$DB->get_field('local_ignite_member', 'houseid', ['userid' => $userid]);
        if (!$houseid) {
            return self::team_points(0);
        }
        $month = self::month(time());
        $halves = (int)$DB->get_field_sql('SELECT SUM(regularxp) FROM {local_ignite_xp}
            WHERE houseid = ? AND earnmonth = ? AND reversed = 0', [$houseid, $month]);
        return self::team_points($halves + (fuse::blasts($month)['teams'][$houseid] ?? 0));
    }
}
