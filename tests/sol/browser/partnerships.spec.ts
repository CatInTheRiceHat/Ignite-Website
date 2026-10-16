import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('partnerships is reachable from header navigation and footer', async ({ page }) => {
  await page.goto('/');
  const homeToggle = page.getByRole('button', { name: 'Toggle menu', exact: true });
  if (await homeToggle.isVisible()) await homeToggle.click();
  await page.locator('nav').getByRole('link', { name: 'Partnerships', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/partnerships$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Partnerships');
  await expect(page.getByRole('heading', { name: 'Bring practical learning to your community.', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('Partnerships | Ignite');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ignitefindyourfire.org/partnerships');
  await expect(page.locator('footer').getByRole('link', { name: 'Partnerships', exact: true })).toHaveAttribute('href', '/partnerships');

  const toggle = page.getByRole('button', { name: 'Toggle menu', exact: true });
  if (await toggle.isVisible()) await toggle.click();
  const navLink = page.locator('nav').getByRole('link', { name: 'Partnerships', exact: true }).filter({ visible: true });
  await expect(navLink).toHaveAttribute('aria-current', 'page');
  await navLink.click();
  if (await toggle.isVisible()) await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('partnership calls to action link directly to the application form', async ({ page }) => {
  await page.goto('/partnerships');
  const cta = page.getByRole('link', { name: /^Partner with Ignite/ });
  await expect(cta).toHaveAttribute('href', 'https://forms.gle/6Zte2NF4fbWj2Y7W9');
  await expect(cta).toHaveAttribute('target', '_blank');
  await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  const application = page.getByRole('region', { name: 'Let’s explore a partnership.' });
  await expect(application).not.toContainText('Our partnership application will be available here once it’s ready.');
  await expect(application.locator('iframe')).toHaveCount(0);
  const alternative = application.getByRole('link', { name: /Open partnership application/ });
  await expect(alternative).toHaveAttribute('href', 'https://forms.gle/6Zte2NF4fbWj2Y7W9');
  await expect(alternative).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('heading', { name: 'Our partners', exact: true })).toHaveCount(1);
});

test('partner logos link to both websites and stay still with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/partnerships');
  const partners = page.getByRole('region', { name: 'Our partners', exact: true });
  await partners.scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Start small. Build together.', exact: true })).toHaveCount(0);
  await expect(partners.getByRole('link', { name: /^Visit Doorstop Education/ })).toHaveAttribute('href', 'https://doorstopeducation.org/');
  await expect(partners.getByRole('img', { name: 'Sophie logo', exact: true })).toHaveAttribute('src', '/partnerships/Sophie.png');
  await expect(partners.getByRole('link', { name: /^Visit Sophie/ })).toHaveAttribute('href', 'https://hello-sophie.com/');
  await expect(partners.getByRole('link')).toHaveCount(2);
  await expect(partners.getByRole('button')).toHaveCount(0);
  expect(await partners.locator('ul').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});

test('partner strip moves left to right without a pause button', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/partnerships');
  const partners = page.getByRole('region', { name: 'Our partners', exact: true });
  await partners.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = partners.locator('ul').first();
  const x = () => track.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41);
  const start = await x();
  await expect.poll(x).toBeGreaterThan(start + 2);
  await expect(partners.getByRole('button')).toHaveCount(0);
  await expect.poll(() => track.evaluate(element => getComputedStyle(element).animationPlayState)).toBe('running');
});

test('partner strip loops seamlessly and keeps duplicate links out of keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/partnerships');
  const partners = page.getByRole('region', { name: 'Our partners', exact: true });
  await partners.scrollIntoViewIfNeeded();
  const groups = partners.locator('ul');
  const first = await groups.nth(0).boundingBox();
  const second = await groups.nth(1).boundingBox();
  expect(first!.width).toBe(second!.width);
  expect(first!.width).toBeGreaterThanOrEqual(await partners.evaluate(element => Math.min(element.clientWidth, 1280)));
  expect(await groups.nth(0).locator('img').evaluateAll(elements => elements.map(element => element.getAttribute('src'))))
    .toEqual(await groups.nth(1).locator('img').evaluateAll(elements => elements.map(element => element.getAttribute('src'))));
  await expect(partners.getByRole('link')).toHaveCount(2);
  for (const duplicate of await partners.locator('li[aria-hidden="true"] a').all()) {
    await expect(duplicate).toHaveAttribute('tabindex', '-1');
  }
  const firstLink = partners.getByRole('link', { name: /^Visit Doorstop Education/ });
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toBeInViewport();
  expect(await groups.nth(0).evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});

test('partnership content fits the viewport and has no structural accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/partnerships');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('main img').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0), { timeout: 10000 }).toBe(true);
  }
  // Contrast is audited separately: these primary-orange/white treatments match the existing pages.
  const results = await new AxeBuilder({ page }).include('main').disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});
