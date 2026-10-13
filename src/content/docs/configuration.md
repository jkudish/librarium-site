---
title: Configuration
description: Configure flat sources, engine collectors, saved groups, and Run storage in v3 JSON.
order: 7
---

`librarium setup` writes `~/.config/librarium/config.json`. The simplified API uses config **version 3**; version 2 never shipped. Loading v1 writes an original-byte backup before migrating.

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

## Options replace extra profiles

Examples: `grok.search` selects `web`, `x`, or `both`; `brave.results` selects `answer` or `search`; `parallel.processor` defaults to `pro`; `openai.effort` configures reasoning effort. A call can override options through `{ options: { parallel: { processor: 'ultra' } } }`.

`google.collector` is `searchapi`, `serpapi`, or `serpbase`. Engine collector configuration is separate and may be overridden per engine. Availability differs by language and collector; do not infer it from a logo or a key alone.

## Storage and retention

Relative Run paths resolve from the calling directory. `runs.keep_days: null` disables automatic retention. `cleanup` prunes terminal Runs. A custom store module path resolves relative to the config file:

```json
{ "runs": { "store": { "module": "./stores/redis.js" } } }
```

That module executes with process permissions; review it before loading. Node preserves a signing key beside config, outside Run storage. Keep it across restarts; losing or changing it prevents trusted handle recovery.

`config show` may contain sensitive configuration; do not send its output to public logs. See [RunStore](/docs/custom-providers) and [v1 migration](/docs/upgrading-to-v2).
