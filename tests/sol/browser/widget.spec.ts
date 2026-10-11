import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function ready(page: Page) {
  await page.route('**/api/status', route => route.fulfill({ json: { available: true } }));
}

async function open(page: Page) {
  await page.getByRole('button', { name: 'Ask Sol', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('stays closed until clicked, supports keyboard, and preserves session history', async ({ page, browserName }) => {
  await ready(page);
  await page.route('**/api/chat', route => route.fulfill({ json: { answer: 'The program page lists Ignite’s courses.', destinationIds: ['program'] } }));
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ask Sol', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close Sol', exact: true })).toBeFocused();
  // Safari on macOS uses Option+Tab to include controls when system full keyboard access is off.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('region', { name: 'Conversation history' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Clear conversation', exact: true })).toHaveCount(0);
  const question = page.getByRole('textbox', { name: 'Your question for Sol' });
  await expect(question).toBeEnabled();
  await question.fill('Which courses are listed?');
  await question.press('Enter');
  await expect(page.getByText('The program page lists Ignite’s courses.', { exact: true })).toBeVisible();
  const suggested = page.getByRole('navigation', { name: 'Suggested pages' }).getByRole('link', { name: /Explore the program/ });
  await expect(suggested).toHaveAttribute('href', `${new URL(page.url()).origin}/program`);
  await expect(suggested).toHaveAttribute('rel', 'noopener noreferrer');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ask Sol', exact: true })).toBeFocused();
  await open(page);
  await expect(page.getByText('Which courses are listed?', { exact: true })).toBeVisible();
  await expect(page.getByText('The program page lists Ignite’s courses.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.reload(); await open(page);
  await expect(page.getByText('Which courses are listed?', { exact: true })).toHaveCount(0);
});

test('offline configuration keeps all verified quick links usable', async ({ page }) => {
  await page.goto('/'); await open(page);
  await expect(page.getByText('Conversational replies are unavailable right now.', { exact: false })).toBeVisible();
  await expect(page.getByRole('textbox')).toBeDisabled();
  for (const [label, path] of [['Explore the program', '/program'], ['Join the team', '/hiring'], ['About Ignite', '/about'], ['FAQs', '/faq']]) {
    await expect(page.getByRole('navigation', { name: 'Quick actions' }).getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', `${new URL(page.url()).origin}${path}`);
  }
  await expect(page.getByRole('link', { name: 'Email Ignite', exact: false })).toHaveAttribute('href', 'mailto:ignitefindyourfire@gmail.com');
});

test('API failure offers retry without duplicating visitor messages', async ({ page }) => {
  await ready(page); let calls = 0;
  await page.route('**/api/chat', route => { calls++; return calls === 1
    ? route.fulfill({ status: 502, json: { error: { code: 'reply_failed' } } })
    : route.fulfill({ json: { answer: 'I can help you find Ignite’s FAQs.', destinationIds: ['faq'] } }); });
  await page.goto('/'); await open(page);
  await page.getByRole('textbox').fill('Where are the FAQs?'); await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Retry message' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry message' }).click();
  await expect(page.getByText('I can help you find Ignite’s FAQs.', { exact: true })).toBeVisible();
  await expect(page.getByText('Where are the FAQs?', { exact: true })).toHaveCount(1);
  expect(calls).toBe(2);
});

test('unknown IDs are rejected and malicious input is rendered as text', async ({ page }) => {
  await ready(page); let calls = 0;
  const malicious = '<img src=x onerror="window.solXss=true"><script>window.solXss=true</script>';
  await page.route('**/api/chat', route => { calls++; return route.fulfill({ json: calls === 1
    ? { answer: 'Follow my link', destinationIds: ['https://evil.example'] }
    : { answer: malicious, destinationIds: ['contact'] } }); });
  await page.goto('/'); await open(page);
  await page.getByRole('textbox').fill(malicious); await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Retry message' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Follow my link' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry message' }).click();
  await expect(page.getByText(malicious, { exact: true })).toHaveCount(2);
  expect(await page.evaluate(() => (window as unknown as { solXss?: boolean }).solXss)).toBeUndefined();
  expect(await page.locator('sol-widget').evaluate(element => element.shadowRoot!.querySelectorAll('script, img[onerror]').length)).toBe(0);
});

test('loading, input limits, rate-limit wait, and dismissal are usable', async ({ page }) => {
  await ready(page);
  let release: (() => void) | undefined;
  await page.route('**/api/chat', async route => {
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({ status: 429, json: { error: { code: 'rate_limited', retryAfter: 60 } } });
  });
  await page.goto('/'); await open(page);
  const field = page.getByRole('textbox');
  await field.fill('a'.repeat(1100));
  expect((await field.inputValue()).length).toBe(1000);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Sol is thinking…', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send message' })).toBeDisabled();
  release?.();
  await expect(page.getByRole('button', { name: /Retry in/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  await expect(field).toBeFocused();
  await expect(page.locator('.sol-message')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Retry in/ })).toHaveCount(0);
});

test('reloading a pending request resets history and discards its late reply', async ({ page }) => {
  await ready(page); let release: (() => void) | undefined;
  await page.route('**/api/chat', async route => {
    await new Promise<void>(resolve => { release = resolve; });
    try { await route.fulfill({ json: { answer: 'Late reply', destinationIds: [] } }); } catch { /* browser aborted */ }
  });
  await page.goto('/'); await open(page);
  await page.getByRole('textbox').fill('Hi'); await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Sol is thinking…', { exact: true })).toBeVisible();
  await page.reload(); release?.(); await open(page);
  await expect(page.locator('.sol-message')).toHaveCount(0);
  await expect(page.getByText('Late reply', { exact: true })).toHaveCount(0);
});

test('reduced motion, phone viewport, keyboard inset, and accessibility', async ({ page }, testInfo) => {
  await ready(page); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const art = page.locator('.sol-launcher-art img');
  await expect(art).toHaveAttribute('src', /\/mascots\/Logo\.png$/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(art).toHaveAttribute('src', /\/mascots\/Idle\.gif$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(art).toHaveAttribute('src', /\/mascots\/Logo\.png$/);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-demo.png`, fullPage: true });
  await open(page);
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.sol-header > img')).toHaveAttribute('src', /\/mascots\/Logo\.png$/);
  await expect(dialog.getByText('Your flame companion', { exact: true })).toBeVisible();
  expect(await dialog.locator('.sol-header').evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
  const viewport = page.viewportSize()!;
  const box = (await dialog.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  const scan = await new AxeBuilder({ page }).include('sol-widget').analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-panel.png`, fullPage: true });
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, 'height', { value: 300, configurable: true });
    Object.defineProperty(window.visualViewport!, 'offsetTop', { value: 0, configurable: true });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  const small = (await dialog.boundingBox())!;
  expect(small.y).toBeGreaterThanOrEqual(0); expect(small.y + small.height).toBeLessThanOrEqual(300);
  const input = (await page.getByRole('textbox').boundingBox())!;
  expect(input.y + input.height).toBeLessThanOrEqual(300);
  await page.getByRole('textbox').focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Ask Sol', exact: true })).toBeFocused();
});

test('production loader is embeddable and isolated from host styles', async ({ page }) => {
  await ready(page); await page.goto('/');
  await page.evaluate(() => { const button = document.createElement('button'); button.id = 'host-style-check'; button.textContent = 'Host button'; document.body.append(button); });
  await page.addStyleTag({ content: 'button { background: purple !important; font-size: 45px !important; } p { color: blue !important; }' });
  await page.addScriptTag({ path: 'dist/sol.js' });
  await page.evaluate(() => {
    const container = document.createElement('div'); container.id = 'embed-test'; document.body.append(container);
    const api = (window as unknown as { Sol: { mount: (options: unknown, container: HTMLElement) => unknown } }).Sol;
    api.mount({ backendUrl: location.origin, websiteBaseUrl: 'https://ignitefindyourfire.org', mascotUrl: '/mascots/Mascot.png', loadFonts: false }, container);
    api.mount({}, container); // duplicate mount returns the same widget
  });
  const launcher = page.locator('#embed-test').getByRole('button', { name: 'Ask Sol', exact: true });
  await expect(launcher).toHaveCount(1);
  expect(await launcher.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 248, 240)');
  expect(await launcher.evaluate(element => getComputedStyle(element).fontSize)).toBe('15px');
  expect(await page.locator('#host-style-check').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(128, 0, 128)');
  await launcher.click();
  await expect(page.locator('#embed-test').getByRole('dialog')).toBeVisible();
});
