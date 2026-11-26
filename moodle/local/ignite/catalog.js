/* Course catalog: facts, filters and one-click enrol on Moodle's own course boxes. */
(function () {
    'use strict';
    var node = document.getElementById('ignite-catalog-data');
    if (!node) { return; }
    var data = JSON.parse(node.textContent);
    // Moodle titles this page with the site name; the catalog is simply "Courses".
    var heading = document.querySelector('.page-header-headings h1');
    if (heading && data.text.title) { heading.textContent = data.text.title; }
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.coursebox[data-courseid]'));
    if (!boxes.length) { return; }
    var state = {audience: '', topic: ''};

    function el(tag, className, text) {
        var made = document.createElement(tag);
        if (className) { made.className = className; }
        if (text !== undefined) { made.textContent = text; }
        return made;
    }

    boxes.forEach(function (box) {
        var facts = data.facts[box.getAttribute('data-courseid')];
        if (!facts || box.querySelector('.ignite-cat__foot')) { return; }
        var foot = el('div', 'ignite-cat__foot');
        var chips = el('ul', 'ignite-cat__chips');
        if (facts.audience) { chips.appendChild(el('li', 'ignite-cat__chip', facts.audience)); }
        if (facts.weeks) { chips.appendChild(el('li', 'ignite-cat__chip', data.text.weeks.replace('{$a}', facts.weeks))); }
        if (facts.topic) { chips.appendChild(el('li', 'ignite-cat__chip ignite-cat__chip--topic', facts.topic)); }
        if (chips.children.length) { foot.appendChild(chips); }
        var link = box.querySelector('.coursename a');
        var courseurl = link ? link.href : '#';
        var action;
        if (facts.action === 'enrol') {
            action = el('form');
            action.method = 'post';
            action.action = data.enrolurl;
            [['id', box.getAttribute('data-courseid')], ['sesskey', data.sesskey]].forEach(function (pair) {
                var input = el('input');
                input.type = 'hidden'; input.name = pair[0]; input.value = pair[1];
                action.appendChild(input);
            });
            var button = el('button', 'ignite-cat__action', data.text.enrol);
            button.type = 'submit';
            action.appendChild(button);
        } else {
            action = el('a', 'ignite-cat__action' + (facts.action === 'view' ? ' ignite-cat__action--quiet' : ''),
                data.text[facts.action]);
            action.href = courseurl;
        }
        foot.appendChild(action);
        box.appendChild(foot);
    });

    var holder = boxes[0].parentNode;
    var bar = el('div', 'ignite-cat__filters');
    var count = el('p', 'ignite-cat__count');
    count.setAttribute('aria-live', 'polite');
    var none = el('p', 'ignite-cat__none', data.text.none);
    none.hidden = true;

    function group(label, key, values) {
        var set = el('fieldset', 'ignite-cat__group');
        set.appendChild(el('legend', '', label));
        [''].concat(values).forEach(function (value) {
            var pill = el('button', 'ignite-cat__pill', value || data.text.all);
            pill.type = 'button';
            pill.setAttribute('aria-pressed', value === state[key] ? 'true' : 'false');
            pill.addEventListener('click', function () {
                state[key] = value;
                Array.prototype.forEach.call(set.querySelectorAll('.ignite-cat__pill'), function (other) {
                    other.setAttribute('aria-pressed', other === pill ? 'true' : 'false');
                });
                apply();
            });
            set.appendChild(pill);
        });
        return set;
    }

    function apply() {
        var shown = 0;
        boxes.forEach(function (box) {
            var facts = data.facts[box.getAttribute('data-courseid')] || {};
            var match = (!state.audience || facts.audience === state.audience) &&
                (!state.topic || facts.topic === state.topic);
            box.hidden = !match;
            if (match) { shown++; }
        });
        count.textContent = data.text.count.replace('{$a}', shown);
        none.hidden = shown > 0;
    }

    bar.appendChild(group(data.text.audience, 'audience', data.audiences));
    bar.appendChild(group(data.text.topic, 'topic', data.topics));
    bar.appendChild(count);
    holder.parentNode.insertBefore(bar, holder);
    holder.parentNode.insertBefore(none, holder);
    apply();
})();
