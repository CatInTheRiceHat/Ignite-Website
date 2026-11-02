<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** Presentation configuration only: never changes a credential or its award criteria. */
final class passport_catalog {
    public const EMPTY = '{"badges":{}}';
    public const CATEGORIES = ['starter', 'skill', 'explorer', 'project', 'collaborator'];
    public const ARTWORK = ['placeholder', 'native', 'course'];

    public static function get(): array {
        // References may disappear after configuration. Reads must not break the learner page.
        return self::parse(get_config('local_ignite', 'passportcatalog') ?: self::EMPTY, false);
    }

    public static function parse(string $json, bool $checkreferences = true): array {
        global $CFG, $DB;
        require_once($CFG->libdir . '/badgeslib.php');
        if (strlen($json) > 100000) {
            throw new \invalid_parameter_exception('Passport mapping is too large');
        }
        $data = json_decode($json);
        if (!$data instanceof \stdClass || array_keys((array)$data) !== ['badges'] ||
                !$data->badges instanceof \stdClass || count((array)$data->badges) > 200) {
            throw new \invalid_parameter_exception('Expected a badges object');
        }
        $result = [];
        $primarycourses = [];
        foreach ((array)$data->badges as $id => $entry) {
            if (!preg_match('/^[1-9][0-9]{0,9}$/D', (string)$id) || !$entry instanceof \stdClass ||
                    array_diff(array_keys((array)$entry), ['category', 'courseid', 'primary', 'artwork', 'caption', 'enabled']) ||
                    !isset($entry->category) || !in_array($entry->category, self::CATEGORIES, true)) {
                throw new \invalid_parameter_exception('Invalid Passport badge mapping');
            }
            $entry = (array)$entry + ['courseid' => null, 'primary' => false, 'artwork' => 'placeholder',
                'caption' => '', 'enabled' => true];
            if (($entry['courseid'] !== null && (!is_int($entry['courseid']) || $entry['courseid'] <= SITEID)) ||
                    !is_bool($entry['primary']) || !is_bool($entry['enabled']) ||
                    !in_array($entry['artwork'], self::ARTWORK, true) || !is_string($entry['caption']) ||
                    \core_text::strlen($entry['caption']) > 250 ||
                    clean_param($entry['caption'], PARAM_TEXT) !== $entry['caption'] ||
                    ($entry['artwork'] === 'course' && !$entry['courseid']) ||
                    ($entry['primary'] && (!$entry['courseid'] || $entry['category'] !== 'skill'))) {
                throw new \invalid_parameter_exception('Invalid Passport presentation metadata');
            }
            if ($entry['primary'] && isset($primarycourses[$entry['courseid']])) {
                throw new \invalid_parameter_exception('Only one primary collectible per course');
            }
            if ($entry['primary']) {
                $primarycourses[$entry['courseid']] = true;
            }
            if ($checkreferences) {
                $badge = new \core_badges\badge((int)$id);
                if ($entry['courseid'] && (!$DB->record_exists('course', ['id' => $entry['courseid']]) ||
                        ((int)$badge->type === BADGE_TYPE_COURSE && (int)$badge->courseid !== $entry['courseid']))) {
                    throw new \invalid_parameter_exception('Course must exist and match the course badge');
                }
                // A course primary must really depend on this course's completion, with no alternative award route.
                if ($entry['primary']) {
                    $criteria = $badge->criteria;
                    $coursecriterion = $criteria[BADGE_CRITERIA_TYPE_COURSE] ?? null;
                    $params = $coursecriterion ? array_values($coursecriterion->params) : [];
                    if ((int)$badge->type !== BADGE_TYPE_COURSE || !$coursecriterion || count($params) !== 1 ||
                            (int)($params[0]['course'] ?? 0) !== $entry['courseid'] ||
                            (count($criteria) > 2 && (int)$badge->get_aggregation_method() !== BADGE_CRITERIA_AGGREGATION_ALL) ||
                            !$DB->get_field('course', 'enablecompletion', ['id' => $entry['courseid']]) ||
                            !$DB->record_exists('course_completion_criteria', ['course' => $entry['courseid']])) {
                        throw new \invalid_parameter_exception('Primary collectibles require native course completion criteria');
                    }
                }
            }
            $result[(int)$id] = $entry;
        }
        return $result;
    }
}
