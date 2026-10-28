/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */

define('tiny_ignite_markdown/plugin', [
    'core/ajax', 'core/str', 'editor_tiny/loader', 'editor_tiny/utils', 'editor_tiny/options',
], function(Ajax, Str, Loader, Utils, Options) {
    const component = 'tiny_ignite_markdown';
    const pluginName = component + '/plugin';
    const button = component + '_markdown';
    const maxBytes = 102400;

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
                    const html = await Ajax.call([{
                        methodname: 'tiny_ignite_markdown_convert',
                        args: {contextid: Options.getContextId(editor), markdown},
                    }])[0];
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
        return {menu, toolbar: Utils.addToolbarButtons(config.toolbar, 'content', [button])};
    };

    return Promise.all([
        Loader.getTinyMCE(),
        Str.get_strings([
            'markdown', 'source', 'help', 'insert', 'loadfile', 'cancel', 'converting', 'loading',
            'empty', 'toolarge', 'invalidfile', 'failed', 'filefailed',
        ].map(key => ({key, component}))),
        Utils.getPluginMetadata(component, pluginName),
    ]).then(([tinyMCE, values, metadata]) => {
        const strings = Object.fromEntries([
            'markdown', 'source', 'help', 'insert', 'loadfile', 'cancel', 'converting', 'loading',
            'empty', 'toolarge', 'invalidfile', 'failed', 'filefailed',
        ].map((key, index) => [key, values[index]]));
        tinyMCE.PluginManager.add(pluginName, (editor) => {
            const onAction = () => openDialog(editor, strings);
            editor.ui.registry.addButton(button, {text: strings.markdown, tooltip: strings.markdown, onAction});
            editor.ui.registry.addMenuItem(button, {text: strings.markdown, onAction});
            return metadata;
        });
        return [pluginName, {configure}];
    });
});
