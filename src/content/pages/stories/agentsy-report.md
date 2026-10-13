---
title: Building answer visibility in Agentsy Report.
description: How we are using Librarium to separate collected answers from durable product evidence—without turning provider agreement into a confidence score.
kind: story
ctaHref: /laravel
ctaLabel: Explore the Laravel integration
---

This is a development field note, not a production launch story. The demonstrated Agentsy integration is a backend dogfood implementation: it ingests terminal Librarium responses and tests evidence ownership and replay behavior. It does not demonstrate a deployed reporting UI, scheduled live collection, or customer outcomes.

This is historical integration evidence using `ResearchResponse` and Profile identities. The current API uses Run; this note documents the earlier integration.

## Start with a question a business recognizes

Imagine a luxury villa rental service asking: “Which services do AI answers recommend for a week on the Amalfi Coast? Do we appear, how are we described, and which sources shape those recommendations?”

That is not one universal answer to collect. A first-party API answer and a collected consumer surface are different observations. Two collectors may also observe the same surface differently. The product needs to retain those distinctions instead of reducing everything to a mention count.

## Librarium collects the facts; the application owns the record

The integration accepts Librarium's public `ResearchResponse` at an application boundary. Agentsy assigns the owner and an opaque measurement-series key identifying the entity and prompt being measured.

It stores an immutable response receipt and an observation for each successful surface result. The observation retains the effective provider and Profile, content, citations, collector, surface, and observation time when available.

Re-delivering the same receipt does not create duplicate observations. Reusing its identity with changed facts is rejected. Those are application data guarantees, not claims that the collected answer is correct.

## Compare like with like

When reading the latest observation, the query stays within the same owner, measurement series, and surface. A newer answer to a different question must not silently replace the evidence for this one.

The application can also retrieve the latest observation per collector within that boundary. This makes disagreement inspectable. It does not turn correlated collectors into independent corroboration or promise the same answer that every consumer account will see.

## Keep product policy outside the research package

Agentsy owns persistence and isolation. Librarium supplies terminal result facts. The ingestion boundary deliberately excludes credentials, raw responses, headers, provider metadata, usage payloads, and arbitrary error messages from the visibility observation model.

This separation is useful beyond visibility reporting. An application can preserve approved evidence, then build a review screen or an agent tool over it without coupling its data model to the research runtime's private state.

## What this proves—and what comes next

The implemented dogfood tests exercise terminal receipt ingestion, idempotent replay, changed-payload rejection, immutable records, and isolation across owners and measurement series. They use faked research with stray HTTP blocked; they do not establish live answer quality.

Scheduling, a reporting interface, collector-selection policy, and production operations are separate product work. A released package dependency and deployment verification are also required before this becomes a shipped experience.

For a smaller application example, the [Laravel page](/laravel) shows how to pass an approved research response to an AI SDK agent. The [queue guide](/guides/laravel-queues) shows where application-owned persistence fits after research completes.
