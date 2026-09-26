# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**오늘의 프렌즈의 말** — a static, bilingual (Kor/Eng) fortune-draw web app themed on Friends Season 1. The user picks one of six Central Perk mugs and gets a real script line plus a fortune. Plain HTML/CSS/JS: no build step, package manager, linter, or test suite.

## Running

```bash
open index.html                 # works directly from file://
python3 -m http.server 8000     # or serve at http://localhost:8000
```

Quick data sanity check (episode count / fortune count):

```bash
node -e 'global.window={};require("./fortunes.js");const E=window.EPISODES;console.log(E.length,E.reduce((a,e)=>a+e.fortunes.length,0))'
```

## Architecture

Scripts are loaded as classic `<script>` tags in order: `fortunes.js` sets the global `window.EPISODES`, then `app.js` reads it at load time. No modules — keep that order and keep data on `window`.

### Data shape (`fortunes.js`)

```js
{
  code: "S01E01",                       // shown as-is in the card footer
  title: "The One Where ...",
  moment: { ko: "...", en: "..." },
  lucky:  { ko: "...", en: "..." },
  fortunes: [[grade, ko, en, line], ...], // grade 1–5 → GRADE_LABEL + coffee-cup count in app.js
}
// line = { who: { en, ko }, en: "real script line", ko: "Korean translation" } — rendered as a blockquote
```

Every fortune grows out of a real line from the Season 1 scripts at https://edersoncorbari.github.io/friends-scripts/season/0101.html … 0124.html. Keep `line.en` verbatim (only leading/trailing filler like "Okay," trimmed) and quote short lines only.

Currently 24 episodes / 200 fortunes. `lucky` is kept in the data but no longer rendered.

### Logic (`app.js`)

- `POOL` flattens every episode's fortunes into `{ ep, grade, ko, en, line }` once at load.
- Clicking a `.mug` calls `draw(mug)`: picks a random index (rerolling only if it equals the previous one), marks the mug `.chosen`, then after 500ms renders the card, hides `#pick`, and shows `#result` and `#again`. The mug you pick does not affect the result.
- `reset()` (the "Pick again" button) hides the card and brings the mugs back.
- `render()` fills `#result` via `innerHTML`: a `.card` box holding only the ☕ grade meter and the line (biggest English, small Korean translation, speaker), then outside the box the fortune (English large, Korean small) and a one-line episode `code · title` (`moment` is not shown). Every data string goes through `escapeHtml()` — keep doing so for any new field.

### Animation timing (JS ↔ CSS coupling)

| JS delay | CSS counterpart |
|---|---|
| 500ms before showing the card | `.mug.chosen` `jiggle` animation `0.5s` |

The result block (`.result`) fades in with the `rise` animation (0.5s, CSS only). Change both sides together. Under `prefers-reduced-motion`, CSS disables the animations but the JS delay still applies.

### Styling (`style.css`)

- Dark theme only (no light mode). Colors are CSS custom properties on `:root`; `--bg` matches the logo image's black (#060407) so the image blends in.
- `.logo` shows `images/friends-bg.jpg` (FRIENDS logo cropped from the user's image, copyright strip removed) with a radial mask to fade its edges.
- Mugs are pure CSS (`.body`, `.handle`, `.saucer` spans); colors cycle yellow / blue / red via `:nth-child(3n…)`. Six in a row, three per row at ≤480px.
- `[hidden] { display: none !important; }` is needed because `.result` sets `display: flex`.
- Fonts: Gowun Batang (Korean) and Fraunces (English) from Google Fonts, Georgia fallback.
