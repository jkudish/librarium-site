import type { APIRoute } from "astro";
import { serializeDocs, serializeDocEntry } from "../lib/docs";
import { getArticles, serializeGuideIndex } from "../lib/articles";

export const GET: APIRoute = async () => {
  const sections = await Promise.all([
    serializeDocs("docs"), serializeDocs("phpDocs"), serializeGuideIndex(),
  ]);
  sections.push(...(await getArticles()).filter(({ entry }) => !("redirect" in entry.data && entry.data.redirect)).map(({ path, entry }) =>
    `Source: https://librarium.agentsy.build/${path}.md\n\n${serializeDocEntry(entry)}`,
  ));
  sections.push("# Homepage\n\nA meta harness for research queries. Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.\n\nRead the [homepage and historical research demo](https://librarium.agentsy.build/index.md).");

  const body = `# Librarium: all current pages and documentation\n\n> JavaScript and PHP are separate first-party implementations. Read their respective installation and operational boundaries. Legacy v1 documentation is preserved separately at https://librarium.agentsy.build/v1/all.md.\n\n---\n\n${sections.join("\n\n---\n\n")}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
