<?php
require_once(__DIR__.'/../../config.php');
require_once($CFG->libdir.'/adminlib.php');
\local_ignite\access::administrator(); admin_externalpage_setup('local_ignite_setup');
echo $OUTPUT->header(); echo $OUTPUT->heading(get_string('setup_title','local_ignite'));
foreach (\local_ignite\setup_review::messages() as $message) { echo html_writer::tag('p',s($message)); }
foreach (['/admin/settings.php?section=local_ignite'=>'Ignite configuration','/badges/index.php?type=1'=>'Native site badges',
    '/admin/settings.php?section=badgessettings'=>'Native badge settings','/admin/tool/task/scheduledtasks.php'=>'Background tasks'] as $url=>$name) {
    echo html_writer::tag('p',html_writer::link(new moodle_url($url),s($name)));
}
echo $OUTPUT->footer();
