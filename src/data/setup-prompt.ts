// The canonical agent setup prompt. The homepage copy control and the
// Agents & MCP page render this one string; scripts/verify-content.mjs
// fails the build if the page copy drifts from it. The full install, verify,
// and MCP-registration steps live in src/data/install.md, served at /install.md.
export const AGENT_SETUP_PROMPT =
  "Install Librarium for me by following https://librarium.si/install.md";

// The prompt stays one sentence; install.md carries the credential, approval,
// and offline-verification rules the agent must follow.
export const INSTALL_CHOICES = [
  { id: "agent", label: "Agent", text: AGENT_SETUP_PROMPT, href: "/docs/using-with-agents#mcp-server" },
  { id: "cli", label: "CLI", text: "npm install -g librarium", href: "/docs#install" },
  { id: "javascript", label: "JavaScript", text: "npm install librarium", href: "/docs#install" },
  { id: "laravel", label: "Laravel", text: "composer require jkudish/laravel-ai-librarium\nphp artisan vendor:publish --tag=librarium-config", href: "/docs/php#install" },
] as const;

/** The same prompt, naming the agent the user is pasting it into. */
export const agentSetupPromptFor = (host: string): string =>
  AGENT_SETUP_PROMPT.replace("Install Librarium for me by following", `Install Librarium for me in ${host} by following`);
