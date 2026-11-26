// Fuse home preview. Sample numbers stand in for what the plugin will report for the signed-in learner.
const XP = 20; // XP for each passed milestone, which is also what it adds to the team's fire.
const DROPS = [2, 3, 5]; // Embers dropped by the first mini bomb, the second, and the big one.
const GRADES = ['bronze', 'silver', 'gold'];
const TEAMS = { forgelings: 'Forgelings', candlelings: 'Candlelings', lanternlings: 'Lanternlings' };
// Earlier months: the grade each one ended on (empty for a month with no bomb), and the embers they banked.
const HISTORY = {
    first: { month: 'December', next: 'January', shelf: [], upcoming: ['Jan', 'Feb', 'Mar', 'Apr'], banked: 0, streak: 1 },
    later: { month: 'March', next: 'April', shelf: [['Dec', 'gold'], ['Jan', 'silver'], ['Feb', '']], upcoming: ['Apr', 'May'], banked: 15, streak: 3 },
};
// The ember icon, on a 24 unit square: a flame and its core.
const EMBER = ['M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2-7 1.5 1 2 2.5 2 4 1.5-2 2-5 2-9Z',
    'M12 12c.7 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.5.8-2.3 1-3.5.8.5 1 1.2 1 2 .7-1 1-2.5 1-4Z'];
const NS = 'http://www.w3.org/2000/svg';
const home = document.querySelector('.fuse-home');
const svg = home.querySelector('.fuse__svg');
const controls = document.querySelector('.preview-controls');
const text = name => document.querySelector(`[data-text="${name}"]`);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// Everyone's fuse is the same length: the monthly goal staff have set, here 100 XP.
const state = { length: 5, passed: 2, team: 'forgelings', history: 'first', spent: false };
let scene; // The drawn fuse: its rope, flame and bombs.
let shown = state.passed; // How far along the fuse the flame is drawn, in milestones.
let burning = 0;

function draw(parent, name, attributes = {}) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes)) {
        node.setAttribute(key, value);
    }
    return parent.appendChild(node);
}

/** A star's corner points around the origin. */
function star(tips, outer, inner) {
    return Array.from({ length: tips * 2 }, (_, index) => {
        const angle = Math.PI * index / tips - Math.PI / 2;
        const reach = index % 2 ? inner : outer;
        return `${(reach * Math.cos(angle)).toFixed(1)},${(reach * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');
}

/** The three bombs on a fuse: after the first milestone, at halfway, and at the end. */
function charges(length) {
    return [1, Math.ceil(length / 2), length].map((at, index) =>
        ({ at, drop: DROPS[index], grade: GRADES[index], big: index === 2 }));
}

/** Draw the fuse to fit its box: one straight, unbroken rope ending at the big bomb, with the bombs sitting on it. */
function layout() {
    const width = Math.max(300, Math.round(svg.parentElement.clientWidth));
    const wide = width >= 640;
    const [left, right, level] = wide ? [30, width - 70, 100] : [14, width - 40, 86];
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${width} ${wide ? 196 : 160}`);
    const d = `M${left} ${level}H${right}`;
    draw(svg, 'path', { class: 'fuse__rope', d });
    draw(svg, 'path', { class: 'fuse__sheen', d });
    const ash = draw(svg, 'path', { class: 'fuse__ash', d });
    const smoulder = draw(svg, 'path', { class: 'fuse__smoulder', d });
    const total = right - left;

    // The flame is drawn before the bombs, so it burns in under a bomb it is about to reach.
    const flame = draw(svg, 'g', { class: 'fuse__flame' });
    draw(flame, 'circle', { class: 'fuse__glow', r: 38 });
    [-8, 3, 9].forEach((drift, index) => draw(flame, 'circle', { class: 'fuse__spark', r: 2.2,
        style: `--dx: ${drift}px; animation-delay: ${index * -.37}s` }));
    draw(flame, 'path', { class: 'fuse__flame-shape', d: 'M0 7C-13 7-17-6-9-17-6-11-3-14 0-33 7-20 17-11 13 0 11 7 6 7 0 7Z' });
    draw(flame, 'path', { class: 'fuse__flame-shape fuse__flame-core', d: 'M0 6C-7 6-9-1-4-9-3-6-1-7 0-17 4-10 9-4 7 1 6 6 3 6 0 6Z' });

    const bombs = charges(state.length).map(charge => {
        const radius = (charge.big ? 2 : 1) * (wide ? 20 : 13);
        const along = total * charge.at / state.length;
        const centre = [left + along, level];
        const group = draw(svg, 'g', { class: 'fuse__bomb', transform: `translate(${centre[0]} ${centre[1]})` });
        const body = draw(group, 'g', { class: 'fuse__body' });
        // The tip that makes it a bomb: a cap on top, with a short wick and its spark.
        const tip = draw(body, 'g', { transform: 'rotate(24)' });
        draw(tip, 'path', { class: 'fuse__wick', d: `M0 ${-radius * 1.2}q${radius * .08} ${-radius * .34} ${radius * .38} ${-radius * .3}` });
        draw(tip, 'polygon', { class: 'fuse__spark-tip', points: star(4, radius * .24, radius * .09),
            transform: `translate(${radius * .44} ${-radius * 1.5})` });
        draw(tip, 'rect', { class: 'fuse__cap', x: -radius * .3, y: -radius * 1.24, width: radius * .6, height: radius * .36, rx: radius * .08 });
        draw(body, 'circle', { r: radius });
        draw(body, 'ellipse', { class: 'fuse__shine', cx: -radius * .35, cy: -radius * .4, rx: radius * .28, ry: radius * .17,
            transform: `rotate(-35 ${-radius * .35} ${-radius * .4})` });
        const medal = draw(group, 'g', { class: 'fuse__medal', 'data-grade': charge.grade });
        draw(medal, 'polygon', { class: 'fuse__burst', points: star(12, radius * 1.5, radius * 1.12) });
        draw(medal, 'circle', { r: radius * .92 });
        draw(medal, 'polygon', { class: 'fuse__star', points: star(5, radius * .55, radius * .24) });
        // What the bomb drops: an ember icon and how many.
        const label = draw(group, 'g', { class: 'fuse__label', transform: `translate(0 ${radius * 1.5 + 18})` });
        const icon = draw(label, 'g', { transform: 'translate(-21 -14) scale(.7)' });
        draw(icon, 'path', { class: 'fuse__coin', d: EMBER[0] });
        draw(icon, 'path', { class: 'fuse__coin-core', d: EMBER[1] });
        draw(label, 'text', { x: -2 }).textContent = '+' + charge.drop;
        return { ...charge, group, centre, radius, along };
    });
    scene = { left, level, ash, smoulder, bombs, flame, total, fx: draw(svg, 'g') };
    paint(shown);
}

/** Show the fuse burnt as far as the given number of milestones. */
function paint(value) {
    const { left, level, ash, smoulder, bombs, flame, total } = scene;
    let burnt = total * Math.min(value, state.length) / state.length;
    // Just past a mini bomb that has gone off, the flame stands clear of the badge it left on the rope.
    const cleared = bombs.find(bomb => !bomb.big && value >= bomb.at && burnt - bomb.along < bomb.radius + 10);
    if (cleared) {
        burnt = Math.min(total, cleared.along + cleared.radius + 10);
    }
    const alight = value > 0 && value < state.length;
    ash.style.strokeDasharray = `${burnt} ${total}`;
    ash.style.visibility = burnt ? '' : 'hidden';
    smoulder.style.strokeDasharray = `${Math.min(30, burnt)} ${total}`;
    smoulder.style.strokeDashoffset = -Math.max(0, burnt - 30);
    smoulder.style.visibility = alight ? '' : 'hidden';
    flame.setAttribute('transform', `translate(${left + burnt} ${level})`);
    flame.classList.toggle('is-out', !alight);
    bombs.forEach(bomb => bomb.group.classList.toggle('is-exploded', value >= bomb.at));
}

/** A bomb going off: say what it gave, then flash, throw sparks and, for the big one, shake the fuse. */
function boom(bomb) {
    const month = HISTORY[state.history].month;
    text('toast').textContent = bomb.big
        ? `Boom! Gold ${month} badge, +${bomb.drop} Embers, and +${state.length * XP / 2} XP blasted onto the ${TEAMS[state.team]}’ fire.`
        : `Boom! Your ${month} badge is now ${bomb.grade}. +${bomb.drop} Embers banked.`;
    if (calm) {
        return;
    }
    const burst = draw(scene.fx, 'g', { transform: `translate(${bomb.centre[0]} ${bomb.centre[1]})` });
    draw(burst, 'circle', { class: 'fuse__flash', r: bomb.radius });
    const shards = bomb.big ? 16 : 10;
    for (let index = 0; index < shards; index++) {
        const angle = 2 * Math.PI * index / shards;
        const reach = bomb.radius * (bomb.big ? 3.2 : 2.8);
        draw(burst, 'circle', { class: 'fuse__shard', r: bomb.big ? 4 : 3,
            style: `--dx: ${Math.cos(angle) * reach}px; --dy: ${Math.sin(angle) * reach}px` });
    }
    bomb.group.classList.add('is-fresh');
    home.classList.toggle('is-shaking', bomb.big);
    setTimeout(() => {
        burst.remove();
        home.classList.remove('is-shaking');
    }, 900);
}

/** Burn the fuse on to a newly passed milestone, setting off any bomb it reaches. */
function burn(target) {
    cancelAnimationFrame(burning);
    const from = shown;
    const start = performance.now();
    const step = now => {
        const progress = calm ? 1 : Math.min(1, (now - start) / 900);
        const next = from + (target - from) * progress;
        scene.bombs.filter(bomb => shown < bomb.at && next >= bomb.at).forEach(boom);
        shown = next;
        paint(shown);
        if (progress < 1) {
            burning = requestAnimationFrame(step);
        } else {
            words();
        }
    };
    step(start);
}

/** Everything written around the fuse, for the current sample learner. */
function words() {
    const past = HISTORY[state.history];
    const team = TEAMS[state.team];
    const left = state.length - state.passed;
    const blast = state.length * XP / 2;
    const earned = charges(state.length).filter(charge => state.passed >= charge.at);
    const embers = past.banked + earned.reduce((sum, charge) => sum + charge.drop, 0);
    const streak = state.history === 'later' || state.passed ? past.streak : 0;
    let [title, sub, go, next] = ['Your fuse is burning.',
        `${left * XP} XP to the big bomb.`, 'Continue learning', 'Up next: Loops and lists quiz · +20 XP'];
    if (state.spent) {
        [title, sub, go, next] = ['You’ve burned through it all.',
            'There is nothing left to pass in your courses. Pick a new course and a fresh fuse appears.', 'Find a course', ''];
    } else if (!left) {
        [title, sub, go, next] = ['Boom. Fuse burned.',
            `You set off all three bombs and blasted +${blast} XP onto the ${team}’ fire. A new fuse arrives on ${past.next} 1.`,
            'Keep learning', 'Extra XP still feeds your team’s fire.'];
    } else if (!state.passed) {
        [title, sub] = ['Light the fuse.', `Earn your first XP to set ${past.month}’s fuse burning.`];
    }
    home.classList.toggle('is-spent', state.spent);
    text('eyebrow').textContent = `${past.month} fuse · ends in 5 days 2 hours`;
    text('title').textContent = title;
    text('sub').textContent = sub;
    text('go').textContent = go;
    text('next').textContent = next;
    text('summary').textContent = `${state.passed * XP} of ${state.length * XP} XP burned this month`;
    text('legend').textContent = `The mini bombs drop ${DROPS[0]} and ${DROPS[1]} Embers; ` +
        `the big bomb drops ${DROPS[2]} and blasts +${blast} XP onto the ${team}’ fire. ` +
        `Everyone’s fuse is the same length: ${state.length * XP} XP a month.`;
    text('streak').textContent = streak ? `${streak}-week streak` : 'No streak yet';
    text('streaknote').textContent = state.spent ? 'Paused until you have a fuse again'
        : streak ? 'Earn XP by Sunday to keep it' : 'Earn XP this week to start one';
    text('embers').textContent = plural(embers, 'Ember');
    // The Shop preview shows the same sample balance.
    home.querySelector('a.fuse-chip').href = `../shop/index.html?embers=${embers}`;

    // One badge a month in its best grade so far, then the months still to come.
    const grade = earned.length ? earned.at(-1).grade : 'current';
    const medals = [...past.shelf, [past.month.slice(0, 3), grade], ...past.upcoming.map(month => [month, 'upcoming'])];
    home.querySelector('.fuse-shelf ul').replaceChildren(...medals.map(([month, medal]) => {
        const item = document.getElementById('medal').content.firstElementChild.cloneNode(true);
        item.dataset.grade = medal;
        item.querySelector('.fuse-medal__disc').textContent = month;
        item.querySelector('.fuse-medal__grade').textContent =
            { '': 'No bomb', current: 'This month', upcoming: '' }[medal] ?? medal[0].toUpperCase() + medal.slice(1);
        return item;
    }));
}

/** Read the preview controls and redraw without any burn. */
function reset() {
    cancelAnimationFrame(burning);
    state.length = Number(controls.elements.fuse.value);
    state.passed = Math.min(Number(controls.elements.passed.value), state.length);
    state.team = controls.elements.team.value;
    state.history = controls.elements.history.value;
    state.spent = controls.elements.spent.checked;
    controls.elements.passed.max = state.length;
    controls.elements.passed.value = state.passed;
    controls.elements.shown.value = `${state.passed * XP} of ${state.length * XP} XP`;
    shown = state.passed;
    text('toast').textContent = '';
    words();
    layout();
}

for (let length = 3; length <= 10; length++) {
    controls.elements.fuse.add(new Option(`${length * XP} XP`, length, false, length === state.length));
}
controls.elements.passed.max = state.length;
controls.elements.passed.value = state.passed;
controls.addEventListener('input', reset);
controls.elements.pass.addEventListener('click', () => {
    if (state.passed >= state.length || state.spent) {
        return;
    }
    state.passed++;
    controls.elements.passed.value = state.passed;
    controls.elements.shown.value = `${state.passed * XP} of ${state.length * XP} XP`;
    burn(state.passed);
});
reset();
// Redraw when the box changes width; the first report repeats the size already drawn.
let drawn = svg.parentElement.clientWidth;
new ResizeObserver(([entry]) => {
    if (Math.round(entry.contentRect.width) !== drawn) {
        drawn = Math.round(entry.contentRect.width);
        layout();
    }
}).observe(svg.parentElement);
