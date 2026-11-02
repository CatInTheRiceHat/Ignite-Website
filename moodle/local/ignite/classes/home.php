<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class home {
    public static function data(): array {
        global $CFG, $OUTPUT;
        access::learner();
        $prefs = preferences::get_current();
        $house = access::enabled('houses') ? houses::get_current() : null;
        $catalog = catalog::get();
        $interestnames = [];
        foreach ($prefs->interests as $id) {
            // Removed configuration does not destroy a learner's stored choices.
            $interestnames[] = $catalog['interests'][$id]['name'] ?? $id;
        }
        $courses = [];
        foreach (enrol_get_my_courses('id, fullname', 'visible DESC, sortorder ASC') as $course) {
            if (can_access_course($course)) {
                $courses[] = ['name' => format_string($course->fullname, true,
                    ['context' => \context_course::instance($course->id)]),
                    'url' => (new \moodle_url('/course/view.php', ['id' => $course->id]))->out(false)];
            }
        }
        $learningpath = '/course/index.php';
        $learninglabel = 'explorecourses';
        if (!empty($CFG->enablemycourses)) {
            $learningpath = '/my/courses.php';
            $learninglabel = 'continuelearning';
        } else if (!empty($CFG->enabledashboard)) {
            $learningpath = '/my/';
            $learninglabel = 'opendashboard';
        }
        return [
            'mascoturl' => $OUTPUT->image_url('sol', 'local_ignite')->out(false),
            'dashboardurl' => (new \moodle_url(!empty($CFG->enabledashboard) ? '/my/' : '/',
                !empty($CFG->enabledashboard) ? [] : ['redirect' => 0]))->out(false),
            'backlabel' => get_string(!empty($CFG->enabledashboard) ? 'backtomoodle' : 'backtosite', 'local_ignite'),
            'coursesurl' => (new \moodle_url($learningpath))->out(false),
            'learninglabel' => get_string($learninglabel, 'local_ignite'),
            'catalogurl' => (new \moodle_url('/course/index.php'))->out(false),
            'badgesurl' => (new \moodle_url('/badges/mybadges.php'))->out(false),
            'courses' => $courses, 'hascourses' => (bool)$courses,
            'interests' => implode(', ', $interestnames), 'hasinterests' => (bool)$interestnames,
            'onboarding' => access::enabled('onboarding'),
            'onboardingstatus' => get_string('status_' . $prefs->status, 'local_ignite'),
            'hearthurl' => (new \moodle_url('/local/ignite/hearth.php'))->out(false),
            'choosehearthurl' => (new \moodle_url('/local/ignite/choosehearth.php'))->out(false),
            'houses' => access::enabled('houses'), 'hashouse' => (bool)$house,
            'housename' => $house ? $house->name : '',
            'housedescription' => $house ? $house->description : '',
            'houseaccent' => $house && houses::valid_accent($house->accent) ? $house->accent : '#934214',
            'emblemurl' => $house ? hearth_ui::identity($house)['emblemurl'] : '',
            'houseinactive' => $house && !$house->active,
            'passport' => access::enabled('passport'),
            'badgesenabled' => !empty($CFG->enablebadges),
        ];
    }
}
