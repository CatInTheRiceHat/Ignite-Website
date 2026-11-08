import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Only disposable fixtures are accepted. The owner removes the hidden course/account.
const fixtureFile = process.env.IGNITE_MARKDOWN_LIVE_FIXTURE;
test.skip(!fixtureFile, 'Requires a disposable Moodle authoring fixture.');
test.setTimeout(240_000);
const sample = '# Markdown round trip\n\nA [link](https://example.com) and **bold** text.  \nIntentional hard break\n\n- Parent\n    - Nested item\n\n```py\nif True:\n    print("hello 日本語 😀")\n\n```\n\n| Name | Score |\n| --- | --- |\n| Test | 1 |\n';
const editor = page => page.locator('#id_page-markdown-edit .cm-content');
const preview = page => page.locator('#id_page-markdown-preview');
const source = page => page.evaluate(() => window.tinyMCE.get('id_page').getContent({format: 'text'}));
const tab = (page, name) => page.locator('.ignite-markdown-editor').filter({has: page.locator('#id_page-markdown-edit')})
  .getByRole('tab', {name, exact: true});

async function waitForEditor(page) {
  await page.waitForFunction(() => window.tinyMCE?.get('id_page')?.initialized, null, {timeout: 30_000});
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
}
async function savedView(page) {
  await page.waitForURL(url => url.pathname === '/mod/page/view.php', {waitUntil: 'domcontentloaded', timeout: 30_000})
    .catch(async error => {
      console.log('Native save diagnostic:', await page.evaluate(() => ({path: location.pathname,
        errors: [...document.querySelectorAll('.invalid-feedback, [role=alert]')].map(el => el.textContent),
        statuses: [...document.querySelectorAll('.ignite-markdown-editor [role=status]')].map(el => el.textContent),
        textareas: [...document.querySelectorAll('textarea')].map(el => ({id: el.id, length: el.value.length}))})));
      await page.screenshot({path: 'test-results/moodle-markdown-save-diagnostic.png', fullPage: true});
      throw error;
    });
}
async function revealMobileSaveControls(page) {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= 768) return;
  // Boost hides its mobile action footer while the page scrolls down. Scroll up
  // outside CodeMirror to reveal the native controls before clicking Save.
  await page.mouse.move(viewport.width - 5, Math.floor(viewport.height / 2));
  await page.mouse.wheel(0, -160);
  await expect(page.locator('body')).toHaveClass(/\bhasstickyfooter\b/);
  await page.waitForFunction(() => !window.M.util.pending_js.includes('theme_boost/sticky-footer:enabling'));
}
async function paste(page, text) {
  await editor(page).click({timeout: 15_000});
  await expect(editor(page)).toBeFocused();
  await page.keyboard.press('ControlOrMeta+a');
  await expect(editor(page)).toBeFocused();
  if (!text) { await page.keyboard.press('Backspace'); return; }
  await editor(page).evaluate((element, text) => {
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', text);
    clipboard.setData('text/html', `<pre>${text}</pre>`);
    element.dispatchEvent(new ClipboardEvent('paste', {bubbles: true, cancelable: true, clipboardData: clipboard}));
  }, text);
}

async function login(page, fixture) {
  expect(fixture.username).toMatch(/^ignite_md_probe_/);
  expect(fixture.shortname).toMatch(/^IGNITE-MD-PROBE-/);
  await page.goto('/login/index.php');
  await page.locator('#username').fill(fixture.username);
  await page.locator('#password').fill(fixture.password);
  await page.getByRole('button', {name: 'Log in', exact: true}).click();
  await page.waitForURL(url => !url.pathname.includes('/login/'));
}

test('native Page editor preserves source through legacy load, preview, save and reload', async ({page}) => {
  const fixture = JSON.parse(readFileSync(fixtureFile, 'utf8'));
  await login(page, fixture);
  const route = fixture.moduleid ? `/course/modedit.php?update=${fixture.moduleid}&return=1` :
    `/course/modedit.php?add=page&course=${fixture.courseid}&section=0&return=0`;
  await page.goto(route);
  await waitForEditor(page);
  if (fixture.moduleid && fixture.legacy) {
    expect(await source(page)).toBe(fixture.legacy);
    await tab(page, 'Preview').click();
    await expect(preview(page).locator('h2')).toHaveText('Legacy document');
    await expect(preview(page).locator('pre')).toContainText('    print("legacy")');
    await page.getByRole('button', {name: 'Save and display', exact: true}).click({timeout: 15_000});
    await savedView(page);
    await expect(page.locator('[role=main] h2').filter({hasText: 'Legacy document'})).toBeVisible();
    await page.goto(route); await waitForEditor(page);
    expect(await source(page)).toBe(fixture.legacy);
    await page.goto(`/course/modedit.php?add=page&course=${fixture.courseid}&section=0&return=0`);
    await waitForEditor(page);
  }
  await page.locator('#id_name').fill('Temporary Markdown round trip');
  await paste(page, sample);
  expect(await source(page)).toBe(sample);
  await page.keyboard.press('Enter');
  await page.keyboard.type('Unsaved edit');
  const draft = sample + '\nUnsaved edit';
  for (let i = 0; i < 3; i++) {
    await tab(page, 'Preview').click();
    await expect(preview(page).locator('h1')).toHaveText('Markdown round trip');
    await expect(preview(page)).toContainText('Unsaved edit');
    await expect(preview(page).locator('ul ul li')).toHaveText('Nested item');
    await expect(preview(page).locator('table td').first()).toHaveText('Test');
    await expect(preview(page).locator('code')).toHaveText('if True:\n    print("hello 日本語 😀")\n\n');
    await tab(page, 'Edit').click();
    expect(await source(page)).toBe(draft);
  }
  await editor(page).focus();
  await page.keyboard.press('ControlOrMeta+z');
  expect(await source(page)).toBe(sample);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  expect(await source(page)).toBe(draft);
  await page.keyboard.press('ArrowLeft');
  await tab(page, 'Preview').click(); await tab(page, 'Edit').click();
  await editor(page).focus(); await page.keyboard.type('X');
  expect(await source(page)).toBe(draft.slice(0, -1) + 'X' + draft.slice(-1));
  await page.keyboard.press('ControlOrMeta+z');
  expect(await source(page)).toBe(draft);
  await tab(page, 'Preview').click();
  await expect(preview(page).locator('h1')).toHaveText('Markdown round trip');
  const expected = await preview(page).innerText();
  await page.screenshot({path: 'test-results/moodle-markdown-preview.png', fullPage: true});
  await page.getByRole('button', {name: 'Save and display', exact: true}).click({timeout: 15_000});
  await savedView(page);
  const moduleid = new URL(page.url()).searchParams.get('id');
  const content = page.locator('[role=main] .box.generalbox').filter({has: page.locator('h1')});
  await expect(content.locator('h1')).toHaveText('Markdown round trip');
  // Compare browser rendering, allowing Moodle's native overflow wrapper and inert
  // source comment. Literal code whitespace and the Markdown source are checked separately.
  expect(await content.innerText()).toBe(expected);
  await expect(content.locator('code')).toHaveText('if True:\n    print("hello 日本語 😀")\n\n');
  await page.reload();
  await expect(content.locator('ul ul li')).toHaveText('Nested item');
  await page.goto(`/course/modedit.php?update=${moduleid}&return=1`); await waitForEditor(page);
  expect(await source(page)).toBe(draft);
  const closeIndex = page.getByRole('button', {name: 'Close course index', exact: true});
  if (await closeIndex.isVisible()) {
    await closeIndex.click();
    // Moodle returns focus to the drawer toggle after its close transition.
    await page.waitForFunction(() => !window.M.util.pending_js.includes('theme_boost/drawers:close'));
  }
  await page.setViewportSize({width: 375, height: 812});
  const line = 'A long line with soft wrapping. '.repeat(120);
  await paste(page, line);
  expect(await source(page)).toBe(line);
  const width = await editor(page).evaluate(el => ({width: el.getBoundingClientRect().width, scroll: el.scrollWidth}));
  expect(width.width).toBeLessThan(375);
  expect(width.scroll).toBeLessThan(375);
  await paste(page, ''); expect(await source(page)).toBe('');
  await tab(page, 'Preview').click(); await expect(preview(page)).toHaveText('');
  await tab(page, 'Edit').click();
  await paste(page, draft);
  // Save directly from Edit, without visiting Preview for this changed draft.
  await revealMobileSaveControls(page);
  await page.getByRole('button', {name: 'Save and display', exact: true}).click({timeout: 15_000});
  await savedView(page);
  await page.goto(`/course/modedit.php?update=${moduleid}&return=1`); await waitForEditor(page);
  expect(await source(page)).toBe(draft);
  await page.screenshot({path: 'test-results/moodle-markdown-source-mobile.png', fullPage: true});
});

test('native autosave restores the newest source after a delayed response and keeps document scopes separate', async ({page}) => {
  const fixture = JSON.parse(readFileSync(fixtureFile, 'utf8'));
  await login(page, fixture);
  await page.goto(`/course/modedit.php?add=page&course=${fixture.courseid}&section=0&return=0`);
  await waitForEditor(page);
  let release;
  let stored;
  let finished;
  const firstStored = new Promise(resolve => { stored = resolve; });
  const secondFinished = new Promise(resolve => { finished = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  let updates = 0;
  const drafts = [];
  await page.route('**/lib/ajax/service.php*', async route => {
    const data = route.request().postDataJSON();
    const update = Array.isArray(data) && data.find(item => item.methodname === 'tiny_autosave_update_session' &&
      item.args.elementid === 'id_page');
    if (!update) { await route.continue(); return; }
    drafts.push(update.args);
    const sequence = ++updates;
    const response = await route.fetch();
    if (sequence === 1) {
      stored();
      await held;
    }
    await route.fulfill({response});
    if (sequence === 2) finished();
  });
  await paste(page, sample + 'First draft');
  await expect.poll(() => updates, {timeout: 15_000}).toBe(1);
  await firstStored;
  await paste(page, sample + 'Newest draft');
  await expect.poll(() => updates, {timeout: 15_000}).toBe(2);
  await secondFinished;
  release();
  expect(await source(page)).toBe(sample + 'Newest draft');
  expect(drafts[0].elementid).toBe('id_page');
  expect(drafts[1].pagehash).toBe(drafts[0].pagehash);
  await page.unroute('**/lib/ajax/service.php*');
  await page.reload(); await waitForEditor(page);
  expect(await source(page)).toBe(sample + 'Newest draft');
  if (fixture.moduleid) {
    await page.goto(`/course/modedit.php?update=${fixture.moduleid}&return=1`); await waitForEditor(page);
    expect(await source(page)).toBe(fixture.legacy);
  }
});
