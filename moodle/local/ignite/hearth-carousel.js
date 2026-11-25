// Moodle loads this script in the footer, after the chooser has rendered.
for (const carousel of document.querySelectorAll('.hearth-carousel')) {
    const viewport = carousel.querySelector('.hearth-carousel__viewport');
    const slides = Array.from(viewport.children);
    const controls = carousel.querySelector('.hearth-carousel__controls');
    const [previous, next] = controls.querySelectorAll('button');
    const status = carousel.querySelector('[role="status"]');

    // Each slide fills one viewport. Its own scrolling area keeps long copy and the Join action together.
    const position = () => Math.min(slides.length - 1, Math.max(0, Math.round(viewport.scrollTop / viewport.clientHeight)));
    function update() {
        const index = position();
        slides.forEach((slide, i) => {
            slide.inert = i !== index;
            slide.setAttribute('aria-hidden', String(i !== index));
        });
        previous.disabled = index === 0;
        next.disabled = index === slides.length - 1;
        const name = slides[index].querySelector('h3').textContent;
        if (status.textContent !== name) {
            status.textContent = name;
        }
    }
    function move(step) {
        const index = position() + step;
        if (index < 0 || index >= slides.length) {
            return;
        }
        viewport.focus({ preventScroll: true });
        slides[index].scrollTop = 0;
        viewport.scrollTop = index * viewport.clientHeight;
        update();
    }
    controls.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button) {
            move(Number(button.dataset.step));
        }
    });
    document.addEventListener('keydown', event => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
                !['ArrowUp', 'ArrowDown'].includes(event.key)) {
            return;
        }
        if (!carousel.contains(event.target) && !(event.target === document.body &&
                carousel.closest('.ignite-hearths'))) {
            return;
        }
        event.preventDefault();
        const slide = slides[position()];
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const remaining = step > 0 ? slide.scrollHeight - slide.clientHeight - slide.scrollTop : slide.scrollTop;
        if (remaining > 1) {
            slide.scrollTop += step * Math.min(remaining, Math.max(40, slide.clientHeight / 2));
        } else if (!event.repeat) {
            move(step);
        }
    });
    function reset() {
        viewport.scrollTop = 0;
        for (const slide of slides) {
            slide.scrollTop = 0;
        }
        update();
    }
    viewport.addEventListener('scroll', update, { passive: true });
    window.addEventListener('pageshow', reset);
    reset();
    controls.hidden = slides.length < 2;
}
