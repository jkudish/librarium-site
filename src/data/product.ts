export const PRODUCT_VERSION = "2.0.0";
export const NODE_FLOOR = "22.12.0";

export const PROVIDERS = [
  { family: "Brave", profiles: ["brave-search/search", "brave-answers/grounded"] },
  { family: "Claude", profiles: ["claude/chat"] },
  { family: "Exa", profiles: ["exa/search", "exa/research"] },
  { family: "Firecrawl", profiles: ["firecrawl-search/search"] },
  { family: "Gemini", profiles: ["gemini-grounded/grounded", "gemini-deep/research", "gemini-chat/chat"] },
  { family: "Grok (xAI)", profiles: ["grok/web", "grok-x-only/x", "grok-combined/combined"] },
  { family: "Jina", profiles: ["jina-search/search"] },
  { family: "Kagi", profiles: ["kagi-fastgpt/grounded"] },
  { family: "OpenAI", profiles: ["openai-research/research", "openai-chat/chat"] },
  { family: "OpenRouter", profiles: ["openrouter/grounded", "openrouter/chat"] },
  { family: "Parallel", profiles: ["parallel/search", "parallel/turbo", "parallel/research"] },
  { family: "Perplexity", profiles: ["perplexity-search/search", "perplexity-sonar-pro/grounded", "perplexity-deep-research/research", "perplexity-sonar-deep/research"] },
  { family: "SearchAPI", profiles: ["searchapi/search", "searchapi-chatgpt/surface", "searchapi-gemini/surface", "searchapi-google-ai-mode/surface", "searchapi-bing-copilot/surface", "searchapi-google-ai-overview/surface"] },
  { family: "SerpAPI", profiles: ["serpapi/search"] },
  { family: "SerpBase", profiles: ["serpbase/search", "serpbase/news"] },
  { family: "Tavily", profiles: ["tavily/search"] },
  { family: "Valyu", profiles: ["valyu/search", "valyu/research"] },
  { family: "You.com", profiles: ["you-research/grounded", "you-research/research", "you-answer/grounded"] },
] as const;

export const PROVIDER_COUNT = new Set(
  PROVIDERS.flatMap((provider) =>
    provider.profiles.map((profile) => profile.split("/")[0]),
  ),
).size;
export const PROFILE_COUNT = PROVIDERS.reduce(
  (count, provider) => count + provider.profiles.length,
  0,
);

export const WORKFLOWS = [
  {
    id: "quick",
    summary: "Low-latency discovery and cited answers.",
    purpose: "Fast discovery and cited answers.",
    runs: "Six search and grounded-answer profiles, including Exa, Brave, Gemini, and Kagi.",
    pace: "Inline, returns in the active call. The default when no group is set.",
    selection: [
      "gemini-grounded/grounded",
      "openrouter/grounded",
      "brave-answers/grounded",
      "exa/search",
      "kagi-fastgpt/grounded",
      "parallel/turbo",
    ],
  },
  {
    id: "deep",
    summary: "Implemented research-report profiles, derived from the catalog.",
    purpose: "Long-form research reports for decisions that deserve them.",
    runs: "Every research-report profile, such as OpenAI, Gemini, Perplexity, and Parallel research.",
    pace: "Background and durable, often minutes. Run with --mode async, collect with librarium status.",
    selection: ["catalog-derived"],
  },
  {
    id: "visibility",
    summary: "Five collected consumer surfaces, then three first-party API baselines.",
    purpose: "See how AI answer engines describe your product.",
    runs: "Five SearchAPI answer surfaces, including ChatGPT, Google AI Mode, and Bing Copilot, then three API baselines.",
    pace: "Inline. Needs a SearchAPI key and never runs as part of quick.",
    selection: [
      "searchapi-chatgpt/surface",
      "searchapi-gemini/surface",
      "searchapi-google-ai-mode/surface",
      "searchapi-bing-copilot/surface",
      "searchapi-google-ai-overview/surface",
      "perplexity-sonar-pro/grounded",
      "gemini-grounded/grounded",
      "grok/web",
    ],
  },
  {
    id: "all",
    summary: "Every selectable profile allowed by workflow policy, derived from the catalog.",
    purpose: "Maximum coverage for a single question.",
    runs: "Every enabled profile: search, answers, chat, research reports, and surfaces.",
    pace: "Slowest and costliest, since it includes deep reports. Plan it first.",
    selection: ["catalog-derived"],
  },
] as const;
