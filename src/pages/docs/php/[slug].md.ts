import type { APIRoute, GetStaticPaths } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { serializeDocEntry } from "../../../lib/docs";

export const getStaticPaths: GetStaticPaths = async () => {
  return (await getCollection("phpDocs")).map((entry) => ({
    params: { slug: entry.id }, props: { entry },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<"phpDocs"> };
  return new Response(serializeDocEntry(entry) + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
