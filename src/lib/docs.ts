import type { CollectionEntry } from "astro:content";

export function serializeDocEntry(entry: CollectionEntry<"docs">): string {
  return `# ${entry.data.title}\n\n> ${entry.data.description}\n\n${entry.body ?? ""}`;
}
