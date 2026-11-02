<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

final class navigation {
    public static function items(): array {
        global $CFG;
        if (!isloggedin() || isguestuser() || !access::enabled() ||
                !has_capability('local/ignite:use', \context_system::instance())) { return []; }
        $items = ['local_ignite' => ['label' => get_string('dash_dashboard', 'local_ignite'), 'path' => !empty($CFG->enabledashboard) ? '/my/' : '/local/ignite/index.php'],
            'local_ignite_explore' => ['label' => get_string('nav_explore', 'local_ignite'), 'path' => '/course/index.php']];
        if (access::enabled('houses')) { $items['local_ignite_hearth'] = ['label' => get_string('nav_hearth', 'local_ignite'), 'path' => '/local/ignite/hearth.php']; }
        if (access::enabled('passport')) { $items['local_ignite_passport'] = ['label' => get_string('passport', 'local_ignite'), 'path' => '/local/ignite/passport.php']; }
        return $items;
    }
    public static function primary(\core\hook\navigation\primary_extend $hook): void {
        global $SCRIPT;
        $items = self::items();
        if (!$items) { return; }
        foreach (['home', 'myhome', 'mycourses', 'siteadminnode'] as $key) {
            if ($node = $hook->primaryview->get($key)) { $node->remove(); }
        }
        foreach ($items as $key => $item) {
            $node = $hook->primaryview->add($item['label'], new \moodle_url($item['path']), \navigation_node::TYPE_CUSTOM, null, $key);
            if ($key === 'local_ignite' && $SCRIPT === '/local/ignite/index.php') { $node->make_active(); }
        }
    }
    /** Keep native course and authorized administration destinations in Moodle's account menu. */
    public static function user_menu(\core_user\hook\extend_user_menu $hook): void {
        global $CFG, $PAGE;
        if (!self::items()) { return; }
        if (!empty($CFG->enablemycourses)) {
            $hook->add_navitem((object)['itemtype' => 'link', 'title' => get_string('mycourses'), 'url' => new \moodle_url('/my/courses.php')]);
        }
        $node = $PAGE->settingsnav->find('siteadministration', \navigation_node::TYPE_SITE_ADMIN);
        if (!$node) { $node = $PAGE->settingsnav->find('root', \navigation_node::TYPE_SITE_ADMIN); }
        if ($node) {
            $hook->add_navitem((object)['itemtype' => 'link', 'title' => (string)$node->text, 'url' => $node->action()]);
        }
    }
}
