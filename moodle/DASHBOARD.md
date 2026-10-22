# Ignite learner dashboard

This adds a learning menu, an illustrated welcome panel, and clearer course cards to the existing Boost dashboard. Moodle's Course overview and optional Recently accessed courses blocks provide each learner's actual courses and completion information. Timeline is optional if courses later use scheduled activities. The two Text blocks contain navigation and welcome copy only.

The [Ignite Program Style Guide](../Ignite%20Program%20Style%20Guide.md) governs the appearance: cream `#FFF8F0`, orange `#F07B2A`, dark-orange hover `#D46A20`, charcoal `#1A1A2E`, Rammetto One display titles, Poppins headings and navigation, and Nunito body text. The image-led welcome uses white display text over the existing classroom artwork with a dark overlay for contrast. Rounded cards, outline icons, orange actions, and Ignite's existing mascot remain part of the design. Khan Academy informs the learning layout.

## Apply in Moodle

SSH deployment is configured for the DigitalOcean Moodle server. For routine code updates, use `npm run moodle:check` and `npm run moodle:deploy`; see [SYNC.md](SYNC.md). Install missing navigation and welcome panels with `npm run moodle:dashboard:check`, then `npm run moodle:dashboard:install`. This installs panels in the main content region on the default dashboard and existing personal dashboards, enables My courses, and preserves the existing blocks and personal layouts. The initial installation was completed October 22, 2026. No dashboard reset is needed.

The following admin-interface steps are a manual fallback for an installation without SSH deployment:

1. Replace **Site administration → Appearance → Themes → Boost → Advanced settings → Raw SCSS** with the complete contents of [raw.scss](raw.scss). Keep the existing preset. Under **Boost → General settings**, set **Brand colour** to **`#F07B2A`** (RGB **240, 123, 42**); that setting can override the preset's primary colour for native Moodle controls. Save and purge theme caches. This file includes the existing course catalog and classroom fallback styles.
2. Open **Site administration → Appearance → Default Dashboard page** and turn on edit mode. Add two **Text** blocks to the **main content** region, with blank block titles. Use the editor's HTML/source view to paste [dashboard-navigation.html](dashboard-navigation.html) into the first and [dashboard-welcome.html](dashboard-welcome.html) into the second. Keep one copy of each block.
3. Below these, place **Course overview** and optionally **Recently accessed courses**. Add **Timeline**, **Calendar**, or **Upcoming events** only if courses use scheduled activities; the current preview focuses on courses. The sidebar layout activates only when both Text blocks are in the main content region. Turn edit mode off to see it; edit mode preserves Moodle's normal block controls and arrangement.
4. Ensure **My courses** is enabled under **Appearance → Navigation**, since the menu and welcome button link there. The links target Ignite's Moodle origin; update them if the installation moves.
5. Check with a learner account, including one with no enrolled courses. Progress requires Moodle completion tracking and configured activity completion; courses without progress keep Moodle's normal display. If Timeline is enabled, learners without due work should see its native empty state. No additional statistics or streaks are fabricated.

When using only the manual fallback, Default Dashboard changes apply to new users. Existing users can use **Reset page to default** on their own dashboards. Moodle also provides **Reset Dashboard for all users** on the default dashboard page; that replaces existing personal arrangements, so use it only when you intend to reset those customizations. The SSH installer updates existing dashboards without that reset. Local changes reach Moodle when the deployment command runs.

## Validation and limits

Dashboard action links use the same straight right arrow as the website and Sol. Reapply both Text block snippets along with Raw SCSS when updating these icons. The `.ignite-redirect-icon` class draws the shared outline arrow using a CSS mask, so it does not depend on the editor retaining SVG markup.

The preview uses sample course data and progress, explicitly labelled as a layout preview. The production Text blocks do not include the sample values. Styles follow Moodle 5.2.3's native `core/block`, `core_course/coursecard`, and `block_myoverview` markup. On October 22, 2026, native block HTML was rendered directly from the live installation in the administrator's dashboard context and checked in desktop and mobile browsers. This checks the server-rendered layout; interactive course loading still needs a normal signed-in browser check. The dashboard uses the available screen width with responsive gutters, and course cards fill as many columns as fit while keeping each card at least 15rem wide when space permits. The layout stacks on tablets and phones, retains native filters and menus, and does not change course activities, quizzes, grading, or admin pages.

This is a theme and block arrangement, so Khan Academy's custom mastery system, streaks, and next-lesson selection are separate future features. The current dashboard relies on Moodle for learning state and permissions.

References: [Moodle Dashboard](https://docs.moodle.org/502/en/Dashboard), [Text blocks](https://docs.moodle.org/502/en/Text_block), [Activity completion](https://docs.moodle.org/502/en/Activity_completion), and [Khan Academy Learner Home](https://support.khanacademy.org/hc/en-us/articles/360030629852-What-is-my-Learner-Home-page-and-what-can-I-do-there).
