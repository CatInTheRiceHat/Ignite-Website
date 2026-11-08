/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */

define('tiny_ignite_markdown/plugin', [
    'core/ajax', 'core/str', 'editor_tiny/loader', 'editor_tiny/utils', 'editor_tiny/options',
], function(Ajax, Str, Loader, Utils, Options) {
    const component = 'tiny_ignite_markdown';
    const pluginName = component + '/plugin';
    const button = component + '_markdown';
    const maxBytes = 102400;
    let pasteId = 0;

    const convert = (editor, markdown) => Ajax.call([{
        methodname: 'tiny_ignite_markdown_convert',
        args: {contextid: Options.getContextId(editor), markdown},
    }])[0];

    // Use TinyMCE's native text patterns so typing and Undo work without a network request.
    const textPatterns = [
        {start: '*', end: '*', format: 'italic'},
        {start: '**', end: '**', format: 'bold'},
        {start: '_', end: '_', format: 'italic'},
        {start: '__', end: '__', format: 'bold'},
        {start: '`', end: '`', format: 'code'},
        ...[1, 2, 3, 4, 5, 6].map(level => ({start: '#'.repeat(level), format: `h${level}`, trigger: 'space'})),
        {start: '1.', cmd: 'InsertOrderedList', trigger: 'space'},
        {start: '*', cmd: 'InsertUnorderedList', trigger: 'space'},
        {start: '-', cmd: 'InsertUnorderedList', trigger: 'space'},
        {start: '>', cmd: 'mceBlockQuote', trigger: 'space'},
        {start: '---', cmd: 'InsertHorizontalRule', trigger: 'space'},
        {start: '```', format: 'pre', trigger: 'enter'},
    ];

    const looksLikeMarkdown = text => /(?:^|\n) {0,3}(?:#{1,6}[ \t]+|>[ \t]+|```|~~~|[-*+][ \t]+|\d+\.[ \t]+)|\*\*[^*\s][^*\n]*\*\*|__[^_\s][^_\n]*__|\[[^[\]\n]+\]\([^\s)]+\)|(?:^|\n)[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*\||(?:^|\s)(?:\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_|`[^`\n]+`)/.test(text);

    const enableDirectPaste = (editor, strings) => {
        // Prepend so TinyMCE's native paste handler cannot insert a second copy.
        editor.on('paste', async(event) => {
            const clipboard = event.clipboardData;
            if (event.isDefaultPrevented() || !clipboard || editor.mode.isReadOnly() ||
                    editor.dom.getParent(editor.selection.getNode(), 'pre,code,[contenteditable="false"]')) {
                return;
            }
            // Preserve copied rich content, images, and deliberate code pastes.
            if (clipboard.files.length || (clipboard.getData('text/html') && !editor.options.get('paste_as_text'))) {
                return;
            }
            const markdown = clipboard.getData('text/plain');
            if (new TextEncoder().encode(markdown).length > maxBytes || !looksLikeMarkdown(markdown)) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();

            // Paste the source immediately, even offline. The temporary wrapper is omitted on save.
            const id = `ignite-markdown-paste-${++pasteId}`;
            const source = editor.dom.encode(markdown).replace(/\r\n?|\n/g, '<br>');
            let placeholder;
            editor.undoManager.transact(() => {
                editor.insertContent(`<span id="${id}">${source}</span>`);
                placeholder = editor.dom.get(id);
                if (placeholder) {
                    // Set this after insertion; TinyMCE strips bogus wrappers while parsing input.
                    placeholder.setAttribute('data-mce-bogus', '1');
                }
            });
            if (!placeholder) {
                return;
            }
            const content = editor.getContent();
            const caret = editor.selection.getRng().cloneRange();
            try {
                const html = await convert(editor, markdown);
                if (editor.removed || !placeholder.isConnected || editor.mode.isReadOnly() || !editor.hasFocus()) {
                    return;
                }
                const current = editor.selection.getRng();
                // A late response must never replace edits or move the user's new cursor.
                if (editor.getContent() !== content || current.startContainer !== caret.startContainer ||
                        current.startOffset !== caret.startOffset || current.endContainer !== caret.endContainer ||
                        current.endOffset !== caret.endOffset) {
                    return;
                }
                editor.undoManager.transact(() => {
                    editor.selection.select(placeholder);
                    editor.insertContent(html);
                });
                editor.nodeChanged();
            } catch {
                if (!editor.removed) {
                    editor.notificationManager.open({text: strings.pastefailed, type: 'warning'});
                }
            } finally {
                placeholder.removeAttribute('id');
            }
        }, true);
    };

    const openDialog = (editor, strings) => {
        const bookmark = editor.selection.getBookmark(2, true);
        let closed = false;
        const alert = message => editor.windowManager.alert(message);

        const loadFile = (dialog) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.md,.markdown';
            input.addEventListener('change', async() => {
                const file = input.files[0];
                if (!file || closed) {
                    return;
                }
                if (!/\.(md|markdown)$/i.test(file.name)) {
                    alert(strings.invalidfile);
                    return;
                }
                if (file.size > maxBytes) {
                    alert(strings.toolarge);
                    return;
                }
                dialog.block(strings.loading);
                try {
                    const markdown = await file.text();
                    if (!closed) {
                        dialog.setData({markdown});
                    }
                } catch {
                    if (!closed) {
                        alert(strings.filefailed);
                    }
                } finally {
                    if (!closed) {
                        dialog.unblock();
                    }
                }
            });
            input.click();
        };

        editor.windowManager.open({
            title: strings.markdown,
            size: 'large',
            body: {
                type: 'panel',
                items: [
                    {type: 'textarea', name: 'markdown', label: strings.source},
                    {type: 'alertbanner', level: 'info', icon: 'info', text: strings.help},
                ],
            },
            initialData: {markdown: editor.selection.getContent({format: 'text'})},
            buttons: [
                {type: 'custom', name: 'loadfile', text: strings.loadfile, align: 'start'},
                {type: 'cancel', text: strings.cancel},
                {type: 'submit', text: strings.insert, primary: true},
            ],
            onAction: (dialog, details) => {
                if (details.name === 'loadfile') {
                    loadFile(dialog);
                }
            },
            onClose: () => { closed = true; },
            onSubmit: async(dialog) => {
                const markdown = dialog.getData().markdown;
                if (!markdown.trim()) {
                    alert(strings.empty);
                    return;
                }
                if (new TextEncoder().encode(markdown).length > maxBytes) {
                    alert(strings.toolarge);
                    return;
                }
                dialog.block(strings.converting);
                try {
                    const html = await convert(editor, markdown);
                    if (closed || editor.removed) {
                        return;
                    }
                    editor.focus();
                    editor.selection.moveToBookmark(bookmark);
                    editor.undoManager.transact(() => editor.insertContent(html));
                    editor.nodeChanged();
                    dialog.close();
                } catch {
                    if (!closed) {
                        alert(strings.failed);
                    }
                } finally {
                    if (!closed) {
                        dialog.unblock();
                    }
                }
            },
        });
    };

    const configure = (config) => {
        const menu = {...config.menu};
        const insert = menu.insert || {title: 'Insert', items: ''};
        menu.insert = {...insert, items: `${insert.items} ${button}`.trim()};
        const existing = Array.isArray(config.text_patterns) ? config.text_patterns : [];
        const patterns = textPatterns.filter(pattern => !existing.some(item =>
            item.start === pattern.start && item.end === pattern.end && item.trigger === pattern.trigger
        ));
        return {menu, toolbar: Utils.addToolbarButtons(config.toolbar, 'content', [button]),
            text_patterns: [...existing, ...patterns]};
    };

    return Promise.all([
        Loader.getTinyMCE(),
        Str.get_strings([
            'markdown', 'source', 'help', 'insert', 'loadfile', 'cancel', 'converting', 'loading',
            'empty', 'toolarge', 'invalidfile', 'failed', 'filefailed', 'pastefailed',
        ].map(key => ({key, component}))),
        Utils.getPluginMetadata(component, pluginName),
    ]).then(([tinyMCE, values, metadata]) => {
        const strings = Object.fromEntries([
            'markdown', 'source', 'help', 'insert', 'loadfile', 'cancel', 'converting', 'loading',
            'empty', 'toolarge', 'invalidfile', 'failed', 'filefailed', 'pastefailed',
        ].map((key, index) => [key, values[index]]));
        tinyMCE.PluginManager.add(pluginName, (editor) => {
            const onAction = () => openDialog(editor, strings);
            editor.ui.registry.addButton(button, {text: strings.markdown, tooltip: strings.markdown, onAction});
            editor.ui.registry.addMenuItem(button, {text: strings.markdown, onAction});
            enableDirectPaste(editor, strings);
            return metadata;
        });
        return [pluginName, {configure}];
    });
});
