// Moodle loads this script in the footer, after the chooser has rendered.
for (const carousel of document.querySelectorAll('.hearth-carousel')) {
    const viewport = carousel.querySelector('.hearth-carousel__viewport');
    const slides = Array.from(viewport.children);
    const controls = carousel.querySelector('.hearth-carousel__controls');
    const [previous, next] = controls.querySelectorAll('button');
    const status = carousel.querySelector('[role="status"]');
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    let activeIndex = 0;

    // The chosen card sits in front; the others wait behind it, one on each side.
    function place(slide, position) {
        const sides = ['previous', 'next'];
        slide.classList.toggle('hearth-slide--crossing', position !== slide.dataset.position &&
            sides.includes(position) && sides.includes(slide.dataset.position));
        slide.dataset.position = position;
        // Only the chosen card can be read or joined; the others are chosen by clicking the card itself.
        if (position === 'active') {
            slide.removeAttribute('aria-hidden');
        } else {
            slide.setAttribute('aria-hidden', 'true');
        }
        slide.firstElementChild.inert = position !== 'active';
    }
    function show(index) {
        const count = slides.length;
        activeIndex = index;
        slides.forEach((slide, i) => {
            const offset = (i - index + count) % count;
            place(slide, offset === 0 ? 'active' : offset === 1 ? 'next' : offset === count - 1 ? 'previous' : 'away');
        });
        setControl(previous, slides[(index - 1 + count) % count].dataset.previous);
        setControl(next, slides[(index + 1) % count].dataset.next);
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
        viewport.focus({ preventScroll: true });
        show((activeIndex + step + slides.length) % slides.length);
    }
    controls.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button) {
            move(Number(button.dataset.step));
        }
    });
    // A waiting card comes forward when it is chosen directly.
    viewport.addEventListener('click', event => {
        const index = slides.indexOf(event.target.closest('.hearth-slide'));
        if (index >= 0 && index !== activeIndex) {
            viewport.focus({ preventScroll: true });
            show(index);
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
    // Trackpads emit a burst of wheel events, including momentum after the gesture ends.
    let lastWheelTime = -Infinity;
    let wheelDistance = 0;
    let wheelMoved = false;
    viewport.addEventListener('wheel', event => {
        const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
        if (event.ctrlKey || !delta || (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY))) {
            return;
        }
        event.preventDefault();
        if (event.timeStamp - lastWheelTime > 180) {
            wheelDistance = 0;
            wheelMoved = false;
        }
        lastWheelTime = event.timeStamp;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
        wheelDistance += delta * unit;
        if (!wheelMoved && Math.abs(wheelDistance) >= 40) {
            wheelMoved = true;
            move((wheelDistance > 0) !== rtl ? 1 : -1);
        }
    }, { passive: false });
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
    carousel.classList.add('hearth-carousel--coverflow');
    show(0);
    controls.hidden = slides.length < 2;
}
