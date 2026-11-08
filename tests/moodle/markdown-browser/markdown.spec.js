import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const plugin = readFileSync(new URL('../../../moodle/tiny/ignite_markdown/amd/build/plugin.min.js', import.meta.url), 'utf8');
const source = readFileSync(new URL('../../../moodle/tiny/ignite_markdown/amd/build/source.min.js', import.meta.url), 'utf8');
const sample = '# Heading\n\nParagraph with [a link](https://example.com).  \nNext line\n\n- Parent\n    - Nested\n\n```py\nif True:\n    print("hello")\n\n```\n\n| Name | Score |\n| --- | --- |\n| Test | 1 |\n';

const input = page => page.locator('#markdown-test-markdown-edit .cm-content');
const text = page => page.evaluate(() => window.testEditor.getContent({format: 'text'}));
const body = page => page.locator('#markdown-test-markdown-preview');
async function replace(page, value) {
  await input(page).click();
  await page.keyboard.press('ControlOrMeta+a');
  if (!value) {
    await page.keyboard.press('Backspace');
    return;
  }
  await input(page).evaluate((element, text) => {
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', text);
    clipboard.setData('text/html', `<pre>${text}</pre>`);
    element.dispatchEvent(new ClipboardEvent('paste', {bubbles: true, cancelable: true, clipboardData: clipboard}));
  }, value);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/login/index.php', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html><head><style>[hidden]{display:none!important}*{box-sizing:border-box}body{margin:8px}</style></head><body></body></html>',
  }));
  await page.goto('/login/index.php');
  const base = 'https://learn.ignitefindyourfire.org/lib/editor/tiny/js/tinymce';
  await page.addScriptTag({url: `${base}/tinymce.min.js`});
  await page.evaluate(async ({source, plugin, base}) => {
    let engine;
    new Function('define', source)((_name, _deps, factory) => { engine = factory(); });
    let registration;
    window.markdownCalls = [];
    window.markdownResponse = '<h1>Heading</h1><p>Current draft</p><ul><li>Parent<ul><li>Nested</li></ul></li></ul><pre><code>if True:\n    print("hello")\n</code></pre><table><tr><td>Test</td></tr></table>';
    const define = (_name, _deps, factory) => {
      registration = factory(
        {call: ([request]) => {
          window.markdownCalls.push(request.args.markdown);
          if (window.markdownDelayed) return [new Promise(resolve => { window.finishMarkdown = resolve; })];
          return [window.markdownOffline ? Promise.reject(new Error('offline')) : Promise.resolve(window.markdownResponse)];
        }},
        {get_strings: async items => items.map(item => ({edit: 'Edit', preview: 'Preview'}[item.key] || item.key))},
        {getTinyMCE: async () => window.tinymce}, {getPluginMetadata: async () => ({})},
        {getContextId: () => 1}, engine, {isInitialised: () => window.autosaveReady !== false},
      );
    };
    new Function('define', plugin)(define);
    const [name, configuration] = await registration;
    document.body.innerHTML = '<form><textarea id="markdown-test"></textarea><button name="save">Save</button><button name="cancel">Cancel</button></form>';
    const options = {selector: '#markdown-test', base_url: base, suffix: '.min', license_key: 'gpl',
      plugins: [name], promotion: false};
    [window.testEditor] = await window.tinymce.init({...options, ...configuration.configure(options)});
    document.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); window.submitted = {html: window.testEditor.getContent(), button: event.submitter?.name};
    });
  }, {source, plugin, base});
});

test('literal paste, repeated tabs, selection, undo and redo preserve the draft', async ({ page }) => {
  await replace(page, sample);
  expect(await text(page)).toBe(sample);
  expect(await page.evaluate(() => window.testEditor.undoManager.hasUndo())).toBe(true);
  await page.keyboard.type('Unsaved edit');
  const edited = sample + 'Unsaved edit';
  for (let i = 0; i < 3; i++) {
    await page.getByRole('tab', {name: 'Preview', exact: true}).click();
    await expect(body(page).locator('h1')).toHaveText('Heading');
    await expect(body(page)).toHaveAttribute('contenteditable', 'false');
    expect(await text(page)).toBe(edited);
    await page.getByRole('tab', {name: 'Edit', exact: true}).click();
    expect(await text(page)).toBe(edited);
  }
  await input(page).click();
  await page.keyboard.press('ControlOrMeta+z');
  expect(await text(page)).toBe(sample);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  expect(await text(page)).toBe(edited);
});

test('saving without Preview waits for rendering and round-trips exact source', async ({ page }) => {
  await replace(page, sample);
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  await expect.poll(() => page.evaluate(() => window.submitted?.button)).toBe('save');
  const saved = await page.evaluate(() => window.submitted.html);
  expect(saved).toContain('<h1>Heading</h1>');
  await page.evaluate(saved => window.testEditor.setContent(saved), saved);
  expect(await text(page)).toBe(sample);
  await page.getByRole('tab', {name: 'Preview', exact: true}).click();
  await expect(body(page).locator('h1')).toHaveText('Heading');
});

test('late preview response cannot overwrite later typing or another document', async ({ page }) => {
  await page.evaluate(() => { window.markdownDelayed = true; });
  await replace(page, '# Old');
  await page.getByRole('tab', {name: 'Preview', exact: true}).click();
  await expect.poll(() => page.evaluate(() => window.markdownCalls.length)).toBe(1);
  await page.getByRole('tab', {name: 'Edit', exact: true}).click();
  await replace(page, '# New');
  await page.evaluate(() => window.finishMarkdown('<h1>Stale</h1>'));
  expect(await text(page)).toBe('# New');
  await page.getByRole('tab', {name: 'Preview', exact: true}).click();
  await expect.poll(() => page.evaluate(() => window.markdownCalls.length)).toBe(2);
  await page.evaluate(() => window.testEditor.setContent('<p>Different document</p>'));
  await page.evaluate(() => window.finishMarkdown('<h1>Wrong document</h1>'));
  expect(await text(page)).toBe('<p>Different document</p>');
  await expect(body(page)).not.toContainText('Wrong document');
});

test('offline render blocks save, retains text and allows retry; Cancel remains available', async ({ page }) => {
  await replace(page, sample);
  await page.evaluate(() => { window.markdownOffline = true; });
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  await expect(page.getByRole('status')).toHaveText('failed');
  expect(await page.evaluate(() => window.submitted)).toBeUndefined();
  expect(await text(page)).toBe(sample);
  await page.getByRole('button', {name: 'Cancel', exact: true}).click();
  expect(await page.evaluate(() => window.submitted.button)).toBe('cancel');
  await page.evaluate(() => { window.submitted = undefined; });
  await page.evaluate(() => { window.markdownOffline = false; });
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  await expect.poll(() => page.evaluate(() => window.submitted?.button)).toBe('save');
});

test('Save waits for another editor on the form to finish restoring its draft', async ({page}) => {
  await replace(page, sample);
  await page.evaluate(async () => {
    window.autosaveReady = false;
    window.tinymce.PluginManager.add('tiny_autosave/plugin', () => ({}));
    const textarea = document.createElement('textarea');
    textarea.id = 'second-editor';
    document.querySelector('form').append(textarea);
    await window.tinymce.init({selector: '#second-editor',
      base_url: 'https://learn.ignitefindyourfire.org/lib/editor/tiny/js/tinymce', suffix: '.min', license_key: 'gpl',
      plugins: ['tiny_ignite_markdown/plugin', 'tiny_autosave/plugin'], promotion: false});
  });
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  expect(await page.evaluate(() => window.submitted)).toBeUndefined();
  await page.evaluate(() => { window.autosaveReady = true; });
  await expect.poll(() => page.evaluate(() => window.submitted?.button)).toBe('save');
  expect(await text(page)).toBe(sample);
});

test('legacy HTML previews and saves intact', async ({ page }) => {
  const legacy = '<h2>Legacy</h2><pre class="ignite-code-block">    print("old")\n</pre><p><a href="https://example.com">Link</a></p>';
  await page.evaluate(legacy => window.testEditor.setContent(legacy), legacy);
  await page.getByRole('tab', {name: 'Preview', exact: true}).click();
  await expect(body(page).locator('h2')).toHaveText('Legacy');
  await expect(body(page).locator('pre')).toHaveText('    print("old")\n');
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  expect(await page.evaluate(() => window.submitted.html)).toBe(legacy);
});

test('empty source, long lines, narrow layout and keyboard tabs', async ({ page }) => {
  await page.setViewportSize({width: 375, height: 812});
  const line = 'Long line with no forced wrapping. '.repeat(180);
  await replace(page, line);
  expect(await text(page)).toBe(line);
  const dimensions = await page.locator('.ignite-markdown-editor').evaluate(el => ({width: el.getBoundingClientRect().width, scroll: el.scrollWidth}));
  expect(dimensions.width).toBeLessThanOrEqual(359);
  expect(dimensions.scroll).toBeLessThanOrEqual(359);
  expect(await page.locator('.cm-editor').evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(500);
  const edit = page.getByRole('tab', {name: 'Edit', exact: true});
  await edit.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', {name: 'Preview', exact: true})).toBeFocused();
  await page.keyboard.press('Home'); await expect(edit).toBeFocused();
  await replace(page, '');
  await page.evaluate(() => { window.markdownResponse = ''; });
  await page.getByRole('tab', {name: 'Preview', exact: true}).click();
  await expect(body(page)).toHaveText('');
  await expect(page.getByRole('status')).toHaveText('previewempty');
});
