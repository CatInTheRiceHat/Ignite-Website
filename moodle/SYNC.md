# Moodle deployment

Ignite Moodle runs at `https://learn.ignitefindyourfire.org` on the DigitalOcean server `159.89.158.200`. The confirmed installation is Moodle 5.2.4, with code at `/var/www/moodle`, public code at `/var/www/moodle/public`, and PHP running as `www-data`. The website's Vercel deployment and this Moodle deployment are separate.

## Connection

Local connection settings live in `moodle/connection.local`, which Git ignores via `*.local`. Start from `connection.example.json` on another computer, then authorize that computer's SSH public key. The configured private key is `~/.ssh/ignite_moodle_ed25519`; it stays outside the repository. SSH checks the server's known host key and never prompts for a password.

## Edit and deploy

1. Edit `moodle/raw.scss`, `moodle/theme.scss`, `moodle/authentication.html`, the dashboard HTML snippets, or `moodle/templates/block_myoverview/zero-state.mustache`.
2. Run `npm run moodle:check` to preview differences against live Moodle.
3. Run `npm run moodle:deploy` to back up the managed settings, apply changes through Moodle's APIs, clear theme caches, compile both LTR and RTL CSS, and check the public login page.

Codex can run these commands directly when asked to make and deploy Moodle changes; the user does not need to paste styles into the admin interface. Deployment is explicit, rather than triggered by every file save or a Vercel website build. A repeated deployment with matching content makes no settings changes and creates no additional backup.

The sync owns Boost's Raw SCSS, the `theme.scss` preset file and preset selection, brand colour `#F07B2A`, and content in existing Ignite dashboard Text blocks. It also deploys `authentication.html` as a marked fragment in **Additional HTML → Before BODY is closed**, preserving any surrounding HTML. This selects seasonal backgrounds on login and sign-up and replaces sign-up's Cancel with a direct Log in link while keeping native form initialization and validation. Dashboard blocks are identified by the `ignite-learning-nav` or `ignite-learning-welcome` class on `my-index` pages. Their other configuration and positions are preserved. Matching default blocks and personal copies receive content updates. Missing blocks are reported by routine deployment. The tool never resets personal dashboards or modifies courses, enrollments, grades, or Moodle core code.

The managed Boost template override at `public/theme/boost/templates/block_myoverview/zero-state.mustache` adds the first-course welcome and existing puzzled mascot for accounts without active enrolled courses. Native permission-checked course actions are preserved. The sync backs up the previous override, writes it atomically, and restores it if deployment fails. Backups from before this feature leave the current override intact. Preserve this custom override when replacing the Boost directory during a Moodle upgrade; `moodle:deploy` can reinstall it. No upstream Moodle template or PHP file is edited.

Seasonal artwork comes from `public/backgrounds/Spring.jpg`, `Summer.jpg`, `Fall.jpg`, and `Winter.jpg`. Deployment publishes immutable copies under Moodle's `ignite-assets` directory and verifies their checksums before updating settings. Both authentication screens use **Europe/London** time, including British Summer Time: spring begins March 1, summer June 1, fall September 1, and winter December 1, each at 00:00. The page checks at minute boundaries and when a tab returns to view, so an open page can switch without a reload. Old image versions remain available for configuration restores. Without JavaScript, the existing fall artwork is the fallback.

## Staff CSV imports

The `local_ignite_staffimports` plugin, sourced from `moodle/local/ignite_staffimports`, defaults new accounts created through Moodle's **Upload users** CSV page to `ignite_course_developer` when their rows contain no explicit role, course, category, group, or cohort assignment. Existing roles and explicit assignments take precedence. Public sign-ups, manually added accounts, and profile updates are unaffected. The uploader must already have permission to upload users and assign Course Developer.

The default runs after the native importer finishes its explicit assignments. It retains the course-creator permission model: developers can create courses and automatically receive Teacher access within the courses they create. It refuses to assign the default if Course Developer has been changed into a role with site-wide course editing or administration rights. The switch is under **Site administration → Plugins → Local plugins → Ignite staff imports**.

Deploy this plugin separately through Moodle's normal local-plugin installation/upgrade process; `moodle:deploy` only manages the theme and dashboard. Preserve the plugin during Moodle core upgrades. The integration checks in `tests/moodle-staff-imports.php` require a private Moodle database with `_staffimports_test_` in its name and outbound email disabled.

## Markdown in TinyMCE

The `tiny_ignite_markdown` plugin, sourced from `moodle/tiny/ignite_markdown`, supports Markdown directly in TinyMCE. Type `# ` for a heading, `- ` or `1. ` for lists, `> ` for a quote, or enclose text in `**bold**`, `*italic*`, `_italic_`, or backticks for inline code. Inline formatting applies when Space or Enter is pressed. These shortcuts use TinyMCE's native text patterns and work without a network request.

Pasting plain Markdown formats it in place using Moodle's converter, including links, tables, and fenced code blocks. Complete fenced code examples also convert when the clipboard includes HTML, as happens when copying from Discord or a browser. Other rich-text and image pastes keep Moodle's usual behavior; use Paste as plain text (Ctrl+Shift+V, or Cmd+Shift+V on Mac) to convert other Markdown copied with HTML formatting. Pasting into code/preformatted sections keeps literal text. Markdown source appears immediately while conversion runs. If conversion fails, the text stays available; if the user edits or moves away, a late response does not replace their work. Undo first recovers the original Markdown, then undoes the paste.

For Discord-style code entry, type three backticks followed by a language identifier (for example, `py` or `js`) and press Enter. Write the code underneath. Three backticks on their own line followed by Enter close the block and return to normal text. Tab inserts four spaces within a code block. Closing the block applies syntax colours using Moodle's bundled Prism engine; pasted and dialog-imported fenced code receive the same dark styling. Bare fences and unknown language identifiers preserve plain code. Code is displayed, never executed. Colours and the language class survive Moodle's HTML sanitizer and do not depend on a site-wide filter being enabled. Existing code samples are not rewritten automatically.

The **Markdown** toolbar button and **Insert** menu item remain available for importing `.md` files or converting a selection through the dialog. A selection pre-fills the dialog and is replaced on insertion; otherwise content is inserted at the cursor. One Undo reverses dialog insertion. Save the surrounding Moodle form normally to keep the content. This works in TinyMCE fields, including quiz **Information for graders**; inline marking-guide fields that do not use TinyMCE retain their native editing interface.

Conversion uses Moodle's own Markdown parser and HTML sanitizer on the same server, with a 100 KiB limit. It supports headings, emphasis, lists, links, tables, and fenced code blocks. It creates no separate files or records and calls no external conversion service. Relative image/file links in imported Markdown still need to be replaced with valid Moodle uploads or accessible URLs. The capability `tiny/ignite_markdown:use` allows authenticated users by default and can be restricted through roles.

Rebuild the bundled AMD file with `node scripts/build-moodle-markdown.mjs` and deploy the plugin directory to `/var/www/moodle/public/lib/editor/tiny/plugins/ignite_markdown` through Moodle's normal plugin installation/upgrade process. Check for unrelated pending upgrades and take a private backup first. This plugin is deployed separately from `moodle:deploy`; preserve it during core upgrades. Run `npm test -- tests/moodle/markdown.test.ts` for editor behavior and `php tests/moodle-markdown.php MOODLE_ROOT PLUGIN_SOURCE` on the server for read-only parser, sanitization, size-limit, and access checks. To remove it, use Moodle's plugin uninstall process before removing its code directory.

Run `npx playwright test --config config/playwright.markdown.config.ts` for direct typing, paste, Undo, and draft-preservation checks in the installed TinyMCE engine. This browser suite uses an unsaved, anonymous test editor with a controlled conversion response; the PHP suite separately tests real server conversion and access. Moodle's upgrade and cache-purge CLI scripts are under `/var/www/moodle/admin/cli`, outside `public`.

The optional `live-markdown.spec.js` check uses Moodle's actual course form, authenticated conversion service, submission, rendered Page activity, and reopened edit form. Provide `IGNITE_MARKDOWN_LIVE_FIXTURE` as a path to a private JSON file with a disposable teacher's `username`, `password`, hidden `courseid`, and course `shortname`. The account and course must be created solely for this check and use the prefixes `ignite_md_probe_` and `IGNITE-MD-PROBE-`; do not use a real teacher's account or course. Run `IGNITE_MARKDOWN_LIVE_FIXTURE=/secure/fixture.json npx playwright test --config config/playwright.markdown.config.ts live-markdown.spec.js`, then remove the temporary course and deactivate the test account. The test waits for native autosave restoration before clearing its own fixture draft; TinyMCE's `initialized` flag alone does not mean autosave restoration has finished. The live test is skipped when no fixture is provided.

To test Course Developer specifically, give the disposable account only the global `ignite_course_developer` role and set the fixture's `role` to `course_developer`, `courseid` to `0`, and supply `categoryid` and a temporary `fullname`. The test first checks copied fenced code in the category-context course-summary editor, then creates a hidden course through Moodle's course-creation form and runs the activity save/display/reopen checks. It writes the new course ID into the private fixture JSON for cleanup. No Teacher role is assigned by the test; Moodle's native course-creation flow assigns the configured creator role within that course.

Version 1.0.0 was installed on October 28, 2026, on Moodle 5.2.4 after a full PostgreSQL backup under `/var/backups/ignite-moodle/markdown-20261028GMT1742060/database.dump`. Parser and access checks passed on Moodle. Browser checks with TinyMCE 8.2.2 verified the installed module's dialog, insertion, Undo, and file loading; the conversion HTTP response was intercepted for that browser check, while the real converter and authenticated/guest access were checked separately through PHP. The local test suite passed with 122 tests and four unrelated skips.

Version 1.1.0 was installed on November 7, 2026 (Pacific time). The full database backup, previous plugin archive, and previous plugin directory are under `/var/backups/ignite-moodle/markdown-20261108T064229Z`. The upgrade changes no course content or activity records. All 68 focused tests and three TinyMCE 8.2.2 browser scenarios passed. Read-only PHP checks verified the live converter, HTML sanitizer, size limits, and authenticated/guest access; the public JavaScript checksum matched the tested bundle.

Version 1.2.0 was installed later on November 7, 2026 (Pacific time), with database and previous-plugin backups under `/var/backups/ignite-moodle/markdown-20261108T071415Z`. All 68 focused tests and six isolated browser scenarios passed against Moodle's installed TinyMCE 8.2.2 and Prism engines. Real server checks additionally verified fenced-language retention and styled-code sanitization. This update adds no external libraries, changes no global filter settings, and modifies no course or activity content.

Version 1.2.1 fixes copied fenced examples whose clipboard also contains HTML. The failure was reproduced in Moodle's native course editor with a disposable teacher account. The full database and previous plugin are backed up under `/var/backups/ignite-moodle/markdown-20261108T073755Z`. All 72 focused checks and six isolated browser scenarios passed. The native teacher test passed twice, including actual save, display, and reopening of typed and rich-clipboard pasted Python code with colours and indentation retained. The hidden test course and disposable account were cleaned up afterward; no existing teacher's course or draft was altered.

On November 8, 2026, the Course Developer scenario also passed on live Moodle. The temporary account had only `ignite_course_developer` globally and no site-wide activity editing permission. Copied Python code converted before course creation, and the submitted course summary retained its syntax colours. Moodle automatically enrolled the creator as `editingteacher` only within the new hidden course. Typed and pasted code in a Page activity retained colours and indentation after saving, display, and reopening. Server checks confirmed Markdown permission in both category and course contexts. The temporary course and account were cleaned up; no production role or editor settings required changes.

## Initial dashboard installation

The live layout was simplified on November 1, 2026: Timeline appears first and Course overview second. Announcements, the legacy Text panels, and other widgets are hidden on the default and existing personal dashboards. Routine theme sync preserves these native block-position settings. See [DASHBOARD.md](DASHBOARD.md) for the layout backup and validation. The installation commands below describe the earlier navigation/welcome setup, not the current two-block arrangement.

Deploying styles alone does not add the navigation and welcome panels. Use `npm run moodle:dashboard:check` to preview the initial setup and `npm run moodle:dashboard:install` to install missing panels on the default dashboard and every existing personal dashboard. The installer enables My courses so the navigation links work. It adds the two panels above existing content, preserving native blocks, their positions, and personal dashboard records. New users inherit the default dashboard. Repeating installation adds no duplicates.

This setup was applied on October 22, 2026: 56 panels were added across 28 dashboards. Existing native block records, dashboard records, and block-position overrides were verified unchanged. Routine HTML edits now reach these panels through `npm run moodle:deploy`. See [DASHBOARD.md](DASHBOARD.md) for the design and manual fallback.

Installation writes a private manifest alongside theme backups. To undo an installation, remove only its created panels and restore the previous My courses setting with:

```sh
node scripts/sync-moodle.mjs --dashboard --restore=INSTALLATION-BACKUP.json
```

Backups contain the previous managed theme settings, preset content, template override, authentication footer, and managed block configurations. Backups created before the authentication enhancement leave the current footer unchanged when restored. They are private files under `/var/backups/ignite-moodle`, outside the web root. They are configuration backups, not full site or database backups.

To restore one, use its filename from the deployment output:

```sh
node scripts/sync-moodle.mjs --restore=20261021T120000Z-12345678.json
```

Restoring also takes a backup of the state it replaces. If CSS compilation fails during deployment, the runner restores the previous settings and rebuilds the previous CSS automatically. A failed HTTP check is reported with the backup filename for investigation. A learner-account visual check is still needed for authenticated dashboard changes.
