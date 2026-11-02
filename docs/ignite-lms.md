# Ignite LMS foundation

This is the preserved Prompt 1 foundation record. See [the integrated learner dashboard](ignite-dashboard.md) for the current combined schema, services, native block, experimental heat configuration, and verification. Later-phase behavior supersedes this record where explicitly described.

This records the completed Prompt 1 baseline. [Prompt 3 Hearth extensions](phases/prompt3-hearths.md) supersede its placeholder seeding, learner-facing house terminology and membership-history limits; existing stable IDs/services are preserved.

## Installed system and boundaries

Inspected November 1, 2026 by reading the installed source over SSH. Moodle reports **5.2.4 (Build: 20261005)**, branch `502`, core version `2026042004.00`, with PHP 8.3.6. The installation root is `/var/www/moodle`; the public webroot and plugin root are `/var/www/moodle/public`. The repository contains customizations, not a complete Moodle distribution.

The active integration uses Boost, the existing `moodle/theme.scss` and `moodle/raw.scss`, dashboard snippets, and a Course overview empty-state template override. The current native dashboard uses Timeline followed by Course overview. Existing custom plugins are `local_ignite_staffimports` and `tiny_ignite_markdown`. They remain separate and unchanged. See [deployment](../moodle/SYNC.md) and [dashboard notes](../moodle/DASHBOARD.md).

The public marketing website uses React, TypeScript, Vite, and Node 22. The installed Moodle source has its own Grunt, AMD, Sass, and Composer tooling; it is separate from the marketing build. This phase introduces **`local_ignite`**, sourced from `moodle/local/ignite`, installed under `public/local/ignite`. It uses Moodle PHP autoloading, XMLDB, native admin settings and forms, Mustache, and scoped CSS. No JavaScript or Node build is needed for this plugin. The bundled PNGs are exact copies of existing Sol assets from `public/mascots`.

Business logic belongs in this local plugin, not in Boost or injected dashboard HTML. Later phases can add walkthrough and Passport interfaces to the same services, and a thin dashboard block if needed. This phase does not install or rearrange dashboard blocks, change the default landing page, create courses, award badges, or deploy to production.

## Components and data

| Component | Responsibility |
| --- | --- |
| `access` | Feature switches, capability checks, locks, delegated transactions |
| `preferences` | Read and replace only the signed-in learner's preference record |
| `houses` | Admin configuration, active-house discovery, own membership changes |
| `catalog` | Validate stable interest/path keys and real Moodle references |
| `home` | Assemble own preferences, house, and native enrolled courses |
| `privacy/provider` | Metadata, user-context discovery, export, individual/bulk/context deletion |
| `observer` | Remove Ignite personal data on Moodle account deletion |

`local_ignite_prefs` has one row per Moodle user, enforced by an XMLDB `foreign-unique` user key. It stores a JSON list of stable interest keys, optional plain-text goals (2,000 characters), onboarding status, current step, an optional stable path key, and creation/modification times. Reading an empty profile does not create a record. Saving is a full replacement, not a partial patch. Duplicate interest keys are normalized.

Statuses are `notstarted`, `inprogress`, and `complete`. Steps are `interests`, `path`, `house`, `challenge`, and `done`. `complete` requires `done`, and `done` requires `complete`. These are persisted state values for future interfaces, not evidence of course completion or badge eligibility. The future walkthrough must implement its transitions and completion rules using Moodle completion APIs.

`local_ignite_house` stores a generated numeric ID, immutable unique code, editable display name, plain-text description, validated accent color, emblem key, active status, and modification time. Ember, Flare, Nova, and Phoenix are editable examples. Installation and upgrade seed only missing codes and preserve edits. Do not derive any relationship from the display name. There is no house-delete interface; deactivate a house to preserve its identity.

Colors must be six-digit hex values with at least **4.5:1 contrast against white**. The example colors meet that threshold. Emblems are an allowlist of bundled Sol images: `sol`, `celebrate`, `lightbulb`, and `graduation`. Administrators can change them with a native select field; arbitrary HTML, SVG, CSS, and remote URLs are not accepted. Additional approved artwork can be added to the allowlist in a later phase.

`local_ignite_member` stores one current membership per user, enforced by a `foreign-unique` user key, plus a house foreign key and timestamps. Changing houses updates the same row; leaving removes it. Rejoining the current house is idempotent. An inactive house retains existing members but rejects new joins. There is no membership history or house leaderboard in this phase.

Membership mutation obtains the shared house configuration lock and a per-user Moodle lock before a delegated DB transaction. Configuration changes use the same house lock. Preference and privacy mutations share the per-user lock. Unique database keys provide additional protection against duplicate rows. Moodle XMLDB foreign keys describe relationships; services also check referenced records because not all Moodle databases enforce physical foreign keys.

Houses are not Moodle cohorts, groups, roles, subject interests, course enrollments, or badge owners. The plugin never calls enrollment mutation APIs. **Every house sees the same eligible courses under Moodle's normal access rules.** House configuration has no course fields. Personal levels are not stored or calculated yet.

## Configuration and authorization

All five switches default to **off**:

- `enabled`: master switch; controls navigation and learner services.
- `onboarding`: allows preference saves and shows the home preference summary.
- `houses`: allows membership services and shows the house summary.
- `passport`: shows a link to the signed-in user's native Moodle badge collection, subject to Moodle badges being enabled.
- `levels`: reserved independent switch; no level interface or calculation in this phase.

The native administrator pages are **Site administration → Plugins → Local plugins → Ignite** and **Ignite houses**. They require both `moodle/site:config` and `local/ignite:configure`; only site administrators have the latter by default. Administrators can configure houses while the learner experience is disabled. These pages use native admin settings and Moodle forms with session-key protection and server validation.

`local/ignite:use` is allowed for authenticated users by default and can be restricted by roles. Guests cannot use the learner services. The public learner service signatures intentionally have no user-ID argument:

```php
\local_ignite\preferences::get_current();
\local_ignite\preferences::save_current([
    'interests' => ['money'], 'goals' => 'Build a weekly budget',
    'status' => 'inprogress', 'currentstep' => 'path', 'pathid' => 'starter',
]);
\local_ignite\houses::available();
\local_ignite\houses::get_current();
\local_ignite\houses::set_current($houseid); // null leaves the current house.
```

Mutating learner services require a valid Moodle session key, the appropriate enabled feature, and the authenticated user's capability. Unknown preference fields, including `userid`, are rejected. These are internal PHP services, not web-service endpoints; there is deliberately no learner editing screen or AJAX endpoint yet. Future controllers must preserve the same authentication, validation, and CSRF rules. Preference reads remain available to the home assembler when onboarding is off; home rendering hides that feature's section. The master switch blocks all learner services.

The internal privacy erasure function accepts a user ID so Moodle's approved privacy workflows and account deletion observer can operate while Ignite is disabled. It is not an endpoint and must not be exposed as a learner API.

## Interest and path mapping schema

The native **Interest and learning path mapping (JSON)** setting is stored in Moodle's `config_plugins`; it contains no learner choices. Its default is `{"interests":{},"paths":{}}`. This example is illustrative: replace IDs with real courses and activities in the target **local/staging** fixture before saving.

```json
{
  "interests": {
    "money": {
      "name": "Money skills",
      "courseids": [123],
      "activityids": [456]
    }
  },
  "paths": {
    "starter": {
      "name": "Money starter",
      "interestids": ["money"]
    }
  }
}
```

Keys start with a lowercase letter and contain up to 64 lowercase letters, numbers, underscores, or hyphens. Names are plain text, up to 100 characters. Reference lists are optional. There may be at most 50 interests, 50 paths, 200 references per list, and 100 KB of JSON. Course IDs refer to `course.id`; activity IDs refer to **`course_modules.id`**, as used by `mod/.../view.php?id=...`, not an activity instance ID. The site course and activities being deleted cannot be newly configured. Invalid settings retain the previous value.

Configuration references are checked against the installed database when saving. Reading existing configuration does not fail if a referenced course is later deleted. Removing an interest or path definition does not delete stored learner choices. Stable keys should be retained when renaming definitions. Future recommendation rendering must re-check current visibility, availability, access, and enrollment using Moodle APIs before revealing names or linking to targets. A configured mapping is never an access grant. This phase exposes mappings only through administrator configuration and internal services, not through a recommendation interface.

## Home, navigation, and accessibility

`/local/ignite/index.php` requires Moodle sign-in and `local/ignite:use`. It displays real active enrolled courses through `enrol_get_my_courses()` plus `can_access_course()`, and own preference/house summaries when enabled. It has meaningful empty states and links to native learning destinations. The primary action goes to My courses when Moodle enables that page, otherwise to the dashboard, otherwise to the catalog. The return link also respects whether the dashboard is enabled. No native page setting is changed. No sample progress, badges, levels, or enrollment counts are fabricated. Passport currently delegates to `/badges/mybadges.php`; ownership and privacy remain Moodle's responsibility.

Navigation uses the installed `core\hook\navigation\primary_extend` hook for Boost and a standard local navigation callback for global navigation. It adds an Ignite destination without replacing Moodle items. Disabling the master switch removes it; old Ignite-home bookmarks redirect to `/my/` after authentication. There is no forced-login redirect, user homepage preference mutation, theme dependency, or default landing-page change.

The page follows the existing Ignite style guide: cream `#FFF8F0`, orange `#F07B2A`, dark-orange `#D46A20`, charcoal text, rounded cards, and the shared straight redirect arrow. Colors supporting text are chosen for contrast. Sol is decorative and has empty alt text; houses also have text names. Links retain underlines and visible keyboard focus. Layout adapts to narrow screens and zoom. No animated script is introduced; scoped CSS explicitly respects reduced-motion preferences.

## Privacy and lifecycle

Personal data belongs to the learner's **user context**, not the shared system context. Metadata includes every personal field in both learner tables. Exports include interests, goals, onboarding state, selected path, house ID, current house name, and timestamps. Approved user, bulk-user, and whole-context deletion remove only those two tables' owner records. They leave shared houses, catalog configuration, courses, grades, enrollments, and Moodle badges intact. Account deletion also removes Ignite records through a `user_deleted` observer. Privacy operations work with all flags disabled.

Disabling is reversible and preserves data. Removing code is not the same as uninstalling: use Moodle's native plugin uninstall workflow when permanent removal is intended, after exporting/backing up data. An upgrade must bump `version.php`, add ordered XMLDB savepoints in `db/upgrade.php` for schema changes, and preserve the stable IDs and user records. Never rerun installation SQL against an existing site.

## Administrator staging setup

1. Back up staging, inspect pending upgrades, and copy `moodle/local/ignite` to the installed Moodle **`public/local/ignite`** directory. The existing `moodle:deploy` script does not install this plugin. Do not run it for this phase.
2. Run the normal Moodle plugin installation/upgrade process, for example `sudo -u www-data php admin/cli/upgrade.php --non-interactive` from the installation root. Review the plugin and schema checks before enabling it.
3. Verify the editable houses and validated real-course mappings under Local plugins. Keep temporary example names or change them with the house editor. No course, cohort, group, or role setup is needed for membership.
4. Enable the master switch and selected feature switches on staging. Keep optional levels off. Enable native Moodle badges separately if testing the Passport link; configure actual badge criteria and course completion through Moodle in later phases.
5. Check with a normal learner account, an account without enrollments, and a restricted role. No default landing-page change is required. Normal Moodle navigation remains the fallback.

## Verification

The integration suite is `tests/moodle-ignite.php`. It refuses to bootstrap unless the configured database name contains `ignite_lms_test_`, outbound email is disabled, and the site URL is loopback. **Use a fresh empty Moodle fixture; the suite creates users, a course, an activity, and enrollment fixtures. Do not use a production database or production data copy.**

```sh
php tests/moodle-ignite.php PRIVATE_MOODLE_ROOT
php PRIVATE_MOODLE_ROOT/admin/cli/upgrade.php --non-interactive
php tests/moodle-ignite.php PRIVATE_MOODLE_ROOT --upgrade-check
php PRIVATE_MOODLE_ROOT/admin/cli/check_database_schema.php
```

The first run checks fresh installation/defaults, mapping validation, administrator boundaries, own-user isolation, CSRF, repeated and concurrent first-join membership saves across six independent processes, the database uniqueness constraint, inactive-house behavior, rollback, home rendering, native enrollment preservation, navigation fallbacks, feature switches, real privacy ZIP export, approved deletion scopes, and account deletion. It disables native welcome tours only in the private fixture so they do not cover browser controls. It then sets the fixture's plugin version to the initial schema version (`2026110100`) and clears Moodle's version-hash shortcut for a real native upgrade to `2026110101`. The second run verifies preserved configuration and learner records. Rerun the whole suite only on a freshly initialized fixture.

For browser checks, serve the fixture's `public/` directory at `http://127.0.0.1:8765`, with its matching loopback `wwwroot`. Then run:

```sh
IGNITE_MOODLE_FIXTURE=1 IGNITE_FIXTURE_LEARNER=USERNAME_FROM_SUITE_OUTPUT \
  npx playwright test --config config/playwright.ignite.config.ts
```

The browser suite uses the fixture-only password from the integration suite, checks the site identity before entering it, and stays disabled without the explicit fixture flag. It covers native login, learner home and primary navigation, scoped axe accessibility, widths of 1,440/390/320 pixels, keyboard focus, reduced motion, house form validation and persistence, master-switch fallback, and signed-out access. It does not mock Moodle HTTP responses. A remote loopback fixture can be accessed through authorized SSH command-based HTTP reads if port forwarding is unavailable; no public web-server configuration is needed.

Verified on November 1, 2026 using an isolated copy of the installed Moodle 5.2.4 source, PHP 8.3.6, and a newly initialized PostgreSQL database. No production learner data was copied. The fixture used a separate data directory, disabled outbound email, and a loopback-only HTTP server. The temporary source copy, database, database role, data directory, and server were removed after verification. No plugin or settings were deployed to the live installation.

- Native plugin installation succeeded and seeded four houses with the master and feature switches off.
- **73 service/integration assertions passed**, including six concurrent membership writers, native enrollment preservation, account deletion, and real privacy export/deletion.
- **5 upgrade assertions passed** after Moodle's native `2026110101` savepoint, preserving renamed houses, preferences, and membership.
- Moodle's full schema checker reported **Database structure is ok**.
- **4 Chromium browser tests passed** against real Moodle HTTP responses. The scoped axe scan found **zero violations**; keyboard focus, reduced motion, and 1,440/390/320-pixel layouts passed. Native house form edits, validation, disabled-home redirect, normal catalog navigation, and sign-in protection passed.
- All plugin PHP files and the integration script passed PHP syntax checks. Browser test/configuration ESLint and repository whitespace checks passed.

Remaining limits: the walkthrough, learner house chooser, recommendations, starter challenge, custom collectible Passport, badge-award rules, and level calculations belong to later phases. Passport currently links to native Moodle badges. House editing offers four existing Sol emblems, not arbitrary image uploads. Verification covers Moodle 5.2.4, PostgreSQL, and Chromium; other Moodle branches, databases, and browser engines have not been verified. A staging administrator must still install and configure the plugin on the intended staging site before learner acceptance testing.

## Matching API references

Verified signatures against the installed 5.2.4 source: XMLDB installation and savepoints, native admin settings/validation, `moodleform`, capability checks and session keys, `core\hook\navigation\primary_extend`, `core\lock\lock_config`, delegated transactions, privacy provider interfaces/content writer, `enrol_get_my_courses()`, `can_access_course()`, and the own-badges destination. Matching official documentation:

- [Moodle 5.2 local plugins](https://moodledev.io/docs/5.2/apis/plugintypes/local)
- [Admin settings](https://moodledev.io/docs/5.2/apis/subsystems/admin)
- [Navigation API](https://moodledev.io/docs/5.2/apis/core/navigation)
- [Data manipulation API and transactions](https://moodledev.io/docs/5.2/apis/core/dml)
- [Lock API](https://moodledev.io/docs/5.2/apis/core/lock)
- [Privacy API](https://moodledev.io/docs/5.2/apis/subsystems/privacy)
- [Forms API](https://moodledev.io/docs/5.2/apis/subsystems/form)
- [Access API](https://moodledev.io/docs/5.2/apis/subsystems/access)
- [Enrolment API](https://moodledev.io/docs/5.2/apis/subsystems/enrol)
- [Badges API](https://moodledev.io/docs/5.2/apis/subsystems/badges)
