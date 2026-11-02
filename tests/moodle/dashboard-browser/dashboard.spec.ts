import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.IGNITE_DASHBOARD_FIXTURE !== '1', 'Requires the isolated real Moodle dashboard fixture.');
const fixture = JSON.parse(process.env.IGNITE_DASHBOARD_DATA || '{}') as {
  users: Record<string, string>; courseid: number; cmids: number[];
};

async function login(page: Page, user = 'learner') {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite isolated dashboard fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(user === 'admin' ? 'admin' : fixture.users[user]);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
}

async function adminFlag(page: Page, name: string, enabled: boolean) {
  await page.goto('/admin/settings.php?section=local_ignite');
  const checkbox = page.locator(`#id_s_local_ignite_${name}`);
  await checkbox.setChecked(enabled);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(checkbox).toBeChecked({ checked: enabled });
}

test('real learner dashboard, native block, mobile, keyboard and contrast', async ({ page }) => {
  await login(page);
  await page.goto('/local/ignite/index.php');
  const root = page.locator('.ignite-dashboard');
  await expect(root.getByRole('heading', { name: 'Welcome, Learner', exact: true })).toBeVisible();
  const primary = root.getByRole('link', { name: 'Continue learning', exact: true });
  await expect(primary).toHaveCount(1);
  await expect(primary).toHaveAttribute('href', new RegExp(`/mod/page/view.php\\?id=${fixture.cmids[2]}$`));
  await expect(root.locator('.ignite-dashboard__count').filter({ hasText: '2 of 3 tracked activities complete · 67%' })).toBeVisible();
  await expect(root.getByRole('heading', { name: 'My Hearth', exact: true })).toBeVisible();
  await expect(root.getByText('Planning starter', { exact: true }).first()).toBeVisible();
  await expect(root.getByText('Requirements', { exact: true })).toBeVisible();
  await expect(root.getByRole('heading', { name: 'Your personal heat stage', exact: true })).toHaveCount(0);
  const scan = await new AxeBuilder({ page }).include('.ignite-dashboard').analyze();
  expect(scan.violations).toEqual([]);
  for (const width of [1440, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await root.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(primary).toBeVisible();
    if (width === 1440 || width === 360) {
      await page.screenshot({ path: `test-results/ignite-dashboard-${width}.png`, fullPage: true });
    }
  }
  await primary.focus();
  await expect(primary).toBeFocused();
  expect(await primary.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Tab');
  await expect(root.locator('.ignite-dashboard__timeline [data-region="day-filter"]').getByRole('button')).toBeFocused();
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await primary.click();
  await expect(page.getByRole('heading', { name: 'Reflect on a change', exact: true })).toBeVisible();
  await page.goto('/my/');
  await expect(page).toHaveURL(/\/my\/$/);
  await expect(page.locator('.block_ignite .ignite-dashboard')).toBeVisible();
  await expect(page.locator('.block_myoverview')).toBeVisible();
});

test('new, deferred, completed and teaching sessions keep useful honest states', async ({ browser }) => {
  for (const user of ['new', 'deferred', 'complete', 'teacher']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, user);
    await page.goto('/local/ignite/index.php');
    const root = page.locator('.ignite-dashboard');
    if (user === 'new' || user === 'deferred') {
      await expect(root.getByRole('heading', { name: 'Find your first course', exact: true })).toBeVisible();
      await expect(root.locator('progress')).toHaveCount(0);
      await expect(root.getByText('No visible awards to show yet.', { exact: false })).toBeVisible();
      await expect(root.getByRole('link', { name: 'Continue learning', exact: true })).toHaveAttribute('href', /\/enrol\/index.php\?id=/);
    }
    if (user === 'deferred') {
      await expect(root.getByText('You chose to decide later.', { exact: false })).toBeVisible();
      await expect(root.getByRole('link', { name: 'Meet the Hearths', exact: true })).toHaveCount(0);
      await root.getByRole('link', { name: 'Choose your Hearth.', exact: true }).click();
      await page.getByRole('button', { name: 'Choose later', exact: true }).click();
      await expect(page.locator('.ignite-dashboard').getByText('You chose to decide later.', { exact: false })).toBeVisible();
    }
    if (user === 'complete') {
      await expect(root.getByText('Course complete', { exact: true })).toBeVisible();
      await expect(root.getByRole('link', { name: 'Continue learning', exact: true })).toHaveAttribute('href', /\/enrol\/index.php\?id=/);
    }
    if (user === 'teacher') {
      await expect(root.getByText('Progress is unavailable because your role is not tracked', { exact: false })).toBeVisible();
      await expect(root.locator('.ignite-dashboard__learning progress')).toHaveCount(0);
    }
    await context.close();
  }
});

test('administrator landing opt-in and optional heat stages use native settings', async ({ browser }) => {
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, 'admin');
  await adminFlag(admin, 'dashboardlanding', true);
  const learnerContext = await browser.newContext();
  const learner = await learnerContext.newPage();
  await login(learner);
  await learner.goto('/my/');
  await expect(learner).toHaveURL(/\/local\/ignite\/index.php$/);
  await learner.goto(`/mod/page/view.php?id=${fixture.cmids[2]}`);
  await expect(learner).toHaveURL(new RegExp(`/mod/page/view.php\\?id=${fixture.cmids[2]}$`));
  await admin.goto('/my/');
  await expect(admin).toHaveURL(/\/my\/$/);
  const teacherContext = await browser.newContext();
  const teacher = await teacherContext.newPage();
  await login(teacher, 'teacher');
  await teacher.goto('/my/');
  await expect(teacher).toHaveURL(/\/my\/$/);
  await adminFlag(admin, 'levels', true);
  await learner.goto('/local/ignite/index.php');
  await expect(learner.getByRole('heading', { name: 'Your personal heat stage', exact: true })).toBeVisible();
  await expect(learner.getByText('Next: Flame at 3 total qualifying milestones. You need 1 more', { exact: false })).toBeVisible();
  const scan = await new AxeBuilder({ page: learner }).include('.ignite-dashboard').analyze();
  expect(scan.violations).toEqual([]);
  await adminFlag(admin, 'levels', false);
  await adminFlag(admin, 'dashboardlanding', false);
  await learnerContext.close(); await teacherContext.close(); await adminContext.close();
});

test('signed-out direct dashboard access requires native login', async ({ page }) => {
  await page.goto('/local/ignite/index.php');
  await expect(page).toHaveURL(/\/login\/index.php/);
  await expect(page.locator('.ignite-dashboard')).toHaveCount(0);
});
