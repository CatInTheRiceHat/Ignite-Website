<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class access {
    public const FEATURES = ['onboarding', 'houses', 'passport', 'levels', 'dashboard', 'missions'];

    public static function enabled(?string $feature = null): bool {
        if (!get_config('local_ignite', 'enabled')) {
            return false;
        }
        return $feature === null || (in_array($feature, self::FEATURES, true) &&
            (bool)get_config('local_ignite', $feature));
    }

    /** No arbitrary learner ID is accepted by learner services. */
    public static function learner(?string $feature = null): int {
        global $USER;
        if (!isloggedin() || isguestuser()) {
            throw new \required_capability_exception(\context_system::instance(),
                'local/ignite:use', 'nopermissions', '');
        }
        require_capability('local/ignite:use', \context_system::instance());
        if (!self::enabled($feature)) {
            throw new \moodle_exception('disabled', 'local_ignite');
        }
        return (int)$USER->id;
    }

    public static function administrator(): void {
        require_login();
        require_capability('moodle/site:config', \context_system::instance());
        require_capability('local/ignite:configure', \context_system::instance());
    }

    /** Serialize read/modify/write operations before starting a DB transaction. */
    public static function locked(string $resource, callable $operation) {
        global $DB;
        $lock = \core\lock\lock_config::get_lock_factory('local_ignite')->get_lock($resource, 10);
        if (!$lock) {
            throw new \moodle_exception('lockfailed', 'local_ignite');
        }
        try {
            $transaction = $DB->start_delegated_transaction();
            try {
                $result = $operation();
                $transaction->allow_commit();
                learner_read_model::invalidate();
                return $result;
            } catch (\Throwable $e) {
                $transaction->rollback($e);
            }
        } finally {
            $lock->release();
        }
    }
}
