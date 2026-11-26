<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');

$courseid = required_param('id', PARAM_INT);
require_login();
require_sesskey();
if (isguestuser()) {
    throw new moodle_exception('noguest');
}
$course = get_course($courseid);
$context = context_course::instance($course->id);
$destination = new moodle_url('/course/view.php', ['id' => $course->id]);
if (!is_enrolled($context, $USER, '', true)) {
    $instance = \local_ignite\course_catalog::self_instance($course->id);
    if (!$instance) {
        redirect($destination);
    }
    enrol_get_plugin('self')->enrol_self($instance);
}
redirect($destination);
