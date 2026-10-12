import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { HTMLElement as HTMLElementClass, type HTMLElement, parse } from "node-html-parser";
import { RESEARCH_DEMO } from "../data/research-demo";
import Home from "../pages/index.astro";

const SITE = "https://librarium.agentsy.build/";

// Purely visual or interactive markup that carries no reading content:
// decorative glyphs, screen-reader link hints, terminal prompt glyphs
// (select-none), menus and tab strips (their panels carry the content), and
// collapsed UI that is not an alternate content view.
const DECORATIVE = [
  "script", "style", "noscript", "template", "svg", "img", "button", "select", "label",
  '[aria-hidden="true"]', ".select-none", '[role="menu"]', '[role="tablist"]',
  "a .sr-only", "#demo-action", "#demo-caret",
].join(", ");

const BLOCK = "p, div, ul, ol, li, pre, table, blockquote, h1, h2, h3, h4, h5, h6";
const INLINE = new Set(["span", "code", "strong", "em", "b", "i", "small", "time", "kbd", "abbr", "mark", "data"]);

const SHELL = /^(?:npm|npx|pnpm|yarn|bun|composer|php|librarium|curl|brew|git|wrangler)\s/;

function codeLanguage(text: string): string {
  const value = text.trim();
  if (SHELL.test(value)) return "sh";
  if (/^[{[]/.test(value)) {
    try { JSON.parse(value); return "json"; } catch { /* not JSON */ }
  }
  return "";
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function codeBlock(text: string): string {
  const language = codeLanguage(text);
  return `<pre><code${language ? ` class="language-${language}"` : ""}>${escapeHtml(text)}</code></pre>`;
}

function escapeLinkText(text: string): string {
  return text.replace(/([\\[\]*_`])/g, "\\$1");
}

function sourcesMarkdown(index: number): string {
  const citations = RESEARCH_DEMO.results[index]?.citations ?? [];
  if (citations.length === 0) return "";
  const items = citations.map(({ title, url }) => {
    const target = /[\s()<>]/.test(url) ? `<${url}>` : url;
    return `- [${escapeLinkText(title || new URL(url).hostname)}](${target})`;
  });
  return `**Sources (${citations.length})**\n\n${items.join("\n")}`;
}

// Restructure the rendered page into reading order before conversion.
function prepare(main: HTMLElement): Map<string, string> {
  const placeholders = new Map<string, string>();

  // Copyable install controls carry real commands: keep them as code blocks.
  for (const button of main.querySelectorAll("button[data-copy-command]")) {
    button.replaceWith(codeBlock(button.getAttribute("data-copy-command") ?? ""));
  }
  // Read-only prompt/command fields: commands become code, prose stays prose.
  for (const field of main.querySelectorAll("textarea")) {
    const text = field.getAttribute("data-copy-value") ?? field.text;
    field.replaceWith(codeLanguage(text) === "sh" ? codeBlock(text) : `<p>${field.innerHTML}</p>`);
  }

  // Hidden UI is dropped; hidden tab panels are alternate views and stay.
  for (const element of main.querySelectorAll("[hidden]")) {
    if (element.getAttribute("role") !== "tabpanel") element.remove();
  }
  for (const element of main.querySelectorAll(DECORATIVE)) element.remove();

  // Raw JSON dumps duplicate the rendered content; prose views win.
  for (const pre of main.querySelectorAll("pre")) {
    if (pre.text.length > 1000 && codeLanguage(pre.text) === "json") pre.remove();
  }

  // Demo query box → quoted question.
  const typed = main.querySelector("#demo-typed");
  typed?.parentNode.replaceWith(`<blockquote><p>${typed.innerHTML}</p></blockquote>`);

  // Each provider panel: "### Provider — 2m 02s", report headings one level
  // below it, and the complete source list instead of the first three links.
  for (const panel of main.querySelectorAll("[data-demo-panel]")) {
    for (const heading of panel.querySelectorAll("h1, h2, h3, h4, h5")) {
      heading.tagName = `h${Math.min(6, Number(heading.tagName.slice(1)) + 1)}`;
    }
    // The visible provider label and duration live on the (dropped) tab chip;
    // the panel's own heading carries the full provider name.
    const heading = panel.querySelector("[data-demo-heading]");
    if (heading) {
      const name = heading.text.replace(/\s+/g, " ").trim();
      const label = panel.getAttribute("data-demo-final")?.trim();
      heading.replaceWith(`<h3>${escapeHtml([name, label].filter(Boolean).join(" — "))}</h3>`);
    }
    const index = Number(panel.getAttribute("data-demo-panel"));
    // The citation strip is the body's link-only row, not links inside the report.
    const body = panel.querySelector("[data-demo-body]");
    const links = body?.childNodes.find((child): child is HTMLElement =>
      child instanceof HTMLElementClass && !child.classList.contains("demo-report") && child.querySelector("a[href]") !== null);
    const sources = sourcesMarkdown(index);
    if (links && sources) {
      const key = `LIBRARIUMSOURCES${index}X`;
      placeholders.set(key, sources);
      links.replaceWith(`<p>${key}</p>`);
    }
  }

  // Mock terminal lines: a paragraph that is exactly a shell command is code.
  for (const line of main.querySelectorAll("p")) {
    const text = line.text.replace(/\s+/g, " ").trim();
    if (line.querySelector(BLOCK) || codeLanguage(text) !== "sh") continue;
    // Fenced blocks cannot sit inside a list item's hard-wrapped lines.
    line.replaceWith(line.closest("li") ? `<p><code>${escapeHtml(text)}</code></p>` : codeBlock(text));
  }

  // Flex/grid rows separate adjacent inline cells with CSS gaps only; give the
  // text a visible separator so "You.com" and "35s" don't fuse into "You.com35s".
  for (const row of main.querySelectorAll("*")) {
    if (!row.classList.value.some((name) => /^(?:inline-)?(?:flex|grid)$/.test(name))) continue;
    let previous: HTMLElement | undefined;
    let gap = false;
    for (const child of [...row.childNodes]) {
      if (!(child instanceof HTMLElementClass)) {
        if (child.text.trim()) previous = undefined;
        else if (/\s/.test(child.rawText)) gap = true;
        continue;
      }
      if (!INLINE.has(child.tagName.toLowerCase()) || !child.text.trim()) {
        if (!INLINE.has(child.tagName.toLowerCase())) previous = undefined;
        continue;
      }
      if (previous && !gap) child.insertAdjacentHTML("beforebegin", " — ");
      previous = child;
      gap = false;
    }
  }

  // Visual line breaks inside headings are not Markdown hard breaks.
  for (const br of main.querySelectorAll("h1 br, h2 br, h3 br, h4 br, h5 br, h6 br")) br.replaceWith(" ");

  // Absolute links, and a separator so adjacent links never run together.
  for (const link of main.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href") ?? "";
    if (/^[/#]/.test(href)) link.setAttribute("href", new URL(href, SITE).href);
    link.insertAdjacentHTML("beforebegin", " ");
    link.insertAdjacentHTML("afterend", " ");
  }
  return placeholders;
}

function splitRow(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((cell) => cell.trim());
}

// Minimal tables, trimmed link text, no trailing padding, collapsed blank runs.
function tidy(markdown: string): string {
  let fenced = false;
  const lines = markdown.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced || /^\s*(```|~~~)/.test(line)) return line;
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const cells = splitRow(line);
      const separator = cells.every((cell) => /^:?-+:?$/.test(cell));
      return `| ${cells.map((cell) => (separator ? "---" : cell)).join(" | ")} |`;
    }
    return line
      .replace(/^ (?=\S)/, "")
      .replace(/\[\s*([^\]\n]*?)\s+\]\(/g, "[$1](")
      .replace(/\) (?=[.,;:!?](?:\s|$))/g, ")")
      .replace(/(\S) {2,}(?=\S)/g, "$1 ")
      .replace(/(\S)(?: | {3,})$/, "$1");
  });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Render the authored page at build time: there is no second marketing copy to drift.
export async function serializeHome(): Promise<string> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Home, {
    request: new Request(SITE),
  });
  const source = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
  if (!source) throw new Error("Homepage Markdown requires a rendered main element");
  // Parse <pre> as markup (node-html-parser treats it as raw text by default).
  const main = parse(source, { blockTextElements: { script: true, noscript: true, style: true } }).querySelector("main");
  if (!main) throw new Error("Homepage Markdown requires a parseable main element");
  const placeholders = prepare(main);
  let markdown = tidy(NodeHtmlMarkdown.translate(main.innerHTML, {
    bulletMarker: "-",
    ignore: ["script", "style", "button", "select", "label", "noscript", "img"],
  }));
  for (const [key, value] of placeholders) markdown = markdown.replace(key, value);
  return markdown + "\n";
}
