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
├── js/friction.js             # Friction Ramp tool logic
├── js/energy.js               # Energy Conversion tool logic and example data
├── js/spring.js               # Spring Stretch tool logic
├── js/gravity.js              # Drop Race (gravity and air resistance) tool logic
├── js/pendulum.js             # Swinging Pendulum tool logic
├── js/photosynthesis.js       # Photosynthesis Lab tool logic
├── js/foodweb.js              # Food Chain and Food Web tool logic and habitat data
├── js/adaptations.js          # Adaptations Explorer tool logic and organism data
└── tools/
    ├── friction/index.html    # Friction Ramp tool page
    ├── spring/index.html      # Spring Stretch tool page
    ├── gravity/index.html     # Drop Race tool page
    ├── pendulum/index.html    # Swinging Pendulum tool page
    ├── photosynthesis/index.html  # Photosynthesis Lab tool page
    ├── foodweb/index.html     # Food Chain and Food Web tool page
    ├── adaptations/index.html # Adaptations Explorer tool page
    └── energy/index.html      # Energy Conversion tool page
```

To add a tool: create `tools/<name>/index.html` and `js/<name>.js`, copy the header and the inline theme script from an existing tool page, and add a card to the right level section of `index.html`, with a level tag.

Update this section when files or folders are added.

**Version numbers on file links:** every page loads its CSS and JS with `?v=N` on the end (e.g. `js/gravity.js?v=14`). This forces browsers to fetch the new file instead of reusing an old saved copy. When you change any CSS or JS file, raise `N` in all the HTML pages.

## Key Requirements

1. **Responsive on every page.** Every page must work on desktop, tablet and phone.
2. **Light and dark theme.** Users can switch between a light and a dark theme. The light theme is the default.
3. **Readable text in both themes.** Text must stay easy to read, with good contrast against its background, in both the light and the dark theme. Aim for the WCAG AA standard, a common accessibility guideline: normal text should be at least 4.5 times "brighter or darker" than its background (a 4.5:1 contrast ratio), and large text at least 3:1.

## Rules for Claude

- Explain technical terms in plain language.
- Ask before making big changes.
- When something is unclear, ask rather than guess.
