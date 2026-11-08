/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */
import {Compartment, EditorState} from '@codemirror/state';
import {EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection} from '@codemirror/view';
import {defaultKeymap, history, historyKeymap, isolateHistory} from '@codemirror/commands';
import {defaultHighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {markdown} from '@codemirror/lang-markdown';
import {createDraft} from './draft.js';

// All editors in a native form finish rendering before replaying its original submit
// button. Moodle's validation, authorization and save handlers still run normally.
const forms = new WeakMap();
const joinForm = (form, participant) => {
    if (!form) return () => {};
    let group = forms.get(form);
    if (!group) {
        group = {editors: new Set(), busy: false};
        group.submit = async event => {
            if (event.submitter?.name === 'cancel' || [...group.editors].every(item => item.ready())) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (group.busy) return;
            group.busy = true;
            try {
                const results = await Promise.all([...group.editors].map(item => item.prepare()));
                // A cached/synchronous render may resolve within the browser's original
                // submit dispatch. Replay in a new task after its submission guard clears.
                await new Promise(resolve => setTimeout(resolve, 0));
                if (results.every(Boolean) && form.isConnected) {
                    group.busy = false;
                    form.requestSubmit(event.submitter);
                }
            } finally {
                group.busy = false;
            }
        };
        form.addEventListener('submit', group.submit, true);
        forms.set(form, group);
    }
    group.editors.add(participant);
    return () => {
        group.editors.delete(participant);
        if (!group.editors.size) {
            form.removeEventListener('submit', group.submit, true);
            forms.delete(form);
        }
    };
};

export const install = (editor, strings, convert, autosave) => {
    const target = editor.getElement();
    const draft = createDraft(target.value, convert);
    let view;
    let internal = false;
    let disposed = false;
    let initialised = false;
    let updating = false;
    let host;
    let timer;
    let leaveForm = () => {};
    let status;
    let preview;
    let renderedPanel;
    let resolveInitialisation;
    const initialisation = new Promise(resolve => { resolveInitialisation = resolve; });
    const enabled = new Compartment();
    const wasReadOnly = editor.mode.isReadOnly();
    const isAutosave = () => String(editor.options.get('plugins')).includes('tiny_autosave/plugin');
    const setStatus = text => { if (status) status.textContent = text; };

    // Read source before TinyMCE normalizes it, including native autosave restoration.
    editor.on('BeforeSetContent', event => {
        if (internal) return;
        draft.load(event.content);
        if (view) {
            updating = true;
            view.setState(makeState());
            updating = false;
        }
        event.content = draft.html || '';
        if (preview) showPreview();
    });
    editor.on('GetContent', event => {
        event.content = event.format === 'text' ? draft.source : draft.serialize();
    });

    const extensions = () => [
        lineNumbers(), highlightActiveLine(), drawSelection(), history(), markdown(),
        syntaxHighlighting(defaultHighlightStyle), keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorState.transactionExtender.of(transaction => transaction.isUserEvent('input.paste') ?
            {annotations: isolateHistory.of('full')} : null),
        EditorState.lineSeparator.of(draft.source.includes('\r\n') ? '\r\n' : '\n'),
        enabled.of(EditorView.editable.of(initialised && !wasReadOnly)),
        EditorView.contentAttributes.of({'aria-label': strings.source, spellcheck: 'false'}),
        EditorView.theme({
            '&': {fontSize: '14px', height: 'clamp(320px, 60vh, 500px)', backgroundColor: 'white', color: '#252525'},
            '.cm-scroller': {fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                lineHeight: '1.6', height: '100%', overflow: 'auto'},
            '.cm-content': {padding: '12px 0', minHeight: '320px'},
            '.cm-line': {padding: '0 12px'},
            '.cm-gutters': {backgroundColor: '#f8f9fa', color: '#6c757d', borderRight: '1px solid #dee2e6'},
            '&.cm-focused': {outline: '2px solid var(--primary, #f07b2a)', outlineOffset: '-2px'},
        }),
        EditorView.updateListener.of(update => {
            if (!update.docChanged || updating) return;
            draft.edit(update.state.sliceDoc());
            target.value = draft.serialize();
            setStatus('');
            editor.setDirty(true);
            // Moodle autosave listens to AddUndo and snapshots getContent(), not DOM input.
            // TinyMCE's undo manager compares its DOM with events disabled. Mirror literal
            // text in the hidden engine so source-only edits create a real undo boundary.
            // No Markdown or HTML is interpreted during typing or paste.
            const mirror = editor.getDoc().createElement('pre');
            mirror.textContent = draft.source;
            editor.getBody().replaceChildren(mirror);
            editor.undoManager.add();
            editor.dispatch('change');
        }),
    ];
    const makeState = () => EditorState.create({doc: draft.source, extensions: extensions()});

    const render = async() => {
        setStatus(strings.loading);
        try {
            const html = await draft.render();
            if (disposed || html === null) return false;
            internal = true;
            // Preview and save share the sanitized HTML. Bypass TinyMCE's serializer
            // on save so it cannot rewrite whitespace or inline markup in that HTML.
            editor.undoManager.ignore(() => editor.setContent(html));
            internal = false;
            renderedPanel.innerHTML = editor.serializer.serialize(editor.getBody());
            target.value = draft.serialize();
            setStatus(draft.source ? '' : strings.previewempty);
            return true;
        } catch (error) {
            internal = false;
            if (!disposed) setStatus(error.message === 'toolarge' ? strings.toolarge : strings.failed);
            return false;
        }
    };
    const showPreview = () => {
        renderedPanel.replaceChildren();
        void render();
    };

    editor.on('init', () => {
        const container = editor.getContainer();
        const doc = target.ownerDocument;
        host = doc.createElement('div');
        host.className = 'ignite-markdown-editor';
        host.style.cssText = 'width:100%;min-width:0;max-width:100%;border:1px solid #dee2e6;border-radius:8px;overflow:hidden';
        const style = doc.createElement('style');
        style.textContent = '.ignite-markdown-editor [hidden]{display:none!important}' +
            '.ignite-markdown-editor .text_to_html pre{overflow-x:auto;white-space:pre}' +
            '.ignite-markdown-editor .text_to_html img{max-width:100%;height:auto}';
        host.append(style);
        const tabs = doc.createElement('div');
        tabs.className = 'nav nav-tabs bg-light px-2 pt-2';
        tabs.setAttribute('role', 'tablist');
        tabs.setAttribute('aria-label', strings.source);
        const editPanel = doc.createElement('div');
        const previewPanel = doc.createElement('div');
        renderedPanel = previewPanel;
        previewPanel.className = 'p-3 text_to_html';
        previewPanel.style.cssText = 'min-height:320px;overflow-wrap:anywhere;overflow-x:auto';
        previewPanel.tabIndex = 0;
        previewPanel.setAttribute('contenteditable', 'false');
        editPanel.id = `${editor.id}-markdown-edit`;
        previewPanel.id = `${editor.id}-markdown-preview`;
        const panels = [editPanel, previewPanel];
        panels.forEach(panel => panel.setAttribute('role', 'tabpanel'));
        const buttons = [strings.edit, strings.preview].map((text, index) => {
            const button = doc.createElement('button');
            button.type = 'button';
            button.className = 'nav-link';
            button.textContent = text;
            button.setAttribute('role', 'tab');
            button.id = `${panels[index].id}-tab`;
            button.setAttribute('aria-controls', panels[index].id);
            panels[index].setAttribute('aria-labelledby', button.id);
            tabs.append(button);
            return button;
        });
        status = doc.createElement('div');
        status.className = 'small text-muted px-3 py-2';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        container.before(host);
        host.append(tabs, editPanel, previewPanel, status);
        // Keep Moodle's hidden engine in its original DOM location: moving its iframe
        // reloads the browsing context. Preview inherits the published view's theme CSS.
        container.hidden = true;
        editor.mode.set('readonly');
        view = new EditorView({state: makeState(), parent: editPanel});
        const select = (index, focus = false) => {
            preview = index === 1;
            buttons.forEach((button, i) => {
                button.classList.toggle('active', index === i);
                button.setAttribute('aria-selected', String(index === i));
                button.tabIndex = index === i ? 0 : -1;
                panels[i].hidden = index !== i;
            });
            if (preview) showPreview();
            else {
                setStatus(initialised ? '' : strings.loading);
                view.requestMeasure();
            }
            if (focus) buttons[index].focus();
        };
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => select(index));
            button.addEventListener('keydown', event => {
                const next = {ArrowLeft: 1 - index, ArrowRight: 1 - index, Home: 0, End: 1}[event.key];
                if (next !== undefined) {
                    event.preventDefault();
                    select(next, true);
                }
            });
        });
        select(0);
        const waitForAutosave = () => {
            if (disposed) return;
            if (isAutosave() && !autosave.isInitialised(editor)) {
                timer = setTimeout(waitForAutosave, 100);
                return;
            }
            initialised = true;
            resolveInitialisation(true);
            view.dispatch({effects: enabled.reconfigure(EditorView.editable.of(!wasReadOnly))});
            setStatus('');
        };
        waitForAutosave();
        leaveForm = joinForm(target.form, {
            ready: () => initialised && draft.html !== null,
            prepare: async() => {
                if (!initialised) setStatus(strings.loading);
                if (!await initialisation) return false;
                // A slow response cannot submit a stale draft if typing continues.
                while (!disposed) {
                    if (await render()) return true;
                    if (draft.html === null && !status.textContent) continue;
                    return false;
                }
                return false;
            },
        });
    });
    editor.on('remove', () => {
        disposed = true;
        resolveInitialisation(false);
        clearTimeout(timer);
        leaveForm();
        draft.dispose();
        view?.destroy();
        host?.remove();
    });
};
