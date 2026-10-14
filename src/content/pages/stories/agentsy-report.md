---
title: Building answer visibility in Agentsy Report.
description: Collected answers become durable product evidence, not confidence scores.
kind: story
ctaHref: /laravel
ctaLabel: Explore the Laravel integration
---

## What was tested

This is historical integration evidence using `ResearchResponse` and Profile identities; today's API uses Run. It covers backend ingestion and replay, not a reporting UI or customer outcomes.

| Tested boundary | Outside this evidence |
| --- | --- |
| Completed responses → application records | Live answer quality, reporting UI, customer outcomes |

## Start with a question a business recognizes

API answers and AI answer-engine observations are different evidence. Two retrieval services may observe the same engine differently.

> Which villa rental services do AI answers recommend for a week on the Amalfi Coast? Do we appear, and which sources shape the recommendations?

## Librarium collects the facts; the application owns the record

Agentsy assigns the owner and measurement series, then stores an immutable receipt and each successful AI answer-engine observation. Replay safety is an application guarantee, not proof an answer is correct.

| Record | Retained facts |
| --- | --- |
| Measurement series | Entity and prompt, identified by an opaque key |
| Observation | Effective provider, historical Profile, content, citations, retrieval service, engine, observation time when available |
| Same receipt again | No duplicate observations |
| Same identity, changed facts | Rejected |

## Compare like with like

The latest observation stays within one owner, measurement series, and AI answer engine. Retrieval-service disagreement remains inspectable, not independent confirmation or a promise about every account.

| Lookup | Boundary |
| --- | --- |
| Latest engine observation | Same owner + series + engine |
| Latest per retrieval service | Same boundary, separated by service |
| Newer answer to another question | Does not replace this question's evidence |

## Keep product policy outside the research package

Librarium supplies completed results; Agentsy owns persistence and isolation. Applications can build review screens or agent tools over approved evidence without adopting private runtime state.

| Visibility model | Policy |
| --- | --- |
| Approved observations | Application-owned records |
| Credentials, raw responses, headers | Excluded |
| Provider metadata, usage payloads, arbitrary errors | Excluded |

## What this proves—and what comes next

Faked research with stray HTTP blocked tests ingestion, replay, changed-payload rejection, immutability, and owner/series isolation. Scheduling, retrieval-service selection, reporting, and production operations remain application work.

See [the Laravel agent example](/docs/php/using-with-agents) and [queue guide](/guides/laravel-queues) for current Run-based integration.
