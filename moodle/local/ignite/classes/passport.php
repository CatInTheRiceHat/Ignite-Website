<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** Collectible presentation of native credentials. This class has no award or completion mutations. */
final class passport {
    public static function collection_current(): array {
        global $CFG, $DB, $OUTPUT;
        $userid = access::learner('passport');
        $data = ['nativeenabled' => !empty($CFG->enablebadges), 'canview' => false,
            'earned' => [], 'pursue' => [], 'featured' => [],
            'passporturl' => (new \moodle_url('/local/ignite/passport.php'))->out(false),
            'featuredurl' => (new \moodle_url('/local/ignite/featured.php'))->out(false),
            'nativeurl' => (new \moodle_url('/badges/mybadges.php'))->out(false),
            'homeurl' => (new \moodle_url('/local/ignite/index.php'))->out(false),
            'learnurl' => (new \moodle_url('/course/index.php'))->out(false),
            'solurl' => $OUTPUT->image_url('graduation', 'local_ignite')->out(false),
            'framecolor' => '#62564D', 'hearthname' => '', 'hashearth' => false];
        // The foundation service owns membership. No onboarding or Prompt 3 dependency.
        if (access::enabled('houses') && ($hearth = houses::get_current())) {
            $data['hearthname'] = $hearth->name;
            $data['hashearth'] = true;
            $data['framecolor'] = houses::valid_accent($hearth->accent) ? $hearth->accent : '#62564D';
        }
        if (!$data['nativeenabled'] || !has_capability('moodle/badges:manageownbadges', \context_user::instance($userid))) {
            return $data;
        }
        $data['canview'] = true;
        require_once($CFG->libdir . '/badgeslib.php');
        $catalog = passport_catalog::get();
        $ids = array_fill_keys(array_keys($catalog), true);
        foreach (badges_get_user_badges($userid) as $owned) {
            $ids[(int)$owned->id] = true;
        }
        $features = $DB->get_records('local_ignite_feature', ['userid' => $userid], 'slot');
        $cards = [];
        foreach (array_keys($ids) as $id) {
            $card = self::badge_current((int)$id, false);
            if (!$card) {
                continue;
            }
            $cards[$id] = $card;
            $data[$card['owned'] ? 'earned' : 'pursue'][] = $card;
        }
        foreach ($features as $feature) {
            $card = $cards[$feature->badgeid] ?? null;
            // A revoked and reissued credential must not silently regain its old featured placement.
            if ($card && $card['featureable'] && $card['issuedid'] === (int)$feature->issuedid) {
                $data['featured'][] = $card;
            }
        }
        $data['hasearned'] = (bool)$data['earned'];
        $data['haspursue'] = (bool)$data['pursue'];
        $data['hasfeatured'] = (bool)$data['featured'];
        $data['earnedcount'] = count($data['earned']);
        $data['categories'] = array_map(static fn($key) => ['name' => get_string('passport_category_' . $key, 'local_ignite')],
            passport_catalog::CATEGORIES);
        return $data;
    }

    /** Current learner detail, or null with no disclosure for unavailable IDs. */
    public static function badge_current(int $badgeid, bool $details = true): ?array {
        global $PAGE;
        access::learner('passport');
        $metadata = passport_catalog::get()[$badgeid] ?? null;
        if ($metadata && (!$metadata['enabled'] ||
                ($metadata['courseid'] && !badge_state::course_visible($metadata['courseid'])))) {
            return null;
        }
        $state = badge_state::get_current($badgeid);
        // Unmapped badges are allowed only when owned; preview is an administrator-curated collection.
        if (!$state || (!$metadata && !$state['owned'])) {
            return null;
        }
        $badge = new \core_badges\badge($badgeid);
        $context = $badge->get_context();
        $category = $metadata['category'] ?? 'other';
        $data = $state + [
            'name' => content_to_text(format_string($badge->name, true, ['context' => $context]), false),
            'category' => get_string('passport_category_' . $category, 'local_ignite'),
            'statuslabel' => get_string('passport_state_' . $state['state'], 'local_ignite'),
            'detailurl' => (new \moodle_url('/local/ignite/badge.php', ['id' => $badgeid]))->out(false),
            'dateissuedtext' => $state['dateissued'] ? userdate($state['dateissued']) : '',
            'dateexpiretext' => $state['dateexpire'] ? userdate($state['dateexpire']) : '',
            'primary' => !empty($metadata['primary']), 'caption' => $metadata['caption'] ?? '',
            'imageurl' => '', 'placeholder' => true,
        ];
        if (($metadata['artwork'] ?? '') === 'native' && get_file_storage()->file_exists(
                $context->id, 'badges', 'badgeimage', $badgeid, '/', 'f3.png')) {
            $data['imageurl'] = \moodle_url::make_pluginfile_url($context->id, 'badges', 'badgeimage',
                $badgeid, '/', 'f3')->out(false);
        } else if (($metadata['artwork'] ?? '') === 'course') {
            $data['imageurl'] = \core_course\external\course_summary_exporter::get_course_image(
                get_course($metadata['courseid'])) ?: '';
        }
        $data['placeholder'] = $data['imageurl'] === '';
        if (!$details) {
            return $data;
        }
        $data['description'] = format_text($badge->description, FORMAT_HTML, ['context' => $context, 'noclean' => false]);
        // Visibility adapters in badge_state run before native output reveals any referenced names.
        $data['criteria'] = clean_text($PAGE->get_renderer('core', 'badges')->print_badge_criteria(clone $badge), FORMAT_HTML);
        $data['issuer'] = content_to_text(format_string($badge->issuername, true, ['context' => $context]), false);
        $data['coursecompleteknown'] = $state['coursecomplete'] !== null;
        $data['coursecompletelabel'] = $state['coursecomplete'] ? get_string('yes') : get_string('no');
        $data['hascourse'] = (bool)$badge->courseid;
        $data['coursename'] = $badge->courseid ? content_to_text(format_string(get_course($badge->courseid)->fullname,
            true, ['context' => $context]), false) : '';
        $data['actionurl'] = (new \moodle_url($badge->courseid ? '/course/view.php' : '/course/index.php',
            $badge->courseid ? ['id' => $badge->courseid] : []))->out(false);
        $data['actionlabel'] = get_string($badge->courseid ? 'passport_returncourse' : 'explorecourses', 'local_ignite');
        $data['nativeurl'] = (new \moodle_url('/badges/mybadges.php'))->out(false);
        $data['passporturl'] = (new \moodle_url('/local/ignite/passport.php'))->out(false);
        $data['featuredurl'] = (new \moodle_url('/local/ignite/featured.php'))->out(false);
        $data['pending'] = in_array($state['state'], ['pendingissuance', 'pendinggrading'], true);
        return $data;
    }

    public static function validate_featured_current(array $badgeids): array {
        global $CFG;
        $userid = access::learner('passport');
        require_capability('moodle/badges:manageownbadges', \context_user::instance($userid));
        if (empty($CFG->enablebadges)) {
            throw new \moodle_exception('badgesdisabled', 'badges');
        }
        if (!array_is_list($badgeids) || count($badgeids) > 3) {
            throw new \invalid_parameter_exception('Choose up to three available owned badges');
        }
        $result = [];
        foreach ($badgeids as $id) {
            if ((!is_int($id) && (!is_string($id) || !preg_match('/^[1-9][0-9]{0,9}$/D', $id))) ||
                    (int)$id <= 0 || isset($result[(int)$id])) {
                throw new \invalid_parameter_exception('Invalid or duplicate badge ID');
            }
            $card = self::badge_current((int)$id, false);
            if (!$card || !$card['featureable']) {
                throw new \invalid_parameter_exception('Choose up to three available owned badges');
            }
            $result[(int)$id] = $card;
        }
        return $result;
    }

    /** Replace only the authenticated learner's featured choices. Native tables are read-only. */
    public static function save_featured_current(array $badgeids): void {
        global $DB;
        $userid = access::learner('passport');
        require_sesskey();
        access::locked('user:' . $userid, static function() use ($DB, $userid, $badgeids) {
            $cards = self::validate_featured_current($badgeids);
            $DB->delete_records('local_ignite_feature', ['userid' => $userid]);
            $slot = 0;
            foreach ($cards as $card) {
                $DB->insert_record('local_ignite_feature', (object)[
                    'userid' => $userid, 'badgeid' => $card['badgeid'], 'issuedid' => $card['issuedid'],
                    'slot' => ++$slot, 'timemodified' => time(),
                ]);
            }
        });
    }
}
