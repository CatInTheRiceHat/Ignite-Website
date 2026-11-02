<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
/** Presentation of existing native evidence. No grading, submission, completion or badge writes. */
final class missions {
    public static function editor(int $courseid): \context_course {
        require_login();
        $context = \context_course::instance($courseid);
        require_capability('moodle/course:manageactivities', $context);
        require_capability('local/ignite:managemissions', $context);
        return $context;
    }
    public static function validate(int $courseid, array $data): array {
        global $CFG,$DB;
        self::editor($courseid);
        $fields = ['title','outcome','duration','explanation','practice','requirements','cmids','nextcmid','badgeid','interestid','pathid','active'];
        if (array_diff(array_keys($data),$fields) || array_diff($fields,array_keys($data))) {
            throw new \invalid_parameter_exception('Invalid mission fields');
        }
        foreach (['title'=>100,'outcome'=>300,'duration'=>80,'explanation'=>3000,'practice'=>200,'requirements'=>1000] as $key=>$limit) {
            if (!is_string($data[$key]) || trim($data[$key])==='' || \core_text::strlen($data[$key])>$limit ||
                    clean_param($data[$key],PARAM_TEXT)!==$data[$key]) { throw new \invalid_parameter_exception('Enter plain text for '.$key); }
        }
        if (!is_array($data['cmids']) || !array_is_list($data['cmids']) || !$data['cmids'] || count($data['cmids'])>20 ||
                !in_array($data['active'],[0,1],true)) {
            throw new \invalid_parameter_exception('Choose 1–20 distinct ordered course-module IDs');
        }
        foreach ($data['cmids'] as $id) { if (!is_int($id) || $id<1) { throw new \invalid_parameter_exception('Use course-module IDs'); } }
        if (count(array_unique($data['cmids']))!==count($data['cmids']) || !is_int($data['nextcmid']) || $data['nextcmid']<0 ||
                !is_int($data['badgeid']) || $data['badgeid']<0) { throw new \invalid_parameter_exception('Use distinct activity IDs and nonnegative next activity/badge IDs'); }
        if ($data['nextcmid'] && in_array($data['nextcmid'],$data['cmids'],true)) { throw new \invalid_parameter_exception('Next step must be a distinct activity'); }
        require_once($CFG->libdir.'/completionlib.php');
        $course = get_course($courseid);
        foreach (array_merge($data['cmids'], $data['nextcmid'] ? [$data['nextcmid']] : []) as $id) {
            if (!is_int($id) || $id<1) { throw new \invalid_parameter_exception('Use course-module IDs'); }
            $cm = get_coursemodule_from_id(null,$id,$courseid,false,MUST_EXIST);
            if ($cm->deletioninprogress || !$cm->visible || !milestone_eligibility::configured($cm,$course,'complete')) {
                throw new \invalid_parameter_exception('Activity must be visible in this course with completion enabled');
            }
            require_capability('moodle/course:manageactivities',\context_module::instance($id));
        }
        if ($data['badgeid']) {
            require_once($CFG->libdir.'/badgeslib.php');
            $badge = new \core_badges\badge($data['badgeid']);
            require_capability('moodle/badges:viewbadges',$badge->get_context());
            if (($badge->courseid && (int)$badge->courseid!==$courseid) ||
                    (!$badge->courseid && !has_capability('moodle/site:config',\context_system::instance())) ||
                    count($badge->criteria)<2) { throw new \invalid_parameter_exception('Choose an authorized badge with configured native criteria'); }
        }
        $catalog = catalog::get();
        foreach (['interestid'=>'interests','pathid'=>'paths'] as $key=>$kind) {
            if (!is_string($data[$key]) || ($data[$key]!=='' && !isset($catalog[$kind][$data[$key]]))) {
                throw new \invalid_parameter_exception('Unknown '.$key.' mapping');
            }
        }
        return $data;
    }
    public static function save(int $id,int $courseid,array $data): int {
        global $DB;
        self::editor($courseid); require_sesskey(); $data=self::validate($courseid,$data);
        return access::locked('missions:'.$courseid,static function() use ($DB,$id,$courseid,$data) {
            if ($id) {
                $old=$DB->get_record('local_ignite_mission',['id'=>$id,'courseid'=>$courseid],'*',MUST_EXIST);
                if (json_decode($old->cmids,true)!==$data['cmids']) {
                    throw new \invalid_parameter_exception('Activity mappings are immutable. Deactivate this mission and create a new mapping. Native evidence is preserved.');
                }
            }
            foreach ($DB->get_records('local_ignite_mission',['courseid'=>$courseid,'active'=>1]) as $other) {
                if ((int)$other->id!==$id && $data['active'] && array_intersect(json_decode($other->cmids,true),$data['cmids'])) {
                    throw new \invalid_parameter_exception('An activity already belongs to an active mission');
                }
            }
            $row=(object)$data; $row->courseid=$courseid; $row->cmids=json_encode($data['cmids']); $row->timemodified=time();
            if ($id) { $row->id=$id; $DB->update_record('local_ignite_mission',$row); }
            else { $id=$DB->insert_record('local_ignite_mission',$row); }
            reports::invalidate();
            return $id;
        });
    }
    public static function for_activity(int $cmid): ?\stdClass {
        global $DB;
        if (!access::enabled('missions')) { return null; }
        $raw=learner_read_model::remember('missioncm:'.$cmid,
            static fn()=>$DB->get_record('course_modules',['id'=>$cmid,'deletioninprogress'=>0]));
        if (!$raw) { return null; }
        $items=learner_read_model::remember('missions:'.$raw->course,
            static fn()=>$DB->get_records('local_ignite_mission',['courseid'=>$raw->course,'active'=>1],'id'));
        foreach ($items as $mission) {
            if (in_array($cmid,json_decode($mission->cmids,true),true)) { return $mission; }
        }
        return null;
    }
    public static function activity(int $cmid): ?\cm_info {
        global $DB;
        access::learner('missions');
        $raw=learner_read_model::remember('missioncm:'.$cmid,
            static fn()=>$DB->get_record('course_modules',['id'=>$cmid,'deletioninprogress'=>0]));
        $course=$raw ? learner_read_model::remember('missioncourse:'.$raw->course,
            static fn()=>$DB->get_record('course',['id'=>$raw->course])) : false;
        if (!$course || !learner_read_model::course_available($course)) { return null; }
        $cm=get_fast_modinfo($course)->get_cms()[$cmid] ?? null;
        $cap=$cm ? 'mod/'.$cm->modname.':view' : '';
        return $cm && $cm->uservisible && $cm->available && !$cm->deletioninprogress && $cm->url &&
            (!get_capability_info($cap,false) || has_capability($cap,$cm->context)) ? $cm : null;
    }
    /** URL presentation only: the underlying cmid remains the sole evidence source. */
    public static function url(int $cmid,string $native): string {
        $mission=self::for_activity($cmid);
        if (!$mission || !self::activity($cmid)) { return $native; }
        $info=get_fast_modinfo($mission->courseid);
        foreach (json_decode($mission->cmids,true) as $id) {
            $cm=$info->get_cms()[$id] ?? null;
            if (!$cm || $cm->deletioninprogress || !$cm->visible || !$cm->is_visible_on_course_page()) { return $native; }
        }
        return (new \moodle_url('/local/ignite/mission.php',['id'=>$mission->id]))->out(false);
    }
    /** Optional missions can continue after a course's native overall rule has already been satisfied. */
    public static function next_for_course(\stdClass $course): array|false {
        global $DB,$USER;
        if (!access::enabled('missions')) { return false; }
        access::learner('missions');
        $info=get_fast_modinfo($course); $order=array_flip(array_keys($info->get_cms()));
        $items=$DB->get_records('local_ignite_mission',['courseid'=>$course->id,'active'=>1]);
        uasort($items,static fn($a,$b)=>($order[json_decode($a->cmids,true)[0]] ?? PHP_INT_MAX) <=>
            ($order[json_decode($b->cmids,true)[0]] ?? PHP_INT_MAX));
        $evidence=learner_read_model::evidence([(int)$course->id]); $starters=[];
        foreach (onboarding_config::get()['starters'] as $starter) { $starters[$starter['cmid']]=$starter['requirepass']; }
        foreach ($items as $mission) {
            foreach (json_decode($mission->cmids,true) as $id) {
                $cm=$info->get_cms()[$id] ?? null;
                if (!$cm || $cm->deletioninprogress || !$cm->visible) { break; }
                if (activity_evidence::valid($cm,$course,(int)($evidence[$id]->completionstate ?? 0),(int)$USER->id,$starters[$id] ?? false)) { continue; }
                if (!self::activity($id)) { return false; }
                return ['url'=>self::url($id,$cm->url->out(false)),'name'=>dashboard::plain($mission->title),'cmid'=>(int)$id];
            }
        }
        return false;
    }

    public static function current(int $id): ?array {
        global $DB,$CFG,$USER,$PAGE;
        $userid=access::learner('missions');
        $mission=$DB->get_record('local_ignite_mission',['id'=>$id,'active'=>1]);
        if (!$mission) { return null; }
        $course=$DB->get_record('course',['id'=>$mission->courseid]);
        if (!$course || !learner_read_model::course_available($course)) { return null; }
        require_once($CFG->libdir.'/completionlib.php');
        $ids=json_decode($mission->cmids,true); $modinfo=get_fast_modinfo($course);
        $evidence=learner_read_model::evidence([(int)$course->id]);
        $starters=[];
        foreach (onboarding_config::get()['starters'] as $starter) { $starters[$starter['cmid']]=$starter['requirepass']; }
        $steps=[]; $next=false; $complete=true; $tracked=true; $completion=new \completion_info($course);
        foreach ($ids as $cmid) {
            $cm=$modinfo->get_cms()[$cmid] ?? null;
            // Suppress the whole presentation if an underlying item is missing or hidden.
            if (!$cm || $cm->deletioninprogress || !$cm->visible || !$cm->is_visible_on_course_page()) { return null; }
            $known=milestone_eligibility::configured($cm,$course,'complete') && $completion->is_tracked_user($userid);
            $tracked=$tracked && $known;
            $done=$known && activity_evidence::valid($cm,$course,(int)($evidence[$cmid]->completionstate ?? 0),$userid,$starters[$cmid] ?? false);
            $available=self::activity($cmid);
            $steps[]=['name'=>$available ? dashboard::plain($cm->name) : get_string('mission_locked','local_ignite'),
                'status'=>get_string(!$known ? 'mission_trackingoff' : ($done ? 'mission_complete' : 'mission_incomplete'),'local_ignite')];
            if (!$done && $complete) {
                $next=$available ? ['url'=>$cm->url->out(false),'name'=>$mission->practice,'cmid'=>$cmid] : false;
            }
            $complete=$complete && $done;
        }
        $data=(array)$mission + ['steps'=>$steps,'complete'=>$complete,'action'=>$next,'feedback'=>'',
            'trackingunavailable'=>!$tracked, 'state'=>get_string(!$tracked ? 'mission_trackingoff' : ($complete ? 'mission_complete':'mission_incomplete'),'local_ignite'),
            'hasbadgeconfigured'=>(bool)$mission->badgeid,
            'badgeurl'=>access::enabled('passport') && $mission->badgeid ? (new \moodle_url('/local/ignite/badge.php',['id'=>$mission->badgeid]))->out(false) : '',
            'courseurl'=>(new \moodle_url('/course/view.php',['id'=>$course->id]))->out(false),
            'homeurl'=>(new \moodle_url('/local/ignite/index.php'))->out(false),'next'=>false,'badge'=>false,'offer'=>false];
        // Native assignment renderable applies gradebook hiding and marking-workflow release checks.
        $active=$next ? self::activity($next['cmid']) : self::activity(end($ids));
        if ($active) {
            $completion->get_data($active,true,$userid);
            $details=\core_completion\cm_completion_details::get_instance($active,$userid)->get_details();
            $data['nativerules']=array_values(array_map(static fn($rule)=>['description'=>content_to_text($rule->description,false)],$details));
        }
        if ($active && $active->modname==='assign') {
            require_once($CFG->dirroot.'/mod/assign/locallib.php');
            $assign=new \assign($active->context,$active,$course);
            if (!$assign->get_instance()->teamsubmission && $assign->can_view_submission($userid)) {
                $submission=$assign->get_user_submission($userid,false);
                $feedback=$assign->get_assign_feedback_status_renderable($USER);
                if ($feedback) {
                    $data['state']=get_string('mission_graded','local_ignite');
                    $data['feedback']=$PAGE->get_renderer('mod_assign')->render($feedback);
                } else if ($submission) {
                    $data['state']=get_string($submission->status==='submitted'?'mission_submitted':'mission_draft','local_ignite');
                }
            }
        }
        // Assessment explanations/retries remain on the native controller, which checks every attempt/review rule.
        if (!$next && !$complete) { $data['unavailable']=true; }
        if ($complete) {
            $projection=dashboard::course($course,$evidence);
            $data['personal']=$projection['known'] ? $projection['counttext'] : $projection['note'];
            if ($mission->badgeid) { $data['badge']=badge_state::get_current((int)$mission->badgeid); }
            if (access::enabled('onboarding')) {
                $invite=invitations::current();
                $data['offer']=$invite->state==='eligible' && invitations::can_offer();
            }
            $data['invitationurl']=(new \moodle_url('/local/ignite/invitation.php'))->out(false);
            $nextid=(int)$mission->nextcmid;
            $explicit=$nextid ? ($modinfo->get_cms()[$nextid] ?? null) : null;
            if ($explicit && activity_evidence::valid($explicit,$course,(int)($evidence[$nextid]->completionstate ?? 0),$userid,$starters[$nextid] ?? false)) { $nextid=0; }
            if (!$nextid && $projection['next']) {
                $nextid=(int)($projection['next']['cmid'] ?? 0);
                foreach ($modinfo->get_cms() as $cm) {
                    if (!$nextid && $cm->url && $cm->url->out(false)===$projection['next']['url']) { $nextid=(int)$cm->id; break; }
                }
            }
            if ($nextid && ($cm=self::activity($nextid))) {
                $data['next']=['url'=>self::url($nextid,$cm->url->out(false)),'name'=>dashboard::plain($cm->name)];
            }
        }
        return $data;
    }
}
