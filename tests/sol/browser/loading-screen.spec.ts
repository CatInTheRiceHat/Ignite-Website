import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/status', route => route.fulfill({ json: { available: false } }));
});

test('holds the closing video frame through a smooth fade and restores the page', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.loading-screen__video');
  await expect(video).toBeVisible();

  const transition = await video.evaluate(async element => {
    const player = element as HTMLVideoElement;
    const overlay = player.closest('.loading-screen')!;
    const frames: { opacity: number; time: number; paused: boolean; ended: boolean; width: number }[] = [];
    const initialWidth = document.documentElement.clientWidth;
    await new Promise<void>(resolve => {
      const sample = () => {
        if (!overlay.isConnected) {
          resolve();
          return;
        }
        if (player.paused) {
          frames.push({
            opacity: Number(getComputedStyle(overlay).opacity),
            time: player.currentTime,
            paused: player.paused,
            ended: player.ended,
            width: document.documentElement.clientWidth,
          });
        }
        requestAnimationFrame(sample);
      };
      sample();
    });
    return { frames, initialWidth, finalWidth: document.documentElement.clientWidth, duration: player.duration };
  });

  const fadingFrames = transition.frames.filter(frame => frame.opacity < 1);
  expect(fadingFrames.length).toBeGreaterThan(2);
  for (const [index, frame] of fadingFrames.entries()) {
    expect(frame.paused).toBe(true);
    expect(frame.ended).toBe(false);
    expect(frame.time).toBe(fadingFrames[0].time);
    expect(frame.width).toBe(transition.initialWidth);
    expect(frame.opacity).toBeLessThanOrEqual(fadingFrames[Math.max(0, index - 1)].opacity);
  }
  expect(transition.duration - fadingFrames[0].time).toBeGreaterThan(0);
  expect(transition.duration - fadingFrames[0].time).toBeLessThan(0.2);
  expect(transition.finalWidth).toBe(transition.initialWidth);
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveAttribute('data-intro-loading');
  expect(await page.locator('body').evaluate(body => body.style.overflow)).toBe('');
  await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
});

test('skip and Escape dismiss the intro and unlock scrolling', async ({ page }) => {
  for (const action of ['skip', 'escape']) {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('ignite:intro-seen'));
    await page.reload();
    await expect(page.locator('.loading-screen')).toBeVisible();
    if (action === 'skip') await page.getByRole('button', { name: 'Skip intro' }).click();
    else await page.keyboard.press('Escape');
    await expect(page.locator('.loading-screen')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-intro-loading');
    expect(await page.locator('body').evaluate(body => body.style.overflow)).toBe('');
  }
});

test('a failed video download reveals the website', async ({ page }) => {
  await page.route('**/backgrounds/Loading*', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveAttribute('data-intro-loading');
  await expect(page.getByRole('link', { name: 'Explore Course Plans', exact: true })).toBeVisible();
});
