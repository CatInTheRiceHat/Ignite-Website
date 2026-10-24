<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite_staffimports;

defined('MOODLE_INTERNAL') || die();

/** Apply a staff-only default after Moodle finishes explicit CSV assignments. */
final class import_defaults {
    /** @var array<int, int> Imported user ID => uploader ID, for this request only. */
    private static array $pending = [];
    /** @var array<string, bool> Unambiguous CSV usernames eligible for the default. */
    private static array $eligible = [];
    private static ?int $importid = null;
    private static bool $registered = false;

    public static function observe(\core\event\user_created $event): void {
        global $SCRIPT, $USER, $CFG, $DB;

        // A manual account, login, profile edit, or public registration is not a staff upload.
        if ($SCRIPT !== '/admin/tool/uploaduser/index.php' ||
                !get_config('local_ignite_staffimports', 'enabled') ||
                (int)$event->userid !== (int)($USER->id ?? 0)) {
            return;
        }
        $role = self::target_role();
        if (!$role || !self::can_assign((int)$role->id)) {
            return;
        }
        $iid = optional_param('iid', 0, PARAM_INT);
        if (!$iid) {
            return;
        }
        if (self::$importid !== $iid) {
            self::$importid = $iid;
            self::$eligible = self::read_candidates($iid);
        }
        $user = $DB->get_record('user', ['id' => $event->relateduserid], 'id,username');
        if (!$user || (self::$eligible[$user->username] ?? false) !== true) {
            return;
        }
        self::$pending[(int)$user->id] = (int)$USER->id;
        if (!self::$registered) {
            // The native user event runs BEFORE sysrole/course/cohort fields are processed.
            // Waiting until request shutdown lets those explicit assignments take precedence.
            \core_shutdown_manager::register_function([self::class, 'finish_import']);
            self::$registered = true;
        }
    }

    /** Called after the native importer has finished assigning roles and enrolments. */
    public static function finish_import(): void {
        global $DB, $USER, $CFG;

        $pending = self::$pending;
        self::$pending = [];
        self::$importid = null;
        self::$eligible = [];
        if (!$pending || !get_config('local_ignite_staffimports', 'enabled')) {
            return;
        }
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            return;
        }
        $role = self::target_role();
        if (!$role || !self::can_assign((int)$role->id)) {
            return;
        }
        foreach ($pending as $userid => $uploaderid) {
            if ((int)($USER->id ?? 0) !== $uploaderid) {
                continue;
            }
            $user = $DB->get_record('user', ['id' => $userid],
                'id,username,deleted,suspended,auth,mnethostid');
            if (!$user || $user->deleted || $user->suspended || is_siteadmin($userid) ||
                    $user->username === 'guest' || (int)$user->mnethostid !== (int)$CFG->mnet_localhost_id ||
                    !in_array($user->auth, ['manual', 'email'], true) ||
                    $DB->record_exists('role_assignments', ['userid' => $userid])) {
                continue;
            }
            try {
                role_assign((int)$role->id, $userid, \context_system::instance()->id);
            } catch (\Throwable $error) {
                // Do not expose profile data or disrupt a completed upload response.
                error_log('Ignite staff imports: default role assignment failed; review the import.');
            }
        }
    }

    /** Refuse to turn a staff-import default into unrestricted course or site administration. */
    private static function target_role(): ?\stdClass {
        global $DB, $CFG;

        $role = $DB->get_record('role', ['shortname' => 'ignite_course_developer']);
        if (!$role || $role->archetype !== 'coursecreator' ||
                !in_array(CONTEXT_SYSTEM, get_role_contextlevels($role->id))) {
            return null;
        }
        $access = get_empty_accessdata();
        $sys = \context_system::instance();
        $access['ra'][$sys->path] = [(int)$role->id => (int)$role->id,
            (int)$CFG->defaultuserroleid => (int)$CFG->defaultuserroleid];
        if (!has_capability_in_accessdata('moodle/course:create', $sys, $access)) {
            return null;
        }
        foreach (['moodle/course:update', 'moodle/course:manageactivities',
                'moodle/site:config', 'moodle/user:create'] as $capability) {
            if (has_capability_in_accessdata($capability, $sys, $access)) {
                return null;
            }
        }
        return $role;
    }

    private static function can_assign(int $roleid): bool {
        $context = \context_system::instance();
        return has_capability('moodle/site:uploadusers', $context) && user_can_assign($context, $roleid);
    }

    /** Read the current uploader's CSV without changing the native reader or its cursor. */
    private static function read_candidates(int $iid): array {
        global $CFG;
        require_once($CFG->libdir . '/csvlib.class.php');

        $reader = new \csv_import_reader($iid, 'uploaduser');
        $columns = $reader->get_columns();
        if (!$columns || !in_array('username', $columns, true) || !$reader->init()) {
            return [];
        }
        $eligible = [];
        try {
            while (($line = $reader->next()) !== false) {
                if (count($line) !== count($columns)) {
                    continue;
                }
                $row = array_combine($columns, $line);
                $username = trim($row['username']);
                if ($username === '') {
                    continue;
                }
                $allowed = true;
                foreach ($row as $column => $value) {
                    // Explicit roles, removals, learner enrolments and cohort sync always win.
                    if (preg_match('/^(?:(?:sysrole|role|type|course|categoryrole|category|cohort|group)\d+'
                            . '|oldusername)$/', $column) && trim($value) !== '') {
                        $allowed = false;
                    }
                }
                if (!empty($row['deleted']) || !empty($row['suspended'])) {
                    $allowed = false;
                }
                $names = array_unique([$username, \core_user::clean_field($username, 'username')]);
                foreach ($names as $name) {
                    // Ambiguous/duplicate usernames must never receive a guessed staff role.
                    $eligible[$name] = array_key_exists($name, $eligible) ? false : $allowed;
                }
            }
        } finally {
            $reader->close();
        }
        return $eligible;
    }
}
