<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace tiny_ignite_markdown;

defined('MOODLE_INTERNAL') || die();

final class plugininfo extends \editor_tiny\plugin implements
    \editor_tiny\plugin_with_buttons,
    \editor_tiny\plugin_with_menuitems {
    public static function get_available_buttons(): array {
        return ['tiny_ignite_markdown/tiny_ignite_markdown_markdown'];
    }

    public static function get_available_menuitems(): array {
        return ['tiny_ignite_markdown/tiny_ignite_markdown_markdown'];
    }
}
