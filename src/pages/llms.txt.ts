import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  NODE_FLOOR,
  PRODUCT_VERSION,
  PROFILE_COUNT,
  PROVIDER_COUNT,
  SOURCE_SHA,
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

> Evidence-aware, multi-provider research for people and agents. Librarium plans a request against explicit provider profiles, runs selected work, and preserves the provenance needed to interpret each result.

Release-candidate facts: ${PROVIDER_COUNT} built-in providers, ${PROFILE_COUNT} implemented public profiles, and four built-in workflows: \`quick\`, \`deep\`, \`visibility\`, and \`all\`. Source authority: [jkudish/librarium@${SOURCE_SHA.slice(0, 12)}](https://github.com/jkudish/librarium/commit/${SOURCE_SHA}). This site does not state that v2 is released.

RC18 is not available from npm, Homebrew, or standalone release channels. Review the exact source commit with Node >= ${NODE_FLOOR}: clone the repository, check out \`${SOURCE_SHA}\` in detached HEAD state, run \`npm ci\` and \`npm run build\`, then invoke the local build as \`node dist/cli.js\`. The network-denied \`node --experimental-strip-types art/demo/demo-run.mjs\` fixture and local \`config --json\`, \`ls --json\`, \`groups --json\`, and skipped-without-keys \`doctor --json\` checks are executable without provider credentials. A real provider run requires separately configured credentials, reviewed provider pricing, and explicit paid-call authority. See the release-candidate checklist for the verified procedure. Review v1 migration output before any explicit save.

For answer-engine visibility work, \`--group visibility\` compares six SearchAPI-collected consumer surfaces with three first-party API baselines. The six surfaces share one collector. Agreement is correlated visibility evidence, not independent corroboration or parity with a particular account.

API output, provider-reported citations and usage, collected consumer observations, normalized source overlap, correlation, and independent corroboration are distinct claims. Librarium records provenance. It does not serialize a universal confidence score.

## Docs

${docLines}

Each docs page is also available as raw markdown at the links above. The docs index is ${base}/docs/index.md.

Legacy v1 documentation is preserved at ${base}/v1 and marked as legacy. Use the v2 links above unless maintaining a v1 installation.

## Source

- [GitHub](https://github.com/jkudish/librarium): source, issues, releases
- [npm](https://www.npmjs.com/package/librarium): current stable package; RC18 is not published here
- [Full docs as one file](${base}/llms-full.txt)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
