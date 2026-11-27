<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** The monthly fuse: proof XP burns a rope past two mini bombs to a big one, and each bomb drops Embers. */
final class fuse {
    /** About one course's worth of XP. At the usual 20 XP a time, the thirteenth graded activity finishes it. */
    public const DEFAULT_GOAL = 250;
    /** The bonus XP a finished fuse blasts onto the learner's team. */
    public const DEFAULT_BLAST = 150;
    /** Embers dropped by the first mini bomb, the second, and the big one. */
    public const DROPS = [20, 30, 50];
    /** The grade a month's badge reaches with each bomb. */
    public const GRADES = ['bronze', 'silver', 'gold'];
    /** How many past months and months to come the badge shelf shows around the current one. */
    private const SHELF = [5, 2];

    /** The XP at which each bomb goes off: the first award, about halfway, and the goal. */
    public static function marks(int $goal, int $award): array {
        // A fuse is never shorter than three awards, so the three bombs stay apart.
        $steps = max(3, intdiv($goal + $award - 1, $award));
        return [$award, intdiv($steps + 1, 2) * $award, max($goal, 3 * $award)];
    }

    /** How many of a month's bombs the XP earned in it has set off. */
    public static function bombs(int $xp, array $marks): int {
        return count(array_filter($marks, static fn(int $mark): bool => $xp >= $mark));
    }

    public static function embers(int $bombs): int {
        return array_sum(array_slice(self::DROPS, 0, $bombs));
    }

    /** A whole-week number for a moment in Campfire time. Weeks run Monday to Sunday. */
    public static function week(int $time): int {
        $day = (new \DateTimeImmutable('@' . $time))->setTimezone(new \DateTimeZone(campfire::TIMEZONE))->format('Y-m-d');
        // Day 4 of the Unix calendar, 5 January 1970, was a Monday.
        return intdiv(intdiv((new \DateTimeImmutable($day . ' UTC'))->getTimestamp(), 86400) - 4, 7);
    }

    /** Weeks in a row with XP, counting back from this week, or from last week while this one is still open. */
    public static function streak(array $weeks, int $thisweek): int {
        $earned = array_flip($weeks);
        $week = isset($earned[$thisweek]) ? $thisweek : $thisweek - 1;
        $count = 0;
        while (isset($earned[$week])) {
            $count++;
            $week--;
        }
        return $count;
    }

    /** The value of the latest month, at or before the given one, that has its own. */
    public static function kept_for(array $kept, int $month): int {
        $latest = reset($kept);
        foreach ($kept as $key => $value) {
            if ($key <= $month) {
                $latest = $value;
            }
        }
        return (int)$latest;
    }

    /**
     * Share out a month's blasts. Each row is one learner's proof XP with one team that month. A learner whose XP
     * reaches the goal blasts the bonus onto the team of their latest award, if they had one then.
     */
    public static function share(array $rows, int $goal, int $blast): array {
        $learners = [];
        foreach ($rows as $row) {
            $learner = &$learners[(int)$row->userid];
            $learner['xp'] = ($learner['xp'] ?? 0) + (int)$row->xp;
            if (!isset($learner['latest']) || (int)$row->latest > $learner['latest']) {
                [$learner['latest'], $learner['houseid']] = [(int)$row->latest, (int)$row->houseid];
            }
            unset($learner);
        }
        $shares = ['teams' => [], 'users' => []];
        foreach ($learners as $userid => $learner) {
            if ($learner['xp'] >= $goal && $learner['houseid']) {
                $shares['users'][$userid] = ['houseid' => $learner['houseid'], 'xp' => $blast, 'time' => $learner['latest']];
                $shares['teams'][$learner['houseid']] = ($shares['teams'][$learner['houseid']] ?? 0) + $blast;
            }
        }
        return $shares;
    }

    /** The bonus XP each team, and each learner for their team, earned from big bombs in a month. Nothing before the fuse began. */
    public static function blasts(int $month): array {
        global $DB;
        $none = ['teams' => [], 'users' => []];
        if (!access::enabled('fuse')) {
            return $none;
        }
        $goals = self::kept('fusegoals', 'fusegoal', self::DEFAULT_GOAL);
        if ($month < array_key_first($goals)) {
            return $none;
        }
        $award = (int)(get_config('local_ignite', 'xpaward') ?: xp::DEFAULT_AWARD);
        return self::share($DB->get_records_sql("SELECT MIN(x.id) AS id, x.userid, x.houseid, SUM(x.regularxp) AS xp, MAX(x.timeearned) AS latest
              FROM {local_ignite_xp} x
         LEFT JOIN {course_modules} cm ON cm.id = x.cmid
             WHERE x.earnmonth = ? AND x.reversed = 0
                   AND (x.conditiontype = 'pass' OR cm.completiongradeitemnumber IS NOT NULL)
          GROUP BY x.userid, x.houseid", [$month]), self::marks(self::kept_for($goals, $month), $award)[2], self::blast($month));
    }

    /**
     * A setting's value for each month since the fuse began. A month keeps the value it opened with,
     * so a change by staff starts with the next month and never rewrites a month already played.
     */
    private static function kept(string $store, string $setting, int $default): array {
        $month = (int)campfire::period(time())->format('Ym');
        $kept = json_decode(get_config('local_ignite', $store) ?: '{}', true) ?: [];
        if (!isset($kept[$month])) {
            $kept[$month] = (int)(get_config('local_ignite', $setting) ?: $default);
            ksort($kept);
            set_config($store, json_encode($kept), 'local_ignite');
        }
        return $kept;
    }

    /** The bonus XP a big bomb blasts onto a team in the given month. */
    private static function blast(int $month): int {
        return self::kept_for(self::kept('fuseblasts', 'fuseblast', self::DEFAULT_BLAST), $month);
    }

    /** The signed-in learner's fuse this month, with their streak, Embers and monthly badges. */
    public static function current(): array {
        global $DB;
        $userid = access::learner('fuse');
        $now = time();
        $period = campfire::period($now);
        $month = (int)$period->format('Ym');
        $award = (int)(get_config('local_ignite', 'xpaward') ?: xp::DEFAULT_AWARD);
        $goals = self::kept('fusegoals', 'fusegoal', self::DEFAULT_GOAL);
        $first = (int)array_key_first($goals);

        // Proof XP is an award for passing an activity, or for one completed by its grade.
        // A box the learner ticks themselves, or simply opening a page, does not burn the fuse.
        $awards = $DB->get_records_sql("SELECT x.id, x.earnmonth, x.regularxp, x.timeearned
              FROM {local_ignite_xp} x
         LEFT JOIN {course_modules} cm ON cm.id = x.cmid
             WHERE x.userid = ? AND x.reversed = 0
                   AND (x.conditiontype = 'pass' OR cm.completiongradeitemnumber IS NOT NULL)", [$userid]);
        $xp = [];
        $weeks = [];
        foreach ($awards as $earned) {
            $xp[(int)$earned->earnmonth] = ($xp[(int)$earned->earnmonth] ?? 0) + (int)$earned->regularxp;
            $weeks[] = self::week((int)$earned->timeearned);
        }

        // Every month since the fuse began leaves a badge in the best grade reached, and its bombs' Embers.
        $balance = 0;
        $shelf = [];
        $start = \DateTimeImmutable::createFromFormat('!Ym', (string)$first, new \DateTimeZone(campfire::TIMEZONE));
        for ($date = $start; $date <= $period->modify('+' . self::SHELF[1] . ' months'); $date = $date->modify('+1 month')) {
            $key = (int)$date->format('Ym');
            $bombs = $key > $month ? 0 : self::bombs($xp[$key] ?? 0, self::marks(self::kept_for($goals, $key), $award));
            $balance += self::embers($bombs);
            $state = $bombs ? self::GRADES[$bombs - 1] : ($key < $month ? 'missed' : ($key === $month ? 'current' : 'upcoming'));
            $shelf[] = ['label' => userdate($date->getTimestamp(), '%b', campfire::TIMEZONE), 'grade' => $state,
                'gradelabel' => $state === 'upcoming' ? '' : get_string('fuse_grade_' . $state, 'local_ignite')];
        }
        $shelf = array_slice($shelf, -(self::SHELF[0] + 1 + self::SHELF[1]));

        $marks = self::marks($goals[$month], $award);
        $goal = $marks[2];
        $burned = min($xp[$month] ?? 0, $goal);
        $streak = self::streak($weeks, self::week($now));
        $monthname = userdate($now, '%B', campfire::TIMEZONE);
        $state = !$burned ? 'unlit' : ($burned < $goal ? 'burning' : 'burned');
        // A learner on a team is told what their big bomb does for it.
        $houseid = access::enabled('houses') ? (int)$DB->get_field('local_ignite_member', 'houseid', ['userid' => $userid]) : 0;
        $team = campfire::TEAMS[array_search($houseid, campfire::ids(), true)] ?? '';
        $with = $team === '' ? '' : '_team';
        $words = (object)['month' => $monthname, 'left' => $goal - $burned, 'xp' => $burned, 'goal' => $goal,
            'next' => userdate($period->modify('+1 month')->getTimestamp(), '%B', campfire::TIMEZONE),
            'mini1' => self::DROPS[0], 'mini2' => self::DROPS[1], 'big' => self::DROPS[2],
            'team' => $team, 'blast' => self::blast($month)];
        $data = [
            'xp' => $burned, 'goal' => $goal, 'award' => $award, 'marks' => implode(',', $marks),
            'drops' => implode(',', self::DROPS), 'key' => $userid . '-' . $month, 'balance' => $balance,
            'eyebrow' => get_string('fuse_eyebrow', 'local_ignite', (object)['month' => $monthname,
                'left' => campfire::timeleft($period->modify('+1 month')->getTimestamp() - $now)]),
            'title' => get_string('fuse_title_' . $state, 'local_ignite'),
            'sub' => get_string('fuse_sub_' . $state . ($state === 'burned' ? $with : ''), 'local_ignite', $words),
            'summary' => get_string('fuse_summary', 'local_ignite', $words),
            'legend' => get_string('fuse_legend' . $with, 'local_ignite', $words),
            'streak' => $streak ? get_string('fuse_streak', 'local_ignite', $streak) : get_string('fuse_nostreak', 'local_ignite'),
            'streaknote' => get_string($streak ? 'fuse_streakkeep' : 'fuse_streakstart', 'local_ignite'),
            'embers' => get_string($balance === 1 ? 'fuse_ember' : 'fuse_embers', 'local_ignite', $balance),
            'shopurl' => (new \moodle_url('/local/ignite/shop.php'))->out(false),
            'shelf' => $shelf,
        ];
        // What each bomb says when it goes off.
        foreach (self::GRADES as $index => $grade) {
            $data['boom' . ($index + 1)] = get_string($index === 2 ? 'fuse_boom_big' . $with : 'fuse_boom_mini', 'local_ignite',
                (object)['month' => $monthname, 'embers' => self::DROPS[$index], 'team' => $team, 'blast' => $words->blast,
                    'grade' => get_string('fuse_grade_' . $grade, 'local_ignite')]);
        }
        return $data;
    }
}
