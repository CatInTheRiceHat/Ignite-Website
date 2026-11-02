<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class observer {
    public static function user_deleted(\core\event\user_deleted $event): void {
        privacy\provider::erase_user((int)$event->objectid);
    }
}
