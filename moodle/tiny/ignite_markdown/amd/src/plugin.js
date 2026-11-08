/* This file is part of Moodle - https://moodle.org/
 * Licensed under the GNU GPL v3 or later. */

define('tiny_ignite_markdown/plugin', [
    'core/ajax', 'core/str', 'editor_tiny/loader', 'editor_tiny/utils', 'editor_tiny/options',
    'tiny_ignite_markdown/source', 'tiny_autosave/options',
], function(Ajax, Str, Loader, Utils, Options, Source, Autosave) {
    const component = 'tiny_ignite_markdown';
    const pluginName = component + '/plugin';
    const keys = ['edit', 'preview', 'source', 'loading', 'failed', 'toolarge', 'previewempty'];
    return Promise.all([
        Loader.getTinyMCE(),
        Str.get_strings(keys.map(key => ({key, component}))),
        Utils.getPluginMetadata(component, pluginName),
    ]).then(([tinyMCE, values, metadata]) => {
        const strings = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
        tinyMCE.PluginManager.add(pluginName, editor => {
            Source.install(editor, strings, markdown => Ajax.call([{
                methodname: 'tiny_ignite_markdown_convert',
                args: {contextid: Options.getContextId(editor), markdown},
            }])[0], Autosave);
            return metadata;
        });
        return [pluginName, {configure: () => ({text_patterns: []})}];
    });
});
