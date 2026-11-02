# Prompt 3 — Hearth selection, hub and shared challenges

Based on committed Prompt 1 foundation `19bfa59f8a06bd06f7bdfba0df70a9d6ff829fbb`, branch `ignite/prompt3-hearths`, worktree `/Users/elaine/Documents/Ignite-prompt3`. No onboarding or Passport code is required. Prompt 2 owns invitation timing and its onboarding setting. Prompt 4 owns Passport and native badge integration. Merge sequentially before Prompt 5; do not combine schema version numbers without reviewing actual installed versions.

## Routes and interfaces

- `/local/ignite/choosehearth.php`: authenticated, capability-checked selection. Equal-size configured cards, separate POST confirmation, POST “Choose later.” Deferring changes no membership or onboarding state. Accessible from Ignite home and the learner’s own native profile. Switching retains previous contributions and all personal learning.
- `/local/ignite/hearth.php`: own membership identity, current global shared challenge, task-computed progress, own credited count, eligible next activity, enrolled-course fallback and honest empty states. No roster, chat, personality ranking or inferred traits. Optional recommendation quiz is absent/disabled.
- `/local/ignite/houses.php`: existing administrator configuration route and stable page ID retained; full name, short name, description, invitation/personality text, active status, accent, bundled artwork and approved image uploads.
- `/local/ignite/hearthsetup.php`: explicitly reviewed draft identity mappings. Every select defaults to skip. Existing records receive only explicitly approved name, short-name and invitation changes. IDs, codes, descriptions, colors, assets, status and memberships survive. New records are created only when explicitly requested. No default Phoenix, no seeded or recreated old placeholders. New proposals share a neutral temporary accent; Crimson, Amber, Azure and Violet have no assigned Hearths.
- `/local/ignite/hearthchallenges.php`: administrator-configured future shared periods and activities, target, completion condition, timezone and deactivation. One active period at a time; all Hearths receive the same milestones and target. Started periods are immutable; deactivate and create a new period for changes. Never reactivate or recycle an old period.

Foundation contract is retained:

```php
\local_ignite\houses::available();
\local_ignite\houses::get_current(); // inactive membership remains visible
\local_ignite\houses::set_current($houseid); // authenticated own user, sesskey; null leaves
\local_ignite\houses::configure($id, $data); // admin + sesskey; original five fields still valid
```

`configure` additionally accepts optional `shortname`, `personality`, `mascot`. Omitted fields retain configured values. Internal `house`, table names, feature switch and immutable codes remain compatible. Draft setup is `hearth_setup::apply($explicitTargets)`; this is an administrator service, never a learner endpoint.

Sibling integration should link to `choosehearth.php?returnurl=/local/ignite/index.php` after the first challenge by default, or during onboarding under Prompt 2’s setting. Hearths never gate either route, enrollment or course access. `hearth_ui::return_url()` accepts a narrow list of local learner destinations, checks configured feature availability, physical route availability and Moodle dashboard settings, and drops query parameters. Missing sibling routes, unavailable dashboards, remote URLs, arbitrary endpoints, fragments and malformed values fall back to Ignite home. Allowed sibling routes are `/local/ignite/onboarding.php` and `/local/ignite/passport.php`; reconcile names if siblings use different routes. Siblings should resume from server state. The selection page authenticates even when reached directly.

## Challenge accounting semantics

One challenge row is one immutable period shared by all Hearths, with one target per Hearth. Activities use **course_modules.id**, never activity instance IDs. `complete` accepts native complete (1) or passed (2) states, excludes incomplete (0) and failed (3). `pass` requires native passing-grade completion configured and accepts only state 2. Manual native activity completion is permitted for `complete`; it is Moodle’s native completion evidence, not a custom browser assertion. Administrators should use automatically assessed passing activities when assessment is needed. Native completion overrides are valid Moodle evidence; Ignite does not second-guess grades or award badges.

The observer reads the actual `course_module_completion_updated` record snapshot supplied by Moodle completionlib. Indexed lookup and first-credit insertion run under the Moodle accounting lock plus per-user lock and delegated transactions. A unique database key `(challengeid, userid, cmid)` provides independent duplicate/concurrency protection. No browser endpoint accepts completion, ownership, arbitrary learner IDs or contribution amounts.

History intervals begin on real joins/switches and close on switch/leave. Existing Prompt 1 memberships are preserved and receive an interval beginning at the upgrade time; earlier switches cannot be reconstructed. Evidence is attributed using the **original completion timestamp**, never task processing time or current membership. Period start is inclusive; end is exclusive. Local wall clocks are converted with the stored IANA timezone to UTC timestamps; ambiguous/nonexistent DST boundaries are rejected. Dates have minute precision in setup and seconds in storage.

Because Moodle completion timestamps have second precision, credit requires completion **strictly after** the join timestamp and **strictly before** a closed membership’s end timestamp. Exact join/switch-second events are conservatively excluded. This avoids misattributing pre-join work when ordering within a second is unknowable. A learner can continue their personal learning immediately; only that ambiguous shared contribution is excluded.

The ledger stores first qualifications even outside the period or without a membership as `excluded` (with house ID 0 where none existed). This prevents later replay/reset from creating retroactive credit. Configuring a future period also records already completed designated activities as excluded. Editing a future period preserves exclusion records. A starter completed before Hearth selection keeps its native personal completion and badge eligibility, but no Hearth credit. There is no historical backfill.

The task also rechecks closed membership intervals, so an event processed just before an ambiguous switch-second boundary is withdrawn once that interval closes. This produces the same conservative count as processing the event after the switch. A native reset, incomplete or failed event permanently changes a credited ledger row to `withdrawn` for the period. Reset/recompletion never restores or adds that credit. A scheduled task reconciles silent bulk resets, changed completion timestamps, missing/deleted activities and completion rows, then recomputes cached totals. Original Hearth attribution and uniqueness records remain. Deleting configuration activities does not delete contribution records. New period IDs permit fresh contributions in a new period, subject to new completion evidence; existing completed work is excluded.

The task `\local_ignite\task\hearth_totals` runs every minute under Moodle cron. No aggregation occurs at login or page rendering. The hub reads cached totals plus an indexed own-credit count. Totals can lag until cron; the UI states this and shows the last task update when available. Privacy erasure invalidates cached totals until the next task. The task never changes grades, course completion, enrollments or native badge issuance.

Disabling Ignite/Hearths stops collecting new completion events. Records remain; reconciliation still removes invalid credit. There is no backfill when re-enabled. Keep collection enabled during configured challenge periods. Deploy before a period starts. Events missed while code or the database is unavailable cannot be reconstructed reliably after resets; normal Moodle event delivery and database availability are prerequisites.

## Identity assets, accessibility and permissions

Existing Sol PNGs are reused unchanged; no new face, mouth, body variant or companion is generated. Bundled mascot choice can be a labeled placeholder or one approved existing asset. Administrator-approved emblem and mascot uploads use native filemanager storage under system context and stable Hearth item ID. PNG/JPEG/WebP only, one file per area, at most 2 MB / 4096 × 4096; actual image MIME and dimensions are validated server-side. No HTML, SVG, CSS or remote asset URLs are accepted. Uploaded images override bundled choices; removing them restores the bundled choice. Administrators remain responsible for visual approval and Sol’s compact, mouthless design rules, which are stated in the editor.

Cream `#FFF8F0`, primary orange `#F07B2A` and dark orange `#D46A20` are scoped plugin styles. Text uses contrasting charcoal/dark orange; accents retain foundation white-text contrast validation. Native buttons/links have keyboard focus and text labels; status never depends on color. Flame graphic is decorative and accompanied by textual counts plus a native progress element. No animation is introduced; reduced motion is explicit. All cards use the same layout and no interests or personality labels determine selection.

Authentication, `local/ignite:use`, feature switches, POST/session keys and administrator dual capabilities are enforced server-side. Native course enrollment, visibility, availability and applicable activity-view capabilities are checked before activity names/links are exposed. Site-wide membership never changes a Moodle group, cohort, role, enrollment, course permission or subject eligibility.

## Privacy and schema

Privacy metadata/context discovery/export/individual/bulk/context deletion and the foundation account-deletion observer cover both `local_ignite_history` and `local_ignite_credit`. Export includes original times, stable Hearth/activity/period IDs and credit status. No other learner roster is exposed. Shared identities, challenge configuration and approved artwork are system configuration; no learner upload areas are introduced. Deletion erases owned membership/history/credits and invalidates aggregate cache, preserving shared configuration and native learner records.

Narrow migration savepoint **2026110300** adds only missing identity fields (`shortname`, nullable `personality`, `mascot`) and five tables: history, challenge, milestone, credit, total. It preserves all old IDs/codes/configuration, preferences, memberships and core data. Canonical XMLDB definitions are read by the upgrade rather than duplicated. The legacy pre-2026110101 seed step no longer recreates placeholders; the public seed method remains as a compatibility no-op. Fresh installation starts with zero Hearths until explicit administrator setup. XMLDB has no activity foreign key on the ledger, so activity deletion cannot remove evidence. Uncredited house ID 0 is intentional and not a foreign key.

Shared files requiring merge review (plus the small README and foundation-note links): `version.php`, `db/install.xml`, `db/upgrade.php`, `db/events.php`, `settings.php`, `lang/en/local_ignite.php`, `lib.php`, `classes/home.php`, `templates/home.mustache`, `classes/privacy/provider.php`; also narrow edits to foundation `houses`, its form/controller and `installation`. New phase-specific files, task registration, CSS, templates, tests and this note remain separable. Do not merely concatenate sibling upgrade savepoints. The final merged fresh schema and upgrade from 19bfa59 must be tested again.

## Administrator setup

1. Install/upgrade only a local/staging copy via Moodle’s native CLI. Existing theme deployment does not install this plugin.
2. Review existing Hearth records. Optionally map draft proposals in “Review proposed Hearth identities.” Skip anything not approved. Edit descriptions, personalities, short names, active flags, assets and colors individually. No color assignments or final mascot decisions are implied.
3. Enable Ignite and its existing Hearths (`houses`) feature switch. Keep undecided features/quiz off. Prompt 2 supplies onboarding invitation timing separately; selection can always be linked directly.
4. Configure real Moodle completion/grade-pass rules, enrollment and restrictions. In “Hearth shared challenges,” add a future period, target, IANA timezone and `cmid:complete` / `cmid:pass` lines. Ensure active periods do not overlap.
5. Run normal Moodle cron every minute. Confirm totals, reset behavior and eligible next action using staging learners. Configure actual badges in native Moodle; membership is never badge issuance evidence.

## Verification and handoff

Run `php tests/moodle-hearths.php PRIVATE_MOODLE_ROOT` only with a fresh, isolated `ignite_lms_test_p3_*` database, loopback URL and disabled outbound email. It creates local fixtures and refuses other environments. For upgrade, install committed Prompt 1 first, run its original suite, then copy this candidate and run native upgrade. For fresh install use this candidate directly. Run the native schema checker on both. Browser tests are separate in `tests/moodle/hearths-browser`, configured by `config/playwright.hearths.config.ts`, guarded by `IGNITE_HEARTH_FIXTURE=1` and fixture site identity; set `IGNITE_HEARTH_LEARNER` to the suite’s output. Serve `public/` on loopback port 8767. No external mail or production deployment is part of this phase.

Verified November 1, 2026 (PST; November 2 UTC) on isolated copies of the installed Moodle **5.2.4**, PHP **8.3.6**, PostgreSQL and Chromium. The core was initialized from empty test data with Prompt 1, whose original **73 checks and 5 native-upgrade checks passed**. The upgrade fixture retained that completed Prompt 1 database. The separate fresh-plugin fixture used a copied local core fixture with native plugin uninstall, then a native install into an empty Ignite schema/configuration; it shared neither the upgrade database nor writable runtime directories. No production learner data was copied.

| Verification | Result |
| --- | --- |
| Prompt 3 service/accounting suite after Prompt 1 upgrade | **67 passed** |
| Same suite after fresh plugin installation | **63 passed** (the four additional upgrade assertions cover old records/history) |
| Native full database schema checks | **Database structure is ok**, both fixtures |
| Approved-artwork native file API checks | **4 passed** |
| Restricted authenticated-user capability and native observer checks | **2 passed** |
| Configuration/CSRF/disabled-dashboard fallback regressions | **6 passed**, each fixture |
| Moodle native scheduled-task runner | Passed; reconciliation completed through `admin/cli/scheduled_task.php` |
| Chromium browser suite | **4 passed** in one final run; learner selection, defer, confirm/switch, hub, profile action, administrator reviewed setup/editing, direct authentication and capability boundaries |
| Scoped axe scans | **Zero violations** on selection and hub |
| Responsive/keyboard/reduced-motion checks | Passed at **1440 / 390 / 320 px**, equal-size cards and visible keyboard focus |
| PHP syntax / focused test ESLint / Git whitespace | Passed |

The browser runner used the existing local Node 20.17.0 installation; the repository's marketing build requests Node 22 and was not changed or built. This PHP/Mustache/CSS plugin has no Node/AMD asset build. Runtime logs and reviewed mobile screenshots are retained under the ignored `.reference/prompt3/` directory in this worktree. Temporary remote fixture sources, databases, role and HTTP server were removed after verification.

The independent scripts `tests/moodle-hearth-assets.php`, `tests/moodle-hearth-access.php` and `tests/moodle-hearth-config.php` run after the main suite against the same guarded private fixture. Do not run the original Prompt 1 suite against this new release unchanged: its four seeded-placeholder/version expectations intentionally describe the old baseline. Use the committed baseline first for upgrade verification.

Handoff:

1. **What works:** direct selection and own hub, explicit join/defer/switch, reviewed configurable identities/assets, eligible native learning actions, shared challenge accounting, historical attribution, reset/deletion withdrawal, duplicate/concurrent evidence protection and privacy workflows.
2. **Changed components:** `local_ignite` services/controllers, native admin forms, Mustache/CSS, scheduled task, privacy, separate phase tests/configuration and these notes. No theme, marketing feature, enrollment or badge mutation code was added.
3. **Checks:** results above, including fresh/upgrade schemas, native grades/completions, six concurrent event workers and a real privacy ZIP export.
4. **Administrator setup:** install on staging, review/map configured identities, approve artwork/colors, enable Ignite/Hearths, configure future activity periods and native completion rules, run cron. Nothing has been deployed to production.
5. **Unresolved integration:** Prompt 2 invitation timing/setting and the exact onboarding return route; Prompt 4 Passport route. Direct routes and fallback behavior work without either branch. The sequential combined merge has not been performed or verified here.
6. **Shared migrations/files:** reconcile savepoint/version **2026110300**, three identity fields, five new tables, native events/task registration, privacy, language/settings/navigation/home changes and the files listed above. The foundation seed interface is a compatibility no-op, with no record recreation.
7. **Limitations:** no historical backfill; ambiguous join/switch seconds are conservatively excluded/withdrawn; totals lag cron. New credit relies on future native completion events. Bulk imports/recalculations that suppress those events are not positively backfilled; silent resets/deletions of existing credits are reconciled. Changed native evidence timestamps are conservatively withdrawn, even when the new state still qualifies. Only manual Page completion and automatic Quiz passing-grade integration were exercised; other activity types, Moodle versions, databases, themes and browser engines were not independently verified. Site-specific identities, final mascot direction and approved artwork remain administrator decisions. Final combined Prompt 2–4 fresh/upgrade verification is still required before Prompt 5.

Matching official API references: [Moodle 5.2 completion](https://moodledev.io/docs/5.2/apis/core/activitycompletion), [scheduled tasks](https://moodledev.io/docs/5.2/apis/subsystems/task), [File API](https://moodledev.io/docs/5.2/apis/subsystems/files), [files in forms](https://moodledev.io/docs/5.2/apis/subsystems/form/usage/files), [privacy](https://moodledev.io/docs/5.2/apis/subsystems/privacy), [locks](https://moodledev.io/docs/5.2/apis/core/lock). Signatures were checked against the actual installed 5.2.4 `completionlib.php`, native completion event/base snapshot API, `accesslib.php`, task interfaces, filemanager and XMLDB source. Read-only live metadata confirmed the core completion table has `userid`, `coursemoduleid`, `completionstate`, `overrideby`, `timemodified`; production has no `local_ignite` installed, and existing `local_ignite_staffimports` / `tiny_ignite_markdown` remain separate. The production database was not used for feature tests or written to by this phase.
