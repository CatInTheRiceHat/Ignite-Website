import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_HEARTH_FIXTURE !== '1', 'Requires the isolated Prompt 3 fixture on loopback.');
async function login(page: Page, admin = false) {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite Prompt 3 fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(admin ? 'admin' : process.env.IGNITE_HEARTH_LEARNER!);
  await page.getByLabel('Password', { exact: true }).fill(admin ? 'FixtureOnly4829' : 'FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php(?:\?|$)/);
}

test('standalone selection, defer, confirm and switch preserve learning', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/choosehearth.php?returnurl=https%3A%2F%2Fevil.example%2F');
  await expect(page.getByRole('heading', { name: 'Choose your Hearth.', exact: true })).toBeVisible();
  const root = page.locator('.ignite-hearths');
  await expect(root.getByText('What sparks you?', { exact: true })).toBeVisible();
  const cards = root.locator('.ignite-hearths__grid > section');
  expect(await cards.count()).toBeGreaterThanOrEqual(4);
  const scan = await new AxeBuilder({ page }).include('.ignite-hearths').analyze();
  expect(scan.violations).toEqual([]);
  const heights = await cards.evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().height)));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await root.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  const defer = root.getByRole('button', { name: 'Choose later', exact: true });
  await defer.focus();
  await expect(defer).toBeFocused();
  expect(await defer.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.screenshot({ path: 'test-results/ignite-hearth-selection-mobile.png', fullPage: true });
  await defer.click();
  await expect(page).toHaveURL(/\/local\/ignite\/index.php$/);
  await page.goto('/local/ignite/choosehearth.php?returnurl=/local/ignite/hearth.php');
  await page.getByRole('button', { name: 'Choose Cinderwick Hearth', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Join Cinderwick Hearth?', exact: true })).toBeVisible();
  await expect(page.getByText('Future contributions go to your new Hearth.', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Confirm my choice', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/hearth.php$/);
  await expect(page.locator('.ignite-hearths').getByRole('heading', { name: 'Cinderwick Hearth', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Switch Hearth', exact: true }).click();
  await page.getByRole('button', { name: 'Choose Embercrest Hearth', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm my choice', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/hearth.php$/);
  await expect(page.locator('.ignite-hearths').getByRole('heading', { name: 'Embercrest Hearth', exact: true })).toBeVisible();
});

test('hub is accessible and shows honest evidence-based progress and next action', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/hearth.php');
  const root = page.locator('.ignite-hearths');
  await expect(root.getByText(/of 20 milestones completed/).first()).toBeVisible();
  await expect(root.getByText(/Your credited contribution/)).toBeVisible();
  await expect(root.getByRole('link', { name: /Try the next eligible milestone:/ })).toBeVisible();
  await expect(root.getByText('Mascot artwork awaiting approval')).toHaveCount(0); // Configured existing Sol asset.
  expect((await new AxeBuilder({ page }).include('.ignite-hearths').analyze()).violations).toEqual([]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await root.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  await page.screenshot({ path: 'test-results/ignite-hearth-hub-mobile.png', fullPage: true });
  await page.goto('/user/profile.php');
  await expect(page.getByRole('link', { name: 'Choose or switch your Hearth', exact: true })).toBeVisible();
});

test('administrator reviews proposals, edits identity and sees immutable challenge periods', async ({ page }) => {
  await login(page, true);
  await page.goto('/local/ignite/hearthsetup.php');
  await expect(page.getByText(/Crimson, Amber, Azure and Violet/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Embercrest Hearth', exact: true })).toBeVisible();
  await expect(page.getByLabel('I have reviewed these identity changes and their selected stable records.', { exact: true })).toBeVisible();
  await page.getByLabel('I have reviewed these identity changes and their selected stable records.', { exact: true }).check();
  await page.getByRole('button', { name: 'Apply reviewed proposals', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/houses.php$/);
  await page.getByRole('link', { name: 'Edit Embercrest Hearth', exact: true }).click();
  await expect(page.getByLabel('Short name', { exact: true })).toHaveValue('Embercrest');
  await page.getByLabel('Full name', { exact: true }).fill('Embercrest Hearth renamed');
  await page.getByLabel('Personality invitation', { exact: true }).fill('Care, warmth and encouragement for everyone.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.getByRole('link', { name: 'Edit Embercrest Hearth renamed', exact: true }).click();
  await expect(page.getByLabel('Personality invitation', { exact: true })).toHaveValue('Care, warmth and encouragement for everyone.');
  await page.getByLabel('Full name', { exact: true }).fill('Embercrest Hearth');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.goto('/local/ignite/hearthchallenges.php');
  await expect(page.getByText('Started period — configuration locked', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Create a challenge period', exact: true }).click();
  await expect(page.getByLabel('IANA timezone (for example America/Los_Angeles)', { exact: true })).toHaveValue('UTC');
});

test('learner cannot configure and signed-out visitors must authenticate on direct routes', async ({ page }) => {
  await page.goto('/local/ignite/choosehearth.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await page.goto('/local/ignite/hearth.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await login(page);
  await page.goto('/local/ignite/hearthchallenges.php');
  await expect(page.locator('.ignite-hearths')).toHaveCount(0);
  await expect(page.getByText(/permission/).first()).toBeVisible();
});
