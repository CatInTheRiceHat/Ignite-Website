<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Read-only matching. Mapping is never an access grant or an enrollment. */
final class recommendations {
    public static function current(): array {
        access::learner('onboarding');
        $prefs = preferences::get_current();
        $catalog = catalog::get();
        $config = onboarding_config::get();
        $exploring = !$prefs->interests || in_array('unsure', $prefs->interests, true);
        $candidates = [];
        foreach ($catalog['interests'] as $key => $mapping) {
            if (!$exploring && !in_array($key, $prefs->interests, true)) {
                continue;
            }
            foreach (['activityids' => 'activity', 'courseids' => 'course'] as $field => $kind) {
                foreach ($mapping[$field] ?? [] as $id) {
                    $targetkey = $kind . ':' . $id;
                    // A practical outcome must be editorially configured, never fabricated from a title.
                    if (!isset($config['outcomes'][$targetkey])) {
                        continue;
                    }
                    if ($target = self::target($targetkey)) {
                        $target['outcome'] = $config['outcomes'][$targetkey];
                        $target['reason'] = get_string($exploring ? 'match_explore' : 'match_interest',
                            'local_ignite', $mapping['name']);
                        $candidates[$targetkey] = $target;
                        if (count($candidates) === 3) {
                            return array_values($candidates);
                        }
                    }
                }
            }
        }
        return array_slice(array_values($candidates), 0, 3);
    }

    /** Rechecked on every render and immediately before following the selected action. */
    public static function target(string $key): ?array {
        global $DB, $USER;
        access::learner('onboarding');
        if (!preg_match('/^(course|activity):([1-9][0-9]*)$/D', $key, $match)) {
            return null;
        }
        $cmrow = $match[1] === 'activity' ? $DB->get_record('course_modules',
            ['id' => (int)$match[2], 'deletioninprogress' => 0]) : null;
        if ($match[1] === 'activity' && !$cmrow) {
            return null;
        }
        $course = $DB->get_record('course', ['id' => $cmrow ? $cmrow->course : (int)$match[2]]);
        if (!$course || $course->id == SITEID || !$course->visible) {
            return null;
        }
        $context = \context_course::instance($course->id);
        $category = \core_course_category::get($course->category, IGNORE_MISSING);
        if (!$category || !$category->is_uservisible()) {
            return null;
        }
        $enrolled = is_enrolled($context, $USER, '', true);
        if ($cmrow) {
            if (!$enrolled || !can_access_course($course, $USER, '', true)) {
                return null;
            }
            $cm = get_fast_modinfo($course)->get_cm($cmrow->id);
            if (!$cm->uservisible || !$cm->available || !$cm->url ||
                    (get_capability_info('mod/' . $cm->modname . ':view', false) &&
                        !has_capability('mod/' . $cm->modname . ':view', $cm->context))) {
                return null;
            }
            return ['key' => $key, 'name' => self::plain_name($cm->name),
                'url' => $cm->url->out(false), 'action' => get_string('openactivity', 'local_ignite'),
                'cm' => $cm, 'course' => $course];
        }
        if ($enrolled && can_access_course($course, $USER, '', true)) {
            $url = new \moodle_url('/course/view.php', ['id' => $course->id]);
            $action = 'opencourse';
        } else {
            $canenrol = false;
            foreach (enrol_get_instances($course->id, true) as $instance) {
                $plugin = enrol_get_plugin($instance->enrol);
                if ($plugin && $plugin->can_self_enrol($instance) === true) {
                    $canenrol = true;
                    break;
                }
            }
            if (!$canenrol) {
                return null;
            }
            $url = new \moodle_url('/enrol/index.php', ['id' => $course->id]);
            $action = 'enroloptions';
        }
        return ['key' => $key, 'name' => self::plain_name($course->fullname), 'url' => $url->out(false),
            'action' => get_string($action, 'local_ignite'), 'course' => $course];
    }

    private static function plain_name(string $name): string {
        return html_entity_decode(strip_tags(format_string($name)), ENT_QUOTES, 'UTF-8');
    }

    public static function starter_target(): ?array {
        $prefs = preferences::get_current();
        $starters = onboarding_config::get()['starters'];
        // Prefer a chosen starter; otherwise use the first accessible configured activity.
        usort($starters, static fn($a, $b) =>
            (int)('activity:' . $b['cmid'] === ($prefs->targetkey ?? '')) <=>
            (int)('activity:' . $a['cmid'] === ($prefs->targetkey ?? '')));
        foreach ($starters as $starter) {
            if (($target = self::target('activity:' . $starter['cmid'])) && self::substantive_starter($target['cm'])) {
                $chosen = $prefs->targetkey ?? '';
                if ($chosen !== '' && $chosen !== $target['key'] &&
                        $chosen !== 'course:' . $target['course']->id) {
                    continue;
                }
                return $target;
            }
        }
        return null;
    }

    /** View-only and manually ticked activities cannot establish a real starter challenge. */
    public static function substantive_starter(\cm_info $cm): bool {
        global $CFG;
        require_once($CFG->libdir . '/completionlib.php');
        $completion = new \completion_info(get_course($cm->course));
        return $completion->is_enabled($cm) == COMPLETION_TRACKING_AUTOMATIC &&
            ($cm->completiongradeitemnumber !== null ||
                !empty(array_filter($cm->customdata['customcompletionrules'] ?? [])));
    }

    /** Native completion and gradebook evidence only; never writes completion or badge data. */
    public static function completed_starter(): ?int {
        global $CFG, $USER;
        require_once($CFG->libdir . '/completionlib.php');
        require_once($CFG->libdir . '/gradelib.php');
        foreach (onboarding_config::get()['starters'] as $starter) {
            $target = self::target('activity:' . $starter['cmid']);
            if (!$target || !self::substantive_starter($target['cm'])) {
                continue;
            }
            $cm = $target['cm'];
            $completion = new \completion_info($target['course']);
            $state = (int)$completion->get_data($cm, false, $USER->id)->completionstate;
            if (!in_array($state, [COMPLETION_COMPLETE, COMPLETION_COMPLETE_PASS], true)) {
                continue;
            }
            $passrequired = $starter['requirepass'] || !empty($cm->completionpassgrade);
            if ($passrequired || $cm->completiongradeitemnumber !== null) {
                $item = \grade_item::fetch(['courseid' => $cm->course, 'itemtype' => 'mod',
                    'itemmodule' => $cm->modname, 'iteminstance' => $cm->instance,
                    'itemnumber' => $cm->completiongradeitemnumber ?? 0]);
                $grades = $item ? \grade_grade::fetch_users_grades($item, [$USER->id], false) : [];
                $grade = $grades ? reset($grades) : null;
                if (!$grade || $grade->finalgrade === null || $item->needsupdate ||
                        ($passrequired && ($item->gradepass <= 0 || $grade->finalgrade < $item->gradepass))) {
                    continue;
                }
            }
            return (int)$cm->id;
        }
        return null;
    }
}
