# CLAUDE.md

## Tech Stack

- Plain HTML, CSS and JavaScript only.
- No frameworks or libraries (no React, Vue, Tailwind, jQuery, etc.).
- No build step: files are served exactly as written, so opening the HTML in a browser is enough.

## About the Project

"P6 Science Lab": a web portal of small interactive tools for Singapore Primary 6 pupils, based on the PSLE Science syllabus (2023 MOE Primary Science syllabus).

- Content and wording must follow the MOE Primary Science syllabus. Use the terms pupils learn in class (e.g. "chemical potential energy", "frictional force").
- Mark whether a topic is in the Standard track, the Foundation track or both.
- Keep language simple and friendly for 11–12 year olds.

## Project Structure

```
/
├── CLAUDE.md                  # This file: guidance for Claude
├── index.html                 # Portal home page: tool cards grouped by syllabus theme
├── css/style.css              # Shared styles; all colours are CSS variables for both themes
├── js/theme.js                # Light/dark toggle, shared by every page
├── js/friction.js             # Friction Ramp tool logic
├── js/energy.js               # Energy Conversion tool logic and example data
├── js/spring.js               # Spring Stretch tool logic
├── js/gravity.js              # Drop Race (gravity and air resistance) tool logic
├── js/pendulum.js             # Swinging Pendulum tool logic
└── tools/
    ├── friction/index.html    # Friction Ramp tool page
    ├── spring/index.html      # Spring Stretch tool page
    ├── gravity/index.html     # Drop Race tool page
    ├── pendulum/index.html    # Swinging Pendulum tool page
    └── energy/index.html      # Energy Conversion tool page
```

To add a tool: create `tools/<name>/index.html` and `js/<name>.js`, copy the header and the inline theme script from an existing tool page, and add a card to `index.html`.

Update this section when files or folders are added.

**Version numbers on file links:** every page loads its CSS and JS with `?v=N` on the end (e.g. `js/gravity.js?v=10`). This forces browsers to fetch the new file instead of reusing an old saved copy. When you change any CSS or JS file, raise `N` in all the HTML pages.

## Key Requirements

1. **Responsive on every page.** Every page must work on desktop, tablet and phone.
2. **Light and dark theme.** Users can switch between a light and a dark theme. The light theme is the default.
3. **Readable text in both themes.** Text must stay easy to read, with good contrast against its background, in both the light and the dark theme. Aim for the WCAG AA standard, a common accessibility guideline: normal text should be at least 4.5 times "brighter or darker" than its background (a 4.5:1 contrast ratio), and large text at least 3:1.

## Rules for Claude

- Explain technical terms in plain language.
- Ask before making big changes.
- When something is unclear, ask rather than guess.
