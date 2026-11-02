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
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && empty($_GET) &&
            \local_ignite\dashboard_navigation::should_land($SCRIPT, $preventredirect, $cm)) {
        redirect(new moodle_url('/local/ignite/index.php'));
    }
}

/** Shared approved configuration artwork; no personal uploads or remote asset URLs. */
function local_ignite_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = []): void {
    global $DB;
    require_login();
    if ($context->contextlevel !== CONTEXT_SYSTEM || !in_array($filearea, ['emblem', 'mascot'], true)) {
        send_file_not_found();
    }
    if (!has_capability('local/ignite:configure', $context)) {
        \local_ignite\access::learner('houses');
    }
    $id = (int)array_shift($args);
    if (!$DB->record_exists('local_ignite_house', ['id' => $id]) || count($args) !== 1) {
        send_file_not_found();
    }
    $file = get_file_storage()->get_file($context->id, 'local_ignite', $filearea, $id, '/', $args[0]);
    if (!$file || $file->is_directory()) {
        send_file_not_found();
    }
    send_stored_file($file, 3600, 0, $forcedownload, $options);
}

/** Profile action is optional navigation; the direct routes work without any sibling feature. */
function local_ignite_myprofile_navigation(\core_user\output\myprofile\tree $tree, $user, $iscurrentuser, $course): void {
    if ($iscurrentuser && \local_ignite\access::enabled('houses') &&
            has_capability('local/ignite:use', context_system::instance())) {
        $tree->add_node(new \core_user\output\myprofile\node('miscellaneous', 'ignitehearth',
            get_string('managehearth', 'local_ignite'), null, new moodle_url('/local/ignite/choosehearth.php')));
    }
}

/** Course-scoped mission editing; native course navigation remains intact. */
function local_ignite_extend_navigation_course($navigation, $course, $context): void {
    if (has_capability('moodle/course:manageactivities', $context) &&
            has_capability('local/ignite:managemissions', $context)) {
        $navigation->add(get_string('missions','local_ignite'),
            new moodle_url('/local/ignite/missions.php',['courseid'=>$course->id]), navigation_node::TYPE_SETTING);
    }
}
