<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class installation {
    /** Add missing examples only. Immutable codes are never derived from edited names. */
    public static function seed_houses(): void {
        global $DB;
        $examples = [
            'ember' => ['Ember', '#934214', 'sol'],
            'flare' => ['Flare', '#A52D24', 'celebrate'],
            'nova' => ['Nova', '#6741A5', 'lightbulb'],
            'phoenix' => ['Phoenix', '#8A391B', 'graduation'],
        ];
        foreach ($examples as $code => [$name, $accent, $emblem]) {
            if (!$DB->record_exists('local_ignite_house', ['code' => $code])) {
                $DB->insert_record('local_ignite_house', (object)[
                    'code' => $code, 'name' => $name,
                    'description' => get_string('examplehouse', 'local_ignite'),
                    'accent' => $accent, 'emblem' => $emblem,
                    'active' => 1, 'timemodified' => time(),
                ]);
            }
        }
    }
}
