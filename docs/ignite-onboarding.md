# Prompt 2: onboarding and recommendations

## Foundation and scope

This branch, `ignite/prompt2-onboarding`, starts from committed Prompt 1 snapshot `19bfa59f8a06bd06f7bdfba0df70a9d6ff829fbb` (`ignite/prompt1-foundation`). Prompt 1 arrived uncommitted; the snapshot contains its plugin, implementation notes, foundation integration/browser tests, configuration, and README addition. The original working directory and unrelated marketing work were preserved. Prompt 2 worktree: `/Users/elaine/Documents/Ignite-prompt2`.

Read [Prompt 1 architecture](ignite-lms.md) first. Installed source was rechecked over read-only SSH: Moodle 5.2.4, branch 502, core version 2026042004, PHP 8.3.6, PostgreSQL 16, public code under `/var/www/moodle/public`. The plugin is not installed on production. Boost, the existing theme customizations, `local_ignite_staffimports`, and `tiny_ignite_markdown` remain separate. Moodle PHP/forms/Mustache/CSS are used directly; there is no AMD or marketing build for this phase.

This phase owns the walkthrough, simple interest matching, starter evidence checks, and **when** to invite learners to Hearths. It does not implement Hearth selection, identity editing, hubs, challenge accounting, Passport, or badge issuance. The draft Embercrest, Cinderwick, Flarewood, and Blazethorn identities and Crimson/Amber/Azure/Violet color directions remain editable proposals for Prompt 3 administrator setup, with no finalized assignment. Existing configured identity records, stable IDs/codes, memberships, and Sol files are unchanged; no new Phoenix default is added. All new learner copy uses Hearth. Existing configured display names are preserved verbatim.

## Learner behavior and direct URLs

- `/local/ignite/onboarding.php`: Welcome → interests (up to three, or unsure on its own) → optional goal → up to three eligible starting paths → Finish. Initial-timing invitations insert a Hearth step only when the sibling route is configured, installed, active, and available. Every step has Continue/Back as appropriate, plus Skip for now. A dismissed walkthrough resumes only through an explicit learner action.
- `/local/ignite/onboarding.php?edit=1`: later interest edits, preserving walkthrough completion/dismissal, selected path, invitation state, and membership.
- `/local/ignite/index.php`: existing Ignite home, with walkthrough, interest-edit, Help, and resumable Hearth invitation links. A newly eligible invitation is presented once; subsequent home visits retain a smaller return action. It is never a redirect or an assessment interruption.
- `/local/ignite/invitation.php`: resumable invitation, Meet the Hearths and Choose later. A missing route, unmet evidence requirement, or existing membership produces an honest continuation message and a home link.
- `/local/ignite/tour.php`: short, reopenable interface tour. It changes no progress. Links back to home, interests, and the accessible Moodle catalog.

Finish offers **Start my first challenge** when an accessible configured substantive starter exists. It honors a selected starter, or one in the selected course; it does not switch a chosen activity to an unrelated challenge. When no eligible starter exists, the page explains the setup gap and uses the real selected target's next action or Moodle catalog. Finishing records walkthrough completion only. It never fabricates challenge completion or a badge.

The standard `after_require_login` local-plugin callback is verified in the installed `lib/moodlelib.php`: normal account/password, required profile, policy, and course access checks run first. Automatic entry is limited to plain GET requests without query parameters to `/my/index.php` or `/my/courses.php`. Ignite home always remains directly accessible, with an explicit resume action. It excludes guests, admins, editing/teaching/developer capabilities in system, category, or course contexts, including staff without active enrollment, role-switch and login-as sessions, CLI/AJAX/web services, `preventredirect`, activity requests, and sessions with a pending intended destination. Course/activity deep links, authentication, confirmation, password reset/change, policy, profile, and enrollment URLs are not intercepted. The plugin does not replace Moodle's login handler, mutate default-homepage preferences, or write `wantsurl`.

## State contract

The foundation preference service signatures are preserved. `preferences::STATUSES` adds `dismissed`; `STEPS` adds `welcome`, `goal`, `hearth`, and `finish` while retaining all legacy values. Existing `complete/done` rows are never reset. Existing `house/challenge/done` positions display Finish on explicit review. A skipped row retains its step and can explicitly resume. The original unrestricted configured-interest preference service remains compatible; the new walkthrough independently enforces its six known options and maximum of three.

New `local_ignite_prefs.targetkey` is nullable `course:ID` or `activity:CMID`, separate from the foundation's stable `pathid`. Only a currently eligible recommendation can be newly selected. Goal choices use `make`, `solve`, or `explore` in the existing `goals` field; old free-text goals remain stored unless the learner explicitly edits that step. Empty choices are allowed. Each validated transition is persisted under the foundation `user:USERID` Moodle lock/transaction. The service rechecks the step inside that lock to reject a stale cross-device form. Learner mutation APIs accept no user ID and require session-key protection.

`local_ignite_invite` contains one foreign-unique owner row:

| Field | Meaning |
| --- | --- |
| `userid` | Current authenticated owner |
| `state` | `pending`, `eligible`, `shown`, `deferred`, or `accepted` |
| `startercmid` | Nullable native activity evidence that first established eligibility |
| `timeshown` | First actual invitation presentation time, initially zero |
| `timecreated`, `timemodified` | Record lifecycle |

Transitions:

- Missing row → `pending` on an Ignite invitation/home state evaluation; no preference reset.
- `pending` → `eligible` when the available route and current timing/evidence permit an offer.
- `eligible` → `shown` only when an invitation is actually rendered, not while navigation is built.
- Any unaccepted state → `deferred` on CSRF-protected Choose later.
- Any state → `accepted` when a **real foundation membership** is found. A browser cannot submit acceptance. Existing members, including members of an inactive Hearth, are recognized without repeating selection.
- `shown` and `deferred` are not automatically reissued after timing changes. A home action allows explicit resume when current eligibility permits it. Leaving a Hearth does not reopen an accepted onboarding invitation.

`invitations::current()`, `can_offer()`, `shown()`, and `defer()` are internal own-user PHP services. They require the onboarding feature and foundation capability. Current availability, enrollment, completion, grading requirements, and membership are checked again before following an invitation. An earlier eligible record is historical state, not a permanent access grant. Turning features off preserves data and normal learning.

Privacy metadata, user-context discovery, actual export, individual/bulk/context erasure, and the existing native-account-deletion observer include the new invitation table and selected target. Shared identities, courses, enrollment, grades, and badges are not erased. Erasure uses the same foundation user lock and works with features disabled.

## Prompt 3 selection-route integration

`local_ignite/hearthselectionroute` defaults to empty. Prompt 3 must supply its actual supported **learner** route through administrator setup; Prompt 2 deliberately does not guess that the foundation's administrator-only `houses.php` is a learner chooser.

The route must be a PHP page beneath `/local/ignite/`, with no traversal, external host, query, or fragment. Known home/admin/onboarding/invitation/tour destinations are rejected. Runtime discovery additionally checks that its real file is readable inside the installed plugin, `houses` is enabled, and at least one foundation Hearth is active. Missing/disabled sibling code omits the step rather than blocking learning.

The outbound URL includes a `returnurl` pointing to onboarding during the walkthrough, or Ignite home otherwise. **Prompt 3 must validate this local return URL using Moodle APIs**, authenticate, require its capability/session key on mutation, use `houses::set_current()` or its compatible extension, and return after successful membership. No browser success flag is consumed here. If Prompt 3 ignores `returnurl`, learners can still use Ignite navigation and their membership will be recognized on the next Ignite home visit.

The invitation service does not require a callback from Prompt 3: a subsequent read reconciles the actual foundation membership. Prompt 4 has no prerequisite or callback; native badge issuance can happen independently and never gates an invitation. These routes work without either sibling branch.

## Administrator setup

Keep production untouched. Install/upgrade on local or staging through Moodle's normal plugin workflow. Under **Site administration → Plugins → Local plugins → Ignite**:

1. Enable master/onboarding; enable Hearths only when its feature is ready.
2. In the existing catalog, map any of `technology`, `money`, `entrepreneurship`, `creative`, `career`, `unsure` to real eligible courses (`courseids`) and native course modules (`activityids`). Older stable keys remain valid and preserved. Renaming/deleting definitions does not silently delete saved learner data.
3. Add practical outcomes and configured starters in **Starter challenges and recommendation outcomes (JSON)**. No examples are installed as courses or activities.
4. Keep **After the first starter challenge** as the proposed default, or select **During initial onboarding**. Configure the actual sibling selection route when installed. Changing timing never resets walkthroughs or membership.

Example (replace every ID with a real staging target):

```json
{
  "starters": [{"cmid": 123, "requirepass": true}],
  "outcomes": {
    "activity:123": "Make a usable weekly budget.",
    "course:45": "Practice planning everyday spending."
  }
}
```

Configure the native activity to use **automatic completion** with a substantive completion rule or required grade. A manually checked activity and a view-only resource do not establish a real starter challenge, even if Moodle marks them complete. `requirepass: true` additionally requires a positive native grade-to-pass threshold and a confirmed final grade meeting it. Native `completionpassgrade` is always respected. If grading is required, no final grade or a grade item needing recalculation keeps the invitation pending. Failed/incomplete completion states do not qualify. A submission awaiting required grading is insufficient. No completion API mutation occurs in learner services; there is no dependency on Prompt 6 missions or badges.

Only mapped targets with explicit outcomes appear in recommendations. The matching is deterministic, takes at most three unique targets, and uses learner interests; unsure/empty interests explore configured mappings. It rechecks course/category visibility, active enrollment and native course access, module user visibility/availability, applicable module view capability, and course permissions. Non-enrolled courses are offered only when an enabled native enrollment plugin reports `can_self_enrol() === true`, and link to **View enrollment options**. Activity names are not offered before active enrollment. Moodle owns actual enrollment, passwords, cohort restrictions, time windows, and any further destination checks. No recommendation or interest selection calls enrollment mutation APIs.

No mapping, missing outcomes, deleted/restricted content, or unavailable enrollments produce an honest empty state with the Moodle catalog. Site-specific enrollment plugins that do not expose native `can_self_enrol()` are conservatively omitted; they remain discoverable through normal Moodle pages.

## Shared files and merge ordering

Prompt 2 adds focused onboarding, recommendation, invitation, configuration, form, and administrator-setting classes; three direct controllers; scoped CSS; its own integration/browser tests and phase notes. Reuses the unmodified bundled Sol asset.

Shared additions requiring reconciliation with Prompts 3–4:

- `classes/preferences.php`: compatible status/step allowlists and fixed walkthrough interest keys.
- `classes/home.php`, `templates/home.mustache`, `index.php`: explicit resume/edit/help links and invitation display.
- `lib.php`: narrow post-`require_login` entry callback; no navigation removal.
- `settings.php`, `lang/en/local_ignite.php`: three settings and phase-specific strings, plus Hearth wording for existing home messages.
- `version.php`: `2026110200`, release `0.2.0`.
- `db/install.xml`: nullable preference target and invitation table.
- `db/upgrade.php`: one ordered `2026110200` additive savepoint, after the existing `2026110101`; does not rerun seeding for completed Prompt 1 installations.
- `classes/privacy/provider.php`: target metadata and full invitation lifecycle coverage.

Merge Prompts 2–4 sequentially before Prompt 5. Reconcile versions/savepoints and final fresh-install schema; do not concatenate competing upgrades. Keep service signatures, identity IDs/codes, existing rows, route contracts, capability/CSRF checks, and complete privacy coverage. Rerun fresh installation **and** upgrade from the completed Prompt 1 schema after the combined migration is reconciled.

## Verification

The isolated integration suite is `tests/moodle-ignite-onboarding.php`; it refuses production URLs, database names, data directories, or enabled email. `--prepare-upgrade` snapshots a completed Prompt 1 fixture before upgrading. Run normal Moodle installation/upgrade and the full schema checker. Browser tests are separate: `config/playwright.ignite-onboarding.config.ts`, `tests/moodle/onboarding-browser/onboarding.spec.ts`. They require explicit `IGNITE_PROMPT2_FIXTURE=1` and `IGNITE_PROMPT2_FIXTURES` JSON printed by the integration suite. They verify site identity before entering fixture credentials.

Verified November 1, 2026 (November 2 UTC), using two private fixtures copied from the installed 5.2.4 source, separate PostgreSQL databases and data/cache/session directories, disabled outbound email, and a loopback-only HTTP server. No production learner records were copied or modified.

- The committed Prompt 1 baseline passed **73 integration checks** and **5 native upgrade checks** before Prompt 2 was applied. The completed walkthrough/membership/configured identity snapshot survived the additive Prompt 2 upgrade.
- **69 Prompt 2 integration assertions passed on each of fresh installation and native upgrade from the completed Prompt 1 database**. They include own-user isolation, server validation/CSRF, resumed/skipped/completed state, both invitation timings, setting changes, real native enrollment options, expired/suspended enrollment, activity availability, view-only/manual/incomplete/failed/awaiting-grade/passed evidence, missing sibling code, deferred/resumable/accepted invitations, actual privacy ZIP export, all deletion scopes, and account deletion.
- Moodle’s full schema checker reported **Database structure is ok** on both databases.
- **Eight distinct Chromium browser scenarios passed**: six in the complete flow suite, followed by focused checks of the single primary Finish action and staff roles without enrollment. Real Moodle HTTP responses were used through the private SSH transport; no HTTP responses were mocked. Native login, required policy/profile/password and confirmation screens, password-reset access, intended activity destinations, onboarding resume/dismissal, interest edits, Help, native admin settings, missing starter/route, and direct sign-in protection were exercised. Scoped axe scans on interests and Finish found **zero violations**; 1,440/390/320-pixel widths, keyboard controls/focus, and reduced motion passed. The transport initially made a long scenario exceed its old 90-second test allowance; the fresh-fixture rerun passed with a 180-second allowance, using connection reuse.
- Plugin and integration-script PHP syntax checks, browser/config ESLint, and Git whitespace checks passed. No Node/AMD build is required for these PHP/CSS components.

Temporary sources, databases/role, data directories, HTTP server, and local proxy are removed after verification. Verification logs are retained under the worktree’s ignored `.reference/prompt2/` directory. The browser suite writes screenshots and failure traces to ignored `test-results/` when run.

Official matching references, checked alongside installed source: [Activity completion](https://moodledev.io/docs/5.2/apis/core/activitycompletion), [Availability](https://moodledev.io/docs/5.2/apis/subsystems/availability), [Enrollment](https://moodledev.io/docs/5.2/apis/subsystems/enrol), [Forms](https://moodledev.io/docs/5.2/apis/subsystems/form), [Privacy](https://moodledev.io/docs/5.2/apis/subsystems/privacy), and [Local plugins](https://moodledev.io/docs/5.2/apis/plugintypes/local). The installed source is authoritative for the current completion/grade item properties and callback ordering.


## Remaining limitations and handoff

Prompt 3’s actual chooser, identity editor/assets, and post-selection return behavior cannot be verified until that branch supplies its supported route. The integration seam was exercised with an authenticated fixture-only installed page; no membership chooser is fabricated here. Administrators must configure the route after installation. Prompt 4’s Passport and actual badge-award timing are not prerequisites and were not implemented or end-to-end verified in this branch. Native account-confirmation delivery was deliberately suppressed with all other email; its confirmation screen and precedence were verified.

Verification is limited to the inspected Moodle 5.2.4 branch, PostgreSQL 16, and Chromium. Site-specific enrollment plugins that lack the native eligibility method, other database/browser engines, custom identity providers/policy plugins, and production learner acceptance have not been verified. The final combined Prompts 2–4 migration and any combined navigation/settings/privacy changes must be retested after merge. No production deployment, external message, new course outside fixtures, or real badge award was performed.
