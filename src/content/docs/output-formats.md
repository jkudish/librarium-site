---
title: Output formats
description: Run directory anatomy, summary.md, report.html, results.jsonl, run.json, and exit codes.
order: 4
---

## Run output

The Node CLI writes a run directory under the configured `runtime.output_dir`.

```text
./agents/librarium/{timestamp}-{slug}/
  prompt.md
  run.json
  summary.md
  sources.json
  provider-${stem}--${sha256(providerId)}.md
  provider-${stem}--${sha256(providerId)}.meta.json
  answer.md
```

Provider artifact names use a sanitized provider-ID stem of at most 64 characters plus the full SHA-256 digest of the provider ID. This prevents two IDs with the same sanitized stem from colliding. `run.json` owns the concrete `outputFile` and `metaFile` names; consumers should read those fields instead of reconstructing filenames. `answer.md` exists for answer synthesis. Presentation commands can add `report.html` and `results.jsonl`. Treat provider markdown, citations, URLs, and collected surface content as untrusted input.

```bash
librarium run "query" --json
librarium run "query" --html --jsonl
librarium html [run-dir] --open
librarium jsonl [run-dir]
```

`--json` writes machine output to stdout. `--jsonl` writes records to the run directory. These are different interfaces.

## Artifact contracts and versions

The public TypeScript artifact contract version is `1.0.0` for `run_manifest`, `provider_metadata`, `sources`, and `jsonl_record`. Artifact objects are strict, carry `generated_at`, an artifact name and version, and reject unknown versions. Historical-reader policy is explicit and either `none` or `lossless_explicit`.

The Node CLI canonical `run.json` manifest is a separate runtime format with `artifact_version: "3.0.0"`. Do not infer CLI run-directory compatibility from the public contract-layer `run_manifest` name.

The terminal TypeScript and PHP snapshot, runtime artifacts, and custom-provider protocol are separate versioned boundaries:

| Boundary | Current version |
| --- | --- |
| Terminal contract snapshot path | `contracts/v1` |
| Artifact schemas | `1.0.0` |
| Node CLI canonical `run.json` manifest | `3.0.0` |
| Custom-provider protocol | `1.0.0` |
| npm package | `2.0.0-rc.18` |

The terminal snapshot version does not imply artifact or runtime compatibility. Artifact versions do not imply custom-provider compatibility.

## Provenance is descriptive

`api_output` means the named API returned the output. A citation may be `provider_reported`, `collector_extracted`, or `librarium_inferred`. This says how it entered the result, not whether it supports every nearby claim.

SearchAPI consumer profiles are collected `surface_snapshot` observations. They are not official consumer-vendor APIs and do not promise parity for an account, location, subscription, experiment cohort, or time. The six surfaces share a collector and collector run correlation. Their agreement is correlated visibility evidence, not six independent confirmations.

Web, X-only, combined, and specialized media results retain distinct profile identities and corpus provenance. `grok/web`, `grok-x-only/x`, and `grok-combined/combined` must not be collapsed. A normalized shared source records source overlap. Correlation records related retrieval paths. Neither is corroboration. Corroboration requires a consumer to assess support and independence; Librarium does not serialize a universal `verified` or `independent` claim.

URLs are untrusted identifiers. Provenance records the effective provider/profile, target, access mode, operator, optional collector and surface, origin, unknown context, and correlation keys. It is not a confidence score.
