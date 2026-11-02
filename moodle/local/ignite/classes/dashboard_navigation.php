<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

final class dashboard_navigation {
    /** Explicit administrator opt-in only; activity/enrollment/account destinations are never intercepted. */
    public static function should_land(string $path, bool $preventredirect = false, $cm = null): bool {
        global $USER, $SESSION, $CFG;
        if (!get_config('local_ignite', 'dashboardlanding') || !access::enabled('dashboard') ||
                empty($CFG->enabledashboard) || $preventredirect || $cm ||
                (defined('CLI_SCRIPT') && CLI_SCRIPT) || (defined('AJAX_SCRIPT') && AJAX_SCRIPT) ||
                (defined('WS_SERVER') && WS_SERVER) || !isloggedin() || isguestuser() ||
                !has_capability('local/ignite:use', \context_system::instance()) ||
                !in_array($path, ['/my/index.php'], true) || empty($USER->confirmed) ||
                !empty($SESSION->wantsurl) || is_siteadmin() || \core\session\manager::is_loggedinas() ||
                !empty($USER->access['rsw'])) {
            return false;
        }
        foreach (['moodle/course:update', 'moodle/course:create', 'moodle/grade:edit', 'moodle/site:config'] as $capability) {
            if (has_capability($capability, \context_system::instance())) { return false; }
            [$categories, $courses] = get_user_capability_contexts($capability, true, null, true, '', '', '', '', 1);
            if ($categories || $courses) { return false; }
        }
        return true;
    }
}
