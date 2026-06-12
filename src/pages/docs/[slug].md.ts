import type { APIRoute, GetStaticPaths } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { serializeDocEntry } from "../../lib/docs";

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection("docs");
  return docs
    .filter((entry) => entry.id !== "index")
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<"docs"> };
  const body = serializeDocEntry(entry) + "\n";
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
