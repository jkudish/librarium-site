export const READING_LABELS: Record<string, { platform: string; level: string; prerequisite: string }> = {
  "guides/first-query": { platform: "CLI + Laravel", level: "Beginner", prerequisite: "One configured source" },
  "guides/agent-research": { platform: "MCP", level: "Beginner", prerequisite: "Coding agent with MCP support" },
  "guides/laravel-queues": { platform: "Laravel", level: "Intermediate", prerequisite: "Configured source, shared Run store, queue worker" },
  "compare/direct-provider-apis": { platform: "JavaScript + Laravel", level: "Overview", prerequisite: "Familiarity with API integrations" },
  "stories/agentsy-report": { platform: "Laravel", level: "Field note", prerequisite: "Run and tenant ownership concepts" },
};
export const READING_SECTIONS: Record<string, string> = {
  "Build something useful": "Guides",
  "Choose your approach": "Comparisons",
  "From our own work": "Field notes",
};
