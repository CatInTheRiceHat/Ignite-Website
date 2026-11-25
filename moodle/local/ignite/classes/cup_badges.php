<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

use core_badges\award_manager;
use core_badges\badge;

defined('MOODLE_INTERNAL') || die();

/** Only the month/team definition mapping is local. Moodle owns issuance, images and visibility. */
final class cup_badges {
    private static function create(int $month, string $team): int {
        global $CFG, $DB, $SITE;
        $roles = get_roles_with_capability('moodle/badges:awardbadge', CAP_ALLOW, \context_system::instance());
        if (!$roles) {
            throw new \moodle_exception('cupawardrole', 'local_ignite');
        }
        ksort($roles, SORT_NUMERIC);
        $managers = array_filter($roles, static fn($role) => $role->archetype === 'manager');
        $roleid = (int)array_key_first($managers ?: $roles);
        $reason = get_string('cupreason', 'local_ignite', (object)['team' => campfire::TEAMS[$team],
            'month' => campfire_cup::month_label($month)]);
        $badge = badge::create_badge((object)['name' => campfire_cup::title($month), 'version' => '1', 'language' => 'en',
            'description' => $reason, 'imagecaption' => campfire::TEAMS[$team],
            'issuername' => $CFG->badges_defaultissuername ?: $SITE->fullname, 'issuerurl' => $CFG->wwwroot,
            'issuercontact' => $CFG->badges_defaultissuercontact ?? '']);
        \award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => BADGE_CRITERIA_TYPE_OVERALL])
            ->save(['agg' => BADGE_CRITERIA_AGGREGATION_ALL]);
        \award_criteria::build(['badgeid' => $badge->id, 'criteriatype' => BADGE_CRITERIA_TYPE_MANUAL])
            ->save(['role_' . $roleid => $roleid, 'description' => $reason]);

        $files = get_file_storage();
        $contextid = $badge->get_context()->id;
        $emblems = $files->get_area_files($contextid, 'local_ignite', 'emblem', campfire::ids()[$team], 'id', false);
        $image = make_request_directory() . '/cup-image';
        if ($emblems) {
            $emblem = reset($emblems);
            if ($emblem->get_mimetype() === 'image/webp') {
                // Moodle's badge image importer accepts JPEG and PNG.
                $bitmap = imagecreatefromstring($emblem->get_content());
                if (!$bitmap || !imagepng($bitmap, $image)) {
                    throw new \moodle_exception('cupimage', 'local_ignite');
                }
            } else {
                $emblem->copy_content_to($image);
            }
        } else {
            $emblem = $DB->get_field('local_ignite_house', 'emblem', ['id' => campfire::ids()[$team]]);
            $art = hearth_ui::campfire_emblem($team, $emblem);
            copy($CFG->dirroot . '/local/ignite/pix/' . $art, $image);
        }
        badges_process_badge_image($badge, $image);
        if (!$files->file_exists($contextid, 'badges', 'badgeimage', $badge->id, '/', 'f3.png')) {
            throw new \moodle_exception('cupimage', 'local_ignite');
        }
        $badge->set_status(BADGE_STATUS_ACTIVE);
        $DB->insert_record('local_ignite_cupbadge', ['earnmonth' => $month, 'team' => $team, 'badgeid' => $badge->id]);
        return (int)$badge->id;
    }

    /** The caller holds the month lock. Each changed recipient commits separately for interruption recovery. */
    public static function synchronize(int $month, array $recipients): void {
        global $DB, $CFG;
        require_once($CFG->libdir . '/badgeslib.php');
        $definitions = $DB->get_records_menu('local_ignite_cupbadge', ['earnmonth' => $month], '', 'team, badgeid');
        if (!$definitions && !$recipients) {
            return;
        }
        if (empty($CFG->enablebadges)) {
            throw new \moodle_exception('cupenablebadges', 'local_ignite');
        }
        foreach (array_unique($recipients) as $team) {
            if (!isset($definitions[$team])) {
                $definitions[$team] = access::locked('cup-definition-' . $month . '-' . $team,
                    static fn() => self::create($month, $team));
            }
        }
        $issues = $DB->get_records_sql('SELECT i.id, i.userid, b.team
              FROM {local_ignite_cupbadge} b JOIN {badge_issued} i ON i.badgeid = b.badgeid
             WHERE b.earnmonth = ?', [$month]);
        $owned = [];
        foreach ($issues as $issue) {
            $owned[$issue->userid][] = $issue->team;
        }
        $issuerid = (int)get_admin()->id;
        foreach (array_unique(array_merge(array_keys($owned), array_keys($recipients))) as $userid) {
            $target = $recipients[$userid] ?? null;
            $existing = $owned[$userid] ?? [];
            if ($existing === ($target === null ? [] : [$target])) {
                continue;
            }
            access::locked('cup-recipient-' . $month . '-' . $userid,
                static function() use ($definitions, $userid, $target, $existing, $issuerid) {
                    foreach ($existing as $team) {
                        if ($team !== $target) {
                            $badge = new badge($definitions[$team]);
                            $crit = $badge->criteria[BADGE_CRITERIA_TYPE_MANUAL];
                            $roleid = (int)reset($crit->params)['role'];
                            award_manager::process_manual_revoke($userid, 0, $roleid, $badge->id);
                        }
                    }
                    if ($target === null || in_array($target, $existing, true)) {
                        return;
                    }
                    $badge = new badge($definitions[$target]);
                    $crit = $badge->criteria[BADGE_CRITERIA_TYPE_MANUAL];
                    $roleid = (int)reset($crit->params)['role'];
                    award_manager::process_manual_award($userid, $issuerid, $roleid, $badge->id);
                    badges_award_handle_manual_criteria_review((object)['crit' => $crit, 'userid' => $userid]);
                    if (!$badge->is_issued($userid)) {
                        throw new \moodle_exception('cupissuance', 'local_ignite', '', $badge->id);
                    }
                });
        }
    }

    /** Used by both My Hearth and the existing native-badge collection. */
    public static function owned_current(): array {
        global $DB;
        $userid = access::learner('passport');
        return learner_read_model::remember('ownedcups', static fn() => $DB->get_records_sql(
            'SELECT b.badgeid, b.team, b.earnmonth
               FROM {local_ignite_cupbadge} b JOIN {badge_issued} i ON i.badgeid = b.badgeid
              WHERE i.userid = ? AND i.visible = 1 ORDER BY b.earnmonth DESC', [$userid]));
    }
}
