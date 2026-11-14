import { expect, test, type Page } from '@playwright/test';

const placeholder = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#f07b2a"/></svg>';

async function holdRequest(page: Page, pattern: string) {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(pattern, async route => {
    await pending;
    await route.fallback();
  });
  return release;
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => route.request().resourceType() === 'image'
    ? route.fulfill({ contentType: 'image/svg+xml', body: placeholder })
    : route.continue());
  await page.route('**/api/status', route => route.fulfill({ json: { available: false } }));
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
});

test('waits for the hero, shows the GIF, then unlocks the site', async ({ page }) => {
  const release = await holdRequest(page, '**/backgrounds/Hero.jpg*');
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loader = page.getByRole('status', { name: 'Lighting things up…' });
    await expect(loader).toBeVisible();
    await expect(loader.locator('img[src$="Loading.gif"]')).toHaveCSS('opacity', '1');
    await expect(page.locator('body')).toHaveAttribute('data-page-loading', 'true');
    await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(loader.getByRole('button')).toHaveCount(0);
    await page.keyboard.press('Escape');
    // Wait beyond the fade duration to verify Escape cannot bypass readiness.
    await page.waitForTimeout(250);
    await expect(loader).toBeVisible();
    release();
    await expect(loader).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-page-loading');
    await expect(page.locator('[inert]')).toHaveCount(0);
    expect(await page.locator('body').evaluate(body => body.style.overflow)).toBe('');
    await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();
  } finally { release(); }
});

test('fast pages skip both the loader and its artwork downloads', async ({ page }) => {
  const artworkRequests: string[] = [];
  page.on('request', request => {
    if (/Loading\.gif|\/Fall\.jpg|\/Winter\.jpg|\/Spring\.jpg/.test(request.url())) artworkRequests.push(request.url());
  });
  await page.goto('/faq');
  // Observe beyond the overlay's delay so this also catches a stale show timer.
  await page.waitForTimeout(350);
  await expect(page.locator('.page-loader')).toHaveCount(0);
  expect(artworkRequests).toEqual([]);
});

test('offscreen images do not hold up the page', async ({ page }) => {
  const release = await holdRequest(page, '**/backgrounds/Summer.jpg*');
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();
    await page.waitForTimeout(350);
    await expect(page.locator('.page-loader')).toHaveCount(0);
  } finally { release(); }
});

test('a failed hero download releases the page', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/backgrounds/Hero.jpg*', async route => { await pending; await route.abort(); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.page-loader')).toBeVisible();
    release();
    await expect(page.locator('.page-loader')).toHaveCount(0);
    await expect(page.locator('[inert]')).toHaveCount(0);
  } finally { release(); }
});

test('reduced motion keeps a static mascot and avoids downloading the GIF', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const release = await holdRequest(page, '**/backgrounds/Hero.jpg*');
  const gifs: string[] = [];
  page.on('request', request => { if (request.url().endsWith('/Loading.gif')) gifs.push(request.url()); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.page-loader')).toBeVisible();
    await expect(page.locator('.page-loader__art img')).toHaveCount(1);
    await expect(page.locator('.page-loader__art img')).toHaveAttribute('src', '/mascots/Logo.png');
    expect(gifs).toEqual([]);
  } finally { release(); }
});

test('stalled graphics time out instead of blocking the site indefinitely', async ({ page }) => {
  const release = await holdRequest(page, '**/backgrounds/Hero.jpg*');
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.page-loader')).toBeVisible();
    await expect(page.locator('.page-loader')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('[inert]')).toHaveCount(0);
  } finally { release(); }
});

test('waits for a lazy route before checking its graphics', async ({ page }) => {
  const release = await holdRequest(page, '**/src/pages/CourseDemo.tsx*');
  try {
    await page.goto('/demo', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.page-loader')).toBeVisible();
    release();
    await expect(page.locator('.page-loader')).toHaveCount(0);
    await expect(page.locator('[data-page-loading]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  } finally { release(); }
});

test('checks graphics again after navigating to another page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.page-loader')).toHaveCount(0);
  const release = await holdRequest(page, '**/mascots/Puzzled.png');
  try {
    await page.locator('footer').getByRole('link', { name: 'FAQ', exact: true }).click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('.page-loader')).toBeVisible();
    release();
    await expect(page.locator('.page-loader')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  } finally { release(); }
});

for (const [date, season] of [
  ['2027-02-28T23:59:59Z', 'winter'],
  ['2027-03-01T00:00:00Z', 'spring'],
  ['2027-05-31T23:00:00Z', 'summer'],
  ['2027-08-31T23:00:00Z', 'fall'],
  ['2027-12-01T00:00:00Z', 'winter'],
]) {
  test(`uses ${season} artwork at ${date}, matching Moodle's London time`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(date));
    const release = await holdRequest(page, '**/backgrounds/Hero.jpg*');
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.page-loader__background')).toHaveAttribute('data-season', season);
      await expect(page.locator('.page-loader__background')).toHaveAttribute('src', `/backgrounds/${season[0].toUpperCase() + season.slice(1)}.jpg`);
    } finally { release(); }
  });
}
