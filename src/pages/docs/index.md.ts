import type { APIRoute } from "astro";
import { getEntry } from "astro:content";

export const GET: APIRoute = async () => {
  const entry = await getEntry("docs", "index");
  const body = entry
    ? `# ${entry.data.title}\n\n> ${entry.data.description}\n\n${entry.body ?? ""}\n`
    : "Not found";
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
