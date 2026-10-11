# Sol in Ignite

Sol now belongs to this repository and the existing Ignite Vercel project. The website mounts its local widget from `src/main.tsx`; requests use this site's `/api/status` and `/api/chat`. No second website or separate Sol deployment is needed. The old external script has been removed from `index.html`.

## Files and editing

- `src/sol/widget/`: interface, Shadow DOM loader and scoped styles.
- `src/sol/shared/`: approved destination IDs, safe URL resolution and bounded request/reply contracts.
- `server/sol/`: OpenAI Responses API, reviewed public knowledge and shared Redis rate limits.
- `api/chat.ts`, `api/status.ts`: Vercel entrypoints. Existing `api/apply.ts` remains in place.
- `public/mascots/Idle.gif`, `Logo.png`, `Mascot.png`: original Ignite artwork. The GIF is about 11 MB; reduced-motion users receive the static logo.
- `config/*sol*`, `tests/sol/`, `scripts/dev-sol.ts`: checks, builds and local development.

The launcher stays closed until clicked. Header, greeting, quick-action labels and input text are centered. The header uses primary orange `#F07B2A` with white text and a dark halo for contrast. Sparkle decorations and the trash button are removed. Closing preserves history; reload discards it. Nothing stores transcripts in browser storage or a database.

## Local development

Use Node 22.12 or later in the 22.x series. Install with `npm install`. Merge the empty/example settings from `config/sol.env.example` into ignored `.env.local`; preserve any existing Ignite credentials. Run `npm run dev`, then open `http://127.0.0.1:5173`. Set `SOL_DEV_PORT=5175` to choose another port, and include that exact origin in `ALLOWED_ORIGINS`.

The dev script serves Ignite plus Sol's two API endpoints. It does not implement the unrelated application/email endpoint locally; use `vercel dev` for that workflow. With missing Sol configuration, real replies are visibly unavailable and the verified quick links still work. Successful replies are never faked outside tests.

## Move production configuration, then deploy

1. In Vercel, open the **existing Ignite website project**, then Settings → Environment Variables. Copy the Sol project's server settings into Ignite, selecting Production and any Preview environments you intend to use. Keep Ignite's existing Supabase/email variables.
2. Required: `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_SALT`, `WEBSITE_BASE_URL`, `ALLOWED_ORIGINS`. Never use a `VITE_` prefix for credentials. Nothing in this repository contains real values.
3. Set `WEBSITE_BASE_URL=https://ignitefindyourfire.org`. Set `ALLOWED_ORIGINS=https://ignitefindyourfire.org`, adding any other actual served origins as comma-separated exact origins with no trailing slash. Explicitly add each preview URL before testing that deployment. A blanket `*.vercel.app` or `*` is not allowed.
4. Copy the same Redis credentials, `RATE_LIMIT_SALT`, `RATE_LIMIT_NAMESPACE` (normally `sol`), `DAILY_REQUEST_CAP`, `RATE_LIMIT_PER_MINUTE` and `GLOBAL_RATE_LIMIT_PER_MINUTE` from the old deployment. Keeping the namespace and salt preserves shared limits during the transition. Do not reset the cap by inventing a new production namespace. Local development should use a separate namespace such as `sol-ignite-local`.
5. `OPENAI_MODEL` defaults to `gpt-4.1-mini`, an economical supported model for short navigation replies. Default budgets: 10 requests/visitor/minute, 60 globally/minute, 500/day. `RATE_LIMIT_SALT` must be a random secret of at least 32 characters; reuse the existing value during migration. Optional rate settings accept positive integers only.
6. Set the Ignite Vercel project to **Node 22.x**, Vite, build command `npm run build`, output `dist`, repository `CatInTheRiceHat/Ignite-Website`. Keep the project/domain association. Merge/deploy the reviewed feature branch using the usual Ignite workflow. The checked-in Vercel routing serves assets and APIs before website routes; both chat functions have 30-second limits.
7. Check `https://ignitefindyourfire.org/api/status` returns `available: true`. Open the actual website, click Ask Sol, and ask a short program question. Check Program/FAQ navigation, an unsupported question and Moodle help. An unavailable notice means configuration or a provider/protection failure needs attention; it is not a successful reply.
8. Only after this deployment is verified should you remove the old **Sol Vercel project** and archive/delete **Sol-Website**. Deleting GitHub alone does not remove the old Vercel deployment. Keep a backup/history if wanted. Do not delete the Ignite project or the shared Redis database.

No integration snippet is needed for Ignite: `src/main.tsx` mounts Sol directly, using the current origin for the backend and site links. Optional embeds elsewhere can still load `https://ignitefindyourfire.org/sol.js` and call `Sol.mount({ backendUrl: 'https://ignitefindyourfire.org', websiteBaseUrl: 'https://ignitefindyourfire.org', loadFonts: false })`; add their exact origin to the backend allowlist first.

## Verified knowledge and refresh

Reviewed public source at Ignite revision `4695804e4785f9e16074b0ddcaa04268d971238c` on 2026-10-11, including `src/App.tsx`, `src/pages`, `src/lib/links.ts`, `src/config/records.ts`, `src/data/program.ts` and the style guide. This replaces Sol's obsolete summer-program snapshot.

| Entry | Public source and approved destination |
| --- | --- |
| About | `src/pages/About.tsx`, `src/data/program.ts` → `/about`: student-led practical life skills, free-learning mission, courses in development. |
| Formats and catalog | `src/pages/Program.tsx`, `src/data/program.ts` → `/program`: 20 developing plans, 3 live and 17 independent; planned one-week live and six-week independent formats. All are plans, with no confirmed launch/enrollment schedule. |
| Eligibility and enrollment | `src/pages/FAQ.tsx`, `src/data/program.ts`, `src/pages/Apply.tsx` → `/faq`, `/program`, verified contact: historical grades 4–8 do not establish each new course's eligibility; prerequisites, certificates and enrollment remain unconfirmed. The old student Google Form has been removed from Sol's allowlist. `/apply` is a legacy information page, not a confirmed student application. |
| Team and hiring | `src/pages/Mentors.tsx`, `src/pages/Hiring.tsx`, `src/lib/links.ts` → `/team`, `/hiring`, `https://forms.gle/wV8e5edRNVNpUJvt7`: current/former staff and intern application. No invented roster, compensation, deadline or eligibility. Verify any deployed `VITE_INTERN_FORM_URL` override and update Sol's approved destination if it changes. |
| Results | `src/pages/Statistics.tsx` → `/statistics`: historical Summer 2026 figures: 110 applications, 295 selections, 77 schools, five countries/regions, ten cohorts, three weeks, ten mentors. |
| Records | `src/config/records.ts`, `src/pages/Records.tsx` → `/records`: past statistics and Cleanse Nonprofit, Nice Tea campaign, basil-growth work. |
| Learning and help | `src/lib/links.ts`, `src/components/program/ProgramNextSteps.tsx`, FAQ/Hiring → `https://learn.ignitefindyourfire.org` and `mailto:ignitefindyourfire@gmail.com`. The learning hub is a Moodle sign-in destination. Sol has no access to accounts, lessons, grades or student information. |

To refresh, run `npx tsx scripts/refresh-sol-knowledge.ts` to collect current public source in ignored `.reference/sol-review/`. Review the actual pages and imported data, then update `server/sol/knowledge.ts`, its revision/date, destination allowlist and this table. Catalog facts deliberately reuse the public `src/data/program.ts` data; review any data changes for grounded wording. New URLs still require source review. Run the checks below before deploying. Never add facts from private systems or infer availability from a course plan.

## Checks and protection boundaries

Run `npm test`, `npm run build`, then `npm run test:browser` (install browsers once with `npx playwright install chromium webkit`). Tests include compiled plain-Node API startup, valid/unsupported answers, unknown IDs, missing config, failures, oversized input, rate limiting, malicious text, keyboard/focus, reduced motion and desktop/phone layouts. Browser successes use explicit fixtures; real credentials are disabled for those tests. Four optional real-Redis concurrency checks require `REDIS_SERVER_BIN` and `REDIS_CLI_BIN`; otherwise they skip.

Input is limited to 1,000 characters, six history messages/4,000 total history characters, 16 KB request bodies; model output is capped at 400 tokens and validated against approved IDs. Only relevant approved knowledge is sent. Visitor messages and history are untrusted. Responses render as text, never HTML. Server calls time out (Redis 3 seconds, OpenAI 15); configuration/protection outages fail closed. No full conversation or provider error payload is logged. `store:false` is requested from OpenAI, subject to provider data controls.

Redis atomically reserves per-visitor, global-minute and daily budgets across serverless instances, with HMAC-hashed IPs and expiring counters. CORS/origin checks are not authentication: non-browser clients can forge Origin. Shared server limits and daily caps protect request budgets; CORS alone does not prevent abuse. All keys remain server environment variables.

References: [OpenAI Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Upstash REST](https://upstash.com/docs/redis/features/restapi).

## Migration verification

Validated with Node 22.23.3: 33 backend/knowledge/compiled-startup tests passed, including all four real Redis concurrency checks against a disposable local Redis. All 27 browser cases passed across desktop Chromium, small-phone Chromium and iPhone WebKit, including the three integrated route/history cases. Open-panel axe scans had zero violations. The production website and optional loader built successfully. Real local OpenAI requests for current course plans and an unsupported topic returned valid approved navigation. Built client files contain no server credential values or old Sol deployment dependency.

Vite was updated from 5 to 6.4.4 to support the current test tooling; React remains on Ignite's existing 18.x version. Dependency audit reported 23 advisories (16 high, six moderate, one low), down from the original Ignite lockfile's 25; no critical advisories. Those remaining website dependencies were not broadly migrated as part of moving Sol. Production deployment/configuration still requires the Vercel steps above and has not been verified for this branch. The existing live Sol and Ignite projects remain available during review.
