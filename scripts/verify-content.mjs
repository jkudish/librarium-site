import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import {
  NODE_FLOOR,
  PRODUCT_VERSION,
  PROFILE_COUNT,
  PROVIDER_COUNT,
  PROVIDERS,
  SOURCE_SHA,
  WORKFLOWS,
} from "../src/data/product.ts";

const root = resolve(import.meta.dirname, "..");
const docsDir = join(root, "src/content/docs");
const v1DocsDir = join(root, "src/content/v1-docs");
const distDir = join(root, "dist");

const profiles = PROVIDERS.flatMap((provider) => provider.profiles);
const providerIds = new Set(profiles.map((profile) => profile.split("/")[0]));

assert.equal(PRODUCT_VERSION, "2.0.0-rc.18");
assert.equal(SOURCE_SHA, "417613e8922fbe74c5e3b239ec02afc0171891a2");
assert.equal(NODE_FLOOR, "22.12.0");
assert.equal(PROVIDER_COUNT, providerIds.size);
assert.equal(PROVIDER_COUNT, 33);
assert.equal(PROFILE_COUNT, profiles.length);
assert.equal(PROFILE_COUNT, 40);
assert.equal(new Set(profiles).size, profiles.length, "profile roster contains duplicates");
assert.deepEqual(WORKFLOWS.map((workflow) => workflow.id), ["quick", "deep", "visibility", "all"]);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "quick")?.selection.length, 6);
assert.equal(WORKFLOWS.find((workflow) => workflow.id === "visibility")?.selection.length, 9);
assert(profiles.includes("tavily/search"));
assert(!profiles.includes("tavily/research"));

const v1DocNames = readdirSync(v1DocsDir).sort();
const v2DocNames = readdirSync(docsDir).filter((file) => file !== "release-candidate.md").sort();
assert.deepEqual(v1DocNames, v2DocNames, "v1 snapshot must preserve every equivalent pre-branch docs route");

const publicSources = [
  join(root, "README.md"),
  ...readdirSync(docsDir).map((file) => join(docsDir, file)),
  join(root, "src/pages/index.astro"),
  join(root, "src/pages/llms.txt.ts"),
  join(root, "src/pages/llms-full.txt.ts"),
  join(root, "src/layouts/Base.astro"),
];
const publicCopy = publicSources.map((file) => readFileSync(file, "utf8")).join("\n");

for (const stale of [
  "31 built-in",
  "31 provider adapters",
  "All 27 grounded",
  "perplexity-advanced-deep",
  "version: 1 as const",
  "schema v1 run directories",
]) {
  assert(!publicCopy.includes(stale), `stale public copy found: ${stale}`);
}
assert(!publicCopy.includes("—"), "public copy contains an em dash");

for (const required of [
  PRODUCT_VERSION,
  SOURCE_SHA,
  "33 built-in providers",
  "40 implemented public profiles",
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
assert(htmlFiles.length >= 22, "expected homepage, v2 docs, and legacy v1 docs HTML output");

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
const releaseCandidateHtml = readFileSync(join(distDir, "docs/release-candidate/index.html"), "utf8");
assert(releaseCandidateHtml.includes('option value="/v1"'), "a v2-only page must fall back to the v1 docs index");

const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
assert(!sitemap.includes("/v1"), "noindex legacy docs must be excluded from the sitemap");

const llms = readFileSync(join(distDir, "llms.txt"), "utf8");
for (const fact of [PRODUCT_VERSION, `${PROVIDER_COUNT} built-in providers`, `${PROFILE_COUNT} implemented public profiles`, SOURCE_SHA]) {
  assert(llms.includes(fact), `llms.txt is missing ${fact}`);
}
assert(llms.includes("Legacy v1 documentation is preserved"), "llms.txt must disclose the legacy docs route");
const llmsFull = readFileSync(join(distDir, "llms-full.txt"), "utf8");
assert(llmsFull.includes("Legacy v1 documentation is preserved"), "llms-full.txt must disclose the legacy docs route");

console.log(`Verified ${PROVIDER_COUNT} providers, ${PROFILE_COUNT} profiles, ${WORKFLOWS.length} workflows, ${htmlFiles.length} HTML pages, metadata, llms files, and internal links.`);
