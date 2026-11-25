<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

final class installation {
    public static function seed_houses(): void {
        global $DB;
        $ids = campfire::ids();
        $houses = $DB->get_records('local_ignite_house');
        foreach (campfire::TEAMS as $code => $name) {
            if (isset($ids[$code])) {
                continue;
            }
            $id = $DB->get_field('local_ignite_house', 'id', ['code' => $code]);
            if (!$id) {
                $matches = array_filter($houses, static fn($h) => !isset(campfire::TEAMS[$h->code]) &&
                    !in_array((int)$h->id, $ids, true) &&
                    (strcasecmp(trim($h->name), $name) === 0 || strcasecmp(trim($h->shortname), $name) === 0));
                $id = count($matches) === 1 ? reset($matches)->id : null;
            }
            if (!$id) {
                $id = $DB->insert_record('local_ignite_house', (object)[
                    'code' => $code, 'name' => $name, 'shortname' => $name, 'description' => '',
                    'accent' => '#62564D', 'emblem' => 'sol', 'mascot' => 'placeholder',
                    'active' => 1, 'timemodified' => time(),
                ]);
            }
            $ids[$code] = (int)$id;
        }
        set_config('campfireids', json_encode($ids), 'local_ignite');
    }
}
