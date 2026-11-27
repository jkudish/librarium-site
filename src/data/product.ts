import catalog from "librarium-spec/sources.json" with { type: "json" };

export const PRODUCT_VERSION = "2.1.0";
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

const engineLogos: Record<string, string> = { chatgpt: "openai", "gemini-app": "gemini", "google-ai-mode": "google", "google-ai-overview": "google", copilot: "copilot", "bing-ai-mode": "bing" };
export const FEATURED_ENGINES = ENGINES.map((engine) => ({
  id: engine.id,
  name: engine.name,
  logo: engineLogos[engine.id],
  monogram: engine.id === "copilot" ? "MC" : "GA",
}));

// Retrieval services are catalog collectors: engine collectors and google's collector option.
const collectorNames: Record<string, string> = { searchapi: "SearchAPI", serpapi: "SerpApi", serpbase: "SerpBase", dataforseo: "DataForSEO", cloro: "Cloro", firecrawl: "Firecrawl" };
const collectorOrder = Object.keys(collectorNames);
export const COLLECTOR_IDS = [...new Set([
  ...catalog.engines.flatMap((engine) => Object.keys(engine.collectors)),
  ...(catalog.sources.find((source) => source.id === "google")?.options?.collector?.values ?? []),
])].sort((a, b) => collectorOrder.indexOf(a) - collectorOrder.indexOf(b));
export const FEATURED_COLLECTORS = COLLECTOR_IDS.map((id) => ({ id, name: collectorNames[id] ?? id, logo: id }));

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
