<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class catalog {
    public const EMPTY = '{"interests":{},"paths":{}}';

    /** Read IDs without trusting configuration to grant course or activity access. */
    public static function get(): array {
        return self::parse(get_config('local_ignite', 'catalog') ?: self::EMPTY, false);
    }

    /** Validate the entire configuration before Moodle stores it. No partial mappings. */
    public static function parse(string $json, bool $checkreferences = true): array {
        global $DB;
        if (strlen($json) > 100000) {
            throw new \invalid_parameter_exception('Catalog exceeds 100 KB');
        }
        try {
            $object = json_decode($json, false, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \invalid_parameter_exception('Invalid JSON');
        }
        if (!$object instanceof \stdClass || array_diff(array_keys((array)$object), ['interests', 'paths']) ||
                !isset($object->interests, $object->paths) || !$object->interests instanceof \stdClass ||
                !$object->paths instanceof \stdClass) {
            throw new \invalid_parameter_exception('Expected interests and paths objects');
        }
        $data = json_decode($json, true, 32, JSON_THROW_ON_ERROR);
        if (count($data['interests']) > 50 || count($data['paths']) > 50) {
            throw new \invalid_parameter_exception('At most 50 interests and paths');
        }
        foreach (['interests', 'paths'] as $kind) {
            foreach ($data[$kind] as $id => $entry) {
                $fields = $kind === 'interests' ? ['name', 'courseids', 'activityids'] : ['name', 'interestids'];
                if (!is_string($id) || !preg_match('/^[a-z][a-z0-9_-]{0,63}$/D', $id) ||
                        !is_array($entry) || array_diff(array_keys($entry), $fields) ||
                        !isset($entry['name']) || !is_string($entry['name']) || trim($entry['name']) === '' ||
                        \core_text::strlen($entry['name']) > 100 || clean_param($entry['name'], PARAM_TEXT) !== $entry['name']) {
                    throw new \invalid_parameter_exception('Invalid catalog ID, name or field');
                }
                foreach (array_slice($fields, 1) as $field) {
                    $values = $entry[$field] ?? [];
                    if (!is_array($values) || !array_is_list($values) || count($values) > 200) {
                        throw new \invalid_parameter_exception('Expected a list of IDs');
                    }
                    foreach ($values as $value) {
                        if ($field === 'interestids') {
                            if (!is_string($value) || !isset($data['interests'][$value])) {
                                throw new \invalid_parameter_exception('Unknown path interest');
                            }
                        } else {
                            if (!is_int($value) || $value < 1 || ($field === 'courseids' && $value === SITEID)) {
                                throw new \invalid_parameter_exception('Expected a positive course or course-module ID');
                            }
                            $table = $field === 'courseids' ? 'course' : 'course_modules';
                            if ($checkreferences && !$DB->record_exists($table, ['id' => $value])) {
                                throw new \invalid_parameter_exception('Course or activity does not exist');
                            }
                            if ($checkreferences && $table === 'course_modules' &&
                                    $DB->get_field($table, 'deletioninprogress', ['id' => $value])) {
                                throw new \invalid_parameter_exception('Activity is being deleted');
                            }
                        }
                    }
                }
            }
        }
        return $data;
    }
}
