<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** The published standings are independent of delivery of the individual Moodle badges. */
final class campfire_cup {
    public static function month_label(int $month): string {
        $date = \DateTimeImmutable::createFromFormat('!Ym', (string)$month, new \DateTimeZone(campfire::TIMEZONE));
        if (!$date || $date->format('Ym') !== (string)$month) {
            throw new \invalid_parameter_exception('Invalid Campfire month');
        }
        return $date->format('F Y');
    }

    public static function title(int $month): string {
        return get_string('cuptitle', 'local_ignite', self::month_label($month));
    }

    /** One ledger read supplies both team totals and per-user net contributions at earning time. */
    public static function result(int $month): array {
        global $DB;
        $codes = array_flip(campfire::ids());
        $totals = array_fill_keys(array_keys(campfire::TEAMS), 0);
        $contributions = [];
        [$teamsql, $params] = $DB->get_in_or_equal(array_keys($codes), SQL_PARAMS_NAMED);
        $params['month'] = $month;
        $records = $DB->get_recordset_sql("SELECT x.userid, x.houseid, SUM(x.regularxp) AS halves, u.deleted
                FROM {local_ignite_xp} x JOIN {user} u ON u.id = x.userid
               WHERE x.houseid $teamsql AND x.earnmonth = :month AND x.reversed = 0
            GROUP BY x.userid, x.houseid, u.deleted ORDER BY x.userid", $params);
        try {
            foreach ($records as $record) {
                $team = $codes[$record->houseid];
                $totals[$team] += (int)$record->halves;
                if (!$record->deleted && $record->halves > 0) {
                    $contributions[$record->userid][$team] = (int)$record->halves;
                }
            }
        } finally {
            $records->close();
        }
        // A finished fuse's blast counts for the team, and for the learner who set it off.
        foreach (fuse::blasts($month)['users'] as $userid => $blast) {
            if (isset($codes[$blast['houseid']])) {
                $team = $codes[$blast['houseid']];
                $totals[$team] += $blast['xp'];
                if (isset($contributions[$userid][$team])) {
                    $contributions[$userid][$team] += $blast['xp'];
                }
            }
        }
        $winners = campfire::winners($totals);
        $recipients = [];
        foreach ($contributions as $userid => $points) {
            $best = 0;
            // Winners are alphabetical, so equal personal contributions have a stable emblem.
            foreach ($winners as $team) {
                if (($points[$team] ?? 0) > $best) {
                    $best = $points[$team];
                    $recipients[$userid] = $team;
                }
            }
        }
        return ['totals' => $totals, 'winners' => $winners, 'recipients' => $recipients,
            'fingerprint' => hash('sha256', json_encode([$month, $totals, $recipients]))];
    }

    /** Called by cron after reconciling completion evidence, or by the authenticated review form. */
    public static function finalize(int $month, ?string $approval = null): void {
        global $DB;
        if ($approval !== null) {
            access::administrator();
            require_sesskey();
        }
        self::month_label($month);
        if ($month >= (int)campfire::period(time())->format('Ym') ||
                $month < (int)campfire::period((int)get_config('local_ignite', 'xpstart'))->format('Ym')) {
            throw new \invalid_parameter_exception('Select a closed Campfire month');
        }
        $lock = \core\lock\lock_config::get_lock_factory('local_ignite')->get_lock('campfire-cup-' . $month, 10);
        if (!$lock) {
            throw new \moodle_exception('lockfailed', 'local_ignite');
        }
        try {
            $result = self::result($month);
            $published = $DB->get_record('local_ignite_cup', ['earnmonth' => $month]);
            $changed = $published && campfire::winners(json_decode($published->totals, true)) !== $result['winners'];
            if ($approval !== null && (!$published || !$published->reviewneeded ||
                    !hash_equals($result['fingerprint'], $approval))) {
                throw new \moodle_exception('cupstale', 'local_ignite');
            }
            if ($changed && $approval === null) {
                $DB->set_field('local_ignite_cup', 'reviewneeded', 1, ['id' => $published->id]);
                return;
            }
            $totals = json_encode($result['totals']);
            if (!$published) {
                $DB->insert_record('local_ignite_cup', ['earnmonth' => $month, 'totals' => $totals, 'reviewneeded' => 0]);
            } else if ($totals !== $published->totals || $published->reviewneeded) {
                $DB->update_record('local_ignite_cup', ['id' => $published->id, 'totals' => $totals, 'reviewneeded' => 0]);
            }
            cup_badges::synchronize($month, $result['recipients']);
        } finally {
            $lock->release();
        }
    }

    public static function trophies(int $houseid): array {
        global $DB;
        $team = array_search($houseid, campfire::ids(), true);
        $trophies = [];
        if ($team !== false) {
            foreach ($DB->get_records('local_ignite_cup', [], 'earnmonth DESC') as $cup) {
                if (in_array($team, campfire::winners(json_decode($cup->totals, true)), true)) {
                    $trophies[] = ['title' => self::title((int)$cup->earnmonth)];
                }
            }
        }
        return $trophies;
    }
}
