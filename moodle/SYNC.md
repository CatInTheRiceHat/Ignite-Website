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
