<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
namespace local_ignite;

defined('MOODLE_INTERNAL') || die();

/** Audience, length and topic facts for the course catalog, plus its filter bar and one-click enrol. */
final class course_catalog {
    public const CATEGORY = 'Ignite catalog';
    public const AUDIENCES = ['For everyone', 'Grades 4–8', 'Grades 9–12', 'College & professional'];
    public const TOPICS = ['Technology & Design', 'Science', 'Money & Business', 'Civics & Careers', 'Life Skills', 'Math'];
    private const PAGES = ['course-index', 'course-index-category', 'course-search'];

    /** Create the field category and the three course fields once. Existing fields are left alone. */
    public static function ensure_fields(): void {
        $handler = \core_course\customfield\course_handler::create();
        $category = null;
        foreach ($handler->get_categories_with_fields() as $existing) {
            if ($existing->get('name') === self::CATEGORY) {
                $category = $existing;
            }
        }
        if (!$category) {
            $category = \core_customfield\category_controller::create($handler->create_category(self::CATEGORY));
        }
        $have = [];
        foreach ($category->get_fields() as $field) {
            $have[$field->get('shortname')] = true;
        }
        $definitions = [
            'ignite_audience' => ['Audience', 'select', self::AUDIENCES],
            'ignite_weeks' => ['Weeks', 'text', null],
            'ignite_topic' => ['Topic', 'select', self::TOPICS],
        ];
        foreach ($definitions as $shortname => [$name, $type, $options]) {
            if (isset($have[$shortname])) {
                continue;
            }
            $config = ['required' => 0, 'uniquevalues' => 0, 'locked' => 0,
                'visibility' => \core_course\customfield\course_handler::NOTVISIBLE,
                'defaultvalue' => '', 'defaultvalueformat' => FORMAT_MOODLE, 'displaysize' => 0, 'maxlength' => 0,
                'ispassword' => 0, 'link' => '', 'linktarget' => '', 'checkbydefault' => 0,
                'startyear' => 2000, 'endyear' => 3000, 'includetime' => 1];
            if ($options) {
                $config['options'] = implode("\n", $options);
            } else {
                $config['displaysize'] = 4;
                $config['maxlength'] = 3;
            }
            $record = (object)['name' => $name, 'shortname' => $shortname, 'type' => $type,
                'description' => '', 'descriptionformat' => FORMAT_HTML, 'sortorder' => 0,
                'categoryid' => $category->get('id'), 'configdata' => json_encode($config)];
            $field = \core_customfield\field_controller::create(0, (object)['type' => $type], $category);
            $handler->save_field_configuration($field, $record);
        }
    }

    /** Course id => audience, weeks, topic and the learner's one-click action. */
    public static function facts(): array {
        global $USER;
        $handler = \core_course\customfield\course_handler::create();
        $courses = array_filter(get_courses('all', 'c.sortorder', 'c.id'), fn($c) => $c->visible && $c->id != SITEID);
        $data = $handler->get_instances_data(array_keys($courses), true);
        $facts = [];
        foreach ($courses as $course) {
            $row = ['audience' => '', 'weeks' => '', 'topic' => '', 'action' => 'view'];
            foreach ($data[$course->id] ?? [] as $controller) {
                $short = $controller->get_field()->get('shortname');
                if (in_array($short, ['ignite_audience', 'ignite_weeks', 'ignite_topic'], true)) {
                    // Moodle returns option labels HTML-escaped; the page compares and prints plain text.
                    $row[substr($short, 7)] = html_entity_decode((string)($controller->export_value() ?? ''), ENT_QUOTES);
                }
            }
            $context = \context_course::instance($course->id);
            if (is_enrolled($context, $USER, '', true)) {
                $row['action'] = 'continue';
            } else if (self::self_instance($course->id)) {
                $row['action'] = 'enrol';
            }
            $facts[$course->id] = $row;
        }
        return $facts;
    }

    /** The open, key-free self-enrolment instance of a course, or null. */
    public static function self_instance(int $courseid): ?\stdClass {
        $plugin = enrol_get_plugin('self');
        foreach (enrol_get_instances($courseid, true) as $instance) {
            // Moodle stores "no enrolment key" as NULL or an empty string.
            if ($instance->enrol === 'self' && (string)$instance->password === '' &&
                    empty($instance->customint1) && $plugin->can_self_enrol($instance) === true) {
                return $instance;
            }
        }
        return null;
    }

    public static function footer(\core\hook\output\before_footer_html_generation $hook): void {
        global $PAGE;
        if (!in_array($PAGE->pagetype, self::PAGES, true) || !isloggedin() || isguestuser()) {
            return;
        }
        $version = get_config('local_ignite', 'version');
        $json = json_encode(['facts' => self::facts(), 'audiences' => self::AUDIENCES, 'topics' => self::TOPICS,
            'enrolurl' => (new \moodle_url('/local/ignite/catalog_enrol.php'))->out(false),
            'sesskey' => sesskey(),
            'text' => ['title' => get_string('catalog_title', 'local_ignite'), 'audience' => get_string('catalog_audience', 'local_ignite'),
                'topic' => get_string('catalog_topic', 'local_ignite'),
                'all' => get_string('catalog_all', 'local_ignite'),
                'weeks' => get_string('catalog_weeks', 'local_ignite'),
                'none' => get_string('catalog_none', 'local_ignite'),
                'count' => get_string('catalog_count', 'local_ignite'),
                'enrol' => get_string('catalog_enrol', 'local_ignite'),
                'continue' => get_string('catalog_continue', 'local_ignite'),
                'view' => get_string('catalog_view', 'local_ignite')]], JSON_HEX_TAG | JSON_HEX_AMP);
        $base = (new \moodle_url('/local/ignite/'))->out(false);
        $hook->add_html('<link rel="stylesheet" href="' . $base . 'catalog.css?v=' . $version . '">' .
            '<script type="application/json" id="ignite-catalog-data">' . $json . '</script>' .
            '<script src="' . $base . 'catalog.js?v=' . $version . '" defer></script>');
    }
}
