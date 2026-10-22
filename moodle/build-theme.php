<?php
// Moodle can silently fall back to its stock CSS after a Sass error. Treat that
// diagnostic as a failed deployment so the caller restores the previous settings.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
define('CLI_SCRIPT', true);
define('NO_DEBUG_DISPLAY', false);
if ($argc !== 2) {
    fwrite(STDERR, "Usage: build-theme.php MOODLE_ROOT\n");
    exit(1);
}
require $argv[1] . '/config.php';
require_once $CFG->libdir . '/csslib.php';
$CFG->debug = DEBUG_DEVELOPER;
$CFG->debugdisplay = false;
set_error_handler(static function ($severity, $message) {
    if (str_contains($message, 'Error while compiling SCSS:')) {
        throw new RuntimeException($message);
    }
    return false;
});
try {
    theme_build_css_for_themes([theme_config::load('boost')], ['ltr', 'rtl']);
    echo "Boost CSS compiled successfully (LTR and RTL).\n";
} finally {
    restore_error_handler();
}
