<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class campfire {
    public const TEAMS = ['lanternlings' => 'Lanternlings', 'forgelings' => 'Forgelings', 'candlelings' => 'Candlelings'];
    public const TIMEZONE = 'America/Los_Angeles';
    /** The order the teams are met in the chooser, which also decides who sits either side of a member's own fire. */
    public const ORDER = ['forgelings', 'candlelings', 'lanternlings'];

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
            $rows[] = ['code' => $code, 'name' => self::TEAMS[$code], 'halves' => $scores[$code], 'rank' => $rank,
                'ownhalves' => (int)($totals[$ids[$code]]->own ?? 0),
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

    /** The time left in a month's Heat, in its two largest units: "5 days 2 hours". */
    public static function timeleft(int $seconds): string {
        $minutes = max(1, (int)ceil($seconds / 60));
        $unit = static fn(int $count, string $word): string =>
            $count . ' ' . get_string('home_' . $word . ($count === 1 ? '' : 's'), 'local_ignite');
        [$days, $hours] = [intdiv($minutes, 1440), intdiv($minutes % 1440, 60)];
        return $days ? $unit($days, 'day') . ' ' . $unit($hours, 'hour') :
            ($hours ? $unit($hours, 'hour') . ' ' . $unit($minutes % 60, 'minute') : $unit($minutes, 'minute'));
    }

    /** A member's own Campfire page for the current month's Heat, or null for someone without a Campfire. */
    public static function home(array $standings): ?array {
        global $OUTPUT;
        $rows = array_column($standings['rows'], null, 'code');
        $mine = current(array_filter($rows, static fn($row) => $row['representing']));
        if (!$mine || array_diff(self::ORDER, array_keys($rows))) {
            return null;
        }
        $leader = max(array_column($rows, 'halves'));
        $shared = array_count_values(array_column($rows, 'rank'));
        $place = static function(array $row) use ($shared): string {
            $ordinal = get_string('home_rank' . $row['rank'], 'local_ignite');
            return $shared[$row['rank']] > 1 ? get_string('home_tied', 'local_ignite', $ordinal) : $ordinal;
        };
        $image = static fn(string $name): string => $OUTPUT->image_url('campfire/' . $name, 'local_ignite')->out(false);
        // The member's fire burns in the middle, with the other two on the sides they held in the chooser.
        $index = array_search($mine['code'], self::ORDER, true);
        $fires = [];
        foreach ([2, 0, 1] as $step) {
            $row = $rows[self::ORDER[($index + $step) % 3]];
            $fires[] = ['code' => $row['code'], 'name' => $row['name'], 'yours' => $row['representing'],
                'lit' => $leader > 0, 'place' => $leader ? $place($row) : '', 'xp' => $row['total'],
                // The leader's flame is full size; any Team XP at all keeps a small flame alight.
                'size' => $row['halves'] ? number_format(.4 + .6 * $row['halves'] / $leader, 3, '.', '') : '0',
                'flame' => $image($row['code'] . '-flame')];
        }
        $share = $mine['halves'] ? (int)round($mine['ownhalves'] / $mine['halves'] * 100) : 0;
        if ($mine['ownhalves']) {
            $contribution = get_string($share ? 'home_added' : 'home_addedsmall', 'local_ignite',
                (object)['xp' => $mine['own'], 'share' => $share, 'team' => $mine['name']]);
        } else {
            $contribution = get_string($leader ? 'home_notyet' : 'home_nofires', 'local_ignite', $mine['name']);
        }
        $month = userdate(time(), '%B', self::TIMEZONE);
        return ['code' => $mine['code'], 'name' => $mine['name'], 'letters' => \core_text::strlen($mine['name']),
            'line' => get_string('tagline_' . $mine['code'], 'local_ignite'),
            'artlarge' => $image($mine['code'] . '-large'), 'topcrest' => $image($mine['code'] . '-top'),
            'medal' => $image($mine['code'] . '-medal'), 'bottomcrest' => $image($mine['code'] . '-bottom'),
            'logs' => $image('logs'), 'teamxp' => $mine['total'],
            'lit' => $leader > 0, 'place' => $leader ? $place($mine) : '',
            'firesheading' => get_string('home_fires', 'local_ignite', $month),
            'heatends' => get_string('home_heatends', 'local_ignite', $month),
            'timeleft' => self::timeleft($standings['rolloverseconds']), 'rolloverseconds' => $standings['rolloverseconds'],
            'fires' => $fires, 'contribution' => $contribution, 'learnurl' => $standings['learnurl']];
    }
}
