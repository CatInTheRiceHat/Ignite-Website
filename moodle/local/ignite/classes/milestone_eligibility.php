<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Shared native evidence eligibility; personal and Hearth accounting remain separate. */
final class milestone_eligibility {
    public static function state_matches(int $state, string $condition): bool {
        return $condition === 'pass' ? $state === 2 : ($condition === 'complete' && in_array($state, [1, 2], true));
    }

    public static function configured($cm, \stdClass $course, string $condition): bool {
        global $CFG;
        return !empty($CFG->enablecompletion) && !empty($course->enablecompletion) &&
            !empty($cm->completion) && empty($cm->deletioninprogress) &&
            in_array($condition, ['complete', 'pass'], true) &&
            ($condition !== 'pass' || ((int)$cm->completion === 2 &&
                $cm->completiongradeitemnumber !== null && !empty($cm->completionpassgrade)));
    }

    public static function qualifies($cm, \stdClass $course, int $state, string $condition): bool {
        return self::configured($cm, $course, $condition) && self::state_matches($state, $condition);
    }
}
