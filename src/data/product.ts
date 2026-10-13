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
    summary: "Search and cited answers, usually in seconds.",
    purpose: "A first pass on a question.",
    runs: "Every set-up research source by default; narrow with only or skip.",
    pace: "Usually inline. Some variants and collectors use durable tasks.",
  },
  {
    id: "deep",
    summary: "Durable research reports, often taking minutes.",
    purpose: "Reports for decisions that deserve deeper investigation.",
    runs: "Deep variants of your selected sources; other sources are skipped.",
    pace: "Start with --deep --no-wait, then resume with show <run-id> --wait.",
  },
  {
    id: "engines",
    summary: "Named-only observations of consumer AI answers.",
    purpose: "See how answer engines describe your product.",
    runs: "Name chatgpt, gemini-app, google-ai-mode, google-ai-overview, or copilot.",
    pace: "Collector-dependent. Never part of the default research set.",
  },
] as const;
