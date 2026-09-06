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

const root = resolve(import.meta.dirname, "..");
const docsDir = join(root, "src/content/docs");
const v1DocsDir = join(root, "src/content/v1-docs");
const distDir = join(root, "dist");

const profiles = PROVIDERS.flatMap((provider) => provider.profiles);
const providerIds = new Set(profiles.map((profile) => profile.split("/")[0]));

assert.equal(PRODUCT_VERSION, "2.0.0");
assert.equal(NODE_FLOOR, "22.12.0");
assert.equal(PROVIDER_COUNT, providerIds.size);
assert.equal(PROVIDER_COUNT, 33);
assert.equal(PROFILE_COUNT, profiles.length);
assert.equal(PROFILE_COUNT, 39);
assert.equal(new Set(profiles).size, profiles.length, "profile roster contains duplicates");
assert.deepEqual(WORKFLOWS.map((workflow) => workflow.id), ["quick", "deep", "visibility", "all"]);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "quick")?.selection.length, 6);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "visibility")?.selection.length, 9);
assert(profiles.includes("tavily/search"));
assert(!profiles.includes("tavily/research"));
assert(!profiles.includes("parallel/chat"));

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
assert(!providerDocs.includes("perplexity-advanced-deep"), "retired Perplexity IDs must not appear in the active provider roster");
for (const command of [
  "npm ci",
  "npm run build",
  "npm install -g .",
  "npm install -g librarium",
  "brew install jkudish/tap/librarium",
  "curl -fsSL https://raw.githubusercontent.com/jkudish/librarium/main/scripts/install.sh | sh",
  "librarium init",
  "librarium doctor",
  'librarium run "current guidance for HTTP caching" --group quick',
]) {
  assert(gettingStarted.includes(command), `getting started is missing: ${command}`);
}
assert(publicCopy.includes("The meta harness for research queries."), "the handwritten hero is missing");
assert(publicCopy.includes("Ask once. Librarium fans your query out"), "the handwritten hero body is missing");
assert(publicCopy.includes('{ href: "/#features", label: "Features" }'), "the handwritten Features navigation is missing");
assert(publicCopy.includes('{ href: "/#providers", label: "Providers" }'), "the handwritten Providers navigation is missing");
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
  "33 built-in providers",
  "39 public profiles",
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

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const label = relative(distDir, file);
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
assert(llms.includes("Legacy v1 documentation is preserved"), "llms.txt must disclose the legacy docs route");
const llmsFull = readFileSync(join(distDir, "llms-full.txt"), "utf8");
assert(llmsFull.includes("Legacy v1 documentation is preserved"), "llms-full.txt must disclose the legacy docs route");

console.log(`Verified ${PROVIDER_COUNT} providers, ${PROFILE_COUNT} profiles, ${WORKFLOWS.length} workflows, ${htmlFiles.length} HTML pages, metadata, llms files, and internal links.`);
