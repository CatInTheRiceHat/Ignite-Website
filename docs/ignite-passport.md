# Prompt 4 — Ignite Passport

The current learner-facing name is **Campfire**. This phase record uses the former Passport name; internal service/setting keys and existing URLs remain compatible.

This branch starts at the committed, completed Prompt 1 foundation `19bfa59f8a06bd06f7bdfba0df70a9d6ff829fbb`. See [the original implementation notes](ignite-lms.md). Worktree: `/Users/elaine/Documents/Ignite-prompt4`; branch: `ignite/prompt4-passport`. It does not require Prompts 2 or 3. Keep this phase isolated until sequential integration.

## Learner routes and behavior

- `/local/ignite/passport.php`: personal earned collection, enabled curated previews, up to three currently valid featured choices, and native badge-management/learning links.
- `/local/ignite/badge.php?id=BADGE_ID`: authorized native name, description, criteria, issuer name, permitted course, earned/expiry dates, separate course completion, and course/catalog next action. Unknown and inaccessible IDs have the same unavailable response.
- `/local/ignite/featured.php`: native Moodle form for replacing or clearing featured choices. No learner ID parameter is accepted. Up to three distinct, currently available owned badges; authentication, capabilities, session key and ownership are checked again in the locked save.

All require the foundation master and Passport feature switches. No Hearth membership, onboarding state or enrollment mutation is required. Badge access also requires native `enablebadges`, `moodle/badges:manageownbadges` in the own user context and `moodle/badges:viewbadges` in the relevant badge context. Disabling Passport does not disable native learning or badge management.

This is a private presentation of real native credentials, with no credential issuance API, native badge writes, completion writes, public profile changes, backpack changes, or new completion-based reward engine. Opening Passport, selecting featured choices, and changing Hearths never award anything. Native badge criteria and original evidence remain authoritative. A static celebration appears only after server-confirmed valid issuance; no animation is required. The existing Sol graduation PNG is reused without alteration.

Earned and unearned states are text labels, not color alone. Artwork is decorative beside the real badge name. Native forms, visible keyboard focus, responsive grids, accessible text contrast, and explicit reduced-motion rules are used. The orange action background uses dark text; small link text uses a darker, contrasting orange.

## Native administrator setup

Install/upgrade on local/staging, then enable **Ignite → Enable Ignite** and **Ignite Passport**. Enable native Moodle badges and, for course badges, **Badges → Badges settings → Enable course badges**. Configure completion tracking at site/course/activity levels and keep Moodle cron running. Leave feature flags disabled until configuration is reviewed.

Create or reuse credentials in Moodle's own screens:

- Site: `/badges/index.php?type=1` or Site administration → Badges → Manage badges.
- Course: `/badges/index.php?type=2&id=COURSE_ID` or Course → More → Badges.
- Criteria: `/badges/criteria.php?id=BADGE_ID`.
- Manual award: `/badges/award.php?id=BADGE_ID`; this remains the only manual-award UI.

| Collection | Supported native setup in installed Moodle 5.2.4 |
| --- | --- |
| First Spark | A **course badge**, Activity completion criterion, selecting the designated real starter **course-module ID**. Set the activity's real completion conditions. A completion checkbox is appropriate only when the administrator deliberately chooses native manual completion; a passing assessment should use automatic/pass-dependent completion. An activity criterion is not supported directly on a site badge. |
| Course achievement | A course badge with **Course completion** criterion, linked to that course's actual configured completion rule. One primary collectible per mapped course. Other native criteria may coexist only when overall aggregation is ALL, so course completion cannot be bypassed. |
| Explorer | A **site badge**, Completing a set of courses criterion, selecting distinct real courses, aggregation ALL. Site and selected courses need completion enabled and actual completion rules. Native criteria support a specified set, not an arbitrary “any N different courses” query. A course badge does not support the course-set criterion. |
| Project Builder | A course badge with Activity completion for the project activity, configured with a real passing grade/completion condition; or native Course completion where the course rule represents the project. A presentation category never enforces a pass requirement. |
| Collaborator | Manual issue by role. Select the authorized mentor role in native criteria. Grant that role native `moodle/badges:awardbadge` in the badge context, and `moodle/badges:revokebadge` only if appropriate. Site badges need a suitable system role; a course teacher role alone does not grant site-badge authority. |

Suggested editable contribution rubric for Collaborator: the learner provides a specific useful contribution (explanation, constructive feedback, shared project help); it is respectful, accurate enough for the task, and supports another learner's understanding; the mentor checks and records evidence in the course's existing assessment/feedback workflow before awarding. Include the rubric in the native manual criterion description. Attendance, opening a page, or choosing a Hearth is not sufficient evidence. Record any consent-sensitive contribution evidence in the existing permitted course workflow, not Passport metadata.

Set all criteria and approved artwork before enabling access to a badge. Moodle restricts editing active/issued badges. Use native disable/copy/version workflows as permitted; do not bypass native locks, rewrite issued criteria, or mutate badge tables. Native manual revocation is supported; automatically issued awards do not have an equivalent general-purpose manual revocation workflow in this Moodle version. Passport reads current records and never fabricates revocation support.

No examples are created or awarded by installation/upgrade. Test scripts create fixtures only in a guarded empty test database.

## Presentation configuration

**Site administration → Plugins → Local plugins → Ignite → Passport badge presentation (JSON)** stores display configuration separately in `config_plugins` (`local_ignite/passportcatalog`). It never renames native credentials. Defaults to `{"badges":{}}`.

Replace the illustrative IDs below with real staging IDs. Each property name under `badges` is `badge.id`; `courseid` is `course.id`, not a course-module/activity ID.

```json
{
  "badges": {
    "101": {"category": "starter", "courseid": 12, "artwork": "placeholder"},
    "102": {"category": "skill", "courseid": 12, "primary": true, "artwork": "course"},
    "103": {"category": "explorer", "artwork": "native"},
    "104": {"category": "project", "courseid": 15, "artwork": "placeholder"},
    "105": {"category": "collaborator", "caption": "A useful contribution", "artwork": "native", "enabled": true}
  }
}
```

Categories: `starter`, `skill`, `explorer`, `project`, `collaborator`. `courseid` defaults to null, `primary` false, `artwork` `placeholder`, `caption` empty, `enabled` true. Caption is plain text, up to 250 characters. Maximum 200 mapped badges and 100 KB. Unknown properties, arbitrary asset URLs, invalid native IDs/course mismatches and multiple primary badges for one course are rejected. Primary requires an actual course-completion badge and a course with configured native completion criteria. Invalid native admin-setting saves preserve the old value.

`artwork` is an explicit administrator approval choice: `native` uses the existing Moodle badge image; `course` uses that mapped course's existing overview image; `placeholder` shows “Artwork awaiting approval.” Missing assets fall back to the labeled placeholder. Choose distinct approved assets where available. No final course or Hearth art is generated. Changing presentation does not change the badge image embedded in a native credential.

Map one primary badge for each course intended to appear as a course collectible. Unmapped owned badges appear as Other achievements with placeholders. Only mapped, enabled, active badges appear as unearned previews. Metadata `enabled: false` hides a collectible from Passport, including featured display, without changing the native badge. Removed native references are skipped on read.

## State and integration interfaces

Internal PHP services, not externally registered web services:

```php
// Prompt 2 can use this without the Passport feature being enabled.
// Requires authenticated Ignite learner + native badge access. No arbitrary user ID.
$state = \local_ignite\badge_state::get_current($nativebadgeid); // array|null

// Prompt 5/6 can reuse the current-user presentation and server-side save.
$collection = \local_ignite\passport::collection_current();
$detail = \local_ignite\passport::badge_current($nativebadgeid); // array|null
\local_ignite\passport::save_featured_current([$ownedbadgeid1, $ownedbadgeid2]); // valid sesskey
\local_ignite\passport::save_featured_current([]); // clear all
```

`badge_state` returns `badgeid`, `state`, `owned`, `earned`, `featureable`, `issuedid`, `dateissued`, `dateexpire`, and `coursecomplete` (bool or null). It returns null when native settings, permissions or visibility disallow the badge. `earned`/`featureable` are true only for a currently active, visible, unexpired award owned by the current user. The state vocabulary:

| State | Meaning |
| --- | --- |
| `unearned` | No native award, and no supported pending evidence. |
| `pendingissuance` | Installed read-only native criteria review confirms requirements, but no issued award exists. Never marked earned. |
| `pendinggrading` | Submitted individual native Assign work, relevant grade-dependent completion, and no grade yet. Never marked earned. |
| `earned` | Server-confirmed active, visible, unexpired native award. |
| `earned_unavailable` | Native award still exists but badge has been disabled. Kept honestly labeled in the private collection, excluded from featured choices. |
| `expired` | Native award exists but its expiry passed; excluded from featured choices and celebrations. |

`owned` means the native award row exists; it must not be treated as valid/available without checking `earned`. `coursecomplete` is separate and does not imply issuance. Pending issuance uses only the installed read-only `review()` implementations for activity, course, course-set, manual and prerequisite-badge criteria, respecting actual ALL/ANY aggregation. It never calls `mark_complete`, award processing or `issue`.

Collection fields include `earned`, `pursue`, `featured`, `has*` flags, `nativeenabled`, `canview`, routes, and decorative `hashearth`, `hearthname`, `framecolor`. Each card includes the state fields plus native name, category, status text, approved image/placeholder, date text, detail URL and display metadata. No email, another learner's ID, or external assertion hash is returned.

Sibling integrations must check `class_exists(\local_ignite\badge_state::class)` and the relevant feature availability before use. Null/unavailable means “no badge confirmation,” not “challenge failed.” Prompt 2 must keep its own native activity-completion test and allow Hearth invitation and continued learning while badge issuance or grading is pending. No onboarding or Hearth gate belongs in these services.

Hearth decoration reads only Prompt 1's `houses::get_current()` when its existing feature is enabled. The current configured name and validated accent are used, including renamed or inactive memberships. No draft identity, hardcoded Hearth name, color assignment, new default, mascot design, membership mutation or Prompt 3 hub dependency is introduced. Changing/leaving Hearths never changes native credentials, evidence, featured choices, enrollments or grades. The neutral frame works without membership. Prompt 3 owns additional editable identity fields and proposal setup.

## Visibility and limits

Course badges and mapped course links require current active course access and native course-list permissions. Native course-badge settings and badge capabilities are honored. Hidden/restricted/deleting criterion activities and inaccessible referenced courses/prerequisite badges suppress the collectible to avoid leaking names through native criteria output. For course-set badges this conservatively requires access to every referenced course. This phase does not advertise badges from unenrolled courses; learners can use the normal catalog. Hidden native individual awards are omitted; users can manage those choices in native Moodle. Archived or removed badges are omitted and cannot remain featured. A disabled issued badge is labeled unavailable rather than losing the historical fact of issuance. A stored featured reference is always checked against the current specific award instance, so revocation/reissue cannot silently restore it.

Pending grading is deliberately limited to individual Moodle Assign submissions with grade-dependent completion and no grade. Group submissions, quizzes, workshop review, marking workflow/release delays and custom modules use the conservative Not earned state until native evidence supports another state. Cohort/competency/custom badge criteria are conservatively unavailable pending dedicated permission adapters. Profile criteria can be displayed but do not get a speculative pending-issuance state. Native badge management remains accessible through the existing link. Completion processing can be delayed by Moodle cron. No new scheduled polling or persistent celebration records are introduced.

## Schema, privacy and sequential merge

This isolated branch uses plugin version/savepoint **2026110104**, release `0.4.0`. The original `2026110101` foundation migration remains intact. New table `local_ignite_feature` contains `id`, `userid`, `badgeid`, `issuedid`, `slot`, `timemodified`, with a user foreign key and unique `(userid, slot)` and `(userid, badgeid)` indexes. Native award references are intentionally not foreign keys: native revocation/deletion must remain independent, and stale references are filtered on every read. Writes share the existing `user:ID` lock and delegated transaction. Privacy exports the exact stored preferences even if a referenced award later becomes unavailable.

Privacy metadata, context/user discovery, own-user export and approved single/bulk/context deletion include the new table; the existing account deletion observer reuses `erase_user`. Erasure works with features disabled and leaves native credential/evidence records to Moodle's own privacy provider. Shared metadata configuration contains no learner state.

Shared-file additions needing reconciliation with Prompts 2 and 3: `settings.php` (one validated JSON setting); `lang/en/local_ignite.php` (`passport_*`, four privacy strings, two existing Passport descriptions); `classes/home.php` (existing badges link now targets Passport); `version.php`; `db/install.xml`; `db/upgrade.php`; `classes/privacy/provider.php`. No shared navigation hook, capability definition, authentication or foundation service signature changes. New Passport PHP/templates/CSS, tests and this note are phase-specific.

Merge Prompts 2–4 **sequentially before Prompt 5**. Reconcile final version/release, all schema changes and ordered savepoints against the completed Prompt 1 database. Do not concatenate migrations blindly or reuse numbers. Preserve each provider's metadata, context discovery, export and deletion additions. If a higher savepoint was previously applied on a disposable sibling fixture, rebuilding that fixture is safer than pretending lower migrations will run. Do not deploy this branch independently over a sibling feature database.

## Verification and handoff

Runtime results are recorded below after actual execution. Test commands assume an isolated Moodle 5.2.4 source copy, a newly initialized PostgreSQL database named with `ignite_lms_test_passport`, independent dataroot/cache/session/temp directories, loopback URL, and `$CFG->noemailever = true`. Never use a production database or data copy.

```sh
# With unchanged Prompt 1 code in the private runtime:
php tests/moodle-ignite.php PRIVATE_MOODLE_ROOT
php PRIVATE_MOODLE_ROOT/admin/cli/upgrade.php --non-interactive
php tests/moodle-ignite.php PRIVATE_MOODLE_ROOT --upgrade-check
php tests/moodle-ignite-passport.php PRIVATE_MOODLE_ROOT --baseline
# Copy this branch's plugin into that runtime, then:
php PRIVATE_MOODLE_ROOT/admin/cli/upgrade.php --non-interactive
php tests/moodle-ignite-passport.php PRIVATE_MOODLE_ROOT
php PRIVATE_MOODLE_ROOT/admin/cli/check_database_schema.php
# Repeat against a separate fresh plugin installation:
php tests/moodle-ignite-passport.php FRESH_PRIVATE_MOODLE_ROOT --fresh
```

The test suite prints `PASSPORT_FIXTURE` with local-only learner names/IDs. Serve the upgraded fixture on loopback `127.0.0.1:8784` and run:

```sh
IGNITE_PASSPORT_FIXTURE=1 IGNITE_PASSPORT_LEARNER=PRINTED_LEARNER \
IGNITE_PASSPORT_EMPTY=PRINTED_EMPTY IGNITE_PASSPORT_BADGE=PRINTED_BADGE_ID \
IGNITE_PASSPORT_PROJECT=PRINTED_PROJECT_ID IGNITE_PASSPORT_MANUAL=PRINTED_MANUAL_ID \
npx playwright test --config config/playwright.passport.config.ts
```

The dedicated browser config/test does not change Prompt 1 tests. Those retain their original native-badge link expectation; the integrated suite must update that one expectation to `/local/ignite/passport.php`. No marketing build is needed: the local plugin uses PHP, Moodle forms, Mustache and scoped CSS without new JavaScript.

## Matching source and official references

Checked the installed **Moodle 5.2.4 (Build: 20261005)** source, branch `502`, core `2026042004.00`, PHP 8.3.6, PostgreSQL. In particular: `public/lib/badgeslib.php`; `public/badges/classes/badge.php`, `award_manager.php`, `event/observer.php`; `public/badges/criteria/award_criteria*.php`; native badge renderer, management, award/revocation and own-collection controllers; native badge/award XMLDB definitions; completion APIs; Assign submission/grade reads; course/category access and course image export; Moodle forms, admin settings and privacy APIs. The marketing repository contains customizations, not an installed Moodle runtime. The local downloaded Moodle 5.2.3 copy was not used as the verification runtime.

- [Moodle 5.2 Badges API](https://moodledev.io/docs/5.2/apis/subsystems/badges)
- [Moodle 5.2 badge setup, course sets and native manual revocation](https://docs.moodle.org/502/en/Using_badges)
- [Moodle 5.2 managing badges, capabilities, disabling and deletion](https://docs.moodle.org/502/en/Managing_badges)
- [Moodle 5.2 badge settings and native privacy choices](https://docs.moodle.org/502/en/Badges_settings)
- [Moodle 5.2 Privacy API](https://moodledev.io/docs/5.2/apis/subsystems/privacy)

Where the documentation summarizes fewer criterion types, the installed native `badge::get_accepted_criteria()` and criterion implementations determine what the branch actually supports.

### Executed results — November 1, 2026 (Pacific)

1. **Works:** standalone collection/detail/featured routes without onboarding or membership; real native activity, course and site course-set issuance; native manual mentor award and revocation; delayed issuance and individual Assign pending grading; earned/unearned/disabled/expired states; safe celebrations; private featured choices and neutral/configured Hearth frames. Actual approved native badge images and native course overview images load. The extensionless native `f3` image route is covered explicitly.
2. **Changed components:** Passport services, validated presentation setting, native featured form, three controllers, three Mustache templates, isolated CSS, foundation-home destination, feature-choice table/upgrade and privacy provider. Existing foundation service signatures and Sol files are unchanged. No theme logic or JavaScript build is introduced.
3. **Checks:** unchanged foundation **73 integration + 5 upgrade assertions passed** before this feature. Passport **71 assertions passed after upgrade from completed Prompt 1**, including a before/after comparison of all foundation/business records (excluding Moodle's expected course-cache revision token). A separate fresh plugin installation passed **73 assertions**. Both native XMLDB schema checks reported **Database structure is ok**. **Six Chromium tests passed** through real loopback Moodle HTTP, including loaded native/course artwork, scoped axe scans with **zero violations**, 1,440/390/320-pixel layouts, keyboard focus, reduced motion, native featured-form validation/save/clear, actual criteria/earned celebration, pending grading, empty collection, forbidden IDs, route authentication and learner denial on native manual award. All 30 plugin PHP files and the Passport integration script passed syntax checks. Dedicated Playwright configuration/tests passed ESLint; `git diff --check` passed. No marketing build was needed.
4. **Administrator setup:** install/upgrade in staging; enable native badges/course badges and the existing Ignite/Passport switches; configure actual native criteria, mentor capabilities and cron; map real native badge/course IDs and one actual primary per desired course; explicitly approve existing native/course artwork or retain placeholders. No production examples were created or awarded.
5. **Unresolved integration:** merge Prompts 2, 3 and 4 sequentially before Prompt 5. Prompt 2 should availability-check `badge_state::get_current()` and must not wait for issuance before inviting a Hearth or continuing learning. Prompt 3 retains membership/identity ownership; Passport needs no hub. Prompt 5/6 can consume the documented collection/detail/state and feature services. The sibling chooser currently documents `/local/ignite/passport.php` as an allowed return destination, matching this branch. Actual merged-sibling runtime behavior remains unverified until integration.
6. **Shared files/migration:** one new table, `local_ignite_feature`; version/savepoint `2026110104`; additions to shared settings, language, home, XMLDB install/upgrade and all privacy paths. Reconcile these additions with siblings as detailed above. No native credential table or existing stable record was recreated.
7. **Limitations:** only Moodle 5.2.4, PHP 8.3.6, PostgreSQL and Chromium were exercised. Group/other-module/custom grading waits and cohort/competency/custom-criterion permission adapters remain limited as described above. Previews require current course access. Automatically issued badges have no general native manual-revoke workflow in this version. Final identity/artwork proposals and cross-phase integration remain administrator/integration work.

The source/runtime, databases and writable directories were separate from production and the parallel Prompt 2/3 fixtures. Only code was copied from the installed source; no production database or learner files were copied. HTTP verification used a temporary command-based SSH bridge to a loopback-only server because SSH port forwarding was disabled. The temporary runtime, test databases, role and servers were removed after checks. Ignored local evidence is under `.reference/ignite-passport` and `test-results`; no fixture credentials are production credentials. No production deployment or external message was sent.
