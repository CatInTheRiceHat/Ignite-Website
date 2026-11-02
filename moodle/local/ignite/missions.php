<?php
require_once(__DIR__.'/../../config.php');
require_login();
$courseid=required_param('courseid',PARAM_INT); $id=optional_param('id',0,PARAM_INT);
$context=\local_ignite\missions::editor($courseid);
$PAGE->set_context($context); $PAGE->set_url('/local/ignite/missions.php',['courseid'=>$courseid,'id'=>$id]);
$PAGE->set_title(get_string('missions','local_ignite')); $PAGE->set_heading(get_string('missions','local_ignite'));
$form=new \local_ignite\form\mission();
if ($form->is_cancelled()) { redirect(new moodle_url('/course/view.php',['id'=>$courseid])); }
if ($data=$form->get_data()) {
    $saved=\local_ignite\missions::save($id,$courseid,\local_ignite\form\mission::values((array)$data));
    redirect(new moodle_url('/local/ignite/missions.php',['courseid'=>$courseid,'id'=>$saved]),get_string('changessaved'));
}
$row=$id ? $DB->get_record('local_ignite_mission',['id'=>$id,'courseid'=>$courseid],'*',MUST_EXIST) : (object)['id'=>0,'courseid'=>$courseid];
if ($id) { $row->activityids=implode(', ',json_decode($row->cmids,true)); }
$form->set_data($row);
echo $OUTPUT->header();
echo html_writer::link(new moodle_url('/course/view.php',['id'=>$courseid]),get_string('dash_viewcourse','local_ignite'));
echo html_writer::start_tag('ul');
foreach ($DB->get_records('local_ignite_mission',['courseid'=>$courseid],'id') as $mission) {
    echo html_writer::tag('li',html_writer::link(new moodle_url('/local/ignite/missions.php',['courseid'=>$courseid,'id'=>$mission->id]),s($mission->title)));
}
echo html_writer::end_tag('ul');
echo html_writer::tag('p',html_writer::link(new moodle_url('/badges/index.php',['type'=>2,'id'=>$courseid]),get_string('native_coursebadges','local_ignite')));
$form->display(); echo $OUTPUT->footer();
