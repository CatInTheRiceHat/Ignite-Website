<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();

final class onboarding {
    public const INTERESTS = ['technology', 'money', 'entrepreneurship', 'creative', 'career', 'unsure'];
    public const GOALS = ['make', 'solve', 'explore'];

    public static function steps(): array {
        $steps = ['welcome', 'interests', 'goal', 'path'];
        if (get_config('local_ignite', 'hearthtiming') === 'initial' && invitations::can_offer() &&
                in_array(invitations::current()->state, ['eligible', 'shown'], true)) {
            $steps[] = 'hearth';
        }
        $steps[] = 'finish';
        return $steps;
    }

    public static function step(): string {
        $prefs = preferences::get_current();
        if (empty($prefs->id)) {
            return 'welcome';
        }
        $step = $prefs->currentstep;
        // Preserve legacy progress and completion; do not repurpose old membership fields.
        if (in_array($step, ['house', 'challenge', 'done'], true)) {
            return 'finish';
        }
        return in_array($step, self::steps(), true) ? $step : 'finish';
    }

    /** Every transition is server validated and persisted using the foundation's user lock. */
    public static function save(string $action, string $step, array $data = [], bool $edit = false): ?\moodle_url {
        global $DB;
        $userid = access::learner('onboarding');
        require_sesskey();
        if (!in_array($action, ['next', 'back', 'skip', 'start', 'home', 'saveinterests', 'visit'], true) ||
                array_diff(array_keys($data), ['interests', 'goals', 'targetkey']) ||
                ($edit ? $step !== 'interests' : $step !== self::step())) {
            throw new \invalid_parameter_exception('Invalid walkthrough transition');
        }
        if ($edit && !in_array($action, ['saveinterests', 'skip'], true)) {
            throw new \invalid_parameter_exception('Invalid interest edit');
        }
        if (!$edit && in_array($action, ['start', 'home'], true) && $step !== 'finish') {
            throw new \invalid_parameter_exception('Finish the walkthrough first');
        }
        if ($action === 'visit') {
            if ($step !== 'hearth' || !invitations::can_offer()) {
                throw new \invalid_parameter_exception('Hearth invitation unavailable');
            }
            $url = onboarding_config::selection_url();
            $url->param('returnurl', (new \moodle_url('/local/ignite/onboarding.php'))->out(false));
            invitations::shown();
            return $url;
        }
        $changes = [];
        if (in_array($action, ['next', 'saveinterests'], true) && $step === 'interests') {
            $interests = $data['interests'] ?? [];
            if (!is_array($interests) || !array_is_list($interests) || count($interests) > 3 ||
                    count(array_filter($interests, 'is_string')) !== count($interests) ||
                    array_diff($interests, array_keys(onboarding_policy::interest_options())) || count(array_unique($interests)) !== count($interests) ||
                    (in_array('unsure', $interests, true) && count($interests) > 1)) {
                throw new \invalid_parameter_exception('Choose up to three interests, or unsure on its own');
            }
            $changes['interests'] = json_encode($interests);
        }
        if ($action === 'next' && $step === 'goal') {
            $goal = $data['goals'] ?? '';
            if (!is_string($goal) || ($goal !== '' && !array_key_exists($goal, onboarding_policy::get()['goals']))) {
                throw new \invalid_parameter_exception('Invalid goal');
            }
            $changes['goals'] = $goal ?: null;
        }
        if ($action === 'next' && $step === 'path') {
            $key = $data['targetkey'] ?? '';
            $keys = array_column(recommendations::current(), 'key');
            if (!is_string($key) || ($key !== '' && !in_array($key, $keys, true))) {
                throw new \invalid_parameter_exception('Recommendation is no longer eligible');
            }
            $changes['targetkey'] = $key ?: null;
        }
        $steps = self::steps();
        if ($step === 'hearth' && $action === 'next') {
            invitations::defer();
        }
        // Recheck the destination before committing Finish; no course mutation occurs here.
        $destination = new \moodle_url('/local/ignite/index.php');
        if ($action === 'start') {
            $starter = recommendations::starter_target();
            if ($starter) {
                $destination = new \moodle_url(missions::url((int)$starter['cm']->id, $starter['url']));
            } else {
                $prefs = preferences::get_current();
                $target = !empty($prefs->targetkey) ? recommendations::target($prefs->targetkey) : null;
                $destination = $target ? new \moodle_url($target['url']) : new \moodle_url('/course/index.php');
            }
        }
        access::locked('user:' . $userid, static function() use ($DB, $userid, $changes, $action, $step, $steps, $edit) {
            $record = $DB->get_record('local_ignite_prefs', ['userid' => $userid]);
            if (!$record) {
                $record = (object)['userid' => $userid, 'interests' => '[]', 'goals' => null,
                    'pathid' => null, 'targetkey' => null, 'status' => 'notstarted', 'currentstep' => 'welcome',
                    'timecreated' => time()];
            }
            if (!$edit) {
                $actualstep = in_array($record->currentstep, ['house', 'challenge', 'done'], true) ?
                    'finish' : $record->currentstep;
                $actualstep = in_array($actualstep, $steps, true) ? $actualstep : 'finish';
                if ($actualstep !== $step) {
                    throw new \invalid_parameter_exception('The walkthrough changed in another session. Reload to resume.');
                }
            }
            foreach ($changes as $field => $value) {
                $record->$field = $value;
            }
            if (!$edit) {
                // Completed learners may review, but their completed status must never be reset.
                if ($record->status !== 'complete') {
                    $record->status = $action === 'skip' ? 'dismissed' :
                        (in_array($action, ['start', 'home'], true) ? 'complete' : 'inprogress');
                    if ($record->status === 'complete') {
                        $record->currentstep = 'done';
                    } else if ($action !== 'skip') {
                        $index = array_search($step, $steps, true);
                        $record->currentstep = $steps[max(0, min(count($steps) - 1,
                            $index + ($action === 'back' ? -1 : 1)))];
                    }
                }
            }
            $record->timemodified = time();
            if (empty($record->id)) {
                $DB->insert_record('local_ignite_prefs', $record);
            } else {
                $DB->update_record('local_ignite_prefs', $record);
            }
            reports::invalidate();
        });
        return $edit || in_array($action, ['skip', 'start', 'home'], true) ? $destination : null;
    }

    /** Used only after native require_login completes all account/policy/profile checks. */
    public static function should_enter(string $path, bool $preventredirect = false, $cm = null): bool {
        global $USER, $SESSION;
        if ($preventredirect || $cm || (defined('CLI_SCRIPT') && CLI_SCRIPT) ||
                (defined('AJAX_SCRIPT') && AJAX_SCRIPT) || (defined('WS_SERVER') && WS_SERVER) ||
                !isloggedin() || isguestuser() || !access::enabled('onboarding') || !onboarding_policy::get()['automatic'] ||
                !onboarding_policy::eligible($USER) ||
                !has_capability('local/ignite:use', \context_system::instance()) || is_siteadmin() ||
                \core\session\manager::is_loggedinas() || !empty($USER->access['rsw']) ||
                empty($USER->confirmed) || !empty($SESSION->wantsurl) ||
                !in_array($path, ['/my/index.php', '/my/courses.php'], true)) {
            return false;
        }
        return in_array(preferences::get_current()->status, ['notstarted', 'inprogress'], true);
    }
}
