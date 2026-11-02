<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class navigation {
    public static function items(): array {
        if (!isloggedin() || isguestuser() || !access::enabled() ||
                !has_capability('local/ignite:use', \context_system::instance())) { return []; }
        $items = ['local_ignite' => ['label' => get_string('dash_dashboard', 'local_ignite'), 'path' => '/local/ignite/index.php']];
        if (access::enabled('houses')) { $items['local_ignite_hearth'] = ['label' => get_string('dash_myhearth', 'local_ignite'), 'path' => '/local/ignite/hearth.php']; }
        if (access::enabled('passport')) { $items['local_ignite_passport'] = ['label' => get_string('passport', 'local_ignite'), 'path' => '/local/ignite/passport.php']; }
        return $items;
    }
    public static function primary(\core\hook\navigation\primary_extend $hook): void {
        foreach (self::items() as $key => $item) {
            $hook->primaryview->add($item['label'], new \moodle_url($item['path']), \navigation_node::TYPE_CUSTOM, null, $key);
        }
    }
}
