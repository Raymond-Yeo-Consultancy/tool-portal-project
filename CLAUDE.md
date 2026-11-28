# CLAUDE.md

## Tech Stack

- Plain HTML, CSS and JavaScript only.
- No frameworks or libraries (no React, Vue, Tailwind, jQuery, etc.).
- No build step: files are served exactly as written, so opening the HTML in a browser is enough.

## About the Project

"Primary Science Lab": a web portal of small interactive tools for Singapore Primary 3 to 6 pupils, based on the 2023 MOE Primary Science syllabus.

- Content and wording must follow the MOE Primary Science syllabus. Use the terms pupils learn in class (e.g. "chemical potential energy", "frictional force").
- Every tool shows its level (Primary 3, 4, 5 or 6) on its home-page card and on its own page.
- For Primary 5 and 6 tools, also mark whether the topic is in the Standard track, the Foundation track or both. (These tracks start in Primary 5.)
- Keep language simple and friendly for the tool's level: 9 year olds for Primary 3, up to 12 year olds for Primary 6.

## Project Structure

```
/
├── CLAUDE.md                  # This file: guidance for Claude
├── index.html                 # Portal home page: tool cards grouped by level, then syllabus theme
├── css/style.css              # Shared styles; all colours are CSS variables for both themes
├── js/theme.js                # Light/dark toggle, shared by every page
├── js/portal.js               # Home page level filter (All, P3, P4, P5, P6)
├── js/activities.js           # Shared sort / order / match activities used by several tools
├── js/<tool>.js               # One script per tool: its logic and data
├── tools/<tool>/index.html    # One page per tool
├── quiz/index.html            # Revision Quiz page
├── quiz/answers.html          # Teacher's answer sheet: every question, answer and explanation; printable
├── js/quiz.js                 # Quiz engine
├── js/answers.js              # Builds the teacher's answer sheet and runs the question checks
├── js/questions/index.js      # List of quiz topics (one per tool) and the question checks
└── js/questions/<tool>.js     # One question file per topic
```

Tools (`<tool>` is the folder and script name):

| Level | `<tool>` | Tool |
|---|---|---|
| P3 | `classify` | Living Things Sorter |
| P3 | `materials` | Materials Tester |
| P3 | `lifecycles` | Life Cycles |
| P3 | `magnets` | Magnets Lab |
| P4 | `matter` | States of Matter |
| P4 | `shadows` | Light and Shadows |
| P4 | `heat` | Heat and Temperature |
| P4 | `plantparts` | Plant Parts |
| P4 | `digestion` | Digestive Journey |
| P5 | `watercycle` | Water Cycle and Changes of State |
| P5 | `plantrepro` | Plant Reproduction |
| P5 | `transport` | Plant Transport |
| P5 | `heartlungs` | Heart and Lungs |
| P5 | `cells` | Cells |
| P5 | `circuits` | Electric Circuits |
| P6 | `friction` | Friction Ramp |
| P6 | `spring` | Spring Stretch |
| P6 | `gravity` | Drop Race (gravity and air resistance) |
| P6 | `energy` | Energy Conversion |
| P6 | `pendulum` | Swinging Pendulum |
| P6 | `photosynthesis` | Photosynthesis Lab |
| P6 | `foodweb` | Food Chain and Food Web |
| P6 | `adaptations` | Adaptations Explorer |

To add a tool: create `tools/<name>/index.html` and `js/<name>.js`, copy the header and the inline theme script from an existing tool page, and add a card to the right level section of `index.html`, with a level tag.

Update this section when files or folders are added.

## Quiz Questions

Each topic (one per tool) has at least 30 questions: 10 easy (recall a fact), 10 medium (explain or apply) and 10 hard (PSLE-style thinking, such as reading results or spotting a fair test). A topic is offered in the quiz only when `ready: true` is set for it in `js/questions/index.js`.

Rules for writing questions:

1. Four options, exactly one correct. The others must be clearly wrong at that level. No "all of the above" or "none of the above", no trick wording.
2. The question must be answerable from that topic's tool page, in the wording pupils see there.
3. Any number in a question comes from the tool's own model, not from working it out by hand.
4. Avoid facts that depend on details the question does not give.
5. Every question has a `why`: one or two sentences that teach the idea.
6. Text only: the question must make sense without a picture.

Before a topic is marked ready: open `quiz/answers.html` and confirm the automatic checks pass, and have every question answered by an independent reviewer who cannot see the answer key. Fix or replace any question the reviewer gets "wrong" or flags as unclear.

**Version numbers on file links:** every page loads its CSS and JS with `?v=N` on the end (e.g. `js/gravity.js?v=32`). This forces browsers to fetch the new file instead of reusing an old saved copy. When you change any CSS or JS file, raise `N` in all the HTML pages (including `quiz/index.html` and `quiz/answers.html`).

## Key Requirements

1. **Responsive on every page.** Every page must work on desktop, tablet and phone.
2. **Light and dark theme.** Users can switch between a light and a dark theme. The light theme is the default.
3. **Readable text in both themes.** Text must stay easy to read, with good contrast against its background, in both the light and the dark theme. Aim for the WCAG AA standard, a common accessibility guideline: normal text should be at least 4.5 times "brighter or darker" than its background (a 4.5:1 contrast ratio), and large text at least 3:1.

## Rules for Claude

- Explain technical terms in plain language.
- Ask before making big changes.
- When something is unclear, ask rather than guess.
