import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { NodeHtmlMarkdown } from "node-html-markdown";
import Home from "../pages/index.astro";

// Render the authored page at build time: there is no second marketing copy to drift.
export async function serializeHome(): Promise<string> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Home, {
    request: new Request("https://librarium.agentsy.build/"),
  });
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  if (!main) throw new Error("Homepage Markdown requires a rendered main element");
  const linked = main.replace(/href="([/#][^"]*)"/g, (_, href: string) =>
    `href="${new URL(href, "https://librarium.agentsy.build/").href}"`,
  ).replaceAll("</a>", "</a> ");
  return NodeHtmlMarkdown.translate(linked, {
    ignore: ["script", "style", "button", "select", "label", "noscript", "img"],
  }) + "\n";
}
