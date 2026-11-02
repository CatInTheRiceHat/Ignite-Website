<?php
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
/** Own entry policy, also used by the background report. It never resets stored walkthrough state. */
final class onboarding_policy {
    public const EMPTY = '{"automatic":true,"requireenrolment":false,"cohortids":[],"goals":{"make":"Make something useful","solve":"Solve a practical problem","explore":"Explore something new"}}';
    public static function get(): array { return self::parse(get_config('local_ignite', 'onboardingpolicy') ?: self::EMPTY, false); }
    public static function parse(string $json, bool $references = true): array {
        global $DB;
        $data = json_decode($json, true);
        if (strlen($json) > 30000 || !is_array($data) || array_diff(array_keys($data), ['automatic','requireenrolment','cohortids','goals']) ||
                !isset($data['automatic'],$data['requireenrolment'],$data['cohortids'],$data['goals']) ||
                !is_bool($data['automatic']) || !is_bool($data['requireenrolment']) || !is_array($data['cohortids']) ||
                !array_is_list($data['cohortids']) || count($data['cohortids']) > 50 || !is_array($data['goals']) || count($data['goals']) > 20) {
            throw new \invalid_parameter_exception('Use automatic/requireenrolment booleans, cohortids list and goals object');
        }
        foreach ($data['cohortids'] as $id) {
            if (!is_int($id) || $id < 1 || ($references && !$DB->record_exists('cohort', ['id'=>$id]))) {
                throw new \invalid_parameter_exception('Unknown cohort ID');
            }
        }
        foreach ($data['goals'] as $key=>$label) {
            if (!preg_match('/^[a-z][a-z0-9_-]{0,63}$/D', (string)$key) || !is_string($label) || trim($label)==='' ||
                    \core_text::strlen($label)>100 || clean_param($label, PARAM_TEXT)!==$label) {
                throw new \invalid_parameter_exception('Use stable goal keys and plain text labels');
            }
        }
        return $data;
    }
    /** Internal eligibility only, never an endpoint accepting another learner ID. */
    public static function eligible(\stdClass $user): bool {
        global $DB;
        if ($user->deleted || $user->suspended || !$user->confirmed || isguestuser($user) || is_siteadmin($user->id) ||
                !has_capability('local/ignite:use', \context_system::instance(), $user->id)) { return false; }
        foreach (['moodle/course:update','moodle/course:create','moodle/grade:edit','moodle/site:config','mod/assign:grade','mod/quiz:grade'] as $capability) {
            if (has_capability($capability, \context_system::instance(), $user->id)) { return false; }
            [$categories,$courses] = get_user_capability_contexts($capability, true, $user->id, true, '', '', '', '', 1);
            if ($categories || $courses) { return false; }
        }
        $policy = self::get();
        if ($policy['cohortids'] && !$DB->record_exists_select('cohort_members',
                'userid = ? AND cohortid IN (' . implode(',', array_map('intval', $policy['cohortids'])) . ')', [$user->id])) { return false; }
        if ($policy['requireenrolment']) {
            $courses = enrol_get_users_courses($user->id, true, 'id');
            if (!$courses) { return false; }
        }
        return true;
    }
    public static function interest_options(): array {
        $options = [];
        foreach (catalog::get()['interests'] as $key=>$entry) { $options[$key] = $entry['name']; }
        if (!$options) {
            foreach (onboarding::INTERESTS as $key) { $options[$key] = get_string('interest_'.$key, 'local_ignite'); }
        }
        $options['unsure'] = $options['unsure'] ?? get_string('interest_unsure','local_ignite');
        return $options;
    }
}
