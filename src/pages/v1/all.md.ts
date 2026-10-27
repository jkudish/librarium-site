import type { APIRoute } from "astro";
import { serializeDocs } from "../../lib/docs";

export const GET: APIRoute = async () => new Response(await serializeDocs("v1Docs"), {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
