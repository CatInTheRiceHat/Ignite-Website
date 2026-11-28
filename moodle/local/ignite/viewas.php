<?php
// This file is part of Moodle - https://moodle.org/
// Licensed under the GNU GPL v3 or later.
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

use local_ignite\access;
use local_ignite\campfire;
use local_ignite\fuse;
use local_ignite\houses;

access::administrator();
admin_externalpage_setup('local_ignite_viewas');
$url = new moodle_url('/local/ignite/viewas.php');
$home = new moodle_url('/my/');
// Only the staff member's own account changes: houses::set_current() accepts no other learner.
$ids = access::enabled('houses') ? campfire::ids() : [];
$available = $ids ? houses::available() : [];
$teams = [];
foreach (campfire::ORDER as $code) {
    if (isset($ids[$code], $available[$ids[$code]])) {
        $teams[$code] = campfire::TEAMS[$code];
    }
}
if (data_submitted()) {
    require_sesskey();
    $pretend = optional_param('xp', '', PARAM_ALPHANUM);
    if ($pretend !== '') {
        // The browser has already noted where the burn starts; Home then burns on to this amount.
        fuse::set_pretend($pretend === 'real' ? null : (int)$pretend);
        redirect($pretend === 'real' ? $url : $home);
    }
    $team = required_param('team', PARAM_ALPHA);
    if ($team !== 'none' && !isset($teams[$team])) {
        throw new moodle_exception('invalidhearth', 'local_ignite');
    }
    houses::set_current($team === 'none' ? null : (int)$ids[$team]);
    redirect($url, $team === 'none' ? get_string('viewas_now_none', 'local_ignite') :
        get_string('viewas_now_team', 'local_ignite', $teams[$team]), null, \core\output\notification::NOTIFY_SUCCESS);
}
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('viewas', 'local_ignite'));

echo $OUTPUT->heading(get_string('passport', 'local_ignite'), 3);
if (!access::enabled('houses')) {
    echo html_writer::tag('p', get_string('viewas_off', 'local_ignite'));
} else {
    $current = houses::get_current();
    $currentcode = $current ? (array_search((int)$current->id, array_map('intval', $ids), true) ?: '') : 'none';
    echo html_writer::tag('p', get_string('viewas_intro', 'local_ignite'));
    echo html_writer::tag('p', html_writer::tag('strong', !$current ? get_string('viewas_now_none', 'local_ignite') :
        get_string('viewas_now_team', 'local_ignite', s($teams[$currentcode] ?? $current->name))));
    foreach (['none' => get_string('viewas_none', 'local_ignite')] + $teams as $code => $label) {
        $button = new single_button(new moodle_url($url, ['team' => $code]), $label, 'post');
        $button->disabled = $code === $currentcode;
        echo $OUTPUT->render($button);
    }
    echo html_writer::tag('p', get_string('viewas_open', 'local_ignite') . ' ' .
        html_writer::link(new moodle_url('/local/ignite/passport.php'), get_string('passport', 'local_ignite')) . ' · ' .
        html_writer::link($home, get_string('home')), ['class' => 'mt-3']);
}

echo $OUTPUT->heading(get_string('viewas_fuse', 'local_ignite'), 3, 'mt-5');
if (!access::enabled('fuse')) {
    echo html_writer::tag('p', get_string('viewas_fuse_off', 'local_ignite'));
} else {
    $shown = fuse::current();
    [$first, $second, $goal] = array_map('intval', explode(',', $shown['marks']));
    echo html_writer::tag('p', get_string('viewas_fuse_intro', 'local_ignite'));
    echo html_writer::tag('p', html_writer::tag('strong', get_string(
        fuse::pretend() === null ? 'viewas_fuse_real' : 'viewas_fuse_pretend', 'local_ignite', $shown['xp'])));
    // Each button is its own form: where the burn starts is left for Home's script, and where it ends is sent to Moodle.
    $form = static function(string $fields) use ($url, $shown): string {
        return html_writer::tag('form', html_writer::empty_tag('input',
            ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]) . $fields,
            ['method' => 'post', 'action' => $url->out(false), 'class' => 'ignite-viewas-burn d-inline-block mr-2 mb-2',
                'data-slot' => 'ignite-fuse-' . $shown['key']]);
    };
    $hidden = static fn(string $name, int $value): string =>
        html_writer::empty_tag('input', ['type' => 'hidden', 'name' => $name, 'value' => $value]);
    $submit = static fn(string $label, string $style = 'secondary'): string =>
        html_writer::tag('button', $label, ['type' => 'submit', 'class' => 'btn btn-' . $style]);
    foreach (['bomb1' => [0, $first], 'bomb2' => [$first, $second], 'bomb3' => [$second, $goal], 'whole' => [0, $goal]]
            as $name => [$from, $to]) {
        echo $form($hidden('from', $from) . $hidden('xp', $to) .
            $submit(get_string('viewas_fuse_' . $name, 'local_ignite', (object)['from' => $from, 'to' => $to])));
    }
    $number = static fn(string $name, int $value): string => html_writer::empty_tag('input', ['type' => 'number',
        'name' => $name, 'value' => $value, 'min' => 0, 'max' => $goal, 'required' => 'required',
        'class' => 'form-control d-inline-block mx-1', 'style' => 'width: 6em',
        'aria-label' => get_string('viewas_fuse_' . $name, 'local_ignite')]);
    echo html_writer::div($form(get_string('viewas_fuse_from', 'local_ignite') . $number('from', 0) .
        get_string('viewas_fuse_to', 'local_ignite') . $number('xp', (int)$shown['award']) .
        get_string('viewas_fuse_unit', 'local_ignite') . ' ' . $submit(get_string('viewas_fuse_play', 'local_ignite'), 'primary')));
    if (fuse::pretend() !== null) {
        echo $OUTPUT->single_button(new moodle_url($url, ['xp' => 'real']), get_string('viewas_fuse_stop', 'local_ignite'), 'post');
    }
    // Home burns on from the XP this browser last saw, so the starting point is written where Home looks for it.
    echo html_writer::script("document.querySelectorAll('form.ignite-viewas-burn').forEach(function(form) {
        form.addEventListener('submit', function() {
            try { localStorage.setItem(form.dataset.slot, form.elements.from.value); } catch (error) {}
        });
    });");
}
echo $OUTPUT->footer();
