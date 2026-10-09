# librarium-site

Marketing and documentation website for [librarium](https://github.com/jkudish/librarium), the meta harness for research queries. Live at [librarium.agentsy.build](https://librarium.agentsy.build).

Static site built with Astro 7 and Tailwind CSS v4. No JS framework. The landing page has a large centered hero, a full-width research example with readable and JSON views, and expandable prompts. Client scripts power the example tabs, install copy control, mobile menu, and docs version navigation.

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

**The public JavaScript copy is release-ready and treats v2 as published.** That content state and green local checks do not authorize a merge or deployment; deployment remains a separate manual action. The first-party PHP package and its separate optional Firecrawl adapter retain their own unpublished/post-release status, which does not qualify the JavaScript v2 launch copy.

## Structure

- `src/pages/index.astro`: landing page, use cases, and illustrative research demo
- `public/providers/`: provider marks from LobeHub and official brand sources; attribution and license boundaries in `SOURCES.md`. These identify integrations, not endorsements; trademarks belong to their respective owners.
- `public/languages/`: JavaScript, TypeScript, PHP, and Laravel marks from Simple Icons (CC0; attribution included)
- `src/content/docs/*.md`: JavaScript v2 docs content
- `src/content/php-docs/*.md`: first-party PHP/Laravel docs, sourced from `jkudish/laravel-ai-librarium` README, configuration, public API, and tests
- `src/content/pages/`: dedicated JavaScript, CLI/MCP, and Laravel pages, the direct-provider comparison, and the Agentsy Report development field note
- `src/content/guides/`: first-query, coding-agent, and Laravel-queue guides; listed at `/guides`
- `src/content/v1-docs/*.md`: legacy snapshot from site commit `54d73e99552fcdb43b9a772c49f483a5beea4582` (`origin/main` when the v2 work began), with internal links namespaced under `/v1`
- `src/data/product.ts`: version, roster, counts, and workflows
- `src/pages/docs/`: docs routes and raw Markdown endpoints
- `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`: agent index and all current pages, guides, and both documentation sets
- `src/lib/articles.ts`: shared routes and reading lists for product pages, guides, comparison, and field notes
- `src/lib/docs.ts`: shared serializer for Markdown and llms endpoints
- `src/lib/home-markdown.ts`: build-time rendering/conversion of the actual homepage (Astro container + node-html-markdown), without a second authored copy
- `src/layouts/`: base and docs layouts
- `src/components/`: header, footer, and docs navigation
- `src/components/Icon.astro`: build-time individual SVG imports from `@phosphor-icons/core` (MIT); all UI icons use Phosphor. Provider/language marks stay authoritative brand assets, and literal CLI transcript symbols are preserved. The favicon is rasterized from Phosphor's regular magnifying glass.
- `src/styles/global.css`: Tailwind theme tokens and prose styles
- `scripts/verify-content.mjs`: factual, metadata, generated-output, and internal-link checks

## Conventions and gotchas

- **Docs are sourced from the librarium repo** (its `README.md` and `docs/provider-development.md`). When CLI behavior changes, sync the affected pages here. Commands, flags, workflows, provider counts, and examples are the usual drift points.
- **V2 is the default at `/docs`; v1 is preserved at `/v1`.** Keep route-equivalent pages where practical. Legacy pages are self-canonical, `noindex, follow`, and excluded from the sitemap so they remain accessible without competing with current docs in search.
- **PHP is first-party, not a JavaScript wrapper.** `/docs/php` has its own navigation and a JavaScript/PHP switch that preserves equivalent topics, falling back to the destination index when absent. Do not imply matching provider coverage, concurrency, durable recovery, or an included PHP MCP server.
- **Docs navigation is grouped by task.** Keep every collection entry in `DocsNav.astro`; generated-output checks catch omissions. The desktop outline and mobile disclosure use rendered headings. Copy controls progressively enhance static code and Markdown links; documentation remains readable without JavaScript.
- **Every page has Markdown.** Homepage: `/index.md`. Docs: `/docs/<slug>.md`, `/docs/php/<slug>.md`, `/v1/<slug>.md` (`index.md` for each root). Product pages, guides, comparison, and stories append `.md` to their HTML path; the guides index is `/guides/index.md`. Complete docs bundles: `/docs/all.md`, `/docs/php/all.md`, `/v1/all.md`. `/llms.txt` indexes them; `/llms-full.txt` includes all current pages in full, with legacy linked separately. Each reading page has a visible Markdown link.
- **Examples describe actual boundaries.** Laravel AI SDK tool/agent signatures are checked against upstream `laravel/ai` v0.10.3 and the PHP package API; examples are application-owned, not built-in agents. PHP examples have not been executed in this site orb. The Agentsy field note describes demonstrated backend dogfood evidence, not a deployed reporting product or measured customer outcome; revalidate that boundary before publication. It is grounded in the implementation review for `jkudish/agentsy-platform` PR #4. No PlanMode integration claim is inferred from this example.
- **Product facts are centralized.** `src/data/product.ts` owns the version, counts, profile roster, and workflow summaries used by the site. `npm test` checks those facts against the docs and generated output.
- **The homepage demo uses captured provider output.** `src/data/provider-display-fixture.json` preserves excerpts, citations, timing, and provenance for five successful deep-research responses about Google Analytics alternatives. `src/data/research-demo.ts` derives the readable and JSON views; the JSON is display data, not the full API response schema. Playback makes no provider calls. The original Exa authentication failure remains in the capture history. The older offline fixture replay remains at `public/demo.gif`.
- **`vite` is kept as a direct dev dependency.** Keep it aligned with Astro's supported Vite major so the Tailwind plugin and Astro use the same Vite line.
- **Light and dark themes** follow the system preference until the user chooses with the header toggle. Keep both themes readable, including build-time rendered report content. Product name is lowercase `librarium` except sentence-initial.
- Page metadata, OG tags, and JSON-LD live in `src/layouts/Base.astro`.
