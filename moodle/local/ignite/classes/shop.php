<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** What a learner's saved Embers can be cashed in for. */
final class shop {
    /** Each tier's price in Embers and its prizes, cheapest tier first. A prize's code names its photo and its words. */
    public const TIERS = [
        'kindling' => [50, ['button-pin', 'sticky-notes', 'sticker']],
        'flame' => [100, ['enamel-pin', 'keychain', 'pen']],
        'blaze' => [250, ['pencil-pouch', 'notebook', 'sol-mate']],
        'bonfire' => [500, ['tote']],
    ];

    public static function data(): array {
        global $OUTPUT;
        access::learner('fuse');
        $balance = fuse::current()['balance'];
        $tiers = [];
        foreach (self::TIERS as $code => [$price, $prizes]) {
            $several = count($prizes) > 1;
            $tier = ['name' => get_string('shop_tier_' . $code, 'local_ignite'), 'price' => $price,
                'saved' => min($balance, $price),
                'pricelabel' => get_string($several ? 'shop_priceeach' : 'shop_price', 'local_ignite', $price),
                'progresslabel' => get_string('shop_progress', 'local_ignite', get_string('shop_tier_' . $code, 'local_ignite')),
                'status' => $balance >= $price ? get_string($several ? 'shop_enoughone' : 'shop_enough', 'local_ignite') :
                    get_string('shop_togo', 'local_ignite', $price - $balance),
                'prizes' => []];
            foreach ($prizes as $prize) {
                $words = 'shop_prize_' . str_replace('-', '', $prize);
                $tier['prizes'][] = ['name' => get_string($words, 'local_ignite'),
                    'description' => get_string($words . '_desc', 'local_ignite'),
                    'photo' => $OUTPUT->image_url('shop/' . $prize, 'local_ignite')->out(false)];
            }
            $tiers[] = $tier;
        }
        return ['balance' => $balance, 'tiers' => $tiers,
            'saved' => get_string($balance === 1 ? 'shop_saved1' : 'shop_saved', 'local_ignite')];
    }
}
