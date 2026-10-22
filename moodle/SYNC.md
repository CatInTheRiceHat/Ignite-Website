# Moodle deployment

Ignite Moodle runs at `https://learn.ignitefindyourfire.org` on the DigitalOcean server `159.89.158.200`. The confirmed installation is Moodle 5.2.3, with code at `/var/www/moodle`, public code at `/var/www/moodle/public`, and PHP running as `www-data`. The website's Vercel deployment and this Moodle deployment are separate.

## Connection

Local connection settings live in `moodle/connection.local`, which Git ignores via `*.local`. Start from `connection.example.json` on another computer, then authorize that computer's SSH public key. The configured private key is `~/.ssh/ignite_moodle_ed25519`; it stays outside the repository. SSH checks the server's known host key and never prompts for a password.

## Edit and deploy

1. Edit `moodle/raw.scss`, `moodle/theme.scss`, or the dashboard HTML snippets.
2. Run `npm run moodle:check` to preview differences against live Moodle.
3. Run `npm run moodle:deploy` to back up the managed settings, apply changes through Moodle's APIs, clear theme caches, compile both LTR and RTL CSS, and check the public login page.

Codex can run these commands directly when asked to make and deploy Moodle changes; the user does not need to paste styles into the admin interface. Deployment is explicit, rather than triggered by every file save or a Vercel website build. A repeated deployment with matching content makes no settings changes and creates no additional backup.

The sync owns Boost's Raw SCSS, the `theme.scss` preset file and preset selection, brand colour `#F07B2A`, and content in existing Ignite dashboard Text blocks. Dashboard blocks are identified by the `ignite-learning-nav` or `ignite-learning-welcome` class on `my-index` pages. Their other configuration and positions are preserved. Matching default blocks and personal copies receive content updates. Missing blocks are reported, not created. The tool never resets personal dashboards or modifies courses, enrollments, grades, or Moodle core code. See [DASHBOARD.md](DASHBOARD.md) for the separate initial block arrangement.

Backups contain the previous managed theme settings, preset content, and managed block configurations. They are private files under `/var/backups/ignite-moodle`, outside the web root. They are configuration backups, not full site or database backups.

To restore one, use its filename from the deployment output:

```sh
node scripts/sync-moodle.mjs --restore=20261021T120000Z-12345678.json
```

Restoring also takes a backup of the state it replaces. If CSS compilation fails during deployment, the runner restores the previous settings and rebuilds the previous CSS automatically. A failed HTTP check is reported with the backup filename for investigation. A learner-account visual check is still needed for authenticated dashboard changes.
