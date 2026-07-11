# librarium-site

Marketing and documentation website for [librarium](https://github.com/jkudish/librarium), the meta harness for research queries. Live at [librarium.agentsy.build](https://librarium.agentsy.build).

Static site built with Astro 7 and Tailwind CSS v4. No JS framework; the landing page terminal animation is vanilla JS with a static fallback for no-JS and `prefers-reduced-motion`.

## Development

Requires Node 22.12+.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs static HTML to `dist/`.

## Deploy

```bash
npm run deploy
```

Builds and ships `dist/` to Cloudflare as an assets-only Worker (`librarium-site`) with the custom domain `librarium.agentsy.build`. Config lives in `wrangler.toml`; the Worker runs on Joey's Cloudflare account, so you need wrangler auth against that account (`CLOUDFLARE_API_TOKEN` or `wrangler login`).

There is no CI/CD — deploys are manual after merging to `main`.

## Structure

- `src/pages/index.astro` — landing page, including the animated terminal demo and install-method popovers
- `src/content/docs/*.md` — docs content
- `src/pages/docs/` — docs routes, plus `.md.ts` endpoints that serve each page as raw markdown (append `.md` to any docs URL)
- `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts` — LLM-readable site index and full docs dump
- `src/lib/docs.ts` — shared serializer used by the markdown/llms endpoints
- `src/layouts/` — base + docs layouts
- `src/components/` — header, footer, docs sidebar nav
- `src/styles/global.css` — Tailwind theme tokens (including `--text-terminal`) and prose styles
- `mockups/` — design exploration mockups (untracked)

## Conventions and gotchas

- **Docs are sourced from the librarium repo** (its `README.md` and `docs/provider-development.md`). When CLI behavior changes, sync the affected pages here — commands, flags, groups, provider counts, and examples are the usual drift points.
- **The terminal demo has two copies.** The static markup in `index.astro`'s `<code id="terminal-code">` is the no-JS/reduced-motion fallback *and* the layout-height anchor; it must match the animation's final frame (same lines, same column padding). Keep demo lines ≤ ~57 chars so the panel never scrolls horizontally on desktop.
- **`vite` is kept as a direct dev dependency.** Keep it aligned with Astro's supported Vite major so the Tailwind plugin and Astro use the same Vite line.
- **Single light color scheme**, neutral palette with an amber accent (`amber-700` links/accents, `amber-300` in terminals). Product name is lowercase `librarium` except sentence-initial.
- Page metadata, OG tags, and JSON-LD live in `src/layouts/Base.astro`.
