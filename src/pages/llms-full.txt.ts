import type { APIRoute } from "astro";
import { serializeDocs, serializeDocEntry } from "../lib/docs";
import { serializeHome } from "../lib/home-markdown";
import { getArticles, serializeGuideIndex } from "../lib/articles";

export const GET: APIRoute = async () => {
  const sections = await Promise.all([
    serializeHome(), serializeGuideIndex(), serializeDocs("docs"), serializeDocs("phpDocs"),
  ]);
  sections.push(...(await getArticles()).map(({ path, entry }) =>
    `Source: https://librarium.agentsy.build/${path}.md\n\n${serializeDocEntry(entry)}`,
  ));

  const body = `# Librarium: all current pages and documentation\n\n> JavaScript and PHP are separate first-party implementations. Read their respective installation and operational boundaries. Legacy v1 documentation is preserved separately at https://librarium.agentsy.build/v1/all.md.\n\n---\n\n${sections.join("\n\n---\n\n")}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
