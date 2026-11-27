// Fuse home: draws a month's rope and bombs, and burns the rope on from where the learner last saw it.
(function() {
    const NS = 'http://www.w3.org/2000/svg';
    // The Ember icon, on a 24 unit square: a flame and its core.
    const EMBER = ['M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2-7 1.5 1 2 2.5 2 4 1.5-2 2-5 2-9Z',
        'M12 12c.7 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.5.8-2.3 1-3.5.8.5 1 1.2 1 2 .7-1 1-2.5 1-4Z'];
    const GRADES = ['bronze', 'silver', 'gold'];
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    /**
     * Take charge of one fuse. Its length, bombs and messages are read from the element's data attributes
     * each time it is laid out, and all amounts are in XP.
     */
    function fuse(home) {
        const svg = home.querySelector('.fuse__svg');
        const toast = home.querySelector('.fuse__toast');
        let scene; // The drawn fuse: its rope, flame and bombs.
        let goal;
        let shown = 0; // How far along the fuse the flame is drawn.
        let burning = 0;

        /** Draw the fuse to fit its box: one straight, unbroken rope ending at the big bomb, with the bombs sitting on it. */
        function layout() {
            const width = Math.max(300, Math.round(svg.parentElement.clientWidth));
            const wide = width >= 640;
            const [left, right, level] = wide ? [30, width - 70, 100] : [14, width - 40, 86];
            const total = right - left;
            const drops = home.dataset.drops.split(',').map(Number);
            goal = Number(home.dataset.goal);
            svg.replaceChildren();
            svg.setAttribute('viewBox', `0 0 ${width} ${wide ? 196 : 160}`);
            const d = `M${left} ${level}H${right}`;
            draw(svg, 'path', { class: 'fuse__rope', d });
            draw(svg, 'path', { class: 'fuse__sheen', d });
            const ash = draw(svg, 'path', { class: 'fuse__ash', d });
            const smoulder = draw(svg, 'path', { class: 'fuse__smoulder', d });

            // The flame is drawn before the bombs, so it burns in under a bomb it is about to reach.
            const flame = draw(svg, 'g', { class: 'fuse__flame' });
            // The glow fades out through a gradient of its own, which every browser draws the same way.
            const glow = draw(draw(svg, 'defs'), 'radialGradient', { id: 'fuse-glow-' + Math.random().toString(36).slice(2) });
            draw(glow, 'stop', { offset: '0', 'stop-color': '#f07b2a', 'stop-opacity': .75 });
            draw(glow, 'stop', { offset: '1', 'stop-color': '#f07b2a', 'stop-opacity': 0 });
            draw(flame, 'circle', { class: 'fuse__glow', r: 46, fill: `url(#${glow.id})` });
            [-8, 3, 9].forEach((drift, index) => draw(flame, 'circle', { class: 'fuse__spark', r: 2.2,
                style: `--dx: ${drift}px; animation-delay: ${index * -.37}s` }));
            draw(flame, 'path', { class: 'fuse__flame-shape', d: 'M0 7C-13 7-17-6-9-17-6-11-3-14 0-33 7-20 17-11 13 0 11 7 6 7 0 7Z' });
            draw(flame, 'path', { class: 'fuse__flame-shape fuse__flame-core', d: 'M0 6C-7 6-9-1-4-9-3-6-1-7 0-17 4-10 9-4 7 1 6 6 3 6 0 6Z' });

            const bombs = home.dataset.marks.split(',').map(Number).map((at, index) => {
                const big = index === 2;
                const radius = (big ? 2 : 1) * (wide ? 20 : 13);
                const along = total * at / goal;
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
                // The Embers it drops are written on the bomb, and on the star it leaves behind.
                draw(body, 'text', { class: 'fuse__count', 'font-size': radius * .8 }).textContent = drops[index];
                const medal = draw(group, 'g', { class: 'fuse__medal', 'data-grade': GRADES[index] });
                draw(medal, 'polygon', { class: 'fuse__burst', points: star(12, radius * 1.5, radius * 1.12) });
                draw(medal, 'circle', { r: radius * .92 });
                draw(medal, 'polygon', { class: 'fuse__star', points: star(5, radius * .84, radius * .44) });
                draw(medal, 'text', { class: 'fuse__count', 'font-size': radius * .6 }).textContent = drops[index];
                // What the bomb drops: an Ember icon and how many.
                const label = draw(group, 'g', { class: 'fuse__label', transform: `translate(0 ${radius * 1.5 + 18})` });
                const amount = '+' + drops[index];
                // The icon and the number sit side by side, centred as a pair: about 10 units for each character.
                const start = -(19 + amount.length * 10) / 2;
                const icon = draw(label, 'g', { transform: `translate(${start} -14) scale(.7)` });
                draw(icon, 'path', { class: 'fuse__coin', d: EMBER[0] });
                draw(icon, 'path', { class: 'fuse__coin-core', d: EMBER[1] });
                draw(label, 'text', { x: start + 19 }).textContent = amount;
                return { at, big, group, centre, radius, along, says: home.dataset['boom' + (index + 1)] };
            });
            scene = { left, level, ash, smoulder, bombs, flame, total, fx: draw(svg, 'g') };
            paint(shown);
        }

        /** Show the fuse burnt as far as the given XP. */
        function paint(value) {
            const { left, level, ash, smoulder, bombs, flame, total } = scene;
            let burnt = total * Math.min(value, goal) / goal;
            // Just past a mini bomb that has gone off, the flame stands clear of the badge it left on the rope.
            const cleared = bombs.find(bomb => !bomb.big && value >= bomb.at && burnt - bomb.along < bomb.radius + 10);
            if (cleared) {
                burnt = Math.min(total, cleared.along + cleared.radius + 10);
            }
            const alight = value > 0 && value < goal;
            ash.style.strokeDasharray = `${burnt} ${total}`;
            ash.style.visibility = burnt ? '' : 'hidden';
            // A short glowing stretch just behind the flame.
            smoulder.style.strokeDasharray = `${Math.min(30, burnt)} ${total}`;
            smoulder.style.strokeDashoffset = -Math.max(0, burnt - 30);
            smoulder.style.visibility = alight ? '' : 'hidden';
            flame.setAttribute('transform', `translate(${left + burnt} ${level})`);
            flame.classList.toggle('is-out', !alight);
            bombs.forEach(bomb => bomb.group.classList.toggle('is-exploded', value >= bomb.at));
        }

        /** A bomb going off: say what it gave, then flash, throw sparks and, for the big one, shake the fuse. */
        function boom(bomb) {
            toast.textContent = bomb.says;
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

        /** Burn the fuse on to newly earned XP, setting off any bomb it reaches, then call back. */
        function burn(target, done) {
            cancelAnimationFrame(burning);
            const from = shown;
            const start = performance.now();
            // About a second for each award, but never a long wait for someone who earned a lot.
            const time = Math.min(2600, 900 * Math.abs(target - from) / Number(home.dataset.award));
            const step = now => {
                const progress = calm || !time ? 1 : Math.min(1, (now - start) / time);
                const next = from + (target - from) * progress;
                scene.bombs.filter(bomb => shown < bomb.at && next >= bomb.at).forEach(boom);
                shown = next;
                paint(shown);
                if (progress < 1) {
                    burning = requestAnimationFrame(step);
                } else if (done) {
                    done();
                }
            };
            step(start);
        }

        /** Redraw at the given XP with no burn. */
        function show(value) {
            cancelAnimationFrame(burning);
            shown = value;
            toast.textContent = '';
            layout();
        }

        // Redraw when the box changes width; the first report repeats the size already drawn.
        let drawn = svg.parentElement.clientWidth;
        new ResizeObserver(([entry]) => {
            if (scene && Math.round(entry.contentRect.width) !== drawn) {
                drawn = Math.round(entry.contentRect.width);
                layout();
            }
        }).observe(svg.parentElement);
        return { show, burn };
    }
    // The preview page drives a fuse by hand.
    window.igniteFuse = fuse;

    // On a learner's Home, pick up where they last saw this month's fuse on this device.
    document.querySelectorAll('.fuse-home[data-key]').forEach(home => {
        const xp = Number(home.dataset.xp);
        const slot = 'ignite-fuse-' + home.dataset.key;
        let seen = xp;
        try {
            seen = Math.min(xp, Number(localStorage.getItem(slot)) || 0);
            localStorage.setItem(slot, xp);
        } catch (error) {
            // Without storage there is nothing to compare with, so the fuse is simply shown as it stands.
        }
        const control = fuse(home);
        control.show(seen);
        if (seen < xp) {
            control.burn(xp);
        }
    });
})();
