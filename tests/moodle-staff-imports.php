<?php
// Integration checks against a PRIVATE copy of Moodle, never the production database.
if (PHP_SAPI !== 'cli' || $argc !== 2) {
    exit("Usage: php moodle-staff-imports.php PRIVATE_MOODLE_ROOT\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, '_staffimports_test_') || empty($CFG->noemailever)) {
    throw new RuntimeException('Tests require a private staffimports test database with email disabled.');
}
require_once($CFG->libdir . '/csvlib.class.php');
require_once($CFG->dirroot . '/admin/tool/uploaduser/locallib.php');
require_once($CFG->dirroot . '/user/lib.php');

use local_ignite_staffimports\import_defaults;

function check_import(bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function csv_upload(array $columns, array $rows, int $operation = UU_USER_ADDNEW, bool $finish = true): array {
    global $SCRIPT, $DB;
    $SCRIPT = '/admin/tool/uploaduser/index.php';
    $stream = fopen('php://temp', 'w+');
    fputcsv($stream, $columns, escape: '');
    foreach ($rows as $row) {
        fputcsv($stream, $row, escape: '');
    }
    rewind($stream);
    $content = stream_get_contents($stream);
    fclose($stream);
    $iid = csv_import_reader::get_new_iid('uploaduser');
    $reader = new csv_import_reader($iid, 'uploaduser');
    $reader->load_csv_content($content, 'UTF-8', 'comma');
    check_import($reader->get_error() === null, 'CSV reader rejected test data');
    $_POST['iid'] = $iid;
    $process = new \tool_uploaduser\process($reader);
    $process->get_file_columns();
    $process->set_form_data((object)[
        'uutype' => $operation, 'uuupdatetype' => UU_UPDATE_FILEOVERRIDE,
        'uupasswordnew' => 0, 'uuforcepasswordchange' => 0, 'uustandardusernames' => 1,
        'uubulk' => 0, 'uuallowsuspends' => 1, 'uunoemailduplicates' => 1,
        'auth' => 'manual', 'lang' => 'en', 'timezone' => '99',
    ]);
    ob_start();
    try {
        $process->process();
    } finally {
        ob_end_clean();
    }
    if ($finish) {
        import_defaults::finish_import();
    }
    $users = [];
    foreach ($rows as $row) {
        $username = core_user::clean_field($row[0], 'username');
        $users[$username] = $DB->get_record('user', ['username' => $username], '*', MUST_EXIST);
    }
    return $users;
}

function has_developer(int $userid): bool {
    global $DB;
    $roleid = (int)$DB->get_field('role', 'id', ['shortname' => 'ignite_course_developer']);
    return user_has_role_assignment($userid, $roleid, context_system::instance()->id);
}

\core\session\manager::set_user(get_admin());
$PAGE->set_context(context_system::instance());
set_config('enabled', 1, 'local_ignite_staffimports');
$tag = 'ignitecheck_' . bin2hex(random_bytes(4));
$courses = $DB->get_records_select('course', 'id <> ?', [$SITE->id], 'id', '*', 0, 1);
$course = reset($courses);
check_import((bool)$course, 'A test course is required');
$password = 'TestOnly!4829aZ';
$columns = ['username', 'firstname', 'lastname', 'email', 'password', 'sysrole1', 'course1', 'role1'];
$row = static fn(string $suffix, string $role = '', string $courseid = '', string $courserole = '') => [
    $tag . $suffix, 'Test', 'Import', $tag . $suffix . '@example.invalid', $password,
    $role, $courseid, $courserole,
];
$rows = [
    $row('_default'),
    $row('_manager', 'manager'),
    $row('_student', '', $course->shortname, 'student'),
    $row('_mentor', '', $course->shortname, 'ignite_asynchronous_mentor'),
    $row('_developer', 'ignite_course_developer'),
    $row('_removal', '-ignite_course_developer'),
    $row('_invalid', 'not_a_real_role'),
    $row('_learner', '', $course->shortname),
];
$users = csv_upload($columns, $rows);
check_import(has_developer((int)$users[$tag . '_default']->id), 'Role-free staff CSV row did not get Course Developer');
check_import(has_developer((int)$users[$tag . '_developer']->id), 'Explicit developer role was lost');
foreach (['_manager', '_student', '_mentor', '_removal', '_invalid', '_learner'] as $suffix) {
    check_import(!has_developer((int)$users[$tag . $suffix]->id), 'Explicit CSV intent was overridden: ' . $suffix);
}
$developerid = (int)$DB->get_field('role', 'id', ['shortname' => 'ignite_course_developer']);
check_import($DB->count_records('role_assignments', ['roleid' => $developerid,
    'userid' => $users[$tag . '_developer']->id]) === 1, 'Explicit role duplicated');

// A CSV with only standard account fields also gets the default; no special headers are needed.
$plain = array_slice($row('_plain'), 0, 5);
$plainusers = csv_upload(array_slice($columns, 0, 5), [$plain]);
$plainuserid = (int)$plainusers[$tag . '_plain']->id;
check_import(has_developer($plainuserid), 'CSV without role headers did not get the default');

$normalized = csv_upload(array_slice($columns, 0, 5), [array_slice($row('_Case(Name)'), 0, 5)]);
check_import(has_developer((int)$normalized[$tag . '_casename']->id), 'Normalized username did not get the default');

// Updating an existing student without repeating their role must not promote them.
$studentupdate = csv_upload(array_slice($columns, 0, 5), [array_slice($row('_student'), 0, 5)], UU_USER_ADD_UPDATE);
check_import(!has_developer((int)$studentupdate[$tag . '_student']->id), 'Updating an existing student granted developer');

// Disabled automation must be respected.
set_config('enabled', 0, 'local_ignite_staffimports');
$disabled = csv_upload(array_slice($columns, 0, 5), [array_slice($row('_disabled'), 0, 5)]);
check_import(!has_developer((int)$disabled[$tag . '_disabled']->id), 'Disabled automation still assigned a role');
set_config('enabled', 1, 'local_ignite_staffimports');

// A stale role-edit form must not turn this default into site-wide editing access.
$DB->set_field('role', 'archetype', 'editingteacher', ['id' => $developerid]);
try {
    $unsafe = csv_upload(array_slice($columns, 0, 5), [array_slice($row('_unsafe'), 0, 5)]);
    check_import(!has_developer((int)$unsafe[$tag . '_unsafe']->id), 'Unsafe role definition was assigned automatically');
} finally {
    $DB->set_field('role', 'archetype', 'coursecreator', ['id' => $developerid]);
}

// Public self-registration and manually adding a learner must never create a staff member.
foreach (['/login/signup.php' => '_public', '/user/editadvanced.php' => '_manual'] as $path => $suffix) {
    $SCRIPT = $path;
    $id = user_create_user((object)[
        'username' => $tag . $suffix, 'firstname' => 'Test', 'lastname' => 'Learner',
        'email' => $tag . $suffix . '@example.invalid', 'auth' => 'email',
        'confirmed' => 0, 'password' => AUTH_PASSWORD_NOT_CACHED,
        'mnethostid' => $CFG->mnet_localhost_id,
    ], false, true);
    import_defaults::finish_import();
    check_import(!has_developer($id), 'Account created outside staff uploads gained developer access');
}

// An unprivileged uploader cannot turn the fallback into a privilege escalation.
$student = $users[$tag . '_student'];
$actor = $USER;
\core\session\manager::set_user($student);
$SCRIPT = '/admin/tool/uploaduser/index.php';
$event = \core\event\user_created::create_from_userid($disabled[$tag . '_disabled']->id);
import_defaults::observe($event);
import_defaults::finish_import();
check_import(!has_developer((int)$disabled[$tag . '_disabled']->id), 'Unprivileged uploader could assign developer');
\core\session\manager::set_user($actor);

// Staff defaults must retain the existing create-own-course security model.
// These checks model the developer's next request, after the uploader request has finished.
accesslib_clear_all_caches(true);
$context = context_course::instance($course->id);
$newdeveloper = $plainuserid;
check_import(has_capability('moodle/course:create', context_system::instance(), $newdeveloper, false),
    'Default developer cannot create a course');
check_import(!has_capability('moodle/course:update', $context, $newdeveloper, false),
    'Default developer can edit an unrelated course');
check_import(!has_capability('moodle/site:config', context_system::instance(), $newdeveloper, false),
    'Default developer gained site administration');
check_import((int)$CFG->creatornewroleid === 3, 'Automatic local Teacher default changed');

$shutdown = csv_upload(array_slice($columns, 0, 5), [array_slice($row('_shutdown'), 0, 5)], UU_USER_ADDNEW, false);
$shutdownid = (int)$shutdown[$tag . '_shutdown']->id;
check_import(!has_developer($shutdownid), 'Default was assigned before the importer finished');
core_shutdown_manager::register_function(static function () use ($shutdownid): void {
    if (!has_developer($shutdownid)) {
        fwrite(STDERR, "FAIL: automatic request-end assignment did not run.\n");
        exit(1);
    }
    echo "PASS: automatic request-end assignment runs after the native import completes.\n";
});

echo "PASS: native CSV imports default to Course Developer; explicit roles, students, public registration, "
    . "disabled automation, uploader permissions and course boundaries are preserved.\n";
