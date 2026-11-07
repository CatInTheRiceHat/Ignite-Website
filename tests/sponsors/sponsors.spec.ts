import { test, expect } from '@playwright/test';

const tiers = [
  ['Ember', '$250–$999', 'rgb(245, 164, 155)'],
  ['Flare', '$1,000–$4,999', 'rgb(255, 188, 135)'],
  ['Solaris', '$5,000–$9,999', 'rgb(248, 219, 138)'],
  ['Cobalt', '$10,000–$49,999', 'rgb(157, 191, 242)'],
  ['Nova', '$50,000+', 'rgb(206, 185, 243)'],
];

test('arrow keys move one tier at a time in thermometer order and stop at each end', async ({ page }) => {
  await page.goto('/sponsors');
  const stage = page.locator('.sponsors-stage');
  await expect(stage).toHaveAttribute('data-tier', 'Ember');
  const stops = [0, 0.25, 0.44, 0.64, 0.96];
  const settledAt = async (index: number) => {
    await expect(stage).toHaveAttribute('data-tier', tiers[index][0]);
    await expect.poll(() => page.evaluate((stop) => {
      const journey = document.querySelector<HTMLElement>('.sponsors-journey')!;
      const stage = document.querySelector<HTMLElement>('.sponsors-stage')!;
      return Math.abs(window.scrollY - (journey.offsetTop + stop * (journey.offsetHeight - stage.clientHeight)));
    }, stops[index])).toBeLessThanOrEqual(1);
  };
  await page.keyboard.press('ArrowDown');
  await settledAt(0);
  for (let i = 1; i < tiers.length; i++) {
    await page.keyboard.press('ArrowUp');
    await settledAt(i);
  }
  await expect(page.locator('.sponsors-scroll-overlay')).toHaveCSS('opacity', '0');
  await page.keyboard.press('ArrowUp');
  await settledAt(4);
  for (let i = tiers.length - 2; i >= 0; i--) {
    await page.keyboard.press('ArrowDown');
    await settledAt(i);
  }
  await page.keyboard.press('ArrowDown');
  await settledAt(0);
});

test('rapid arrow presses advance to separate tiers and leave text editing alone', async ({ page }) => {
  await page.goto('/sponsors');
  const stage = page.locator('.sponsors-stage');
  await expect(stage).toHaveAttribute('data-tier', 'Ember');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(stage).toHaveAttribute('data-tier', 'Solaris');
  await expect.poll(() => page.evaluate(() => {
    const journey = document.querySelector<HTMLElement>('.sponsors-journey')!;
    const stage = document.querySelector<HTMLElement>('.sponsors-stage')!;
    return Math.abs(window.scrollY - (journey.offsetTop + 0.44 * (journey.offsetHeight - stage.clientHeight)));
  })).toBeLessThanOrEqual(1);
  const repeatedWasAllowed = await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: true, cancelable: true })));
  expect(repeatedWasAllowed).toBe(false);
  await expect(stage).toHaveAttribute('data-tier', 'Solaris');
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Keyboard editing check');
    input.style.cssText = 'position:fixed;top:0;left:0;z-index:100';
    document.body.append(input);
    input.focus();
  });
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');
  await expect(stage).toHaveAttribute('data-tier', 'Solaris');
  await page.getByRole('textbox', { name: 'Keyboard editing check' }).evaluate((input) => input.remove());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(stage).toHaveAttribute('data-tier', 'Ember');
  await page.keyboard.press('ArrowUp');
  await expect(stage).toHaveAttribute('data-tier', 'Flare');
});

test('the camera climbs through the original PNGs and the five exact tiers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/sponsors');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  const glass = page.locator('.sponsor-glass');
  const opening = await glass.boundingBox();
  const original = await glass.locator('img').boundingBox();
  expect(original!.width / original!.height).toBeCloseTo(1536 / 2995, 4);
  await expect(glass.locator('svg')).toHaveCount(0);
  expect(opening!.x + opening!.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0);
  await expect(page.locator('sol-widget')).toBeHidden();
  let previousMascotWidth = 0;
  for (let i = 0; i < tiers.length; i++) {
    const [name, range, color] = tiers[i];
    await page.getByRole('button', { name: `${name} Tier, ${range}`, exact: true }).click();
    await expect(page.locator('.sponsors-stage')).toHaveAttribute('data-tier', name);
    const tier = page.locator('.sponsor-tier').nth(i);
    const card = tier.locator('.sponsor-tier-card');
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('background-color', color);
    await expect(card).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(card.locator('h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(card.locator('h2')).toHaveText(`${name} Tier`);
    await expect(card.locator('.sponsor-tier-range')).toHaveText(range);
    await expect(page.locator('.sponsor-character').nth(i).locator('img')).toHaveAttribute('src', `/sponsors/sponsorship/${name}.png?v=20261106-2046`);
    await expect.poll(async () => (await glass.boundingBox())!.x).toBeCloseTo(opening!.x, 0);
    // The original, shorter thermometer shows one tier at a time.
    if (i > 0) await expect(page.locator('.sponsor-tier-card').nth(i - 1)).toHaveCSS('opacity', '0');
    const box = await card.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    if (i < 4) {
      await expect(page.locator('.sponsor-character').nth(i).locator('.sponsor-mascot-position > div')).toHaveCSS('transform', 'none');
      const mascot = await page.locator('.sponsor-character').nth(i).locator('img').boundingBox();
      expect(mascot!.width).toBeGreaterThan(previousMascotWidth);
      if (i === 0) {
        const { width, height } = page.viewportSize()!;
        const mobile = width < 640;
        const compact = width <= 900 || height <= 600;
        const originalSize = Math.min(width * (mobile ? 0.44 : compact ? 0.30 : 0.32), height * (mobile ? 0.34 : compact ? 0.36 : 0.41));
        expect(mascot!.width).toBeCloseTo(originalSize, 0);
      }
      previousMascotWidth = mascot!.width;
      expect(mascot!.x + mascot!.width).toBeLessThan(box!.x);
      if (page.viewportSize()!.width >= 640) {
        await expect(page.locator('.sponsor-character').nth(i).locator('.sponsor-mascot-position > div')).toHaveCSS('transform', 'none');
        const settledMascot = await page.locator('.sponsor-character').nth(i).locator('img').boundingBox();
        expect(box!.x + settledMascot!.x + settledMascot!.width).toBeCloseTo(page.viewportSize()!.width, 0);
      }
      expect((await card.locator('.sponsor-tier-description').innerText()).split(/\s+/).length).toBeGreaterThan(30);
    }
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
});

test('Nova looms largest with a bottom fade and the finale holds', async ({ page }) => {
  await page.goto('/sponsors');
  await expect(page.locator('.sponsor-mascot').first()).toHaveCSS('opacity', '1');
  const novaBaseSize = await page.locator('.sponsors-stage').evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--mascot-size')));
  await page.getByRole('button', { name: 'Nova Tier, $50,000+', exact: true }).click();
  const finalCard = page.locator('.sponsor-tier--nova .sponsor-tier-card');
  await expect(finalCard).toHaveCSS('opacity', '1');
  await expect.poll(async () => (await page.locator('.sponsor-tier--nova img').boundingBox())!.width / novaBaseSize).toBeCloseTo(2, 1);
  await expect(page.locator('.sponsors-nova-atmosphere')).toHaveCSS('opacity', '1');
  expect(await page.locator('.sponsor-tier--nova .sponsor-mascot img').evaluate((el) => getComputedStyle(el).maskImage)).toContain('linear-gradient');
  // Wait for the camera and mascot scale to finish settling before frame checks.
  await page.waitForTimeout(800);
  const nova = await page.locator('.sponsor-tier--nova img').boundingBox();
  const tip = await page.locator('.sponsor-glass').boundingBox();
  const screen = page.viewportSize()!;
  expect(nova!.x + nova!.width / 2).toBeCloseTo(screen.width / 2, 0);
  expect(tip!.x + tip!.width / 2).toBeCloseTo(screen.width / 2, 0);
  const card = await finalCard.boundingBox();
  const impactRegion = page.getByRole('region', { name: 'Nova sponsorship impact' });
  await expect(impactRegion).toContainText('As a Founding Sponsor, you support our free learning mission from the beginning.');
  await expect(impactRegion.getByRole('listitem')).toHaveCount(3);
  const impact = await impactRegion.boundingBox();
  expect(impact!.x).toBeGreaterThanOrEqual(0);
  expect(impact!.y).toBeGreaterThanOrEqual(0);
  expect(impact!.y + impact!.height).toBeLessThanOrEqual(screen.height);
  expect(card!.y + card!.height / 2).toBeCloseTo(impact!.y + impact!.height / 2, 0);
  expect(card!.x).toBeGreaterThanOrEqual(0);
  expect(card!.y).toBeGreaterThanOrEqual(0);
  expect(card!.y + card!.height).toBeLessThanOrEqual(screen.height);
  expect(card!.x + card!.width).toBeLessThanOrEqual(screen.width);
  expect(nova!.x).toBeGreaterThanOrEqual(0);
  expect(nova!.y).toBeGreaterThanOrEqual(0);
  expect(nova!.x + nova!.width).toBeLessThan(screen.width);
  expect(nova!.y + nova!.height).toBeLessThan(screen.height);
  expect(tip!.y).toBeLessThan(screen.height - 50);
  await expect(finalCard.locator('.sponsor-founding')).toHaveText('Founding Sponsor');
  await expect(finalCard.locator('.sponsor-founding')).toHaveCSS('border-top-color', 'rgb(252, 248, 255)');
  expect(await page.locator('.sponsors-glass-layer').evaluate((el) => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(await page.locator('.sponsor-character.sponsor-tier--nova').evaluate((el) => Number(getComputedStyle(el).zIndex)));
  const held = await page.locator('.sponsor-glass').boundingBox();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  expect((await page.locator('.sponsor-glass').boundingBox())!.y).toBeCloseTo(held!.y, 0);
  const partnerships = page.getByRole('link', { name: 'Not interested in sponsoring? Check out our partnership options' });
  await expect(partnerships).toHaveAttribute('href', '/partnerships');
  await expect(partnerships).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(partnerships).toHaveCSS('white-space', 'nowrap');
});

test('the black scroll overlay fades once and the journey stays user-controlled', async ({ page }) => {
  await page.goto('/sponsors');
  await expect(page.locator('.sponsors-scroll-overlay')).toHaveCSS('opacity', '1');
  await expect(page.locator('.sponsors-scroll-overlay')).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(page.getByRole('button', { name: /play journey|pause journey|replay journey/i })).toHaveCount(0);
  await page.mouse.wheel(0, 200);
  await expect(page.locator('.sponsors-scroll-overlay')).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.sponsors-scroll-overlay')).toHaveCSS('opacity', '0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.getByRole('button', { name: 'Nova Tier, $50,000+', exact: true }).click();
  await expect(page.locator('.sponsors-stage')).toHaveAttribute('data-tier', 'Nova');
  await expect(page.locator('.sponsor-tier--nova .sponsor-tier-card')).toHaveCSS('opacity', '1');
});

test('mascots emerge behind the glass and glide aside while the camera stops with the scroll', async ({ page }) => {
  await page.goto('/sponsors');
  await expect(page.locator('.sponsor-tier-card').first()).toHaveCSS('opacity', '1');
  const samples = await page.evaluate(async () => {
    const journey = document.querySelector<HTMLElement>('.sponsors-journey')!;
    const stage = document.querySelector<HTMLElement>('.sponsors-stage')!;
    const mascot = document.querySelectorAll<HTMLElement>('.sponsor-mascot')[1];
    const image = mascot.querySelector('img')!;
    const cast = document.querySelector<HTMLElement>('.sponsors-cast')!;
    const glass = document.querySelector<HTMLElement>('.sponsors-glass-layer')!;
    const samples: { center: number; width: number; opacity: number; camera: string; time: number }[] = [];
    window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - stage.clientHeight) * 0.18, behavior: 'instant' });
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const sample = () => {
        const rect = image.getBoundingClientRect();
        const time = performance.now() - started;
        samples.push({ center: rect.x + rect.width / 2, width: rect.width, opacity: Number(getComputedStyle(mascot).opacity), camera: getComputedStyle(cast).transform, time });
        if (time < 1200) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    return { samples, castLayer: Number(getComputedStyle(cast).zIndex), glassLayer: Number(getComputedStyle(glass).zIndex) };
  });
  const early = samples.samples[0];
  await expect(page.locator('.sponsor-character').nth(1).locator('.sponsor-mascot-position > div')).toHaveCSS('transform', 'none');
  const finalBox = await page.locator('.sponsor-character').nth(1).locator('img').boundingBox();
  const final = { ...samples.samples.at(-1)!, center: finalBox!.x + finalBox!.width / 2, width: finalBox!.width };
  expect(samples.castLayer).toBeLessThan(samples.glassLayer);
  expect(early.center).toBeGreaterThan(final.center + 20);
  expect(early.width).toBeLessThan(final.width);
  expect(samples.samples.find((sample) => sample.time > 100)!.camera).toBe(final.camera);
});
