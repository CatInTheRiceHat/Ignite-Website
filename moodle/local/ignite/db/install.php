<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

function xmldb_local_ignite_install(): void {
    set_config('xpstart', time(), 'local_ignite');
    \local_ignite\installation::seed_houses();
}
