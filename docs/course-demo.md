# Public sample week: Relationships, Boundaries & Social Skills

Route: `/demo`. The former `/demo/boundaries` URL redirects here, preserving section queries, campaign parameters, anchors and saved progress. This is the complete adapted Week 1, **What Are Boundaries?**, from Moodle course **25**, section **229**. The source week estimates **about 4½ hours**, including about **100 minutes** for case work. The website does not present a short walkthrough as completion of that workload. The source audience is grades 6–8 with support for grades 4–5; the fictional scenario and optional challenges also allow older visitors to participate.

The introduction credits Nikhil Tadepalli with his existing public staff portrait. The credit follows the course assignment in `src/data/program.ts` and the profile image in `src/data/mentors.ts`, using the shared `StaffImage` component and its fallback.

## Source map

The implementation uses the authored materials inspected during the course review on November 4–5, 2026. It is a curated snapshot, not a live Moodle synchronization. No Moodle records, settings, enrollments, grades or visibility were changed.

| Original activity | Source | Website equivalent |
| --- | --- | --- |
| 478, Week 1 slideshow | [Slides](https://docs.google.com/presentation/d/1xZw23B4cudNpspjNBLuQ7ODibw2HdGhsEaxqT4VKSnc/edit) | `Lesson.tsx`, four interactive worked examples in `week.ts` |
| 479, Which Boundary Is It? | [Kahoot](https://create.kahoot.it/details/fbc8d74a-86fa-41eb-a5d4-6fd9a645a38e) | Ten untimed warm-up questions |
| 480, Friend Cards | [Document](https://docs.google.com/document/d/1tLus3W7x15hhobcNobRvi2E2rTNOz5SlFurSB-5vDow/edit) | All four characters, their strengths, difficulties, boundaries, quotes, perspectives, and the fictional counselor |
| 481, The Borrowed Hoodie | [Document](https://docs.google.com/document/d/1IRxsR5-Ul1saKuMoY6VlsG2S2mMuLGm7kCa8Duta1kk/edit) | Full story, four prompts, two challenges, sentence starters, self-review |
| 482, case-study submission | [Moodle assignment](https://learn.ignitefindyourfire.org/mod/assign/view.php?id=482) | Browser-local writing and a downloadable workbook |
| 483, practice quiz 1 | [Moodle quiz](https://learn.ignitefindyourfire.org/mod/quiz/view.php?id=483), question IDs 505–509 | Five types-of-boundaries questions and learner feedback |
| 484, practice quiz 2 | [Moodle quiz](https://learn.ignitefindyourfire.org/mod/quiz/view.php?id=484), question IDs 510–514 | Five contextual boundary questions and learner feedback |
| 485, weekly quiz | [Moodle quiz](https://learn.ignitefindyourfire.org/mod/quiz/view.php?id=485), question IDs 521–530 | Ten-question final check, with review and retries |

The optional [Therapist Aid video](https://www.youtube.com/watch?v=XAap_uMPbGY) remains an external link with attribution. Follow-up review loaded the YouTube player and started playback in Chromium (duration approximately 6 minutes 12 seconds). The player advertised an English caption track, but a caption-text request returned an empty body, so caption accuracy/synchronization could not be reviewed. Full video content was not audited. The complete lesson text provides an independent learning path, and watching the video is not a completion requirement. Google document copies, Kahoot sign-in and external media are not required for the public week.

## Preserved scope and substantial revisions

Preserved: the three original learning aims (boundary types, evaluating limits, boundaries versus control), fence/gate metaphor, five boundary categories, four worked scenarios, differences across situations, noticing discomfort, glossary, all character perspectives, the full hoodie story, differentiated writing support, both challenges, self-check rubric, ten warm-up items, two five-item practices and ten final items. Character and story wording is lightly edited for readability. No actual student work or private teacher/grader content is included.

Substantial changes are intentional:

- **Consent and context:** removed the implication that a firm refusal to lend belongings, decline touch or withhold private information is automatically “too rigid.” The lesson still explains the source terminology, but focuses on needs and context rather than judging people. Family/cultural habits and prior permission are not current permission. Alternatives, reasons and compromise are optional.
- **Responsibility:** the unlocked locker and Marcus’s difficulty speaking up do not excuse Priya taking his hoodie. Case question 2 now asks about his needs and a protective limit instead of requiring a “too loose” label. Question 3 adds a repair step while preserving perspective-taking.
- **Question changes:** replaced practice questions 510, 511, 513 and 514 and final questions 526, 528 and 530. Updated explanations/distractors for 512 and 527, and explanations for 521 and 529. Warm-up items 9–10 now test useful responses instead of labeling people “too loose/rigid.” Other warm-up items preserve the source questions with light wording cleanup. Stable varied option order is used where appropriate.
- **Feedback:** the source practice instructions promise hints, but none were configured and the quizzes used deferred feedback. The public experience provides real hints, explanations and unlimited retries. New warm-up explanations and hints are authored additions. Completion requires reviewing every question to a correct answer; first-check results are retained separately. This does not award official marks or mastery.
- **Applied additions:** one support-a-friend scenario with consequence-based feedback, an explicitly authored first-attempt/feedback/revision example, and a four-field Boundary Response Card. These extend the original “My Boundaries Map” outcome and add an objective about writing/choosing a respectful response. They are not presented as original student or mentor work.
- **Public suitability:** replaced the optional personal-disclosure prompt with a fictional example. Removed requests for names, publicly shared documents and uploads. No live mentor availability is promised. Support signposting uses trusted adults; the sample does not provide counseling.
- **Assessment:** preserved the original ten-item end-of-week check with the revisions above, but removed its one-attempt restriction. The written case is self-reviewed against three explicit criteria. Minimum text lengths only prevent empty records; they do not assess response quality.

## Student and course-developer review

The November 5 follow-up re-read the complete source slideshow, Friend Cards, case study, native quizzes and all learner-facing answers/feedback. Fresh anonymous document exports and read-only Moodle reads matched the review snapshot: all eight native activities and quizzes 70, 71 and 72 were unchanged. No learner submissions or private grading notes were used.

| Intended source learning | Coverage in the finished sample | Deliberate adaptation |
| --- | --- | --- |
| Name five boundary types and give an example of each | Five definitions and examples; four guided checks; five required fictional examples; type practice; final questions covering every type | Added student-authored examples and workbook export to assess the “give an example” portion directly. |
| Distinguish healthy, too-loose and too-rigid boundaries | The lesson explains the source terminology, then students evaluate whether limits protect needs, consent and privacy in the examples, practice, case and final check | The literal classification objective is reframed around context. A firm refusal or private choice is not automatically unhealthy. Labels are not used to judge people or blame someone for a boundary violation. |
| Explain boundaries as personal choices rather than control | Comparison table, phone/time/homework scenarios, warm-up, final question 521, case responses and map | Clarified that a person may also ask someone to stop an action affecting them; this differs from controlling unrelated choices. |
| Apply the learning in the case and later playbook | Full hoodie narrative, all character perspectives, three required responses, optional fictional example, both challenges, sentence starters and three-criterion self-review | Submission is browser-local; optional personal disclosure becomes fictional work; a response scenario, model feedback/revision and standalone map extend the original activity. |

All essential concepts, examples, activities and assessment stages remain represented. This is a complete **adapted** week, not a verbatim export. Original classification wording, the one-attempt exam policy, mandatory third-party copying/submission, personal-disclosure option and later-week dependencies are intentionally changed. The source workload estimate remains labelled as an estimate; human study time has not been measured.

Review fixes:

- Optional perspective notes and challenges no longer revoke unrelated completed work. Changing a required case response resets its matching self-review criterion and reopens the case/map; changing a lesson example reopens the lesson/map. Other completed work remains intact.
- Check/retry actions now manage focus explicitly. Feedback uses a persistent, atomic polite status region; retry returns focus to the selected radio option. Hints remain associated with their controls. Redundant filler was removed from correct-answer feedback.
- Added five required fictional examples after the guided scenarios. Final item 527 is now a belongings scenario because the previous final check omitted that category. Its new ID, `q527-belongings`, prevents an earlier answer being mistaken for a response to the replacement question. Evaluating a healthy limit remains covered by practice and other final items.
- Reset tries removing the saved record before falling back to replacement, so full/blocked writes do not resurrect an old draft after reload. If the browser denies both removal and replacement, the page truthfully warns that only this tab was reset and saved site data must be cleared in browser settings.
- Required writing shows the remaining minimum length next to each field. These checks prevent empty work; the rubric is still needed to evaluate reasoning.
- Feedback retains programmatic focus and its polite live announcement, with a single border: green for correct answers and orange for answers to review. The extra focus outline is suppressed on the read-only status; interactive controls retain visible focus, including the retry button and radio options.
- Mobile outline text is larger, and a labelled sticky part selector makes navigation available during long lessons. Section scrolling keeps the heading and its introduction below both navigation bars.

For the reusable authoring standard, see the [short course-developer guide](course-developer-guide.md).

## Product and implementation

The first lesson now appears directly below the course introduction at `/demo`, with no start button or separate overview screen. The “Your week at a glance” label and overview navigation controls were removed. Objectives are part of the lesson, and the introduction states the estimated workload. The timeline and sidebar remain available immediately; explicit section links still focus and scroll to their heading. A fresh visit without a section query stays at the top of the introduction, and reset returns to the first lesson without changing progress keys or completion rules.

Validation of this entry-flow change passed lint, build and 138 unit tests (four existing skips). The unchanged accessibility assertions in the browser suite report existing contrast failures for the current primary orange against white/cream. A temporary copy of the same browser suite with only the color-contrast rule excluded passed all 12 scenarios across desktop Chromium, mobile Chromium and WebKit, covering full completion, initial rendering without a start button, direct links, focus, retries, refresh, download and reset. The repository's accessibility assertions remain intact, and the existing palette was not changed as part of this navigation request.

Eight navigable parts: lesson, warm-up, friend cards, case study, two practices, final check, and finished map. The source's separate submission step is integrated with the case/workbook workflow. Visitors can explore any part, return to completed content, and use a stable deep link such as `?part=case`. Existing outreach query parameters are retained during navigation; canonical metadata excludes them. Browser Back/Forward follows part changes.

Home and Program provide entry points. The final CTA uses `/program#course-catalog`, the existing course-discovery destination. A direct demo visit bypasses the site's decorative video intro. The floating Sol launcher is hidden while the demo is mounted so it cannot cover reading or controls on small screens; ordinary site behavior returns on leaving the route. No account, additional dependency, backend, enrollment, certificate, grade or Moodle completion record is introduced.

`src/data/demo/` contains the curated learner content, IDs, choices and explanations. `src/components/demo/` contains the lesson, writing, question, quiz and persistence components. `CourseDemo.tsx` owns navigation and week completion. `demoProgress.ts` normalizes untrusted storage and produces the workbook. Reusable redirect icons, fonts and existing course artwork are retained. Styles follow `IGNITE_STYLE_GUIDE.md`: the illustrated hero has white Rammetto One display text; white cards sit on cream backgrounds; orange buttons use charcoal labels; headings, controls and body text use the Poppins/Nunito hierarchy; borders, focus states and active navigation use the approved orange palette. No separate brown palette or rotated poster treatment is used.

The subsequent style and language revision replaces clipped slogans with connected explanations and removes unnecessary hyphenation and em dashes from course copy. Quiz feedback explains the answer directly instead of opening with canned praise. Fictional dialogue is preserved where its short phrasing matters to the characters. Question identities, answer correctness, learning objectives, progress storage and completion rules remain unchanged by that editorial pass.

### Monthly feature and reusable introduction

The home page includes `FeaturedCourse.tsx` immediately after the hero, headed “Featured course this month.” It shows only the course artwork, title, creator portrait/name and a sample link, taken from the selection in `src/config/courseDemo.ts`. The Home hero and Program sample links use that same selection. `CourseCreators.tsx` uses the catalog's instructor assignments and public team portraits on both the feature and the sample page. Supporting descriptions, pathway labels, workload badges and account messaging were removed from this card to keep the feature simple; the sample itself still explains its scope and workload. The redundant Free Learning benefit card was also removed from Home.

The demo introduction now uses `LearningTimeline.tsx` instead of the separate hoodie story card. All eight timeline entries come from the existing week outline; each opens its section, supports keyboard activation and reflects saved completion. This is a timeline of the sample week, not a claim about the content or availability of later weeks. The complete hoodie case remains part of the learning experience. The timeline component accepts any set of titled steps and does not depend on characters, a particular activity type or pathway.

To change the feature, first prepare and review another complete sample, give it a permanent route and its own progress storage, add it to `courseSamples`, then point `featuredCourse` at that entry. Register the new route, share metadata and built entry in the existing router/build conventions. The homepage and Program promotion then follow the selection without editing their layouts. Keep existing routes and progress keys intact so old links and saved work remain usable. This change provides a shared configuration and reusable presentation; it does not schedule automatic rotation, publish unfinished material or automatically convert Moodle courses into interactive samples.

Storage key: `ignite:boundaries-week:v1`. Notes, checked answers, first-check results, rubric and completion use localStorage. No writing is posted to a server by the demo. Anyone sharing the browser profile can read saved work. Data is bounded and normalized; corrupt or unavailable storage does not prevent learning. If storage is blocked/full, a notice offers download. A confirmed reset removes/replaces stored work, or gives an explicit warning if the browser prevents clearing it. Multi-device synchronization and cross-tab merging are intentionally unsupported. Existing saved answers/writing are retained after the review update; the added examples and replacement final item need completion before an older saved week is complete again.

The `.txt` workbook contains current case responses, optional work, self-review, map and aggregate practice results. It does not contain hidden instructor notes or a separate answer key. Static answer explanations are learner-facing and are inspectable in the frontend, appropriate for a self-guided sample rather than a secure examination.

`scripts/build-demo-entry.ts` reuses Vite's built shell to emit `/demo/index.html` with route-specific title, description, canonical and Open Graph metadata before JavaScript runs. `vercel.json` maps direct visits, including the old demo URL, to that shell. Client-side metadata follows the same existing page configuration. There is no new hosting project or hosting migration.

## Validation and remaining limits

Changed files:

- Page and route: `src/pages/CourseDemo.tsx`, `src/config/courseDemo.ts`, `src/App.tsx`.
- Learning components: `src/components/demo/CaseStudy.tsx`, `Friends.tsx`, `Lesson.tsx`, `LearningTimeline.tsx`, `Question.tsx`, `Quiz.tsx`, `Writing.tsx`, `useDemoProgress.ts`, and `demo.css`.
- Featured course presentation: `src/components/program/FeaturedCourse.tsx` and `CourseCreators.tsx`, with selection and public sample details in `src/config/courseDemo.ts`.
- Curriculum data: `src/data/demo/week.ts`, `questions.ts`, `warmupQuestions.ts`, `typesQuestions.ts`, `choicesQuestions.ts`, and `finalQuestions.ts`.
- Progress/export: `src/lib/demoProgress.ts`.
- Entry points and metadata: `src/pages/Home.tsx`, `src/pages/Program.tsx`, `src/components/layout/Layout.tsx`, `src/config/pageMetadata.ts`.
- Build, routing and public index: `scripts/build-demo-entry.ts`, `scripts/index-sol-site.ts`, generated `server/sol/site-content.ts`, `config/tsconfig.sol-tools.json`, `package.json`, `vercel.json`, `vite.config.ts` (explicit React runtime prebundling for the lazy course route).
- Validation: `tests/demo-progress.test.ts`, `tests/sol/browser/course-demo.spec.ts`, `tests/sol/site-content.test.ts`.
- Source mapping and revision record: this file, `docs/course-demo.md`; reusable standard: `docs/course-developer-guide.md`.

Run using the repository's Node 22 runtime:

```sh
npm run lint
npm test
npm run build
npm run test:browser -- course-demo.spec.ts --workers=2
```

The focused browser suite exercises a wrong answer, hints/retry, all 35 interactive checks, case writing/rubric, map, complete progress, reload, download, reset cancellation/confirmation, blocked storage, direct links, Home/Program entry points, keyboard selection, responsive overflow and scoped axe checks including contrast. It runs through the existing desktop/mobile/WebKit projects.

Initial implementation validation on November 5, 2026 used Node 22: lint and production build passed; 131 unit tests passed with four existing skips; six focused browser scenarios passed across desktop Chromium, mobile Chromium and WebKit. An unrelated stale unit expectation for the existing Home label “Applications” was corrected to match the current “Students” text; no statistics were changed.

Follow-up review after the fixes above passed lint, the production build, **138 unit tests** (four existing skips), and **12 browser scenarios** across desktop Chromium, mobile Chromium and WebKit. The browser flows complete all 35 checks, all required writing, the rubric and final map without signing in; they also verify refresh, optional-versus-required edits, first-try/retry focus, local saving failures, reset, Home/Program discovery, direct links and the final course-catalog CTA. Scoped axe scans including contrast reported **zero violations**. Automated DOM/focus/live-region checks do not verify audible screen-reader announcements.

Separate built-page inspection covered all eight parts at **1440px, 375px and 320px**: no horizontal overflow, missing course artwork or runtime errors. Visual review caught a mobile heading-introduction overlap with the sticky selector; scrolling the full header fixed it and browser assertions now cover that boundary. Manual browser-control checks also exercised numbered questions, previous/next boundaries, previous/next parts, overview, all four character perspectives, all four sentence-starter disclosures, challenges, model feedback, and opening/dismissing the reset dialog with keyboard focus restored. The source/guide file links and public demo code were checked for missing targets, drafting placeholders and private contact/instructor material; none were found. Dedicated built-route metadata and direct-load routing remain in place.

Remaining limits: the workbook and open writing are self-reviewed, not mentor-graded; progress stays with a browser profile; the optional video's full content and caption accuracy are not audited; future source changes require an editorial update to this snapshot. Automated accessibility and focus checks do not verify speech output in a real screen reader. Deployment, physical-device testing and human workload/usability studies were not performed. The sample does not imply that the remaining course weeks are complete. Publication follows the repository's existing Vercel workflow; implementation does not create another hosted copy.

The subsequent style and wording review passed lint, the production build and all 12 browser scenarios against the production preview, including scoped accessibility scans. A separate scan of all eight parts on localhost found no visible em dashes or hyphenated words, runtime errors or mobile overflow. The mobile selector and heading offsets also account for the site's taller navigation and announcement banner. The course developer guide now records the preference for connected explanations without clipped slogans or repeated praise.

The monthly feature and timeline changes also passed lint, build, 138 unit tests (four existing skips) and all 12 browser scenarios. The discovery flow now opens the homepage feature, scans its accessibility and activates all eight timeline entries with the keyboard; completion is reflected in the timeline after refresh. Desktop and mobile screenshots were inspected, and both the new feature and demo had no overflow at 320, 390, 768 and 1440 pixels. The new feature heading uses the approved dark orange to meet large-text contrast requirements on cream.

The final style pass follows the guide's font roles explicitly: Rammetto One at its native weight for display titles, Poppins Bold for card/lesson headings and controls, and Nunito for lesson paragraphs. The minimal featured card retains its white surface, rounded orange border, soft shadow, existing course artwork and shared redirect arrow. Artwork uses its original aspect ratio without cropping. The requested green-only treatment on correct feedback remains in place.
