import { getCollection } from "astro:content";
import { READING_LABELS, READING_SECTIONS } from "../data/reading-labels";

export const guideTitle = "Guides & field notes";
export const guideDescription = "Practical ways to put research to work—in your terminal, your agent, and your application.";

export async function getArticles() {
  const [pages, guides] = await Promise.all([getCollection("pages"), getCollection("guides")]);
  return [
    ...pages.sort((a, b) => a.id.localeCompare(b.id)).map((entry) => ({ path: entry.id, entry })),
    ...guides.sort((a, b) => a.data.order - b.data.order).map((entry) => ({ path: `guides/${entry.id}`, entry })),
  ];
}

export async function getReadingLists() {
  const articles = await getArticles();
  return [
    { title: READING_SECTIONS["Build something useful"], items: articles.filter(({ entry }) => entry.collection === "guides") },
    { title: READING_SECTIONS["Choose your approach"], items: articles.filter(({ entry }) => entry.collection === "pages" && entry.data.kind === "comparison") },
    { title: READING_SECTIONS["From our own work"], items: articles.filter(({ entry }) => entry.collection === "pages" && entry.data.kind === "story") },
  ];
}

export async function serializeGuideIndex() {
  return `# ${guideTitle}\n\n${guideDescription}\n\n` + (await getReadingLists()).map((list) =>
    `## ${list.title}\n\n` + list.items.map(({ path, entry }) => {
      const labels = READING_LABELS[path];
      return `- [${entry.data.title}](/${path}.md): ${entry.data.description}` + (labels
        ? `\n  Platform: ${labels.platform}. Level: ${labels.level}. Prerequisite: ${labels.prerequisite}.` : "");
    }).join("\n"),
  ).join("\n\n") + "\n";
}
