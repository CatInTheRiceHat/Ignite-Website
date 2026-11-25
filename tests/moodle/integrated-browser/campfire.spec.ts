import { expect, test, type Page } from '@playwright/test';

const fixture = JSON.parse(process.env.IGNITE_BOARD_DATA || '{}') as {
  user: string; solo: string; joiner: string; cmid: number; manualcmid: number; past: string; empty: string;
};
test.skip(!fixture.user, 'Requires the private monthly Campfire fixture.');
test.use({ baseURL: 'http://127.0.0.1:8796' });

async function login(page: Page, username: string) {
  await page.goto('/login/index.php');
  await page.getByLabel('Username or email', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill('FixtureOnly!4829aZ');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/index.php/);
}

test('monthly standings, archive, personal XP and the original activity award on mobile', async ({ page }) => {
  await login(page, fixture.user);
  await page.goto('/local/ignite/passport.php');
  const board = page.locator('#campfire-standings');
  await expect(board.getByRole('listitem')).toHaveCount(3);
  await board.getByRole('link', { name: 'Previous month' }).click();
  await expect(page).toHaveURL(new RegExp('month=' + fixture.past));
  await expect(board.getByText(/^🏆 Campfire Cup · /)).toHaveCount(2);
  const forge = board.getByRole('listitem').filter({ hasText: 'Forgelings' });
  await expect(forge).toContainText('You contributed 7.5 Team XP');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const row of await board.getByRole('listitem').all()) {
      await expect(row).toBeVisible();
      await expect(row.locator('img')).toHaveJSProperty('complete', true);
      expect(await row.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const bounds = await row.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    if (width === 390) {
      await board.screenshot({ path: 'test-results/campfire-standings-mobile.png' });
    }
  }
  await board.getByRole('link', { name: 'Previous month' }).click();
  await expect(board.getByText('No team earned XP this month. There is no champion.')).toBeVisible();
  await board.getByRole('link', { name: 'Next month' }).click();
  await expect(forge).toContainText('You contributed 7.5 Team XP');
  await page.goto('/user/profile.php');
  await expect(page.getByText('55 lifetime Regular XP · Level 1')).toBeVisible();
  await expect(page.getByText('55 of 100 Regular XP toward level 2')).toBeVisible();
  await page.goto('/mod/page/view.php?id=' + fixture.cmid);
  await expect(page.locator('.ignite-xp-receipt')).toHaveText('+20 Regular XP · +10 Team XP for the Candlelings');
});

test('teamless activity completion links directly to the three Campfire choices', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page, fixture.solo);
  await page.goto('/mod/page/view.php?id=' + fixture.cmid);
  const receipt = page.locator('.ignite-xp-receipt');
  await expect(receipt).toContainText('+20 Regular XP');
  await expect(receipt).not.toContainText('Team XP');
  await receipt.getByRole('link', { name: 'Choose a Campfire' }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/choosehearth.php/);
  const chooser = page.getByRole('region', { name: 'Browse Hearths' });
  const join = chooser.getByRole('button', { name: /^Join / });
  await expect(join).toHaveText('Join Forgelings');
  await expect(chooser.getByRole('button', { name: 'Previous Hearth' })).toBeDisabled();
  await chooser.getByRole('button', { name: 'Next Hearth' }).click();
  await expect(join).toHaveText('Join Candlelings');
  await chooser.locator('.hearth-carousel__viewport').press('ArrowDown');
  await expect(join).toHaveText('Join Lanternlings');
  await expect(chooser.getByRole('button', { name: 'Next Hearth' })).toBeDisabled();
  await chooser.getByRole('button', { name: 'Previous Hearth' }).click();
  await expect(join).toHaveText('Join Candlelings');
  await page.reload();
  await expect(join).toHaveText('Join Forgelings');
  await page.goto('/mod/page/view.php?id=' + fixture.manualcmid);
  const toggle = page.locator('[data-action="toggle-manual-completion"]').first();
  await toggle.click();
  await expect(receipt).toContainText('+20 Regular XP');
  await toggle.click();
  await expect(receipt).toHaveCount(0);
});

test('choose a Campfire and support it through an eligible activity', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page, fixture.joiner);
  await page.goto('/local/ignite/passport.php');
  const intro = page.getByRole('region', { name: 'Who will you represent?' });
  await expect(intro.getByRole('button', { name: /^Join / })).toHaveText('Join Forgelings');
  await intro.getByRole('link', { name: 'View standings and choose later' }).click();
  await expect(page.locator('#campfire-standings')).toBeInViewport();
  await intro.getByRole('button', { name: 'Join Forgelings' }).click();
  await expect(page.getByRole('heading', { name: 'Join Forgelings?' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm my choice' }).click();
  await expect(page).toHaveURL(/\/local\/ignite\/passport\.php$/);
  await expect(intro).toHaveCount(0);
  const forge = page.locator('.campfire-team').filter({ hasText: 'Forgelings' });
  await expect(forge).toContainText('Your Campfire');
  await expect(forge).toContainText('You contributed 0 Team XP');
  await forge.getByRole('link', { name: 'Find a course to support your team' }).click();
  await expect(page).toHaveURL(/\/(my\/courses|course\/index)\.php/);
  await page.goto('/mod/page/view.php?id=' + fixture.manualcmid);
  await page.locator('[data-action="toggle-manual-completion"]').first().click();
  await expect(page.locator('.ignite-xp-receipt')).toContainText('+20 Regular XP · +10 Team XP for the Forgelings');
  await page.goto('/local/ignite/passport.php');
  await expect(forge).toContainText('You contributed 10 Team XP');
});

test('My Hearth shows the switched contributor’s Cup, native detail and current team trophies', async ({ page }) => {
  test.skip(!process.env.IGNITE_CUP_TEST, 'Requires the finalized Cup fixture.');
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page, fixture.user);
  await page.goto('/local/ignite/hearth.php');
  const gallery = page.getByRole('region', { name: 'My Campfire Cups' });
  const card = gallery.locator('article');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('positive net Team XP to the Candlelings');
  await expect(card.getByRole('link')).toHaveText(/^Campfire Cup · /);
  const image = card.locator('img');
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'Campfire Cup trophies' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
  await card.getByRole('link').click();
  await expect(page).toHaveURL(/badge.php\?id=/);
  await expect(page.getByRole('heading', { name: /^Campfire Cup · / }).first()).toBeVisible();
  await expect(page.getByText(/positive net Team XP to the Candlelings/).first()).toBeVisible();
});

test('administrator can approve a changed champion through Moodle and clear the review queue', async ({ page }) => {
  const admin = process.env.IGNITE_CUP_REVIEW_ADMIN;
  const password = process.env.IGNITE_CUP_REVIEW_PASSWORD;
  test.skip(!admin || !password, 'Requires the pending correction and private fixture administrator.');
  await page.goto('/login/index.php');
  await page.getByLabel('Username or email', { exact: true }).fill(admin!);
  await page.getByLabel('Password', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.goto('/local/ignite/cupreview.php');
  await expect(page.getByText('Published champions · Forgelings')).toBeVisible();
  await expect(page.getByText('Corrected champions · Lanternlings')).toBeVisible();
  await page.getByRole('button', { name: 'Publish corrected standings and reconcile badges' }).click();
  await expect(page.getByText('No published winners are awaiting review.')).toBeVisible();
});
