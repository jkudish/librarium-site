import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  PRODUCT_VERSION,
  PROFILE_COUNT,
  PROVIDER_COUNT,
} from "../data/product";

export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, "") ?? "";
  const docs = (await getCollection("docs")).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const docLines = docs
    .map((entry) => {
      return `- [${entry.data.title}](${base}/docs/${entry.id}.md): ${entry.data.description}`;
    })
    .join("\n");

  const body = `# librarium ${PRODUCT_VERSION}

> The meta harness for research queries. Ask once, run the query across selected providers, and collect the results in one place.

Librarium v2 has ${PROVIDER_COUNT} built-in providers, ${PROFILE_COUNT} public profiles, and four built-in workflows: \`quick\`, \`deep\`, \`visibility\`, and \`all\`.

Install it with \`npm install -g librarium\`, run \`librarium init\`, then use \`librarium doctor\` to check provider configuration. Provider calls can incur charges. Review provider pricing before running a broad workflow. Review v1 migration output before saving a v2 config.

For answer-engine visibility work, \`--group visibility\` compares six SearchAPI-collected consumer surfaces with three first-party API baselines. The six surfaces share one collector. Agreement is correlated visibility evidence, not independent corroboration or parity with a particular account.

API output, provider-reported citations and usage, collected consumer observations, normalized source overlap, correlation, and independent corroboration are distinct claims. Librarium records provenance. It does not serialize a universal confidence score.

## Docs

${docLines}

Each docs page is also available as raw markdown at the links above. The docs index is ${base}/docs/index.md.

Legacy v1 documentation is preserved at ${base}/v1 and marked as legacy. Use the v2 links above unless maintaining a v1 installation.

## Source

- [GitHub](https://github.com/jkudish/librarium): source, issues, releases
- [npm](https://www.npmjs.com/package/librarium): package
- [Full docs as one file](${base}/llms-full.txt)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
