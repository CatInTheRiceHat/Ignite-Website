<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$observers = [
    ['eventname' => '\\core\\event\\course_module_completion_updated',
        'callback' => '\\local_ignite\\challenges::observe'],
    ['eventname' => '\core\event\user_deleted', 'callback' => '\local_ignite\observer::user_deleted'],
];

// Request caches never survive a response. These also refresh read-after-write within one request.
foreach (['course_module_completion_updated', 'course_completion_updated', 'course_reset_ended',
        'course_updated', 'course_deleted', 'course_module_updated', 'course_module_deleted',
        'user_enrolment_created', 'user_enrolment_updated', 'user_enrolment_deleted',
        'role_assigned', 'role_unassigned', 'role_capabilities_updated', 'user_graded',
        'badge_awarded', 'badge_revoked', 'badge_updated', 'badge_deleted', 'badge_enabled',
        'badge_disabled', 'badge_archived', 'badge_criteria_updated'] as $eventname) {
    $observers[] = ['eventname' => '\\core\\event\\' . $eventname,
        'callback' => '\\local_ignite\\learner_read_model::invalidate'];
}

foreach (['course_module_completion_updated','course_completion_updated','course_reset_ended','user_deleted',
        'user_enrolment_created','user_enrolment_updated','user_enrolment_deleted','role_assigned','role_unassigned',
        'badge_awarded','badge_revoked','course_deleted','course_updated','course_module_updated','course_module_deleted',
        'cohort_member_added','cohort_member_removed','role_capabilities_updated','user_updated','user_created','user_graded'] as $eventname) {
    $observers[]=['eventname'=>'\\core\\event\\'.$eventname,'callback'=>'\\local_ignite\\reports::invalidate'];
}
