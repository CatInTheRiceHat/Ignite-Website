import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/status', route => route.fulfill({ json: { available: false } }));
});

test('debug mode replays a seen intro and exports its completion and page errors', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('ignite:intro-seen', 'true'));
  await page.goto('/?intro=debug');
  const panel = page.getByRole('complementary', { name: 'Intro diagnostics' });
  await expect(panel).toBeVisible();
  await expect(page.locator('.loading-screen')).toBeVisible();
  await expect.poll(() => page.locator('video').evaluate(video => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Diagnostic test error' })));
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(panel).toContainText('Website revealed');
  await expect(panel).toContainText('Scroll unlocked');

  const downloadPromise = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download report' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('ignite-intro-debug.json');
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  const report = JSON.parse(content);
  expect(report.scrollLocked).toBe(false);
  expect(report.pageInert).toBe(false);
  expect(report.events).toEqual(expect.arrayContaining([
    expect.objectContaining({ event: 'video:first-frame' }),
    expect.objectContaining({ event: 'intro:completion-requested', details: { reason: 'skip' } }),
    expect.objectContaining({ event: 'intro:cleanup' }),
    expect.objectContaining({ event: 'page:error', details: { message: 'Diagnostic test error' } }),
  ]));
  await panel.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(page.locator('.loading-screen')).toBeVisible();
});

test('debug report identifies a media failure and the website stays usable', async ({ page }) => {
  await page.route('**/backgrounds/Loading*.mp4*', route => route.abort());
  await page.goto('/?intro=debug');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download report' }).click();
  const stream = await (await downloadPromise).createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  const report = JSON.parse(content);
  expect(report.events).toContainEqual(expect.objectContaining({
    // WebKit can reject play() before dispatching the player's error event.
    event: 'intro:completion-requested', details: { reason: expect.stringMatching(/^(media|play)-error$/) },
  }));
  expect(report.events).toContainEqual(expect.objectContaining({ event: 'resource:error' }));
  expect(report.scrollLocked).toBe(false);
  await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();
});

test('bypassing the intro avoids the video download without marking it seen', async ({ page }) => {
  const videos: string[] = [];
  page.on('request', request => { if (request.url().includes('.mp4')) videos.push(request.url()); });
  await page.goto('/?intro=skip');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Intro diagnostics' })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('ignite:intro-seen'))).toBeNull();
  await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();
  expect(videos).toEqual([]);
});
