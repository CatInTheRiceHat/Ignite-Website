# Ignite learner dashboard

This preserves the Prompt 5 verification and design record. The [integrated operations guide](ignite-lms.md) supersedes version/setup and background accounting details; local_ignite is now 2026110701 and block_ignite remains 2026110501.

The dashboard combines the real onboarding, Hearth and native-badge Passport services. It is implemented in `local_ignite` with a thin `block_ignite` native Moodle block. Existing Timeline and Course overview blocks continue to supply scheduled work and the full course list; their PHP, templates, positions and personal dashboard copies are not replaced. No dashboard reset, injected dynamic HTML, Moodle core edit, enrollment mutation or credential-awarding endpoint is introduced.

Prompts 2–4 were merged sequentially on `ignite/prompt5-dashboard`. Their competing shared files were reconciled: final XMLDB schema, ordered savepoints, language/settings, home, callback, invitation deferral and complete privacy coverage. The Passport migration now follows onboarding and Hearths at `2026110400`; the original isolated Passport savepoint `2026110104` is not reused. Final local/block versions are `2026110501`. Unsupported sibling-development database combinations should be rebuilt as private fixtures rather than upgraded out of order.

## Current layout

The standalone Ignite home keeps Moodle’s real Timeline horizontal across the main workspace, the earlier **My learning space** navigation on the left, and **My Hearth** in a separate right column. Container queries stack this layout on narrow screens and in narrow native block regions. The enabled native `block_timeline` renderable and renderer supply its preferences, filters, JavaScript and permission-aware scheduled activities; no parallel Timeline is maintained. Native `/my/` continues using its existing Timeline block without an embedded duplicate. This presentation update is local version 2026110701 (0.7.1), with no schema migration, dashboard reset or production deployment.

## Administrator setup

1. Back up staging and install `moodle/local/ignite` at `public/local/ignite`, and `moodle/blocks/ignite` at `public/blocks/ignite`. Run Moodle's normal native plugin upgrade and schema checker. The theme sync/marketing deployment does not install these plugins. Preserve both directories during Moodle upgrades.
2. Under **Site administration → Plugins → Local plugins → Ignite**, enable the master and **Ignite learner dashboard** switches. Enable onboarding, Hearths and Passport as desired. Configure the real onboarding catalog/outcomes, Hearth identities/challenges and native badges using their existing administrator screens. Map the actual selection route `/local/ignite/choosehearth.php` to enable eligible invitations.
3. Use Moodle's native default-dashboard editor (**Appearance → Default Dashboard**) to add **Ignite learner dashboard** to the content region. Keep Timeline and Course overview. Administrators decide the default layout; existing learners can add the block through their own dashboard editor. This implementation does not rewrite or reset personal dashboards.
4. Ignite navigation opens `/local/ignite/index.php`, which displays the same dashboard when its switch is enabled. With that switch off it retains the earlier Ignite home. The block renders nothing when the dashboard/master switch or capability is unavailable.
5. **Use Ignite as the learner dashboard landing page** is an explicit, separate administrator setting, **off by default**. If enabled, a plain authenticated learner request to `/my/` opens Ignite home after native account/password/profile/policy checks and any pending onboarding entry. Query-bearing/editing requests, intended destinations, course/activity/enrollment links, disabled native dashboards, teaching/admin sessions, role switches and login-as retain their normal destinations. Native `defaulthomepage` and user homepage preferences are never changed. Keep this setting off to use the block inside native Dashboard.
6. Keep **Individual heat stages** **off pending a final product decision**. See the experimental configuration below. The migration clears the old reserved `levels` switch once: an earlier reserved switch is not treated as consent to the newly implemented vocabulary. Administrators must explicitly enable it after review.

No final Hearth names, color assignments, mascot variants, example courses or awards are installed. Existing identity IDs/codes, configured artwork and native Sol assets remain authoritative. [Onboarding](ignite-onboarding.md), [Hearths](phases/prompt3-hearths.md) and [Passport](ignite-passport.md) document their configuration and native rules.

## Learner behavior and evidence

The welcome has one prominent **Continue learning** link when there is a real eligible activity or normal eligible enrollment page. Its destination is identified immediately below it. Otherwise the page explains the gap and provides ordinary course/catalog links without inventing a start target.

The current course comes from the learner's saved onboarding `targetkey` (including an activity's parent course), falling back to the most recently accessed accessible active enrollment. Hidden/deleted/inaccessible selections produce a generic explanation and a valid fallback without revealing the removed title. The course card uses Moodle's user-specific completion activity set, native complete/complete-pass states, native visible-activity count semantics and tracked-role checks. It displays a textual completed/total count and rounded percentage. Native course completion can make the percentage 100 while activity counts remain separate under alternative course rules; the explanation makes that distinction visible. Finishing all counted activities does not fabricate native course completion or a badge.

Disabled site/course tracking, untracked teacher roles and courses without completion activities have an unavailable explanation and **no percentage/progress bar**. Genuine tracked zero completion can display 0%. Completion is never described as mastery.

The next action follows Moodle's section/activity order. Completed tracked activities are skipped; the first incomplete required activity anchors the sequence. An unavailable/restricted activity stops that sequence, rather than substituting a later activity. Names and links require current module availability, visibility, deletion state and the module's view capability. Native completion prerequisites, dates, groups and other availability plugins remain authoritative. When tracking is disabled, the page explains that progress is unavailable and can open the first currently available activity; it does not claim to know the learner's last completed step. Teacher sessions without tracked learner progress get the normal course link. Completed courses have a completed state and may continue to another eligible mapped course's activity or native enrollment options.

Recommended courses reuse onboarding interest/path mappings, editorial outcomes and native `can_self_enrol()` eligibility. A mapping never enrolls anyone or grants access. Hidden/deleted courses, inaccessible categories, suspended/expired enrollments and unavailable enrollment methods are omitted. Missing mappings/outcomes have an honest catalog fallback. Site-specific enrollment plugins without native eligibility support remain discoverable through Moodle's catalog.

My Hearth reads the configured identity/approved mascot, current global shared period and the learner's own recorded contribution. Without membership, a newly eligible onboarding invitation is optional; shown/deferred invitations are not reissued as new offers. A normal **Choose your Hearth** link remains available. “Choose later” in the shared chooser now defers the invitation through Prompt 2's service, preserving walkthrough and membership state.

Passport shows up to three valid featured choices, three recent visible native awards and one real accessible unowned configured badge with its native requirements visible. The current course's collectible is preferred. Hidden/private, expired, disabled and inaccessible awards retain Prompt 4's honest state/ownership rules. No visible awards or eligible preview produces an explanation, not a sample badge. Native criteria rendering follows the permission adapters before exposing referenced activity/course names. Passport uses native read-only evidence; no badge is awarded by visiting the dashboard, changing Hearth or reaching a heat stage.

## Experimental individual heat stages

These fictional personal progress labels are independent of Hearth identity and never compare/rank Hearths:

**Spark → Ember → Flame → Blaze → Bluefire**

Their vocabulary overlaps with draft Hearth identities. The system stays disabled until a product decision approves it. Thresholds are editable through validated administrator JSON, with proposed defaults **0, 1, 3, 6, 10**:

```json
{"thresholds":[0,1,3,6,10],"milestones":{"123":"complete","456":"pass"}}
```

Replace the illustrative keys with real **course-module IDs**, not instance IDs. Configure native completion first. Exactly five increasing nonnegative integer thresholds, starting at zero, and at most 200 distinct milestones are accepted. `complete` accepts native complete or complete/pass; `pass` requires automatic passing-grade completion and native complete/pass evidence. Incomplete and complete/fail never qualify. Unknown/deleted/disabled completion configurations do not count. Unavailable tracking or no eligible configured milestone in an accessible tracked enrollment produces an unavailable state, not an invented stage.

`milestone_eligibility` supplies the shared configuration/state eligibility for personal heat and Hearth challenges. They have deliberately different accounting:

| Evidence/change | Personal heat | Hearth shared period |
| --- | --- | --- |
| Eligible historical native completion | May count once in a currently accessible, tracked enrollment, including completion before membership | No backfill; pre-period/pre-membership work is excluded |
| Repeated read, login, click or replayed completion | No added count; distinct configured cmid and current native evidence only | Unique `(challengeid, userid, cmid)` ledger key prevents duplicates |
| Native reset/incomplete/fail/reversed or deleted evidence | Removes the count; valid recompletion can restore at most one | Withdraws credited work permanently for that period; recompletion cannot restore it |
| Changed Hearth | Personal native evidence stays with the learner | Original historical attribution stays with the old Hearth; later eligible work uses the new interval |
| Disabled tracking or removed configuration | Becomes ineligible; valid evidence can qualify again when re-enabled/reconfigured | Reconciliation withdraws invalid credit; withdrawal remains permanent for that period |
| New shared period | Does not multiply personal counts | Separate new period ID; existing completed work is excluded, and new evidence must satisfy its dates/membership |

Heat displays the exact next stage's **total threshold and remaining distinct milestone count**, plus accessible milestone names/conditions/statuses. It never reveals a restricted title. It stores no additional personal ledger and never writes native completion, grades, enrollment or badges. Native overrides are valid Moodle evidence under the selected configured condition. Administrators should use assessed automatic/pass rules where assessment is needed; completion by itself is not mastery.

Hearth joins/switches, inclusive period start/exclusive end, strict membership second boundaries, excluded first evidence and immutable started periods retain Prompt 3's rules. Integration now maintains the shared cached total in the completion-event accounting transaction and reconciles it in cron. `challenges::progress()` reads that total and an indexed own-user subquery in one snapshot, with request caching; it performs no Hearth-wide page aggregate. Missing totals show pending until cron. See the [current accounting and reset guide](ignite-lms.md#background-work-evidence-and-resets).

## Permissions, caching and lifecycle

All learner entry points use the authenticated current user, `local/ignite:use` and feature switches. No dashboard endpoint accepts a learner ID, completion claim or contribution amount. Normal native controllers recheck target permissions on navigation. Feature disablement preserves records and normal Moodle access.

`learner_read_model` batches course completion evidence for enrolled courses, recommendation references and own native award rows. Moodle's own course/modinfo caches are reused. Native badge objects/cards and raw course rows are reused across featured/recent/next rendering, rather than reconstructing the same badge for every card. Native criterion adapters can still perform the queries required by Moodle for each distinct badge; there is no unsupported native-object hydration or bypass of native criteria. The dashboard shows bounded credential lists instead of rendering the entire collection.

Snapshots are **request-only**, scoped to current user, role-switch state and language; no permission decision or dashboard payload persists into another HTTP request. Every successful Ignite locked transaction invalidates them, including membership, invitations, preferences, challenge changes and featured choices. Native completion/course reset/course/module/enrollment/role/grade/badge update observers also invalidate same-request snapshots. Configuration changes are read on the next request; course/modinfo invalidation stays with native APIs. There is no stale session cache waiting for a TTL or a login to refresh. A native bulk operation suppressing events is reflected by the next request's personal evidence and by the next Hearth reconciliation task.

Existing privacy coverage includes all six personal tables (preferences, membership, invitation, history, credit and featured choices). The block and heat projection store no additional personal information. Approved deletion invalidates the request cache through the same locked service, erases only Ignite-owned data and leaves native badge ownership/evidence to Moodle's own privacy rules.

## Verification

Use isolated fixtures only: loopback URL, disabled outbound email, database names containing `ignite_lms_test_p5_`, and a separate dataroot under `/tmp/ignite-p5-runtime/`. Never use production data or a production database copy. These service scripts intentionally create native fixture users/courses/completions/awards.

```sh
# At completed Prompt 1, before applying the final plugin:
php tests/moodle-ignite-combined.php PRIVATE_MOODLE_ROOT --snapshot
# Install/upgrade both candidate plugins with native Moodle CLI, then:
php tests/moodle-ignite-combined.php PRIVATE_MOODLE_ROOT
php PRIVATE_MOODLE_ROOT/admin/cli/check_database_schema.php
# In a clean combined fixture, run phase suites in this order:
php tests/moodle-hearths.php PRIVATE_MOODLE_ROOT --integrated
php tests/moodle-ignite-onboarding.php PRIVATE_MOODLE_ROOT --integrated
php tests/moodle-ignite-passport.php PRIVATE_MOODLE_ROOT --integrated
php tests/moodle-ignite-dashboard.php PRIVATE_MOODLE_ROOT
```

The integrated flag preserves strict private-fixture guards while updating isolated phase version, installed-route, fresh-identity and privacy-metadata expectations. Direct fixture DB writes explicitly invalidate request snapshots because they do not emit native events. Production changes use their normal native/service APIs. Use a fresh fixture for a complete rerun; the dashboard suite uses a delegated transaction to roll back incomplete test runs.

The dashboard script prints `DASHBOARD_FIXTURE`. Serve that fixture's `public/` directory on loopback `127.0.0.1:8785`, then run:

```sh
IGNITE_DASHBOARD_FIXTURE=1 IGNITE_DASHBOARD_DATA='JSON_FROM_SUITE' \
  npx playwright test --config config/playwright.dashboard.config.ts
```

Browser checks verify site identity before fixture credentials and use real Moodle HTTP responses, without response interception. They cover native block rendering beside Course overview, real activity navigation, new/deferred/completed/teacher/admin sessions, optional landing behavior, activity deep links, native administrator settings and optional heat display. Layout checks include **1440 / 360 / 320 px**, whole-page horizontal overflow, keyboard focus/order, reduced motion and scoped axe scans. No marketing/Node asset build is needed for these PHP/Mustache/CSS plugins.

Executed results and final limits are recorded below.

Matching installed source: Moodle **5.2.4**, branch **502**, core **2026042004**, PHP **8.3.6**, PostgreSQL; `completion_info::get_user_activities_with_completion()`, `count_modules_completed()`, `is_tracked_user()`, `is_course_complete()`, native `core_completion\progress`, `get_fast_modinfo()`, native block manager and `after_require_login` ordering. Official references: [Blocks](https://moodledev.io/docs/5.2/apis/plugintypes/blocks), [Activity completion](https://moodledev.io/docs/5.2/apis/core/activitycompletion), [Availability](https://moodledev.io/docs/5.2/apis/subsystems/availability), [Badges](https://moodledev.io/docs/5.2/apis/subsystems/badges), [Cache API](https://moodledev.io/docs/5.2/apis/subsystems/muc).

### Executed results — November 1, 2026 (Pacific)

Verification used copied installed Moodle 5.2.4 source, PHP 8.3.6, PostgreSQL and Chromium. The first core installations started with empty private databases and separate writable directories. Final fresh-plugin checks used native uninstall/reinstall within that disposable fixture; only generated test data existed there. No production learner database or files were copied.

| Check | Result |
| --- | --- |
| Completed Prompt 1 foundation before integration | **73 service checks + 5 native upgrade checks passed** |
| Combined merge contract, fresh and upgrade | **18 passed on each path**, including preserved foundation records/configuration and all six personal privacy tables |
| Merged service gate before dashboard implementation | **67/63 Hearth (upgrade/fresh), 68 onboarding on each path, 70 Passport on each path passed** |
| Final-code fresh plugin service regression | **63 Hearth + 68 onboarding + 70 Passport passed**; the Passport suite also passed after final card-cache changes |
| Dashboard native service/evidence suite | **40 passed** after fresh plugin installation and again after the direct completed-Prompt-1-to-final upgrade |
| Direct completed Prompt 1 → `2026110501` | Every ordered native savepoint passed; **18 contract checks passed**, preserving existing identity IDs, preferences, membership, mapping and native records |
| Full native schema checker | **Database structure is ok**, fresh and upgrade, including the direct final path |
| Final exact PHP sources | **68 files passed syntax checks**, including plugins and integration scripts |
| Final Chromium suite | **4 passed in one run**, using real authenticated Moodle HTTP responses |
| Scoped accessibility | **Zero axe violations**, dashboard with stages off and with experimental stages explicitly enabled |
| Visual/interaction | Reviewed desktop and **360px** screenshots; **1440 / 360 / 320px** overflow, keyboard focus/order, reduced motion and real primary activity navigation passed |
| Focused browser/config ESLint and Git whitespace | Passed |

The 40 dashboard assertions include real zero/completed progress, count/percentage agreement, unavailable percentage states, native completion prerequisites/reversal, a date-restricted next activity, actual native course deletion, new learners, teachers/admins, invitation deferral, historical personal evidence, membership changes, immediate own/shared totals, permanent period withdrawal, recompletion deduplication, native ownership preservation, request-cache reuse, disabled site/course tracking, editable threshold validation and native block installation alongside Course overview. The browser tests exercise administrator opt-in and restore landing/heat switches to off.

A temporary command-based SSH HTTP bridge exposed only the loopback fixture to the local browser because ordinary SSH port forwarding was unavailable. There was no HTTP response mocking. Screenshots and private logs are retained locally under ignored `.reference/prompt5/` and `test-results/`. Temporary servers, copied runtime/source, databases and database role were removed after verification. Production remains unchanged.

Limits: only Moodle 5.2.4, PostgreSQL and Chromium were exercised. Native custom badge criteria and grading waits retain Passport's documented adapter limits. Site-specific enrollment/availability plugins, other browsers/databases, final identities/artwork/vocabulary and production learner acceptance still need their normal staging review. There is no historical Hearth backfill; ambiguous join/switch seconds and silent-reset reconciliation retain the documented conservative rules. No production deployment or marketing build was performed.
