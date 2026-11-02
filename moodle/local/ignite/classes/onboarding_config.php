<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** Non-personal configuration, independent of Hearth identities and enrollment. */
final class onboarding_config {
    public const EMPTY = '{"starters":[],"outcomes":{}}';

    public static function get(): array {
        return self::parse(get_config('local_ignite', 'onboardingconfig') ?: self::EMPTY, false);
    }

    public static function parse(string $json, bool $checkreferences = true): array {
        global $DB;
        if (strlen($json) > 100000) {
            throw new \invalid_parameter_exception('Configuration exceeds 100 KB');
        }
        try {
            $object = json_decode($json, false, 16, JSON_THROW_ON_ERROR);
            $data = json_decode($json, true, 16, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \invalid_parameter_exception('Invalid JSON');
        }
        if (!$object instanceof \stdClass || array_diff(array_keys((array)$object), ['starters', 'outcomes']) ||
                !isset($object->starters, $object->outcomes) || !is_array($object->starters) ||
                !$object->outcomes instanceof \stdClass || count($object->starters) > 200 ||
                count((array)$object->outcomes) > 400) {
            throw new \invalid_parameter_exception('Expected starters list and outcomes object');
        }
        $seen = [];
        foreach ($data['starters'] as $starter) {
            if (!is_array($starter) || array_diff(array_keys($starter), ['cmid', 'requirepass']) ||
                    !isset($starter['cmid'], $starter['requirepass']) || !is_int($starter['cmid']) ||
                    $starter['cmid'] < 1 || !is_bool($starter['requirepass']) || isset($seen[$starter['cmid']])) {
                throw new \invalid_parameter_exception('Each starter needs a unique cmid and boolean requirepass');
            }
            $seen[$starter['cmid']] = true;
            if ($checkreferences && (!$DB->record_exists('course_modules', ['id' => $starter['cmid'],
                    'deletioninprogress' => 0, 'completion' => 2]))) {
                throw new \invalid_parameter_exception('Starter needs automatic Moodle activity completion');
            }
            if ($checkreferences) {
                $raw = get_coursemodule_from_id(null, $starter['cmid'], 0, false, MUST_EXIST);
                $course = get_course($raw->course);
                $cm = get_fast_modinfo($course)->get_cm($raw->id);
                if (!$course->visible || !$cm->visible || !recommendations::substantive_starter($cm) ||
                        !milestone_eligibility::configured($cm, $course, $starter['requirepass'] ? 'pass' : 'complete')) {
                    throw new \invalid_parameter_exception('Starter requires a visible course/activity, enabled site/course completion and substantive automatic completion. For requirepass, configure a native passing grade and pass completion.');
                }
            }
        }
        foreach ($data['outcomes'] as $key => $outcome) {
            if (!preg_match('/^(course|activity):([1-9][0-9]*)$/D', $key, $match) || !is_string($outcome) ||
                    trim($outcome) === '' || \core_text::strlen($outcome) > 300 ||
                    clean_param($outcome, PARAM_TEXT) !== $outcome) {
                throw new \invalid_parameter_exception('Outcomes need course:ID or activity:CMID and plain text (300 characters)');
            }
            if ($checkreferences && (!$DB->record_exists($match[1] === 'course' ? 'course' : 'course_modules',
                    ['id' => (int)$match[2]]) || ($match[1] === 'course' && (int)$match[2] === SITEID))) {
                throw new \invalid_parameter_exception('Outcome target does not exist');
            }
        }
        return $data;
    }

    /** Only installed local-plugin pages; no external redirect, query, or traversal. */
    public static function valid_route(string $route): bool {
        return $route === '' || (bool)preg_match('~^/local/ignite/[a-z][a-z0-9_/-]*\.php$~D', $route) &&
            !in_array($route, ['/local/ignite/houses.php', '/local/ignite/index.php',
                '/local/ignite/onboarding.php', '/local/ignite/invitation.php', '/local/ignite/tour.php']);
    }

    public static function selection_url(): ?\moodle_url {
        global $CFG;
        $route = get_config('local_ignite', 'hearthselectionroute') ?: '';
        if (!access::enabled('houses') || !$route || !self::valid_route($route)) {
            return null;
        }
        $file = realpath($CFG->dirroot . $route);
        $pluginroot = realpath($CFG->dirroot . '/local/ignite');
        if (!$file || !$pluginroot || !str_starts_with($file, $pluginroot . DIRECTORY_SEPARATOR) ||
                !is_readable($file) || !houses::available()) {
            return null;
        }
        return new \moodle_url($route);
    }
}
