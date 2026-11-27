<?php
// Checks the monthly fuse and the Shop without a Moodle site: the plugin's own classes run against
// small stand-ins for the Moodle functions they call. Run with: php tests/ignite-fuse.php
// With --json it also prints the data the Home and Shop templates receive.
namespace local_ignite {
    /** Stand-in for the plugin's access checks: one signed-in learner, and a fuse switch the checks can flip. */
    final class access {
        public static bool $fuse = true;
        public static function learner(?string $feature = null): int {
            return 7;
        }
        public static function enabled(?string $feature = null): bool {
            return $feature !== 'fuse' || self::$fuse;
        }
    }
}

namespace core\hook\output {
    /** Stand-in for Moodle's end-of-page hook: it keeps what it is given. */
    final class before_footer_html_generation {
        public string $html = '';
        public function add_html(?string $output): void {
            $this->html .= $output;
        }
    }
}

namespace {
    if (PHP_SAPI !== 'cli') {
        exit(1);
    }
    define('MOODLE_INTERNAL', true);
    $plugin = __DIR__ . '/../moodle/local/ignite';
    $string = [];
    require $plugin . '/lang/en/local_ignite.php';
    $config = [];
    $awards = [];
    $shares = []; // Every learner's proof XP by team for a month, as the blast query groups it.
    $team = 0; // The signed-in learner's team.
    $cups = []; // Published Campfire Cups: each closed month's team totals, as they are stored.
    $sides = []; // The signed-in learner's standing awards with a team, oldest first.

    function get_config(string $component, string $name) {
        global $config;
        return $config[$name] ?? false;
    }
    function set_config(string $name, $value, string $component): void {
        global $config;
        $config[$name] = $value;
    }
    /** As Moodle's: a missing string is an error, so a mistyped identifier fails the run. */
    function get_string(string $id, string $component, $a = null): string {
        global $string;
        if (!isset($string[$id])) {
            throw new RuntimeException("Missing language string: $id");
        }
        return preg_replace_callback('/\{\$a(?:->(\w+))?\}/', static fn($match) =>
            (string)(isset($match[1]) ? $a->{$match[1]} : $a), $string[$id]);
    }
    function userdate(int $time, string $format, string $zone): string {
        return (new DateTimeImmutable('@' . $time))->setTimezone(new DateTimeZone($zone))
            ->format(['%b' => 'M', '%B' => 'F', '%B %Y' => 'F Y'][$format]);
    }
    final class moodle_url {
        public function __construct(private string $path) {
        }
        public function out(bool $escaped = true): string {
            return $this->path;
        }
    }
    /** Hands back sample awards, after checking each query asks only for standing proof XP. */
    final class fixture_db {
        public function get_records_sql(string $sql, array $params): array {
            global $awards, $shares, $sides;
            if (str_contains($sql, 'x.houseid <> 0')) {
                check(str_contains($sql, 'x.reversed = 0') && str_contains($sql, 'ORDER BY x.timeearned') && $params === [7],
                    'The learner’s team in each month comes from their own standing awards, oldest first');
                return $sides;
            }
            $proof = str_contains($sql, "x.conditiontype = 'pass' OR cm.completiongradeitemnumber IS NOT NULL") &&
                str_contains($sql, 'x.reversed = 0');
            if (str_contains($sql, 'GROUP BY x.userid, x.houseid')) {
                check($proof && count($params) === 1, 'Blasts are worked out from one month of standing proof XP');
                return $shares;
            }
            check($proof && $params === [7], 'Only the learner’s own, standing proof XP is read');
            return $awards;
        }
        public function get_records_menu(string $table, array $conditions, string $sort, string $fields): array {
            global $cups;
            check($table === 'local_ignite_cup' && $conditions === [] && $fields === 'earnmonth, totals', 'The published Cups are read');
            return $cups;
        }
        public function get_field(string $table, string $field, array $conditions) {
            global $team;
            check($table === 'local_ignite_member' && $field === 'houseid' && $conditions === ['userid' => 7], 'The learner’s own team is looked up');
            return $team ?: false;
        }
    }
    final class fixture_output {
        public function image_url(string $name, string $component): moodle_url {
            return new moodle_url('http://127.0.0.1:8765/local/ignite/pix/' . $name . '.jpg');
        }
        public function render_from_template(string $template, array $data): string {
            return $template . ' ' . $data['grade'];
        }
    }
    $DB = new fixture_db();
    $OUTPUT = new fixture_output();

    function check(bool $ok, string $message): void {
        if (!$ok) {
            throw new RuntimeException('FAIL ' . $message);
        }
        fwrite(STDERR, "PASS $message\n");
    }
    function share(int $userid, int $houseid, int $xp, int $latest): stdClass {
        return (object)['userid' => $userid, 'houseid' => $houseid, 'xp' => $xp, 'latest' => $latest];
    }
    function side(int $month, int $houseid): stdClass {
        static $id = 0;
        return (object)['id' => ++$id, 'earnmonth' => $month, 'houseid' => $houseid];
    }
    function award(int $month, int $xp, int $time): stdClass {
        static $id = 0;
        return (object)['id' => ++$id, 'earnmonth' => $month, 'regularxp' => $xp, 'timeearned' => $time];
    }

    require $plugin . '/classes/campfire.php';
    require $plugin . '/classes/xp.php';
    require $plugin . '/classes/fuse.php';
    require $plugin . '/classes/shop.php';
    use local_ignite\campfire;
    use local_ignite\fuse;
    use local_ignite\shop;
    use local_ignite\xp;

    // Where the bombs sit, and what they give.
    check(fuse::marks(300, 20) === [50, 150, 300], 'A 300 XP fuse has bombs at 50, 150 and 300 XP');
    check(fuse::marks(100, 20) === [16, 50, 100], 'A 100 XP fuse has its bombs a sixth of the way, halfway and at the end');
    check(fuse::marks(50, 20) === [10, 30, 60], 'A fuse is never shorter than three awards');
    check(array_map(static fn(int $xp): int => fuse::bombs($xp, fuse::marks(60, 20)), [20, 40, 60]) === [1, 2, 3],
        'On the shortest fuse each award sets off one bomb');
    check(fuse::bombs(0, [20, 60, 100]) === 0 && fuse::bombs(20, [20, 60, 100]) === 1 &&
        fuse::bombs(59, [20, 60, 100]) === 1 && fuse::bombs(60, [20, 60, 100]) === 2 &&
        fuse::bombs(250, [20, 60, 100]) === 3, 'A bomb goes off exactly when its XP is reached');
    check([fuse::embers(0), fuse::embers(1), fuse::embers(2), fuse::embers(3)] === [0, 20, 50, 100],
        'The bombs drop 20, 30 and 50 Embers, 100 for a whole fuse');

    // Weeks run Monday to Sunday in Campfire time.
    $zone = new DateTimeZone(campfire::TIMEZONE);
    $at = static fn(string $when): int => (new DateTimeImmutable($when, $zone))->getTimestamp();
    check(fuse::week($at('2026-11-23 00:00')) === fuse::week($at('2026-11-29 23:59')), 'Monday and the following Sunday share a week');
    check(fuse::week($at('2026-11-30 00:00')) === fuse::week($at('2026-11-29 23:59')) + 1, 'A new week starts on Monday at midnight');
    check(fuse::streak([10, 9, 8, 6], 10) === 3, 'A streak counts back through weeks without a gap');
    check(fuse::streak([9, 8], 10) === 2, 'A streak survives the current week until it ends');
    check(fuse::streak([8], 10) === 0 && fuse::streak([], 10) === 0, 'A missed week ends the streak');
    check(fuse::kept_for([202612 => 100, 202702 => 140], 202701) === 100 &&
        fuse::kept_for([202612 => 100, 202702 => 140], 202703) === 140, 'A month without its own goal keeps the one before it');

    check(fuse::marks(fuse::DEFAULT_GOAL, xp::DEFAULT_AWARD) === [50, 150, 300],
        'Out of the box a fuse is 300 XP, with bombs at 50, 150 and 300');
    check(array_map(static fn(int $xp): int => fuse::bombs($xp, [50, 150, 300]), [40, 60, 140, 160, 280, 300]) === [0, 1, 1, 2, 2, 3],
        'At 20 XP a time, the third, eighth and fifteenth activities set off the bombs of a 300 XP fuse');

    check(fuse::DEFAULT_BLAST === 150, 'Out of the box the big bomb blasts 150 XP onto the team');

    // A learner's first month on a 100 XP fuse with a 50 XP blast: two passes so far.
    $config['fusegoal'] = 100;
    $config['fuseblast'] = 50;
    $now = time();
    $period = campfire::period($now);
    $month = (int)$period->format('Ym');
    $awards = [award($month, 20, $now), award($month, 20, $now)];
    $home = fuse::current();
    check($home['xp'] === 40 && $home['goal'] === 100 && $home['marks'] === '16,50,100' && $home['key'] === '7-' . $month,
        'Home reports 40 of 100 XP with bombs at 16, 50 and 100');
    check($home['balance'] === 20 && $home['embers'] === '20 Embers', 'One bomb so far has banked 20 Embers');
    check($home['title'] === 'Your fuse is burning.' && $home['sub'] === '60 XP to the big bomb.' &&
        $home['summary'] === '40 of 100 XP burned this month', 'The burning fuse says how far there is to go');
    check($home['streak'] === '1-week streak', 'XP this week starts a streak');
    check(json_decode($config['fusegoals'], true) === [$month => 100], 'The month keeps the goal it opened with');
    check($home['badge']['grade'] === 'bronze' && $home['badge']['gradelabel'] === 'Bronze' &&
        $home['badge']['title'] === $period->format('F Y') . ' Badge' &&
        array_column($home['badge']['steps'], 'grade') === ['bronze', '', ''] &&
        array_column($home['badge']['steps'], 'drop') === [20, 30, 50],
        'After the 20 bomb, this month’s badge is Bronze, with Silver at 30 and Gold at 50 still to earn');
    check(str_contains($home['boom3'], 'Gold') && str_contains($home['boom1'], '+20 Embers'), 'Each bomb has its message');

    // Staff lengthen the fuse mid-month: this month is unchanged.
    $config['fusegoal'] = 200;
    check(fuse::current()['goal'] === 100, 'A new fuse length waits for the next month');
    $config['fusegoal'] = 100;

    // Three months in: a gold month, a missed month, and two bombs this month.
    $two = $period->modify('-2 months');
    $config['fusegoals'] = json_encode([(int)$two->format('Ym') => 100]);
    $awards = [];
    for ($pass = 0; $pass < 6; $pass++) {
        $awards[] = award((int)$two->format('Ym'), 20, $two->getTimestamp() + $pass * 3600);
    }
    for ($pass = 0; $pass < 3; $pass++) {
        $awards[] = award($month, 20, $now);
    }
    $later = fuse::current();
    check($later['badge']['grade'] === 'silver' && array_column($later['badge']['steps'], 'grade') === ['bronze', 'silver', ''],
        'Two bombs this month make the badge Silver, whatever earlier months reached');
    check($later['balance'] === 150 && $later['xp'] === 60, 'Embers add up across months: 100 from the gold month and 50 from this one');
    check($later['goal'] === 100, 'A month with no goal of its own carries the earlier one forward');

    // A finished fuse, and nothing yet.
    $awards = [award($month, 140, $now)];
    $done = fuse::current();
    check($done['xp'] === 100 && $done['title'] === 'Boom. Fuse burned.' && str_contains($done['summary'], '100 of 100'),
        'XP beyond the goal still reads as a finished fuse');
    check($done['badge']['grade'] === 'gold' && $done['badge']['gradelabel'] === 'Gold', 'A finished fuse makes the badge Gold');
    // On the Dashboard the block hands the badge on, and it is shown at the end of the page.
    $end = new \core\hook\output\before_footer_html_generation();
    fuse::footer($end);
    check($end->html === '', 'Nothing is added to the end of a page the fuse is not on');
    fuse::$handed = $done['badge'];
    fuse::footer($end);
    check($end->html === 'local_ignite/fuse_badge gold', 'A badge the block hands on is shown at the end of the Dashboard');
    fuse::$handed = [];
    check(str_contains(fuse::art(202612), 'badges/202612') && fuse::art(199901) === '' &&
        $done['badge']['photo'] === fuse::art($month), 'A month shows its own badge picture when it has one, and none otherwise');
    $awards = [];
    $config['fusegoals'] = json_encode([$month => 100]);
    $unlit = fuse::current();
    check($unlit['xp'] === 0 && $unlit['balance'] === 0 && $unlit['title'] === 'Light the fuse.' &&
        $unlit['embers'] === '0 Embers' && $unlit['streak'] === 'No streak yet', 'A learner with no XP sees an unlit fuse');
    check($unlit['badge']['grade'] === 'none' && $unlit['badge']['gradelabel'] === 'Not earned yet' &&
        array_column($unlit['badge']['steps'], 'grade') === ['', '', ''], 'Before the first bomb the badge is not earned yet');

    // The Shop, with 150 Embers saved.
    $config['fusegoals'] = json_encode([(int)$two->format('Ym') => 100]);
    $awards = [];
    for ($pass = 0; $pass < 6; $pass++) {
        $awards[] = award((int)$two->format('Ym'), 20, $two->getTimestamp() + $pass * 3600);
    }
    for ($pass = 0; $pass < 3; $pass++) {
        $awards[] = award($month, 20, $now);
    }
    $shop = shop::data();
    check($shop['balance'] === 150 && array_column($shop['tiers'], 'name') === ['Kindling', 'Flame', 'Blaze', 'Bonfire'] &&
        array_column($shop['tiers'], 'price') === [50, 100, 250, 500], 'The Shop lists four tiers at 50, 100, 250 and 500 Embers');
    check(array_column($shop['tiers'], 'status') === ['You have enough for one of these!', 'You have enough for one of these!',
        '100 more to go', '350 more to go'], 'Each tier says whether the learner can afford it');
    check(array_map(static fn($tier) => count($tier['prizes']), $shop['tiers']) === [3, 3, 3, 1] &&
        $shop['tiers'][3]['prizes'][0]['name'] === 'Carry the Torch Tote' && $shop['tiers'][3]['pricelabel'] === '500 Embers',
        'All ten prizes are listed, with the tote alone in Bonfire');
    foreach ($shop['tiers'] as $tier) {
        foreach ($tier['prizes'] as $prize) {
            $file = $plugin . '/pix/' . substr($prize['photo'], strlen('http://127.0.0.1:8765/local/ignite/pix/'));
            check(is_file($file) && $prize['description'] !== '', 'Photo and words exist for ' . $prize['name']);
        }
    }

    // The big bomb's blast for a team.
    $blasts = fuse::share([share(1, 11, 60, 500), share(1, 12, 40, 900), share(2, 11, 100, 300), share(3, 12, 80, 100),
        share(4, 0, 120, 50), share(5, 11, 40, 10), share(5, 0, 60, 20)], 100, 50);
    check($blasts['teams'] === [12 => 50, 11 => 50], 'Each finished fuse blasts the bonus onto one team');
    check($blasts['users'][1] === ['houseid' => 12, 'xp' => 50, 'time' => 900],
        'XP earned with two teams counts together, and the blast goes to the team of the latest award');
    check(!isset($blasts['users'][3]), 'An unfinished fuse blasts nothing');
    check(!isset($blasts['users'][4]) && !isset($blasts['users'][5]), 'A learner with no team at the end blasts nothing');
    $config['fusegoals'] = json_encode([$month => 100]);
    $shares = [share(7, 11, 100, $now), share(8, 12, 140, $now)];
    check(fuse::blasts($month)['teams'] === [11 => 50, 12 => 50] && fuse::blasts($month)['users'][7]['xp'] === 50,
        'This month’s blasts use this month’s fuse length and blast');
    $config['fuseblast'] = 150;
    check(fuse::blasts($month)['teams'] === [11 => 50, 12 => 50], 'A new blast size waits for the next month');
    check(fuse::blasts((int)$two->format('Ym')) === ['teams' => [], 'users' => []], 'Months before the fuse began have no blasts');
    local_ignite\access::$fuse = false;
    check(fuse::blasts($month) === ['teams' => [], 'users' => []] && xp::team_points(25) === '12.5',
        'With the switch off there are no blasts and Team XP is still half the XP');
    local_ignite\access::$fuse = true;
    check(xp::team_points(25) === '25' && xp::team_points(0) === '0', 'With the switch on, Team XP equals the XP earned');

    // A learner on a team is told what the big bomb does for it.
    $config['campfireids'] = json_encode(['lanternlings' => 10, 'forgelings' => 11, 'candlelings' => 12]);
    $team = 11;
    $awards = [award($month, 100, $now)];
    $teamed = fuse::current();
    check(str_contains($teamed['sub'], 'blasted +50 XP onto the Forgelings’ fire') &&
        str_contains($teamed['boom3'], '+50 XP blasted onto the Forgelings’ fire') &&
        str_contains($teamed['legend'], 'blasts +50 XP onto the Forgelings’ fire'), 'A learner on a team sees what their big bomb adds to it');
    $team = 0;
    $alone = fuse::current();
    check(!str_contains($alone['sub'] . $alone['boom3'] . $alone['legend'], 'blast'), 'A learner without a team is not promised a blast');
    $team = 11;
    $home = $teamed;

    // The Campfire Cup: a team's place drops Embers for each member who added Team XP.
    $cup = ['lanternlings' => 300, 'forgelings' => 500, 'candlelings' => 100];
    check([fuse::prize($cup, 'forgelings'), fuse::prize($cup, 'lanternlings'), fuse::prize($cup, 'candlelings')] === [100, 50, 30],
        'A Cup gives 100 Embers for 1st place, 50 for 2nd and 30 for 3rd');
    $cup = ['lanternlings' => 300, 'forgelings' => 300, 'candlelings' => 100];
    check([fuse::prize($cup, 'forgelings'), fuse::prize($cup, 'lanternlings'), fuse::prize($cup, 'candlelings')] === [100, 100, 30],
        'Two teams tied for 1st both get 100, and the next team is 3rd');
    $cup = ['lanternlings' => 100, 'forgelings' => 300, 'candlelings' => 100];
    check(fuse::prize($cup, 'lanternlings') === 50 && fuse::prize($cup, 'candlelings') === 50, 'Two teams tied for 2nd both get 50');
    check(fuse::prize(['lanternlings' => 0, 'forgelings' => 300, 'candlelings' => 0], 'candlelings') === 0 &&
        fuse::prize($cup, '') === 0, 'A team with no Team XP, and a learner with no team, get nothing');
    check(str_contains(get_string('home_prizes', 'local_ignite', (object)['first' => fuse::PLACES[1], 'second' => fuse::PLACES[2],
        'third' => fuse::PLACES[3]]), '100 for 1st, 50 for 2nd, 30 for 3rd'), 'The Campfire page says what each place is worth');

    // The fuse began last month. Its Cup is published: Lanternlings 1st, Forgelings 2nd, Candlelings 3rd.
    $one = $period->modify('-1 month');
    [$lastmonth, $before] = [(int)$one->format('Ym'), (int)$two->format('Ym')];
    $config['fusegoals'] = json_encode([$lastmonth => 100]);
    $cups = [$before => json_encode(['lanternlings' => 0, 'forgelings' => 80, 'candlelings' => 0]),
        $lastmonth => json_encode(['lanternlings' => 300, 'forgelings' => 200, 'candlelings' => 100])];
    $awards = [];
    $sides = [side($before, 11), side($lastmonth, 12), side($lastmonth, 11)];
    $cupped = fuse::current();
    check($cupped['balance'] === 50, 'A member who added Team XP banks their team’s place: 50 Embers for 2nd, and nothing for a Cup from before the fuse');
    check($cupped['cup'] === 'The Forgelings finished 2nd in ' . $one->format('F') . '’s Campfire Cup: +50 Embers for you.',
        'Home says what last month’s Cup gave');
    $sides = [side($lastmonth, 11), side($lastmonth, 12)];
    check(fuse::current()['balance'] === 30, 'XP with two teams in a month counts with the team of the latest award');
    $awards = [award($month, 20, $now)];
    check(fuse::current()['balance'] === 50 && shop::data()['balance'] === 50, 'Cup Embers add to the Embers from bombs, in the Shop too');
    $awards = [];
    $sides = [side($before, 11)];
    $quiet = fuse::current();
    check($quiet['balance'] === 0 && $quiet['cup'] === '', 'A member who added no Team XP that month gets no Cup Embers');
    // Two months in: the first month's Cup still counts, and is no longer news.
    $config['fusegoals'] = json_encode([$before => 100]);
    $cups = [$before => json_encode(['lanternlings' => 0, 'forgelings' => 80, 'candlelings' => 0])];
    $older = fuse::current();
    check($older['balance'] === 100 && $older['cup'] === '', 'Embers from an earlier Cup stay banked without being announced again');
    $cups = [];
    $sides = [];
    $config['fusegoals'] = json_encode([$month => 100]);

    if (in_array('--json', $argv, true)) {
        echo json_encode(['home' => $later, 'teamed' => $home, 'cupped' => $cupped, 'done' => $done, 'unlit' => $unlit, 'shop' => $shop, 'strings' => $string]);
    }
    fwrite(STDERR, "All fuse and Shop checks passed\n");
}
