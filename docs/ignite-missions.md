# Missions around native Moodle activities

A mission adds a short practical outcome and a clear action to an existing activity or ordered set of activities. It owns presentation only. Native Moodle modules own submissions, attempts, grading, completion, assessment feedback and badge criteria. See the [integrated setup guide](ignite-lms.md) for installation, feature controls, reporting and deployment boundaries.

## Authoring

Enable **Mission presentation** in Ignite settings, then open **Missions** in the course navigation. The editor requires `moodle/course:manageactivities` and `local/ignite:managemissions` in that course; the latter defaults to editing teachers. Administrators can configure while learner features are off. A mentor's grading capability alone does not permit editing mission metadata.

The form accepts:

| Field | Meaning |
| --- | --- |
| Short title / practical outcome | Plain text describing one useful result. |
| Estimated duration | Editor-entered text, clearly labeled as an estimate, not inferred learner time. |
| Explanation/example | Brief coaching text; do not paste restricted assessment answers here. Assessment feedback stays under native release rules. |
| Practice action | The label for opening the native activity. |
| Completion requirements | Plain-language explanation of native criteria, displayed alongside native completion details. This field cannot change those rules. |
| Ordered activity IDs | One to twenty distinct **course-module IDs**, separated by spaces/commas, all in this course with valid visible completion configuration. The first incomplete step anchors the action; unavailable steps stop it. |
| Next activity | Optional distinct course-module ID in the same course. It must be available to the learner; an already-completed target is skipped in favor of an eligible incomplete step. Leaving it empty uses the normal next eligible course activity/mission. |
| Interest/path | Optional stable keys from the configured onboarding catalog. These do not grant enrollment/access. |
| Associated badge | Optional authorized native course badge, or a site badge for a site administrator, with actual configured native criteria. Association is not an award rule. |
| Active | Disable presentation while retaining its metadata and native learner evidence. |

An activity can belong to only one active mission. After creation its ordered activity identity is immutable: deactivate the old mapping and create a new one to change activity identity. Editing a title, estimate, explanation or next link never edits native activity grades/completion or resets records. A deleted/hidden activity makes its wrapper unavailable; the native course remains navigable. Existing courses need no mission records.

## Learner states

`/local/ignite/mission.php?id=MISSION_ID` requires sign-in, the learner capability, enabled missions and current active course enrollment/access. Module visibility, date/prerequisite/group restrictions and module view capability are checked before revealing names or actions. Unenrolled learners following direct links see an unavailable state. Ordered missions cannot bypass an earlier locked step by opening the wrapper.

The practice action goes to the real Quiz, Lesson, Assignment or other mapped native module. Its controller determines allowed attempts, retries, review timing and assessment restrictions. Mission coaching text is independent of assessment feedback. For individual native Assignments, the wrapper uses Moodle's feedback-status renderable, which honors hidden grades and marking-workflow release. Draft, submitted/awaiting feedback and released grading are distinguished. Team or other activity feedback is accessed through native course/activity navigation.

Valid completion is read from native completion and, when required, native gradebook evidence. A submitted Assignment with a passing-grade rule remains incomplete until the real passing grade is released. Disabled/untracked completion is unknown, not 0% or successful. After completion, the wrapper shows current personal progress, confirmed native badge state (or an honest unearned/pending/unavailable explanation), the nonblocking eligible Hearth invitation, and a next eligible mission/activity. A missing badge or choosing membership later cannot block that action.

The dashboard and onboarding starter action reuse the wrapper URL when enabled, while retaining the **same original starter course-module ID** as their evidence source. Personal history and badge credit can survive joining later; Hearth periods still exclude pre-membership work. No alternate completion button, browser-only success marker, local grade engine or mission-award endpoint exists.

## Isolated example and checks

`tests/moodle-ignite-integrated.php` creates one small fixture course, not a published course library:

1. A native Quiz asks learners to protect essentials within a 20-credit budget. It permits two attempts, requires the configured passing grade, and withholds assessment feedback under native review settings. The wrapper supplies a different worked example and an estimated duration.
2. A native Assignment asks for a short explanation of the trade-off. It uses a native passing grade, online-text submission, marking workflow and released native feedback.
3. Both wrap real native activities. Prompt 2's configured starter is the exact same Quiz course-module ID. A native badge has ALL course-completion and manual mentor criteria, intentionally demonstrating a real delay before authorized native confirmation.

The suite refuses non-CLI execution and requires an `ignite_lms_test_final_` database, loopback `wwwroot` on the guarded fixture port, `/tmp/ignite-final-runtime/` data directory and `noemailever`. Initialize a **new empty private Moodle site**, install current plugin code, and run the suite once. The upgrade path additionally installs the committed Prompt 1 code first, runs its guarded baseline and snapshot checks, then copies the current plugins and runs native upgrade. Never downgrade an installed plugin to simulate this.

Illustrative commands after provisioning those exact disposable paths/configuration:

```sh
php tests/moodle-ignite-integrated.php /tmp/ignite-final-runtime/upgrade
# Preserve the emitted INTEGRATION_FIXTURE JSON as IGNITE_INTEGRATED_DATA.
IGNITE_INTEGRATED_FIXTURE=1 IGNITE_INTEGRATED_DATA="$FIXTURE_JSON" \
  npx playwright test --config config/playwright.integrated.config.ts \
  --grep 'new learner|administrator controls'
php tests/moodle-ignite-integrated.php /tmp/ignite-final-runtime/upgrade --after
php tests/moodle-ignite-integrated.php /tmp/ignite-final-runtime/upgrade --configuration
IGNITE_INTEGRATED_FIXTURE=1 IGNITE_CONFIRMED_PHASE=1 IGNITE_INTEGRATED_DATA="$FIXTURE_JSON" \
  npx playwright test --config config/playwright.integrated.config.ts --grep 'confirmed native badge'
php tests/moodle-ignite-integrated.php /tmp/ignite-final-runtime/upgrade --early
# Update FIXTURE_JSON from this phase's output before running the earlier-selection case.
IGNITE_INTEGRATED_FIXTURE=1 IGNITE_INTEGRATED_DATA="$FIXTURE_JSON" \
  npx playwright test --config config/playwright.integrated.config.ts --grep 'administrator initial'
```

Serve the private `public/` root on loopback `8790` as its web-server user. No public server or production settings are needed. The tests authenticate against the named fixture site before entering fixture-only credentials. `--advance` runs native completion/badge/Hearth/report tasks; `--audit` exercises first-delivery concurrency once on a freshly prepared integration fixture; `--configuration` checks final save-time prerequisites and completed-next behavior, restoring the example’s native released passing grade after the earlier failing-grade reversal case for browser feedback review. These modes mutate only that disposable fixture. Rerunning the creation/quiz phases on the same learners can legitimately hit native attempt limits; recreate the fixture instead of bypassing those rules.

The integrated guide records verified counts and limitations. Tests use real native APIs and real HTTP, including incorrect/correct answers, allowed retry/exhausted attempts, withheld feedback, native draft/submission/release, grade reversal, deleted activities, revoked enrollment, privacy, membership timing and delayed badge confirmation. Earlier successful phase suites are retained for focused reuse. After collecting test output, stop the temporary servers and remove only the disposable fixture code, data directories, databases and role.
