import type { APIRoute } from "astro";
import install from "../data/install.md?raw";

// Agent-readable install instructions. The short setup prompt
// (src/data/setup-prompt.ts) points agents here.
export const GET: APIRoute = () => new Response(install, {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
