import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_LAYOUT_FIXTURE !== '1', 'Requires the isolated Moodle preview or integrated fixture.');

test('native horizontal Timeline, previous navigation rail and side Hearth respond to available width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login/index.php');
  await expect(page.getByText(/^Log in to Ignite (local preview|integrated fixture)$/)).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(process.env.IGNITE_LAYOUT_LEARNER || 'preview_learner');
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
  await page.goto('/local/ignite/index.php');
  const root = page.locator('.ignite-dashboard');
  const sidebar = root.getByRole('navigation', { name: 'Learning navigation', exact: true });
  const timeline = root.locator('.ignite-dashboard__timeline');
  const hearth = root.getByRole('complementary', { name: 'My Hearth', exact: true });
  await expect(sidebar.getByText('My learning space', { exact: true })).toBeVisible();
  await expect(timeline.locator('[data-region="timeline"]')).toBeVisible();
  const bounds = await root.evaluate(el => {
    const box = (selector: string) => el.querySelector(selector)!.getBoundingClientRect();
    const nav = box('.ignite-dashboard__sidebar'), main = box('.ignite-dashboard__workspace');
    const learning = box('.ignite-dashboard__grid'), side = box('.ignite-dashboard__hearth');
    const native = box('.ignite-dashboard__timeline');
    return { leftRail: nav.right <= main.left, sideHearth: learning.right <= side.left,
      wideTimeline: native.width >= main.width - 1, timelineAboveHearth: native.bottom <= side.top };
  });
  expect(bounds).toEqual({ leftRail: true, sideHearth: true, wideTimeline: true, timelineAboveHearth: true });
  const primary = root.getByRole('link', { name: 'Continue learning', exact: true });
  await expect(primary).toHaveCount(1);
  await sidebar.getByRole('link', { name: 'My dashboard', exact: true }).focus();
  expect(await sidebar.getByRole('link', { name: 'My dashboard', exact: true }).evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  const dateFilter = timeline.locator('[data-region="day-filter"]');
  await dateFilter.getByRole('button').click();
  await dateFilter.locator('[data-filtername="next30days"]').click();
  await expect(dateFilter.getByRole('button')).toContainText('Next 30 days');
  await dateFilter.getByRole('button').click();
  await dateFilter.locator('[data-filtername="next7days"]').click();
  await expect(dateFilter.getByRole('button')).toContainText('Next 7 days');
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(timeline).toBeVisible();
    await expect(hearth.getByRole('heading', { name: 'My Hearth', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).include('.ignite-dashboard').analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/ignite-dashboard-layout-${width}.png`, fullPage: true });
  }
});
