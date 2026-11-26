<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
/**
 * Fill the catalog Audience, Weeks and Topic fields. Dry run unless --apply is given.
 * Existing values are never overwritten; blank Weeks mean the course is not organised by week.
 */
define('CLI_SCRIPT', true);
require(__DIR__ . '/../../../config.php');

$apply = in_array('--apply', $argv, true);
// Keyed by course short name: audience, weeks, topic.
$values = [
    'AI Literacy' => ['Grades 4–8', '6', 'Technology & Design'],
    'CAD-Basics-4-5' => ['Grades 4–8', '6', 'Technology & Design'],
    'ONSHAPE-CAD-FOUNDATIONS' => ['Grades 4–8', '6', 'Technology & Design'],
    'Python' => ['Grades 4–8', '6', 'Technology & Design'],
    'Intro to Phys & Astr' => ['Grades 4–8', '8', 'Science'],
    'SciRes & DA' => ['College & professional', '', 'Science'],
    'Econ48' => ['Grades 4–8', '6', 'Money & Business'],
    'Intro to investing' => ['For everyone', '6', 'Money & Business'],
    'ENT101' => ['For everyone', '6', 'Money & Business'],
    'IGNITE-MBD-6W' => ['Grades 9–12', '6', 'Money & Business'],
    'IGNITE-SIPD-6W' => ['Grades 9–12', '6', 'Civics & Careers'],
    'Civics & Community' => ['For everyone', '', 'Civics & Careers'],
    'career' => ['For everyone', '6', 'Civics & Careers'],
    'Manage Stress' => ['For everyone', '5', 'Life Skills'],
    'BSS' => ['Grades 4–8', '6', 'Life Skills'],
    'LTCR 101' => ['For everyone', '6', 'Life Skills'],
    'Productivity & Time Management' => ['For everyone', '6', 'Life Skills'],
    'Emergency Preparedness and Safety' => ['For everyone', '6', 'Life Skills'],
    'PreAlg' => ['Grades 4–8', '', 'Math'],
];

\local_ignite\course_catalog::ensure_fields();
$handler = \core_course\customfield\course_handler::create();
foreach ($DB->get_records('course', null, 'id', 'id, shortname') as $course) {
    $short = trim($course->shortname);
    if ($course->id == SITEID) {
        continue;
    }
    if (!isset($values[$short])) {
        echo "SKIP  {$course->id} {$short} (no entry)\n";
        continue;
    }
    [$audience, $weeks, $topic] = $values[$short];
    foreach ($handler->get_instance_data($course->id, true) as $data) {
        $field = $data->get_field();
        $name = $field->get('shortname');
        $wanted = ['ignite_audience' => $audience, 'ignite_weeks' => $weeks, 'ignite_topic' => $topic][$name] ?? null;
        if ($wanted === null || $wanted === '' || $data->get('id')) {
            continue;
        }
        if ($field->get('type') === 'select') {
            // Moodle returns option labels HTML-escaped.
            $wanted = array_search($wanted, array_map(fn($o) => html_entity_decode($o, ENT_QUOTES), $field->get_options()), true);
            if ($wanted === false) {
                echo "ERROR {$course->id} {$short}: unknown option for {$name}\n";
                continue;
            }
        }
        echo ($apply ? 'SET   ' : 'WOULD ') . "{$course->id} {$short} {$name} = " .
            ($field->get('type') === 'select' ? html_entity_decode($field->get_options()[$wanted], ENT_QUOTES) : $wanted) . "\n";
        if ($apply) {
            $data->set('contextid', $handler->get_instance_context($course->id)->id);
            $data->instance_form_save((object)[$data->get_form_element_name() => $wanted]);
        }
    }
}
