<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
/** Administrator-only configuration health. Does not mutate course settings or learner evidence. */
final class setup_review {
    public static function messages(): array {
        global $CFG,$DB;
        access::administrator(); $messages=[];
        if (empty($CFG->enablecompletion)) { $messages[]='Completion tracking is disabled at site level. Native completions, starter eligibility and personal stages cannot be calculated.'; }
        if (empty($CFG->enablebadges)) { $messages[]='Moodle badges are disabled. Learning and Hearth selection remain available; no badge confirmation will be shown.'; }
        if (!onboarding_config::get()['starters']) { $messages[]='No starter activity is configured. Map an automatically completed, substantive native activity in the onboarding configuration, then wrap that same course-module ID in a mission.'; }
        if (access::enabled('houses') && !onboarding_config::selection_url()) { $messages[]='Hearth invitations need an active Hearth and the installed /local/ignite/choosehearth.php selection route.'; }
        foreach (onboarding_config::get()['starters'] as $starter) {
            $cm=$DB->get_record('course_modules',['id'=>$starter['cmid'],'deletioninprogress'=>0]);
            $course=$cm ? $DB->get_record('course',['id'=>$cm->course]) : false;
            if (!$cm || !$course || !$course->visible || !$cm->visible || !$course->enablecompletion) {
                $messages[]='Starter course-module '.$starter['cmid'].' is deleted, hidden or has disabled course completion.'; continue;
            }
            if (!recommendations::substantive_starter(get_fast_modinfo($course)->get_cm($cm->id))) {
                $messages[]='Starter '.$cm->id.' needs substantive automatic completion; a view or manual tick is insufficient.';
            }
            if (!missions::for_activity((int)$cm->id)) { $messages[]='Starter '.$cm->id.' has no enabled mission presentation. Native learning still works.'; }
        }
        foreach ($DB->get_records('local_ignite_mission',['active'=>1]) as $mission) {
            $course=$DB->get_record('course',['id'=>$mission->courseid]);
            if (!$course || !$course->enablecompletion) { $messages[]='Mission '.$mission->id.' has missing or disabled course completion. Normal native navigation is preserved.'; }
            foreach (json_decode($mission->cmids,true) as $id) {
                $cm=$DB->get_record('course_modules',['id'=>$id,'deletioninprogress'=>0]);
                if (!$cm || (int)$cm->course!==(int)$mission->courseid || !$cm->visible) { $messages[]='Mission '.$mission->id.' references an unavailable activity '.$id.'. Deactivate it or restore native access; evidence is not deleted.'; }
            }
        }
        foreach (passport_catalog::get() as $id=>$mapping) {
            if (!$DB->record_exists('badge',['id'=>$id])) { $messages[]='Passport mapping '.$id.' references a deleted badge.'; continue; }
            $badge=new \core_badges\badge($id);
            if (!$badge->is_active()) { $messages[]='Badge '.$id.' is disabled. Enable it through native badge management after reviewing its criteria; existing ownership is preserved.'; }
            if (!$badge || count($badge->criteria)<2) { $messages[]='Badge '.$id.' has no configured native award criteria. Configure and enable it in Moodle; mission metadata never awards a badge.'; }
        }
        $messages[]='Availability is learner-specific. Date, group, prerequisite and assessment access rules are checked at each learner request. Use the native activity restriction/feedback screens for exact requirements.';
        $messages[]='Run Moodle cron every minute. Hearth reconciliation runs every minute; requested aggregate reports refresh every five minutes. Native completion and badge issuance may be delayed until their tasks run.';
        return $messages;
    }
}
