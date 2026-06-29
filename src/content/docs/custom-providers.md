---
title: Custom providers
description: Build and register custom npm or script providers for librarium.
order: 9
---

## Overview

Librarium supports external providers without changing core code. Add definitions to your config and trust them explicitly. Custom providers support two source types: `npm` (load a module from the project or runtime install context) and `script` (spawn a command per operation and exchange JSON over stdin/stdout).

## Trust model

- Custom providers load only when their ID appears in `trustedProviderIds`.
- Trust lists from global and project config are unioned and deduped.
- Built-in IDs are reserved. Custom providers cannot override built-ins.

## Core vs CLI boundary

Built-in adapters live in core: they must stay runtime-portable. Fetch-based HTTP only, no `node:*` imports, no direct `process.env` access.

Custom npm and script providers are CLI-only. They depend on Node module resolution and child processes and are loaded by the CLI's node-registry, never by core. Library consumers who need a custom provider implement the `Provider` interface directly and call `registerProvider()` at runtime.

## Provider interface contract

Your provider must match librarium's `Provider` shape.

Required fields:

- `id` (must equal the config key)
- `displayName`
- `tier` (`deep-research`, `ai-grounded`, or `raw-search`)
- `envVar` (string; may be empty only when `requiresApiKey` is `false`)
- `execute(query, options)`

Optional methods:

- `submit(query, options)`
- `poll(handle)`
- `retrieve(handle)`
- `test()`

Optional metadata:

- `requiresApiKey` (defaults to `true`)

If `requiresApiKey` is `true`, empty `envVar` is rejected. `source` is set by librarium (`npm` or `script`).

## NPM providers

### Config example

```json
{
  "customProviders": {
    "my-npm-provider": {
      "type": "npm",
      "module": "librarium-provider-myteam",
      "export": "createProvider",
      "options": { "preset": "fast" }
    }
  },
  "trustedProviderIds": ["my-npm-provider"],
  "providers": {
    "my-npm-provider": {
      "enabled": true,
      "apiKey": "$MY_PROVIDER_API_KEY"
    }
  }
}
```

### Module resolution order

1. Current project (`process.cwd()` context)
2. Librarium runtime install context

In standalone and Homebrew binary installs, npm custom providers are skipped with a warning.

### Export patterns

You can export either a provider object or a factory function returning a provider object. The factory function receives:

```ts
{
  id: string;
  config?: ProviderConfig;
  sourceOptions: Record<string, unknown>;
}
```

`sourceOptions` is `customProviders.<id>.options`.

## Script providers

### Config example

```json
{
  "customProviders": {
    "my-script-provider": {
      "type": "script",
      "command": "node",
      "args": ["./scripts/librarium-provider.mjs"],
      "cwd": ".",
      "env": { "LOG_LEVEL": "warn" },
      "options": { "flavor": "deep" }
    }
  },
  "trustedProviderIds": ["my-script-provider"],
  "providers": {
    "my-script-provider": {
      "enabled": true
    }
  }
}
```

### Execution model

Librarium spawns one process per operation: `describe`, `execute`, `submit`, `poll`, `retrieve`, `test`.

Process settings:

- stdin: one JSON request envelope
- stdout: one JSON response envelope
- stderr: optional debug/error text
- env: `process.env` merged with `customProviders.<id>.env`
- cwd: resolved relative to current working directory if set; otherwise uses current working directory

### Request envelope

```json
{
  "protocolVersion": 1,
  "operation": "execute",
  "providerId": "my-script-provider",
  "query": "research topic",
  "options": { "timeout": 30 },
  "providerConfig": { "enabled": true },
  "sourceOptions": { "flavor": "deep" }
}
```

### Response envelopes

Success:

```json
{
  "ok": true,
  "data": {
    "provider": "my-script-provider",
    "tier": "ai-grounded",
    "content": "# Result",
    "citations": [],
    "durationMs": 1200
  }
}
```

Error:

```json
{
  "ok": false,
  "error": "upstream timeout"
}
```

### `describe` response

`describe` must return provider metadata and capabilities:

```json
{
  "ok": true,
  "data": {
    "id": "my-script-provider",
    "displayName": "My Script Provider",
    "tier": "deep-research",
    "envVar": "MY_PROVIDER_API_KEY",
    "requiresApiKey": true,
    "capabilities": {
      "execute": true,
      "submit": true,
      "poll": true,
      "retrieve": true,
      "test": true
    }
  }
}
```

Rules:

- `displayName` and `tier` are required.
- `execute` is expected. If `capabilities.execute` is explicitly `false`, load fails.
- If `id` is returned, it must match the configured provider ID.

### Operation data shapes

- `execute` and `retrieve`: `ProviderResult` (includes `provider`, `tier`, `content`, `citations`, `durationMs`; optionally `model`, `tokenUsage`, and `usage`). Return `usage` (with `costUsd` and/or token counts) when your API reports them -- see [Metering and cost](#metering-and-cost).
- `submit`: `AsyncTaskHandle`.
- `poll`: `AsyncPollResult`.
- `test`: `{ ok: boolean; error?: string }`.

All responses are validated. Invalid payloads fail the operation.

### Timeouts

- `execute`: uses `options.timeout` seconds (minimum 1s).
- `submit`: uses `options.timeout` seconds (minimum 1s).
- `describe`, `poll`, `test`: 30s default.
- `retrieve`: 120s default.

## Metering and cost

[Metering](/docs/commands#metering-registry-and-the-estimated-budget) lets librarium track and budget per-provider cost through a `metering` object on every result (`kind`, an optional pre-dispatch `estimate`, and an `actual` lane). How a provider participates depends on whether it is custom or built-in.

### Custom providers

- **Reported cost works.** If your `execute`/`retrieve` result includes a `usage` object with `costUsd`, librarium surfaces it as `metering.actual` with `source: "provider_reported"`, counts it toward the `--max-cost` budget, and aggregates it in `librarium usage`. Token-only `usage` (no `costUsd`) is reported as tokens. This is the recommended way for a custom provider to expose cost -- it is taken from your response, never estimated.
- **Custom providers are `manual_unmetered`.** The per-provider `metering_kind` and pre-dispatch *estimate* (`estimateMetering`) are a built-in registry concept; custom providers have no registry entry, so their `metering.kind` is always `manual_unmetered` and they produce no pre-dispatch estimate.
- **Estimated budget treats them as $0.** Because they have no estimate, custom providers reserve `0` against `--max-estimated-cost` and are never skipped by it. The honest `--max-cost` (reported) budget is what bounds their actual spend.

In short: return `usage.costUsd` to participate in reported-cost tracking and `--max-cost`; pre-dispatch estimation and `--max-estimated-cost` apply to built-in providers only.

### Built-in adapters

A built-in adapter declares its pricing model in the central registry (`src/core/metering.ts`). The metering kinds are `native_cost`, `native_tokens`, `request_priced`, `credit_priced`, `api_unit_priced`, and `manual_unmetered` -- see [Metering kinds](/docs/providers#metering-kinds) for the full mapping. Request- and credit-priced kinds can carry a network-free default estimate (request-priced may include a flat USD figure; plan-dependent credit/unit kinds emit unit metadata only, with a USD figure appearing only when the user configures pricing via provider `options`). Estimates never set `usage.costUsd`.

## Adding a built-in adapter

Built-in adapters live in [core](/docs/library) and must stay runtime-portable (fetch-only HTTP, no `node:*`, no direct `process.env`; a workerd CI suite enforces this). To add one, update **all** of these in lockstep -- several are guarded by tests, so a partial change fails CI:

1. **Adapter** -- `src/adapters/<id>.ts`, extending `BaseProvider` and implementing `execute` (plus `submit`/`poll`/`retrieve` for async deep research). Return `usage` when the API reports cost/tokens.
2. **Registration** -- add an instance to the `builtIns` array in `src/adapters/index.ts` (`initializeProviders`).
3. **Constants** (`src/constants.ts`) -- `PROVIDER_ENV_VARS`, `PROVIDER_DISPLAY_NAMES`, and at least one entry in `DEFAULT_GROUPS` (and `all`).
4. **Metering registry** (`src/core/metering.ts`) -- add a `REGISTRY` entry with the provider's `kind` (and, for priced kinds, `defaultPerRequestUsd` / `defaultUnitsPerRequest` / `unit`). **Required:** the lockstep test in `tests/metering.test.ts` asserts every built-in has a registry entry, so a missing entry fails CI.
5. **Core export** -- `export * from './adapters/<id>.js'` in `src/core-entry.ts`.
6. **README** -- bump the "N built-in provider adapters" count; the README-drift test (`tests/readme-drift.test.ts`) tripwires on the provider count, tiers, and group names.

Run `npm run test` (it includes the metering lockstep and README-drift guards) and `npm run test:workers` (the runtime-portability suite) before opening a PR.

## Error handling

Loading behavior:

- Untrusted provider ID: skipped with a warning.
- Built-in ID collision: skipped with a warning.
- Module resolution failure: skipped with a warning.
- Script startup / JSON parse / schema validation failure: skipped with a warning, or the operation fails.
- Script `ok: false`: surfaced as an operation error.

Troubleshooting:

| Symptom | Cause | Fix |
|---|---|---|
| `not trusted` warning | ID missing from `trustedProviderIds` | Add provider ID to trust list |
| `conflicts with a built-in` warning | Custom ID matches built-in ID | Rename custom provider ID |
| `Cannot resolve npm module` | Module not installed in project/runtime | Install package or fix `module` name |
| `describe id ... does not match` | Script reported different ID | Return matching ID or omit `id` |
| `returned invalid JSON` | Script wrote non-JSON to stdout | Write only one JSON envelope to stdout |
| `returned invalid ... payload` | Shape mismatch for operation data | Return correct schema for that operation |
| `timed out` | Operation exceeded timeout | Optimize provider or raise timeout for execute/submit |
