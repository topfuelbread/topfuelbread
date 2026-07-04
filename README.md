Astro.js-based personal website.
All contents are fictional.

# AI Instructions

- prioritize clean code and efficiency. Do minimal (as in clean and optimized) work.
- refer to Astro symmentics every time.
- do not waste tokens on extra verifications that I can easily do
- when completed a task, if it's not a small task, log the changes at the bottom of this README.md file. I added # AI Outputs section for you.

---

# TODO List

(problem resolved — see AI Outputs 2026-07-04 TWT single datetime)

# Designs

### Static Content

Blog and diary entries live under `src/content/`. Each entry’s content collection `id` is its path under that folder, without the file extension:

- Blog: `blog/YYYY/MM/DD` (e.g. `blog/2026/07/04` for `src/content/blog/2026/07/04.md`)
- Diary: `diary/YYYY/MM/DD` (e.g. `diary/2026/07/04` for `src/content/diary/2026/07/04.md`)
- Twt: `twt/YYYY/MM/DD/HHMM` (e.g. `twt/2026/07/04/1446` for `src/content/twt/2026/07/04/1446.md` — 2:46pm on that day)

Public URLs use the same path: `/blog/2026/07/04/`, `/diary/2026/07/04/`, `/twt/2026/07/04/`.

Twt frontmatter: `title`, optional `tags`, optional `asciiArt`. Datetime comes from the file path only — no `id` or `pubDate` fields.

# Development

### Commands

#### Run the website locally

`npm run dev`

#### Run to format

`npx prettier . --write`

## Useful References

[ASCII Art Generator](https://coddy.tech/tools/ascii-art-generator)

### Astro Links

https://docs.astro.build/en/guides/markdown-content/

# AI Outputs

### 2026-07-04 — TWT single datetime

- Datetime is now derived from file path (`twt/YYYY/MM/DD/HHMM`) via `parseTwtId()` in `src/lib/twt.ts`
- Removed `id` and `pubDate` from twt schema and all 24 twt markdown files
- Sorting, day grouping, and `/twt/YYYY/MM/DD/` routes use `entry.id` parsing; `title` remains freeform headline

### 2026-07-04 — TWT collection and migration

- Added `twt` content collection (`title`, optional `tags`/`asciiArt`) under `src/content/twt/`
- New components: `Twt.astro`, `TwtsList.astro`, `TwtsForDay.astro`
- New pages: `/twts/` (5 latest), `/twt/YYYY/MM/DD/` (daily timeline)
- Blog post pages embed that day's twts; home page shows `main`-tagged twts instead of diary
- Navigation: added **TWT** link
- Migrated 4 diary entries → twts with `main` tag; split ~20 blog time-sections into twts; blog topic posts retained
