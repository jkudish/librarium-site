// Every HTML page has a Markdown twin: section indexes live at
// `<section>/index.md`, all other pages at `<path>.md`. The header's Machine
// view and the <head> alternate link share this mapping so they cannot drift.
const INDEX_ROUTES = new Set(["", "/docs", "/docs/php", "/v1", "/guides"]);

export function markdownHrefFor(pathname: string): string {
  const path = pathname.replace(/\/$/, "");
  return INDEX_ROUTES.has(path) ? `${path}/index.md` : `${path}.md`;
}
