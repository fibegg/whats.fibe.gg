---
title: Scrolls
description: A searchable workspace that collects artefacts, mutters, messages, raw provider traces, memories, and Pantry templates in one place.
slug: /concepts/scrolls
sidebar_position: 3
image: /img/og/concepts-scrolls.png
keywords: [Scrolls, artefacts, mutters, memories, Pantry, provider traces, raw logs]
---

A **Scroll** is a searchable workspace that collects everything produced around a piece of work — artefacts, mutters, messages, raw provider traces, memories, and Pantry templates — in one place.

Open a Scroll for notes and files, inspect raw provider logs when an AI session needs debugging, or pull a reusable template out of the Pantry.

## What lives in a Scroll

| Item | What it is |
| --- | --- |
| **Artefacts** | Files and notes produced during work — reports, screenshots, mockups, CSVs, snippets, interactive previews. |
| **Mutters** | Short progress notes — what was tried, where things broke, what's left. |
| **Messages** | Conversation messages worth surfacing outside the chat. |
| **Raw provider traces** | The exact request/response logs from a Genie's provider. For debugging an AI session. |
| **Memories** | Persistent notes the Genie or the user marked as worth remembering. |
| **Pantry templates** | Reusable Template snippets stored alongside the work that needed them. |

Everything in a Scroll is indexed and searchable. Filter by type, date, source resource.

## Authoring artefacts

Create an artefact directly inside a Scroll:

- **Title** — your reference.
- **Description** — short summary (optional).
- **Body** — Markdown content. The editor surfaces a body placeholder until you start writing.

Artefacts can also be produced automatically by a Genie's work. Either way they land in the same Scroll and are indistinguishable on read.

## Raw provider traces

When a Genie talks to its underlying provider (Claude, Gemini, OpenAI, etc.), the request and response payloads are captured. Open the trace to see exactly what the provider was sent and what it returned. Useful for debugging a wrong answer, a refused tool call, or a context-window failure.

Traces are sensitive — they contain prompts and replies verbatim. Treat the Scroll containing them like the data it contains.

## Pantry

A Pantry is a collection of reusable Templates stored at the Scroll level. Use it when a Template is too specialized for the public [Bazaar](/concepts/bazaar/) but still worth keeping handy across multiple launches.

Pantry templates can be:

- Edited in place.
- Versioned (new version on each save).
- Imported into a Playspec at launch time.

## Memories

A memory is a tagged note the Genie can refer back to in future conversations. Useful for facts about the project, user preferences, or decisions that should persist across sessions.

Memories are written explicitly — either by the user adding a note, or by the Genie storing a fact when instructed.

## Search

A single search box across the whole Scroll. Returns artefacts, mutters, messages, traces, memories, and Pantry templates that match. Filter by type to narrow.

## FAQ

<details>
<summary>Scrolls vs Conversations?</summary>

A Conversation is a chat thread with a Genie. A Scroll is a workspace that may contain messages from one or more Conversations alongside other items. Conversations focus on dialogue; Scrolls focus on the collected outputs of work.
</details>

<details>
<summary>Can two Scrolls share an artefact?</summary>

Each artefact lives in one Scroll. Cross-Scroll views are read-only filters; the underlying artefact has one home.
</details>

<details>
<summary>Are Pantry templates public?</summary>

No. Pantry templates are private to the Scroll. To make a Template public, publish to the [Bazaar](/concepts/bazaar/).
</details>

## Related

- [Agents](/concepts/agents/) — where most Scroll content originates.
- [Bazaar](/concepts/bazaar/) — public counterpart to private Pantry.
- [Playspecs & Templates](/concepts/props/) — Templates can be authored into a Pantry first, then promoted to Bazaar.
