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
  const dialog = {
    getData: () => data, setData: vi.fn(value => { data = value; }),
    block: vi.fn(), unblock: vi.fn(), close: vi.fn(() => definition.onClose()),
  };
  const editor = {
    selection: { getBookmark: () => 'cursor', getContent: () => 'Selected Markdown', moveToBookmark: vi.fn() },
    ui: { registry: { addButton: vi.fn(), addMenuItem: vi.fn() } },
    windowManager: { open: vi.fn(value => { definition = value; }), alert: vi.fn() },
    undoManager: { transact: vi.fn(callback => callback()) },
    focus: vi.fn(), insertContent: vi.fn(), nodeChanged: vi.fn(), removed: false,
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
      );
    },
  });
  const [, configuration] = await promise;
  factory(editor);
  editor.ui.registry.addButton.mock.calls[0][1].onAction();
  return { editor, dialog, ajax, input, configuration,
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
    expect(configuration.configure({ menu, toolbar: [] })).toEqual({
      menu: { ...menu, insert: { title: 'Insert', items: 'link image tiny_ignite_markdown_markdown' } }, toolbar: [],
    });
    expect(menu.insert.items).toBe('link image');
  });
});
