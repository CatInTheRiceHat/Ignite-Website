<?php
// Checks the monthly fuse and the Shop without a Moodle site: the plugin's own classes run against
// small stand-ins for the Moodle functions they call. Run with: php tests/ignite-fuse.php
// With --json it also prints the data the Home and Shop templates receive.
namespace local_ignite {
    /** Stand-in for the plugin's access checks: one signed-in learner, every feature on. */
    final class access {
        public static function learner(?string $feature = null): int {
            return 7;
        }
        public static function enabled(?string $feature = null): bool {
            return true;
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
            ->format(['%b' => 'M', '%B' => 'F'][$format]);
    }
    final class moodle_url {
        public function __construct(private string $path) {
        }
        public function out(bool $escaped = true): string {
            return $this->path;
        }
    }
    /** Hands back the learner's awards, after checking the query asks only for proof XP. */
    final class fixture_db {
        public function get_records_sql(string $sql, array $params): array {
            global $awards;
            check(str_contains($sql, "x.conditiontype = 'pass' OR cm.completiongradeitemnumber IS NOT NULL") &&
                str_contains($sql, 'x.reversed = 0') && $params === [7], 'Only the learner’s own, standing proof XP is read');
            return $awards;
        }
    }
    final class fixture_output {
        public function image_url(string $name, string $component): moodle_url {
            return new moodle_url('http://127.0.0.1:8765/local/ignite/pix/' . $name . '.jpg');
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

    // Where the bombs sit, and what they give.
    check(fuse::marks(100, 20) === [20, 60, 100], 'A 100 XP fuse has bombs at 20, 60 and 100 XP');
    check(fuse::marks(140, 20) === [20, 80, 140], 'A 140 XP fuse has its second bomb at 80 XP');
    check(fuse::marks(50, 20) === [20, 40, 60], 'A fuse is never shorter than three awards');
    check(fuse::bombs(0, [20, 60, 100]) === 0 && fuse::bombs(20, [20, 60, 100]) === 1 &&
        fuse::bombs(59, [20, 60, 100]) === 1 && fuse::bombs(60, [20, 60, 100]) === 2 &&
        fuse::bombs(250, [20, 60, 100]) === 3, 'A bomb goes off exactly when its XP is reached');
    check([fuse::embers(0), fuse::embers(1), fuse::embers(2), fuse::embers(3)] === [0, 2, 5, 10],
        'The bombs drop 2, 3 and 5 Embers, 10 for a whole fuse');

    // Weeks run Monday to Sunday in Campfire time.
    $zone = new DateTimeZone(campfire::TIMEZONE);
    $at = static fn(string $when): int => (new DateTimeImmutable($when, $zone))->getTimestamp();
    check(fuse::week($at('2026-11-23 00:00')) === fuse::week($at('2026-11-29 23:59')), 'Monday and the following Sunday share a week');
    check(fuse::week($at('2026-11-30 00:00')) === fuse::week($at('2026-11-29 23:59')) + 1, 'A new week starts on Monday at midnight');
    check(fuse::streak([10, 9, 8, 6], 10) === 3, 'A streak counts back through weeks without a gap');
    check(fuse::streak([9, 8], 10) === 2, 'A streak survives the current week until it ends');
    check(fuse::streak([8], 10) === 0 && fuse::streak([], 10) === 0, 'A missed week ends the streak');
    check(fuse::goal_for([202612 => 100, 202702 => 140], 202701) === 100 &&
        fuse::goal_for([202612 => 100, 202702 => 140], 202703) === 140, 'A month without its own goal keeps the one before it');

    // A learner's first month: two passes so far.
    $now = time();
    $period = campfire::period($now);
    $month = (int)$period->format('Ym');
    $awards = [award($month, 20, $now), award($month, 20, $now)];
    $home = fuse::current();
    check($home['xp'] === 40 && $home['goal'] === 100 && $home['marks'] === '20,60,100' && $home['key'] === '7-' . $month,
        'Home reports 40 of 100 XP with bombs at 20, 60 and 100');
    check($home['balance'] === 2 && $home['embers'] === '2 Embers', 'One bomb so far has banked 2 Embers');
    check($home['title'] === 'Your fuse is burning.' && $home['sub'] === '60 XP to the big bomb.' &&
        $home['summary'] === '40 of 100 XP burned this month', 'The burning fuse says how far there is to go');
    check($home['streak'] === '1-week streak', 'XP this week starts a streak');
    check(json_decode($config['fusegoals'], true) === [$month => 100], 'The month keeps the goal it opened with');
    $current = array_values(array_filter($home['shelf'], static fn($medal) => $medal['grade'] !== 'upcoming'));
    check(count($current) === 1 && $current[0]['grade'] === 'bronze' && count($home['shelf']) === 3,
        'The shelf shows this month in bronze and the two months to come');
    check(str_contains($home['boom3'], 'Gold') && str_contains($home['boom1'], '+2 Embers'), 'Each bomb has its message');

    // Staff lengthen the fuse mid-month: this month is unchanged.
    $config['fusegoal'] = 200;
    check(fuse::current()['goal'] === 100, 'A new fuse length waits for the next month');
    unset($config['fusegoal']);

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
    $grades = array_column($later['shelf'], 'grade');
    check($grades === ['gold', 'missed', 'silver', 'upcoming', 'upcoming'], 'Past months keep their best grade, or none');
    check($later['balance'] === 15 && $later['xp'] === 60, 'Embers add up across months: 10 from the gold month and 5 from this one');
    check($later['goal'] === 100, 'A month with no goal of its own carries the earlier one forward');

    // A finished fuse, and nothing yet.
    $awards = [award($month, 140, $now)];
    $done = fuse::current();
    check($done['xp'] === 100 && $done['title'] === 'Boom. Fuse burned.' && str_contains($done['summary'], '100 of 100'),
        'XP beyond the goal still reads as a finished fuse');
    $awards = [];
    $config['fusegoals'] = json_encode([$month => 100]);
    $unlit = fuse::current();
    check($unlit['xp'] === 0 && $unlit['balance'] === 0 && $unlit['title'] === 'Light the fuse.' &&
        $unlit['embers'] === '0 Embers' && $unlit['streak'] === 'No streak yet', 'A learner with no XP sees an unlit fuse');

    // The Shop, with 15 Embers saved.
    $config['fusegoals'] = json_encode([(int)$two->format('Ym') => 100]);
    $awards = [];
    for ($pass = 0; $pass < 6; $pass++) {
        $awards[] = award((int)$two->format('Ym'), 20, $two->getTimestamp() + $pass * 3600);
    }
    for ($pass = 0; $pass < 3; $pass++) {
        $awards[] = award($month, 20, $now);
    }
    $shop = shop::data();
    check($shop['balance'] === 15 && array_column($shop['tiers'], 'name') === ['Kindling', 'Flame', 'Blaze', 'Bonfire'] &&
        array_column($shop['tiers'], 'price') === [5, 10, 25, 50], 'The Shop lists four tiers at 5, 10, 25 and 50 Embers');
    check(array_column($shop['tiers'], 'status') === ['You have enough for one of these!', 'You have enough for one of these!',
        '10 more to go', '35 more to go'], 'Each tier says whether the learner can afford it');
    check(array_map(static fn($tier) => count($tier['prizes']), $shop['tiers']) === [3, 3, 3, 1] &&
        $shop['tiers'][3]['prizes'][0]['name'] === 'Carry the Torch Tote' && $shop['tiers'][3]['pricelabel'] === '50 Embers',
        'All ten prizes are listed, with the tote alone in Bonfire');
    foreach ($shop['tiers'] as $tier) {
        foreach ($tier['prizes'] as $prize) {
            $file = $plugin . '/pix/' . substr($prize['photo'], strlen('http://127.0.0.1:8765/local/ignite/pix/'));
            check(is_file($file) && $prize['description'] !== '', 'Photo and words exist for ' . $prize['name']);
        }
    }

    if (in_array('--json', $argv, true)) {
        echo json_encode(['home' => $later, 'done' => $done, 'unlit' => $unlit, 'shop' => $shop, 'strings' => $string]);
    }
    fwrite(STDERR, "All fuse and Shop checks passed\n");
}
