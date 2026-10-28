<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace tiny_ignite_markdown\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;

defined('MOODLE_INTERNAL') || die();

final class convert extends external_api {
    public const MAX_BYTES = 102400;

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'contextid' => new external_value(PARAM_INT, 'Editor context ID'),
            'markdown' => new external_value(PARAM_RAW, 'Markdown source, up to 100 KiB'),
        ]);
    }

    public static function execute(int $contextid, string $markdown): string {
        $params = self::validate_parameters(self::execute_parameters(), compact('contextid', 'markdown'));
        $context = \context::instance_by_id($params['contextid']);
        self::validate_context($context);
        require_capability('tiny/ignite_markdown:use', $context);
        return self::render($params['markdown']);
    }

    /** Convert without content filters or storage; always clean even for trusted authors. */
    public static function render(string $markdown): string {
        if (strlen($markdown) > self::MAX_BYTES) {
            throw new \invalid_parameter_exception('Markdown exceeds the 100 KiB limit.');
        }
        return clean_text(markdown_to_html($markdown), FORMAT_HTML);
    }

    public static function execute_returns(): external_value {
        return new external_value(PARAM_RAW, 'Sanitized HTML');
    }
}
