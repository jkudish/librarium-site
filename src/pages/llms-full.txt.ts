import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const sections = docs
    .map(
      (entry) =>
        `# ${entry.data.title}\n\n> ${entry.data.description}\n\n${entry.body ?? ""}`,
    )
    .join("\n\n---\n\n");

  const body = `# librarium documentation\n\n> The meta harness for research queries. CLI, embeddable library, MCP server, and Claude Code skill. Source: https://github.com/jkudish/librarium\n\n---\n\n${sections}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
