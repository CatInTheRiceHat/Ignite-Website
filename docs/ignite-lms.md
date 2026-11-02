# Integrated Ignite learner experience

This is the current installation and operations guide for Prompts 1–6. The integrated implementation is on `ignite/integrated-learner-experience`. It combines onboarding, recommendations, Hearths, native-badge Passport, the learner dashboard, and optional mission presentation around real Moodle activities. The foundation record is preserved in [Prompt 1](phases/prompt1-foundation.md); phase details remain in [onboarding](ignite-onboarding.md), [Hearths](phases/prompt3-hearths.md), [Passport](ignite-passport.md), and [dashboard](ignite-dashboard.md). This guide supersedes historical phase instructions where they differ.

## Installation and upgrade

The verified runtime is Moodle **5.2.4**, branch `502`, core `2026042004`, PHP **8.3.6**, PostgreSQL, Boost, and Chromium. The repository contains custom plugins, not a Moodle distribution. The installed layout inspected for API compatibility has an installation root and a separate `public/` webroot. These changes have **not been deployed to production**.

1. Back up the staging database, Moodle data directory, plugin code, and settings. Use a separate database and data directory for a fresh installation; never point a test suite at production or a production data copy.
2. Copy `moodle/local/ignite` into `public/local/ignite` and `moodle/blocks/ignite` into `public/blocks/ignite`. Preserve both directories during Moodle core updates. The existing theme sync commands and marketing deployment do not install these plugins.
3. Run Moodle's native plugin upgrade and schema checker as its web-server account from the installation root. For the inspected layout:

   ```sh
   sudo -u www-data php admin/cli/upgrade.php --non-interactive
   sudo -u www-data php admin/cli/check_database_schema.php
   sudo -u www-data php admin/cli/purge_caches.php
   ```

4. Confirm `local_ignite` **2026110701 / 0.7.1** and `block_ignite` **2026110501 / 0.5.0**. The block contract did not change and its existing minimum local-plugin dependency remains valid. Review setup diagnostics before enabling learner features.

The canonical XMLDB schema has **12 Ignite tables**. Ordered migrations retain the completed Prompt 1 savepoint `2026110101`, then onboarding `0200`, Hearths `0300`, Passport `0400`, dashboard `0500/0501`, mission metadata `0600`, and aggregate report snapshots `0700`. A real upgrade from a completed Prompt 1 database preserved edited settings, stable identity IDs, preferences and memberships. Existing memberships gain a history interval beginning at migration time: older membership changes cannot be reconstructed and no historical Hearth credit is invented. The once-reserved stages switch is explicitly reset off by the dashboard migration. Other existing settings are preserved; upgrades do not reseed or overwrite identities. Unsupported out-of-order sibling-development databases require a separate reviewed migration or a rebuilt disposable fixture.

## Administrator setup

Use **Site administration → Plugins → Local plugins → Ignite**. Settings require both `moodle/site:config` and `local/ignite:configure`. All learner feature switches default off; setup remains available while they are off.

| Control | Setup and behavior |
| --- | --- |
| Master and feature flags | Enable onboarding, Hearths, Passport, dashboard and missions independently. Stages remain off pending a product decision. Native completion and badges are separate Moodle settings. |
| Onboarding eligibility and goals | Validated JSON controls automatic entry, optional active-enrollment requirement, optional allowlisted native cohort IDs, and stable goal keys/plain labels. Guests, suspended/unconfirmed/deleted users, administrators and teaching/grading staff are excluded. An empty cohort list imposes no cohort condition. |
| Interests and paths | The existing catalog JSON maps stable interest/path keys to real course IDs and **course-module IDs**, with editable names. Onboarding uses these names; missing mappings produce ordinary catalog navigation. Stable saved keys survive renaming. |
| Outcomes and starter | Configure practical outcome text and an existing substantive automatic-completion starter, optionally requiring a native pass. Save-time checks explain missing completion, hidden/deleted references and missing pass rules. Wrap that exact starter ID in a mission. |
| Invitation timing | `afterchallenge` waits for valid starter evidence; `initial` offers the separate earlier-selection path. Set the supported chooser route to `/local/ignite/choosehearth.php` and activate at least one Hearth. Choosing later preserves completed onboarding and exposes an explicit resume link. Policy/timing edits do not reset completed, dismissed or deferred records. |
| Hearth identities | **Ignite Hearths** edits full/short names, description, personality, approved bundled mascot, emblem, accessible accent color and active status. **Draft Hearth setup** is an explicit administrator action. Draft names remain configurable; install/upgrade does not publish a final identity set. Stable codes/IDs, rather than display names, identify memberships. Deactivation preserves existing records. |
| Shared challenges | Configure dates, an IANA timezone, a positive target, and distinct native activity milestones/complete-or-pass conditions. Boundaries are start-inclusive/end-exclusive. Invalid or ambiguous daylight-saving times are rejected. Start new periods in the future; started rules are immutable and can be disabled. Targets and opportunities are shared, with no Hearth ranking. |
| Passport | Map existing native badge IDs to presentation categories, optional course collectible, and approved artwork. Enabled mappings require actual native award criteria. A primary course collectible must really depend on native course completion. Mapping metadata never awards or revokes credentials. |
| Mission presentation | Enable missions, then use a course's **Missions** navigation entry. Editors need both `moodle/course:manageactivities` and `local/ignite:managemissions` in that course. See [mission authoring](ignite-missions.md). Courses can continue using native pages without missions. |
| Optional individual stages | Validated JSON accepts five unique labels and strictly increasing integer thresholds starting at zero. Proposed labels are Spark → Ember → Flame → Blaze → Bluefire; thresholds are 0, 1, 3, 6, 10. Keep disabled while the vocabulary overlaps draft Hearth names. These fictional personal labels are independent of Hearth identity and never claim mastery. |
| Dashboard landing | A separate explicit setting, off by default, may redirect plain learner Dashboard entry to Ignite after native account checks. Deep links, intended destinations, editing, teacher/admin, role-switch and login-as sessions retain normal routing. No user homepage preference is rewritten. |

Example eligibility configuration:

```json
{"automatic":true,"requireenrolment":false,"cohortids":[],"goals":{"make":"Make something useful","solve":"Solve a practical problem","explore":"Explore something new"}}
```

The standalone Ignite home reuses the enabled native Timeline block’s renderable, stored date/sort preferences, AMD controls and action-event APIs in a horizontal panel. It has the earlier **My learning space** navigation rail on the left and a separate **My Hearth** column on the right. Narrow containers stack the layout. This adds no scheduled-work service or progress records. On native Dashboard, the existing Timeline block remains separate and is not duplicated inside `block_ignite`.

For the dashboard, use Moodle's **Appearance → Default Dashboard** editor to add the existing thin **Ignite learner dashboard** block. Retain Timeline and Course overview. Existing personal dashboards can add it through native editing; do not reset personal layouts. Ignite navigation also opens the same experience at `/local/ignite/index.php` when the dashboard flag is on.

**Ignite setup review** links native badge configuration, badge settings and scheduled tasks, and explains missing prerequisites. It diagnoses missing starters/mission wrappers, disabled completion/badges, hidden/deleted activities and native badges without criteria. Availability remains learner-specific: date, prerequisite, group, module view capability and enrollment restrictions are checked again on each learner request. Administrator visibility never becomes learner access.

## Native completion, assessment and badges

Enable Moodle completion at site and course level, configure tracked learner roles, then configure native activity rules. A starter must involve substantive automatic activity completion; a login, page view or manual tick cannot establish the starter challenge. Configure a native grade-to-pass and passing-grade completion when passing is required. Mission requirements text describes these settings; changing presentation never edits grades, attempts or completion configuration.

For badges, enable Moodle badges/course badges as appropriate, create native criteria and their ALL/ANY aggregation, review availability, then enable the badge in Moodle. The setup review links `/badges/index.php?type=1` and native course badge management. Native Quiz/Lesson feedback release, attempt limits, assessment restrictions, and Assignment grading workflows remain authoritative. Submission is not passing unless the native completion rule explicitly recognizes submission. Confirmed ownership comes from native issuance records. A complete course may still have an unearned badge because another criterion is unmet, or a pending issuance state while native processing catches up. Missing, private, disabled or delayed badges never block learning or Hearth selection.

The dashboard has one prominent Continue learning action only when a real available activity or eligible normal enrollment page exists. It follows course order and stops at an unavailable required next activity. Hidden/deleted courses produce generic fallback explanations. Native course completion may be 100% under an alternative overall rule while some optional activities remain; the textual activity count stays separate. An incomplete eligible optional mission can still be offered after that overall rule is met. Unknown/disabled tracking shows an explanation and no percentage, rather than an invented 0%.

## Background work, evidence and resets

Run normal Moodle cron every minute, including native completion, badge scheduled tasks and queued ad-hoc tasks. Keep a working Moodle lock factory for concurrent workers. Ignite registers:

| Task | Schedule | Responsibility |
| --- | --- | --- |
| `\local_ignite\task\hearth_totals` | Every minute | Reconcile current native evidence and membership history, withdraw invalid credit, rebuild cached totals, including valid zero totals. |
| `\local_ignite\task\learner_reports` | Every five minutes | Calculate only requested, bounded date-range aggregate snapshots. No messages or external analytics. |

For staging diagnostics, use the native scheduled-task runner:

```sh
sudo -u www-data php admin/cli/scheduled_task.php --execute='\local_ignite\task\hearth_totals'
sudo -u www-data php admin/cli/scheduled_task.php --execute='\local_ignite\task\learner_reports'
```

Native completion events update the unique Hearth ledger and its cached counter under the same accounting lock/transaction. Delayed events use qualifying completion time and the membership interval at that time, not the learner's current Hearth. A starter completed before joining keeps eligible personal and native badge credit and receives **no retroactive Hearth contribution**. Second-resolution membership boundaries are conservative: an ambiguous completion at the exact joining/switching second is excluded. Duplicate/concurrent deliveries cannot add another credit.

Personal stages and shared challenges reuse `milestone_eligibility` for native configuration/state eligibility but retain different accounting. Personal stages read each configured native activity once and may include eligible historical evidence in currently accessible tracked enrollments. Reset, failing/reversed or deleted evidence removes personal count; valid recompletion can restore that one count. Shared periods retain an excluded/withdrawn ledger entry: a reset withdraws credited work permanently for that period, and recompletion cannot farm it back. New periods exclude already completed evidence. Native badge ownership remains under native rules; Ignite does not revoke a native award when progress falls.

Pages use permission-aware request snapshots, batched native completion/award/reference reads, and Moodle's native module cache. They never run the full Hearth reconciliation or reporting cohort scan. A Hearth card reads the cached shared count and an indexed own-user count in one database snapshot. Missing totals show pending until cron. Completion, course/module, enrollment, role, badge, cohort and user events invalidate relevant snapshots; Ignite preference/membership/mission/configuration and privacy changes invalidate aggregates. Report calculation uses a background lock and conditional publication so an invalidation during calculation cannot be overwritten. The five-minute refresh also covers changes without a dedicated event. No expensive recalculation is added to sign-in.

## Authorized aggregate report

`/local/ignite/report.php` requires system capability `local/ignite:viewreport`; administrators have access and no ordinary teacher, mentor or learner role receives it by default. It can be explicitly delegated without granting configuration access. GET filters request a cached range; calculations happen in the background task. The page shows pending/as-of state, rather than reporting a partial result. At most ten aggregate ranges are retained, with no learner roster or extra learner event stream.

The date filters are **inclusive UTC calendar dates**, at most 366 days apart. Denominators and time bases are deliberately explicit:

- Eligible learners: current active, confirmed, non-staff accounts satisfying onboarding eligibility and capability policy. Completed onboarding and Hearth membership counts are **current snapshots**, not historical events attributed to the chosen dates.
- First mission: eligible learners with currently valid native completion for an active configured mission containing a configured starter, with completion timestamp inside the range. Denominator: current eligible learners.
- Subsequent distinct mission: those first-mission learners with a different, non-overlapping active mission completed at or after the first in the same range. Denominator: first-mission learners. Native access/enrollment and all mapped activity evidence are rechecked. Disabled site completion makes these learning metrics unavailable.
- Native awards: native `badge_issued` records issued inside the range for the eligible cohort, plus distinct owners. Counts are awards/owners against the eligible learner denominator, not a completion rate. Native ownership includes private or expired issued awards; native revocation/removal removes the issuance. Learner-facing Passport continues honoring visibility and availability rules.
- Shared challenges: periods overlapping the date range, with each Hearth's **whole-period** cached contribution count and configured target. These totals have their own membership/date rules and are not restricted to the onboarding denominator.

This small operational report is a current-state funnel, not an immutable historical analytics warehouse. Native resets, changed grades/access, changed mappings and privacy deletion can change a refreshed result. Logins, visits and clicks are never reported as learning or mastery. There is no third-party analytics or external notification integration.

## Privacy and permissions

Learner routes authenticate and enforce `local/ignite:use`, own-user service boundaries, active enrollment, context/module permissions and current restrictions. Mutations use Moodle session keys and native locks. Mentors use native activity grading permissions; mission editing requires course editing separately. Site configuration and report capabilities are independent. Direct URLs do not bypass these boundaries.

The six existing personal tables remain covered by Moodle privacy metadata, context discovery, real export and individual/bulk/context deletion: preferences, membership, invitation, membership history, challenge credit and featured badge choices. Mission metadata is shared course presentation, and reports store aggregate snapshots without user identifiers. Privacy erasure works with flags disabled, invalidates derived report/totals caches, and leaves native enrollments, grades, completions and badges to their owning Moodle components. Native account deletion invokes the same Ignite erasure path. No additional per-learner mission completion or analytics table is introduced.

## Verification record

Checks used copied Moodle source and **empty isolated PostgreSQL fixtures**, separate data directories, loopback-only HTTP, and disabled outbound mail. No production learner data was copied. Earlier successful phase checks were reused; testing here focused on the new integration, assessment adapters, background accounting, migrations and permissions.

- Completed Prompt 1 baseline: **73 foundation + 5 upgrade assertions**. Direct native upgrade to `2026110700`: **18 shared-contract assertions**, preserving the baseline's edited records/settings/memberships.
- Fresh native Moodle/plugin installation: **18 shared-contract assertions** and **49 integration assertions**. Upgraded fixture: **43 integration assertions** before the added fresh-fixture edge cases. Native Moodle schema checks passed for both installation paths.
- **3 post-browser native checks** verified real browser starter evidence, authorized native mentor badge confirmation and mission completion. **5 final audit assertions** covered concurrent first-event credit, background report refresh and configurable/off-by-default stages. **8 configuration assertions** checked native prerequisites, draft badge mapping, input validation and skipping an already completed next mission.
- **4 distinct Chromium scenarios passed in staged runs** around the real native badge-processing boundary: new onboarding with wrong/correct Quiz retries and attempt limits; administrator/editor/report/direct-URL boundaries; confirmed Passport plus post-starter membership and released mentor feedback; administrator-enabled earlier Hearth selection. Real HTTP was used without mocked activity or completion responses.
- Native completion, badge, Hearth and report tasks ran. Tests cover pending/released grading, changed failing grades, delayed and concurrent events, no retroactive starter credit, reset/reversal behavior, skipped/resumed onboarding, deferred invitations, changed/renamed membership, no recommendations, disabled tracking/badges/dashboard, revoked enrollment, deleted activities, privacy export/erasure and permission boundaries. Dashboard-only edge cases already passed in the [prior phase](ignite-dashboard.md#verification).
- Visual runtime inspected at **360px mobile and 1440px desktop**; keyboard focus and scoped axe scans passed with **zero violations**, including native feedback and keyboard scrolling in the administrator report. Marketing repository commands passed: `npm run lint`, `npm test` (**122 passed, 4 skipped**) and `npm run build`. The available Node runtime was 20.17; production/development setup should use the repository's declared Node 22. No marketing application behavior changed.

The layout update to 0.7.1 passed native upgrade, PHP syntax, repository lint and one focused real-Moodle browser scenario at 1440px/360px: navigation/Hearth placement, full-width Timeline, working native date filters, keyboard focus and zero scoped axe violations. Earlier successful progress checks were reused. Run it against the isolated preview with `IGNITE_LAYOUT_FIXTURE=1 npx playwright test --config config/playwright.integrated.config.ts --grep "native horizontal Timeline"`. No schema or learner-record changes are introduced by this layout update.

The guarded PHP suite is `tests/moodle-ignite-integrated.php`; browser configuration is `config/playwright.integrated.config.ts`. See [mission fixture instructions](ignite-missions.md#isolated-example-and-checks) for reproducible staged execution. The fixture suite creates native activities/users and must only run on its explicitly guarded disposable fixture. Native schema and PHP syntax checks cover the final source.

## Limitations, staging review and deployment

Moodle 5.2.4/PostgreSQL/Chromium are verified; other Moodle versions, database engines, themes, third-party modules, enrollment/availability plugins and browsers need staging review. The block uses supported native extension points and does not replace course navigation. Native Assignment released feedback is embedded for individual submissions; team/custom activity workflows use native pages. Native Quiz/Lesson assessment review and retry controls stay on their own controllers. Optional stages remain disabled pending product approval. Cron/native badge criteria can delay visible updates; pending states do not lock later learning.

Before a deployment decision, review approved draft identities/artwork, learner-facing copy, native assessment/feedback settings, real course/module/badge mappings, eligibility/cohort policy, challenge dates/timezone and role assignments on staging. Rehearse both onboarding invitation timings, delayed badge processing, normal native course access, phone width and keyboard use with representative roles. Confirm cron, lock support, schema checks, backups and the disable/restore plan. Existing native dashboards must be preserved. A production release is a separate authorized deployment step; no production deployment or external messages are part of this work.

To disable Ignite, turn off the master switch or individual feature flags, and turn off the optional landing setting. Hide/remove its native block through ordinary dashboard administration if desired. Learner records, native courses, completion and badge ownership remain stored. Tasks/privacy operations continue maintaining consistent retained data; administrative reporting remains permission-controlled. Re-enabling does not reset completed onboarding or deferred invitations. Do not rerun installation SQL or delete learner tables to disable a feature. Permanent uninstall is different: export/back up first, remove the dependent block through Moodle's native uninstall workflow before the local plugin, and follow Moodle's data-retention process.
