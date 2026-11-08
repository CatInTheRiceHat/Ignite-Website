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

The `tiny_ignite_markdown` plugin, sourced from `moodle/tiny/ignite_markdown`, now uses a CodeMirror 6 Markdown source editor with **Edit** and **Preview** tabs. Edit keeps literal Markdown, soft wrapping, selection, paste, cursor position and undo history. Preview renders the current unsaved draft through the existing authenticated Moodle Markdown converter and HTML sanitizer. Headings, nested lists, links, images, tables and fenced code use the same generated HTML that the native form saves. Preview inherits the published view's theme styles. Arrow keys, Home and End move between tabs.

Save through the surrounding Moodle form normally. If the current draft has not been rendered, submission waits for conversion, then replays the original save button through native validation and save handlers. Conversion failures retain the draft and allow retry. Cancel stays available. The existing `tiny/ignite_markdown:use` permission and 100 KiB UTF-8 conversion limit still apply. Typing and pasting no longer replace source with formatted HTML.

Storage remains Moodle's native HTML field and format. Newly edited content includes a versioned inert HTML comment containing JSON-escaped Markdown source, followed by its sanitized rendered HTML. The source record escapes comment delimiters and leaves attachment URLs available to Moodle's native draftfile/`@@PLUGINFILE@@` rewriting. The comment is not rendered in published content. Existing HTML documents are initially shown as raw HTML, which Markdown supports; an unchanged legacy document saves its original HTML exactly. Editing it retains its existing HTML within the Markdown source rather than attempting a lossy HTML-to-Markdown conversion. There is no bulk content migration, new content table or separate save endpoint.

Native TinyMCE remains hidden in its original DOM location to retain Moodle's form and autosave lifecycle. Source edits notify its undo-based autosave mechanism; restoration finishes before typing is enabled. Draft and render state belong to each editor instance, and late conversion responses cannot replace newer text or another loaded document. Autosave stores source even before Preview is requested. Preview and tab changes do not replace the CodeMirror state.

Use Node 22.x. Rebuild both bundled AMD modules with `node scripts/build-moodle-markdown.mjs`. Deploy the plugin directory separately to `/var/www/moodle/public/lib/editor/tiny/plugins/ignite_markdown` through Moodle's normal plugin upgrade process; `moodle:deploy` only manages theme/dashboard assets. Check for unrelated pending upgrades and back up first. Version 2.0.0 requires native `tiny_autosave`. Preserve the plugin during core upgrades. This repository change does not itself deploy the upgrade to production.

Run `npm test -- tests/moodle/markdown.test.ts` for exact source storage, legacy preservation, attachment rewriting, failed renders and stale-response checks. Run `npx playwright test --config config/playwright.markdown.config.ts markdown-browser/markdown.spec.js` for source editing, paste, tabs, undo/redo, save gating, offline retry and narrow layout against Moodle's installed TinyMCE engine with a controlled converter. Run `php tests/moodle-markdown.php MOODLE_ROOT PLUGIN_SOURCE` on a Moodle instance for the real parser, sanitization, size-limit and capability checks.

The optional `live-markdown.spec.js` exercises the actual Page edit route, authenticated converter, legacy save, Preview, native Save and display, reload and reopened source. Set `IGNITE_MARKDOWN_BASE_URL` to an isolated Moodle instance with the candidate plugin installed, and `IGNITE_MARKDOWN_LIVE_FIXTURE` to a private JSON fixture containing a disposable teacher's `username`, `password`, hidden `courseid` and course `shortname`. An optional `moduleid` and `legacy` source test an existing HTML Page. Accounts/courses must use the prefixes `ignite_md_probe_` and `IGNITE-MD-PROBE-`. Remove the temporary course and deactivate the account afterward. The live checks are skipped without a fixture; never use a real author's document or draft.

Version 1.0.0 was installed on October 28, 2026, on Moodle 5.2.4 after a full PostgreSQL backup under `/var/backups/ignite-moodle/markdown-20261028GMT1742060/database.dump`. Parser and access checks passed on Moodle. Browser checks with TinyMCE 8.2.2 verified the installed module's dialog, insertion, Undo, and file loading; the conversion HTTP response was intercepted for that browser check, while the real converter and authenticated/guest access were checked separately through PHP. The local test suite passed with 122 tests and four unrelated skips.

Version 1.1.0 was installed on November 7, 2026 (Pacific time). The full database backup, previous plugin archive, and previous plugin directory are under `/var/backups/ignite-moodle/markdown-20261108T064229Z`. The upgrade changes no course content or activity records. All 68 focused tests and three TinyMCE 8.2.2 browser scenarios passed. Read-only PHP checks verified the live converter, HTML sanitizer, size limits, and authenticated/guest access; the public JavaScript checksum matched the tested bundle.

Version 1.2.0 was installed later on November 7, 2026 (Pacific time), with database and previous-plugin backups under `/var/backups/ignite-moodle/markdown-20261108T071415Z`. All 68 focused tests and six isolated browser scenarios passed against Moodle's installed TinyMCE 8.2.2 and Prism engines. Real server checks additionally verified fenced-language retention and styled-code sanitization. This update adds no external libraries, changes no global filter settings, and modifies no course or activity content.

Version 1.2.1 fixes copied fenced examples whose clipboard also contains HTML. The failure was reproduced in Moodle's native course editor with a disposable teacher account. The full database and previous plugin are backed up under `/var/backups/ignite-moodle/markdown-20261108T073755Z`. All 72 focused checks and six isolated browser scenarios passed. The native teacher test passed twice, including actual save, display, and reopening of typed and rich-clipboard pasted Python code with colours and indentation retained. The hidden test course and disposable account were cleaned up afterward; no existing teacher's course or draft was altered.

On November 8, 2026, the Course Developer scenario also passed on live Moodle. The temporary account had only `ignite_course_developer` globally and no site-wide activity editing permission. Copied Python code converted before course creation, and the submitted course summary retained its syntax colours. Moodle automatically enrolled the creator as `editingteacher` only within the new hidden course. Typed and pasted code in a Page activity retained colours and indentation after saving, display, and reopening. Server checks confirmed Markdown permission in both category and course contexts. The temporary course and account were cleaned up; no production role or editor settings required changes.

Version 1.3.0 fixes the reported case where a literal opening fence was typed inside an already-preformatted field. The database and previous plugin backup are under `/var/backups/ignite-moodle/markdown-20261108T084653Z`. All 72 focused checks and 12 browser scenarios passed, including surrounding-text preservation, splitting a preformatted block in the middle, Undo, removing full/empty code blocks, partial deletion, and returning to normal text. The expanded native Course Developer check reproduced the `pre` field state, saved and reopened its code, deleted a saved block and restored it with Undo, exited to a normal paragraph, created and removed another empty block, and submitted the edited activity again. Server verification confirmed the tested bundle, plugin version `2026110800`, no pending upgrades, and the saved activity content. The disposable course and account were cleaned up afterward.

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
