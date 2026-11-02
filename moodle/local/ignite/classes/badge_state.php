<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** Read-only, current-user native badge evidence. Safe for optional onboarding integrations. */
final class badge_state {
    /** Null means unavailable to this learner. Completion is never an award. No Passport flag required. */
    public static function get_current(int $badgeid): ?array {
        global $CFG, $DB;
        $userid = access::learner();
        require_once($CFG->libdir . '/badgeslib.php');
        require_once($CFG->libdir . '/completionlib.php');
        if (empty($CFG->enablebadges) || $badgeid <= 0 ||
                !has_capability('moodle/badges:manageownbadges', \context_user::instance($userid)) ||
                !$DB->record_exists('badge', ['id' => $badgeid])) {
            return null;
        }
        $badge = new \core_badges\badge($badgeid);
        if (!self::visible($badge, [])) {
            return null;
        }
        $issue = $DB->get_record('badge_issued', ['badgeid' => $badgeid, 'userid' => $userid]);
        // Respect native privacy choices; do not turn a hidden owned badge into an unearned preview.
        if ($issue && !$issue->visible) {
            return null;
        }
        if (!$issue && (!$badge->is_active() ||
                !has_capability('moodle/badges:earnbadge', $badge->get_context()))) {
            return null;
        }
        $state = 'unearned';
        $expired = $issue && $issue->dateexpire && (int)$issue->dateexpire <= time();
        if ($issue) {
            $state = $expired ? 'expired' : ($badge->is_active() ? 'earned' : 'earned_unavailable');
        } else if (self::criteria_satisfied($badge, $userid)) {
            $state = 'pendingissuance';
        } else if (self::pending_grading($badge, $userid)) {
            $state = 'pendinggrading';
        }
        $coursecomplete = null;
        if ($badge->courseid) {
            $coursecomplete = (new \completion_info(get_course($badge->courseid)))->is_course_complete($userid);
        }
        return [
            'badgeid' => $badgeid, 'state' => $state, 'owned' => (bool)$issue,
            'earned' => $state === 'earned', 'featureable' => $state === 'earned',
            'issuedid' => $issue ? (int)$issue->id : null,
            'dateissued' => $issue ? (int)$issue->dateissued : null,
            'dateexpire' => $issue && $issue->dateexpire ? (int)$issue->dateexpire : null,
            'coursecomplete' => $coursecomplete,
        ];
    }

    public static function course_visible(int $id): bool {
        global $DB;
        $course = $DB->get_record('course', ['id' => $id]);
        return $course && $id !== SITEID && can_access_course($course, null, '', true) &&
            \core_course_category::can_view_course_info($course);
    }

    /** Guard native criteria output too: its details can contain names of referenced hidden objects. */
    private static function visible(\core_badges\badge $badge, array $visited): bool {
        global $CFG, $DB;
        if (isset($visited[$badge->id]) || count($visited) >= 20 ||
                (int)$badge->status === BADGE_STATUS_ARCHIVED ||
                ($badge->courseid && (empty($CFG->badges_allowcoursebadges) || !self::course_visible((int)$badge->courseid))) ||
                !has_capability('moodle/badges:viewbadges', $badge->get_context())) {
            return false;
        }
        $visited[$badge->id] = true;
        foreach ($badge->criteria as $criterion) {
            if (!in_array((int)$criterion->criteriatype, [BADGE_CRITERIA_TYPE_OVERALL, BADGE_CRITERIA_TYPE_MANUAL,
                    BADGE_CRITERIA_TYPE_COURSE, BADGE_CRITERIA_TYPE_COURSESET, BADGE_CRITERIA_TYPE_ACTIVITY,
                    BADGE_CRITERIA_TYPE_BADGE, BADGE_CRITERIA_TYPE_PROFILE], true)) {
                // Cohort/competency/custom criteria need their own visibility adapter before exposing details.
                return false;
            }
            foreach ($criterion->params as $param) {
                if (isset($param['course']) && !self::course_visible((int)$param['course'])) {
                    return false;
                }
                if (isset($param['module'])) {
                    $cm = get_fast_modinfo($badge->courseid)->get_cms()[(int)$param['module']] ?? null;
                    if (!$cm || !$cm->uservisible || !$cm->available || $cm->deletioninprogress) {
                        return false;
                    }
                }
                if (isset($param['badge'])) {
                    if (!$DB->record_exists('badge', ['id' => $param['badge']]) ||
                            !self::visible(new \core_badges\badge($param['badge']), $visited)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /** These installed native review() implementations only read evidence. Never mark_complete() or issue(). */
    private static function criteria_satisfied(\core_badges\badge $badge, int $userid): bool {
        $results = [];
        foreach ($badge->criteria as $criterion) {
            if ((int)$criterion->criteriatype === BADGE_CRITERIA_TYPE_OVERALL) {
                continue;
            }
            if (!in_array((int)$criterion->criteriatype, [BADGE_CRITERIA_TYPE_ACTIVITY, BADGE_CRITERIA_TYPE_COURSE,
                    BADGE_CRITERIA_TYPE_COURSESET, BADGE_CRITERIA_TYPE_MANUAL, BADGE_CRITERIA_TYPE_BADGE], true)) {
                return false;
            }
            $results[] = (bool)$criterion->review($userid);
        }
        return $results && ((int)$badge->get_aggregation_method() === BADGE_CRITERIA_AGGREGATION_ANY
            ? in_array(true, $results, true) : !in_array(false, $results, true));
    }

    /** Deliberately narrow: submitted individual Assign work with grade-dependent completion and no grade. */
    private static function pending_grading(\core_badges\badge $badge, int $userid): bool {
        global $CFG;
        if (!$badge->courseid) {
            return false;
        }
        $course = get_course($badge->courseid);
        $activityids = [];
        foreach ($badge->criteria as $criterion) {
            if ((int)$criterion->criteriatype === BADGE_CRITERIA_TYPE_ACTIVITY) {
                foreach ($criterion->params as $param) {
                    $activityids[] = (int)$param['module'];
                }
            } else if ((int)$criterion->criteriatype === BADGE_CRITERIA_TYPE_COURSE) {
                foreach ((new \completion_info($course))->get_criteria(COMPLETION_CRITERIA_TYPE_ACTIVITY) as $activity) {
                    $activityids[] = (int)$activity->moduleinstance;
                }
            }
        }
        $cms = get_fast_modinfo($course)->get_cms();
        foreach (array_unique($activityids) as $id) {
            $cm = $cms[$id] ?? null;
            if (!$cm || $cm->modname !== 'assign' || !$cm->uservisible || !$cm->available ||
                    $cm->completiongradeitemnumber === null) {
                continue;
            }
            require_once($CFG->dirroot . '/mod/assign/locallib.php');
            $assign = new \assign(\context_module::instance($id), $cm, $course);
            if ($assign->get_instance()->teamsubmission) {
                continue;
            }
            $submission = $assign->get_user_submission($userid, false);
            $grade = $assign->get_user_grade($userid, false);
            if ($submission && $submission->status === ASSIGN_SUBMISSION_STATUS_SUBMITTED &&
                    (!$grade || $grade->grade === null || (float)$grade->grade < 0)) {
                return true;
            }
        }
        return false;
    }
}
