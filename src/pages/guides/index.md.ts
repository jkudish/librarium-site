import type { APIRoute } from "astro";
import { serializeGuideIndex } from "../../lib/articles";

export const GET: APIRoute = async () => new Response(await serializeGuideIndex(), {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
