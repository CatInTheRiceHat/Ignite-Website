import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

async function mount(build: string) {
  let factory!: (editor: unknown) => void;
  let definition!: { onSubmit: (dialog: unknown) => Promise<void>; onClose: () => void;
    onAction: (dialog: unknown, details: { name: string }) => void; initialData: { markdown: string } };
  let data = { markdown: '# Rubric' };
  const input = { type: '', accept: '', files: [] as unknown[], click: vi.fn(),
    addEventListener: vi.fn() };
  const ajax = vi.fn(() => [Promise.resolve('<h1>Rubric</h1>')]);
  const handlers: Record<string, (event: unknown) => Promise<void>> = {};
  let content = '';
  const placeholder = { isConnected: true, removeAttribute: vi.fn(), setAttribute: vi.fn() };
  const container = {};
  const range = { startContainer: container, endContainer: container, startOffset: 0, endOffset: 0,
    cloneRange() { return { ...this }; } };
  const dialog = {
    getData: () => data, setData: vi.fn(value => { data = value; }),
    block: vi.fn(), unblock: vi.fn(), close: vi.fn(() => definition.onClose()),
  };
  const editor = {
    selection: { getBookmark: () => 'cursor', getContent: () => 'Selected Markdown', moveToBookmark: vi.fn(),
      getNode: () => ({}), getRng: () => range, select: vi.fn() },
    ui: { registry: { addButton: vi.fn(), addMenuItem: vi.fn() } },
    windowManager: { open: vi.fn(value => { definition = value; }), alert: vi.fn() },
    undoManager: { transact: vi.fn(callback => callback()) },
    focus: vi.fn(), insertContent: vi.fn(html => { content = html; }), nodeChanged: vi.fn(), removed: false,
    on: vi.fn((name, callback) => { handlers[name] = callback; }),
    mode: { isReadOnly: vi.fn(() => false) }, options: { get: vi.fn(() => false) },
    dom: { getParent: vi.fn(() => null), get: vi.fn(() => placeholder),
      encode: (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') },
    getContent: () => content, hasFocus: vi.fn(() => true),
    notificationManager: { open: vi.fn() },
  };
  let promise!: Promise<[string, { configure: (config: unknown) => unknown }]>;
  runInNewContext(readFileSync(new URL(`../../moodle/tiny/ignite_markdown/amd/${build}`, import.meta.url), 'utf8'), {
    TextEncoder, document: { createElement: () => input },
    define: (_name: string, _deps: string[], callback: (...args: unknown[]) => typeof promise) => {
      promise = callback(
        { call: ajax }, { get_strings: (items: { key: string }[]) => Promise.resolve(items.map(item => item.key)) },
        { getTinyMCE: async() => ({ PluginManager: { add: (_id: string, value: typeof factory) => { factory = value; } } }) },
        { getPluginMetadata: async() => ({}), addToolbarButtons: vi.fn((toolbar) => toolbar) },
        { getContextId: () => 42 },
        { languages: {} },
      );
    },
  });
  const [, configuration] = await promise;
  factory(editor);
  editor.ui.registry.addButton.mock.calls[0][1].onAction();
  return { editor, dialog, ajax, input, configuration, handlers, range, placeholder,
    setContent: (value: string) => { content = value; },
    definition: definition!, setMarkdown: (markdown: string) => { data = { markdown }; } };
}

describe.each(['src/plugin.js', 'build/plugin.min.js'])('Moodle Markdown %s', build => {
  it('inserts typed Markdown in the correct editor context with a single undo step', async() => {
    const { editor, definition, dialog, ajax } = await mount(build);
    expect(definition.initialData.markdown).toBe('Selected Markdown');
    await definition.onSubmit(dialog);
    expect(ajax.mock.calls[0][0]).toEqual([{
      methodname: 'tiny_ignite_markdown_convert', args: { contextid: 42, markdown: '# Rubric' },
    }]);
    expect(editor.selection.moveToBookmark).toHaveBeenCalledWith('cursor');
    expect(editor.insertContent).toHaveBeenCalledWith('<h1>Rubric</h1>');
    expect(editor.undoManager.transact).toHaveBeenCalledTimes(1);
    expect(dialog.close).toHaveBeenCalled();
  });

  it.each(['   ', '🔥'.repeat(25601)])('rejects empty or oversized UTF-8 input without conversion', async(markdown) => {
    const { definition, dialog, ajax, setMarkdown, editor } = await mount(build);
    setMarkdown(markdown);
    await definition.onSubmit(dialog);
    expect(ajax).not.toHaveBeenCalled();
    expect(editor.windowManager.alert).toHaveBeenCalled();
  });

  it('retains the draft on a conversion failure so the user can retry', async() => {
    const { definition, dialog, ajax, editor } = await mount(build);
    ajax.mockImplementationOnce(() => [Promise.reject(new Error('offline'))]);
    await definition.onSubmit(dialog);
    expect(dialog.getData().markdown).toBe('# Rubric');
    expect(dialog.close).not.toHaveBeenCalled();
    expect(dialog.unblock).toHaveBeenCalled();
    expect(editor.windowManager.alert).toHaveBeenCalledWith('failed');
    await definition.onSubmit(dialog);
    expect(editor.insertContent).toHaveBeenCalledTimes(1);
  });

  it('does not insert after the dialog closes while the conversion is pending', async() => {
    const { definition, dialog, ajax, editor } = await mount(build);
    let resolve!: (html: string) => void;
    ajax.mockImplementationOnce(() => [new Promise<string>(done => { resolve = done; })]);
    const pending = definition.onSubmit(dialog);
    definition.onClose();
    resolve('<p>late</p>');
    await pending;
    expect(editor.insertContent).not.toHaveBeenCalled();
  });

  it('loads a Markdown file into the dialog without inserting or saving it', async() => {
    const { definition, dialog, input, editor } = await mount(build);
    definition.onAction(dialog, { name: 'loadfile' });
    expect(input.accept).toBe('.md,.markdown');
    input.files = [{ name: 'rubric.MD', size: 12, text: async() => '**Scoring**' }];
    await input.addEventListener.mock.calls[0][1]();
    expect(dialog.getData().markdown).toBe('**Scoring**');
    expect(editor.insertContent).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'rubric.html', size: 12 }, { name: 'rubric.md', size: 102401 },
  ])('rejects unsupported or oversized files', async(file) => {
    const { definition, dialog, input, editor } = await mount(build);
    definition.onAction(dialog, { name: 'loadfile' });
    const text = vi.fn();
    input.files = [{ ...file, text }];
    await input.addEventListener.mock.calls[0][1]();
    expect(text).not.toHaveBeenCalled();
    expect(editor.windowManager.alert).toHaveBeenCalled();
  });

  it('adds an Insert menu item without mutating the existing menu', async() => {
    const { configuration } = await mount(build);
    const menu = { insert: { title: 'Insert', items: 'link image' }, edit: { items: 'undo redo' } };
    expect(configuration.configure({ menu, toolbar: [] })).toMatchObject({
      menu: { ...menu, insert: { title: 'Insert', items: 'link image tiny_ignite_markdown_markdown' } }, toolbar: [],
    });
    expect(menu.insert.items).toBe('link image');
  });

  it('enables native typing patterns while preserving custom editor patterns', async() => {
    const { configuration } = await mount(build);
    const custom = { start: '#', format: 'h2', trigger: 'space' };
    const config = configuration.configure({ menu: {}, toolbar: [], text_patterns: [custom] }) as {
      text_patterns: { start: string; end?: string; format?: string }[];
    };
    expect(config.text_patterns.filter(pattern => pattern.start === '#')).toEqual([custom]);
    expect(config.text_patterns).toContainEqual({ start: '**', end: '**', format: 'bold' });
    expect(config.text_patterns).toContainEqual({ start: '`', end: '`', format: 'code' });
    expect(config.text_patterns).toContainEqual({ start: '-', cmd: 'InsertUnorderedList', trigger: 'space' });
  });

  function pasteEvent(text = '# Rubric', html = '') {
    return {
      isDefaultPrevented: () => false, preventDefault: vi.fn(), stopImmediatePropagation: vi.fn(),
      clipboardData: { files: [], getData: (format: string) => format === 'text/html' ? html : text },
    };
  }

  it.each(['# Rubric', '**Bold**', '*Italic*', '_Italic_', '`code`', '- One\n- Two', '[Link](https://example.com)',
    '| Name | Score |\n| --- | --- |\n| Test | 1 |', '```js\nconst x = 1;\n```'])('formats a direct Markdown paste: %s', async(text) => {
    const { handlers, editor, ajax, placeholder } = await mount(build);
    const event = pasteEvent(text);
    await handlers.paste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopImmediatePropagation).toHaveBeenCalled();
    expect(ajax.mock.calls[0][0][0].args).toEqual({ contextid: 42, markdown: text });
    expect(editor.selection.select).toHaveBeenCalledWith(placeholder);
    expect(editor.insertContent).toHaveBeenLastCalledWith('<h1>Rubric</h1>');
    expect(editor.windowManager.alert).not.toHaveBeenCalled();
  });

  it.each([
    ['Ordinary plain text', ''], ['**Bold**', '<strong>Bold</strong>'], ['a'.repeat(102401) + '**bold**', ''],
    ['['.repeat(80000), ''],
  ])('leaves native paste in charge of plain, rich, or oversized content', async(text, html) => {
    const { handlers, editor, ajax } = await mount(build);
    const event = pasteEvent(text, html);
    await handlers.paste(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(ajax).not.toHaveBeenCalled();
    expect(editor.insertContent).not.toHaveBeenCalled();
  });

  it.each(['```py\nprint("hello")\n```', '~~~py\nprint("hello")\n~~~'])('formats literal fenced Markdown copied with a rich HTML clipboard representation', async(markdown) => {
    const { handlers, ajax } = await mount(build);
    const event = pasteEvent(markdown, `<pre>${markdown}</pre>`);
    await handlers.paste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(ajax.mock.calls[0][0][0].args.markdown).toBe(markdown);
  });

  it.each(['code', 'readonly', 'file', 'handled'])('respects protected or already handled paste: %s', async(kind) => {
    const { handlers, editor, ajax } = await mount(build);
    const event = pasteEvent();
    if (kind === 'code') editor.dom.getParent.mockReturnValue({} as never);
    if (kind === 'readonly') editor.mode.isReadOnly.mockReturnValue(true);
    if (kind === 'file') event.clipboardData.files.push({} as never);
    if (kind === 'handled') event.isDefaultPrevented = () => true;
    await handlers.paste(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(ajax).not.toHaveBeenCalled();
  });

  it('keeps escaped source text in place when the conversion service fails', async() => {
    const { handlers, editor, ajax } = await mount(build);
    ajax.mockImplementationOnce(() => [Promise.reject(new Error('offline'))]);
    await handlers.paste(pasteEvent('# Draft\n<script>alert(1)</script>'));
    expect(editor.insertContent).toHaveBeenCalledTimes(1);
    expect(editor.insertContent.mock.calls[0][0]).toContain('# Draft<br>&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(editor.notificationManager.open).toHaveBeenCalledWith({ text: 'pastefailed', type: 'warning' });
  });

  it.each(['edited', 'moved', 'blurred', 'removed', 'undone', 'readonly'])('does not overwrite user actions during conversion: %s', async(action) => {
    const { handlers, editor, ajax, setContent, range, placeholder } = await mount(build);
    let resolve!: (html: string) => void;
    ajax.mockImplementationOnce(() => [new Promise<string>(done => { resolve = done; })]);
    const pending = handlers.paste(pasteEvent());
    expect(editor.insertContent).toHaveBeenCalledTimes(1);
    if (action === 'edited') setContent('The user kept typing');
    if (action === 'moved') range.startOffset = 1;
    if (action === 'blurred') editor.hasFocus.mockReturnValue(false);
    if (action === 'removed') editor.removed = true;
    if (action === 'undone') placeholder.isConnected = false;
    if (action === 'readonly') editor.mode.isReadOnly.mockReturnValue(true);
    resolve('<h1>late response</h1>');
    await pending;
    expect(editor.insertContent).toHaveBeenCalledTimes(1);
    expect(editor.selection.select).not.toHaveBeenCalled();
  });
});
