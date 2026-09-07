import { getCollection } from "astro:content";

type DocEntry = { data: { title: string; description: string }; body?: string };

export function serializeDocEntry(entry: DocEntry): string {
  return `# ${entry.data.title}\n\n> ${entry.data.description}\n\n${entry.body ?? ""}`;
}

export async function serializeDocs(collection: "docs" | "v1Docs" | "phpDocs"): Promise<string> {
  const entries = (await getCollection(collection)).sort((a, b) => a.data.order - b.data.order);
  const root = collection === "phpDocs" ? "/docs/php" : collection === "v1Docs" ? "/v1" : "/docs";
  const label = collection === "phpDocs" ? "PHP / Laravel" : collection === "v1Docs" ? "JavaScript v1 legacy" : "JavaScript v2";
  return `# Librarium ${label} documentation\n\n` + entries.map((entry) =>
    `Source: https://librarium.agentsy.build${root}/${entry.id}.md\n\n${serializeDocEntry(entry)}`,
  ).join("\n\n---\n\n") + "\n";
}
