<?php
// Real Moodle fixture and integration checks. Never bootstrap a production DB or production data copy.
if (PHP_SAPI!=='cli' || $argc<2) { exit("Supply private Moodle root [--advance|--after].\n"); }
define('CLI_SCRIPT',true); require $argv[1].'/config.php';
if (!str_contains($CFG->dbname,'ignite_lms_test_final_') || empty($CFG->noemailever) ||
        !str_starts_with($CFG->wwwroot,'http://127.0.0.1:879') || !str_starts_with($CFG->dataroot,'/tmp/ignite-final-runtime/')) {
    throw new RuntimeException('Isolated final fixture required');
}
require_once($CFG->dirroot.'/user/lib.php'); require_once($CFG->dirroot.'/course/lib.php');
require_once($CFG->dirroot.'/course/modlib.php'); require_once($CFG->libdir.'/completionlib.php');
require_once($CFG->libdir.'/gradelib.php'); require_once($CFG->libdir.'/badgeslib.php');
require_once($CFG->dirroot.'/mod/quiz/locallib.php'); require_once($CFG->dirroot.'/mod/assign/locallib.php');
require_once($CFG->libdir.'/questionlib.php');
use local_ignite\access; use local_ignite\missions; use local_ignite\onboarding;
use local_ignite\preferences; use local_ignite\invitations; use local_ignite\houses;
use local_ignite\challenges; use local_ignite\badge_state; use local_ignite\learner_read_model;
use local_ignite\reports; use local_ignite\onboarding_policy;
$checks=0;
function check(bool $ok,string $message): void { global $checks; if (!$ok) { throw new RuntimeException($message); } $checks++; echo "PASS $message\n"; }
function rejected(callable $call,string $message): void { try { $call(); } catch (moodle_exception $e) { check(true,$message); return; } throw new RuntimeException('Expected rejection: '.$message); }
function as_user(stdClass $user): void { core\session\manager::set_user($user); $_POST=['sesskey'=>sesskey()]; $_GET=[]; learner_read_model::invalidate(); }
function fixture_write(callable $call): void { $call(); learner_read_model::invalidate(); }
function snapshot(stdClass $record): \core\event\course_module_completion_updated {
    $event=\core\event\course_module_completion_updated::create(['objectid'=>$record->id,
        'context'=>context_module::instance($record->coursemoduleid),'relateduserid'=>$record->userid,
        'other'=>['completionstate'=>$record->completionstate]]);
    $event->add_record_snapshot('course_modules_completion',$record); return $event;
}
function attempt(stdClass $quiz,int $number,bool $correct): stdClass {
    global $USER;
    $settings=\mod_quiz\quiz_settings::create($quiz->id,$USER->id);
    $previous=quiz_get_user_attempts($quiz->id,$USER->id,'finished',true); $last=$previous ? end($previous) : false;
    if ($settings->get_access_manager(time())->prevent_new_attempt(count($previous),$last)) { throw new RuntimeException('Native attempt rules prohibit retry'); }
    $usage=question_engine::make_questions_usage_by_activity('mod_quiz',$settings->get_context());
    $usage->set_preferred_behaviour($settings->get_quiz()->preferredbehaviour);
    $row=quiz_create_attempt($settings,$number,$last,time(),false,$USER->id);
    $row=quiz_start_new_attempt($settings,$usage,$row,$number,time());
    $row=quiz_attempt_save_started($settings,$usage,$row);
    $object=\mod_quiz\quiz_attempt::create($row->id);
    $object->process_submitted_actions(time(),false,[1=>['answer'=>$correct ? 'Transport 6, lunch 8, save 6' : 'Transport 6, lunch 8, games 10']]);
    $object->process_submit(time(),false,null,false);
    $object->process_grade_submission(time());
    return $object->get_attempt();
}
function revise_grade($cm,$course,int $userid,object $data,int $value): void {
    // Native released grades are locked. Reopen the workflow before changing and releasing a mark.
    $assign=new assign($cm->context,$cm,$course);
    $data->workflowstate=ASSIGN_MARKING_WORKFLOW_STATE_INMARKING; $assign->save_grade($userid,$data);
    $assign=new assign($cm->context,$cm,$course); $data->grade=$value; $assign->save_grade($userid,$data);
    $data->workflowstate=ASSIGN_MARKING_WORKFLOW_STATE_RELEASED; $assign->save_grade($userid,$data);
}
function confirm_badge(int $badgeid,int $userid): void {
    global $DB,$USER;
    $badge=new \core_badges\badge($badgeid);
    $roleid=(int)$DB->get_field('role','id',['shortname'=>'editingteacher']);
    \core_badges\award_manager::process_manual_award($userid,$USER->id,$roleid,$badgeid);
    badges_award_handle_manual_criteria_review((object)['crit'=>$badge->criteria[BADGE_CRITERIA_TYPE_MANUAL],'userid'=>$userid]);
}
function advance(): void {
    global $CFG;
    \core_completion\api::mark_course_completions_activity_criteria(); aggregate_completions(0);
    (new \core\task\badges_cron_task())->execute();
    (new \local_ignite\task\hearth_totals())->execute();
    (new \local_ignite\task\learner_reports())->execute();
}
as_user(get_admin()); $PAGE->set_context(context_system::instance()); $PAGE->set_url('/local/ignite/index.php');
// All CLI phases use an isolated no-email configuration, including later audit runs.
set_config('noreplyaddress','noreply@example.invalid'); $CFG->noreplyaddress='noreply@example.invalid';
if (($argv[2] ?? '')==='--worker') {
    as_user(core_user::get_user((int)$argv[3]));
    $record=$DB->get_record('course_modules_completion',['userid'=>(int)$argv[3],'coursemoduleid'=>(int)$argv[4]],'*',MUST_EXIST);
    for ($n=0;$n<6;$n++) { challenges::observe(snapshot($record)); }
    exit;
}
if (($argv[2] ?? '')==='--configuration') {
    $fixture=json_decode(get_config('local_ignite','integrationfixture'));
    $config=get_config('local_ignite','onboardingconfig');
    check((bool)local_ignite\onboarding_config::parse($config)['starters'],'Configured real starter passes save-time prerequisite validation');
    $enabled=$CFG->enablecompletion; $CFG->enablecompletion=0;
    rejected(fn()=>local_ignite\onboarding_config::parse($config),'Saving a starter explains disabled native completion');
    $CFG->enablecompletion=$enabled;
    $badge=\core_badges\badge::create_badge((object)['name'=>'Unconfigured fixture badge','version'=>'1','language'=>'en','description'=>'Not enabled or awarded',
        'imagecaption'=>'','issuername'=>'Ignite fixture','issuerurl'=>$CFG->wwwroot,'issuercontact'=>'fixture@example.invalid'],$fixture->courseid);
    $mapping=['badges'=>[$badge->id=>['category'=>'starter']]];
    rejected(fn()=>local_ignite\passport_catalog::parse(json_encode($mapping)),'Enabled Passport mapping rejects unconfigured native badge criteria');
    $mapping['badges'][$badge->id]['enabled']=false;
    check((bool)local_ignite\passport_catalog::parse(json_encode($mapping)),'Disabled draft badge mapping remains configurable');
    $mission=$DB->get_record('local_ignite_mission',['id'=>$fixture->missionid]);
    $data=array_intersect_key((array)$mission,array_flip(['title','outcome','duration','explanation','practice','requirements','cmids','nextcmid','badgeid','interestid','pathid','active']));
    $data['cmids']=json_decode($data['cmids'],true);
    foreach (['nextcmid','badgeid','active'] as $field) { $data[$field]=(int)$data[$field]; }
    rejected(fn()=>missions::validate((int)$fixture->courseid,array_replace($data,['cmids'=>[[]]])),'Malformed mission IDs fail validation without a PHP warning');
    $user=$DB->get_record('user',['username'=>$fixture->users->learner]);
    // Restore a released passing grade after the creation suite's reversal case, for browser review.
    $course=get_course($fixture->courseid); $cm=get_fast_modinfo($course)->get_cm($fixture->assignmentid);
    revise_grade($cm,$course,(int)$user->id,(object)['attemptnumber'=>0,'addattempt'=>0,'applytoall'=>0,
        'assignfeedbackcomments_editor'=>['text'=>'MENTOR_FEEDBACK: Clear explanation of your priorities.','format'=>FORMAT_HTML,'itemid'=>0]],80);
    as_user($user);
    $later=missions::current((int)$fixture->laterid);
    check($later && $later['complete'],'Released passing native feedback retains mission completion');
    check(missions::current((int)$fixture->missionid)['next']===false,'Completed explicit next mission is not offered again');
    as_user(get_admin()); reports::refresh();
    $row=reports::request(gmdate('Y-m-d',time()-86400),gmdate('Y-m-d',time()+86400));
    as_user($user); $prefs=preferences::get_current();
    onboarding::save('saveinterests','interests',['interests'=>$prefs->interests],true);
    check(!(int)$DB->get_field('local_ignite_report','timeupdated',['id'=>$row->id]) && preferences::get_current()->status==='complete',
        'Committed preference changes invalidate reports while preserving completed onboarding');
    as_user(get_admin()); advance();
    echo "Configuration checks: $checks passed\n"; exit;
}
if (($argv[2] ?? '')==='--early') {
    $fixture=json_decode(get_config('local_ignite','integrationfixture'),true);
    $username='earlyweb_'.bin2hex(random_bytes(4));
    $id=user_create_user((object)['username'=>$username,'firstname'=>'Early','lastname'=>'Fixture','email'=>$username.'@example.invalid',
        'password'=>'FixtureOnly!4829aZ','auth'=>'manual','confirmed'=>1,'policyagreed'=>1,'mnethostid'=>$CFG->mnet_localhost_id]);
    $manual=enrol_get_plugin('manual');
    $instance=array_values(array_filter(enrol_get_instances($fixture['courseid'],false),fn($r)=>$r->enrol==='manual'))[0];
    $manual->enrol_user($instance,$id,$DB->get_field('role','id',['shortname'=>'student']));
    $fixture['users']['earlyweb']=$username;
    set_config('integrationfixture',json_encode($fixture),'local_ignite');
    echo 'INTEGRATION_FIXTURE='.json_encode($fixture)."\n"; exit;
}
if (($argv[2] ?? '')==='--audit') {
    $fixture=json_decode(get_config('local_ignite','integrationfixture'));
    $early=$DB->get_record('user',['username'=>$fixture->users->early],'*',MUST_EXIST);
    as_user($early); $raw=get_coursemodule_from_id('quiz',$fixture->cmid); $quiz=$DB->get_record('quiz',['id'=>$raw->instance]);
    attempt($quiz,1,true);
    check(local_ignite\recommendations::completed_starter()===$fixture->cmid,'Additional native completion remains the sole source of starter evidence');
    $challenge=challenges::current(); $house=houses::get_current();
    $DB->delete_records('local_ignite_credit',['userid'=>$early->id,'cmid'=>$fixture->cmid,'challengeid'=>$challenge->id]); challenges::refresh();
    $workers=[];
    for ($n=0;$n<3;$n++) {
        $workers[]=proc_open([PHP_BINARY,__FILE__,$argv[1],'--worker',$early->id,$fixture->cmid],
            [0=>['file','/dev/null','r'],1=>['file','/dev/null','a'],2=>['file','/dev/null','a']],$pipes);
    }
    $ok=true; foreach ($workers as $worker) { $ok=$ok && proc_close($worker)===0; }
    $total=challenges::progress((int)$challenge->id,(int)$house->id);
    check($ok && $DB->count_records('local_ignite_credit',['userid'=>$early->id,'cmid'=>$fixture->cmid,'challengeid'=>$challenge->id])===1 && $total['own']===1,
        'Concurrent first delivery updates the cached counter exactly once');
    as_user(get_admin()); $range=reports::request(gmdate('Y-m-d',time()-86400),gmdate('Y-m-d',time()+86400));
    reports::invalidate(); reports::refresh();
    check((int)$DB->get_field('local_ignite_report','timeupdated',['id'=>$range->id])>0,'Background report refresh replaces an invalidated snapshot without page recalculation');
    $json=json_encode(['thresholds'=>[0,1,3,6,10],'milestones'=>(object)[],'labels'=>['One','Two','Three','Four','Five']]);
    check(local_ignite\heat_stages::parse($json)['labels'][1]==='Two','Administrator stage labels are editable without changing Hearth identity');
    check(!get_config('local_ignite','levels'),'Experimental personal stages remain disabled');
    echo "Final audit checks: $checks passed\n"; exit;
}
if (($argv[2] ?? '')==='--advance') { advance(); exit("Native completion, badge, Hearth and report tasks executed.\n"); }
if (($argv[2] ?? '')==='--after') {
    $fixture=json_decode(get_config('local_ignite','integrationfixture'));
    as_user(core_user::get_user($fixture->users->journeyid));
    check(local_ignite\recommendations::completed_starter()===$fixture->cmid,'Browser journey produced real valid starter evidence');
    as_user(get_admin()); confirm_badge($fixture->badgeid,$fixture->users->journeyid);
    advance(); as_user(core_user::get_user($fixture->users->journeyid));
    check(badge_state::get_current($fixture->badgeid)['earned'],'Native background processing confirms the browser learner badge');
    check(missions::current($fixture->missionid)['complete'],'Mission derives browser success from native completion');
    echo "Post-browser checks: $checks passed\n"; exit;
}
check((int)get_config('local_ignite','version')===2026110700,'Final native version installed/upgraded');
check(!get_config('local_ignite','missions') && !get_config('local_ignite','levels'),'Missions and undecided stages default off');
foreach (['enabled','onboarding','houses','passport','dashboard','missions'] as $flag) { set_config($flag,1,'local_ignite'); }
set_config('enablecompletion',1); $CFG->enablecompletion=1; set_config('enablebadges',1); $CFG->enablebadges=1;
set_config('noreplyaddress','noreply@example.invalid'); $CFG->noreplyaddress='noreply@example.invalid';
set_config('badges_allowcoursebadges',1); $CFG->badges_allowcoursebadges=1;
$DB->set_field('tool_usertours_tours','enabled',0);
$tag='final_'.bin2hex(random_bytes(4)); $users=[];
foreach (['learner','journey','early','empty','editor','mentor','privacy'] as $key) {
    $id=user_create_user((object)['username'=>$tag.'_'.$key,'firstname'=>ucfirst($key),'lastname'=>'Fixture',
        'email'=>$tag.'_'.$key.'@example.invalid','password'=>'FixtureOnly!4829aZ','auth'=>'manual','confirmed'=>1,'policyagreed'=>1,'mnethostid'=>$CFG->mnet_localhost_id]);
    $users[$key]=core_user::get_user($id,'*',MUST_EXIST);
}
$course=create_course((object)['fullname'=>'A small practical budget','shortname'=>$tag,'category'=>$DB->get_field('course_categories','id',[],IGNORE_MULTIPLE),
    'enablecompletion'=>1,'startdate'=>time()-86400]);
$manual=enrol_get_plugin('manual'); $instance=array_values(array_filter(enrol_get_instances($course->id,false),fn($r)=>$r->enrol==='manual'))[0];
foreach (['learner','journey','early','editor','mentor','privacy'] as $key) {
    $role=$DB->get_field('role','id',['shortname'=>$key==='editor'?'editingteacher':($key==='mentor'?'teacher':'student')]);
    $manual->enrol_user($instance,$users[$key]->id,$role);
}
$qdata=(object)['modulename'=>'quiz','module'=>$DB->get_field('modules','id',['name'=>'quiz']),'course'=>$course->id,
    'section'=>0,'name'=>'Budget choices starter','intro'=>'Choose a plan that covers essentials without overspending.','introformat'=>FORMAT_HTML,
    'visible'=>1,'cmidnumber'=>'','grade'=>10,'gradepass'=>5,'sumgrades'=>0,'timeopen'=>0,'timeclose'=>0,'timelimit'=>0,
    'overduehandling'=>'autosubmit','graceperiod'=>0,'preferredbehaviour'=>'deferredfeedback','attempts'=>2,'grademethod'=>1,
    'decimalpoints'=>2,'questiondecimalpoints'=>-1,'questionsperpage'=>1,'navmethod'=>'free','shuffleanswers'=>0,
    'browsersecurity'=>'-','quizpassword'=>'','subnet'=>'','completion'=>2,'completionusegrade'=>1,'completiongradeitemnumber'=>0,'completionpassgrade'=>1,
    'attemptimmediately'=>1,'attemptopen'=>1,'attemptclosed'=>1];
$q=add_moduleinfo($qdata,$course); $quiz=$DB->get_record('quiz',['id'=>$q->instance],'*',MUST_EXIST);
$categoryid=$DB->insert_record('question_categories',(object)['contextid'=>context_course::instance($course->id)->id,
    'name'=>'Budget fixture questions','info'=>'Private fixture','infoformat'=>FORMAT_HTML,'stamp'=>make_unique_id_code(),'parent'=>0,'sortorder'=>1]);
$editor=['text'=>'You have 20 credits. Transport costs 6 and lunch costs 8. Which choice covers both essentials and stays within 20?','format'=>FORMAT_HTML];
$form=(object)['category'=>$categoryid.','.context_course::instance($course->id)->id,'name'=>'Choose a practical budget','questiontext'=>$editor,
    'generalfeedback'=>['text'=>'BUDGET_FEEDBACK: Essentials cost 14, leaving 6. Protect essentials before optional spending.','format'=>FORMAT_HTML],
    'defaultmark'=>1,'penalty'=>0,'status'=>'ready','single'=>1,'shuffleanswers'=>0,'answernumbering'=>'abc','shownumcorrect'=>0,
    'answer'=>[['text'=>'Transport 6, lunch 8, save 6','format'=>FORMAT_HTML],['text'=>'Transport 6, lunch 8, games 10','format'=>FORMAT_HTML]],
    'fraction'=>[1,0],'feedback'=>[['text'=>'Essentials fit and leave a buffer.','format'=>FORMAT_HTML],['text'=>'This plan costs more than 20.','format'=>FORMAT_HTML]],
    'correctfeedback'=>['text'=>'Good budget choice','format'=>FORMAT_HTML],'partiallycorrectfeedback'=>['text'=>'Review essentials','format'=>FORMAT_HTML],
    'incorrectfeedback'=>['text'=>'Try a plan within the budget','format'=>FORMAT_HTML]];
$question=question_bank::get_qtype('multichoice')->save_question((object)['qtype'=>'multichoice'],$form);
quiz_add_quiz_question($question->id,$quiz);
\mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_quiz_sumgrades();
$quiz=$DB->get_record('quiz',['id'=>$quiz->id]);
$a=add_moduleinfo((object)['modulename'=>'assign','module'=>$DB->get_field('modules','id',['name'=>'assign']),
    'course'=>$course->id,'section'=>0,'name'=>'Explain your budget trade-off','intro'=>'Explain one choice you made.','introformat'=>FORMAT_HTML,
    'visible'=>1,'cmidnumber'=>'','completion'=>2,'completionusegrade'=>1,'completionpassgrade'=>1,'grade'=>100,'gradepass'=>60,'completionsubmit'=>1,
    'duedate'=>0,'cutoffdate'=>0,'gradingduedate'=>0,'markercount'=>1,'teamsubmissiongroupingid'=>0,'allowsubmissionsfromdate'=>0,
    'submissiondrafts'=>1,'requiresubmissionstatement'=>0,'sendnotifications'=>0,'sendlatenotifications'=>0,'teamsubmission'=>0,
    'requireallteammemberssubmit'=>0,'blindmarking'=>0,'markingworkflow'=>1,'markingallocation'=>0,'attemptreopenmethod'=>'none','maxattempts'=>1,
    'assignsubmission_onlinetext_enabled'=>1,'assignsubmission_file_enabled'=>0,'assignfeedback_comments_enabled'=>1],$course);
$criterion=completion_criteria::factory(['criteriatype'=>COMPLETION_CRITERIA_TYPE_ACTIVITY,'course'=>$course->id]);
$completionconfig=(object)['id'=>$course->id,'criteria_activity'=>[$q->coursemodule=>1]]; $criterion->update_config($completionconfig);
$badge=\core_badges\badge::create_badge((object)['name'=>'Practical budget starter','version'=>'1','language'=>'en','description'=>'Complete the native starter course rule.',
    'imagecaption'=>'','issuername'=>'Ignite fixture','issuerurl'=>$CFG->wwwroot,'issuercontact'=>'fixture@example.invalid'],$course->id);
award_criteria::build(['badgeid'=>$badge->id,'criteriatype'=>BADGE_CRITERIA_TYPE_OVERALL])->save(['agg'=>BADGE_CRITERIA_AGGREGATION_ALL]);
award_criteria::build(['badgeid'=>$badge->id,'criteriatype'=>BADGE_CRITERIA_TYPE_COURSE])->save(['course_'.$course->id=>$course->id]);
award_criteria::build(['badgeid'=>$badge->id,'criteriatype'=>BADGE_CRITERIA_TYPE_MANUAL])->save([
    'role_'.$DB->get_field('role','id',['shortname'=>'editingteacher'])=>$DB->get_field('role','id',['shortname'=>'editingteacher']),
    'description'=>'A mentor confirms the practical budget choice after the native passing requirement.']);
$image=make_request_directory().'/badge.png'; copy($CFG->dirroot.'/local/ignite/pix/sol.png',$image); badges_process_badge_image($badge,$image);
$badge=new \core_badges\badge($badge->id); $badge->set_status(BADGE_STATUS_ACTIVE);
$mapping=['interests'=>['money'=>['name'=>'Money skills','activityids'=>[(int)$q->coursemodule],'courseids'=>[(int)$course->id]]],
    'paths'=>['starter'=>['name'=>'A small money skill','interestids'=>['money']]]];
set_config('catalog',json_encode($mapping),'local_ignite');
set_config('onboardingconfig',json_encode(['starters'=>[['cmid'=>(int)$q->coursemodule,'requirepass'=>true]],
    'outcomes'=>['activity:'.$q->coursemodule=>'Choose essentials within a small budget.','course:'.$course->id=>'Make one practical budget choice.']]),'local_ignite');
set_config('passportcatalog',json_encode(['badges'=>[$badge->id=>['category'=>'starter','courseid'=>(int)$course->id,'artwork'=>'native']]]),'local_ignite');
set_config('hearthselectionroute','/local/ignite/choosehearth.php','local_ignite'); set_config('hearthtiming','afterchallenge','local_ignite');
// Explicitly configure draft identities in this fixture only; installation creates none.
local_ignite\hearth_setup::apply(['embercrest'=>-1,'cinderwick'=>-1]); $hearths=array_values(houses::available());
$metadata=['title'=>'Choose a budget that fits','outcome'=>'Protect essentials within 20 credits','duration'=>'About 5 minutes',
    'explanation'=>'List the essential costs first. For a different example, 5 credits for travel and 7 for lunch use 12 of a 20-credit budget.',
    'practice'=>'Try the budget activity','requirements'=>'Meet the passing requirement in the native quiz.','cmids'=>[(int)$q->coursemodule],
    'nextcmid'=>(int)$a->coursemodule,'badgeid'=>(int)$badge->id,'interestid'=>'money','pathid'=>'starter','active'=>1];
as_user($users['editor']); $missionid=missions::save(0,(int)$course->id,$metadata);
$later=$metadata; $later['title']='Explain a trade-off'; $later['cmids']=[(int)$a->coursemodule]; $later['nextcmid']=0; $later['badgeid']=0;
$later['practice']='Write your explanation'; $later['requirements']='Submit your explanation and receive the configured passing mentor grade.';
$laterid=missions::save(0,(int)$course->id,$later);
$nativebefore=[$DB->get_record('quiz',['id'=>$quiz->id]),$DB->get_record('course_modules',['id'=>$q->coursemodule])];
$metadata['title']='Make a budget choice'; missions::save($missionid,(int)$course->id,$metadata);
check($nativebefore==[$DB->get_record('quiz',['id'=>$quiz->id]),$DB->get_record('course_modules',['id'=>$q->coursemodule])], 'Mission metadata changes preserve native grading/completion configuration');
rejected(fn()=>missions::save($missionid,(int)$course->id,array_replace($metadata,['cmids'=>[(int)$a->coursemodule]])), 'Mapped activity identity cannot silently replace evidence');
as_user($users['mentor']); rejected(fn()=>missions::save($missionid,(int)$course->id,$metadata),'Mentor cannot edit presentation without course editing permission');
as_user($users['empty']); check(missions::current($missionid)===null,'Unenrolled direct mission URL cannot reveal activity presentation');
rejected(fn()=>reports::request('2026-11-01','2026-11-02'),'Learner cannot view or queue the administrator report');
as_user($users['learner']); rejected(fn()=>missions::save($missionid,(int)$course->id,$metadata),'Learner cannot edit course mission metadata');
onboarding::save('next','welcome'); onboarding::save('next','interests',['interests'=>['money']]);
onboarding::save('next','goal',['goals'=>'make']);
check(local_ignite\recommendations::current()[0]['course']->id==$course->id,'Saved interests recommend a real eligible path');
onboarding::save('next','path',['targetkey'=>'activity:'.$q->coursemodule]);
$url=onboarding::save('start','finish');
check(str_contains($url->out(false),'/local/ignite/mission.php?id='.$missionid),'Prompt 2 wraps the same starter ID through its mission presentation');
check(preferences::get_current()->status==='complete' && !invitations::can_offer(),'Finishing onboarding does not fabricate starter completion or invite early');
$wrong=attempt($quiz,1,false);
check(local_ignite\recommendations::completed_starter()===null && !missions::current($missionid)['complete'],'Incorrect native answer does not complete the starter mission');
check(!str_contains(json_encode(missions::current($missionid)),'BUDGET_FEEDBACK'),'Withheld Quiz feedback is never copied into mission teaching text');
$settings=\mod_quiz\quiz_settings::create($quiz->id,$USER->id);
check(!$settings->get_access_manager(time())->is_finished(1,$wrong),'Native attempt rules allow the remaining retry');
$correct=attempt($quiz,2,true);
check(local_ignite\recommendations::completed_starter()===(int)$q->coursemodule && missions::current($missionid)['complete'],'Correct native answer satisfies the shared starter/mission evidence');
check($settings->get_access_manager(time())->is_finished(2,$correct),'Native attempt limit prevents a third attempt');
set_config('dashboard',0,'local_ignite');
check(missions::current($missionid)['complete'],'Missions remain usable when the separate dashboard feature is off');
set_config('dashboard',1,'local_ignite');
check(invitations::can_offer() && !houses::get_current(),'After-challenge invitation does not require membership or badge issuance');
check(!badge_state::get_current((int)$badge->id)['earned'],'Starter badge is honestly unearned while its native mentor criterion is pending');
check(missions::current($missionid)['next']!==false,'Missing badge does not block the next eligible mission');
invitations::defer(); check(!missions::current($missionid)['offer'] && preferences::get_current()->status==='complete','Deferred invitation preserves completed onboarding and further learning');
as_user(get_admin());
$period=challenges::configure(0,['name'=>'Useful choices together','description'=>'Practice a small practical skill','target'=>5,
    'timestart'=>time()+60,'timeend'=>time()+86400,'timezone'=>'UTC','active'=>1],[(int)$q->coursemodule=>'pass',(int)$a->coursemodule=>'pass']);
fixture_write(fn()=>$DB->set_field('local_ignite_challenge','timestart',time()-300,['id'=>$period]));
as_user($users['learner']); houses::set_current((int)$hearths[0]->id);
fixture_write(fn()=>$DB->set_field('local_ignite_history','timebegin',time()-100,['userid'=>$USER->id,'timeend'=>0]));
check(challenges::progress($period,(int)$hearths[0]->id)['own']===0 && local_ignite\recommendations::completed_starter()===(int)$q->coursemodule,
    'Pre-membership starter keeps personal completion and receives no retroactive Hearth credit');
as_user($users['editor']); confirm_badge((int)$badge->id,(int)$users['learner']->id);
advance(); as_user($users['learner']);
check(badge_state::get_current((int)$badge->id)['earned'],'Native completion/badge background processing confirms issuance');
// Native assignment draft/submission; feedback renderer owns release/hidden-grade rules.
$cm=get_fast_modinfo($course)->get_cm($a->coursemodule); $assign=new assign($cm->context,$cm,$course);
$submissiondata=(object)['onlinetext_editor'=>['text'=>'I protected transport and lunch and kept a small buffer.','format'=>FORMAT_HTML,'itemid'=>0]];
$notices=[]; $assign->save_submission($submissiondata,$notices);
check(str_contains(missions::current($laterid)['state'],'Draft'),'Mentor-graded draft is distinguished without completing it');
$submitdata=(object)['submissionstatement'=>1]; $notices=[]; $assign->submit_for_grading($submitdata,$notices);
check(str_contains(missions::current($laterid)['state'],'awaiting feedback') && !missions::current($laterid)['complete'],'Submission with a passing-grade criterion remains awaiting feedback');
// Grade using native Assignment save API, with marking workflow initially withholding feedback.
as_user($users['editor']); $assign=new assign($cm->context,$cm,$course);
$gradedata=(object)['grade'=>80,'attemptnumber'=>0,'addattempt'=>0,'applytoall'=>0,'workflowstate'=>ASSIGN_MARKING_WORKFLOW_STATE_INMARKING,
    'assignfeedbackcomments_editor'=>['text'=>'MENTOR_FEEDBACK: Clear explanation of your priorities.','format'=>FORMAT_HTML,'itemid'=>0]];
$assign->save_grade($users['learner']->id,$gradedata);
as_user($users['learner']); check(!str_contains(missions::current($laterid)['feedback'],'MENTOR_FEEDBACK'),'Unreleased marking-workflow feedback stays withheld');
as_user($users['editor']); $gradedata->workflowstate=ASSIGN_MARKING_WORKFLOW_STATE_RELEASED; $assign->save_grade($users['learner']->id,$gradedata);
as_user($users['learner']);
check(str_contains(missions::current($laterid)['feedback'],'MENTOR_FEEDBACK') && missions::current($laterid)['complete'],'Released native mentor feedback and completion are shown accurately');
$evidence=$DB->get_record('course_modules_completion',['userid'=>$USER->id,'coursemoduleid'=>$a->coursemodule],'*',MUST_EXIST);
$delayed=snapshot($evidence);
// Simulate transport delay: retain genuine native evidence, remove only this fixture's already-delivered ledger row.
$DB->delete_records('local_ignite_credit',['userid'=>$USER->id,'cmid'=>$a->coursemodule,'challengeid'=>$period]); challenges::refresh();
sleep(2); houses::set_current((int)$hearths[1]->id); challenges::observe($delayed);
check((int)$DB->get_field('local_ignite_credit','houseid',['userid'=>$USER->id,'cmid'=>$a->coursemodule,'challengeid'=>$period])===(int)$hearths[0]->id,
    'Delayed native event uses membership at qualifying completion time, not current membership');
$DB->delete_records('local_ignite_credit',['userid'=>$USER->id,'cmid'=>$a->coursemodule,'challengeid'=>$period]); challenges::refresh();
$workers=[];
for ($n=0;$n<3;$n++) {
    $workers[]=proc_open([PHP_BINARY,__FILE__,$argv[1],'--worker',$USER->id,$a->coursemodule],
        [0=>['file','/dev/null','r'],1=>['file','/dev/null','a'],2=>['file','/dev/null','a']],$pipes);
}
$ok=true; foreach ($workers as $worker) { $ok=$ok && proc_close($worker)===0; }
check($ok && $DB->count_records('local_ignite_credit',['userid'=>$USER->id,'cmid'=>$a->coursemodule,'challengeid'=>$period])===1,
    'Concurrent duplicate events produce one credit under native locks and the unique database key');
houses::set_current((int)$hearths[0]->id);
$issued=$DB->get_records('badge_issued',['userid'=>$USER->id]);
as_user($users['editor']); revise_grade($cm,$course,(int)$users['learner']->id,$gradedata,20);
as_user($users['learner']);
check(!missions::current($laterid)['complete'] && $DB->get_records('badge_issued',['userid'=>$USER->id])==$issued,'Changed failing grade reverses mission completion without revoking a native badge');
as_user(get_admin()); $manual->update_user_enrol($instance,$users['learner']->id,ENROL_USER_SUSPENDED);
as_user($users['learner']); check(missions::current($missionid)===null,'Revoked enrollment invalidates direct mission access immediately');
as_user(get_admin()); $manual->update_user_enrol($instance,$users['learner']->id,ENROL_USER_ACTIVE);
as_user($users['learner']); check(preferences::get_current()->status==='complete','Restored course access retains onboarding records');
// Invitation policy changes do not reset completed/dismissed/deferred records.
as_user($users['early']); set_config('hearthtiming','initial','local_ignite');
check(invitations::can_offer(),'Administrator can offer Hearth selection during initial onboarding');
houses::set_current((int)$hearths[1]->id);
check(invitations::current()->state==='accepted' && !local_ignite\recommendations::completed_starter(),'Early membership does not fabricate starter learning');
set_config('hearthtiming','afterchallenge','local_ignite');
as_user($users['journey']); onboarding::save('skip','welcome');
check(preferences::get_current()->status==='dismissed','Skipping onboarding persists a resumable dismissal');
onboarding::save('next','welcome'); check(onboarding::step()==='interests','Explicit resume returns to the saved step');
// Leave browser journey as a new account with no saved walkthrough record.
$DB->delete_records('local_ignite_prefs',['userid'=>$USER->id]); learner_read_model::invalidate();
as_user(get_admin());
$renamed=$hearths[0]; houses::configure((int)$renamed->id,['name'=>'A renamed draft Hearth','description'=>$renamed->description,'accent'=>$renamed->accent,'emblem'=>$renamed->emblem,'active'=>1]);
$from=gmdate('Y-m-d',time()-86400); $to=gmdate('Y-m-d',time()+86400);
$report=reports::request($from,$to); check(!$report->timeupdated,'Report page queues a bounded range without calculating learner metrics');
(new local_ignite\task\learner_reports())->execute();
$report=$DB->get_record('local_ignite_report',['id'=>$report->id]); $totals=json_decode($report->payload,true);
check($report->timeupdated>0 && $totals['first']>=1 && $totals['denominator']>=4 && $totals['onboarded']>=1,'Background report exposes explicit cohort and native evidence counts');
check(!str_contains($report->payload,$users['learner']->username),'Aggregate report stores no learner roster or visit analytics');
$policy=onboarding_policy::get(); $policy['cohortids']=[2147483647]; rejected(fn()=>onboarding_policy::parse(json_encode($policy)),'Eligibility settings reject unknown cohorts');
$policy=onboarding_policy::get(); $policy['automatic']=false;
set_config('onboardingpolicy',json_encode($policy),'local_ignite');
as_user($users['learner']); check(preferences::get_current()->status==='complete','Eligibility changes do not reset completed onboarding');
set_config('onboardingpolicy',onboarding_policy::EMPTY,'local_ignite');
as_user($users['learner']);
$originalcatalog=get_config('local_ignite','catalog'); set_config('catalog',local_ignite\catalog::EMPTY,'local_ignite');
check(local_ignite\recommendations::current()===[] && preferences::get_current()->status==='complete','No recommendations preserves completed onboarding and normal course access');
set_config('catalog',$originalcatalog,'local_ignite');
$CFG->enablebadges=0; set_config('enablebadges',0);
check(badge_state::get_current((int)$badge->id)===null && missions::current($missionid)['next']!==false,'Disabled badges do not block the next learning action');
$CFG->enablebadges=1; set_config('enablebadges',1);
$CFG->enablecompletion=0; set_config('enablecompletion',0);
check(missions::current($missionid)['trackingunavailable'] && !missions::current($missionid)['complete'],'Disabled tracking is unavailable, not a fabricated completion');
$CFG->enablecompletion=1; set_config('enablecompletion',1);
check(local_ignite\dashboard::data()['hearth']['name']==='A renamed draft Hearth','Renamed Hearth identity propagates to the learner dashboard');
as_user(get_admin());
$deleted=add_moduleinfo((object)['modulename'=>'page','module'=>$DB->get_field('modules','id',['name'=>'page']),
    'course'=>$course->id,'section'=>0,'name'=>'Disposable access fixture','intro'=>'','introformat'=>FORMAT_HTML,
    'content'=>'A private access check.','contentformat'=>FORMAT_HTML,'display'=>5,'visible'=>1,
    'printintro'=>0,'printlastmodified'=>0,'completion'=>1],$course);
$temporary=$metadata; $temporary['title']='Temporary access fixture'; $temporary['cmids']=[(int)$deleted->coursemodule];
$temporary['nextcmid']=0; $temporary['badgeid']=0; $deletedmission=missions::save(0,(int)$course->id,$temporary);
course_delete_module($deleted->coursemodule);
as_user($users['learner']); check(missions::current($deletedmission)===null,'A native activity deletion makes its direct mission URL safely unavailable');
// The new report invalidation participates in native privacy erasure without touching native credentials.
as_user($users['privacy']); preferences::save_current(['interests'=>['money'],'status'=>'complete','currentstep'=>'done']);
houses::set_current((int)$hearths[0]->id); invitations::current();
attempt($quiz,1,true);
as_user($users['editor']); confirm_badge((int)$badge->id,(int)$users['privacy']->id);
as_user($users['privacy']); local_ignite\passport::save_featured_current([(int)$badge->id]);
$nativecredentials=$DB->get_records('badge_issued',['userid'=>$USER->id]);
$privacycontext=context_user::instance($USER->id); \core_privacy\local\request\writer::reset();
$approved=new \core_privacy\local\request\approved_contextlist($USER,'local_ignite',[$privacycontext->id]);
local_ignite\privacy\provider::export_user_data($approved);
$zip=\core_privacy\local\request\writer::with_context($privacycontext)->finalise_content();
check(is_file($zip),'Native privacy export still succeeds with missions/reporting installed');
set_config('enabled',0,'local_ignite'); local_ignite\privacy\provider::delete_data_for_user($approved);
check(!$DB->record_exists('local_ignite_prefs',['userid'=>$USER->id]) && !$DB->record_exists('local_ignite_history',['userid'=>$USER->id]) &&
    !$DB->record_exists('local_ignite_feature',['userid'=>$USER->id]) && $DB->get_records('badge_issued',['userid'=>$USER->id])==$nativecredentials,
    'Privacy erasure while disabled removes Ignite personal data and preserves native badge ownership');
check((int)$DB->get_field('local_ignite_report','timeupdated',['id'=>$report->id])===0,'Privacy erasure invalidates aggregate snapshots');
set_config('enabled',1,'local_ignite');
// Restore a passing later activity for the learner, keep journey account untouched for browser verification.
as_user($users['editor']); revise_grade($cm,$course,(int)$users['learner']->id,$gradedata,80);
as_user(get_admin()); advance();
$fixture=['users'=>array_map(fn($u)=>$u->username,$users)+['journeyid'=>$users['journey']->id],
    'courseid'=>(int)$course->id,'cmid'=>(int)$q->coursemodule,'assignmentid'=>(int)$a->coursemodule,
    'missionid'=>$missionid,'laterid'=>$laterid,'badgeid'=>(int)$badge->id,'hearthid'=>(int)$hearths[0]->id];
set_config('integrationfixture',json_encode($fixture),'local_ignite');
echo 'INTEGRATION_FIXTURE='.json_encode($fixture)."\n";
echo "Integrated checks: $checks passed\n";
