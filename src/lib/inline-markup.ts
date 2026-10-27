/**
 * Static, trusted page copy only: escape HTML, then render `code` spans and
 * [label](href) links with the product pages' inline styles. Mirrors the
 * helper in src/pages/agents.astro so all product pages read the same.
 */
export const inline = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/`([^`]+)`/g, (_, code: string) =>
      // Keep short tokens such as `--wait` whole; let long ones wrap on mobile.
      `<code class="rounded-sm bg-neutral-950/4 px-1 py-px font-mono text-[0.875em] text-neutral-950 ${code.length <= 24 ? "whitespace-nowrap" : "break-all"}">${code}</code>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="font-medium text-amber-700 underline decoration-amber-700/30 underline-offset-[3px] hover:text-amber-600">$1</a>');
