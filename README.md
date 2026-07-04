Astro.js-based personal website.
All contents are fictional.

## Content

Blog and diary entries live under `src/content/`. Each entry’s content collection `id` is its path under that folder, without the file extension:

- Blog: `blog/YYYY/MM/DD` (e.g. `blog/2026/07/04` for `src/content/blog/2026/07/04.md`)
- Diary: `diary/YYYY/MM/DD` (e.g. `diary/2026/07/04` for `src/content/diary/2026/07/04.md`)

Public URLs use the same path: `/blog/2026/07/04/`, `/diary/2026/07/04/`.

## Development

### Commands

#### Run the website locally

`npm run dev`

#### Run to format

`npx prettier . --write`

## Useful References

[ASCII Art Generator](https://coddy.tech/tools/ascii-art-generator)

### Astro Links

https://docs.astro.build/en/guides/markdown-content/
