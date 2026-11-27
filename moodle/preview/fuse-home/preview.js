// Fuse home preview. Sample numbers stand in for what the plugin reports for the signed-in learner;
// the fuse itself is drawn by the plugin's own fuse-home.js.
const XP = 20; // XP for each graded activity.
const DROPS = [20, 30, 50]; // Embers dropped by the first mini bomb, the second, and the big one.
const BLAST = 150; // Bonus XP the big bomb blasts onto the learner's team.
const GRADES = ['bronze', 'silver', 'gold'];
const TEAMS = { forgelings: 'Forgelings', candlelings: 'Candlelings', lanternlings: 'Lanternlings', '': '' };
// Earlier months: the grade each one ended on (empty for a month with no bomb), and the Embers they banked.
const HISTORY = {
    first: { month: 'December', next: 'January', shelf: [], upcoming: ['Jan', 'Feb', 'Mar', 'Apr'], banked: 0, streak: 1 },
    later: { month: 'March', next: 'April', shelf: [['Dec', 'gold'], ['Jan', 'silver'], ['Feb', '']], upcoming: ['Apr', 'May'], banked: 150, streak: 3 },
};
const home = document.querySelector('.fuse-home');
const controls = document.querySelector('.preview-controls');
const text = name => document.querySelector(`[data-text="${name}"]`);
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
// The fuse's length and the XP earned so far this month.
const state = { goal: 250, xp: 100, team: 'forgelings', history: 'first', spent: false };
let control;

/** The XP at which each bomb goes off: the first award, about halfway, and the goal. As the plugin's fuse::marks(). */
function marks(goal) {
    const steps = Math.max(3, Math.ceil(goal / XP));
    return [XP, Math.floor((steps + 1) / 2) * XP, Math.max(goal, 3 * XP)];
}

/** Everything written around the fuse, and the numbers the fuse is drawn from. */
function words() {
    const past = HISTORY[state.history];
    const set = marks(state.goal);
    const burned = Math.min(state.xp, state.goal);
    const earned = set.filter(mark => state.xp >= mark).length;
    const embers = past.banked + DROPS.slice(0, earned).reduce((sum, drop) => sum + drop, 0);
    const streak = state.history === 'later' || state.xp ? past.streak : 0;
    // A learner on a team is told what their big bomb adds to its fire.
    const team = TEAMS[state.team];
    const blast = BLAST;
    let [title, sub, go, next] = ['Your fuse is burning.',
        `${state.goal - burned} XP to the big bomb.`, 'Continue learning', 'Up next: Loops and lists quiz'];
    if (state.spent) {
        [title, sub, go, next] = ['You’ve burned through it all.',
            'There is nothing left to pass in your courses. Pick a new course and a fresh fuse appears.', 'Find a course', ''];
    } else if (burned === state.goal) {
        [title, sub, go, next] = ['Boom. Fuse burned.',
            `You set off all three bombs${team ? ` and blasted +${blast} XP onto the ${team}’ fire` : ''}. A new fuse arrives on ${past.next} 1.`,
            'Keep learning', ''];
    } else if (!state.xp) {
        [title, sub] = ['Light the fuse.', `Earn your first XP to set ${past.month}’s fuse burning.`];
    }
    home.classList.toggle('is-spent', state.spent);
    Object.assign(home.dataset, { goal: state.goal, award: XP, marks: set.join(), drops: DROPS.join(),
        boom1: `Boom! Your ${past.month} badge is now Bronze. +${DROPS[0]} Embers banked.`,
        boom2: `Boom! Your ${past.month} badge is now Silver. +${DROPS[1]} Embers banked.`,
        boom3: team ? `Boom! Gold ${past.month} badge, +${DROPS[2]} Embers, and +${blast} XP blasted onto the ${team}’ fire.`
            : `Boom! Gold ${past.month} badge and +${DROPS[2]} Embers banked.` });
    text('eyebrow').textContent = `${past.month} fuse · ends in 5 days 2 hours`;
    text('title').textContent = title;
    text('sub').textContent = sub;
    text('go').textContent = go;
    text('next').textContent = next;
    text('summary').textContent = `${burned} of ${state.goal} XP burned this month`;
    text('legend').textContent = `The mini bombs drop ${DROPS[0]} and ${DROPS[1]} Embers; the big bomb drops ${DROPS[2]}` +
        `${team ? ` and blasts +${blast} XP onto the ${team}’ fire` : ''}. ` +
        `Everyone’s fuse is the same length: ${state.goal} XP a month. Activities you pass or are graded on burn the fuse.`;
    text('streak').textContent = streak ? `${streak}-week streak` : 'No streak yet';
    text('streaknote').textContent = state.spent ? 'Paused until you have a fuse again'
        : streak ? 'Earn XP by Sunday to keep it' : 'Earn XP this week to start one';
    text('embers').textContent = plural(embers, 'Ember');
    // The Shop preview shows the same sample balance.
    home.querySelector('a.fuse-chip').href = `../shop/index.html?embers=${embers}`;

    // One badge a month in its best grade so far, then the months still to come.
    const grade = earned ? GRADES[earned - 1] : 'current';
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

/** XP arrives one graded activity at a time, so a fuse is finished by the award that reaches or passes its length. */
const most = () => Math.ceil(state.goal / XP) * XP;

/** Read the preview controls and redraw without any burn. */
function reset() {
    state.goal = Number(controls.elements.fuse.value);
    state.xp = Math.min(Number(controls.elements.passed.value), most());
    state.history = controls.elements.history.value;
    state.team = controls.elements.team.value;
    state.spent = controls.elements.spent.checked;
    controls.elements.passed.max = most();
    controls.elements.passed.value = state.xp;
    controls.elements.shown.value = `${state.xp} XP earned`;
    words();
    control.show(state.xp);
}

for (const goal of [60, 100, 140, 200, 240, 250, 300]) {
    controls.elements.fuse.add(new Option(`${goal} XP`, goal, false, goal === state.goal));
}
Object.assign(controls.elements.passed, { step: XP, max: most(), value: state.xp });
words();
control = window.igniteFuse(home);
controls.addEventListener('input', reset);
controls.elements.pass.addEventListener('click', () => {
    if (state.xp >= state.goal || state.spent) {
        return;
    }
    state.xp += XP;
    controls.elements.passed.value = state.xp;
    controls.elements.shown.value = `${state.xp} XP earned`;
    control.burn(state.xp, words);
});
reset();
