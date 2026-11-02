<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

/** Optional fictional personal labels. Never a Hearth identity, ranking, badge, or mastery claim. */
final class heat_stages {
    public const NAMES = ['Spark', 'Ember', 'Flame', 'Blaze', 'Bluefire'];
    public const EMPTY = '{"thresholds":[0,1,3,6,10],"milestones":{}}';

    public static function parse(string $json, bool $references = true): array {
        global $DB;
        $data = json_decode($json, true);
        if (strlen($json) > 100000 || !is_array($data) ||
                array_diff(array_keys($data), ['thresholds', 'milestones', 'labels']) ||
                !isset($data['thresholds'], $data['milestones']) || !is_array($data['milestones']) ||
                !is_array($data['thresholds']) || !array_is_list($data['thresholds']) ||
                count($data['thresholds']) !== 5 || $data['thresholds'][0] !== 0 || count($data['milestones']) > 200) {
            throw new \invalid_parameter_exception('Invalid personal heat stage configuration');
        }
        $data['labels'] = $data['labels'] ?? self::NAMES;
        if (!is_array($data['labels']) || !array_is_list($data['labels']) || count($data['labels'])!==5) { throw new \invalid_parameter_exception('Choose five distinct stage labels'); }
        foreach ($data['labels'] as $label) {
            if (!is_string($label) || trim($label)==='' || \core_text::strlen($label)>50 || clean_param($label,PARAM_TEXT)!==$label) {
                throw new \invalid_parameter_exception('Use short plain text stage labels');
            }
        }
        if (count(array_unique($data['labels']))!==5) { throw new \invalid_parameter_exception('Choose distinct stage labels'); }
        $previous = -1;
        foreach ($data['thresholds'] as $threshold) {
            if (!is_int($threshold) || $threshold <= $previous || $threshold > 1000000) {
                throw new \invalid_parameter_exception('Thresholds must increase from zero');
            }
            $previous = $threshold;
        }
        foreach ($data['milestones'] as $id => $condition) {
            if (!preg_match('/^[1-9][0-9]*$/D', (string)$id) || !in_array($condition, ['complete', 'pass'], true)) {
                throw new \invalid_parameter_exception('Use course-module IDs and complete/pass conditions');
            }
            if ($references) {
                $cm = $DB->get_record('course_modules', ['id' => (int)$id], '*', MUST_EXIST);
                if (!milestone_eligibility::configured($cm, get_course($cm->course), $condition)) {
                    throw new \invalid_parameter_exception('Configure valid native completion first');
                }
            }
        }
        return $data;
    }

    public static function current(): array {
        global $CFG;
        $userid = access::learner('levels');
        $config = self::parse(get_config('local_ignite', 'heatconfig') ?: self::EMPTY, false);
        $data = ['available' => false, 'requirements' => []];
        if (empty($CFG->enablecompletion) || !$config['milestones']) { return $data; }
        require_once($CFG->libdir . '/completionlib.php');
        $courses = array_filter(learner_read_model::courses(), [learner_read_model::class, 'course_available']);
        $evidence = learner_read_model::evidence(array_keys($courses));
        $count = $eligible = 0;
        foreach ($courses as $course) {
            $completion = new \completion_info($course);
            if (!$completion->is_tracked_user($userid)) { continue; }
            foreach (get_fast_modinfo($course)->get_cms() as $cm) {
                $condition = $config['milestones'][$cm->id] ?? null;
                if (!$condition || !milestone_eligibility::configured($cm, $course, $condition)) { continue; }
                $eligible++;
                $state = (int)($evidence[$cm->id]->completionstate ?? 0);
                // Distinct configured cmid keys and one native row per owner/activity prevent repeat credit.
                $qualified = milestone_eligibility::qualifies($cm, $course, $state, $condition);
                $count += (int)$qualified;
                // Counts can include a currently locked historical completion; names still require access.
                if ($cm->uservisible && $cm->available && !$cm->deletioninprogress) {
                    $data['requirements'][] = ['name' => dashboard::plain($cm->name),
                        'condition' => get_string('dash_condition_' . $condition, 'local_ignite'),
                        'status' => get_string($qualified ? 'dash_counted' : 'dash_notcounted', 'local_ignite')];
                }
            }
        }
        if (!$eligible) { return $data; }
        $index = 0;
        foreach ($config['thresholds'] as $i => $threshold) { if ($count >= $threshold) { $index = $i; } }
        $data += ['count' => $count, 'counttext' => get_string('dash_heatcount', 'local_ignite', $count), 'stage' => $config['labels'][$index], 'next' => false];
        $data['available'] = true;
        if ($index < 4) {
            $data['next'] = get_string('dash_heatnext', 'local_ignite', (object)[
                'stage' => $config['labels'][$index + 1], 'total' => $config['thresholds'][$index + 1],
                'remaining' => $config['thresholds'][$index + 1] - $count]);
        }
        return $data;
    }
}
