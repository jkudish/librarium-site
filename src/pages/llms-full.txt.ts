import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { serializeDocEntry } from "../lib/docs";

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const sections = docs
    .map((entry) => serializeDocEntry(entry))
    .join("\n\n---\n\n");

  const body = `# librarium documentation\n\n> The meta harness for research queries. CLI, embeddable library, MCP server, and agent skill. Source: https://github.com/jkudish/librarium\n\n---\n\n${sections}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
