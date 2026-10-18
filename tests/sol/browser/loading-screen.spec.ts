import { expect, test, type Page } from '@playwright/test';

function expectedVideo(page: Page) {
  const mobile = page.viewportSize()!.width < 768;
  return {
    width: mobile ? 1080 : 1920,
    height: mobile ? 1920 : 1080,
    src: mobile ? '/backgrounds/Loading%20Screen%20Mobile.mp4?v=1' : '/backgrounds/Loading%20Screen.mp4?v=4',
    poster: mobile ? '/backgrounds/Loading%20Screen%20Mobile.webp' : '/backgrounds/Loading%20Screen.webp',
  };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/status', route => route.fulfill({ json: { available: false } }));
});

async function startIntro(page: Page) {
  const video = page.locator('.loading-screen__video');
  const play = page.getByRole('button', { name: 'Play intro', exact: true });
  await expect.poll(async () =>
    await play.isVisible() || await video.evaluate(element => (element as HTMLVideoElement).currentTime > 0.1),
  ).toBe(true);
  if (await play.isVisible()) await play.click();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
}

test('starts playback even when the browser never reports canplaythrough', async ({ page }) => {
  await page.addInitScript(() => {
    const readyState = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'readyState')!;
    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get() { return Math.min(HTMLMediaElement.HAVE_FUTURE_DATA, readyState.get!.call(this)); },
    });
    document.addEventListener('canplaythrough', event => event.stopImmediatePropagation(), true);
  });
  await page.goto('/');
  await startIntro(page);
  const video = page.locator('.loading-screen__video');
  await expect(video).toHaveAttribute('src', expectedVideo(page).src);
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.5);
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
});

test('fades a captured closing frame and restores the page without a blank frame', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.loading-screen__video');
  await expect(video).toBeVisible();
  await startIntro(page);

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
    let capturedAt = 0;
    const initialWidth = document.documentElement.clientWidth;
    await new Promise<void>(resolve => {
      const sample = () => {
        if (!overlay.isConnected) {
          resolve();
          return;
        }
        if (getComputedStyle(snapshot).visibility === 'visible') {
          if (!expectedPixels.length) {
            capturedAt = player.currentTime;
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
    return {
      frames, expectedPixels, capturedAt, duration: player.duration,
      snapshotWidth: snapshot.width, snapshotHeight: snapshot.height,
      initialWidth, finalWidth: document.documentElement.clientWidth,
    };
  });

  expect(transition.capturedAt).toBeGreaterThan(transition.duration - 0.2);
  expect(transition.capturedAt).toBeLessThan(transition.duration);
  expect(transition.snapshotWidth).toBe(expectedVideo(page).width);
  expect(transition.snapshotHeight).toBe(expectedVideo(page).height);
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

test('keeps the original video size and crop through the closing-frame handoff', async ({ page }) => {
  const requestedVideos = new Set<string>();
  page.on('request', request => {
    if (request.url().includes('.mp4')) requestedVideos.add(new URL(request.url()).pathname);
  });
  await page.goto('/');
  await startIntro(page);
  const geometry = await page.locator('.loading-screen__video').evaluate(async element => {
    const player = element as HTMLVideoElement;
    const snapshot = player.closest('.loading-screen')!.querySelector('canvas')!;
    const videoBounds = player.getBoundingClientRect().toJSON();
    const videoFit = getComputedStyle(player).objectFit;
    await new Promise<void>(resolve => {
      const sample = () => {
        if (getComputedStyle(snapshot).visibility === 'visible') resolve();
        else requestAnimationFrame(sample);
      };
      sample();
    });
    return {
      width: player.videoWidth, height: player.videoHeight, src: player.currentSrc,
      videoBounds, snapshotBounds: snapshot.getBoundingClientRect().toJSON(),
      videoFit, snapshotFit: getComputedStyle(snapshot).objectFit,
    };
  });
  const expected = expectedVideo(page);
  expect(geometry.width).toBe(expected.width);
  expect(geometry.height).toBe(expected.height);
  expect(geometry.src).toBe(new URL(expected.src, page.url()).href);
  expect([...requestedVideos]).toEqual([expected.src.split('?')[0]]);
  expect(geometry.videoBounds).toEqual(geometry.snapshotBounds);
  expect(geometry.videoFit).toBe('cover');
  expect(geometry.snapshotFit).toBe(geometry.videoFit);
});

test('shows a poster while buffering and plays once the video arrives', async ({ page }) => {
  let releaseVideo!: () => void;
  const download = new Promise<void>(resolve => { releaseVideo = resolve; });
  await page.route('**/backgrounds/Loading*.mp4*', async route => {
    await download;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const video = page.locator('.loading-screen__video');
    await expect(video).toBeVisible();
    const expected = expectedVideo(page);
    await expect(video).toHaveAttribute('poster', expected.poster);
    const poster = await video.evaluate(async element => {
      const player = element as HTMLVideoElement;
      const image = new Image();
      image.src = player.poster;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight, currentTime: player.currentTime };
    });
    expect(poster).toEqual({ width: expected.width, height: expected.height, currentTime: 0 });
    await expect(page.locator('body')).toHaveAttribute('data-intro-loading', 'true');
    releaseVideo();
    await startIntro(page);
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await expect(page.locator('.loading-screen')).toHaveCount(0);
  } finally {
    releaseVideo();
  }
});

test('offers playback when autoplay is blocked without dismissing the intro', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let clicked = false;
    document.addEventListener('click', event => { if (event.isTrusted) clicked = true; }, true);
    HTMLMediaElement.prototype.play = function () {
      if (!clicked) {
        return Promise.reject(new DOMException('Autoplay requires a gesture', 'NotAllowedError'));
      }
      return play.call(this);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play intro', exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('ignite:intro-seen'))).toBeNull();
  await startIntro(page);
  await expect(page.getByRole('button', { name: 'Play intro', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
});

test('offers a Play button when autoplay stays pending', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let clicked = false;
    document.addEventListener('click', event => { if (event.isTrusted) clicked = true; }, true);
    HTMLMediaElement.prototype.play = function () {
      if (!clicked) return new Promise<void>(() => {});
      return play.call(this);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play intro', exact: true })).toBeVisible();
  expect(await page.locator('.loading-screen__video').evaluate(element => (element as HTMLVideoElement).currentTime)).toBe(0);
  await startIntro(page);
  await expect(page.getByRole('button', { name: 'Play intro', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Skip intro' }).click();
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
