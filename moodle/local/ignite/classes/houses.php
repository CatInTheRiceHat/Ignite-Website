<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class houses {
    public const EMBLEMS = ['sol', 'celebrate', 'lightbulb', 'graduation'];
    public const MASCOTS = ['placeholder', 'sol', 'celebrate', 'lightbulb', 'graduation'];

    public static function get_current(): ?\stdClass {
        global $DB;
        $userid = access::learner('houses');
        // Inactive houses retain their existing members and identity.
        return $DB->get_record_sql('SELECT h.*, m.timecreated AS timejoined, m.timemodified AS membershipmodified
            FROM {local_ignite_house} h JOIN {local_ignite_member} m ON m.houseid = h.id
            WHERE m.userid = ?', [$userid]) ?: null;
    }

    public static function available(): array {
        global $DB;
        access::learner('houses');
        return $DB->get_records('local_ignite_house', ['active' => 1], 'id');
    }

    /** Idempotent assignment; the unique user key is a second line of concurrency protection. */
    public static function set_current(?int $houseid): void {
        global $DB;
        $userid = access::learner('houses');
        require_sesskey();
        // Shared config lock serializes deactivation with membership changes.
        access::locked('houses', static function() use ($DB, $userid, $houseid) {
            access::locked('user:' . $userid, static function() use ($DB, $userid, $houseid) {
                $existing = $DB->get_record('local_ignite_member', ['userid' => $userid]);
                $house = $houseid === null ? null :
                    $DB->get_record('local_ignite_house', ['id' => $houseid], '*', MUST_EXIST);
                if (($existing && (int)$existing->houseid === $houseid) || (!$existing && $houseid === null)) {
                    return;
                }
                if ($house && !$house->active) {
                    throw new \invalid_parameter_exception('Inactive house');
                }
                $now = time();
                $DB->set_field('local_ignite_history', 'timeend', $now, ['userid' => $userid, 'timeend' => 0]);
                if ($houseid === null) {
                    $DB->delete_records('local_ignite_member', ['userid' => $userid]);
                    return;
                }
                $DB->insert_record('local_ignite_history', (object)[
                    'userid' => $userid, 'houseid' => $houseid, 'timebegin' => $now, 'timeend' => 0,
                ]);
                $record = (object)['userid' => $userid, 'houseid' => $houseid, 'timemodified' => time()];
                if ($existing) {
                    $record->id = $existing->id;
                    $DB->update_record('local_ignite_member', $record);
                } else {
                    $record->timecreated = time();
                    $DB->insert_record('local_ignite_member', $record);
                }
            });
        });
    }

    /** All accents support white text at WCAG AA, even when used as a future badge background. */
    public static function valid_accent(string $color): bool {
        if (!preg_match('/^#[0-9a-fA-F]{6}$/D', $color)) {
            return false;
        }
        $rgb = array_map(static function($value) {
            $value = hexdec($value) / 255;
            return $value <= 0.04045 ? $value / 12.92 : (($value + 0.055) / 1.055) ** 2.4;
        }, str_split(substr($color, 1), 2));
        return 1.05 / (0.2126 * $rgb[0] + 0.7152 * $rgb[1] + 0.0722 * $rgb[2] + 0.05) >= 4.5;
    }

    /** Edit an existing stable ID. There is intentionally no destructive house delete operation. */
    public static function configure(int $id, array $data): void {
        global $DB;
        access::administrator();
        require_sesskey();
        if (array_diff(array_keys($data), ['name', 'description', 'accent', 'emblem', 'active', 'shortname', 'personality', 'mascot']) ||
                !isset($data['name'], $data['description'], $data['accent'], $data['emblem'], $data['active']) ||
                !is_string($data['name']) || trim($data['name']) === '' || \core_text::strlen($data['name']) > 100 ||
                clean_param($data['name'], PARAM_TEXT) !== $data['name'] ||
                !is_string($data['description']) || \core_text::strlen($data['description']) > 2000 ||
                clean_param($data['description'], PARAM_TEXT) !== $data['description'] ||
                !is_string($data['accent']) || !self::valid_accent($data['accent']) ||
                !in_array($data['emblem'], self::EMBLEMS, true) || !in_array($data['active'], [0, 1], true)) {
            throw new \invalid_parameter_exception('Invalid house configuration');
        }
        foreach (['shortname' => 100, 'personality' => 2000] as $field => $maxlength) {
            if (isset($data[$field]) && (!is_string($data[$field]) ||
                    \core_text::strlen($data[$field]) > $maxlength || clean_param($data[$field], PARAM_TEXT) !== $data[$field])) {
                throw new \invalid_parameter_exception('Invalid Hearth identity');
            }
        }
        if (isset($data['mascot']) && !in_array($data['mascot'], self::MASCOTS, true)) {
            throw new \invalid_parameter_exception('Invalid approved mascot');
        }
        access::locked('houses', static function() use ($DB, $id, $data) {
            $record = $DB->get_record('local_ignite_house', ['id' => $id], '*', MUST_EXIST);
            $DB->update_record('local_ignite_house', (object)(['id' => $record->id] + $data + ['timemodified' => time()]));
        });
    }
}
