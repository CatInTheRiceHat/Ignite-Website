<?php
namespace local_ignite\task;
defined('MOODLE_INTERNAL') || die();
final class learner_reports extends \core\task\scheduled_task {
    public function get_name(): string { return get_string('report_task','local_ignite'); }
    public function execute(): void { \local_ignite\reports::refresh(); }
}
