# librarium-site

Marketing and documentation website for [librarium](https://github.com/jkudish/librarium), the meta harness for research queries. Live at [librarium.agentsy.build](https://librarium.agentsy.build).

Static site built with Astro 7 and Tailwind CSS v4. No JS framework. The landing page terminal card is a static, reviewed fixture rendering. The only client script copies the install command.

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

There is no CI/CD. Deploys are manual after merging to `main`.

## Structure

- `src/pages/index.astro`: landing page and reviewed offline fixture demo
- `src/content/docs/*.md`: docs content
- `src/content/v1-docs/*.md`: legacy snapshot from site commit `54d73e99552fcdb43b9a772c49f483a5beea4582` (`origin/main` when the v2 hold branch began), with internal links namespaced under `/v1`
- `src/data/product.ts`: pinned source SHA, version, roster, counts, and workflows
- `src/pages/docs/`: docs routes and raw Markdown endpoints
- `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`: LLM-readable site index and full docs dump
- `src/lib/docs.ts`: shared serializer for Markdown and llms endpoints
- `src/layouts/`: base and docs layouts
- `src/components/`: header, footer, and docs navigation
- `src/styles/global.css`: Tailwind theme tokens and prose styles
- `scripts/verify-content.mjs`: factual, metadata, generated-output, and internal-link checks

## Conventions and gotchas

- **Docs are sourced from the librarium repo** (its `README.md` and `docs/provider-development.md`). When CLI behavior changes, sync the affected pages here. Commands, flags, workflows, provider counts, and examples are the usual drift points.
- **V2 is the default at `/docs`; v1 is preserved at `/v1`.** Keep route-equivalent pages where practical. Legacy pages are self-canonical, `noindex, follow`, and excluded from the sitemap so they remain accessible without competing with current docs in search.
- **RC18 facts are centralized.** `src/data/product.ts` pins the source SHA, package version, counts, profile roster, and workflow summaries used by the visual site. `npm test` checks those facts against durable docs and generated output.
- **The terminal demo is an offline fixture replay.** `public/demo.gif` is copied from the source repository's reviewed RC18 media. Do not replace it with fabricated live-provider timing, citations, cost, or output.
- **`vite` is kept as a direct dev dependency.** Keep it aligned with Astro's supported Vite major so the Tailwind plugin and Astro use the same Vite line.
- **Single light color scheme**, neutral palette with an amber accent (`amber-700` links/accents, `amber-300` in terminals). Product name is lowercase `librarium` except sentence-initial.
- Page metadata, OG tags, and JSON-LD live in `src/layouts/Base.astro`.
