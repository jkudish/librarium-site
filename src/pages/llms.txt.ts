import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getArticles } from "../lib/articles";
import {
  PRODUCT_VERSION,
  PROFILE_COUNT,
  PROVIDER_COUNT,
} from "../data/product";

export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, "") ?? "";
  const articleLines = (await getArticles()).map(({ path, entry }) =>
    `- [${entry.data.title}](${base}/${path}.md): ${entry.data.description}`,
  ).join("\n");
  const docs = (await getCollection("docs")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const phpDocs = (await getCollection("phpDocs")).sort((a, b) => a.data.order - b.data.order);
  const phpLines = phpDocs.map((entry) =>
    `- [${entry.data.title}](${base}/docs/php/${entry.id}.md): ${entry.data.description}`,
  ).join("\n");

  const docLines = docs
    .map((entry) => {
      return `- [${entry.data.title}](${base}/docs/${entry.id}.md): ${entry.data.description}`;
    })
    .join("\n");

  const body = `# librarium ${PRODUCT_VERSION}

> The meta harness for research queries. Ask once, run the query across selected providers, and collect the results in one place.

Librarium has first-party JavaScript/TypeScript and PHP/Laravel implementations. They have distinct provider catalogs, setup, and execution behavior; do not assume feature parity.

## JavaScript v2

The JavaScript implementation has ${PROVIDER_COUNT} built-in providers, ${PROFILE_COUNT} public profiles, and four built-in workflows: \`quick\`, \`deep\`, \`visibility\`, and \`all\`.

The v2 distribution is published. npm installs require Node.js 22.12.0 or newer: run \`npm install -g librarium\`, then verify that \`librarium --version\` reports major version 2. Homebrew and standalone binaries include their own runtime.

Run \`librarium init\`, then use offline \`librarium doctor\` and \`librarium plan\` before provider work. Credential presence is not authentication; only \`doctor --live\` tests connectivity and may incur charges. New requests default to concurrent, awaited \`quick\` / \`sync\`, including raw \`exa/search\`. Review provider pricing and v1 migration output before execution or saving config.

Refinement, research, synthesis, and verification share a paid-attempt wallet. Known failure costs count; resume preserves prior spend and the original deadline. Neither budget flag guarantees the final bill.

MCP research and async checks return compact indexes. Use \`get_results\` content/citation pages and follow \`nextCursor\` with unchanged filters for complete evidence. Completed evidence is readable while other providers remain pending. Static profile discovery does not execute custom code or authenticate. Amp uses a User Skill and the v2 CLI, not a plugin.

For answer-engine visibility work, \`--group visibility\` compares six SearchAPI-collected consumer surfaces with three first-party API baselines. The six surfaces share one collector. Agreement is correlated visibility evidence, not independent corroboration or parity with a particular account.

API output, provider-reported citations and usage, collected consumer observations, normalized source overlap, correlation, and independent corroboration are distinct claims. Librarium records provenance. It does not serialize a universal confidence score.

## JavaScript docs

${docLines}

Each docs page is also available as raw markdown at the links above. The docs index is ${base}/docs/index.md.

Legacy v1 documentation is preserved at ${base}/v1 and marked as legacy. Use the v2 links above unless maintaining a v1 installation.

## PHP / Laravel

The first-party package is \`jkudish/laravel-ai-librarium\`, requiring PHP 8.4, Laravel 13, and Laravel AI SDK ^1.0.1. Install it with \`composer require jkudish/laravel-ai-librarium\`.

Use the Laravel facade's \`query()->using()->preview()\` before \`run()\` or \`queue()\`. PHP configures 29 flat Profile IDs: 23 baseline entries with \`enabled: true\`, plus six disabled-by-default DataForSEO entries: \`dataforseo-chatgpt\`, \`dataforseo-chatgpt-live\`, \`dataforseo-gemini\`, \`dataforseo-gemini-live\`, \`dataforseo-google-ai-mode\`, and \`dataforseo-google-ai-mode-live\`. DataForSEO opt-in requires \`DATAFORSEO_LOGIN\`, \`DATAFORSEO_PASSWORD\`, explicit enablement of an exact Profile ID, and required location/language controls. These six do not join \`quick\` or \`visibility\`; paid live acceptance remains pending. PHP uses sequential execution under a shared deadline, encrypted Laravel jobs, transient status, and application-owned persistence. \`php artisan librarium:query --agent\` is preview-only without explicit \`--run\` or \`--queue\`; it is not an MCP server. Hard cost ceilings require complete, current, conservative, single-currency quotes. The package fake retains Profile compilation and validation without provider calls.

${phpLines}

## Product pages, guides, and field notes

- [Guides index](${base}/guides/index.md)
${articleLines}

## Markdown for agents

- [Homepage](${base}/index.md)
- [All JavaScript v2 docs](${base}/docs/all.md)
- [All PHP docs](${base}/docs/php/all.md)
- [All legacy JavaScript v1 docs](${base}/v1/all.md)
- [All current pages and documentation](${base}/llms-full.txt)

## Source

- [GitHub](https://github.com/jkudish/librarium): source, issues, releases
- [PHP GitHub](https://github.com/jkudish/laravel-ai-librarium): Laravel package source and issues
- [npm](https://www.npmjs.com/package/librarium): package
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
