<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite\task;

use local_ignite\access;
use local_ignite\campfire;
use local_ignite\campfire_cup;
use local_ignite\xp;

defined('MOODLE_INTERNAL') || die();

final class campfire_cups extends \core\task\scheduled_task {
    public function get_name(): string {
        return get_string('cuptask', 'local_ignite');
    }

    public function execute(): void {
        $start = (int)get_config('local_ignite', 'xpstart');
        if (!access::enabled() || !$start) {
            return;
        }
        xp::reconcile();
        $current = campfire::period(time());
        $failure = null;
        for ($month = campfire::period($start); $month < $current; $month = $month->modify('+1 month')) {
            try {
                campfire_cup::finalize((int)$month->format('Ym'));
            } catch (\Throwable $error) {
                mtrace($month->format('Y-m') . ' ' . $error->getMessage());
                $failure = $error;
            }
        }
        if ($failure) {
            throw $failure;
        }
    }
}
