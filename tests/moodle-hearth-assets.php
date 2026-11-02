<?php
// Real native-file API checks. Run after moodle-hearths.php in a private Prompt 3 fixture only.
if (PHP_SAPI !== 'cli' || $argc < 2) { exit("Supply the private Moodle fixture root.\n"); }
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
if (!str_contains($CFG->dbname, 'ignite_lms_test_p3_') || !$CFG->noemailever ||
        !str_starts_with($CFG->wwwroot, 'http://127.0.0.1:')) { throw new RuntimeException('Unsafe fixture'); }
\core\session\manager::set_user(get_admin());
$_POST = ['sesskey' => sesskey()];
$house = $DB->get_record('local_ignite_house', ['code' => 'embercrest'], '*', MUST_EXIST);
$fs = get_file_storage();
$draftid = file_get_unused_draft_itemid();
$context = context_user::instance($USER->id);
$fileinfo = ['contextid' => $context->id, 'component' => 'user', 'filearea' => 'draft',
    'itemid' => $draftid, 'filepath' => '/', 'filename' => 'approved-sol.png', 'userid' => $USER->id];
$fs->create_file_from_pathname($fileinfo, $CFG->dirroot . '/local/ignite/pix/sol.png');
if (!\local_ignite\hearth_assets::validate($draftid)) { throw new RuntimeException('Valid existing Sol rejected'); }
\local_ignite\hearth_assets::save((int)$house->id, ['mascot' => $draftid]);
$url = \local_ignite\hearth_ui::identity($house)['mascoturl'];
if (!str_contains($url, '/local_ignite/mascot/') || !str_contains($url, 'approved-sol.png')) {
    throw new RuntimeException('Approved upload not used');
}
echo "PASS Existing Sol accepted, stored under stable Hearth ID and used by identity rendering\n";
$badid = file_get_unused_draft_itemid();
$fileinfo['itemid'] = $badid;
$fileinfo['filename'] = 'unapproved.png';
$fs->create_file_from_string($fileinfo, '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
if (\local_ignite\hearth_assets::validate($badid)) { throw new RuntimeException('SVG disguised as PNG accepted'); }
try {
    \local_ignite\hearth_assets::save((int)$house->id, ['mascot' => $badid]);
    throw new RuntimeException('Invalid asset save unexpectedly succeeded');
} catch (invalid_parameter_exception $e) {
    echo "PASS Server rejects active content disguised as an image\n";
}
if (\local_ignite\hearth_ui::identity($house)['mascoturl'] !== $url) { throw new RuntimeException('Rejected upload altered existing asset'); }
echo "PASS Rejected upload preserves configured artwork\n";
$emptyid = file_get_unused_draft_itemid();
\local_ignite\hearth_assets::save((int)$house->id, ['mascot' => $emptyid]);
if (str_contains(\local_ignite\hearth_ui::identity($house)['mascoturl'], 'approved-sol.png')) {
    throw new RuntimeException('Removing approved upload did not restore bundled asset');
}
foreach ([$draftid, $badid, $emptyid] as $id) {
    $fs->delete_area_files($context->id, 'user', 'draft', $id);
}
echo "PASS Removal restores the configured bundled artwork\nAsset checks: 4 passed\n";
