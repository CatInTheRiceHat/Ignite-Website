<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Presentation and narrowly permitted navigation; membership remains in the foundation service. */
final class hearth_ui {
    /** Only known learner destinations; reject remote URLs, arbitrary endpoints, and missing sibling routes. */
    public static function return_url(string $requested = ''): \moodle_url {
        global $CFG;
        $fallback = new \moodle_url('/local/ignite/index.php');
        if ($requested === '' || preg_match('/[\x00-\x20\\\\]/', $requested)) {
            return $fallback;
        }
        $parts = parse_url($requested);
        $site = parse_url($CFG->wwwroot);
        if (!$parts || isset($parts['user']) || isset($parts['pass']) || isset($parts['fragment']) ||
                str_starts_with($requested, '//') ||
                (isset($parts['host']) && ($parts['host'] !== $site['host'] ||
                ($parts['scheme'] ?? '') !== $site['scheme'] || ($parts['port'] ?? null) !== ($site['port'] ?? null)))) {
            return $fallback;
        }
        $path = $parts['path'] ?? '';
        $prefix = rtrim($site['path'] ?? '', '/');
        if ($prefix && str_starts_with($path, $prefix . '/')) {
            $path = substr($path, strlen($prefix));
        }
        $allowed = ['/local/ignite/index.php', '/local/ignite/hearth.php', '/local/ignite/onboarding.php',
            '/local/ignite/passport.php', '/my/', '/my/index.php', '/my/courses.php'];
        if (!in_array($path, $allowed, true) ||
                (str_starts_with($path, '/my/') && $path !== '/my/courses.php' && empty($CFG->enabledashboard)) ||
                ($path === '/my/courses.php' && empty($CFG->enablemycourses)) ||
                (str_contains($path, 'onboarding') && !access::enabled('onboarding')) ||
                (str_contains($path, 'passport') && !access::enabled('passport')) ||
                (!is_file($CFG->dirroot . ($path === '/my/' ? '/my/index.php' : $path)))) {
            return $fallback;
        }
        // Deliberately discard untrusted query parameters; siblings can resume from server state.
        return new \moodle_url($path);
    }

    public static function choice_cards(array $available, ?\stdClass $current = null): array {
        $cards = [];
        foreach ($available as $house) {
            $card = self::identity($house);
            $card['current'] = $current && (int)$current->id === (int)$house->id;
            $cards[] = $card;
        }
        return $cards;
    }

    /** Preview the available Campfires in reading order, using their stable membership IDs. */
    public static function preview_slides(array $available): array {
        global $OUTPUT;
        $ids = campfire::ids();
        $slides = [];
        foreach (['forgelings', 'candlelings', 'lanternlings'] as $team) {
            $id = $ids[$team] ?? null;
            if (!isset($available[$id])) {
                continue;
            }
            $slides[] = ['id' => $id, 'team' => $team, 'name' => $available[$id]->name,
                'description' => get_string('preview_' . $team, 'local_ignite'),
                'art' => $OUTPUT->image_url('campfire/' . $team, 'local_ignite')->out(false),
                'topcrest' => $OUTPUT->image_url('campfire/' . $team . '-top', 'local_ignite')->out(false),
                'bottomcrest' => $OUTPUT->image_url('campfire/' . $team . '-bottom', 'local_ignite')->out(false)];
        }
        return $slides;
    }

    public static function identity(\stdClass $house): array {
        global $OUTPUT;
        return [
            'id' => $house->id, 'name' => $house->name, 'shortname' => $house->shortname,
            'description' => $house->description, 'personality' => $house->personality,
            'inactive' => !$house->active,
            'emblemurl' => self::asset_url($house, 'emblem'),
            'mascoturl' => self::asset_url($house, 'mascot'),
            'placeholder' => !self::asset_url($house, 'mascot'),
            'accent' => houses::valid_accent($house->accent) ? $house->accent : '#934214',
        ];
    }

    public static function campfire_emblem(string $team, string $emblem): string {
        if ($emblem !== 'sol' && in_array($emblem, houses::EMBLEMS, true)) {
            return $emblem . '.png';
        }
        return 'campfire/' . $team . '.jpg';
    }

    private static function asset_url(\stdClass $house, string $area): string {
        global $OUTPUT;
        $files = get_file_storage()->get_area_files(\context_system::instance()->id, 'local_ignite',
            $area, $house->id, 'id', false);
        if ($files) {
            $file = reset($files);
            return \moodle_url::make_pluginfile_url(\context_system::instance()->id, 'local_ignite', $area,
                $house->id, '/', $file->get_filename())->out(false);
        }
        $team = array_search((int)$house->id, campfire::ids(), true);
        if ($area === 'emblem' && $team !== false) {
            $art = self::campfire_emblem($team, $house->emblem);
            return $OUTPUT->image_url(substr($art, 0, -4), 'local_ignite')->out(false);
        }
        if ($area === 'mascot' && $team !== false && $house->mascot === 'placeholder') {
            return $OUTPUT->image_url('campfire/' . $team, 'local_ignite')->out(false);
        }
        $key = $house->$area ?? 'placeholder';
        return in_array($key, houses::EMBLEMS, true) ? $OUTPUT->image_url($key, 'local_ignite')->out(false) : '';
    }

    /** Learner-scoped eligible action; never disclose hidden/restricted activity titles. */
    public static function next_action(?\stdClass $challenge): ?array {
        global $DB, $CFG;
        $userid = access::learner('houses');
        if (!$challenge) {
            return null;
        }
        require_once($CFG->libdir . '/completionlib.php');
        foreach ($DB->get_records('local_ignite_milestone', ['challengeid' => $challenge->id], 'id') as $milestone) {
            $raw = $DB->get_record('course_modules', ['id' => $milestone->cmid, 'deletioninprogress' => 0]);
            if (!$raw) {
                continue;
            }
            $course = get_course($raw->course);
            $context = \context_course::instance($course->id);
            if (!is_enrolled($context, $userid, '', true) || !can_access_course($course, null, '', true)) {
                continue;
            }
            $cm = get_fast_modinfo($course, $userid)->get_cm($raw->id);
            $viewcapability = 'mod/' . $cm->modname . ':view';
            if (!$cm->uservisible || !$cm->available || !$cm->url || !$cm->completion ||
                    (get_capability_info($viewcapability, false) && !has_capability($viewcapability,
                        \context_module::instance($cm->id), $userid))) {
                continue;
            }
            // Repeated/withdrawn/excluded milestones offer no new credit in this period.
            if ($DB->record_exists('local_ignite_credit', [
                    'challengeid' => $challenge->id, 'userid' => $userid, 'cmid' => $cm->id])) {
                continue;
            }
            $completion = new \completion_info($course);
            $state = $completion->get_data($cm, false, $userid);
            if (challenges::qualifies((int)$state->completionstate, $milestone->conditiontype)) {
                continue;
            }
            return ['url' => $cm->url->out(false), 'name' => format_string($cm->name, true,
                ['context' => \context_module::instance($cm->id)])];
        }
        return null;
    }
}
