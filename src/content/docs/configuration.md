---
title: Configuration
description: Configure sources, AI answer-engine retrieval, saved groups, and Run storage in v3 JSON.
order: 7
---

`librarium setup` writes `~/.config/librarium/config.json`. The npm v2 package uses config **version 3** and the public Run format `librarium.run/1`; these version numbers describe different contracts. See [migration](/docs/upgrading-to-v2) for existing configuration.

```json
{
  "version": 3,
  "sources": {
    "exa": { "key": "env:EXA_API_KEY" },
    "parallel": {
      "key": "env:PARALLEL_API_KEY",
      "processor": "pro"
    },
    "grok": {
      "key": "env:XAI_API_KEY",
      "search": "both",
      "enabled": false
    }
  },
  "engines": {
    "collector": "searchapi",
    "key": "env:SEARCHAPI_API_KEY"
  },
  "groups": { "editorial": ["exa", "claude"] },
  "summarize": { "source": "openai" },
  "max_cost": "1.00",
  "runs": {
    "store": "filesystem",
    "path": "./agents/librarium",
    "keep_days": null
  }
}
```

A source is set up when it has a resolved key and `enabled` is not false. Environment keys can work without a config file. Credentials must not be source options. Unknown options and invalid combinations fail before calls; `sources --json` reports the shared option catalog.

## Source options

| Option | Values or purpose |
| --- | --- |
| `grok.search` | `web`, `x`, or `both` |
| `brave.results` | `answer` or `search` |
| `parallel.processor` | Defaults to `pro` |
| `openai.effort` | Reasoning effort |

A call can override options through `{ options: { parallel: { processor: 'ultra' } } }`.

Google's retrieval service is SearchAPI, SerpAPI, Serpbase, or Cloro. Set it with the source option below; `vertical: "news"` needs Serpbase or Cloro. Cloro's Google search and news make one synchronous call and default to country `US`. AI answer-engine retrieval is configured separately and may be overridden per engine. Availability differs by language and retrieval service; check local discovery before selection.

```json
{ "sources": { "google": { "collector": "searchapi" } } }
```

To retrieve AI answer engines through Cloro or DataForSEO, set the engine collector and its key. An entry such as `engines["google-ai-mode"]` can override `collector`, `key`, `priority`, and `options` for that engine:

```json
{
  "engines": {
    "collector": "cloro",
    "key": "env:CLORO_API_KEY",
    "priority": "standard",
    "options": { "country": "US" },
    "google-ai-mode": { "priority": "live" }
  }
}
```

Without a key, each collector reads its own environment variable: `SEARCHAPI_API_KEY`, `CLORO_API_KEY`, or `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`.

Cloro needs an uppercase ISO `country`; DataForSEO needs `locationCode` and `languageCode`. `openai`, `claude`, `perplexity`, and `gemini` also accept `collector: "dataforseo"`, which asks the same model through DataForSEO's LLM Responses API for quick research.

## Storage and retention

Relative Run paths resolve from the calling directory. `runs.keep_days: null` disables automatic retention. `cleanup` prunes completed Runs. A custom store module path resolves relative to the config file:

```json
{ "runs": { "store": { "module": "./stores/redis.js" } } }
```

That module executes with process permissions; review it before loading. Node preserves a signing key beside config, outside Run storage. Keep it across restarts; losing or changing it prevents trusted handle recovery.

`config show` may contain sensitive configuration; do not send its output to public logs. See [RunStore](/docs/custom-providers) and [v1 migration](/docs/upgrading-to-v2).
