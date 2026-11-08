<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'tiny_ignite_markdown';
$plugin->version = 2026110801;
$plugin->requires = 2026042000;
$plugin->supported = [502, 502];
$plugin->dependencies = ['tiny_autosave' => ANY_VERSION];
$plugin->maturity = MATURITY_STABLE;
$plugin->release = '2.0.0';
