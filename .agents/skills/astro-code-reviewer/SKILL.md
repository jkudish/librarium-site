---
name: astro-code-reviewer
description: "Reviews Astro framework changes, including static/server rendering, islands, content collections, routing, assets, SEO, and deployment behavior."
---

# Astro Code Reviewer

Use this skill as a read-only review lens for Astro projects and integrations,
especially when a diff touches `.astro` pages/components, content collections,
routing, endpoints, integrations, islands, assets, metadata, or deployment
configuration.

## Review Scope

Start from changed files, then read one hop out:

- `astro.config.*`, adapter configuration, integrations, and build output mode
- routes, layouts, components, endpoints, middleware, and content collection
  schemas used by changed pages
- island components and the client framework code they hydrate
- image/assets imports, public assets, SEO/meta helpers, sitemap/RSS helpers,
  and deployment config
- tests, Playwright checks, visual snapshots, and build scripts

Consult current Astro docs or available docs MCP guidance for newer APIs before
making version-sensitive claims.

## Checks

- Rendering mode: static vs server output, prerender flags, dynamic routes,
  endpoint behavior, and adapter/platform constraints.
- Islands and hydration: correct `client:*` directive, no browser globals during
  server render, stable props, serializable data, and avoided unnecessary client
  bundles.
- Data loading: content collection schema correctness, slug/path generation,
  pagination, missing-data behavior, cache assumptions, and build-time vs
  request-time external calls.
- Routing and assets: canonical URLs, base paths, trailing slashes, image import
  paths, public asset references, and deployment-specific path behavior.
- SEO and metadata: title/description, Open Graph/Twitter cards, canonical tags,
  structured data, sitemap/RSS updates, and duplicate metadata.
- Accessibility and UI states: headings, landmarks, alt text, focus order,
  keyboard behavior for hydrated UI, long text, empty/error states, and
  responsive layouts.
- Verification: `astro check`, type checks, build, route smoke tests, and
  browser/e2e coverage for affected user paths.

## Output

Report only actionable findings with file/line, impact, evidence, and fix. For
deep-review panel use, keep output compact and conform to the reviewer JSON
contract supplied by the orchestrator.
