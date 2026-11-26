<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_login();
\local_ignite\access::learner('fuse');
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/local/ignite/shop.php');
$PAGE->set_pagelayout('standard');
$PAGE->add_body_class('ignite-shop-page');
$PAGE->set_title(get_string('shop', 'local_ignite'));
$PAGE->set_heading(get_string('shop', 'local_ignite'));
$PAGE->requires->css(new moodle_url('/local/ignite/shop.css', ['rev' => filemtime(__DIR__ . '/shop.css')]));
$data = \local_ignite\shop::data();
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_ignite/shop', $data);
echo $OUTPUT->footer();
