/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */

const marker = /^<!--ignite-markdown:v1:([\s\S]*?)-->\s*/;
export const maxBytes = 102400;
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Retain Moodle's HTML storage, file handling and published renderer. An inert comment
// preserves source that cannot be recovered from HTML (blank lines, fences, indentation).
export const pack = (source, html) => {
    // Leave file URLs readable to Moodle's native draftfile/@@PLUGINFILE@@ rewriting.
    // Escape comment delimiters rather than encoding the entire string as opaque data.
    const data = JSON.stringify({source, rendered: html !== null}).replaceAll('<', '\\u003c')
        .replaceAll('>', '\\u003e').replaceAll('--', '\\u002d\\u002d');
    return `<!--ignite-markdown:v1:${data}-->\n${html ?? (source ? `<pre>${escape(source)}</pre>` : '')}`;
};

export const unpack = content => {
    const match = content.match(marker);
    if (!match) return {source: content, html: content, legacy: true};
    try {
        const data = JSON.parse(match[1]);
        if (typeof data.source !== 'string' || typeof data.rendered !== 'boolean') throw new Error('Invalid source record');
        return {source: data.source, html: data.rendered ? content.slice(match[0].length) : null, legacy: false};
    } catch {
        // Unknown/damaged records remain readable; never silently discard existing content.
        return {source: content, html: content, legacy: true};
    }
};

export const createDraft = (content, convert) => {
    let draft = unpack(content);
    let original = content;
    let changed = false;
    let revision = 0;
    let pending;
    let disposed = false;
    return {
        get source() { return draft.source; },
        get html() { return draft.html; },
        load(content) {
            revision++;
            draft = unpack(content);
            original = content;
            changed = false;
        },
        edit(source) {
            if (source === draft.source) return;
            revision++;
            changed = true;
            draft = {source, html: null, legacy: false};
        },
        serialize() {
            if (draft.source === '') return '';
            return !changed && draft.legacy ? original : pack(draft.source, draft.html);
        },
        async render() {
            if (draft.html !== null) return draft.html;
            if (draft.source === '') { draft.html = ''; return ''; }
            if (new TextEncoder().encode(draft.source).length > maxBytes) throw new Error('toolarge');
            const current = revision;
            const source = draft.source;
            if (pending?.revision === current) return pending.promise;
            const promise = Promise.resolve().then(() => convert(source)).then(html => {
                if (disposed || revision !== current) return null;
                draft.html = html;
                return html;
            }, error => {
                if (disposed || revision !== current) return null;
                throw error;
            });
            pending = {revision: current, promise};
            try {
                return await promise;
            } finally {
                if (pending?.promise === promise) pending = null;
            }
        },
        dispose() { disposed = true; revision++; },
    };
};
