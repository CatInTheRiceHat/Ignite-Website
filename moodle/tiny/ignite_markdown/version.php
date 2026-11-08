<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'tiny_ignite_markdown';
$plugin->version = 2026110800;
$plugin->requires = 2026042000;
$plugin->supported = [502, 502];
$plugin->dependencies = ['filter_codehighlighter' => ANY_VERSION];
$plugin->maturity = MATURITY_STABLE;
$plugin->release = '1.3.0';
