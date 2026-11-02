<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\task;
defined('MOODLE_INTERNAL') || die();
final class hearth_totals extends \core\task\scheduled_task {
    public function get_name(): string {
        return get_string('hearthtotals', 'local_ignite');
    }
    public function execute(): void {
        \local_ignite\challenges::refresh();
    }
}
