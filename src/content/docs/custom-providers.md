---
title: Custom providers
description: Build and register custom npm or script providers for librarium.
order: 10
---

## Trust boundary

Custom npm modules and scripts are executable code. `trusted_provider_ids` is an allowlist, not a sandbox. Loaded code receives the caller's process permissions and environment. Review it before adding the public provider ID to the allowlist. Automatic migration never grants trust.

Node loads trusted custom providers through `librarium/node`. `loadCustomProviders()` returns caller-owned instances and does not mutate a global registry. Built-in provider IDs are reserved.

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

## Protocol 1.0.0

The custom-provider wire protocol version is `1.0.0`. Strict JSON envelopes cover `execute`, `submit`, `poll`, and `retrieve`. Inline `execute` requires an inline profile. `submit` requires a durable background profile. `retrieve` requires a successful handle. Request and attempt IDs must match in responses. Validate exchanges with the exported schemas.

Do not expose keys, authorization values, resume credentials, raw provider responses, or secret-shaped data in `provider_meta`. Allowlist public metadata before emission.
