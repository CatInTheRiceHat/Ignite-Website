import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_LAYOUT_FIXTURE !== '1', 'Requires the isolated Moodle preview or integrated fixture.');

test('simple dashboard retains native Timeline and four navigation destinations', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login/index.php');
  await expect(page.getByText(/^Log in to Ignite (local preview|integrated fixture)$/)).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(process.env.IGNITE_LAYOUT_LEARNER || 'preview_learner');
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
  await page.goto('/local/ignite/index.php');
  const root = page.locator('.ignite-dashboard');
  await expect(root.locator('.ignite-dashboard__sidebar, .ignite-dashboard__rail, .ignite-dashboard__grid')).toHaveCount(0);
  const primary = page.locator('.primary-navigation');
  for (const [name, path] of [['Home', '/my/'], ['Explore Courses', '/course/index.php'], ['Hearth', '/local/ignite/hearth.php'], ['Campfire', '/local/ignite/passport.php']]) {
    const link = primary.getByRole('menuitem', { name, exact: true });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', new RegExp(`${path.replace(/[.?]/g, '\\$&')}$`));
  }
  const timeline = root.locator('.ignite-dashboard__timeline');
  await expect(timeline.locator('[data-region="timeline"]')).toBeVisible();
  const filter = timeline.locator('[data-region="day-filter"]');
  await filter.getByRole('button').click();
  await filter.locator('[data-filtername="next30days"]').click();
  await expect(filter.getByRole('button')).toContainText('Next 30 days');
  await filter.getByRole('button').click();
  await filter.locator('[data-filtername="next7days"]').click();
  if (process.env.IGNITE_TIMELINE_DEMO === '1') {
    await expect(timeline.getByText('Budget choices starter', { exact: true }).first()).toBeVisible();
    await expect(timeline.getByText('Plan one manageable task', { exact: true }).first()).toBeVisible();
  }
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).include('.ignite-dashboard').analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/ignite-dashboard-simple-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await primary.getByRole('menuitem', { name: 'Campfire', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/passport.php$/);
  await expect(page.getByRole('heading', { name: 'Campfire', exact: true }).first()).toBeVisible();
});
