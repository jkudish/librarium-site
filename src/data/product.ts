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
  hint: "deep" in source.variants ? "Quick + deep" : "Quick",
}));

const engineLogos: Record<string, string> = { chatgpt: "openai", "gemini-app": "gemini", "google-ai-mode": "google", "google-ai-overview": "google", copilot: "copilot" };
export const FEATURED_ENGINES = ENGINES.map((engine) => ({
  id: engine.id,
  name: engine.name,
  logo: engineLogos[engine.id],
  monogram: engine.id === "copilot" ? "MC" : "GA",
}));

const exampleQuestion = "What are the best alternatives to Google Analytics?";
export const WORKFLOWS = [
  {
    id: "quick",
    title: "Get a first answer.",
    summary: "Fast, cited answers for everyday questions.",
    command: `librarium research "${exampleQuestion}"`,
  },
  {
    id: "deep",
    title: "Investigate further.",
    summary: "Full, cited reports for questions that need real digging. Start one and pick it up later by its Run ID.",
    command: `librarium research "${exampleQuestion}" --deep`,
  },
  {
    id: "engines",
    title: "Check AI answer engines.",
    summary: "See what ChatGPT, Gemini, and Copilot recommend in your category, and which pages they cite.",
    command: `librarium research "${exampleQuestion}" --only chatgpt,gemini-app,copilot`,
  },
] as const;
