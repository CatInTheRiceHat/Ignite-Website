<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
final class hearth_setup {
    public const DRAFTS = [
        'embercrest' => ['Embercrest Hearth', 'Embercrest', 'Bring care, warmth and encouragement. Help make room for belonging.'],
        'cinderwick' => ['Cinderwick Hearth', 'Cinderwick', 'Ask questions, explore clever ideas and discover what you can invent.'],
        'flarewood' => ['Flarewood Hearth', 'Flarewood', 'Make space for joy, play and creative expression.'],
        'blazethorn' => ['Blazethorn Hearth', 'Blazethorn', 'Try an adventure, practise courage and keep going together.'],
    ];

    /** Explicit mappings only; never guess which existing ID should receive an identity. */
    public static function apply(array $targets): void {
        global $DB;
        access::administrator();
        require_sesskey();
        $existingids = array_filter($targets, static fn($id) => $id > 0);
        if (array_diff_key($targets, self::DRAFTS) || count(array_unique($existingids)) !== count($existingids)) {
            throw new \invalid_parameter_exception('Choose distinct existing Hearths');
        }
        access::locked('houses', static function() use ($DB, $targets) {
            foreach ($targets as $code => $id) {
                if (!$id) {
                    continue;
                }
                [$name, $short, $personality] = self::DRAFTS[$code];
                if ($id === -1) {
                    if ($DB->record_exists('local_ignite_house', ['code' => $code])) {
                        throw new \invalid_parameter_exception('Stable code already exists; choose the existing record');
                    }
                    $DB->insert_record('local_ignite_house', (object)[
                        'code' => $code, 'name' => $name, 'shortname' => $short,
                        'description' => get_string('draftdescription', 'local_ignite'), 'personality' => $personality,
                        // A common neutral accent is a placeholder, not a proposed color assignment.
                        'accent' => '#534943', 'emblem' => 'sol', 'mascot' => 'placeholder', 'active' => 1,
                        'timemodified' => time(),
                    ]);
                } else if ($id > 0) {
                    $DB->get_record('local_ignite_house', ['id' => $id], '*', MUST_EXIST);
                    // Leave color, artwork, description and active status untouched for existing records.
                    $DB->update_record('local_ignite_house', (object)[
                        'id' => $id, 'name' => $name, 'shortname' => $short,
                        'personality' => $personality, 'timemodified' => time(),
                    ]);
                } else {
                    throw new \invalid_parameter_exception('Invalid setup target');
                }
            }
        });
    }
}
