import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const fixture = JSON.parse(process.env.IGNITE_INTEGRATED_DATA || '{}') as {
  users: Record<string,string>; missionid: number; laterid: number; cmid: number; courseid: number; assignmentid: number;
};
test.skip(process.env.IGNITE_INTEGRATED_FIXTURE !== '1', 'Requires the isolated real Moodle integration fixture.');
async function login(page: Page, user: string) {
  await page.goto('/login/index.php');
  await expect(page.getByText('Log in to Ignite integrated fixture', { exact: true })).toBeVisible();
  await page.getByLabel('Username or email', { exact: true }).fill(user === 'admin' ? 'admin' : fixture.users[user]);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
}
async function quizAttempt(page: Page, correct: boolean) {
  await page.goto(`/mod/quiz/view.php?id=${fixture.cmid}`);
  await page.getByRole('button', { name: /(?:Attempt quiz|Re-attempt quiz)/i }).click();
  await page.getByLabel(correct ? /Transport 6, lunch 8, save 6/ : /Transport 6, lunch 8, games 10/).check();
  await page.getByRole('button', { name: /Finish attempt/ }).click();
  await page.getByRole('button', { name: 'Submit all and finish', exact: true }).click();
  const dialog = page.locator('.modal.show');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Submit all and finish', exact: true }).click();
  await expect(page).toHaveURL(/\/mod\/quiz\/review.php/);
  await expect(page.getByText(/BUDGET_FEEDBACK/)).toHaveCount(0);
}

test('new learner follows real onboarding, native quiz retries, deferred invitation and next mission', async ({ page }) => {
  await login(page, 'journey');
  await page.goto('/local/ignite/onboarding.php');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Money skills', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Make something useful', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator(`input[name="targetkey"][value="activity:${fixture.cmid}"]`).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Start my first challenge', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/local/ignite/mission.php\\?id=${fixture.missionid}$`));
  const mission = page.locator('.ignite-mission');
  await expect(mission.getByRole('link', { name: 'Try the budget activity', exact: true })).toHaveAttribute('href', new RegExp(`/mod/quiz/view.php\\?id=${fixture.cmid}`));
  const scan = await new AxeBuilder({ page }).include('.ignite-mission').analyze();
  expect(scan.violations).toEqual([]);
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/ignite-mission-${width}.png`, fullPage: true });
  }
  const practice = mission.getByRole('link', { name: 'Try the budget activity', exact: true });
  await practice.focus(); expect(await practice.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await quizAttempt(page, false);
  await page.goto(`/local/ignite/mission.php?id=${fixture.missionid}`);
  await expect(page.getByText('Not complete yet', { exact: true }).first()).toBeVisible();
  await quizAttempt(page, true);
  await page.goto(`/mod/quiz/view.php?id=${fixture.cmid}`);
  await expect(page.getByRole('button', { name: /Re-attempt quiz/i })).toHaveCount(0);
  await page.goto(`/local/ignite/mission.php?id=${fixture.missionid}`);
  await expect(mission.getByRole('link', { name: 'Next step: Explain your budget trade-off', exact: true })).toHaveAttribute('href', new RegExp(`/mission.php\\?id=${fixture.laterid}`));
  await expect(mission.getByText('Badge status: Not earned', { exact: true })).toBeVisible();
  await mission.getByRole('link', { name: 'Meet the Hearths', exact: true }).click();
  await page.getByRole('button', { name: 'Choose later', exact: true }).click();
  await page.goto('/local/ignite/index.php');
  await expect(page.locator('.ignite-dashboard').getByText('You chose to decide later.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue learning', exact: true })).toHaveAttribute('href', new RegExp(`/mission.php\\?id=${fixture.laterid}`));
  await page.goto(`/local/ignite/mission.php?id=${fixture.laterid}`);
  await expect(page.getByRole('link', { name: 'Write your explanation', exact: true })).toHaveAttribute('href', new RegExp(`/mod/assign/view.php\\?id=${fixture.assignmentid}`));
});

test('administrator controls, aggregate report and editor/mentor boundaries are native', async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  await login(page, 'admin');
  await page.goto('/local/ignite/setup.php');
  await expect(page.getByRole('heading', { name: 'Ignite setup review', exact: true }).last()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Native site badges', exact: true })).toBeVisible();
  await page.goto('/admin/settings.php?section=local_ignite');
  await expect(page.getByLabel('Onboarding eligibility and goals (JSON)', { exact: true })).toBeVisible();
  await expect(page.locator('#id_s_local_ignite_levels')).not.toBeChecked();
  await page.goto('/local/ignite/report.php');
  await expect(page.getByLabel('From (UTC, inclusive)', { exact: true })).toBeVisible();
  await expect(page.getByText('Eligibility, completed onboarding and memberships are current snapshots', { exact: false })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 900 });
  const reportScan = await new AxeBuilder({ page }).include('#region-main').analyze();
  expect(reportScan.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const sharedTable = page.getByRole('region', { name: 'Hearth shared challenges', exact: true });
  if (await sharedTable.count() && await sharedTable.evaluate(el => el.scrollWidth > el.clientWidth)) {
    await sharedTable.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => sharedTable.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  }
  await page.screenshot({ path: 'test-results/ignite-admin-report-360.png', fullPage: true });
  await context.close();
  const editorContext = await browser.newContext(); const editor = await editorContext.newPage();
  await login(editor, 'editor');
  await editor.goto(`/local/ignite/missions.php?courseid=${fixture.courseid}&id=${fixture.missionid}`);
  await expect(editor.getByLabel('Short title', { exact: true })).toHaveValue('Make a budget choice');
  await editor.getByLabel('Estimated duration (editor estimate)', { exact: true }).fill('About 6 minutes');
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(editor.getByLabel('Estimated duration (editor estimate)', { exact: true })).toHaveValue('About 6 minutes');
  await editor.goto('/local/ignite/report.php');
  await expect(editor.getByText(/View aggregate Ignite learner reports/, { exact: false })).toBeVisible();
  await editorContext.close();
  const learnerContext = await browser.newContext(); const learner = await learnerContext.newPage();
  await login(learner, 'empty');
  await learner.goto(`/local/ignite/mission.php?id=${fixture.missionid}`);
  await expect(learner.locator('.ignite-mission')).toHaveCount(0);
  await expect(learner.getByText('This mission is unavailable.', { exact: false })).toBeVisible();
  await learnerContext.close();
});

test('confirmed native badge, optional Hearth membership and released feedback stay connected', async ({ browser }) => {
  test.skip(process.env.IGNITE_CONFIRMED_PHASE !== '1', 'Run after the guarded native post-browser task checks.');
  const context = await browser.newContext(); const page = await context.newPage();
  await login(page, 'journey');
  await page.goto('/local/ignite/passport.php');
  await expect(page.getByText('Practical budget starter', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Earned', { exact: true }).first()).toBeVisible();
  await page.goto('/local/ignite/choosehearth.php?returnurl=/local/ignite/index.php');
  await page.getByRole('button', { name: 'Choose A renamed draft Hearth', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm my choice', exact: true }).click();
  await expect(page.locator('.ignite-dashboard').getByText('A renamed draft Hearth', { exact: true })).toBeVisible();
  await expect(page.locator('.ignite-dashboard').getByText('Your credited contribution to this Hearth: 0 milestones.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue learning', exact: true })).toHaveAttribute('href', new RegExp(`/mission.php\\?id=${fixture.laterid}`));
  await context.close();
  const learnerContext = await browser.newContext(); const learner = await learnerContext.newPage();
  await login(learner, 'learner');
  await learner.goto(`/local/ignite/mission.php?id=${fixture.laterid}`);
  await expect(learner.getByText('MENTOR_FEEDBACK: Clear explanation of your priorities.', { exact: true })).toBeVisible();
  await learner.setViewportSize({ width: 360, height: 900 });
  expect(await learner.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const scan = await new AxeBuilder({ page: learner }).include('.ignite-mission').analyze();
  expect(scan.violations).toEqual([]);
  await learner.screenshot({ path: 'test-results/ignite-mission-feedback-360.png', fullPage: true });
  await learnerContext.close();
});

test('administrator initial invitation setting enables the earlier-selection path', async ({ browser }) => {
  test.skip(!fixture.users.earlyweb, 'Requires the guarded --early fixture setup.');
  const adminContext = await browser.newContext(); const admin = await adminContext.newPage();
  await login(admin, 'admin');
  await admin.goto('/admin/settings.php?section=local_ignite');
  await admin.locator('#id_s_local_ignite_hearthtiming').selectOption('initial');
  await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
  const context = await browser.newContext(); const page = await context.newPage();
  await login(page, 'earlyweb');
  await page.goto('/local/ignite/onboarding.php');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Money skills', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator(`input[name="targetkey"][value="activity:${fixture.cmid}"]`).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Meet the Hearths', exact: true }).click();
  await page.getByRole('button', { name: 'Choose A renamed draft Hearth', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm my choice', exact: true }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/onboarding.php$/);
  await page.getByRole('button', { name: 'Start my first challenge', exact: true }).click();
  await expect(page.locator('.ignite-mission').getByRole('link', { name: 'Try the budget activity', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const scan = await new AxeBuilder({ page }).include('.ignite-mission').analyze(); expect(scan.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/ignite-mission-360.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'test-results/ignite-mission-1440.png', fullPage: true });
  await admin.goto('/admin/settings.php?section=local_ignite');
  await admin.locator('#id_s_local_ignite_hearthtiming').selectOption('afterchallenge');
  await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
  await context.close(); await adminContext.close();
});
