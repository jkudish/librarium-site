---
title: Groups and modes
description: Provider groups, execution modes, and fallback behavior.
order: 5
---

## Default groups

Groups are named collections of provider IDs. Librarium ships with seven default groups:

| Group | Providers | Use case |
|---|---|---|
| `deep` | perplexity-sonar-deep, perplexity-deep-research, perplexity-advanced-deep, openai-deep, openai-deep-o3, gemini-deep | Thorough async research |
| `quick` | gemini-grounded, openrouter-online, brave-answers, exa, kagi-fastgpt | Fast AI-grounded answers |
| `raw` | perplexity-search, brave-search, jina-search, firecrawl-search, searchapi, serpapi, tavily | Traditional search results |
| `fast` | perplexity-sonar-pro, gemini-grounded, openrouter-online, perplexity-search, brave-answers, exa, kagi-fastgpt, jina-search, brave-search, firecrawl-search, tavily | Quick results from multiple tiers |
| `comprehensive` | All deep-research + all ai-grounded | Deep + AI-grounded combined |
| `llm` | claude, openai-chat, gemini-chat, openrouter-chat | Ungrounded LLM baseline / contrast (no citations) |
| `all` | All 20 grounded providers | Maximum grounded coverage (excludes the `llm` tier) |

Every grounded default group, including `all`, excludes the ungrounded `llm` tier. Opt in explicitly via `--group llm`, `-p claude,openai-chat,...`, or a custom group. See [the llm tier](/docs/providers#the-llm-tier-ungrounded-baseline--contrast) for why.

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

True background submission depends on the provider's API. `openai-deep`, `openai-deep-o3`, `perplexity-sonar-deep` (via Perplexity's Async Sonar API), and `gemini-deep` (via Google's Interactions API with `background: true`) submit and return immediately in `mixed`/`async` mode; poll with `librarium status --wait`. `perplexity-deep-research` and `perplexity-advanced-deep` use Perplexity's Agent API, which has no background mode, so they complete inline even in mixed mode.

## Provider fallback

When a provider fails for any reason (exception, error response, timeout), librarium can automatically try a lighter alternative. Add an optional `fallback` field to any provider's config:

```json
{
  "providers": {
    "gemini-deep": {
      "apiKey": "$GEMINI_API_KEY",
      "enabled": true,
      "fallback": "openai-deep"
    },
    "openai-deep": {
      "apiKey": "$OPENAI_API_KEY",
      "enabled": false
    }
  }
}
```

### Fallback behavior

- Fallback triggers after the primary provider's execution fails (error or timeout).
- Only single-level fallback is supported. A fallback's own fallback is ignored.
- The fallback provider must be configured with a valid API key but can be `enabled: false`. It will only activate as a backup.
- If the fallback provider is already running in the same dispatch (for example, explicitly listed in `--providers`), it won't be triggered again.
- Output files use the fallback provider's ID (for example, `openai-deep.md`).

In `run.json`, both the original error report and the fallback result appear in the `providers` array. The fallback report includes a `fallbackFor` field indicating which provider it replaced:

```json
{
  "id": "openai-deep",
  "tier": "deep-research",
  "status": "success",
  "fallbackFor": "gemini-deep"
}
```
