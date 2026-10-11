import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import {
  NODE_FLOOR,
  PRODUCT_VERSION,
  PROFILE_COUNT,
  PROVIDER_COUNT,
  PROVIDERS,
  WORKFLOWS,
} from "../src/data/product.ts";
import { AGENT_SETUP_PROMPT } from "../src/data/setup-prompt.ts";
import { RESEARCH_DEMO, renderCapturedMarkdown } from "../src/data/research-demo.ts";

assert.equal(
  renderCapturedMarkdown('[source](https://example.test/"onmouseover="alert`1`)'),
  '<p><a href="https://example.test/&quot;onmouseover=&quot;alert`1`" target="_blank" rel="noopener noreferrer">source</a></p>',
  "provider link quotes must stay inside the href, never become HTML attributes",
);
assert.equal(
  renderCapturedMarkdown('[source](javascript:alert`1`) <img src=x onerror=alert`1`>'),
  '<p>[source](javascript:alert`1`) &lt;img src=x onerror=alert`1`&gt;</p>',
  "provider HTML and non-HTTP links must remain inert text",
);
for (const result of RESEARCH_DEMO.results.filter((result) => result.title)) {
  assert.notEqual(result.displayContent.trimStart().split("\n")[0].replace(/^#{1,2} /, ""), result.title, "the readable report must not repeat its title");
}

const root = resolve(import.meta.dirname, "..");
const docsDir = join(root, "src/content/docs");
const v1DocsDir = join(root, "src/content/v1-docs");
const phpDocsDir = join(root, "src/content/php-docs");
const distDir = join(root, "dist");

const profiles = PROVIDERS.flatMap((provider) => provider.profiles);
const providerIds = new Set(profiles.map((profile) => profile.split("/")[0]));
const phpEnabledProfiles = [
  "gemini-grounded",
  "openrouter-grounded",
  "openrouter-chat",
  "claude-chat",
  "openai-chat",
  "gemini-chat",
  "brave-answers",
  "exa",
  "kagi-fastgpt",
  "you-answer",
  "you-research-grounded",
  "you-research-research",
  "perplexity-sonar-pro",
  "grok",
  "openai-research",
  "perplexity-sonar-deep",
  "searchapi",
  "searchapi-chatgpt",
  "searchapi-gemini",
  "searchapi-google-ai-mode",
  "searchapi-bing-copilot",
  "searchapi-google-ai-overview",
  "perplexity-low-frozen",
  "brave-search",
  "tavily-search",
  "perplexity-search",
  "jina-search",
  "serpapi",
  "serpbase-search",
  "serpbase-news",
  "exa-research",
  "gemini-deep-research",
  "perplexity-deep-research",
  "grok-x-only",
  "grok-combined",
  "parallel-search",
  "parallel-turbo",
  "parallel-research",
  "valyu-search",
  "valyu-research",
];
const phpDataForSeoProfiles = [
  "dataforseo-chatgpt",
  "dataforseo-chatgpt-live",
  "dataforseo-gemini",
  "dataforseo-gemini-live",
  "dataforseo-google-ai-mode",
  "dataforseo-google-ai-mode-live",
];
assert.equal(PRODUCT_VERSION, "2.0.0");
assert.equal(NODE_FLOOR, "22.12.0");
assert.equal(PROVIDER_COUNT, providerIds.size);
assert.equal(PROVIDER_COUNT, 33);
assert.equal(PROFILE_COUNT, profiles.length);
assert.equal(PROFILE_COUNT, 40);
assert.equal(new Set(profiles).size, profiles.length, "profile roster contains duplicates");
assert.deepEqual(WORKFLOWS.map((workflow) => workflow.id), ["quick", "deep", "visibility", "all"]);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "quick")?.selection.length, 6);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "visibility")?.selection.length, 8);
assert(profiles.includes("tavily/search"));
assert(!profiles.includes("tavily/research"));
assert(!profiles.includes("parallel/chat"));
assert(!profiles.includes("searchapi-perplexity/surface"));

const v1DocNames = readdirSync(v1DocsDir).sort();
const v2DocNames = readdirSync(docsDir).sort();
for (const name of v1DocNames) {
  assert(v2DocNames.includes(name), `v2 docs are missing the legacy-equivalent route ${name}`);
}
assert(v2DocNames.includes("request-and-retry.md"), "v2 docs must explain request and retry behavior");
assert(v2DocNames.includes("upgrading-to-v2.md"), "v2 docs must include an upgrade guide");

const publicSources = [
  join(root, "README.md"),
  ...readdirSync(docsDir).map((file) => join(docsDir, file)),
  join(root, "src/pages/index.astro"),
  join(root, "src/pages/llms.txt.ts"),
  join(root, "src/pages/llms-full.txt.ts"),
  join(root, "src/layouts/Base.astro"),
  join(root, "src/components/Header.astro"),
  join(root, "src/components/DocsVersionPicker.astro"),
  join(root, "src/components/Footer.astro"),
  join(root, "src/content/pages/agents.md"),
  join(root, "src/content/pages/cli.md"),
  join(root, "src/content/pages/cli-mcp.md"),
];
const publicCopy = publicSources.map((file) => readFileSync(file, "utf8")).join("\n");
const gettingStarted = readFileSync(join(docsDir, "index.md"), "utf8");
const outputFormats = readFileSync(join(docsDir, "output-formats.md"), "utf8");
const providerDocs = readFileSync(join(docsDir, "providers.md"), "utf8");
const requestAndRetry = readFileSync(join(docsDir, "request-and-retry.md"), "utf8");
const upgradingToV2 = readFileSync(join(docsDir, "upgrading-to-v2.md"), "utf8");
const agentDocs = readFileSync(join(docsDir, "using-with-agents.md"), "utf8");
const commandDocs = readFileSync(join(docsDir, "commands.md"), "utf8");
const configuration = readFileSync(join(docsDir, "configuration.md"), "utf8");
const phpProviders = readFileSync(join(phpDocsDir, "providers.md"), "utf8");
const phpConfiguration = readFileSync(join(phpDocsDir, "configuration.md"), "utf8");
const phpGroups = readFileSync(join(phpDocsDir, "groups-and-modes.md"), "utf8");

assert.equal(phpEnabledProfiles.length, 40);
assert.equal(phpDataForSeoProfiles.length, 6);
assert.equal(new Set([...phpEnabledProfiles, ...phpDataForSeoProfiles]).size, 46);
const documentedPhpProfiles = [...phpProviders.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1]);
assert.deepEqual(
  documentedPhpProfiles,
  [...phpEnabledProfiles, ...phpDataForSeoProfiles],
  "PHP provider tables must document the exact 40 enabled and six disabled-by-default Profiles",
);
for (const fact of [
  "46 flat Profile IDs",
  "Forty have",
  "six DataForSEO Profiles",
  "historical compatibility evidence",
]) {
  assert(phpProviders.includes(fact), `PHP provider docs are missing: ${fact}`);
}
for (const fact of [
  "DATAFORSEO_LOGIN",
  "DATAFORSEO_PASSWORD",
  "'enabled' => true",
  "'location_code' => 2840",
  "'language_code' => 'en'",
  "live-canary inventory",
]) {
  assert(phpConfiguration.includes(fact), `PHP configuration docs are missing: ${fact}`);
}
for (const fact of ["46 configured Profiles", "Six are DataForSEO", "remaining 40 Profiles"]) {
  assert(phpGroups.includes(fact), `PHP group docs are missing: ${fact}`);
}

const v2AvailabilityHedges = [
  /\b(?:until|before|after|once|if|when)\b[^\n.]{0,120}\bv2\b[^\n.]{0,120}\b(?:available|publish(?:ed|ing)?|release)\b/i,
  /\bv2\b[^\n.]{0,120}\b(?:until|before|after|once|if|when)\b[^\n.]{0,120}\b(?:available|publish(?:ed|ing)?|release)\b/i,
  /\b(?:reviewed|unpublished) (?:v2 )?source checkout\b/i,
  /\bsource-(?:only|install(?:ation)?)\b/i,
  /\bsource installation boundary\b/i,
  /\b(?:check|confirm|verify|see) (?:whether|if) [^\n.]{0,80}\bv2\b[^\n.]{0,80}\b(?:available|published)\b/i,
  /npm install -g \.(?:\s|`|<|$)/i,
];
function assertNoV2AvailabilityHedges(copy, label) {
  for (const pattern of v2AvailabilityHedges) {
    assert(!pattern.test(copy), `${label} contains a v2 availability hedge: ${pattern}`);
  }
}

for (const stale of [
  "40 public profiles",
  "parallel/chat",
  "install-plugin",
  "Amp plugin",
  "--target <version>",
  "31 built-in",
  "31 provider adapters",
  "All 27 grounded",
  "version: 1 as const",
  "schema v1 run directories",
  "  {provider}.md",
  "  {provider}.meta.json",
  "release candidate",
  "release-candidate",
  "RC18",
  "417613e8922fbe74c5e3b239ec02afc0171891a2",
]) {
  assert(!publicCopy.includes(stale), `stale public copy found: ${stale}`);
}
assertNoV2AvailabilityHedges(publicCopy, "public source copy");
assert(!providerDocs.includes("perplexity-advanced-deep"), "retired Perplexity IDs must not appear in the active provider roster");
for (const command of [
  "npm install -g librarium",
  "librarium --version",
  "brew install jkudish/tap/librarium",
  "curl -fsSL https://raw.githubusercontent.com/jkudish/librarium/main/scripts/install.sh | sh",
  "librarium init",
  "librarium doctor",
  'librarium run "current guidance for HTTP caching" --group quick',
]) {
  assert(gettingStarted.includes(command), `getting started is missing: ${command}`);
}
for (const sourceInstallCommand of ["npm ci", "npm run build", "npm install -g ."]) {
  assert(!gettingStarted.includes(sourceInstallCommand), `getting started must use the published v2 package, not: ${sourceInstallCommand}`);
}
assert(publicCopy.includes("A meta harness for research queries"), "the category positioning is missing");
assert(publicCopy.includes("Give your agent more than one source."), "the approved agent-first hero is missing");
assert(publicCopy.includes("without building a separate integration for every provider."), "the approved hero body is missing");
assert(!readFileSync(join(root, "src/components/Header.astro"), "utf8").includes('href: "/#features"'), "Features must not appear in the header navigation");
assert(publicCopy.includes('{ href: "/#providers", label: "Providers" }'), "the handwritten Providers navigation is missing");
assert(publicCopy.includes('{ href: "/agents", label: "Agents & MCP" }'), "the handwritten Agents & MCP navigation is missing");
assert(publicCopy.includes('{ href: "/cli", label: "CLI" }'), "the handwritten CLI navigation is missing");
assert(readFileSync(join(root, "src/content/pages/agents.md"), "utf8").includes(AGENT_SETUP_PROMPT), "the Agents & MCP page must embed the canonical setup prompt verbatim");
// The dark palette has two synchronized gates: explicit <html data-theme="dark">
// and the script-free OS-preference fallback. Fail if their bodies drift.
const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf8");
const darkGateBody = (opener, closer) => {
  const start = globalCss.indexOf(opener);
  assert(start !== -1, `global.css is missing the dark gate ${opener}`);
  const end = globalCss.indexOf(closer, start);
  assert(end !== -1, `global.css dark gate ${opener} is not closed`);
  return globalCss.slice(start + opener.length, end).split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
};
assert(
  darkGateBody(':root[data-theme="dark"] {', "\n}") === darkGateBody(":root:not([data-theme]) {", "\n  }"),
  "the explicit and no-JS dark gates in global.css must carry identical bodies; update both blocks together",
);
assert(outputFormats.includes('provider-${stem}--${sha256(providerId)}.md'), "output docs must describe collision-resistant provider markdown names");
assert(outputFormats.includes('provider-${stem}--${sha256(providerId)}.meta.json'), "output docs must describe collision-resistant provider metadata names");
assert(outputFormats.includes("`run.json` owns the concrete `outputFile` and `metaFile` names"), "output docs must make run.json authoritative for provider artifact names");
for (const fact of [
  "paid-attempt-ledger.json",
  "paid-attempt-ledger.required",
  "Known failure costs count",
  "original deadline",
  "up to four total attempts",
  "HTTP 429",
  "HTTP 5xx",
  "Streaming requests are always one attempt",
  "acceptance unknown",
  "does not resubmit",
  "A fallback is not another HTTP attempt",
  "--no-fallback",
]) {
  assert(requestAndRetry.includes(fact), `request and retry docs are missing: ${fact}`);
}
for (const [text, facts] of [
  [agentDocs, ["resultId", "nextCursor", "UTF-16", "64,000", "16,000", "8,000", "256–12,000", "20 entries", "part: citations", "while sibling providers remain pending", "canonical output is authoritative", "without a release tag", "not-checked", "source fragments"]],
  [commandDocs, ["librarium plan", "--answer", "--verify", "doctor --live", "credentialStatus", "connectivity", "Exit 1", "OS keychain"]],
  [configuration, ["request_deadline_ms", "camelCase compatibility", "config --global --json", "refuse to overwrite", "not a save-ready"]],
]) {
  for (const fact of facts) assert(text.includes(fact), `reconciled interface fact missing: ${fact}`);
}
for (const fact of [
  "librarium config migrate",
  "--from ~/.config/librarium/config.json",
  "--project ./.librarium.json",
  "--output ~/.config/librarium/config.v2.json",
  "Previewing does not modify the source file",
  "migration never adds an executable provider",
  "librarium doctor --json",
  "npm install -g librarium@1.4.1",
]) {
  assert(upgradingToV2.includes(fact), `upgrade guide is missing: ${fact}`);
}

for (const required of [
  PRODUCT_VERSION,
  "34 built-in providers",
  "41 public profiles",
  "quick",
  "deep",
  "visibility",
  "all",
  "tavily/search",
  "trusted_provider_ids",
  "correlated visibility evidence",
  "independent corroboration",
]) {
  assert(publicCopy.includes(required), `required public fact missing: ${required}`);
}

assert(existsSync(distDir), "dist does not exist; run npm run build first");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function outputPathExists(pathname) {
  if (pathname === "/") return existsSync(join(distDir, "index.html"));
  const clean = pathname.replace(/^\//, "").replace(/\/$/, "");
  return existsSync(join(distDir, clean)) || existsSync(join(distDir, clean, "index.html"));
}

const htmlFiles = walk(distDir).filter((file) => extname(file) === ".html");
assert(htmlFiles.length >= 21, "expected homepage, v2 docs, and legacy v1 docs HTML output");
const generatedPublicCopy = [
  ...htmlFiles.filter((file) => !relative(distDir, file).startsWith("v1/")),
  join(distDir, "llms.txt"),
  join(distDir, "llms-full.txt"),
].map((file) => readFileSync(file, "utf8")).join("\n");
for (const stale of [
  "release candidate",
  "release-candidate",
  "RC18",
  "417613e8922fbe74c5e3b239ec02afc0171891a2",
]) {
  assert(!generatedPublicCopy.includes(stale), `generated public copy contains release-review text: ${stale}`);
}
assertNoV2AvailabilityHedges(generatedPublicCopy, "generated public copy");

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const label = relative(distDir, file);
  const machineHref = html.match(/id="machine-view" href="([^"]+)"/)?.[1];
  assert(machineHref?.endsWith(".md"), `${label} needs a Machine Markdown destination`);
  assert(existsSync(join(distDir, machineHref)), `${label} Machine destination must exist`);
  for (const marker of [
    "<title>",
    'name="description"',
    'rel="canonical"',
    'property="og:image"',
    'name="twitter:card"',
    'type="application/ld+json"',
  ]) {
    assert(html.includes(marker), `${label} is missing ${marker}`);
  }

  if (label.startsWith("v1/")) {
    assert(html.includes('name="robots" content="noindex, follow"'), `${label} must be noindex, follow`);
    assert(!html.includes('"@type":"SoftwareApplication"'), `${label} must not publish v2 software metadata`);
    assert(html.includes("Legacy v1 documentation."), `${label} must show the legacy warning`);
  } else {
    assert(!html.includes('name="robots" content="noindex, follow"'), `${label} unexpectedly has legacy robots metadata`);
  }

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    const pathname = href.split(/[?#]/)[0];
    if (!pathname) continue;
    assert(outputPathExists(pathname), `${label} links to missing output ${href}`);
  }
}

for (const file of ["llms.txt", "llms-full.txt", "robots.txt", "sitemap-index.xml", "og.jpg", "demo.gif"]) {
  assert(existsSync(join(distDir, file)), `generated output is missing ${file}`);
}

const home = readFileSync(join(distDir, "index.html"), "utf8");
// Entity-decoded homepage text for comparing against captured fixture wording.
const homeText = home.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
assert(!home.includes('href="/v1'), "legacy navigation belongs in the docs version picker");
assert(!home.includes("librarium live-validation"), "homepage must show research rather than validation internals");
assert.equal((home.match(/>Set up Librarium<\/a>/g) ?? []).length, 2, "hero and final section must offer setup");
assert(home.includes('href="#research-example"'), "the example CTA needs an on-page target");
assert(home.includes('id="research-example"'), "the example target must exist");
assert(readFileSync(join(distDir, "docs/index.html"), "utf8").includes('id="install"'), "setup must link to the installation section");
assert(home.indexOf('id="features"') < home.indexOf('id="providers"'), "use cases must precede the provider catalog");
assert(!home.includes("Sample findings, not captured provider responses."), "removed sample footer must stay absent");
assert(!home.includes("A question worth exploring") && !home.includes("3 linked sources"), "removed example header labels must stay absent");
assert(home.includes("not the full API response schema"), "simplified demo JSON must be labelled");
const exampleCode = home.match(/<pre[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/)?.[1];
assert(exampleCode, "the JSON view must be statically rendered");
const example = JSON.parse(exampleCode.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
assert.equal(example.illustrative, true);
assert.equal(example.query, "What are the best alternatives to Google Analytics?", "the approved demo question is missing");
assert.equal(example.results.length, 5, "the demo must cover Exa, Perplexity, Gemini, Parallel, and You.com");
assert.deepEqual(example.results.map((result) => result.provider), ["Exa", "Perplexity Research (Agent API)", "Gemini", "Parallel", "You.com"]);
// The capture roster fixed by the collector's preflight: deep-research profiles only.
assert.equal(example.mode, "deep-research", "the demo must be labeled as captured deep-research examples");
assert.deepEqual(
  example.results.map((result) => result.profile),
  ["exa/research", "perplexity-sonar-deep/research", "gemini-deep/research", "parallel/research", "you-research/research"],
  "demo profiles must match the authorized capture roster exactly",
);
// The capture is complete: all five providers succeeded (Exa via exactly one
// authorized fresh submission after a credential refresh).
assert.equal(example.fixture, "captured", "the demo must carry the captured fixture marker");
assert.equal(example.results.filter((result) => result.status === "ok").length, 5, "all five providers succeeded in the final capture");
const capturedFixture = JSON.parse(readFileSync(join(root, "src/data/provider-display-fixture.json"), "utf8"));
const hostname = (url) => new URL(url).hostname;
for (const captured of capturedFixture.results) {
  if (captured.status !== "succeeded") continue;
  const rendered = example.results.find((result) => result.profile === captured.profile);
  assert(rendered && rendered.content === captured.content, `captured ${captured.provider} wording must ship verbatim in the demo data`);
  // Readable cards may drop a leading H1 that duplicates the card title and
  // render markdown structurally; compare on flattened text and require the
  // rendering to leave no raw markdown syntax in the readable panel.
  const displayed = captured.title && (captured.content.startsWith(`# ${captured.title}`) || captured.content.startsWith(`## ${captured.title}`))
    ? captured.content.split("\n").slice(1).join("\n")
    : captured.content;
  const flattenAll = (text) => text.replace(/<a [^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, " $2 $1 ").replace(/<[^>]*>/g, " ").replace(/[\\`#*>\-[\]()|]/g, " ").replace(/\s+/g, " ");
  assert(flattenAll(homeText).includes(flattenAll(displayed)), `captured ${captured.provider} wording must be displayed`);
  for (const citation of captured.citations.slice(0, 3)) {
    const label = citation.title ?? hostname(citation.url);
    assert(rendered.citations.some((shown) => shown.title === label && shown.url === citation.url), `citation ${label} must keep its captured title or hostname label`);
    assert(homeText.includes(citation.url), `citation ${citation.url} must be inspectable`);
  }
}
const readablePanel = home.slice(home.indexOf('id="example-readable"'), home.indexOf('id="example-json"'));
assert(readablePanel.includes("<strong>") && readablePanel.includes("<table>"), "captured markdown must render structurally in the readable panel");
assert(!readablePanel.includes("**"), "no raw markdown bold syntax may remain in the readable panel");
assert(homeText.includes(">matomo.org<") || homeText.includes("matomo.org"), "null citation titles must display derived hostnames, never invented titles");
// Perplexity provenance: Agent API label with the provider-reported observed model; never a "Sonar" model claim.
assert(homeText.includes("Perplexity Research (Agent API)"), "Perplexity must carry the honest Agent API label");
assert(homeText.includes("observed model openai/gpt-5.6-sol (provider-reported)"), "the observed model must appear in metadata as provider-reported");
assert(!homeText.includes("Sonar model") && !homeText.includes("Sonar Deep Research"), "the observed model must never be called Sonar");
// Real wall-clock timings and the no-speed-claim boundary.
// Real wall-clock durations pinned to the capture; dates and profile/model
// metadata stay in the JSON provenance, not the readable header.
assert(homeText.includes(">1m 01s<") && homeText.includes(">5m 07s<") && homeText.includes(">2m 02s<"), "per-card wall-clock timings must be pinned to the capture");
assert(!homeText.includes("captured 2026-09-18"), "the readable header shows duration only, not the captured date");
assert(!readablePanel.includes("processor pro") && !readablePanel.includes("observed model"), "profile and model metadata stay out of the readable panel");
assert(!home.includes("hero-canvas"), "the hero backdrop must stay removed");
assert(!home.includes("Put the evidence to work."), "the removed slogan must stay absent");
assert(!home.includes("Captured deep-research examples from one authorized run"), "the removed demo caption paragraph must stay absent");
// Agent prompts stay portable ("the Librarium skill") and shell-free; CLI
// commands stay separate rows, each an offline preview matching its
// research question, with verified execution syntax described separately.
const promptButtons = [...home.matchAll(/<textarea[^>]*data-copy-value="[^"]*"[^>]*>/g)].map((match) => match[0]);
const agentPromptValues = promptButtons
  .filter((tag) => tag.includes('aria-label="Agent prompt'))
  .map((tag) => /data-copy-value="([^"]*)"/.exec(tag)?.[1]?.replace(/&quot;/g, '"').replace(/&amp;/g, "&"))
  .filter(Boolean);
assert.equal(agentPromptValues.length, 3, "each use case needs a copyable agent prompt");
for (const prompt of agentPromptValues) {
  assert(!/librarium (plan|run|install-skill)/.test(prompt), "agent prompts must not embed shell commands");
  assert(/Librarium(’s)? (skill|MCP tools|visibility workflow)/.test(prompt), "agent prompts must use the portable Librarium phrasing");
}
assert(agentPromptValues.some((prompt) => prompt.includes("within the scope and budget I already authorized")), "the staged-escalation prompt must keep authorized-scope escalation approval-free");
assert(agentPromptValues.some((prompt) => prompt.includes("come from librarium configuration")), "the MCP prompt must state budgets and fallbacks come from configuration, not the research tool");
const commandValues = promptButtons
  .filter((tag) => tag.includes('aria-label="Offline preview command"'))
  .map((tag) => /data-copy-value="([^"]*)"/.exec(tag)?.[1]?.replace(/&quot;/g, '"').replace(/&amp;/g, "&"))
  .filter(Boolean);
assert.equal(commandValues.length, 3, "each use case needs a copyable CLI command");
for (const command of commandValues) {
  assert(/^librarium plan ".*" --group (deep|visibility|quick) --json$/.test(command), `every use-case command must be a matching offline plan preview: ${command.slice(0, 60)}`);
}
assert(homeText.includes('librarium run "SQLite or Postgres for a small team app?" --group deep --mode async'), "the deep use case must show its own verified run command");
assert(homeText.includes('run "Which luxury villa rental services'), "the visibility use case must show its own run command");
assert(homeText.includes('librarium run "Research the API’s authentication, rate limits, and retry guidance" --group quick --mode sync'), "the quick use case must show its own verified run command");
assert(!homeText.includes('librarium run "…"'), "run examples must carry each question's real group, not a generic quick placeholder");
// Provider tabs: compact logo+name selectors with one result panel at a time.
assert.equal((home.match(/role="tab" id="demo-tab-/g) ?? []).length, 5, "the demo needs five provider tabs");
assert.equal((home.match(/role="tabpanel"[^>]*data-demo-panel=/g) ?? []).length, 5, "the demo needs one panel per provider");
assert(home.includes('aria-label="Provider results"'), "the provider tabs need their tablist label");
assert(home.includes("<noscript><style>[data-demo-panel]"), "script-free visitors must get every provider panel");
// Excerpt honesty: the JSON view labels prefixes and claims no archive access.
assert(home.includes("Excerpts of the captured reports"), "the JSON view must label its content as excerpts");
assert(home.includes("faithful prefixes"), "the JSON view must say the excerpts are faithful prefixes, not full reports");
assert(!home.includes("provider-demo archive"), "no reference to the internal collector archive may appear");
assert(!home.includes("Captured deep-research examples"), "the removed demo caption must stay absent");
assert(!home.includes("nothing about other profiles"), "the removed demo caption paragraph must stay absent");
assert(home.includes('aria-label="Captured research demo'), "the demo region must still be labeled as captured playback, not live");
const logoPaths = [...home.matchAll(/src="(\/providers\/[^\"]+\.(?:svg|png))"/g)].map((match) => match[1]);
assert.equal(new Set(logoPaths).size, 19, "expected every JS brand plus PHP's DataForSEO mark");
for (const provider of PROVIDERS) {
  assert(home.includes(`>${provider.family.replace(" (xAI)", "")}<`), `missing provider brand ${provider.family}`);
}
for (const path of logoPaths) assert(outputPathExists(path), `missing local provider mark ${path}`);
for (const language of ["javascript", "typescript", "laravel"]) {
  const path = `/languages/${language}.svg`;
  assert(home.includes(`src="${path}"`) && outputPathExists(path), `missing language mark ${path}`);
}
assert(!home.includes('/languages/php.svg'), "homepage must use the Laravel mark without a PHP logo");
assert(!home.includes("Open source. Your provider accounts. Provider charges apply."), "removed final CTA disclaimer must stay absent");

for (const name of v1DocNames) {
  const slug = name.replace(/\.md$/, "");
  const route = slug === "index" ? "v1/index.md" : `v1/${slug}.md`;
  assert(existsSync(join(distDir, route)), `legacy raw markdown is missing ${route}`);
}

const v2ProviderHtml = readFileSync(join(distDir, "docs/providers/index.html"), "utf8");
assert(v2ProviderHtml.includes('option value="/v1/providers"'), "v2 provider page must switch to its v1 equivalent");
const v1ProviderHtml = readFileSync(join(distDir, "v1/providers/index.html"), "utf8");
assert(v1ProviderHtml.includes('option value="/docs/providers"'), "v1 provider page must switch to its v2 equivalent");
const requestRetryHtml = readFileSync(join(distDir, "docs/request-and-retry/index.html"), "utf8");
assert(requestRetryHtml.includes('option value="/v1"'), "a v2-only docs page must fall back to the v1 index");
const upgradingHtml = readFileSync(join(distDir, "docs/upgrading-to-v2/index.html"), "utf8");
assert(upgradingHtml.includes('option value="/v1"'), "the v2 upgrade guide must fall back to the v1 index");

const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
assert(!sitemap.includes("/v1"), "noindex legacy docs must be excluded from the sitemap");

const llms = readFileSync(join(distDir, "llms.txt"), "utf8");
for (const fact of [PRODUCT_VERSION, `${PROVIDER_COUNT} built-in providers`, `${PROFILE_COUNT} public profiles`]) {
  assert(llms.includes(fact), `llms.txt is missing ${fact}`);
}
for (const fact of [
  "PHP configures 29 flat Profile IDs",
  "23 baseline entries with `enabled: true`",
  "six disabled-by-default DataForSEO entries",
  ...phpDataForSeoProfiles.map((profile) => `\`${profile}\``),
  "DATAFORSEO_LOGIN",
  "DATAFORSEO_PASSWORD",
  "paid live acceptance remains pending",
]) {
  assert(llms.includes(fact), `llms.txt is missing PHP fact ${fact}`);
}
assert(llms.includes("Legacy v1 documentation is preserved"), "llms.txt must disclose the legacy docs route");
const llmsFull = readFileSync(join(distDir, "llms-full.txt"), "utf8");
assert(llmsFull.includes("Legacy v1 documentation is preserved"), "llms-full.txt must disclose the legacy docs route");

const phpDocNames = readdirSync(phpDocsDir).sort();
assert.equal(phpDocNames.length, 9, "expected the complete first-party PHP documentation set");
const articleSources = [
  ...walk(join(root, "src/content/pages")),
  ...walk(join(root, "src/content/guides")),
].filter((file) => extname(file) === ".md");
assert.equal(htmlFiles.length, 2 + v1DocNames.length + v2DocNames.length + phpDocNames.length + articleSources.length);
for (const sourcePath of articleSources) {
  const source = readFileSync(sourcePath, "utf8");
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
  const route = relative(join(root, "src/content"), sourcePath).replace(/^pages\//, "").replace(/\.md$/, "");
  const raw = readFileSync(join(distDir, `${route}.md`), "utf8");
  const html = readFileSync(join(distDir, route, "index.html"), "utf8");
  assert(raw.includes(body), `${route} Markdown must preserve its full source body`);
  assert(llmsFull.includes(raw.trim()), `full agent bundle must contain ${route}`);
  assert(llms.includes(`/${route}.md`), `agent index must contain ${route}`);
  assert(html.includes(`href="/${route}.md"`), `${route} needs a visible Markdown link`);
  assert(!html.includes('"@type":"SoftwareApplication"'), `${route} must not inherit JavaScript runtime claims`);
}
const guideIndex = readFileSync(join(distDir, "guides/index.html"), "utf8");
const guideMarkdown = readFileSync(join(distDir, "guides/index.md"), "utf8");
assert(llmsFull.includes(guideMarkdown.trim()), "full agent bundle must include the guides index");
for (const route of ["guides/first-query", "guides/agent-research", "guides/laravel-queues", "compare/direct-provider-apis", "stories/agentsy-report"]) {
  assert(guideIndex.includes(`href="/${route}"`), `guides index must link to ${route}`);
  assert(guideMarkdown.includes(`/${route}.md`), `guides Markdown must link to ${route}`);
}
for (const route of ["agents", "cli", "javascript", "laravel"]) {
  assert(home.includes(`href="/${route}"`), `homepage must link to dedicated ${route} page`);
}
const cliMcpHtml = readFileSync(join(distDir, "cli-mcp/index.html"), "utf8");
assert(cliMcpHtml.includes('http-equiv="refresh" content="0; url=/cli"'), "the preserved /cli-mcp route must redirect to /cli");
assert(cliMcpHtml.includes('rel="canonical" href="https://librarium.agentsy.build/cli"'), "the /cli-mcp redirect must canonicalize to /cli");
// The agents page documents host-specific MCP registration from authoritative
// host docs, all five tools with their effects, and no jargon in the intro.
const agentsHtml = readFileSync(join(distDir, "agents/index.html"), "utf8");
const agentsText = agentsHtml.replace(/<[^>]*>/g, "");
for (const spelling of [
  "claude mcp add --scope user librarium -- librarium mcp",
  "codex mcp add librarium -- librarium mcp",
  "[mcp_servers.librarium]",
  "mcpServers",
  "amp mcp add librarium -- librarium mcp",
  "mcp_servers:",
  "opencode.json",
]) {
  assert(agentsText.includes(spelling), `the agents page must include the host-specific registration for ${spelling.slice(0, 24)}`);
}
for (const tool of ["research", "get_results", "check_async", "list_providers", "list_groups"]) {
  assert(agentsText.includes(tool), `the agents page must document the ${tool} tool`);
}
assert(agentsText.includes("no `plan` tool".replace(/`/g, "")) || agentsText.includes("no plan tool"), "the agents page must state plan is CLI-only");
assert(agentsText.includes("Input:") && agentsText.includes("Output:"), "each tool needs inputs and outputs");
assert(!agentsText.includes("verified against"), "host sections must link authoritative docs, not narrate verification");
for (const link of ["code.claude.com/docs/en/mcp", "developers.openai.com/codex/mcp", "cursor.com/docs/mcp", "opencode.ai/docs/mcp-servers/", "v2.opencode.ai/mcp", "ampcode.com/manual/mcp", "hermes-agent.nousresearch.com/docs/user-guide/features/mcp"]) {
  assert(agentsHtml.includes(link), `the agents page must inline-link the authoritative host docs at ${link}`);
}
assert(!agentsText.includes("already paid for"), "check_async must not promise prior payment; pending charges stay unknown");
assert(!agentsText.includes("runs no code"), "get_results must state narrowed guarantees, not the removed blanket claim");
assert(!agentsText.includes("or `mixed`"), "the research mode list must not present mixed as coequal");
assert(!agentsText.includes("after a person approves the spend"), "research use must reference the authorized scope, not mandatory per-call approval");
assert(!agentsText.includes("canonical setup prompt"), "the removed jargon phrase must stay absent from the agents page");
assert(!agentsText.includes("compact index"), "the removed jargon phrase must stay absent from the agents page");
assert(home.includes("Show the prompt") && !home.includes("See a research brief"));
for (const eyebrow of ["Provenance", "Cost controls", "Long-running research"]) {
  assert(!home.includes(`>${eyebrow}</p>`), `removed ${eyebrow} eyebrow must stay absent`);
}
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const svg of html.matchAll(/<svg\b[^>]*>/g)) {
    assert(svg[0].includes("data-icon=") || svg[0].includes('data-brand="librarium"'), `${relative(distDir, file)} has a non-Phosphor UI icon`);
  }
  for (const link of html.matchAll(/href="(\/[^\"]*#[^\"]+)"/g)) {
    const [path, anchor] = link[1].split("#");
    const clean = path.replace(/^\//, "").replace(/\/$/, "");
    if (extname(clean)) continue;
    const target = readFileSync(join(distDir, clean, "index.html"), "utf8");
    assert(target.includes(`id="${anchor}"`), `missing internal anchor ${link[1]}`);
  }
}
for (const [directory, route, names] of [
  [docsDir, "docs", v2DocNames], [phpDocsDir, "docs/php", phpDocNames], [v1DocsDir, "v1", v1DocNames],
]) {
  const bundle = readFileSync(join(distDir, route, "all.md"), "utf8");
  for (const name of names) {
    const slug = name.replace(/\.md$/, "");
    const source = readFileSync(join(directory, name), "utf8");
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
    const raw = readFileSync(join(distDir, route, name), "utf8");
    const html = readFileSync(join(distDir, route, slug === "index" ? "index.html" : `${slug}/index.html`), "utf8");
    assert(raw.includes(body), `${route}/${name} must preserve the complete source body`);
    assert(bundle.includes(raw.trim()), `${route}/all.md must contain ${name} in full`);
    assert(html.includes(`href="/${route}/${name}"`), `${route}/${slug} needs a visible Markdown link`);
    assert(html.includes(`href="/${route}/all.md"`), `${route}/${slug} needs a complete bundle link`);
    const navigation = html.match(/<nav aria-label="Documentation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert(navigation, `${route}/${slug} needs grouped documentation navigation`);
    for (const doc of names) {
      const docSlug = doc.replace(/\.md$/, "");
      const href = docSlug === "index" ? `/${route}` : `/${route}/${docSlug}`;
      assert(navigation.includes(`href="${href}"`), `${route}/${slug} navigation omits ${doc}`);
    }
    for (const outline of html.matchAll(/<ul[^>]*data-docs-outline[^>]*>([\s\S]*?)<\/ul>/g)) {
      for (const anchor of outline[1].matchAll(/href="#([^\"]+)"/g)) {
        assert(html.includes(`id="${anchor[1]}"`), `${route}/${slug} outline has a missing heading ${anchor[1]}`);
      }
    }
    for (const language of ["javascript", "laravel"]) {
      assert(html.includes(`src="/languages/${language}.svg"`), `${route}/${slug} picker needs ${language} mark`);
    }
    assert(!html.includes('/languages/php.svg'), `${route}/${slug} must use only the Laravel mark for PHP`);
    if (route !== "v1") {
      assert(llmsFull.includes(raw.trim()), `combined docs must contain ${route}/${name} in full`);
      assert(llms.includes(`/${route}/${name}`), `agent index must link to ${route}/${name}`);
    }
    const oppositeRoot = route === "docs/php" ? "docs" : "docs/php";
    const oppositeNames = route === "docs/php" ? v2DocNames : phpDocNames;
    const switchHref = slug === "index" || !oppositeNames.includes(name) ? `/${oppositeRoot}` : `/${oppositeRoot}/${slug}`;
    assert(html.includes(`href="${switchHref}"`), `${route}/${slug} needs the equivalent language topic or index fallback`);
    if (route === "docs/php") {
      assert(!html.includes('"@type":"SoftwareApplication"'), "PHP must not inherit JavaScript runtime/version metadata");
      assert(!html.includes('id="docs-version-'), "PHP must not invent JavaScript version navigation");
      assert(html.includes('aria-current="true"'), "PHP needs an accessible current-language indicator");
    }
  }
}
const homeMarkdown = readFileSync(join(distDir, "index.md"), "utf8");
assert(llmsFull.includes(homeMarkdown.trim()), "full agent document must include the homepage");
for (const text of ["Give your agent more than one source.", "composer require jkudish/laravel-ai-librarium", "Amalfi Coast"]) {
  assert(home.includes(text) && homeMarkdown.includes(text), `homepage HTML and Markdown must include ${text}`);
}
assert(!home.includes("Two first-party implementations"), "the removed first-party eyebrow must stay absent");
assert(home.includes("npm install -g librarium"), "homepage HTML must include the npm CLI install command");
assert(homeMarkdown.includes("npm install -g librarium"), "homepage Markdown must include the npm CLI install command");
assert(!home.includes("npm install -g ."), "homepage install must not assume a source checkout");
for (const result of example.results) {
  // Captured provider wording is markdown-formatted; the Markdown endpoint
  // escapes/rewrites markdown syntax, so compare on flattened text.
  const flatten = (text) => text.replace(/[\\`#*|>\-[\]()]/g, " ").replace(/\s+/g, " ");
  const flatMarkdown = flatten(homeMarkdown);
  assert(flatMarkdown.includes(flatten(result.content)), "homepage Markdown must retain all example findings");
  for (const citation of result.citations) assert(homeMarkdown.includes(citation.url), "homepage Markdown must retain citations");
}
assert(!/<(?:script|style|button)\b/.test(homeMarkdown), "homepage Markdown must not contain UI scripts or controls");
assert(!/>0[1-9](?:\s*\/[^<]*)?</.test(home), "decorative numbered subheadings must be absent");
assert(home.includes('data-href="/docs/php#install"'), "PHP setup must target its own installation guide");
for (const choice of ["cli", "javascript", "laravel", "agent"]) {
  assert(home.includes(`data-logo="${choice}"`), `setup must offer ${choice} separately`);
}
assert(home.includes("19 integrations"), "homepage brand count must use integrations wording");
assert(home.includes('id="copy-install"') && home.includes('id="install-output"'), "setup needs a shared visible output and copy control");
assert(home.includes('data-href="/docs/using-with-agents#mcp-server"'), "agent setup must link to MCP instructions");
assert(home.includes('id="page-format-control" class="fixed '), "page format control must float");
assert(readFileSync(join(distDir, "docs/php/index.html"), "utf8").includes('id="install"'));
for (const route of ["/index.md", "/docs/all.md", "/docs/php/all.md", "/v1/all.md"]) {
  assert(llms.includes(route), `agent index is missing ${route}`);
}

console.log(`Verified ${PROVIDER_COUNT} providers, ${PROFILE_COUNT} profiles, ${WORKFLOWS.length} workflows, ${htmlFiles.length} HTML pages, metadata, llms files, and internal links.`);
console.log(`Verified ${phpDocNames.length} PHP pages, every page's complete Markdown, three language/version bundles, combined agent content, and language-switch destinations.`);
