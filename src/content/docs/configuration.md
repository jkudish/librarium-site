---
title: Configuration
description: Strict snake_case v2 config, global and project layers, and side-effect-free v1 migration.
order: 7
---

## V2 shape

V2 config is strict snake_case JSON. Unknown keys and camelCase v1 fields are not v2 config.

```json
{
  "version": 2,
  "execution_defaults": {
    "mode": "sync",
    "max_concurrency": 4,
    "inline_attempt_deadline_ms": 30000,
    "background_attempt_deadline_ms": 1800000,
    "poll_interval_ms": 10000
  },
  "providers": { "exa": { "enabled": true } },
  "custom_providers": {},
  "trusted_provider_ids": [],
  "groups": { "custom:team": ["exa/search"] },
  "runtime": {
    "output_dir": "./agents/librarium",
    "llm_web_search": true
  }
}
```

The global root has `version`, `execution_defaults`, `providers`, `custom_providers`, `trusted_provider_ids`, `groups`, and `runtime`. Project config may override only fields allowed by `LibrariumProjectConfigV2Schema`. Use `librarium config --json` to inspect resolved CLI configuration.

## Migrate from v1

`migrateConfig()` accepts v1 or v2 input. It returns an immutable v2 config with notices, or structured issues. It does not write a file. Authored groups that collide with reserved workflows migrate to `custom:<name>`. Migration never grants trust to executable custom providers.

Most users should follow the CLI procedure in [Upgrade from v1](/docs/upgrading-to-v2). The programmatic boundary below is for applications that own config migration themselves.

`loadConfigV2()` also has no write side effect and requires explicit paths. Persist only after reviewing the result:

```ts
import { loadConfigV2, saveConfigV2 } from 'librarium/node';

const migrated = loadConfigV2({
  global_path: '/home/me/.config/librarium/config.json',
  project_path: '/work/project/.librarium.json',
});
if (!migrated.ok) throw new Error(JSON.stringify(migrated.issues));
saveConfigV2(migrated.config, {
  path: '/home/me/.config/librarium/config-v2.json',
});
```

`saveConfigV2()` validates, writes atomically, and enforces owner-only protection. It fails closed on Windows when equivalent owner-only protection cannot be verified. Keep the old file until the saved v2 config passes `librarium doctor` and a bounded test run.
