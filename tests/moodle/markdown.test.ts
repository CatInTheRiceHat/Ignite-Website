import { describe, expect, it, vi } from 'vitest';
import { createDraft, pack, unpack } from '../../moodle/tiny/ignite_markdown/amd/src/draft.js';

const sample = '# Heading\n\nParagraph with [a link](https://example.com).  \nNext line\n\n- Parent\n    - Nested\n\n```py\nif True:\n    print("hello 日本語 😀")\n\n```\n\n| Name | Score |\n| --- | --- |\n| Test | 1 |\n';

describe('Markdown source storage and rendering', () => {
  it.each([sample, '', '   \n\n', sample.replaceAll('\n', '\r\n'), '</pre><!-- -->\n<script>alert(1)</script>'])(
  'preserves exact source through native HTML storage and reopening: %s', source => {
    const saved = pack(source, '<h1>Safe render</h1>');
    expect(unpack(saved)).toEqual({source, html: '<h1>Safe render</h1>', legacy: false});
    expect(saved).not.toContain('<script>');
  });

  it('preserves existing HTML exactly until the author edits it', async () => {
    const html = '<h2>Legacy</h2><ul><li>A<ul><li>B</li></ul></li></ul>' +
      '<pre class="ignite-code-block" style="color:#9ed69e">  old code\n</pre>' +
      '<img src="@@PLUGINFILE@@/legacy.png" alt="Legacy image">';
    const convert = vi.fn(async () => '<h2>Legacy</h2>');
    const draft = createDraft(html, convert);
    expect(draft.source).toBe(html);
    expect(await draft.render()).toBe(html);
    expect(draft.serialize()).toBe(html);
    expect(convert).not.toHaveBeenCalled();
    draft.edit(html + '\n\nNew Markdown');
    await draft.render();
    expect(unpack(draft.serialize()).source).toBe(html + '\n\nNew Markdown');
  });

  it.each(['<!--ignite-markdown:v1:AAAA-->\n<p>Legacy</p>', '<!--ignite-markdown:v2:e30=-->\nText'])(
  'does not discard a damaged or unknown source record', html => {
    expect(unpack(html).source).toBe(html);
    expect(createDraft(html, vi.fn()).serialize()).toBe(html);
  });

  it('keeps unrendered autosave source and escapes its fallback HTML', async () => {
    const draft = createDraft('', async () => '<h1>Heading</h1>');
    draft.edit(sample + '<script>alert(1)</script>');
    const saved = draft.serialize();
    expect(saved).not.toContain('<script>');
    expect(unpack(saved).source).toBe(sample + '<script>alert(1)</script>');
    expect(unpack(saved).html).toBeNull();
    const restored = createDraft(saved, async () => '<h1>Heading</h1>');
    expect(await restored.render()).toBe('<h1>Heading</h1>');
  });

  it('allows native attachment URLs to be rewritten in source as well as rendered HTML', () => {
    const draftURL = 'https://moodle.example/draftfile.php/5/user/draft/123/';
    const source = `![Image](${draftURL}diagram.png)\n\n<!-- a comment -->`;
    const saved = pack(source, `<p><img src="${draftURL}diagram.png"></p>`)
      .replaceAll(draftURL, '@@PLUGINFILE@@/');
    const reopened = saved.replaceAll('@@PLUGINFILE@@/', draftURL.replace('/123/', '/456/'));
    expect(unpack(reopened).source).toBe(source.replaceAll('/123/', '/456/'));
    expect(unpack(reopened).html).toContain('/456/diagram.png');
    expect((saved.match(/-->/g) || []).length).toBe(1);
  });

  it('uses the same render for Preview and Save without altering source', async () => {
    const convert = vi.fn(async () => '<h1>Heading</h1>');
    const draft = createDraft('', convert);
    draft.edit(sample);
    expect(await draft.render()).toBe('<h1>Heading</h1>');
    expect(await draft.render()).toBe('<h1>Heading</h1>');
    expect(unpack(draft.serialize())).toMatchObject({source: sample, html: '<h1>Heading</h1>'});
    expect(convert).toHaveBeenCalledExactlyOnceWith(sample);
  });

  it.each(['edit', 'switch', 'dispose'])('ignores late responses after %s', async action => {
    let resolve!: (html: string) => void;
    const draft = createDraft('', () => new Promise<string>(done => { resolve = done; }));
    draft.edit('# Old draft');
    const pending = draft.render();
    await Promise.resolve();
    if (action === 'edit') draft.edit('# Newer draft');
    if (action === 'switch') draft.load(pack('# Different document', '<h1>Different document</h1>'));
    if (action === 'dispose') draft.dispose();
    const current = draft.serialize();
    resolve('<h1>Old draft</h1>');
    expect(await pending).toBeNull();
    expect(draft.serialize()).toBe(current);
  });

  it('shares an in-flight preview and save render', async () => {
    const convert = vi.fn(async () => '<p>Current</p>');
    const draft = createDraft('', convert);
    draft.edit('Current');
    expect(await Promise.all([draft.render(), draft.render()])).toEqual(['<p>Current</p>', '<p>Current</p>']);
    expect(convert).toHaveBeenCalledTimes(1);
  });

  it('preserves the source after a failed render and allows retry', async () => {
    const convert = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('<p>Retry</p>');
    const draft = createDraft('', convert);
    draft.edit('Retry');
    await expect(draft.render()).rejects.toThrow('offline');
    expect(unpack(draft.serialize()).source).toBe('Retry');
    expect(await draft.render()).toBe('<p>Retry</p>');
  });

  it('enforces the existing UTF-8 size limit without truncating a draft', async () => {
    const convert = vi.fn();
    const draft = createDraft('', convert);
    const source = '😀'.repeat(25601);
    draft.edit(source);
    await expect(draft.render()).rejects.toThrow('toolarge');
    expect(unpack(draft.serialize()).source).toBe(source);
    expect(convert).not.toHaveBeenCalled();
  });
});
