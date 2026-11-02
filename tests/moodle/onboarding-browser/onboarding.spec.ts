import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const fixtures = JSON.parse(process.env.IGNITE_PROMPT2_FIXTURES || '{}') as {
  users: Record<string, string>; courseid: number; cmid: number;
};
test.skip(process.env.IGNITE_PROMPT2_FIXTURE !== '1', 'Requires an isolated Prompt 2 Moodle fixture.');
async function login(page: Page, name: string) {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite Prompt 2 private fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(name === 'admin' ? name : fixtures.users[name]);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
}

test('new learner can finish the real walkthrough, edit later, and reopen Help', async ({ page }) => {
  await login(page, 'new');
  await expect(page).toHaveURL(/\/local\/ignite\/onboarding.php$/);
  await expect(page.getByRole('heading', { name: 'Welcome to Ignite. What do you want to try?' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Money & Life Skills', { exact: true }).check();
  const scan = await new AxeBuilder({ page }).include('.ignite-walk').analyze();
  expect(scan.violations).toEqual([]);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.locator('.ignite-walk').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  await page.screenshot({ path: 'test-results/ignite-onboarding-mobile.png', fullPage: true });
  const checkbox = page.getByLabel('Technology & Building', { exact: true });
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  expect(await checkbox.evaluate(el => getComputedStyle(el.closest('.form-check')!).outlineStyle)).toBe('solid');
  await checkbox.uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Make something.', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Make a weekly budget.', { exact: true })).toBeVisible();
  await page.locator(`input[name="targetkey"][value="activity:${fixtures.cmid}"]`).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re ready to begin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Meet the Hearths' })).toHaveCount(0);
  await expect(page.locator('.ignite-walk input[type="submit"].btn-primary')).toHaveCount(1);
  await page.getByRole('button', { name: 'Start my first challenge', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/mod/assign/view.php\\?id=${fixtures.cmid}$`));
  await page.goto('/local/ignite/index.php');
  await expect(page.getByText('Getting started: Complete', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Edit my interests', exact: true }).click();
  await page.getByLabel('Money & Life Skills', { exact: true }).uncheck();
  await page.getByLabel('Career Exploration', { exact: true }).check();
  await page.getByRole('button', { name: 'Save my interests', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/index.php$/);
  await page.getByRole('link', { name: 'Help and interface tour', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find your way around Ignite' })).toBeVisible();
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
});

test('partial learner resumes; skipped learner stays dismissed; Back persists', async ({ page }) => {
  await login(page, 'partial');
  await expect(page.getByRole('heading', { name: 'Choose a starting path' })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What would you like to do?' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/index.php$/);
  await page.goto('/my/');
  await expect(page).not.toHaveURL(/onboarding.php/);
  await page.goto('/local/ignite/onboarding.php');
  await expect(page.getByRole('heading', { name: 'What would you like to do?' })).toBeVisible();
});

test('returning learner, teacher and admin sessions retain ordinary landing pages', async ({ browser }) => {
  for (const name of ['returning', 'skipped', 'teacher', 'admin']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, name);
    await expect(page).not.toHaveURL(/onboarding.php/);
    await context.close();
  }
});

test('intended course destination survives normal login; starter remains incomplete', async ({ page }) => {
  await page.goto(`/mod/assign/view.php?id=${fixtures.cmid}`);
  await expect(page).toHaveURL(/\/login\/index.php/);
  await page.getByLabel('Username or email', { exact: true }).fill(fixtures.users.deep);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/mod/assign/view.php\\?id=${fixtures.cmid}$`));
});

test('required policy, profile and password steps run before the walkthrough', async ({ browser }) => {
  for (const [name, destination] of [
    ['policy', /\/user\/policy.php/], ['profile', /\/user\/edit.php/], ['password', /\/login\/change_password.php/],
  ] as const) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, name);
    await expect(page).toHaveURL(destination);
    await expect(page.locator('.ignite-walk')).toHaveCount(0);
    await context.close();
  }
  const unconfirmedcontext = await browser.newContext();
  const unconfirmed = await unconfirmedcontext.newPage();
  await login(unconfirmed, 'unconfirmed');
  await expect(unconfirmed.getByRole('heading', { name: 'You need to confirm your account', exact: true })).toBeVisible();
  await expect(unconfirmed.locator('.ignite-walk')).toHaveCount(0);
  await unconfirmedcontext.close();
});

test('empty recommendations, missing starter/sibling, and signed-out URLs remain useful', async ({ browser, page }) => {
  const admincontext = await browser.newContext();
  const admin = await admincontext.newPage();
  await login(admin, 'admin');
  await admin.goto('/admin/settings.php?section=local_ignite');
  const configuration = admin.getByLabel('Starter challenges and recommendation outcomes (JSON)', { exact: true });
  const previous = await configuration.inputValue();
  await configuration.fill('{"starters":[],"outcomes":{}}');
  await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
  try {
    await login(page, 'skipped');
    await page.goto('/local/ignite/onboarding.php');
    await page.getByLabel('Career Exploration', { exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByText(/There are no matching starting paths available/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'You’re ready to begin' })).toBeVisible();
    await expect(page.getByText(/No starter challenge is available to you yet/)).toBeVisible();
    await expect(page.locator('.ignite-walk').getByRole('link', { name: 'Explore courses', exact: true })).toHaveAttribute('href', /course\/index.php$/);
    await page.goto('/local/ignite/invitation.php');
    await expect(page.getByText(/Your Hearth invitation is not available right now/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Meet the Hearths' })).toHaveCount(0);
    const context = await browser.newContext();
    const signedout = await context.newPage();
    for (const url of ['onboarding', 'invitation', 'tour']) {
      await signedout.goto(`/local/ignite/${url}.php`);
      await expect(signedout).toHaveURL(/\/login\/index.php/);
    }
    await signedout.goto('/login/forgot_password.php');
    await expect(signedout).toHaveURL(/\/login\/forgot_password.php$/);
    await expect(signedout.locator('.ignite-walk')).toHaveCount(0);
    await context.close();
  } finally {
    await admin.goto('/admin/settings.php?section=local_ignite');
    await configuration.fill(previous);
    await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
    await admincontext.close();
  }
});

test('Finish has one primary action and keeps Ignite home accessible', async ({ page }) => {
  await login(page, 'initial');
  await page.goto('/local/ignite/onboarding.php');
  await expect(page.getByRole('heading', { name: 'You’re ready to begin' })).toBeVisible();
  await expect(page.locator('.ignite-walk input[type="submit"].btn-primary')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Start my first challenge', exact: true })).toHaveClass(/btn-primary/);
  await expect(page.getByRole('button', { name: 'Go to Ignite home', exact: true })).toHaveClass(/btn-secondary/);
  expect((await new AxeBuilder({ page }).include('.ignite-walk').analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/ignite-onboarding-finish.png', fullPage: true });
  await page.getByRole('button', { name: 'Go to Ignite home', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/index.php$/);
});

test('automatic entry distinguishes learners from staff without enrollment', async ({ browser }) => {
  const staffcontext = await browser.newContext();
  const staff = await staffcontext.newPage();
  await login(staff, 'teacher');
  await expect(staff).not.toHaveURL(/onboarding.php/);
  await staffcontext.close();
  const learnercontext = await browser.newContext();
  const learner = await learnercontext.newPage();
  await login(learner, 'deep');
  await expect(learner.getByRole('heading', { name: 'Welcome to Ignite. What do you want to try?' })).toBeVisible();
  await learner.getByRole('link', { name: 'Go to Ignite home', exact: true }).click();
  await expect(learner).toHaveURL(/\/local\/ignite\/index.php$/);
  await learnercontext.close();
});
