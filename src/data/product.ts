import catalog from "librarium-spec/sources.json" with { type: "json" };

export const PRODUCT_VERSION = "2.0.0";
export const NODE_FLOOR = "22.12.0";
export const SOURCES = catalog.sources.filter((source) => source.kind === "research");
export const ENGINES = catalog.engines;
export const SOURCE_COUNT = SOURCES.length;
export const ENGINE_COUNT = ENGINES.length;

// Presentation assets are keyed by semantic source id; the catalog owns the roster.
const logos: Record<string, string> = { google: "searchapi" };
export const FEATURED_SOURCES = SOURCES.map((source) => ({
  name: source.name,
  id: source.id,
  logo: logos[source.id] ?? source.id,
  docs: source.docs,
}));

export const WORKFLOWS = [
  {
    id: "quick",
    title: "Get a first answer.",
    summary: "Search results and cited answers for everyday questions. Uses your configured research sources by default.",
    command: 'librarium research "Your question"',
  },
  {
    id: "deep",
    title: "Investigate further.",
    summary: "Longer reports from sources that support deep research. Start the work, keep the Run id, and return to the results.",
    command: 'librarium research "Your question" --deep',
  },
  {
    id: "engines",
    title: "Check AI answer engines.",
    summary: "See what consumer AI surfaces say about your product or category. Choose engines by name; they run only when you select them.",
    command: 'librarium research "Your question" --only chatgpt,gemini-app,copilot',
  },
] as const;
