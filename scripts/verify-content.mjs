import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { parse } from "node-html-parser";
import catalog from "librarium-spec/sources.json" with { type: "json" };
import { NODE_FLOOR, PRODUCT_VERSION, SOURCES, ENGINES, SOURCE_COUNT, ENGINE_COUNT, FEATURED_SOURCES, WORKFLOWS } from "../src/data/product.ts";
import { AGENT_SETUP_PROMPT, INSTALL_CHOICES, agentSetupPromptFor } from "../src/data/setup-prompt.ts";
import { RESEARCH_COMMANDS } from "../src/data/research-commands.ts";
import { READING_LABELS } from "../src/data/reading-labels.ts";
import { RESEARCH_DEMO, RUN_EXAMPLE, cleanCitationMarkers, renderCapturedMarkdown } from "../src/data/research-demo.ts";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const read = (path) => readFileSync(join(root, path), "utf8");
const output = (path) => readFileSync(join(dist, path), "utf8");
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const parseOptions = { blockTextElements: { script: true, style: true } };
const text = (html) => parse(html, parseOptions).textContent;
const body = (markdown) => markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
const flatten = (value) => value.replace(/[\\`#*>\-[\]()|]/g, " ").replace(/\s+/g, " ").trim();

assert.equal(NODE_FLOOR, "22.12.0");
assert.equal(PRODUCT_VERSION, "2.0.0");
assert.deepEqual(SOURCES, catalog.sources.filter((source) => source.kind === "research"));
assert.deepEqual(ENGINES, catalog.engines);
assert.equal(SOURCE_COUNT, 16);
assert.equal(ENGINE_COUNT, 5);
assert.deepEqual(FEATURED_SOURCES.map((source) => source.id), SOURCES.map((source) => source.id));
assert.deepEqual(WORKFLOWS.map((choice) => choice.id), ["quick", "deep", "engines"]);

// The historical capture must not be rewritten to look like a new-contract run.
assert.equal(createHash("sha256").update(read("src/data/provider-display-fixture.json")).digest("hex"),
  "e5d2aa028e6d0af9baef4eb79bc458eb34c8feb6d2eff602d8ce058a8a30cc12");
assert.equal(renderCapturedMarkdown('[source](https://example.test/"onmouseover="alert`1`)'),
  '<p><a href="https://example.test/&quot;onmouseover=&quot;alert`1`" target="_blank" rel="noopener noreferrer">source</a></p>');
assert.equal(renderCapturedMarkdown('[source](javascript:alert`1`) <img src=x onerror=alert`1`>'),
  '<p>[source](javascript:alert`1`) &lt;img src=x onerror=alert`1`&gt;</p>');
assert(RESEARCH_DEMO.scopeNote.includes("Historical provider capture"));
for (const result of RESEARCH_DEMO.results.filter((result) => result.title)) {
  assert.notEqual(result.displayContent.trimStart().split("\n")[0].replace(/^#{1,2} /, ""), result.title);
}

assert(existsSync(dist), "run npm run build before content verification");
const redirects = { "docs/groups-and-modes/index.html": "/docs/source-selection", "docs/php/groups-and-modes/index.html": "/docs/php/source-selection" };
const htmlFiles = walk(dist).filter((path) => extname(path) === ".html" && !Object.hasOwn(redirects, relative(dist, path)));
for (const [path, destination] of Object.entries(redirects)) {
  assert.equal(parse(output(path)).querySelector('meta[http-equiv="refresh"]')?.getAttribute("content"), `0;url=${destination}`);
  assert(!output("sitemap-0.xml").includes(path.replace(/\/index.html$/, "")));
}
// No UI-only H2 exclusions are currently necessary. Add only route-scoped
// headings here with a comment explaining why their content is UI-only.
const uiOnlyH2 = {};
// Astro typography turns quotes and double hyphens into smart punctuation.
const headingText = (value) => value.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`_]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]|-{2,3}/g, "-").replace(/\s+/g, " ").trim().replace(/\.$/, "");
const assertHeadingParity = (page, markdown, route) => {
  // Fenced examples are not the document's outline, even if they contain ##.
  const prose = markdown.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "");
  const headings = new Set([...prose.matchAll(/^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) => headingText(match[1])));
  for (const heading of page.querySelectorAll("h2")) {
    const name = headingText(heading.textContent);
    assert(headings.has(name) || uiOnlyH2[route]?.includes(name), `${route}: HTML H2 "${name}" missing from Markdown`);
  }
};
const outputPath = (pathname) => {
  const clean = pathname.replace(/^\//, "").replace(/\/$/, "");
  return existsSync(join(dist, clean, "index.html")) ? join(dist, clean, "index.html") : join(dist, clean || "index.html");
};
for (const path of htmlFiles) {
  const html = readFileSync(path, "utf8");
  const page = parse(html, parseOptions);
  const label = relative(dist, path);
  assert.equal(page.querySelectorAll("h1").length, 1, `${label} must have exactly one H1, including hidden panels`);
  assert.equal(page.querySelectorAll("footer h1, footer h2, footer h3, footer h4, footer h5, footer h6").length, 0, `${label} footer must not add outline headings`);
  const pageCopy = page.querySelector("[data-copy-page], [data-copy-article]");
  if (pageCopy) {
    assert.equal(pageCopy.querySelector("[data-copy-label]")?.textContent, "Copy page as markdown");
    assert(pageCopy.querySelector('[data-icon="copy"]') && pageCopy.querySelector('[data-icon="check"]'));
  }
  for (const selector of ["title", 'meta[name="description"]', 'link[rel="canonical"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'script[type="application/ld+json"]']) {
    assert(page.querySelector(selector), `${label} missing ${selector}`);
  }
  for (const href of ["/favicon.svg", "/favicon.png", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png", "/site.webmanifest"]) {
    assert(page.querySelector(`head link[href="${href}"]`), `${label} missing icon/manifest link ${href}`);
  }
  assert.equal(page.querySelector('meta[name="theme-color"]')?.getAttribute("content"), "#C4501E");
  const machine = page.querySelector("#machine-view")?.getAttribute("href");
  assert(machine?.endsWith(".md") && existsSync(outputPath(machine)), `${label} missing Markdown destination`);
  if (/^(?:docs|v1)\//.test(label) || ["cli", "javascript", "laravel", "agents"].some((route) => label === `${route}/index.html`)) {
    assertHeadingParity(page, readFileSync(outputPath(machine), "utf8"), label);
  }
  const legacy = label.startsWith("v1/");
  assert.equal(!!page.querySelector('meta[name="robots"][content="noindex, follow"]'), legacy, `${label} legacy robots mismatch`);
  if (legacy) assert(html.includes("Legacy v1 documentation.") && !html.includes('"@type":"SoftwareApplication"'));
  for (const link of page.querySelectorAll("[href]")) {
    const href = link.getAttribute("href");
    if (!href.startsWith("/")) continue;
    const [pathname, anchor] = href.split("#");
    assert(!/^\/docs\/(?:php\/)?groups-and-modes(?:\/|$|\.md)/.test(pathname), `${label} links to retired route ${href}`);
    const target = outputPath(pathname.split("?")[0]);
    assert(existsSync(target), `${label} missing link ${href}`);
    if (anchor && !extname(pathname)) {
      assert(parse(readFileSync(target, "utf8")).querySelectorAll("[id]").some((node) => node.id === anchor), `${label} missing anchor ${href}`);
    }
  }
  for (const svg of page.querySelectorAll("svg")) {
    assert(svg.hasAttribute("data-icon") || ["librarium", "agentsy"].includes(svg.getAttribute("data-brand")), `${label} non-Phosphor UI icon`);
  }
}
for (const file of ["llms.txt", "llms-full.txt", "robots.txt", "sitemap-index.xml", "og.jpg", "demo.gif"]) assert(existsSync(join(dist, file)), `missing ${file}`);
assert(!output("sitemap-0.xml").includes("/v1"));
assert(!output("sitemap-0.xml").includes("/cli-mcp"));
for (const [file, size] of [["favicon.png", 64], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  const png = readFileSync(join(dist, file));
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${file} must be PNG`);
  assert.equal(png.readUInt32BE(16), size, `${file} width`);
  assert.equal(png.readUInt32BE(20), size, `${file} height`);
}
assert.equal(output("favicon.svg"), output("brand/librarium-icon-orange.svg"));
assert(!output("brand/librarium-icon-orange-square.svg").includes('rx="22"'));
const manifest = JSON.parse(output("site.webmanifest"));
assert.equal(manifest.name, "Librarium");
assert.equal(manifest.theme_color, "#C4501E");
assert.equal(manifest.background_color, "#F9F8F5");
assert.deepEqual(manifest.icons, [
  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
]);

const llms = output("llms.txt");
const full = output("llms-full.txt");
assert(llms.includes(`${SOURCE_COUNT} research sources`) && llms.includes(`${ENGINE_COUNT} AI answer engines`));
const llmsSections = ["Start here by goal", "Glossary", "Version boundaries", "Product pages", "JavaScript documentation", "PHP / Laravel documentation", "Guides, comparisons, and field notes", "Markdown bundles and repositories", "Compact operational rules"];
assert.deepEqual([...llms.matchAll(/^## (.+)$/gm)].map((match) => match[1]), llmsSections);
assert(!llms.includes("CLI & MCP") && !llms.includes("collector") && !llms.includes("named-only"));
assert(full.indexOf("# Getting started") < full.indexOf("# Homepage"));
// Release-status banners must not reappear in HTML or its machine-readable mirrors.
for (const path of walk(dist).filter((path) => [".html", ".md", ".txt"].includes(extname(path)))) {
  const prose = extname(path) === ".html" ? text(readFileSync(path, "utf8")) : readFileSync(path, "utf8");
  assert(!/\bunreleased\b|candidate instructions|published packages may|after authorizing|examples do not authorize provider charges/i.test(prose), `${relative(dist, path)} contains a removed disclaimer`);
}
assert(llms.includes("Legacy v1 documentation is preserved") && full.includes("Legacy v1 documentation is preserved"));

// Raw pages and bundles must retain every authored paragraph, not excerpts.
const collections = [
  ["docs", "docs"], ["php-docs", "docs/php"], ["v1-docs", "v1"],
];
const namesFor = (collection) => readdirSync(join(root, "src/content", collection)).sort();
const jsNames = namesFor("docs");
const phpNames = namesFor("php-docs");
const legacyNames = namesFor("v1-docs");
for (const name of legacyNames) assert(jsNames.includes(name === "groups-and-modes.md" ? "source-selection.md" : name), `lost equivalent legacy route ${name}`);
assert.equal(phpNames.length, 10);
for (const [collection, route] of collections) {
  const names = namesFor(collection);
  const bundle = output(`${route}/all.md`);
  for (const name of names) {
    const slug = name.replace(/\.md$/, "");
    const raw = output(`${route}/${name}`);
    const html = output(`${route}/${slug === "index" ? "" : `${slug}/`}index.html`);
    const page = parse(html, parseOptions);
    assert(raw.includes(body(read(`src/content/${collection}/${name}`))), `${route}/${name} truncated raw body`);
    assert(bundle.includes(raw.trim()), `${route}/${name} missing from bundle`);
    assert(html.includes(`href="/${route}/${name}"`) && html.includes(`href="/${route}/all.md"`));
    const nav = page.querySelector('nav[aria-label="Documentation"]');
    assert(nav, `${route}/${slug} missing documentation navigation`);
    for (const doc of names) {
      const docSlug = doc.replace(/\.md$/, "");
      const href = docSlug === "index" ? `/${route}` : `/${route}/${docSlug}`;
      assert(nav.querySelectorAll("a").some((node) => node.getAttribute("href") === href), `${route}/${slug} omits ${doc}`);
    }
    for (const outline of page.querySelectorAll("[data-docs-outline] a")) {
      const id = outline.getAttribute("href").slice(1);
      assert(page.querySelectorAll("[id]").some((node) => node.id === id), `${route}/${slug} missing outline ${id}`);
    }
    for (const language of ["javascript", "laravel"]) assert(html.includes(`/languages/${language}.svg`));
    const opposite = route === "docs/php" ? "docs" : "docs/php";
    const oppositeNames = route === "docs/php" ? jsNames : phpNames;
    const oppositeSlug = slug === "groups-and-modes" ? "source-selection" : slug;
    const href = slug === "index" || !oppositeNames.includes(`${oppositeSlug}.md`) ? `/${opposite}` : `/${opposite}/${oppositeSlug}`;
    assert(html.includes(`href="${href}"`), `${route}/${slug} missing equivalent language link`);
    if (route !== "v1") assert(full.includes(raw.trim()) && llms.includes(`/${route}/${name}`));
    if (route === "docs/php") assert(!html.includes('"@type":"SoftwareApplication"') && !html.includes('id="docs-version-') && html.includes('aria-current="true"'));
  }
}
for (const route of ["docs/providers", "v1/providers"]) {
  const opposite = route.startsWith("v1") ? "/docs/providers" : "/v1/providers";
  assert(output(`${route}/index.html`).includes(`option value="${opposite}"`));
}
for (const slug of ["request-and-retry", "upgrading-to-v2"]) assert(output(`docs/${slug}/index.html`).includes('option value="/v1"'));

const articles = ["pages", "guides"].flatMap((collection) => walk(join(root, "src/content", collection))).filter((path) => extname(path) === ".md");
for (const path of articles) {
  const route = relative(join(root, "src/content"), path).replace(/^pages\//, "").replace(/\.md$/, "");
  const raw = output(`${route}.md`);
  const html = output(`${route}/index.html`);
  assert(raw.includes(body(readFileSync(path, "utf8"))), `${route} lost authored content`);
  if (route === "cli-mcp") assert(!full.includes(raw.trim()) && !llms.includes(`/${route}.md`), "redirect must not enter agent bundles");
  else assert(full.includes(raw.trim()) && llms.includes(`/${route}.md`), `${route} missing from agent bundles`);
  assert(html.includes(`href="/${route}.md"`) && !html.includes('"@type":"SoftwareApplication"'));
}
assert.equal(htmlFiles.length, 2 + legacyNames.length + jsNames.length + phpNames.length + articles.length);
for (const route of ["guides/first-query", "guides/agent-research", "guides/laravel-queues", "compare/direct-provider-apis", "stories/agentsy-report"]) {
  assert(output("guides/index.html").includes(`href="/${route}"`));
  assert(output("guides/index.md").includes(`/${route}.md`));
}
assert(full.includes(output("guides/index.md").trim()));
assert(output("cli-mcp/index.html").includes('http-equiv="refresh" content="0; url=/cli"'));

// Current executable examples must not silently teach the retired surface.
const current = ["docs", "php-docs", "guides", "pages"].flatMap((collection) => walk(join(root, "src/content", collection))).filter((path) => extname(path) === ".md" && !path.includes("/stories/"));
for (const path of current) {
  for (const match of readFileSync(path, "utf8").matchAll(/^```(?:bash|php|ts|json)\n([\s\S]*?)\n```$/gm)) {
    assert(!/\blibrarium (?:run|plan|init|doctor|status)\b|Librarium::query\(|\b(?:get_results|check_async|list_providers|list_groups)\b/.test(match[1]), `${relative(root, path)} contains retired executable API`);
  }
}
const agents = output("agents/index.html");
const agentsText = text(agents);
for (const spelling of ["claude mcp add --scope user librarium -- librarium mcp", "[mcp_servers.librarium]", "mcpServers", "amp mcp add librarium -- librarium mcp", "mcp_servers:", "opencode.json", "cmd mcp add --scope user librarium -- librarium mcp", "gemini mcp add --scope user librarium librarium mcp", "openclaw mcp add librarium --command librarium --arg mcp", "opencode mcp add librarium --global -- librarium mcp", "pi mcp add librarium -- librarium mcp", "context_servers", "legacy Cascade", "Devin Local"]) assert(agentsText.includes(spelling), `missing host registration ${spelling}`);
for (const tool of ["research", "get_run", "list_sources"]) assert(agentsText.includes(tool));
assert(agentsText.includes("exactly three tools") && agentsText.includes("dry_run: true") && agentsText.includes("lower but not raise") && agentsText.includes("until null"));
assert(!/get_results|check_async|list_providers|list_groups|librarium (?:init|doctor|plan)\b/.test(agentsText));
const agentPage = parse(agents, parseOptions);
const agentHosts = [
  ["amp", "Amp"], ["claude-code", "Claude Code"], ["claude-desktop", "Claude Desktop"],
  ["codex", "Codex"], ["command-code", "Command Code"], ["cursor", "Cursor"],
  ["gemini-cli", "Gemini CLI"], ["hermes", "Hermes Agent"], ["openclaw", "OpenClaw"],
  ["opencode", "OpenCode"], ["pi", "Pi"], ["vscode", "VS Code (GitHub Copilot)"],
  ["windsurf", "Windsurf"], ["zed", "Zed"],
];
const agentMarkdown = read("src/content/pages/agents.md");
const installMarkdown = read("src/data/install.md");
const registrationSections = (markdown) => [...markdown.matchAll(/^\*\*([^\n]+?)\*\*[^\n]*[\s\S]*?(?=^\*\*|^## |$(?![\s\S]))/gm)];
const markdownHosts = [...agentHosts.map(([, name]) => name), "Any other MCP host"];
assert.deepEqual(registrationSections(agentMarkdown).map((match) => match[1]), markdownHosts);
assert.deepEqual(registrationSections(installMarkdown).map((match) => match[1]), markdownHosts);
assert.deepEqual(agentPage.querySelectorAll('#host-tabs [role="tab"]').map((tab) => tab.id), [...agentHosts.map(([id]) => `host-tab-${id}`), "host-tab-other"]);
assert.deepEqual(agentPage.querySelectorAll('[data-host-link]').map((link) => link.getAttribute("data-host-link")), agentHosts.map(([id]) => id));
assert.equal(agentPage.querySelectorAll('[role="tabpanel"]').length, agentHosts.length + 1);
assert.equal(agentPage.querySelectorAll('button[aria-label="Copy setup prompt"]').length, 0);
for (const [id, host] of [...agentHosts, ["other", "my coding agent"]]) {
  const panel = agentPage.querySelector(`#host-panel-${id}`);
  const prompt = agentSetupPromptFor(host);
  assert.equal(panel.querySelector("button[data-copy]").getAttribute("data-copy"), prompt);
  assert(agentsText.includes(prompt) && agentMarkdown.includes(`\`\`\`text\n${prompt}\n\`\`\``), `missing exact host prompt ${host}`);
  const index = id === "other" ? agentHosts.length : agentHosts.findIndex(([key]) => key === id);
  const mdSection = registrationSections(agentMarkdown)[index][0];
  const installSection = registrationSections(installMarkdown)[index][0];
  const snippets = (section) => [...section.matchAll(/^```(bash|json|toml|yaml)\n([\s\S]*?)\n```/gm)].map((match) => match[2]);
  assert.deepEqual(panel.querySelectorAll("pre code").map((code) => code.textContent), snippets(mdSection), `${host} HTML/Markdown snippet drift`);
  assert.deepEqual(snippets(mdSection), snippets(installSection), `${host} install/Markdown snippet drift`);
  for (const link of panel.querySelectorAll('a[href^="https:"]')) {
    const href = link.getAttribute("href");
    assert(mdSection.includes(href) && installSection.includes(href), `${host} docs link drift: ${href}`);
  }
  if (id !== "other") {
    const logo = panel.querySelector("img").getAttribute("src");
    assert(existsSync(join(dist, logo)) && read("public/providers/SOURCES.md").includes(logo.split("/").at(-1)), `${host} logo missing or unattributed`);
  }
}
assert.equal(agentPage.querySelectorAll('table tbody tr').length, 3);
for (const [route, platform] of [["cli", "cli"], ["agents", "cli"], ["javascript", "javascript"], ["laravel", "laravel"]]) {
  const page = parse(output(`${route}/index.html`), parseOptions);
  const steps = page.querySelector(`[data-research-steps="${platform}"]`);
  assert(steps, `${route} missing shared workflow`);
  const commands = RESEARCH_COMMANDS[platform];
  const installs = "installOptions" in commands ? commands.installOptions.map((option) => option.install) : [commands.install];
  assert.equal(steps.querySelector('p').textContent, commands.requirement);
  assert.deepEqual(steps.querySelectorAll('code').map((node) => node.textContent), [...installs, commands.setup, commands.preview, commands.research]);
  if ("installOptions" in commands) {
    assert.equal(commands.installOptions[0].install, commands.install, "npm stays the default CLI install");
    for (const option of commands.installOptions) assert.equal(steps.querySelector(`[data-install-option="${option.id}"]`)?.textContent, option.label);
  }
  const markdown = output(`${route}.md`);
  for (const command of [commands.install, commands.setup, commands.preview, commands.research]) assert(markdown.includes(command), `${route}.md missing canonical command ${command}`);
  assert(page.querySelector('a[href$="/costs-and-limits"]'), `${route} missing costs reference`);
}
for (const [path, labels] of Object.entries(READING_LABELS)) {
  for (const label of Object.values(labels)) assert(text(output("guides/index.html")).includes(label) && output("guides/index.md").includes(label), `missing reading label ${path}: ${label}`);
}
for (const route of ["docs", "docs/php"]) {
  const costs = text(output(`${route}/costs-and-limits/index.html`));
  for (const fact of ["catalog order", "unpriced", "over_budget", "In-flight work can exceed", "null", "Illustrative"]) assert(costs.includes(fact), `${route} missing cost rule ${fact}`);
}
for (const route of ["laravel.md", "docs/php/index.md", "install.md", "guides/first-query.md"]) {
  const markdown = output(route);
  assert(markdown.includes("composer require jkudish/laravel-ai-librarium") && markdown.includes("php artisan vendor:publish --tag=librarium-config"));
  assert(!markdown.includes("Composer does not inherit repositories") && !markdown.includes('"repositories"') && !markdown.includes("dev-spec-"));
}
assert.equal(AGENT_SETUP_PROMPT, "Install Librarium for me by following https://librarium.agentsy.build/install.md");
assert(read("src/content/pages/stories/agentsy-report.md").includes("historical integration evidence"));

const install = output("install.md");
assert.equal(install, read("src/data/install.md"));
for (const fact of ["If you know which MCP client you are running in, use that client", "Ask which client only if you cannot tell", "Default to user-wide scope unless the user asks for this project only", "Confirm the client and scope with the user before changing configuration", "Do not inspect environment variables to identify the client", "command -v librarium"]) assert(install.includes(fact), `install.md missing auto-detection rule ${fact}`);
assert(!install.includes("## 3. Ask which MCP client and scope"));
for (const fact of ["22.12.0", "npm install -g librarium", "librarium research --help", "librarium setup --help", "paid provider calls without the user's approval", "Keep the user's API keys out of chat and source control", "Never ask the user to paste a key into chat", "never write credentials into a committed file", "Verify the installation offline", "Preserve the user's existing MCP servers", "librarium setup --check", "list_sources"]) assert(install.includes(fact), `install.md missing ${fact}`);
for (const route of ["/install.md", "/index.md", "/docs/all.md", "/docs/php/all.md", "/v1/all.md"]) assert(llms.includes(route));

const home = output("index.html");
const homePage = parse(home, parseOptions);
const homeText = homePage.textContent;
const productDescription = "Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.";
for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
  assert.equal(homePage.querySelector(selector)?.getAttribute("content"), productDescription);
}
const software = JSON.parse(homePage.querySelector('script[type="application/ld+json"]').textContent).find((entry) => entry["@type"] === "SoftwareApplication");
assert.equal(software.description, productDescription);
assert.equal(software.offers.price, "0");
assert.equal(software.offers.priceCurrency, "USD");
assert.equal(software.softwareVersion, "2.0.0");
assert.deepEqual(software.runtimePlatform, ["JavaScript / npm / Node.js 22.12.0+", "PHP 8.4+ / Laravel 13.30+"]);
assert.deepEqual(software.sameAs, ["https://github.com/jkudish/librarium", "https://github.com/jkudish/laravel-ai-librarium"]);
const homeMarkdown = output("index.md");
assert(full.includes("[homepage and historical research demo](https://librarium.agentsy.build/index.md)"));
for (const fact of ["Give your agent more than one source.", "composer require jkudish/laravel-ai-librarium", "What are the best alternatives to Google Analytics?", "php artisan vendor:publish --tag=librarium-config"]) assert(homeText.includes(fact) && homeMarkdown.includes(fact));
assert(homeText.includes(`${SOURCE_COUNT} research sources`) && homeText.includes(`${ENGINE_COUNT} AI answer engines`));
assert.equal(homePage.querySelectorAll("main > section").length, 6);
assert.equal(homePage.querySelectorAll("[data-source]").length, SOURCE_COUNT);
assert.deepEqual(homePage.querySelectorAll("[data-engine]").map((node) => node.getAttribute("data-engine")), ENGINES.map((engine) => engine.id));
for (const engine of ENGINES) assert(homeText.includes(engine.name), `missing engine ${engine.id}`);
for (const source of FEATURED_SOURCES) {
  assert(homeText.includes(source.name), `missing catalog source ${source.id}`);
  const mark = `/providers/${source.logo}.${["you", "serpapi", "dataforseo"].includes(source.logo) ? "png" : "svg"}`;
  assert(home.includes(mark) && existsSync(outputPath(mark)), `missing mark ${source.id}`);
}
assert(homePage.querySelector("#research-example"));
assert.equal(homePage.querySelectorAll('[role="tab"][id^="demo-tab-"]').length, 5);
assert.equal(homePage.querySelectorAll('[role="tabpanel"][data-demo-panel]').length, 5);
assert(homeText.includes("separate example, not the historical capture"));
const example = JSON.parse(homePage.querySelector("#example-json pre code").textContent);
assert.deepEqual(example, RUN_EXAMPLE);
assert.deepEqual(example, JSON.parse(read("node_modules/librarium-spec/fixtures/runs/valid/quick-done.json")));
assert.equal(example.spec, "librarium.run/1");
assert.equal(homePage.querySelector("#demo-query").textContent, RESEARCH_DEMO.query);
assert.equal(homePage.querySelector("#demo-action").textContent, "Deep research");
assert(homeText.includes("Captured September 18, 2026"));
const capture = JSON.parse(read("src/data/provider-display-fixture.json"));
// Keep block boundaries and Markdown link destinations when comparing the
// rendered report with its capture; DOM textContent retains neither.
const captureText = text(home.replace(/<a [^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, " $2 $1 ").replace(/<[^>]*>/g, " "));
for (const result of capture.results) {
  const displayed = RESEARCH_DEMO.results.find((entry) => entry.profile === result.profile);
  assert.equal(displayed.content, result.content, `changed captured wording ${result.profile}`);
  assert(flatten(captureText).includes(flatten(cleanCitationMarkers(displayed.displayContent))), `missing rendered capture ${result.profile}`);
  assert(flatten(homeMarkdown).includes(flatten(cleanCitationMarkers(displayed.displayContent))), `missing Markdown capture ${result.profile}`);
  if (result.title) assert(homeMarkdown.includes(result.title), `missing capture title ${result.profile}`);
  for (const citation of result.citations.filter((citation) => !citation.url.includes("vertexaisearch.cloud.google.com")).slice(0, 3)) {
    const label = citation.title ?? new URL(citation.url).hostname;
    assert(displayed.citations.some((entry) => entry.url === citation.url && entry.title === label));
    assert(home.includes(citation.url) && homeMarkdown.includes(citation.url));
  }
}
assert(homeText.includes("Perplexity Research (Agent API)") && homeText.includes("observed model openai/gpt-5.6-sol (provider-reported)"));
assert(!homeText.includes("Sonar model") && !homeText.includes("Sonar Deep Research"));
assert(!/<(?:script|style|button)\b/.test(homeMarkdown));
assert(!/\[(?:web:|cite:)|vertexaisearch\.cloud\.google\.com|^Terminal$|Try this question/m.test(homeMarkdown));
assert(homeMarkdown.includes(AGENT_SETUP_PROMPT) && homeMarkdown.includes("https://librarium.agentsy.build/install.md"));
assert.equal((homeMarkdown.match(/^# /gm) ?? []).length, 1);
const headingLevels = [...homeMarkdown.matchAll(/^(#{1,6}) /gm)].map((match) => match[1].length);
for (let i = 1; i < headingLevels.length; i++) assert(headingLevels[i] <= headingLevels[i - 1] + 1, "homepage Markdown skips a heading level");
for (const section of homeMarkdown.split(/\*\*Sources \(/).slice(1)) {
  const sourceList = section.split(/^### /m)[0];
  assert((sourceList.match(/^- \[/gm) ?? []).length <= 5, "too many provider citations");
}
for (const workflow of WORKFLOWS) assert(homeMarkdown.includes(`\`\`\`sh\n${workflow.command}\n\`\`\``));
for (const choice of INSTALL_CHOICES) {
  const panel = homePage.querySelector(`#install-panel-${choice.id}`);
  assert.equal(panel.querySelector(`#install-text-${choice.id}`).textContent, choice.text);
  assert.equal(panel.querySelector("button[data-code-copy]").getAttribute("data-copy"), choice.text);
  assert.equal(panel.querySelector("a").getAttribute("href"), choice.href);
  assert(homeMarkdown.includes(choice.text));
}
assert(homeMarkdown.includes("[Set up Librarium](https://librarium.agentsy.build/#install)"));
const agreement = homePage.querySelector('[data-evidence-card="agreement"]');
assert.equal(agreement.querySelectorAll("li").length, 5);
assert(agreement.textContent.includes("named in 4 of 5 provider excerpts"));
assert.equal(agreement.querySelectorAll("li")[2].textContent, "GeminiNot in excerpt");
assert.deepEqual(homePage.querySelectorAll(".compare-table tbody tr").map((row) => row.querySelectorAll("td").map((cell) => cell.textContent)), [
  ["✓", "—", "—", "—"], ["✓", "✓", "✓", "—"], ["—", "—", "—", "—"], ["✓", "✓", "—", "—"], ["✓", "✓", "—", "✓"],
]);
for (const card of homePage.querySelectorAll("[data-evidence-card]")) {
  const figureAt = card.innerHTML.indexOf("<figure");
  assert(card.innerHTML.indexOf("<h3") === 0 || card.innerHTML.trimStart().startsWith("<h3"), "evidence card must open with its heading");
  if (figureAt !== -1) assert(card.innerHTML.indexOf("<h3") < figureAt, "evidence heading must precede figure");
}
assert(home.includes('href="/docs/costs-and-limits"') && home.includes('id="page-format-control" class="fixed '));

// Both dark-mode paths must retain the same palette when either is changed.
const css = read("src/styles/global.css");
const gate = (opener, closer) => {
  const start = css.indexOf(opener);
  assert(start !== -1);
  const end = css.indexOf(closer, start);
  assert(end !== -1);
  return css.slice(start + opener.length, end).split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
};
assert.equal(gate(':root[data-theme="dark"] {', "\n}"), gate(":root:not([data-theme]) {", "\n  }"));
console.log(`Verified ${SOURCE_COUNT} catalog sources, ${ENGINE_COUNT} AI answer engines, ${htmlFiles.length} HTML pages, H2 Markdown parity for all product/docs pages, redirects, complete Markdown/bundles, metadata, navigation, anchors, examples, install safeguards, and unchanged historical capture.`);
