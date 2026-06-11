# librarium-site

Marketing and documentation website for [librarium](https://github.com/jkudish/librarium), the meta harness for research queries.

Static site built with Astro 5 and Tailwind CSS v4. No JS framework; the landing page terminal animation is vanilla JS with a static fallback for no-JS and `prefers-reduced-motion`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs static HTML to `dist/`.

## Structure

- `src/pages/index.astro` — landing page
- `src/content/docs/*.md` — docs content (sourced from the librarium README and provider-development guide; keep in sync when CLI behavior changes)
- `src/layouts/` — base + docs layouts
- `src/styles/global.css` — Tailwind theme and prose styles
- `mockups/` — design exploration mockups (untracked)
