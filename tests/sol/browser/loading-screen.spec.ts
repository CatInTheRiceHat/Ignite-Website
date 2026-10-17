import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/status', route => route.fulfill({ json: { available: false } }));
});

test('fades a captured closing frame and restores the page without a blank frame', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.loading-screen__video');
  await expect(video).toBeVisible();

  const transition = await video.evaluate(async element => {
    const player = element as HTMLVideoElement;
    const overlay = player.closest('.loading-screen')!;
    const snapshot = overlay.querySelector('canvas')!;
    const frames: {
      opacity: number; width: number; snapshotVisible: boolean; videoHidden: boolean; pixels: number[];
    }[] = [];
    const pixels = (canvas: HTMLCanvasElement) => [0.1, 0.5, 0.9].flatMap(position =>
      Array.from(canvas.getContext('2d')!.getImageData(
        Math.floor(canvas.width * position), Math.floor(canvas.height * position), 1, 1,
      ).data),
    );
    let expectedPixels: number[] = [];
    const initialWidth = document.documentElement.clientWidth;
    await new Promise<void>(resolve => {
      const sample = () => {
        if (!overlay.isConnected) {
          resolve();
          return;
        }
        if (getComputedStyle(snapshot).visibility === 'visible') {
          if (!expectedPixels.length) {
            const reference = document.createElement('canvas');
            reference.width = player.videoWidth;
            reference.height = player.videoHeight;
            reference.getContext('2d')!.drawImage(player, 0, 0);
            expectedPixels = pixels(reference);
            // Simulate a video surface disappearing at the end. The captured
            // image must remain visible independently of the native player.
            player.style.display = 'none';
          }
          frames.push({
            opacity: Number(getComputedStyle(overlay).opacity),
            width: document.documentElement.clientWidth,
            snapshotVisible: getComputedStyle(snapshot).visibility === 'visible',
            videoHidden: getComputedStyle(player).visibility === 'hidden',
            pixels: pixels(snapshot),
          });
        }
        requestAnimationFrame(sample);
      };
      sample();
    });
    return { frames, expectedPixels, initialWidth, finalWidth: document.documentElement.clientWidth };
  });

  const fadingFrames = transition.frames.filter(frame => frame.opacity < 1);
  expect(fadingFrames.length).toBeGreaterThan(2);
  for (const [index, frame] of fadingFrames.entries()) {
    expect(frame.snapshotVisible).toBe(true);
    expect(frame.videoHidden).toBe(true);
    expect(frame.pixels).toEqual(transition.expectedPixels);
    expect(frame.pixels.filter((_, index) => index % 4 === 3)).toEqual([255, 255, 255]);
    expect(frame.width).toBe(transition.initialWidth);
    expect(frame.opacity).toBeLessThanOrEqual(fadingFrames[Math.max(0, index - 1)].opacity);
  }
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
