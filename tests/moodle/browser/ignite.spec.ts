import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_MOODLE_FIXTURE !== '1', 'Requires the isolated Moodle foundation fixture on loopback.');

async function login(page: Page, username = 'admin') {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite foundation fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php(?:\?|$)/);
}

test('learner home is responsive, accessible, and links to native Moodle', async ({ page }) => {
  await login(page, process.env.IGNITE_FIXTURE_LEARNER || 'admin');
  await page.goto('/local/ignite/index.php');
  const home = page.locator('.ignite-home');
  await expect(home.getByRole('heading', { name: 'Find your next spark' })).toBeVisible();
  await expect(home.getByRole('link', { name: 'Back to your Moodle dashboard' })).toHaveAttribute('href', /\/my\/$/);
  const nextaction = home.locator('.ignite-home__action');
  await expect(nextaction).toHaveAttribute('href', /\/(?:my\/(?:courses.php)?|course\/index.php)$/);
  await expect(home.getByRole('link', { name: 'View my badges' })).toHaveAttribute('href', /\/badges\/mybadges.php$/);
  await expect(page.locator('.primary-navigation a[href$="/local/ignite/index.php"]')).toHaveCount(1);
  const scan = await new AxeBuilder({ page }).include('.ignite-home').analyze();
  expect(scan.violations).toEqual([]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await home.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await expect(home.getByRole('link', { name: 'Back to your Moodle dashboard' })).toBeVisible();
  }
  await nextaction.focus();
  await page.keyboard.press('Tab');
  await expect(home.getByRole('link', { name: 'Back to your Moodle dashboard' })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.screenshot({ path: 'test-results/ignite-foundation-mobile.png', fullPage: true });
  const nexturl = await nextaction.getAttribute('href');
  await nextaction.click();
  await expect(page).toHaveURL(nexturl!);
});

test('administrator edits houses through native forms with validation', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/houses.php');
  await page.getByRole('link', { name: 'Edit Renamed by administrator', exact: true }).click();
  await expect(page.getByText('ember', { exact: true })).toBeVisible();
  await page.getByLabel('Accent color', { exact: true }).fill('#FFFFFF');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Choose a #RRGGBB color with at least 4.5:1 contrast against white.', { exact: true })).toBeVisible();
  await page.getByLabel('Accent color', { exact: true }).fill('#934214');
  await page.getByLabel('Display name', { exact: true }).fill('Editable Ember');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('link', { name: 'Edit Editable Ember', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Edit Editable Ember', exact: true }).click();
  await page.getByLabel('Display name', { exact: true }).fill('Renamed by administrator');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('link', { name: 'Edit Renamed by administrator', exact: true })).toBeVisible();
});

test('master switch preserves course navigation and redirects the disabled home', async ({ page }) => {
  await login(page);
  await page.goto('/admin/settings.php?section=local_ignite');
  await page.getByLabel('Enable Ignite', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save changes' }).click();
  try {
    await page.goto('/local/ignite/index.php');
    await expect(page).toHaveURL(/\/my\/$/);
    await expect(page.locator('.primary-navigation a[href$="/local/ignite/index.php"]')).toHaveCount(0);
    await page.goto('/course/index.php');
    await expect(page).toHaveURL(/\/course\/index.php$/);
  } finally {
    await page.goto('/admin/settings.php?section=local_ignite');
    await page.getByLabel('Enable Ignite', { exact: true }).check();
    await page.getByRole('button', { name: 'Save changes' }).click();
  }
});

test('signed-out visitors must authenticate', async ({ page }) => {
  await page.goto('/local/ignite/index.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await expect(page.locator('.ignite-home')).toHaveCount(0);
});
