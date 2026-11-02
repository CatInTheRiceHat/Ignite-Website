<?php
require_once(__DIR__.'/../../config.php');
require_login(); \local_ignite\access::learner('missions');
$id=required_param('id',PARAM_INT);
$PAGE->set_context(context_system::instance()); $PAGE->set_url('/local/ignite/mission.php',['id'=>$id]);
$PAGE->set_title(get_string('missions','local_ignite')); $PAGE->set_heading(get_string('missions','local_ignite'));
$PAGE->requires->css('/local/ignite/dashboard.css');
$data=\local_ignite\missions::current($id);
if (!$data) { throw new moodle_exception('mission_unavailable','local_ignite'); }
$PAGE->set_context(context_course::instance($data['courseid']));
if ($data['badge']) { $data['badgestatus']=get_string('passport_state_'.$data['badge']['state'],'local_ignite'); }
echo $OUTPUT->header(); echo $OUTPUT->render_from_template('local_ignite/mission',$data);
if ($data['offer']) { \local_ignite\invitations::shown(); }
echo $OUTPUT->footer();
