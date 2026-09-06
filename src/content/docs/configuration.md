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
    "request_deadline_ms": 1800000,
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

The global root has `version`, `execution_defaults`, `providers`, `custom_providers`, `trusted_provider_ids`, `groups`, and `runtime`. Optional `request_deadline_ms` bounds the entire run from its original start, including helpers and fallbacks; without it, preflight derives a window from the selected work and configured timeouts.

## CLI and library project layers

The explicit Node library loader accepts global and project v1/native-v2 layers, merging project values over global ones. Native project config allows only fields in `LibrariumProjectConfigV2Schema`. Replacing custom code under an inherited ID removes inherited trust and requires project-layer trust. `saveConfigV2()` saves a complete validated global config, not a project override document.

Normal CLI commands accept native v2 **global** config, but `.librarium.json` still uses the camelCase compatibility contract: `defaults`, `providers`, `customProviders`, `trustedProviderIds`, `groups`, `refine`, and `answer`. Do not place a native snake_case project document there and expect the normal CLI path to apply it. CLI flags override project settings, which override global settings and factory defaults.

`config --json` shows the merged camelCase compatibility projection, not a save-ready native v2 document. `config --global --json` excludes the project layer. Both may include literal credentials: treat the output as sensitive. `config --menu` edits global settings only. Its legacy writer and onboarding refuse to overwrite an active native v2 file.

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
