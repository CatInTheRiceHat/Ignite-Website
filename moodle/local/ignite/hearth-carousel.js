// Moodle loads this script in the footer, after the chooser has rendered.
for (const carousel of document.querySelectorAll('.hearth-carousel')) {
    const viewport = carousel.querySelector('.hearth-carousel__viewport');
    const slides = Array.from(viewport.children);
    const controls = carousel.querySelector('.hearth-carousel__controls');
    const [previous, next] = controls.querySelectorAll('button');
    const status = carousel.querySelector('[role="status"]');
    let activeIndex = -1;

    const rtl = getComputedStyle(viewport).direction === 'rtl';
    // Measure the card positions so navigation includes the gap and follows viewport resizes.
    const offset = slide => slide.offsetLeft - slides[0].offsetLeft;
    function update() {
        const index = slides.reduce((nearest, slide, i) =>
            Math.abs(offset(slide) - viewport.scrollLeft) < Math.abs(offset(slides[nearest]) - viewport.scrollLeft)
                ? i : nearest, 0);
        if (activeIndex === index) {
            return;
        }
        activeIndex = index;
        slides.forEach((slide, i) => {
            slide.inert = i !== index;
            slide.setAttribute('aria-hidden', String(i !== index));
        });
        setControl(previous, slides[index - 1]?.dataset.previous);
        setControl(next, slides[index + 1]?.dataset.next);
        const name = slides[index].querySelector('h3').textContent;
        if (status.textContent !== name) {
            status.textContent = name;
        }
    }
    function setControl(button, label) {
        button.disabled = !label;
        button.querySelector('.hearth-carousel__label').textContent = label || button.dataset.default;
    }
    function move(step) {
        const index = activeIndex + step;
        if (index < 0 || index >= slides.length) {
            return;
        }
        viewport.focus({ preventScroll: true });
        viewport.scrollLeft = offset(slides[index]);
        update();
    }
    controls.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button) {
            move(Number(button.dataset.step));
        }
    });
    carousel.addEventListener('keydown', event => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
                !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            return;
        }
        event.preventDefault();
        if (!event.repeat) {
            move((event.key === 'ArrowRight') !== rtl ? 1 : -1);
        }
    });
    function reset() {
        viewport.scrollLeft = 0;
        update();
    }
    viewport.addEventListener('scroll', update, { passive: true });
    window.addEventListener('pageshow', reset);
    reset();
    controls.hidden = slides.length < 2;
}
