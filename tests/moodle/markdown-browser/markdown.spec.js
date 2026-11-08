import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Exercise the real installed TinyMCE engine without signing in or saving any Moodle content.
// Conversion is controlled here; tests/moodle-markdown.php checks the real server converter.
const source = readFileSync(new URL('../../../moodle/tiny/ignite_markdown/amd/build/plugin.min.js', import.meta.url), 'utf8');

test.beforeEach(async ({ page }) => {
  await page.goto('/login/index.php');
  const base = 'https://learn.ignitefindyourfire.org/lib/editor/tiny/js/tinymce';
  await page.addScriptTag({ url: `${base}/tinymce.min.js` });
  await page.evaluate(async ({ source, base }) => {
    let registration;
    window.markdownCalls = [];
    window.markdownResponse = '<h1>Rubric</h1><p><strong>Bold</strong></p>';
    const define = (_name, _dependencies, factory) => {
      registration = factory(
        { call: ([request]) => {
          window.markdownCalls.push(request.args.markdown);
          if (window.markdownDelayed) {
            return [new Promise(resolve => { window.finishMarkdown = resolve; })];
          }
          return [window.markdownOffline ? Promise.reject(new Error('offline')) : Promise.resolve(window.markdownResponse)];
        } },
        { get_strings: async items => items.map(item => item.key) },
        { getTinyMCE: async () => window.tinymce },
        { getPluginMetadata: async () => ({}), addToolbarButtons: (toolbar, _group, buttons) => `${toolbar} ${buttons.join(' ')}` },
        { getContextId: () => 1 },
      );
    };
    new Function('define', source)(define);
    const [plugin, configuration] = await registration;
    document.body.innerHTML = '<textarea id="markdown-test" aria-label="Test editor"></textarea>';
    const options = {
      selector: '#markdown-test', base_url: base, suffix: '.min', license_key: 'gpl',
      plugins: ['lists', 'link', plugin], toolbar: 'undo redo bold italic', promotion: false,
    };
    [window.testEditor] = await window.tinymce.init({ ...options, ...configuration.configure(options) });
    window.testEditor.focus();
  }, { source, base });
});

async function reset(page, html = '<p></p>') {
  await page.evaluate(html => {
    const editor = window.testEditor;
    editor.setContent(html);
    editor.undoManager.clear();
    editor.undoManager.add();
    editor.focus();
    editor.selection.select(editor.getBody(), true);
    editor.selection.collapse(false);
  }, html);
}

async function paste(page, text, html = '') {
  await page.evaluate(({ text, html }) => {
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', text);
    if (html) clipboard.setData('text/html', html);
    window.testEditor.getBody().dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true, cancelable: true, clipboardData: clipboard,
    }));
  }, { text, html });
}

const content = page => page.evaluate(() => window.testEditor.getContent());

test('Markdown typing shortcuts work in the main editor with native Undo', async ({ page }) => {
  await page.keyboard.type('# Heading');
  expect(await content(page)).toContain('<h1>Heading</h1>');
  await reset(page);
  await page.keyboard.type('**Bold** ');
  expect(await content(page)).toContain('<strong>Bold</strong>');
  await page.evaluate(() => window.testEditor.undoManager.undo());
  expect(await content(page)).toContain('**Bold**');
  await reset(page);
  await page.keyboard.type('_Italic_ ');
  expect(await content(page)).toContain('<em>Italic</em>');
  await reset(page);
  await page.keyboard.type('`code` ');
  expect(await content(page)).toContain('<code>code</code>');
  await reset(page);
  await page.keyboard.type('- First');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second');
  expect(await content(page)).toContain('<ul>');
  expect(await content(page)).toContain('<li>Second</li>');
});

test('direct Markdown paste formats in place and Undo recovers the source', async ({ page }) => {
  await paste(page, '# Rubric\n\n**Bold**');
  await expect.poll(() => content(page)).toContain('<h1>Rubric</h1>');
  expect(await content(page)).toContain('<strong>Bold</strong>');
  expect(await page.evaluate(() => window.markdownCalls)).toEqual(['# Rubric\n\n**Bold**']);
  await page.evaluate(() => window.testEditor.undoManager.undo());
  expect(await content(page)).toContain('# Rubric');
  expect(await content(page)).toContain('**Bold**');
  expect(await content(page)).not.toContain('ignite-markdown-paste');
  await page.evaluate(() => window.testEditor.undoManager.undo());
  expect(await content(page)).toBe('');

  await reset(page);
  await paste(page, '**Styled source**', '<p><em>Keep existing formatting</em></p>');
  expect(await content(page)).toContain('<em>Keep existing formatting</em>');
  expect(await page.evaluate(() => window.markdownCalls.length)).toBe(1);
});

test('offline and late conversions preserve text and later edits', async ({ page }) => {
  await page.evaluate(() => { window.markdownOffline = true; });
  await paste(page, '# Draft\n<script>alert(1)</script>');
  await expect(page.getByText('pastefailed', { exact: true })).toBeVisible();
  expect(await content(page)).toContain('# Draft');
  expect(await content(page)).toContain('&lt;script&gt;');
  expect(await content(page)).not.toContain('ignite-markdown-paste');

  await reset(page);
  await page.evaluate(() => { window.markdownOffline = false; window.markdownDelayed = true; });
  await paste(page, '# Draft');
  await page.keyboard.type(' continued typing');
  const draft = await content(page);
  await page.evaluate(() => window.finishMarkdown('<h1>Stale response</h1>'));
  expect(await content(page)).toBe(draft);
  expect(await content(page)).toContain('continued typing');
});
