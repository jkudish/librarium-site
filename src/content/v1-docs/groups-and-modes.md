---
title: Groups and modes
description: Provider groups, execution modes, and fallback behavior.
order: 5
---

## Default groups

Groups are named collections of provider IDs. Librarium ships with eight default groups:

| Group | Providers | Use case |
|---|---|---|
| `deep` | perplexity-sonar-deep, perplexity-deep-research, perplexity-advanced-deep, openai-research, gemini-deep | Thorough async research |
| `quick` | gemini-grounded, openrouter-online, brave-answers, exa, kagi-fastgpt | Fast AI-grounded answers |
| `raw` | perplexity-search, brave-search, jina-search, firecrawl-search, searchapi, serpapi, tavily | Traditional search results |
| `fast` | perplexity-sonar-pro, gemini-grounded, openrouter-online, perplexity-search, brave-answers, exa, kagi-fastgpt, jina-search, brave-search, firecrawl-search, tavily | Quick results from multiple tiers |
| `visibility` | searchapi-chatgpt, searchapi-gemini, searchapi-perplexity, searchapi-google-ai-mode, searchapi-bing-copilot, searchapi-google-ai-overview, perplexity-sonar-pro, gemini-grounded, grok | Explicit nine-surface answer visibility comparison |
| `comprehensive` | All deep-research + all ai-grounded (20 providers) | Deep + AI-grounded combined |
| `llm` | claude, openai-chat, gemini-chat, openrouter-chat | Opt-in LLM answers; web search and citations on by default |
| `all` | All 27 grounded providers (including Grok) | Maximum grounded coverage (excludes the `llm` tier) |

`visibility`, `comprehensive`, and `all` are explicit cost boundaries. Choosing
one may run credentialed opt-in members even when they are disabled for a
bare/default run. The six SearchAPI answer surfaces remain absent from
`quick`, `fast`, `raw`, `deep`, and `llm`; Pro Search joins
`comprehensive`/`all`, not `visibility`.

Every grounded default group, including `visibility` and `all`, excludes the
`llm` tier. Opt in to direct model calls via `--group llm`,
`-p claude,openai-chat,...`, or a custom group. See [the llm tier](/v1/providers#the-llm-tier) for details.

Older stored `comprehensive` and `all` rosters are upgraded only when they
exactly match a prior canonical roster after alias normalization. Customized,
reordered, and project-level definitions are preserved. An absent stored roster
is not migrated, but the effective configuration receives the current default.

## Custom groups

Add custom groups via CLI or config file:

```bash
# Via CLI
librarium groups add my-research perplexity-sonar-pro exa brave-search
```

```json
{
  "groups": {
    "my-research": ["perplexity-sonar-pro", "exa", "brave-search"]
  }
}
```

To remove a custom group:

```bash
librarium groups remove my-research
```

## Execution modes

Librarium supports three execution modes, configurable via `--mode` or the `defaults.mode` config key:

**`sync`.** Wait for all providers to complete, including deep-research providers. Deep research runs synchronously (can take several minutes).

**`async`.** Submit deep-research tasks and return immediately. Use `librarium status --wait --retrieve` to poll and fetch results later.

**`mixed`** (default). Run ai-grounded and raw-search providers synchronously. Submit deep-research providers asynchronously. You get fast results right away and can retrieve deep research later.

True background submission depends on the provider's API. `openai-research`, `perplexity-sonar-deep` (via Perplexity's Async Sonar API), and `gemini-deep` (via Google's Interactions API with `background: true`) submit and return immediately in `mixed`/`async` mode; poll with `librarium status --wait`. `perplexity-deep-research` and `perplexity-advanced-deep` use Perplexity's Agent API, which has no background mode, so they complete inline even in mixed mode.

## Provider fallback

When a provider fails, librarium can automatically try a lighter alternative
unless the result explicitly blocks fallback. When `zeroRetention` is
configured, any SearchAPI answer-adapter failure blocks fallback so Librarium
never retries with weaker privacy. The dedicated Google AI Overview adapter
blocks fallback on every failure to preserve its two-stage surface semantics.
Add an optional `fallback` field to any provider's config:

```json
{
  "providers": {
    "gemini-deep": {
      "apiKey": "$GEMINI_API_KEY",
      "enabled": true,
      "fallback": "openai-research"
    },
    "openai-research": {
      "apiKey": "$OPENAI_API_KEY",
      "enabled": false
    }
  }
}
```

### Fallback behavior

- Fallback triggers after the primary provider's execution fails (error or timeout).
- Results marked `preventFallback` stop the chain; SearchAPI uses this to
  preserve requested privacy, provenance, and product-surface semantics.
- Only single-level fallback is supported. A fallback's own fallback is ignored.
- The fallback provider must be configured with a valid API key but can be `enabled: false`. It will only activate as a backup.
- If the fallback provider is already running in the same dispatch (for example, explicitly listed in `--providers`), it won't be triggered again.
- Output files use the fallback provider's ID (for example, `openai-research.md`).
- Pass `--no-fallback` when a run must preserve an exact provider or visibility
  matrix.

In `run.json`, both the original error report and the fallback result appear in the `providers` array. The fallback report includes a `fallbackFor` field indicating which provider it replaced:

```json
{
  "id": "openai-research",
  "tier": "deep-research",
  "status": "success",
  "fallbackFor": "gemini-deep"
}
```
