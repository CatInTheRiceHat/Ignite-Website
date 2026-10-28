<?php
// Read-only conversion checks. No users, activities, grades, or content are saved.
if (PHP_SAPI !== 'cli' || $argc !== 3) {
    exit("Usage: php moodle-markdown.php MOODLE_ROOT PLUGIN_SOURCE\n");
}
define('CLI_SCRIPT', true);
require $argv[1] . '/config.php';
require_once $argv[2] . '/classes/external/convert.php';

use tiny_ignite_markdown\external\convert;

function check_markdown(bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$source = "# Scoring\n\n**Bold** and *italic*\n\n- One\n- Two\n\n[Link](https://example.com)\n\n" .
    "| Criterion | Points |\n| --- | --- |\n| Reasoning | 3 |\n\n```python\nprint(1)\n```";
$html = convert::render($source);
foreach (['<h1>Scoring</h1>', '<strong>Bold</strong>', '<em>italic</em>', '<ul>', '<table>',
        '<td>Reasoning</td>', '<code>', 'https://example.com'] as $fragment) {
    check_markdown(str_contains($html, $fragment), 'Missing formatting: ' . $fragment);
}
$unsafe = convert::render('<script>alert(1)</script><img src="x" onerror="alert(2)">' .
    "\n\n[Bad](javascript:alert(3))\n\n<iframe src=\"https://example.com\"></iframe>");
foreach (['<script', 'onerror', 'javascript:', '<iframe'] as $fragment) {
    check_markdown(!str_contains(strtolower($unsafe), $fragment), 'Unsafe output: ' . $fragment);
}
check_markdown(convert::render('') === '', 'Empty input should stay empty');
check_markdown(str_contains(convert::render('日本語 **点数** 😀'), '<strong>点数</strong>'), 'Unicode was damaged');
check_markdown(str_contains(convert::render('`<script>`'), '&lt;script&gt;'), 'Code was not escaped');
try {
    convert::render(str_repeat('a', convert::MAX_BYTES + 1));
    throw new RuntimeException('Oversized input was accepted');
} catch (invalid_parameter_exception $expected) {
    // The server limit must hold even when the client check is bypassed.
}
// Check the real external API after installation, without writing content.
if (get_config('tiny_ignite_markdown', 'version')) {
    \core\session\manager::set_user(get_admin());
    $context = context_system::instance();
    check_markdown(str_contains(convert::execute($context->id, '# Test'), '<h1>Test</h1>'), 'Authenticated conversion failed');
    \core\session\manager::set_user(guest_user());
    try {
        convert::execute($context->id, '# Test');
        throw new RuntimeException('Guest conversion was accepted');
    } catch (required_capability_exception | require_login_exception $expected) {
        // Guests cannot invoke the conversion service.
    }
}
echo "Markdown formatting, tables, code, Unicode, HTML sanitization, size limits, and access checks passed.\n";
