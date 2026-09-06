import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { serializeDocEntry } from "../lib/docs";
import { PRODUCT_VERSION } from "../data/product";

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const sections = docs
    .map((entry) => serializeDocEntry(entry))
    .join("\n\n---\n\n");

  const body = `# librarium ${PRODUCT_VERSION} documentation\n\n> Librarium is a meta harness for research queries. Legacy v1 documentation is preserved at https://librarium.agentsy.build/v1.\n\n---\n\n${sections}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
