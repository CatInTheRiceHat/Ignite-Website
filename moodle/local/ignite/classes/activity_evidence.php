<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
/** Shared read of native completion and gradebook evidence, including Prompt 2's starter pass contract. */
final class activity_evidence {
    public static function valid($cm,\stdClass $course,int $state,int $userid,bool $requirepass=false): bool {
        global $CFG;
        require_once($CFG->libdir.'/gradelib.php');
        if (!milestone_eligibility::qualifies($cm,$course,$state,'complete')) { return false; }
        $pass=$requirepass || !empty($cm->completionpassgrade);
        if ($pass || $cm->completiongradeitemnumber!==null) {
            $item=\grade_item::fetch(['courseid'=>$cm->course,'itemtype'=>'mod','itemmodule'=>$cm->modname,
                'iteminstance'=>$cm->instance,'itemnumber'=>$cm->completiongradeitemnumber ?? 0]);
            $grades=$item ? \grade_grade::fetch_users_grades($item,[$userid],false) : [];
            $grade=$grades ? reset($grades) : null;
            if (!$grade || $grade->finalgrade===null || $item->needsupdate ||
                    ($pass && ($item->gradepass<=0 || $grade->finalgrade<$item->gradepass))) { return false; }
        }
        return true;
    }
}
