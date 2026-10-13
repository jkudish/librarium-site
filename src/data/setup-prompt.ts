// The canonical agent setup prompt. The homepage copy control and the
// Agents & MCP page render this one string; scripts/verify-content.mjs
// fails the build if the page copy drifts from it. The full install, verify,
// and MCP-registration steps live in src/data/install.md, served at /install.md.
export const AGENT_SETUP_PROMPT =
  "Install Librarium for me by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.";

/** The same prompt, naming the agent the user is pasting it into. */
export const agentSetupPromptFor = (host: string): string =>
  AGENT_SETUP_PROMPT.replace("Install Librarium for me by following", `Install Librarium for me in ${host} by following`);
