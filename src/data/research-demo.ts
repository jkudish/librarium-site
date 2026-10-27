// Display fixtures for the animated research demo (#3796).
//
// Source of truth: provider-display-fixture.json — the collector's approved
// archive revision 3 (fixture SHA-256
// e5d2aa028e6d0af9baef4eb79bc458eb34c8feb6d2eff602d8ce058a8a30cc12; bundle
// provider-demo.tar.gz 4076f49b…, checksums lead-verified). One authorized
// run of this exact query on 2026-09-18, plus exactly one authorized fresh
// Exa submission after a credential refresh (no retry, no fallback): all
// five providers succeeded.
//
// Normalization rules (do not editorialize past these):
// - statuses are explicit in the fixture ("succeeded" / "failed");
// - null report titles stay absent — no invented headings;
// - null citation titles display the URL's hostname — never an invented title;
// - provider wording is preserved verbatim;
// - wall-clock durations come from the fixture; animation timing stays
//   illustrative and is never a speed claim about the profiles;
// - Perplexity's product is the Agent API (preset high) with the
//   provider-reported observed model openai/gpt-5.6-sol — never called a
//   "Sonar" model; "sonar" appears only inside the exact roster profile id;
// - archive-internal fields (full-response file names, attempt/task ids,
//   local run paths) are not carried into display data.

import fixture from "./provider-display-fixture.json" with { type: "json" };
import runFixture from "librarium-spec/fixtures/runs/valid/quick-done.json" with { type: "json" };

// A current, schema-valid contract fixture, not a conversion of the historical
// capture. Keep its real required fields; its single result is already concise.
export const RUN_EXAMPLE = runFixture;

export const cleanCitationMarkers = (text: string): string =>
  text.replace(/\[(?:web:\s*\d+|cite:\s*[\d,\s]+|\d+(?:,\s*\d+)*)\]/g, "");

export type DemoCitation = { title: string; url: string };

export type DemoResult = {
  provider: string;
  shortName: string;
  logo: string;
  profile: string;
  status: "ok" | "failed";
  modelLabel: string;
  title: string | null;
  content: string;
  displayContent: string;
  citations: DemoCitation[];
  collectedAt: string;
  elapsedSeconds: number;
};

interface FixtureResult {
  provider: string;
  profile: string;
  title: string | null;
  content: string;
  citations?: Array<{ title: string | null; url: string }>;
  status?: string;
  note?: string;
  collected_at?: string;
  wall_clock_ms?: number;
  model?: string | null;
  preset?: string;
  provider_product?: string;
}

export const RESEARCH_DEMO_QUERY: string = fixture.query;

const DISPLAY: Record<string, { name: string; shortName: string; logo: string }> = {
  "exa": { name: "Exa", shortName: "Exa", logo: "exa" },
  "perplexity-sonar-deep": { name: "Perplexity Research (Agent API)", shortName: "Perplexity", logo: "perplexity" },
  "gemini-deep": { name: "Gemini", shortName: "Gemini", logo: "gemini" },
  "parallel": { name: "Parallel", shortName: "Parallel", logo: "parallel" },
  "you-research": { name: "You.com", shortName: "You.com", logo: "you" },
};

const hostname = (url: string) => new URL(url).hostname;

// Minimal, build-time markdown rendering for the captured report excerpts.
// Captured wording only uses headings, bold runs, inline links, dash
// bullets, and pipe tables, so this covers exactly those constructs:
// everything is HTML-escaped first and only http(s) links become anchors,
// so no raw provider HTML can pass through. Structural text stays
// verbatim — flatten-based verification still matches the capture.
export function renderCapturedMarkdown(source: string): string {
  const inline = (text: string) => text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = cleanCitationMarkers(source).split("\n");
  const out: string[] = [];
  let listOpen = false;
  const closeList = () => { if (listOpen) { out.push("</ul>"); listOpen = false; } };
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (/^\|/.test(line.trim())) {
      const rows: string[][] = [];
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        const cells = lines[index].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{2,}:?$/.test(cell))) rows.push(cells);
        index += 1;
      }
      closeList();
      if (rows.length > 0) {
        out.push("<table><thead><tr>" + rows[0].map((cell) => `<th>${inline(cell)}</th>`).join("") + "</tr></thead><tbody>");
        const labels = rows[0].map((cell) => cell.replace(/\*\*/g, "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"));
        for (const row of rows.slice(1)) out.push("<tr>" + row.map((cell, column) => `<td data-label="${labels[column] ?? ""}">${inline(cell)}</td>`).join("") + "</tr>");
        out.push("</tbody></table>");
      }
      continue;
    }
    if (/^#{1,3}\s+/.test(line)) {
      closeList();
      out.push(`<h4>${inline(line.replace(/^#{1,3}\s+/, ""))}</h4>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!listOpen) { out.push("<ul>"); listOpen = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
    index += 1;
  }
  closeList();
  return out.join("\n");
}

export function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function modelLabel(result: FixtureResult): string {
  if (result.provider_product) {
    return `preset ${result.preset} · observed model ${result.model} (provider-reported)`;
  }
  if (result.provider === "parallel") return `processor ${result.model}`;
  if (result.model) return `model ${result.model}`;
  return "model provider-managed";
}

export const RESEARCH_DEMO: {
  illustrative: true;
  fixture: "captured";
  mode: "deep-research";
  collectedAt: string;
  scopeNote: string;
  query: string;
  results: DemoResult[];
} = {
  illustrative: true,
  fixture: "captured",
  mode: "deep-research",
  collectedAt: fixture.collectedAt,
  scopeNote: `Historical provider capture; legacy profile identities are provenance, not current selectors. ${fixture.scope.note}`,
  query: fixture.query,
  results: (fixture.results as FixtureResult[]).map((result) => {
    const display = DISPLAY[result.provider];
    const failed = result.status === "failed";
    const content = failed ? result.note ?? "" : result.content;
    // Display excerpt: when a report's verbatim content opens with the same
    // H1 or H2 the card already renders as its title, drop that one leading
    // line from the readable card. `content` stays byte-verbatim for capture
    // verification; citation markers are removed only during rendering.
    const firstLine = content.split("\n", 1)[0];
    const headless = result.title && !failed && (firstLine === `# ${result.title}` || firstLine === `## ${result.title}`)
      ? content.slice(firstLine.length).replace(/^\n/, "")
      : content;
    // Captures end with a lone "…" line marking where the excerpt was cut.
    // The readable card drops it; `content` keeps it for capture verification.
    const displayContent = headless.replace(/\n+…\s*$/, "");
    return {
      provider: display.name,
      shortName: display.shortName,
      logo: display.logo,
      profile: result.profile,
      status: failed ? ("failed" as const) : ("ok" as const),
      modelLabel: modelLabel(result),
      title: result.title ?? null,
      content,
      displayContent,
      citations: (result.citations ?? []).map((citation) => ({
        title: citation.title ?? hostname(citation.url),
        url: citation.url,
      })),
      collectedAt: result.collected_at ?? fixture.scope.date,
      elapsedSeconds: Math.round((result.wall_clock_ms ?? 0) / 1000),
    };
  }),
};

// Presence is checked only in the archived display excerpts, never inferred
// from citations or a provider's full report that the homepage does not show.
export const COMPARED_TOOLS = ["Plausible", "Matomo", "PostHog", "Fathom"] as const;
export const PROVIDER_COMPARISON = RESEARCH_DEMO.results.map((result) => ({
  provider: result.shortName,
  logo: result.logo,
  named: COMPARED_TOOLS.filter((tool) => new RegExp(`\\b${tool}\\b`, "i").test(result.content)),
}));
