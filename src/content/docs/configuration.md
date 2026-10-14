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
    "parallel": { "key": "env:PARALLEL_API_KEY", "processor": "pro" },
    "grok": { "key": "env:XAI_API_KEY", "search": "both", "enabled": false }
  },
  "engines": { "collector": "searchapi", "key": "env:SEARCHAPI_API_KEY" },
  "groups": { "editorial": ["exa", "claude"] },
  "summarize": { "source": "openai" },
  "max_cost": "1.00",
  "runs": { "store": "filesystem", "path": "./agents/librarium", "keep_days": null }
}
```

A source is set up when it has a resolved key and `enabled` is not false. Environment keys can work without a config file. Credentials must not be source options. Unknown options and invalid combinations fail before calls; `sources --json` reports the shared option catalog.

## Source options

Examples: `grok.search` selects `web`, `x`, or `both`; `brave.results` selects `answer` or `search`; `parallel.processor` defaults to `pro`; `openai.effort` configures reasoning effort. A call can override options through `{ options: { parallel: { processor: 'ultra' } } }`.

`google.collector` is `searchapi`, `serpapi`, or `serpbase`. AI answer-engine retrieval is configured separately and may be overridden per engine. Availability differs by language and retrieval service; check local discovery before selection.

## Storage and retention

Relative Run paths resolve from the calling directory. `runs.keep_days: null` disables automatic retention. `cleanup` prunes completed Runs. A custom store module path resolves relative to the config file:

```json
{ "runs": { "store": { "module": "./stores/redis.js" } } }
```

That module executes with process permissions; review it before loading. Node preserves a signing key beside config, outside Run storage. Keep it across restarts; losing or changing it prevents trusted handle recovery.

`config show` may contain sensitive configuration; do not send its output to public logs. See [RunStore](/docs/custom-providers) and [v1 migration](/docs/upgrading-to-v2).
