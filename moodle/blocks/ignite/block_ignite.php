<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** Thin native Dashboard extension; local_ignite owns all learner services. */
class block_ignite extends block_base {
    public function init() {
        $this->title = get_string('pluginname', 'block_ignite');
    }

    public function applicable_formats() { return ['my' => true]; }
    public function instance_allow_multiple() { return false; }
    public function hide_header() { return true; }

    public function get_content() {
        if ($this->content !== null) { return $this->content; }
        $this->content = (object)['text' => '', 'footer' => ''];
        if (!isloggedin() || isguestuser() || !\local_ignite\access::enabled('dashboard') ||
                !has_capability('local/ignite:use', context_system::instance())) {
            return $this->content;
        }
        $this->page->requires->css('/local/ignite/dashboard.css');
        $data = \local_ignite\dashboard::data(true);
        $this->content->text = $this->page->get_renderer('core')->render_from_template('local_ignite/dashboard', $data);
        if ($data['offer']) { \local_ignite\invitations::shown(); }
        return $this->content;
    }
}
