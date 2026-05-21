---
title: Reference (skills)
description: A library of compact, task-focused skill files. Designed to be read by both humans and LLM agents working with Fibe.
slug: /reference/intro
sidebar_label: Overview
sidebar_position: 1
image: /img/og/reference-intro.png
keywords: [Fibe, reference, skills, LLM, authoring, recipes, playbooks]
---

The reference section is a library of small, task-focused **skill files**. Each one answers one question — "how do I add a subdomain?", "what's the difference between Marquees and Playgrounds?", "how do I turn this Compose file into a Trick?" — and links to a few related neighbors.

Two audiences:

- **You, the human author.** Use them as a fast lookup while you're writing or fixing a template. Each file is short on purpose.
- **An LLM agent working with Fibe.** Agents can discover these via [`llms.txt`](https://whats.fibe.gg/llms.txt) and use them as a structured knowledge base. The file naming convention (`recipe-`, `playbook-`, `decide-`, etc.) helps an agent select the right one for a given task.

## How the reference is organized

| Group | What's in it |
| --- | --- |
| **Foundations** | The conceptual map: what Fibe is, what each noun means, who owns what, how features fit together. |
| **Compose conversion** | The master playbook for turning `docker-compose.yml` into a Fibe template, plus the publish checklist and common-errors guide. |
| **References** | Authoritative pages for the moving parts — labels, the `x-fibe.gg` block, variables, YAML paths, implied semantics, validation. |
| **Decision guides** | Short, opinionated frameworks for the choices you make while authoring (static vs dynamic, expose external vs internal, zero-downtime on/off, etc.). |
| **Execution modes** | One per template shape: job-mode Tricks, cron schedules, VCS triggers. |
| **Recipes** | Small, copy-pasteable patterns (replace `ports:` with `expose`, lift a Compose `${VAR}` into a Fibe variable, share a subdomain across services, etc.). |
| **App playbooks** | Worked end-to-end conversions for common app shapes — nginx, Node dev mode, Rails, WordPress, Postgres app, Wiki.js, and more. |

## How to read a skill file

Each file follows a consistent shape:

1. **Frontmatter** with `description` — a one-line summary the user (or an agent) can match against.
2. **A short body** — usually 100–400 lines, with code examples and cross-links.
3. **Related skills** at the bottom — a small graph you can follow when one skill leads naturally to another.

## How agents use these

Fibe's MCP server and the [Anthropic / Claude SDK setup](https://fibe.gg) reference these skill files by name. When you ask an agent "convert my Compose file", the agent picks up `convert-compose-to-fibe`, then loads only the skills that file points to. That keeps the agent's context window focused on what's actually relevant.

If you're building your own agent that should know Fibe, point it at [`whats.fibe.gg/llms.txt`](https://whats.fibe.gg/llms.txt) for an index, [`whats.fibe.gg/llms-full.txt`](https://whats.fibe.gg/llms-full.txt) for the entire library concatenated, or [`whats.fibe.gg/llm-skills.txt`](https://whats.fibe.gg/llm-skills.txt) for a compact `name: description` table of every skill and tool.

## Where to start

- New to Fibe? Read [`fibe-product-map`](/reference/fibe-product-map/) and [`glossary`](/reference/glossary/).
- Coming with a Compose file in hand? Open [`convert-compose-to-fibe`](/reference/convert-compose-to-fibe/) — it tells you which surgical skills to load next.
- Stuck on a specific error? Try [`common-errors-and-fixes`](/reference/common-errors-and-fixes/).
- Publishing your first template? Walk the [`templates-publish-checklist`](/reference/templates-publish-checklist/).
