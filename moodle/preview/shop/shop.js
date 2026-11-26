// Shop preview. The balance stands in for the embers the plugin will have recorded for the signed-in learner.
const PHOTOS = '../../local/ignite/pix/shop/';
// The prizes, cheapest tier first. Every prize in a tier costs the same number of embers.
const TIERS = [
    { name: 'Kindling', price: 5, prizes: [
        ['Fired Up Button Pin', 'button-pin', 'A glossy cream button of Sol. Stick it on your backpack so everyone knows you’re part of Ignite!'],
        ['Hot Takes Sticky Notes', 'sticky-notes', 'Cream sticky notes with Sol hanging out in the corner. Use them for reminders, to-do lists, or random doodles.'],
        ['Stick Around Sol Sticker', 'sticker', 'A die-cut Sol sticker with a white border. Put it on your laptop, water bottle, notebook, wherever.'],
    ] },
    { name: 'Flame', price: 10, prizes: [
        ['Sol-id Gold Pin', 'enamel-pin', 'A hard enamel pin with shiny gold lines around every layer of Sol’s flame.'],
        ['Sol on the Go Keychain', 'keychain', 'A clear acrylic Sol charm on a gold swivel clasp. Clip it to your keys or bag and show everyone you’re cooler than school.'],
        ['Ink-ferno Pen', 'pen', 'An amber click pen with a cream grip and a tiny Sol charm swinging from the clip. This pen will get you 100s on all your tests (no guarantees).'],
    ] },
    { name: 'Blaze', price: 25, prizes: [
        ['Matchbox Pencil Pouch', 'pencil-pouch', 'A cream canvas pouch with an orange zipper and the Ignite logo in the corner. Holds all your pens, highlighters, and that one eraser you use for fortune-telling.'],
        ['Burning Questions Notebook', 'notebook', 'A cream leatherette notebook with the Ignite logo and an orange elastic band. For class notes, project plans, and all your burning questions.'],
        ['Sol Mate', 'sol-mate', 'A soft, palm-sized Sol plush with embroidered eyes and a silver bead chain. Take him everywhere.'],
    ] },
    { name: 'Bonfire', price: 50, prizes: [
        ['Carry the Torch Tote', 'tote', 'A cream canvas tote with orange handles and the full Ignite logo. Carry it by hand or on your shoulder. You earned this one.'],
    ] },
];
const controls = document.querySelector('.preview-controls');
const copy = id => document.getElementById(id).content.firstElementChild.cloneNode(true);

function show() {
    const embers = Number(controls.elements.embers.value);
    controls.elements.shown.value = embers;
    document.querySelector('[data-text="balance"]').textContent = embers;
    document.querySelector('[data-text="saved"]').textContent = embers === 1 ? 'Ember saved' : 'Embers saved';
    document.querySelector('.ignite-shop__tiers').replaceChildren(...TIERS.map(tier => {
        const section = copy('tier');
        const several = tier.prizes.length > 1;
        section.querySelector('h2').textContent = tier.name;
        section.querySelector('.ignite-shop__price span').textContent = `${tier.price} Embers${several ? ' each' : ''}`;
        Object.assign(section.querySelector('progress'), { max: tier.price, value: Math.min(embers, tier.price) });
        section.querySelector('progress').setAttribute('aria-label', `Embers saved towards ${tier.name}`);
        section.querySelector('.ignite-shop__togo span').textContent = embers >= tier.price
            ? `You have enough for ${several ? 'one of these' : 'this'}!` : `${tier.price - embers} more to go`;
        section.querySelector('.ignite-shop__prizes').append(...tier.prizes.map(([name, photo, words]) => {
            const item = copy('prize');
            item.querySelector('img').src = `${PHOTOS}${photo}.jpg`;
            item.querySelector('h3').textContent = name;
            item.querySelector('p').textContent = words;
            return item;
        }));
        return section;
    }));
}

// Arriving from the Home preview carries its sample balance over.
controls.elements.embers.value = new URLSearchParams(location.search).get('embers') ?? 15;
controls.addEventListener('input', show);
show();
