import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_PASSPORT_FIXTURE !== '1', 'Requires isolated Passport Moodle fixture.');

async function login(page: Page, user = process.env.IGNITE_PASSPORT_LEARNER!) {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite Passport fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(user);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
}

test('standalone collection is accessible and responsive with real earned and pending states', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/passport.php');
  const passport = page.locator('.ignite-passport');
  await expect(passport.getByRole('heading', { name: 'Small steps. Real achievements.' })).toBeVisible();
  await expect(passport.getByText('Your personal collection. You can earn badges with or without a Hearth.')).toBeVisible();
  await expect(passport.locator('[data-state="earned"]')).not.toHaveCount(0);
  await expect(passport.locator('[data-state="pendinggrading"]')).not.toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Featured badges' }).locator('article')).toHaveCount(3);
  for (const img of await passport.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  expect((await new AxeBuilder({ page }).include('.ignite-passport').analyze()).violations).toEqual([]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await passport.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  const home = passport.getByRole('link', { name: 'Your Ignite home' });
  await home.focus();
  await page.keyboard.press('Tab');
  await expect(passport.getByRole('link', { name: 'Explore courses', exact: true })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.screenshot({ path: 'test-results/passport-mobile.png', fullPage: true });
});

test('details show actual evidence, safe celebration, and native course action', async ({ page }) => {
  await login(page);
  await page.goto(`/local/ignite/badge.php?id=${process.env.IGNITE_PASSPORT_BADGE}`);
  await expect(page.getByText('Achievement earned! Moodle has confirmed this badge in your collection.')).toBeVisible();
  await expect(page.locator('.ignite-passport').getByText('A real starter challenge', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue in this course' })).toHaveAttribute('href', /\/course\/view.php\?id=\d+/);
  expect((await new AxeBuilder({ page }).include('.ignite-passport').analyze()).violations).toEqual([]);
  await page.goto(`/local/ignite/badge.php?id=${process.env.IGNITE_PASSPORT_PROJECT}`);
  await expect(page.getByText('Submitted work · awaiting grading', { exact: true })).toBeVisible();
  await expect(page.getByText('Achievement earned! Moodle has confirmed this badge in your collection.')).toHaveCount(0);
});

test('native form saves owned featured choices and supports clearing all', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/featured.php');
  const select = page.getByLabel('Badges to feature', { exact: true });
  expect((await new AxeBuilder({ page }).include('.ignite-passport').analyze()).violations).toEqual([]);
  const original = await select.locator('option:checked').evaluateAll(els => els.map(el => (el as HTMLOptionElement).value));
  const options = await select.locator('option').evaluateAll(els => els.map(el => (el as HTMLOptionElement).value));
  await select.selectOption(options.slice(0, 4));
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Choose up to three different available badges you own.', { exact: false })).toBeVisible();
  await select.selectOption([process.env.IGNITE_PASSPORT_BADGE!]);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/passport.php$/);
  const featured = page.getByRole('region', { name: 'Featured badges' });
  await expect(featured.locator('article')).toHaveCount(1);
  await page.goto('/local/ignite/featured.php');
  await select.selectOption([]);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('No featured badges selected yet.', { exact: true })).toBeVisible();
  await page.goto('/local/ignite/featured.php');
  await select.selectOption(original);
  await page.getByRole('button', { name: 'Save changes' }).click();
});

test('empty collection and unauthorized direct URL remain useful and private', async ({ page }) => {
  await login(page, process.env.IGNITE_PASSPORT_EMPTY!);
  await page.goto('/local/ignite/passport.php');
  await expect(page.getByText('Your collection is ready for your first achievement.', { exact: false })).toBeVisible();
  await page.goto('/local/ignite/badge.php?id=2147483647');
  await expect(page.getByText('This collectible is not available to you.', { exact: false })).toBeVisible();
});

test('all Passport routes require authentication', async ({ page }) => {
  await page.goto('/local/ignite/passport.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await page.goto('/local/ignite/featured.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await page.goto(`/local/ignite/badge.php?id=${process.env.IGNITE_PASSPORT_BADGE}`);
  await expect(page).toHaveURL(/\/login\/index.php/);
});

test('native manual award screen rejects learner', async ({ page }) => {
  await login(page);
  await page.goto(`/badges/award.php?id=${process.env.IGNITE_PASSPORT_MANUAL || process.env.IGNITE_PASSPORT_BADGE}`);
  await expect(page.getByText(/do not currently have permissions/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Award', exact: true })).toHaveCount(0);
});
