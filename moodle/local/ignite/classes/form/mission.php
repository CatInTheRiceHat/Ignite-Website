<?php
namespace local_ignite\form;
defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir.'/formslib.php');
final class mission extends \moodleform {
    public function definition(): void {
        $f=$this->_form;
        foreach (['id','courseid'] as $key) { $f->addElement('hidden',$key); $f->setType($key,PARAM_INT); }
        foreach (['title','outcome','duration','explanation','practice','requirements','activityids','nextcmid','badgeid','interestid','pathid'] as $key) {
            $f->addElement(in_array($key,['explanation','requirements','activityids'])?'textarea':'text',$key,get_string('mission_'.$key,'local_ignite'));
            $f->setType($key,in_array($key,['nextcmid','badgeid'])?PARAM_INT:PARAM_TEXT);
        }
        $f->addElement('advcheckbox','active',get_string('houseactive','local_ignite')); $f->setDefault('active',1);
        $f->addElement('static','help','',get_string('mission_editorhelp','local_ignite'));
        $this->add_action_buttons();
    }
    public static function values(array $data): array {
        $ids=preg_split('/[\s,]+/',trim($data['activityids']));
        foreach ($ids as $id) { if (!ctype_digit($id) || (int)$id<1) { throw new \invalid_parameter_exception('Enter ordered course-module IDs'); } }
        unset($data['activityids'],$data['id'],$data['courseid'],$data['submitbutton'],$data['cancel'],$data['sesskey'],$data['_qf__local_ignite_form_mission'],$data['mform_isexpanded_id_general']);
        $data['cmids']=array_map('intval',$ids);
        foreach (['nextcmid','badgeid','active'] as $key) { $data[$key]=(int)($data[$key] ?? 0); }
        return array_intersect_key($data,array_flip(['title','outcome','duration','explanation','practice','requirements','cmids','nextcmid','badgeid','interestid','pathid','active']));
    }
    public function validation($data,$files): array {
        $errors=parent::validation($data,$files);
        try { \local_ignite\missions::validate((int)$data['courseid'],self::values($data)); }
        catch (\moodle_exception $e) { $errors['activityids']=$e->getMessage(); }
        return $errors;
    }
}
