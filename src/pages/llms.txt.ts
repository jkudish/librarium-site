import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

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

  const body = `# librarium

> The meta harness for research queries. Librarium fans one query out to search engines, AI-grounded answers, answer-engine visibility surfaces, deep-research APIs, and optional LLMs in parallel (31 provider adapters across four tiers), then collects, normalizes, and deduplicates everything into structured output. It is a CLI, an embeddable edge-safe library (librarium/core), an MCP server, and an agent skill.

Install: \`npm i -g librarium\` (Node >= 20.12). Configure with \`librarium init --auto\`, which discovers API keys while preserving opt-in provider policy. Agents can install the agent skill with \`librarium install-skill\` or connect over MCP with \`librarium mcp\`.

For answer-engine monitoring, \`--group visibility\` compares nine surfaces. Six are SearchAPI-observed consumer products sharing one collection vendor, so agreement is correlated visibility evidence rather than independent corroboration; the other three use first-party Perplexity, Gemini, and xAI APIs.

## Docs

${docLines}

Each docs page is also available as raw markdown by appending .md to its URL.

## Source

- [GitHub](https://github.com/jkudish/librarium): source, issues, releases
- [npm](https://www.npmjs.com/package/librarium): package
- [Full docs as one file](${base}/llms-full.txt)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
