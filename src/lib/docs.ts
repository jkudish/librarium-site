import type { CollectionEntry } from "astro:content";

type DocEntry = CollectionEntry<"docs"> | CollectionEntry<"v1Docs">;

export function serializeDocEntry(entry: DocEntry): string {
  return `# ${entry.data.title}\n\n> ${entry.data.description}\n\n${entry.body ?? ""}`;
}
