import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Opt in only with a disposable teacher account and a hidden course created for this check.
// The fixture's owner must remove the course and deactivate its account after the run.
const fixtureFile = process.env.IGNITE_MARKDOWN_LIVE_FIXTURE;
test.skip(!fixtureFile, 'Requires a disposable Moodle teacher/course fixture.');

async function waitForCourseEditor(page) {
  await page.waitForFunction(() => window.tinyMCE?.get('id_page')?.initialized);
  await page.evaluate(async () => {
    window.markdownAutosaveOptions = await new Promise(resolve => window.require(['tiny_autosave/options'], resolve));
  });
  await page.waitForFunction(() => window.markdownAutosaveOptions.isInitialised(window.tinyMCE.get('id_page')));
}

test('real course editor formats copied fences and preserves typed and pasted code after saving', async ({ page }) => {
  const fixture = JSON.parse(readFileSync(fixtureFile, 'utf8'));
  expect(fixture.username).toMatch(/^ignite_md_probe_/);
  expect(fixture.shortname).toMatch(/^IGNITE-MD-PROBE-/);
  const courseid = Number(fixture.courseid);
  expect(Number.isInteger(courseid) && courseid > 1).toBe(true);

  await page.goto('/login/index.php', { waitUntil: 'domcontentloaded' });
  await page.locator('#username').fill(fixture.username);
  await page.locator('#password').fill(fixture.password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(url => !url.pathname.includes('/login/'), { waitUntil: 'domcontentloaded' });
  await page.goto(`/course/modedit.php?add=page&course=${courseid}&section=0&return=0`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForCourseEditor(page);
  expect(await page.evaluate(() => window.tinyMCE.get('id_page').options.get('plugins')))
    .toContain('tiny_ignite_markdown/plugin');
  await page.locator('#id_name').fill('Temporary Markdown save verification');
  const body = page.frameLocator('#id_page_ifr').locator('body');
  // Native autosave may restore this disposable account's earlier failed verification draft.
  await page.evaluate(() => {
    const editor = window.tinyMCE.get('id_page');
    editor.setContent('<p><br></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
  });
  await body.click();
  await page.keyboard.type('```py');
  await page.keyboard.press('Enter');
  await page.keyboard.type('if True:');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.type('print("hello")');
  await page.keyboard.press('Enter');
  await page.keyboard.type('```');
  await page.keyboard.press('Enter');
  await test.info().attach('native-code-before-save.html', {
    body: await page.evaluate(() => window.tinyMCE.get('id_page').getContent()), contentType: 'text/html',
  });
  await expect(body.locator('.ignite-code-block code')).toHaveText('if True:\n    print("hello")');

  await page.evaluate(() => {
    const markdown = '```py\nprint("pasted")\n```';
    const data = new DataTransfer();
    data.setData('text/plain', markdown);
    data.setData('text/html', `<pre>${markdown}</pre>`);
    window.tinyMCE.get('id_page').getBody().dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true, cancelable: true, clipboardData: data,
    }));
  });
  await expect(body.locator('.ignite-code-block')).toHaveCount(2);
  await expect(body.locator('.ignite-code-block code').nth(1)).toHaveText('print("pasted")');
  await expect(body.locator('code span').filter({ hasText: '"pasted"' })).toHaveCSS('color', 'rgb(158, 214, 158)');

  await page.getByRole('button', { name: 'Save and display', exact: true }).click();
  await page.waitForURL(url => url.pathname === '/mod/page/view.php', { waitUntil: 'domcontentloaded' });
  const moduleid = new URL(page.url()).searchParams.get('id');
  await expect(page.locator('.ignite-code-block')).toHaveCount(2);
  await expect(page.locator('.ignite-code-block code').first()).toHaveText('if True:\n    print("hello")');
  await expect(page.locator('.ignite-code-block').first()).toHaveCSS('background-color', 'rgb(43, 45, 49)');
  await expect(page.locator('code span').filter({ hasText: '"pasted"' })).toHaveCSS('color', 'rgb(158, 214, 158)');
  await page.screenshot({ path: 'test-results/moodle-live-code-blocks.png', fullPage: true });

  await page.goto(`/course/modedit.php?update=${moduleid}&return=1`, { waitUntil: 'domcontentloaded' });
  await waitForCourseEditor(page);
  const reopened = page.frameLocator('#id_page_ifr').locator('body');
  await expect(reopened.locator('.ignite-code-block')).toHaveCount(2);
  await expect(reopened.locator('.ignite-code-block code').first()).toHaveText('if True:\n    print("hello")');
  await expect(reopened.locator('code span').filter({ hasText: '"pasted"' })).toHaveCSS('color', 'rgb(158, 214, 158)');
});
