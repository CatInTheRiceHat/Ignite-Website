<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class campfire {
    public const TEAMS = ['lanternlings' => 'Lanternlings', 'forgelings' => 'Forgelings', 'candlelings' => 'Candlelings'];
    public const TIMEZONE = 'America/Los_Angeles';

    /** Stable house IDs, including installations that already used these names under a custom code. */
    public static function ids(): array {
        return json_decode(get_config('local_ignite', 'campfireids') ?: '{}', true);
    }

    public static function period(int $timestamp): \DateTimeImmutable {
        return (new \DateTimeImmutable('@' . $timestamp))->setTimezone(new \DateTimeZone(self::TIMEZONE))
            ->modify('first day of this month')->setTime(0, 0);
    }

    /** Competition ranking, with stable alphabetical ordering inside each tied rank. */
    public static function ranks(array $totals): array {
        ksort($totals, SORT_STRING);
        arsort($totals, SORT_NUMERIC);
        $ranks = [];
        $previous = null;
        foreach ($totals as $team => $points) {
            if ($points !== $previous) {
                $rank = count($ranks) + 1;
                $previous = $points;
            }
            $ranks[$team] = $rank;
        }
        return $ranks;
    }

    public static function winners(array $totals): array {
        return array_keys(array_filter(self::ranks($totals),
            static fn($rank, $code) => $rank === 1 && $totals[$code] > 0, ARRAY_FILTER_USE_BOTH));
    }

    public static function standings(string $month = ''): array {
        global $DB, $OUTPUT, $CFG;
        $userid = access::learner('passport');
        $now = time();
        $current = self::period($now);
        $first = self::period((int)get_config('local_ignite', 'xpstart'));
        $period = $current;
        if ($month !== '') {
            $period = \DateTimeImmutable::createFromFormat('!Y-m', $month, new \DateTimeZone(self::TIMEZONE));
            if (!$period || $period->format('Y-m') !== $month || $period < $first || $period > $current) {
                throw new \invalid_parameter_exception('Choose an available Campfire month');
            }
        }
        $ids = self::ids();
        [$teamsql, $params] = $DB->get_in_or_equal(array_values($ids), SQL_PARAMS_NAMED);
        $params['userid'] = $userid;
        $params['month'] = (int)$period->format('Ym');
        $totals = $DB->get_records_sql("SELECT houseid, SUM(regularxp) AS total,
                SUM(CASE WHEN userid = :userid THEN regularxp ELSE 0 END) AS own
            FROM {local_ignite_xp} WHERE houseid $teamsql AND earnmonth = :month AND reversed = 0
            GROUP BY houseid", $params);
        $published = $period < $current ? $DB->get_record('local_ignite_cup', ['earnmonth' => $params['month']]) : null;
        $scores = $published ? json_decode($published->totals, true) : [];
        foreach ($ids as $code => $id) {
            $scores[$code] ??= (int)($totals[$id]->total ?? 0);
        }
        $chooseurl = '';
        $houseid = 0;
        if (access::enabled('houses')) {
            $houseid = $DB->get_field('local_ignite_member', 'houseid', ['userid' => $userid]);
            if (!in_array((int)$houseid, $ids, true)) {
                $chooseurl = (new \moodle_url('/local/ignite/choosehearth.php',
                    ['returnurl' => '/local/ignite/passport.php']))->out(false);
            }
        }
        $rows = [];
        foreach (self::ranks($scores) as $code => $rank) {
            $champion = $published && $rank === 1 && $scores[$code] > 0;
            $rows[] = ['name' => self::TEAMS[$code], 'halves' => $scores[$code], 'rank' => $rank,
                'representing' => $period == $current && (int)$houseid === (int)$ids[$code],
                'champion' => $champion, 'trophy' => $champion ? campfire_cup::title($params['month']) : '',
                'total' => xp::team_points($scores[$code]), 'own' => xp::team_points((int)($totals[$ids[$code]]->own ?? 0)),
                'art' => $OUTPUT->image_url('campfire/' . $code, 'local_ignite')->out(false)];
        }
        $url = static fn($date) => (new \moodle_url('/local/ignite/passport.php',
            $date == $current ? [] : ['month' => $date->format('Y-m')], 'campfire-standings'))->out(false);
        return ['chooseurl' => $chooseurl,
            'learnurl' => (new \moodle_url(empty($CFG->enablemycourses) ? '/course/index.php' : '/my/courses.php'))->out(false),
            'cupart' => $rows[0]['champion'] ? $OUTPUT->image_url('campfire/cup', 'local_ignite')->out(false) : '',
            'reviewneeded' => !empty($published->reviewneeded), 'awaitingclose' => $period < $current && !$published,
            'live' => $month === '', 'archives' => $current > $first,
            'rolloverseconds' => $current->modify('+1 month')->getTimestamp() - $now,
            'month' => userdate($period->getTimestamp(), '%B %Y', self::TIMEZONE),
            'rows' => $rows, 'empty' => $rows[0]['halves'] === 0, 'closed' => $period < $current,
            'previousurl' => $period > $first ? $url($period->modify('-1 month')) : '',
            'nexturl' => $period < $current ? $url($period->modify('+1 month')) : ''];
    }
}
