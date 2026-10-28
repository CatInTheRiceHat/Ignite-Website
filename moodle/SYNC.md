# Moodle deployment

Ignite Moodle runs at `https://learn.ignitefindyourfire.org` on the DigitalOcean server `159.89.158.200`. The confirmed installation is Moodle 5.2.4, with code at `/var/www/moodle`, public code at `/var/www/moodle/public`, and PHP running as `www-data`. The website's Vercel deployment and this Moodle deployment are separate.

## Connection

Local connection settings live in `moodle/connection.local`, which Git ignores via `*.local`. Start from `connection.example.json` on another computer, then authorize that computer's SSH public key. The configured private key is `~/.ssh/ignite_moodle_ed25519`; it stays outside the repository. SSH checks the server's known host key and never prompts for a password.

## Edit and deploy

1. Edit `moodle/raw.scss`, `moodle/theme.scss`, `moodle/authentication.html`, or the dashboard HTML snippets.
2. Run `npm run moodle:check` to preview differences against live Moodle.
3. Run `npm run moodle:deploy` to back up the managed settings, apply changes through Moodle's APIs, clear theme caches, compile both LTR and RTL CSS, and check the public login page.

Codex can run these commands directly when asked to make and deploy Moodle changes; the user does not need to paste styles into the admin interface. Deployment is explicit, rather than triggered by every file save or a Vercel website build. A repeated deployment with matching content makes no settings changes and creates no additional backup.

The sync owns Boost's Raw SCSS, the `theme.scss` preset file and preset selection, brand colour `#F07B2A`, and content in existing Ignite dashboard Text blocks. It also deploys `authentication.html` as a marked fragment in **Additional HTML → Before BODY is closed**, preserving any surrounding HTML. This selects seasonal backgrounds on login and sign-up and replaces sign-up's Cancel with a direct Log in link while keeping native form initialization and validation. Dashboard blocks are identified by the `ignite-learning-nav` or `ignite-learning-welcome` class on `my-index` pages. Their other configuration and positions are preserved. Matching default blocks and personal copies receive content updates. Missing blocks are reported by routine deployment. The tool never resets personal dashboards or modifies courses, enrollments, grades, or Moodle core code.

Seasonal artwork comes from `public/backgrounds/Spring.jpg`, `Summer.jpg`, `Fall.jpg`, and `Winter.jpg`. Deployment publishes immutable copies under Moodle's `ignite-assets` directory and verifies their checksums before updating settings. Both authentication screens use **Europe/London** time, including British Summer Time: spring begins March 1, summer June 1, fall September 1, and winter December 1, each at 00:00. The page checks at minute boundaries and when a tab returns to view, so an open page can switch without a reload. Old image versions remain available for configuration restores. Without JavaScript, the existing fall artwork is the fallback.

## Staff CSV imports

The `local_ignite_staffimports` plugin, sourced from `moodle/local/ignite_staffimports`, defaults new accounts created through Moodle's **Upload users** CSV page to `ignite_course_developer` when their rows contain no explicit role, course, category, group, or cohort assignment. Existing roles and explicit assignments take precedence. Public sign-ups, manually added accounts, and profile updates are unaffected. The uploader must already have permission to upload users and assign Course Developer.

The default runs after the native importer finishes its explicit assignments. It retains the course-creator permission model: developers can create courses and automatically receive Teacher access within the courses they create. It refuses to assign the default if Course Developer has been changed into a role with site-wide course editing or administration rights. The switch is under **Site administration → Plugins → Local plugins → Ignite staff imports**.

Deploy this plugin separately through Moodle's normal local-plugin installation/upgrade process; `moodle:deploy` only manages the theme and dashboard. Preserve the plugin during Moodle core upgrades. The integration checks in `tests/moodle-staff-imports.php` require a private Moodle database with `_staffimports_test_` in its name and outbound email disabled.

## Markdown in TinyMCE

The `tiny_ignite_markdown` plugin, sourced from `moodle/tiny/ignite_markdown`, adds **Markdown** to the toolbar and **Insert** menu. Type or paste Markdown into its dialog, or use **Open .md file**, then click **Insert formatted content**. A selection pre-fills the dialog and is replaced on insertion; otherwise content is inserted at the cursor. One Undo reverses insertion. Save the surrounding Moodle form normally to keep the content. This works in TinyMCE fields, including quiz **Information for graders**; inline marking-guide fields that do not use TinyMCE retain their native editing interface.

Conversion uses Moodle's own Markdown parser and HTML sanitizer on the same server, with a 100 KiB limit. It supports headings, emphasis, lists, links, tables, and fenced code blocks. It creates no separate files or records and calls no external conversion service. Relative image/file links in imported Markdown still need to be replaced with valid Moodle uploads or accessible URLs. The capability `tiny/ignite_markdown:use` allows authenticated users by default and can be restricted through roles.

Rebuild the bundled AMD file with `node scripts/build-moodle-markdown.mjs` and deploy the plugin directory to `/var/www/moodle/public/lib/editor/tiny/plugins/ignite_markdown` through Moodle's normal plugin installation/upgrade process. Check for unrelated pending upgrades and take a private backup first. This plugin is deployed separately from `moodle:deploy`; preserve it during core upgrades. Run `npm test -- tests/moodle/markdown.test.ts` for editor behavior and `php tests/moodle-markdown.php MOODLE_ROOT PLUGIN_SOURCE` on the server for read-only parser, sanitization, size-limit, and access checks. To remove it, use Moodle's plugin uninstall process before removing its code directory.

Version 1.0.0 was installed on October 28, 2026, on Moodle 5.2.4 after a full PostgreSQL backup under `/var/backups/ignite-moodle/markdown-20261028GMT1742060/database.dump`. Parser and access checks passed on Moodle. Browser checks with TinyMCE 8.2.2 verified the installed module's dialog, insertion, Undo, and file loading; the conversion HTTP response was intercepted for that browser check, while the real converter and authenticated/guest access were checked separately through PHP. The local test suite passed with 122 tests and four unrelated skips.

## Initial dashboard installation

Deploying styles alone does not add the navigation and welcome panels. Use `npm run moodle:dashboard:check` to preview the initial setup and `npm run moodle:dashboard:install` to install missing panels on the default dashboard and every existing personal dashboard. The installer enables My courses so the navigation links work. It adds the two panels above existing content, preserving native blocks, their positions, and personal dashboard records. New users inherit the default dashboard. Repeating installation adds no duplicates.

This setup was applied on October 22, 2026: 56 panels were added across 28 dashboards. Existing native block records, dashboard records, and block-position overrides were verified unchanged. Routine HTML edits now reach these panels through `npm run moodle:deploy`. See [DASHBOARD.md](DASHBOARD.md) for the design and manual fallback.

Installation writes a private manifest alongside theme backups. To undo an installation, remove only its created panels and restore the previous My courses setting with:

```sh
node scripts/sync-moodle.mjs --dashboard --restore=INSTALLATION-BACKUP.json
```

Backups contain the previous managed theme settings, preset content, authentication footer, and managed block configurations. Backups created before the authentication enhancement leave the current footer unchanged when restored. They are private files under `/var/backups/ignite-moodle`, outside the web root. They are configuration backups, not full site or database backups.

To restore one, use its filename from the deployment output:

```sh
node scripts/sync-moodle.mjs --restore=20261021T120000Z-12345678.json
```

Restoring also takes a backup of the state it replaces. If CSS compilation fails during deployment, the runner restores the previous settings and rebuilds the previous CSS automatically. A failed HTTP check is reported with the backup filename for investigation. A learner-account visual check is still needed for authenticated dashboard changes.
