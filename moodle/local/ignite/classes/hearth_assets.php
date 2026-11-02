<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;
defined('MOODLE_INTERNAL') || die();
final class hearth_assets {
    public const OPTIONS = ['maxfiles' => 1, 'maxbytes' => 2097152,
        'accepted_types' => ['.png', '.jpg', '.jpeg', '.webp'], 'subdirs' => 0];

    public static function validate(int $draftid): bool {
        global $USER;
        $files = get_file_storage()->get_area_files(\context_user::instance($USER->id)->id,
            'user', 'draft', $draftid, 'id', false);
        if (count($files) > 1) {
            return false;
        }
        foreach ($files as $file) {
            $info = @getimagesizefromstring($file->get_content());
            if (!in_array($file->get_mimetype(), ['image/png', 'image/jpeg', 'image/webp'], true) ||
                    !$info || !in_array($info['mime'], ['image/png', 'image/jpeg', 'image/webp'], true) ||
                    $file->get_filesize() > 2097152 || $info[0] > 4096 || $info[1] > 4096) {
                return false;
            }
        }
        return true;
    }
    public static function save(int $houseid, array $drafts): void {
        global $DB;
        access::administrator();
        require_sesskey();
        foreach ($drafts as $area => $draftid) {
            if (!in_array($area, ['emblem', 'mascot'], true) || !self::validate((int)$draftid)) {
                throw new \invalid_parameter_exception('Invalid approved image');
            }
        }
        access::locked('houses', static function() use ($DB, $houseid, $drafts) {
            $DB->get_record('local_ignite_house', ['id' => $houseid], '*', MUST_EXIST);
            foreach ($drafts as $area => $draftid) {
                file_save_draft_area_files((int)$draftid, \context_system::instance()->id, 'local_ignite',
                    $area, $houseid, self::OPTIONS);
            }
        });
    }
}
