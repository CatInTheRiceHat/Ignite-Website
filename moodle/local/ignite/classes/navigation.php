<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class navigation {
    public static function primary(\core\hook\navigation\primary_extend $hook): void {
        if (isloggedin() && !isguestuser() && access::enabled() &&
                has_capability('local/ignite:use', \context_system::instance())) {
            $hook->primaryview->add(get_string('pluginname', 'local_ignite'),
                new \moodle_url('/local/ignite/index.php'), \navigation_node::TYPE_CUSTOM, null, 'local_ignite');
        }
    }
}
