/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */

define('tiny_ignite_markdown/plugin', [
    'core/ajax', 'core/str', 'editor_tiny/loader', 'editor_tiny/utils', 'editor_tiny/options',
    'filter_codehighlighter/prism',
], function(Ajax, Str, Loader, Utils, Options, Prism) {
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
    ];

    const languageName = value => {
        const name = (value || 'text').toLowerCase().replace(/[^a-z0-9_+#.-]/g, '');
        const aliases = {py: 'python', js: 'javascript', ts: 'typescript', html: 'markup', xml: 'markup',
            'c++': 'cpp', 'c#': 'csharp', sh: 'bash', txt: 'text', plaintext: 'text'};
        return Object.prototype.hasOwnProperty.call(aliases, name) ? aliases[name] : name;
    };

    const tokenColors = {
        comment: '#aeb4c0', prolog: '#aeb4c0', doctype: '#aeb4c0',
        string: '#9ed69e', char: '#9ed69e', 'attr-value': '#9ed69e',
        keyword: '#c6a5e8', boolean: '#c6a5e8', 'class-name': '#f5c18b',
        number: '#f5c18b', constant: '#f5c18b', function: '#bbc8ff', builtin: '#bbc8ff',
        tag: '#f2a4ad', property: '#f2a4ad', operator: '#e5e7eb', punctuation: '#e5e7eb',
    };

    const codeLanguage = pre => pre.getAttribute('data-ignite-language') ||
        pre.className.match(/\bignite-syntax-([a-z0-9_+#.-]+)/i)?.[1];

    const createCodeBlock = (editor, source, language) => {
        const name = languageName(language);
        const grammar = Object.prototype.hasOwnProperty.call(Prism.languages, name) &&
            typeof Prism.languages[name] === 'object' && new TextEncoder().encode(source).length <= maxBytes &&
            Prism.languages[name];
        const render = token => {
            if (typeof token === 'string') {
                return editor.dom.encode(token);
            }
            if (Array.isArray(token)) {
                return token.map(render).join('');
            }
            const content = render(token.content);
            const color = tokenColors[token.type];
            return color ? `<span style="color: ${color}">${content}</span>` : content;
        };
        const html = grammar ? render(Prism.tokenize(source, grammar)) : editor.dom.encode(source);
        const pre = editor.dom.create('pre', {
            class: `ignite-code-block ignite-syntax-${name}`, 'data-ignite-language': name,
            style: 'background-color: #2b2d31; color: #e5e7eb; border: 1px solid #45474e; ' +
                'border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; ' +
                'line-height: 1.6; white-space: pre; overflow-x: auto; tab-size: 4; text-shadow: none;',
        });
        pre.appendChild(editor.dom.create('code', {
            style: 'background-color: transparent; color: inherit; padding: 0; font: inherit; text-shadow: none;',
        }, html || '<br data-mce-bogus="1">'));
        return pre;
    };

    const formatCodeBlocks = (editor, html) => {
        if (!/<pre\b/i.test(html)) {
            return html;
        }
        const container = editor.getDoc().createElement('div');
        container.innerHTML = html;
        container.querySelectorAll('pre').forEach(pre => {
            const code = pre.querySelector('code');
            const language = codeLanguage(pre) ||
                `${code?.className || ''} ${pre.className}`.match(/\blanguage-([a-z0-9_+#.-]+)/i)?.[1];
            pre.replaceWith(createCodeBlock(editor, (code || pre).textContent, language));
        });
        return container.innerHTML;
    };

    const enableCodeFences = editor => {
        editor.on('keydown', event => {
            if (event.isDefaultPrevented() || event.isComposing || event.ctrlKey || event.metaKey ||
                    event.altKey || editor.mode.isReadOnly() || !editor.selection.isCollapsed()) {
                return;
            }
            const node = editor.selection.getNode();
            if (editor.dom.getParent(node, '[contenteditable="false"]')) {
                return;
            }
            const pre = editor.dom.getParent(node, 'pre');
            if (pre && event.key === 'Tab' && !event.shiftKey) {
                event.preventDefault();
                event.stopImmediatePropagation();
                editor.undoManager.transact(() => editor.insertContent('    '));
                return;
            }
            if (event.key !== 'Enter') {
                return;
            }
            const block = pre || editor.dom.getParent(node, 'p,div');
            if (!block || block === editor.getBody()) {
                return;
            }
            const range = editor.selection.getRng().cloneRange();
            range.setStart(block, 0);
            const text = block.textContent;
            const atEnd = range.toString() === text;
            const opening = !pre && !event.shiftKey && atEnd && text.match(/^ {0,3}```([a-z0-9_+#.-]*)[ \t]*$/i);
            const closing = pre && !event.shiftKey && atEnd && text.match(/(?:^|\n) {0,3}```[ \t]*$/);
            if (pre && !closing && pre.classList.contains('ignite-code-block')) {
                // TinyMCE normally inserts BR elements; a code block needs literal newlines.
                event.preventDefault();
                event.stopImmediatePropagation();
                editor.undoManager.transact(() => {
                    const caret = editor.selection.getRng();
                    const newline = editor.getDoc().createTextNode('\n');
                    caret.insertNode(newline);
                    // A trailing newline needs a caret host or the browser types before it.
                    if (atEnd && pre.lastElementChild?.nodeName !== 'BR') {
                        pre.appendChild(editor.dom.create('br', {'data-mce-bogus': '1'}));
                    }
                    editor.selection.setCursorLocation(newline, 1);
                });
                editor.nodeChanged();
                return;
            }
            if ((!opening && !closing) || block.querySelector('img,video,audio,iframe')) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            editor.undoManager.transact(() => {
                if (opening) {
                    const codeBlock = createCodeBlock(editor, '', opening[1]);
                    // Keep the open block as editable PRE text, without inline CODE boundaries.
                    codeBlock.innerHTML = '<br data-mce-bogus="1">';
                    editor.dom.replace(codeBlock, block);
                    editor.selection.setCursorLocation(codeBlock, 0);
                } else {
                    const codeBlock = createCodeBlock(editor, text.slice(0, closing.index),
                        codeLanguage(pre));
                    editor.dom.replace(codeBlock, pre);
                    const paragraph = editor.dom.create('p', {}, '<br data-mce-bogus="1">');
                    editor.dom.insertAfter(paragraph, codeBlock);
                    editor.selection.setCursorLocation(paragraph, 0);
                }
            });
            editor.nodeChanged();
        }, true);
    };

    const looksLikeMarkdown = text => /(?:^|\n) {0,3}(?:#{1,6}[ \t]+|>[ \t]+|```|~~~|[-*+][ \t]+|\d+\.[ \t]+)|\*\*[^*\s][^*\n]*\*\*|__[^_\s][^_\n]*__|\[[^[\]\n]+\]\([^\s)]+\)|(?:^|\n)[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*\||(?:^|\s)(?:\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_|`[^`\n]+`)/.test(text);

    const containsFencedCode = text => {
        let fence;
        for (const line of text.split(/\r\n?|\n/)) {
            if (!fence) {
                fence = line.match(/^ {0,3}(`{3,}|~{3,})[^\r\n]*$/)?.[1];
                continue;
            }
            const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/)?.[1];
            if (closing && closing[0] === fence[0] && closing.length >= fence.length) {
                return true;
            }
        }
        return false;
    };

    const enableDirectPaste = (editor, strings) => {
        // Prepend so TinyMCE's native paste handler cannot insert a second copy.
        editor.on('paste', async(event) => {
            const clipboard = event.clipboardData;
            if (event.isDefaultPrevented() || !clipboard || editor.mode.isReadOnly() ||
                    editor.dom.getParent(editor.selection.getNode(), 'pre,code,[contenteditable="false"]')) {
                return;
            }
            if (clipboard.files.length) {
                return;
            }
            const markdown = clipboard.getData('text/plain');
            if (new TextEncoder().encode(markdown).length > maxBytes) {
                return;
            }
            // Discord and browsers also put HTML on the clipboard when copying literal fences.
            // Keep normal rich content intact, but recognize an explicitly fenced code sample.
            if ((clipboard.getData('text/html') && !editor.options.get('paste_as_text') && !containsFencedCode(markdown)) ||
                    !looksLikeMarkdown(markdown)) {
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
                    editor.insertContent(formatCodeBlocks(editor, html));
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
                    editor.undoManager.transact(() => editor.insertContent(formatCodeBlocks(editor, html)));
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
            enableCodeFences(editor);
            return metadata;
        });
        return [pluginName, {configure}];
    });
});
