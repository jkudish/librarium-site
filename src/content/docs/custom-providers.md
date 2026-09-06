---
title: Custom providers
description: Build and register custom npm or script providers for librarium.
order: 10
---

## Trust boundary

Custom npm modules and scripts are executable code. `trusted_provider_ids` is an allowlist, not a sandbox. Loaded code receives the caller's process permissions and environment. Review it before adding the public provider ID to the allowlist. Automatic migration never grants trust.

Node loads trusted custom providers through `librarium/node`. `loadCustomProviders()` returns caller-owned instances and does not mutate a global registry. Built-in provider IDs are reserved.

Execution admission checks an exact declared and trusted primary matrix and compatible enabled fallback reserve before loading executable custom code. Static discovery can show disabled declarations, but cannot make them executable. Standalone `loadCustomProviders()` skips explicitly disabled entries without importing their npm modules or spawning scripts; this does not weaken request preparation's exact-selection checks.

## Declare the exact profile

```json
{
  "version": 2,
  "custom_providers": {
    "acme": {
      "type": "npm",
      "module": "@acme/librarium-provider",
      "execution_profile": {
        "binding_id": "acme.search.v1",
        "profile": {
          "identity": {
            "provider_id": "acme",
            "profile_id": "search",
            "target": { "primary": { "model_selection": "not_applicable" } }
          },
          "result_kind": "search_results",
          "observation_mode": "api_output",
          "corpora": ["web"],
          "retrieval_method": "search_endpoint",
          "access_mode": "direct",
          "operator_id": "acme",
          "invocation": "inline",
          "resumability": "none"
        }
      }
    }
  },
  "trusted_provider_ids": ["acme"]
}
```

A profile declaration states stable capability facts. It does not claim runtime success, correctness, cost, citations, independence, or a specific account experience.

## Runtime interfaces

An npm source exports a provider object or a factory that receives the provider ID, config, and source options. Its returned provider ID must match the configured ID. Inline providers implement `execute`. Background providers also implement `submit`, `poll`, and `retrieve`.

A script source reads one JSON request from stdin and writes one JSON response to stdout. The request uses integer `protocolVersion: 1` and an operation such as `describe`, `execute`, `submit`, `poll`, `retrieve`, or `test`. Return `{ "ok": true, "data": ... }` on success or `{ "ok": false, "error": "..." }` on failure. Librarium validates each operation's payload before using it.

The separate custom-provider exchange schemas currently in the source tree are not package exports or the runtime transport for npm and script providers. Do not build against those schemas as a public protocol.

Do not expose keys, authorization values, resume credentials, raw provider responses, or secret-shaped data in `provider_meta`. Allowlist public metadata before emission.
