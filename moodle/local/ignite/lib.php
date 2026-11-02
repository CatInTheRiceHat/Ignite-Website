<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** Add an optional destination without replacing Dashboard, My courses, or the site home. */
function local_ignite_extend_navigation(global_navigation $navigation): void {
    if (isloggedin() && !isguestuser() && \local_ignite\access::enabled() &&
            has_capability('local/ignite:use', context_system::instance())) {
        $node = $navigation->add(get_string('pluginname', 'local_ignite'),
            new moodle_url('/local/ignite/index.php'), navigation_node::TYPE_CUSTOM, null, 'local_ignite');
        $node->showinflatnavigation = true;
    }
}

/** Native callback runs after required password, profile, and site-policy checks. */
function local_ignite_after_require_login($courseorid, $autologinguest, $cm, $setwantsurltome, $preventredirect): void {
    global $SCRIPT;
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && empty($_GET) &&
            \local_ignite\onboarding::should_enter($SCRIPT, $preventredirect, $cm)) {
        redirect(new moodle_url('/local/ignite/onboarding.php'));
    }
}
