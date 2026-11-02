<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Assemble one learner read model for the native dashboard block and optional Ignite home. */
final class dashboard {
    public static function plain(string $value): string {
        return content_to_text(format_string($value), false);
    }

    public static function data(): array {
        global $CFG, $USER, $OUTPUT, $DB;
        access::learner('dashboard');
        require_once($CFG->libdir . '/completionlib.php');
        $prefs = preferences::get_current();
        $courses = array_filter(learner_read_model::courses(), [learner_read_model::class, 'course_available']);
        $chosenid = 0;
        if (preg_match('/^(course|activity):([1-9][0-9]*)$/D', $prefs->targetkey ?? '', $match)) {
            $chosenid = $match[1] === 'course' ? (int)$match[2] : (int)$DB->get_field('course_modules',
                'course', ['id' => (int)$match[2], 'deletioninprogress' => 0]);
        }
        $course = $courses[$chosenid] ?? ($courses ? reset($courses) : null);
        $data = ['welcome' => get_string('dash_welcome', 'local_ignite', self::plain($USER->firstname)),
            'solurl' => $OUTPUT->image_url('sol', 'local_ignite')->out(false),
            'catalogurl' => (new \moodle_url('/course/index.php'))->out(false),
            'nativeurl' => (new \moodle_url(!empty($CFG->enabledashboard) ? '/my/' : '/my/courses.php'))->out(false),
            'passporturl' => (new \moodle_url('/local/ignite/passport.php'))->out(false),
            'hearthurl' => (new \moodle_url('/local/ignite/hearth.php'))->out(false),
            'chooseurl' => (new \moodle_url('/local/ignite/choosehearth.php', ['returnurl' => '/local/ignite/index.php']))->out(false),
            'invitationurl' => (new \moodle_url('/local/ignite/invitation.php'))->out(false),
            'toururl' => (new \moodle_url('/local/ignite/tour.php'))->out(false),
            'interestsurl' => (new \moodle_url('/local/ignite/onboarding.php', ['edit' => 1]))->out(false),
            'onboardingurl' => (new \moodle_url('/local/ignite/onboarding.php'))->out(false),
            'onboarding' => access::enabled('onboarding'),
            'resumeonboarding' => access::enabled('onboarding') && onboarding_policy::eligible($USER) && in_array($prefs->status, ['notstarted', 'inprogress', 'dismissed']),
            'hearthsenabled' => access::enabled('houses'), 'passportenabled' => access::enabled('passport'),
            'course' => false, 'primary' => false, 'recommendations' => [], 'hearth' => false,
            'heat' => false, 'offer' => false, 'deferred' => false,
            'selectionunavailable' => !empty($prefs->targetkey) && !isset($courses[$chosenid]),
        ];
        if ($course) {
            $evidence = learner_read_model::evidence(array_keys($courses));
            $data['course'] = self::course($course, $evidence);
            $data['primary'] = $data['course']['next'];
        }
        if ($data['onboarding']) {
            foreach (recommendations::current(true) as $target) {
                if ($course && (int)$target['course']->id === (int)$course->id) { continue; }
                $target['name'] = self::plain($target['course']->fullname);
                // Enrolled course recommendations also use their real ordered activity, never a fake start URL.
                if (isset($courses[$target['course']->id])) {
                    $projection = self::course($courses[$target['course']->id],
                        learner_read_model::evidence(array_keys($courses)));
                    if ($projection['complete']) { continue; }
                    if (!$data['primary'] && (!$course || $data['course']['complete'])) {
                        $data['primary'] = $projection['next'];
                    }
                } else if (!$data['primary'] && (!$course || $data['course']['complete'])) {
                    $data['primary'] = ['url' => $target['url'], 'name' => $target['name'], 'enrol' => true];
                }
                $data['recommendations'][] = $target;
            }
        }
        $data['hasrecommendations'] = (bool)$data['recommendations'];
        if ($data['hearthsenabled']) {
            if ($hearth = houses::get_current()) {
                $data['hearth'] = hearth_ui::identity($hearth);
                if ($challenge = challenges::current()) {
                    $progress = challenges::progress((int)$challenge->id, (int)$hearth->id);
                    $data['hearth']['challenge'] = ['name' => $challenge->name, 'description' => $challenge->description,
                        'available'=>$progress['available'], 'progress' => get_string('hearthprogress', 'local_ignite', (object)[
                            'count' => $progress['total'], 'target' => $challenge->target]),
                        'own' => get_string('owncontribution', 'local_ignite', $progress['own']),
                        'value' => min($progress['total'], $challenge->target), 'target' => $challenge->target,
                        'asof' => $progress['updated'] ? userdate($progress['updated']) : ''];
                }
            } else if ($data['onboarding']) {
                $invitation = invitations::current();
                $data['deferred'] = $invitation->state === 'deferred';
                $data['offer'] = $invitation->state === 'eligible' && invitations::can_offer();
            }
        }
        if ($data['passportenabled']) {
            $data['passport'] = passport::dashboard_current($course ? (int)$course->id : null);
        }
        if (access::enabled('levels')) { $data['heat'] = heat_stages::current(); }
        return $data;
    }

    /** Native progress denominator and completion states; sequence is the course's section/activity order. */
    public static function course(\stdClass $course, array $evidence): array {
        global $USER, $CFG;
        access::learner();
        if (!learner_read_model::course_available($course)) {
            throw new \invalid_parameter_exception('Course unavailable');
        }
        require_once($CFG->libdir . '/completionlib.php');
        $completion = new \completion_info($course);
        $tracked = $completion->is_enabled() && $completion->is_tracked_user($USER->id);
        $modules = $tracked ? $completion->get_user_activities_with_completion($USER->id) : [];
        $done = 0;
        foreach (array_keys($modules) as $id) {
            // Match native count_modules_completed(), including its cm.visible filter.
            $done += (int)(!empty($evidence[$id]->visible) &&
                milestone_eligibility::state_matches((int)$evidence[$id]->completionstate, 'complete'));
        }
        $complete = $tracked && $completion->is_course_complete($USER->id);
        $known = $tracked && ($modules || $complete);
        $data = ['id' => (int)$course->id, 'name' => self::plain($course->fullname),
            'url' => (new \moodle_url('/course/view.php', ['id' => $course->id]))->out(false),
            'known' => (bool)$known, 'complete' => (bool)$complete, 'next' => false,
            'note' => get_string($completion->is_enabled() ? ($tracked ? 'dash_norules' : 'dash_untracked') :
                'dash_trackingoff', 'local_ignite')];
        if ($known) {
            $data['done'] = $done;
            $data['total'] = count($modules);
            $data['percent'] = $complete ? 100 : (int)round(100 * $done / count($modules));
            $data['counttext'] = get_string('dash_count', 'local_ignite', (object)[
                'done' => $done, 'total' => count($modules), 'percent' => $data['percent']]);
            $data['note'] = get_string($complete ? 'dash_coursecomplete' :
                ($done === count($modules) ? 'dash_awaitcourse' : 'dash_activityprogress'), 'local_ignite');
        }
        if ($complete) { $data['next']=missions::next_for_course($course); return $data; }
        // A teaching session has no learner next-action claim, even if it can bypass restrictions.
        if ($completion->is_enabled() && !$tracked) { return $data; }
        foreach (get_fast_modinfo($course)->get_cms() as $cm) {
            if ($cm->deletioninprogress || !$cm->is_visible_on_course_page()) { continue; }
            if ($cm->completion && milestone_eligibility::state_matches(
                    (int)($evidence[$cm->id]->completionstate ?? 0), 'complete')) { continue; }
            // With tracking, the next incomplete completion activity anchors the course sequence.
            if ($tracked && $modules && !isset($modules[$cm->id])) { continue; }
            if (!$cm->uservisible || !$cm->available) {
                $data['note'] = get_string('dash_nextunavailable', 'local_ignite');
                return $data;
            }
            if (!$cm->url) { continue; }
            $capability = 'mod/' . $cm->modname . ':view';
            if (get_capability_info($capability, false) && !has_capability($capability, $cm->context)) {
                $data['note'] = get_string('dash_nextunavailable', 'local_ignite');
                return $data;
            }
            $data['next'] = ['url' => missions::url((int)$cm->id, $cm->url->out(false)), 'name' => self::plain($cm->name), 'cmid' => (int)$cm->id];
            return $data;
        }
        if (!$known) { return $data; }
        if ($done !== count($modules)) { $data['note'] = get_string('dash_nextunavailable', 'local_ignite'); }
        return $data;
    }
}
