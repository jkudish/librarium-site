/**
 * Read fenced code blocks out of a Markdown source so a designed page can
 * show the exact examples its Markdown twin serves to agents. Pages select a
 * block by a distinctive substring and fail the build if it disappears.
 */
export interface FencedBlock {
  lang: string;
  code: string;
}

export function fencedBlocks(markdown: string): FencedBlock[] {
  return [...markdown.matchAll(/^```([\w-]*)\n([\s\S]*?)\n```$/gm)].map((match) => ({ lang: match[1], code: match[2] }));
}

export function pickBlock(blocks: FencedBlock[], lang: string, marker: string, source: string): string {
  const block = blocks.find((candidate) => candidate.lang === lang && candidate.code.includes(marker));
  if (!block) throw new Error(`${source} no longer has a ${lang} block containing ${JSON.stringify(marker)}`);
  return block.code;
}
