<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
/** Aggregate snapshots only. Page requests queue a date range; cron owns all cohort calculation. */
final class reports {
    public static function authorize(): void {
        require_login(); require_capability('local/ignite:viewreport',\context_system::instance());
    }
    public static function dates(string $from,string $to): array {
        $a=\DateTimeImmutable::createFromFormat('!Y-m-d',$from,new \DateTimeZone('UTC'));
        $b=\DateTimeImmutable::createFromFormat('!Y-m-d',$to,new \DateTimeZone('UTC'));
        if (!$a || !$b || $a->format('Y-m-d')!==$from || $b->format('Y-m-d')!==$to || $b<$a || $b->getTimestamp()-$a->getTimestamp()>366*86400) {
            throw new \invalid_parameter_exception('Choose valid inclusive UTC dates, at most 366 days apart');
        }
        return [$a->getTimestamp(),$b->modify('+1 day')->getTimestamp()];
    }
    public static function request(string $from,string $to): \stdClass {
        global $DB;
        self::authorize(); [$start,$end]=self::dates($from,$to);
        return access::locked('report-queue',static function() use ($DB,$start,$end) {
            $row=$DB->get_record('local_ignite_report',['timestart'=>$start,'timeend'=>$end]);
            if (!$row) {
                // Bound stored aggregate ranges; no per-learner tracking rows are created.
                $old=$DB->get_records('local_ignite_report',[],'id');
                while (count($old)>=10) { $item=array_shift($old); $DB->delete_records('local_ignite_report',['id'=>$item->id]); }
                $row=(object)['timestart'=>$start,'timeend'=>$end,'timeupdated'=>0,'payload'=>'{}'];
                $row->id=$DB->insert_record('local_ignite_report',$row);
            }
            return $row;
        });
    }
    public static function invalidate(?\core\event\base $event=null): void {
        global $DB;
        // Do not run during pre-report migrations or a disabled/uninstalled plugin's callbacks.
        if ((int)get_config('local_ignite','version')>=2026110700) {
            $DB->set_field('local_ignite_report','timeupdated',0);
        }
    }
    /** Internal task, no sessions/notifications and no activity evidence writes. */
    public static function refresh(): void {
        global $DB;
        $lock=\core\lock\lock_config::get_lock_factory('local_ignite')->get_lock('report-worker',10);
        if (!$lock) { return; }
        try {
            foreach ($DB->get_records_select('local_ignite_report','timeupdated <= 0 OR timeupdated < ?', [time()-300]) as $row) {
                // Autocommit the marker; never hold a report-row transaction lock while calculating a cohort.
                $DB->set_field('local_ignite_report','timeupdated',-1,['id'=>$row->id]);
                $data=self::calculate((int)$row->timestart,(int)$row->timeend);
                // Any relevant update changes the marker back to zero. Do not publish over that invalidation.
                $DB->execute('UPDATE {local_ignite_report} SET payload=:payload,timeupdated=:updated WHERE id=:id AND timeupdated=-1',
                    ['payload'=>json_encode($data),'updated'=>time(),'id'=>$row->id]);
            }
        } finally { $lock->release(); }
    }
    private static function calculate(int $start,int $end): array {
        global $DB,$CFG;
        require_once($CFG->libdir.'/completionlib.php');
        // Current eligible confirmed accounts, excluding suspended/deleted/staff accounts. Not logins/visits.
        $eligible=[];
        $users=$DB->get_recordset('user',['deleted'=>0,'suspended'=>0,'confirmed'=>1]);
        foreach ($users as $user) {
            if (onboarding_policy::eligible($user)) { $eligible[(int)$user->id]=true; }
        }
        $users->close();
        $data=['denominator'=>count($eligible),'onboarded'=>0,'first'=>0,'subsequent'=>0,'badges'=>0,'badgeowners'=>0,
            'memberships'=>[],'challenges'=>[],'completionenabled'=>!empty($CFG->enablecompletion)];
        if (!$eligible) { return $data; }
        [$insql,$params]=$DB->get_in_or_equal(array_keys($eligible),SQL_PARAMS_NAMED,'owner');
        $data['onboarded']=$DB->count_records_select('local_ignite_prefs','userid '.$insql.' AND status = :state',$params+['state'=>'complete']);
        foreach ($DB->get_records_sql('SELECT m.houseid, COUNT(1) AS members FROM {local_ignite_member} m
                WHERE m.userid '.$insql.' GROUP BY m.houseid',$params) as $row) {
            $house=$DB->get_record('local_ignite_house',['id'=>$row->houseid]);
            $data['memberships'][]=['name'=>$house ? $house->name : 'Unavailable Hearth','count'=>(int)$row->members];
        }
        $badgeparams=$params+['start'=>$start,'end'=>$end];
        $issued=$DB->get_record_sql('SELECT COUNT(1) AS awards, COUNT(DISTINCT userid) AS owners FROM {badge_issued}
            WHERE userid '.$insql.' AND dateissued >= :start AND dateissued < :end',$badgeparams);
        $data['badges']=(int)$issued->awards; $data['badgeowners']=(int)$issued->owners;
        $starterconfig=[];
        foreach (onboarding_config::get()['starters'] as $starter) { $starterconfig[$starter['cmid']]=$starter['requirepass']; }
        $starters=array_keys($starterconfig);
        $first=[]; $later=[];
        foreach ($DB->get_records('local_ignite_mission',['active'=>1]) as $mission) {
            $ids=json_decode($mission->cmids,true); $isfirst=(bool)array_intersect($ids,$starters);
            $course=$DB->get_record('course',['id'=>$mission->courseid]);
            if (!$course || empty($CFG->enablecompletion) || !$course->enablecompletion) { continue; }
            $cms=$DB->get_records_list('course_modules','id',$ids);
            if (count($cms)!==count($ids)) { continue; }
            [$cmsql,$cmparams]=$DB->get_in_or_equal($ids,SQL_PARAMS_NAMED,'cm');
            $rows=$DB->get_records_sql('SELECT cc.id,cc.userid,cc.coursemoduleid,cc.completionstate,cc.timemodified
                FROM {course_modules_completion} cc WHERE cc.userid '.$insql.' AND cc.coursemoduleid '.$cmsql,$params+$cmparams);
            $byuser=[];
            foreach ($rows as $row) { $byuser[$row->userid][$row->coursemoduleid]=$row; }
            foreach ($byuser as $userid=>$evidence) {
                if (count($evidence)!==count($ids) || !is_enrolled(\context_course::instance($course->id),$userid,'',true) ||
                        !can_access_course($course,$userid,'',true)) { continue; }
                $valid=true; $when=0;
                foreach ($ids as $cmid) {
                    $cm=get_fast_modinfo($course,$userid)->get_cms()[$cmid] ?? null;
                    $valid=$valid && $cm && $cm->uservisible && $cm->available &&
                        activity_evidence::valid($cm,$course,(int)$evidence[$cmid]->completionstate,(int)$userid,$starterconfig[$cmid] ?? false);
                    $when=max($when,(int)$evidence[$cmid]->timemodified);
                }
                if ($valid && $when >= $start && $when < $end) {
                    if ($isfirst) { $first[$userid]=$when; } else { $later[$userid][]= $when; }
                }
            }
        }
        $data['first']=count($first);
        foreach ($later as $userid=>$times) { if (isset($first[$userid]) && max($times)>=$first[$userid]) { $data['subsequent']++; } }
        foreach ($DB->get_records_select('local_ignite_challenge','timestart < ? AND timeend > ?',[$end,$start]) as $challenge) {
            foreach ($DB->get_records('local_ignite_total',['challengeid'=>$challenge->id]) as $total) {
                $house=$DB->get_record('local_ignite_house',['id'=>$total->houseid]);
                $data['challenges'][]=['name'=>$challenge->name,'hearth'=>$house ? $house->name : 'Unavailable Hearth',
                    'count'=>(int)$total->milestones,'target'=>(int)$challenge->target];
            }
        }
        return $data;
    }
}
