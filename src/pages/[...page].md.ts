import type { APIRoute } from "astro";
import { getArticles } from "../lib/articles";
import { serializeDocEntry } from "../lib/docs";

export async function getStaticPaths() {
  return (await getArticles()).map(({ path, entry }) => ({ params: { page: path }, props: { entry } }));
}

export const GET: APIRoute = ({ props }) => new Response(serializeDocEntry(props.entry) + "\n", {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
