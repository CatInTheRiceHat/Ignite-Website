import { expect, test } from '@playwright/test';

const carousels = [
  { path: '/', first: 'All Students', last: 'Curious Students', image: '**/mascots/Curious.png', count: 3 },
  { path: '/hiring', first: 'Course Developer', last: 'Miscellaneous Projects', image: '**/mascots/Miscellaneous.png', count: 5 },
];

for (const carousel of carousels) {
  test(`${carousel.path} keeps the current image visible while another image loads`, async ({ page }) => {
    let release = () => {};
    const ready = new Promise<void>(resolve => { release = resolve; });
    await page.route(carousel.image, async route => {
      await ready;
      await route.continue();
    });
    try {
      await page.goto(carousel.path, { waitUntil: 'domcontentloaded' });
      const first = page.getByRole('button', { name: new RegExp(`^${carousel.first}`) });
      await first.scrollIntoViewIfNeeded();
      const current = page.getByRole('img', { name: carousel.first, exact: true });
      await expect(current).toHaveCSS('opacity', '1');
      await page.getByRole('button', { name: new RegExp(`^${carousel.last}`) }).evaluate(button => (button as HTMLButtonElement).click());
      await expect(current).toHaveCSS('opacity', '1');
      await expect(page.getByRole('img', { name: carousel.last, exact: true })).toHaveCount(0);
      release();
      await expect(page.getByRole('img', { name: carousel.last, exact: true })).toHaveCSS('opacity', '1');
      await expect(current).toHaveCount(0);
    } finally {
      release();
    }
  });

  test(`${carousel.path} handles rapid switching without stale images or scroll jumps`, async ({ page }) => {
    await page.goto(carousel.path);
    await page.evaluate(() => document.fonts.ready);
    const first = page.getByRole('button', { name: new RegExp(`^${carousel.first}`) });
    const row = first.locator('xpath=../../..');
    // Hiring has a heading and an expanded-details wrapper around each role button.
    const carouselRoot = carousel.path === '/hiring' ? row.locator('..') : row;
    const images = carouselRoot.locator('img');
    await expect(images).toHaveCount(carousel.count);
    await images.evaluateAll(elements => Promise.all(elements.map(element => (element as HTMLImageElement).decode())));
    await first.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => window.scrollY);
    const stage = images.first().locator('..');
    const before = await stage.boundingBox();
    const dots = carouselRoot.getByRole('button', { name: /^Go to slide/ });
    for (const index of [1, 0, carousel.count - 1, 1, 0, carousel.count - 1]) {
      await dots.nth(index).evaluate(button => (button as HTMLButtonElement).click());
    }
    await expect(page.getByRole('img', { name: carousel.last, exact: true })).toHaveCSS('opacity', '1');
    await expect(images).toHaveCount(carousel.count);
    await expect(carouselRoot.getByRole('img')).toHaveCount(1);
    await expect.poll(() => images.evaluateAll(elements => elements.filter(element => getComputedStyle(element).opacity !== '0').length)).toBe(1);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
    const after = await stage.boundingBox();
    expect(after!.height).toBe(before!.height);
    expect(after!.width).toBe(before!.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`${carousel.path} supports keyboard selection with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(carousel.path);
    const dot = page.getByRole('button', { name: `Go to slide ${carousel.count}`, exact: true });
    await dot.focus();
    await page.keyboard.press('Space');
    await expect(dot).toHaveAttribute('aria-pressed', 'true');
    const image = page.getByRole('img', { name: carousel.last, exact: true });
    await expect(image).toHaveCSS('opacity', '1');
    await expect(image).toHaveCSS('transition-property', 'none');
  });
}
