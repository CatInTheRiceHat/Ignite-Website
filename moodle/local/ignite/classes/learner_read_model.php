<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Request-only snapshots. No permission decision or learner payload survives an HTTP request. */
final class learner_read_model {
    private static array $values = [];

    public static function remember(string $key, callable $read) {
        global $USER;
        $scope = $USER->id . ':' . sha1(serialize($USER->access['rsw'] ?? [])) . ':' . current_language();
        $key = $scope . ':' . $key;
        if (!array_key_exists($key, self::$values)) {
            self::$values[$key] = $read();
        }
        return self::$values[$key];
    }

    /** Native observers and every successful Ignite transaction discard request snapshots. */
    public static function invalidate(?\core\event\base $event = null): void {
        self::$values = [];
    }

    public static function courses(): array {
        access::learner();
        return self::remember('enrolled', static fn() => enrol_get_my_courses(
            'id, fullname, category, visible, enablecompletion, cacherev', 'ul.timeaccess DESC, c.sortorder ASC'));
    }

    /** Visibility is checked afresh, including after a role switch, before exposing any name. */
    public static function course_available(\stdClass $course): bool {
        global $USER;
        if ($course->id == SITEID || !$course->visible ||
                !is_enrolled(\context_course::instance($course->id), $USER, '', true) ||
                !can_access_course($course, $USER, '', true)) {
            return false;
        }
        $category = \core_course_category::get($course->category, IGNORE_MISSING);
        return $category && $category->is_uservisible();
    }

    /** One evidence read for all supplied courses; no completion query inside an activity/card loop. */
    public static function evidence(array $courseids): array {
        global $DB;
        $userid = access::learner();
        $courseids = array_values(array_unique(array_map('intval', $courseids)));
        sort($courseids);
        if (!$courseids) { return []; }
        return self::remember('evidence:' . implode('_', $courseids), static function() use ($DB, $userid, $courseids) {
            [$sql, $params] = $DB->get_in_or_equal($courseids, SQL_PARAMS_NAMED, 'course');
            $params['userid'] = $userid;
            return $DB->get_records_sql('SELECT cc.coursemoduleid, cc.completionstate, cc.timemodified, cm.visible
                FROM {course_modules_completion} cc JOIN {course_modules} cm ON cm.id = cc.coursemoduleid
                WHERE cc.userid = :userid AND cm.course ' . $sql, $params);
        });
    }

    /** Native credential instances and own award rows are shared by featured/recent/next cards. */
    public static function badge(int $id): ?\core_badges\badge {
        global $CFG, $DB;
        access::learner();
        require_once($CFG->libdir . '/badgeslib.php');
        return self::remember('badge:' . $id, static fn() => $DB->record_exists('badge', ['id' => $id])
            ? new \core_badges\badge($id) : null);
    }

    public static function awards(): array {
        global $DB;
        $userid = access::learner();
        return self::remember('awards', static fn() => $DB->get_records('badge_issued', ['userid' => $userid],
            'dateissued DESC, id DESC', 'badgeid, id, userid, visible, dateissued, dateexpire'));
    }

    /** Batch the configured recommendation references, while target() retains native access checks. */
    public static function recommendation_sources(): array {
        global $DB;
        $catalog = catalog::get();
        $starters = onboarding_config::get()['starters'];
        return self::remember('recommendations:' . sha1(json_encode([$catalog, $starters])),
            static function() use ($DB, $catalog, $starters) {
                $courseids = $cmids = [];
                foreach ($catalog['interests'] as $mapping) {
                    $courseids = array_merge($courseids, $mapping['courseids'] ?? []);
                    $cmids = array_merge($cmids, $mapping['activityids'] ?? []);
                }
                $cmids = array_unique(array_merge($cmids, array_column($starters, 'cmid')));
                $cms = $cmids ? $DB->get_records_list('course_modules', 'id', $cmids) : [];
                $courseids = array_unique(array_merge($courseids, array_column($cms, 'course')));
                return ['cms' => $cms, 'courses' => $courseids ? $DB->get_records_list('course', 'id', $courseids) : []];
            });
    }
}
