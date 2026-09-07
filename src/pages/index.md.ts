import type { APIRoute } from "astro";
import { serializeHome } from "../lib/home-markdown";

export const GET: APIRoute = async () => new Response(await serializeHome(), {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
