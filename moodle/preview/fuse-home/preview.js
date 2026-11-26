// Fuse home preview. Sample numbers stand in for what the plugin reports for the signed-in learner;
// the fuse itself is drawn by the plugin's own fuse-home.js.
const XP = 20; // XP for each passed activity.
const DROPS = [2, 3, 5]; // Embers dropped by the first mini bomb, the second, and the big one.
const GRADES = ['bronze', 'silver', 'gold'];
// Earlier months: the grade each one ended on (empty for a month with no bomb), and the Embers they banked.
const HISTORY = {
    first: { month: 'December', next: 'January', shelf: [], upcoming: ['Jan', 'Feb', 'Mar', 'Apr'], banked: 0, streak: 1 },
    later: { month: 'March', next: 'April', shelf: [['Dec', 'gold'], ['Jan', 'silver'], ['Feb', '']], upcoming: ['Apr', 'May'], banked: 15, streak: 3 },
};
const home = document.querySelector('.fuse-home');
const controls = document.querySelector('.preview-controls');
const text = name => document.querySelector(`[data-text="${name}"]`);
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
// Fuse length and progress are counted in passed activities here, and handed to the fuse in XP.
const state = { length: 5, passed: 2, history: 'first', spent: false };
let control;

/** The three bombs on a fuse: after the first pass, at halfway, and at the end. As the plugin's fuse::marks(). */
function charges(length) {
    return [1, Math.ceil(length / 2), length].map((at, index) => ({ at, drop: DROPS[index], grade: GRADES[index] }));
}

/** Everything written around the fuse, and the numbers the fuse is drawn from. */
function words() {
    const past = HISTORY[state.history];
    const left = state.length - state.passed;
    const set = charges(state.length);
    const earned = set.filter(charge => state.passed >= charge.at);
    const embers = past.banked + earned.reduce((sum, charge) => sum + charge.drop, 0);
    const streak = state.history === 'later' || state.passed ? past.streak : 0;
    let [title, sub, go, next] = ['Your fuse is burning.',
        `${left * XP} XP to the big bomb.`, 'Continue learning', 'Up next: Loops and lists quiz'];
    if (state.spent) {
        [title, sub, go, next] = ['You’ve burned through it all.',
            'There is nothing left to pass in your courses. Pick a new course and a fresh fuse appears.', 'Find a course', ''];
    } else if (!left) {
        [title, sub, go, next] = ['Boom. Fuse burned.',
            `You set off all three bombs. A new fuse arrives on ${past.next} 1.`, 'Keep learning', ''];
    } else if (!state.passed) {
        [title, sub] = ['Light the fuse.', `Earn your first XP to set ${past.month}’s fuse burning.`];
    }
    home.classList.toggle('is-spent', state.spent);
    Object.assign(home.dataset, { goal: state.length * XP, award: XP, marks: set.map(charge => charge.at * XP).join(),
        drops: DROPS.join(),
        boom1: `Boom! Your ${past.month} badge is now Bronze. +${DROPS[0]} Embers banked.`,
        boom2: `Boom! Your ${past.month} badge is now Silver. +${DROPS[1]} Embers banked.`,
        boom3: `Boom! Gold ${past.month} badge and +${DROPS[2]} Embers banked.` });
    text('eyebrow').textContent = `${past.month} fuse · ends in 5 days 2 hours`;
    text('title').textContent = title;
    text('sub').textContent = sub;
    text('go').textContent = go;
    text('next').textContent = next;
    text('summary').textContent = `${state.passed * XP} of ${state.length * XP} XP burned this month`;
    text('legend').textContent = `The mini bombs drop ${DROPS[0]} and ${DROPS[1]} Embers; the big bomb drops ${DROPS[2]}. ` +
        `Everyone’s fuse is the same length: ${state.length * XP} XP a month. Activities you pass or are graded on burn the fuse.`;
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
        item.dataset.grade = medal || 'missed';
        item.querySelector('.fuse-medal__disc').textContent = month;
        item.querySelector('.fuse-medal__grade').textContent =
            { '': 'No bomb', current: 'This month', upcoming: '' }[medal] ?? medal[0].toUpperCase() + medal.slice(1);
        return item;
    }));
}

/** Read the preview controls and redraw without any burn. */
function reset() {
    state.length = Number(controls.elements.fuse.value);
    state.passed = Math.min(Number(controls.elements.passed.value), state.length);
    state.history = controls.elements.history.value;
    state.spent = controls.elements.spent.checked;
    controls.elements.passed.max = state.length;
    controls.elements.passed.value = state.passed;
    controls.elements.shown.value = `${state.passed * XP} of ${state.length * XP} XP`;
    words();
    control.show(state.passed * XP);
}

for (let length = 3; length <= 10; length++) {
    controls.elements.fuse.add(new Option(`${length * XP} XP`, length, false, length === state.length));
}
controls.elements.passed.max = state.length;
controls.elements.passed.value = state.passed;
words();
control = window.igniteFuse(home);
controls.addEventListener('input', reset);
controls.elements.pass.addEventListener('click', () => {
    if (state.passed >= state.length || state.spent) {
        return;
    }
    state.passed++;
    controls.elements.passed.value = state.passed;
    controls.elements.shown.value = `${state.passed * XP} of ${state.length * XP} XP`;
    control.burn(state.passed * XP, words);
});
reset();
