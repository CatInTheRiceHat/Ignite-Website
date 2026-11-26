// Campfire home preview. Sample numbers stand in for what the plugin reports for the signed-in member.
const ART = '../../local/ignite/pix/campfire/';
const TEAMS = {
    forgelings: { name: 'Forgelings', line: 'The builders of Ignite.', flame: [550, 760] },
    candlelings: { name: 'Candlelings', line: 'The curious minds of Ignite.', flame: [512, 760] },
    lanternlings: { name: 'Lanternlings', line: 'The ones who bring people together.', flame: [527, 760] },
};
const ORDER = Object.keys(TEAMS);
// Team XP this month for: the member's team, the team to its right, the team to its left, and the member.
const SITUATIONS = {
    leading: { yours: 412, next: 305.5, previous: 148, own: 36 },
    behind: { yours: 148, next: 412, previous: 305.5, own: 12 },
    tie: { yours: 260, next: 260, previous: 90, own: 20 },
    empty: { yours: 0, next: 0, previous: 0, own: 0 },
};
const ZONE = 'America/Los_Angeles';
const home = document.querySelector('.camp-home');
const list = home.querySelector('.camp-fires__list');
const text = name => home.querySelector(`[data-text="${name}"]`);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ordinal = rank => ['1st', '2nd', '3rd'][rank - 1];

/** Competition ranking, as the plugin does it: tied teams share a place. */
function ranks(scores) {
    return scores.map(score => 1 + scores.filter(other => other > score).length);
}

/** Count a figure up once, so the total reads as something the team built. */
function countTo(element, value) {
    const show = number => { element.textContent = Number.isInteger(value) ? Math.round(number) : number.toFixed(1); };
    if (calm || !value) {
        show(value);
        return;
    }
    const start = performance.now();
    (function step(now) {
        const progress = Math.min(1, (now - start) / 900);
        show(value * (1 - (1 - progress) ** 3));
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            show(value);
        }
    })(start);
}

/** Each month is one Heat. Names the current one and the time left until it ends in the Campfire's own time zone. */
function countdown() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hourCycle: 'h23',
        year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(new Date()).map(part => [part.type, Number(part.value)]));
    const days = new Date(parts.year, parts.month, 0).getDate() - parts.day;
    const minutes = days * 1440 + (1440 - parts.hour * 60 - parts.minute);
    const unit = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
    const [d, h, m] = [Math.floor(minutes / 1440), Math.floor(minutes % 1440 / 60), minutes % 60];
    text('countdown').textContent = d ? `${unit(d, 'day')} ${unit(h, 'hour')}` : h ? `${unit(h, 'hour')} ${unit(m, 'minute')}` : unit(m, 'minute');
    const month = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, month: 'long' }).format(new Date());
    text('month').textContent = month + '’s Fires';
    text('heat').textContent = month;
}

function render(team, situation) {
    const sample = SITUATIONS[situation];
    const index = ORDER.indexOf(team);
    // Yours burns in the middle, with the other two on the sides they held in the chooser.
    const fires = [
        { team: ORDER[(index + 2) % 3], xp: sample.previous },
        { team, xp: sample.yours, yours: true },
        { team: ORDER[(index + 1) % 3], xp: sample.next },
    ];
    const places = ranks(fires.map(fire => fire.xp));
    const leader = Math.max(...fires.map(fire => fire.xp));
    const place = fire => (places.filter(other => other === places[fires.indexOf(fire)]).length > 1 ? 'Tied ' : '') +
        ordinal(places[fires.indexOf(fire)]);
    const mine = fires[1];
    const { name, line } = TEAMS[team];

    home.dataset.team = team;
    for (const image of home.querySelectorAll('[data-art]')) {
        image.src = `${ART}${team}-${image.dataset.art}.${image.dataset.art === 'large' ? 'jpg' : 'png'}`;
    }
    text('name').textContent = name;
    text('name').style.setProperty('--letters', name.length);
    text('line').textContent = line;
    countTo(text('teamxp'), mine.xp);
    text('place').textContent = leader ? place(mine) : 'Unlit';
    text('placelabel').textContent = leader ? 'place this month' : 'until the first Team XP';

    list.replaceChildren(...fires.map(fire => {
        const item = document.getElementById('fire').content.firstElementChild.cloneNode(true);
        item.dataset.team = fire.team;
        item.classList.toggle('fire--yours', Boolean(fire.yours));
        const flame = item.querySelector('.fire__flame');
        [flame.width, flame.height] = TEAMS[fire.team].flame;
        flame.src = `art/flame-${fire.team}.png`;
        item.querySelector('.fire__name').textContent = TEAMS[fire.team].name;
        const score = item.querySelector('.fire__score');
        if (leader) {
            score.innerHTML = `<b>${place(fire)}</b> <span><span class="fire__with">with </span><i></i> Team XP</span>`;
            score.querySelector('i').style.fontStyle = 'normal';
            countTo(score.querySelector('i'), fire.xp);
        } else {
            score.textContent = 'Not lit yet';
        }
        // The leader's flame is full size; any Team XP at all keeps a small flame alight.
        item.dataset.size = fire.xp ? (.4 + .6 * fire.xp / leader).toFixed(3) : 0;
        return item;
    }));
    // Let the unlit fires paint first, so each flame grows up from its logs.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        for (const item of list.children) {
            item.style.setProperty('--size', item.dataset.size);
        }
    }));

    const share = mine.xp ? Math.round(sample.own / mine.xp * 100) : 0;
    text('contribution').innerHTML = sample.own
        ? `You’ve added <b>${sample.own} Team XP</b> this month. That’s ${share ? `${share}%` : 'under 1%'} of the ${name}’ fire.`
        : leader
            ? `You haven’t added Team XP yet this month. Finish an activity and the ${name}’ fire grows.`
            : `No fires are lit yet this month. Finish an activity to light the ${name}’ fire first.`;
}

const controls = document.querySelector('.preview-controls');
const current = () => render(controls.elements.team.value, controls.elements.situation.value);
const asked = new URLSearchParams(location.search);
for (const field of ['team', 'situation']) {
    if ([...controls.elements[field].options].some(option => option.value === asked.get(field))) {
        controls.elements[field].value = asked.get(field);
    }
}
controls.addEventListener('change', current);
// Refreshed twice a minute, so the time left stays current and the name changes when a new month's Heat begins.
countdown();
setInterval(countdown, 30000);
current();
