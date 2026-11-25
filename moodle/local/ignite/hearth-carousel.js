// Moodle loads this script in the footer, after the chooser has rendered.
for (const carousel of document.querySelectorAll('.hearth-carousel')) {
    const viewport = carousel.querySelector('.hearth-carousel__viewport');
    const slides = Array.from(viewport.children);
    const controls = carousel.querySelector('.hearth-carousel__controls');
    const [previous, next] = controls.querySelectorAll('button');
    const status = carousel.querySelector('[role="status"]');
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    let activeIndex = 0;

    function show(index) {
        activeIndex = index;
        slides.forEach((slide, i) => { slide.hidden = i !== index; });
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
        show(index);
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
    let touchStart;
    viewport.addEventListener('touchstart', event => {
        touchStart = event.touches.length === 1 ? event.touches[0] : null;
    }, { passive: true });
    viewport.addEventListener('touchend', event => {
        if (touchStart && event.touches.length === 0) {
            const end = event.changedTouches[0];
            const dx = end.clientX - touchStart.clientX;
            const dy = end.clientY - touchStart.clientY;
            if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
                move((dx < 0) !== rtl ? 1 : -1);
            }
        }
        touchStart = null;
    });
    viewport.addEventListener('touchcancel', () => { touchStart = null; });
    window.addEventListener('pageshow', () => show(0));
    show(0);
    controls.hidden = slides.length < 2;
}
