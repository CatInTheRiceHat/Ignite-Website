# Ignite learner dashboard

This adds a learning menu, an illustrated welcome panel, and clearer course cards to the existing Boost dashboard. Moodle's Course overview, Recently accessed courses, and Timeline blocks provide each learner's actual courses, completion information, and upcoming work. The two Text blocks contain navigation and welcome copy only.

The [Ignite Program Style Guide](../Ignite%20Program%20Style%20Guide.md) governs the appearance: cream `#FFF8F0`, orange `#F07B2A`, dark-orange hover `#D46A20`, charcoal `#1A1A2E`, Rammetto One display titles, Poppins headings and navigation, and Nunito body text. The image-led welcome uses white display text over the existing classroom artwork with a dark overlay for contrast. Rounded cards, outline icons, orange actions, and Ignite's existing mascot remain part of the design. Khan Academy informs the learning layout.

## Apply in Moodle

1. Replace **Site administration → Appearance → Themes → Boost → Advanced settings → Raw SCSS** with the complete contents of [raw.scss](raw.scss). Keep the existing preset. Save and purge theme caches. This file includes the existing course catalog and classroom fallback styles.
2. Open **Site administration → Appearance → Default Dashboard page** and turn on edit mode. Add two **Text** blocks to the **main content** region, with blank block titles. Use the editor's HTML/source view to paste [dashboard-navigation.html](dashboard-navigation.html) into the first and [dashboard-welcome.html](dashboard-welcome.html) into the second. Keep one copy of each block.
3. Below these, arrange **Course overview**, optionally **Recently accessed courses**, and **Timeline**, in that order. Keep **Calendar** or **Upcoming events** in the block drawer. The sidebar layout activates only when both Text blocks are in the main content region. Turn edit mode off to see it; edit mode preserves Moodle's normal block controls and arrangement.
4. Ensure **My courses** is enabled under **Appearance → Navigation**, since the menu and welcome button link there. The links target Ignite's Moodle origin; update them if the installation moves.
5. Check with a learner account, including one with no enrolled courses. Progress requires Moodle completion tracking and configured activity completion; courses without progress keep Moodle's normal display. A learner without due work should see the native Timeline empty state. No additional statistics or streaks are fabricated.

The Default Dashboard applies to new users. Existing users can use **Reset page to default** on their own dashboards. Moodle also provides **Reset Dashboard for all users** on the default dashboard page; that replaces existing personal arrangements, so use it only when you intend to reset those customizations. Changing these local files alone does not update the live Moodle settings.

## Validation and limits

The preview uses sample course data and progress, explicitly labelled as a layout preview. The production Text blocks do not include the sample values. Styles follow Moodle 5.2.3's native `core/block`, `core_course/coursecard`, and `block_myoverview` markup; authenticated Ignite dashboard markup still needs a final live check. The layout stacks on tablets and phones, retains native filters and menus, and does not change course activities, quizzes, grading, or admin pages.

This is a theme and block arrangement, so Khan Academy's custom mastery system, streaks, and next-lesson selection are separate future features. The current dashboard relies on Moodle for learning state and permissions.

References: [Moodle Dashboard](https://docs.moodle.org/502/en/Dashboard), [Text blocks](https://docs.moodle.org/502/en/Text_block), [Activity completion](https://docs.moodle.org/502/en/Activity_completion), and [Khan Academy Learner Home](https://support.khanacademy.org/hc/en-us/articles/360030629852-What-is-my-Learner-Home-page-and-what-can-I-do-there).
