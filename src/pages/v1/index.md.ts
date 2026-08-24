import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { serializeDocEntry } from "../../lib/docs";

export const GET: APIRoute = async () => {
  const entry = await getEntry("v1Docs", "index");
  const body = entry ? serializeDocEntry(entry) + "\n" : "Not found";
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
