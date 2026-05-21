---
name: glossary
description: Use as the first reference for the meaning of any core Fibe term - Marquee, Playground, Playspec, Template, Trick, Prop, Bazaar, Agent, Mutter, Artefact, Secret, Player, and related concepts.
---

# Glossary of core Fibe concepts

This glossary defines Fibe terms in a simple language.

If another skill needs exact YAML syntax, use the template reference skills. If another skill needs feature behavior, use the product skills.

## Alphabetical index

[Agent](#agent) · [API Key](#api-key) · [Artefact](#artefact) · [Audit Log](#audit-log) · [Bazaar](#bazaar) · [Bridge](#bridge) · [Compose Template](#compose-template) · [Conversation](#conversation) · [Data Transfer](#data-transfer) · [Job ENV entry](#job-env-entry) · [Mana and Sparks](#mana-and-sparks) · [Marquee](#marquee) · [Mounted File](#mounted-file) · [Mutter](#mutter) · [Muti](#muti) · [Player](#player) · [Playground](#playground) · [Playspec](#playspec) · [Prop](#prop) · [Rune](#rune) · [Schedule config](#schedule-config) · [Scrolls Template](#scrolls-template) · [Secret](#secret) · [Source defaults](#source-defaults) · [Template](#template) · [Template Version](#template-version) · [Trick](#trick) · [Trigger config](#trigger-config) · [Variable](#variable) · [Webhook](#webhook)

## Topology at a glance

```
Player
  owns Marquees
  owns Props
  owns Templates
  owns Agents
  owns Secrets, API Keys, Webhooks, Job ENV entries

Template Version + launch choices + Marquee
  becomes a Playspec
    becomes a Playground

Job-mode Playspec
  becomes a Trick
```

## Agent

An AI Genie configuration. An Agent stores provider choice, credentials, prompt/settings, mounted files, and chat preferences. It runs as a standalone chat on a Marquee.

## API Key

A scoped access token for API, CLI, MCP, and automation workflows. API keys can have broad scopes, narrow scopes, granular resource restrictions, expiry, rate limits, and optional agent accessibility.

## Artefact

A generated file or preview produced by a Genie or workflow. Examples include reports, screenshots, mockups, generated configs, data files, and interactive previews.

## Audit Log

A read-only event history for important resource and account actions. Audit logs help users understand who or what changed a resource and when.

## Bazaar

The public template marketplace and discovery surface. Users browse, search, fork, and launch public Templates from Bazaar-style views.

## Bridge

The unified Genie workspace. Bridge lets users switch between Agents and active chats, inspect reachability, and work with Genie conversations in one place.

## Compose Template

The YAML body of a Fibe Template Version. It is valid Docker Compose plus Fibe-specific labels and optional `x-fibe.gg` metadata. Use "Compose Template" when talking about YAML syntax and "Template" when talking about the reusable Fibe resource.

## Conversation

A chat thread with an Agent. Conversations hold user messages, Genie replies, and related activity so work can be resumed later.

## Data Transfer

An export or import task for moving Fibe configuration between accounts or environments. Data transfers can include repositories, hosts, launch blueprints, running-environment configuration, templates, agents, secrets, webhooks, and related configuration.

## Scrolls Template

The user's personal template collection. Scrolls templates contain private templates, forked templates, source-linked templates, and templates the user may later publish.

## Job ENV entry

An environment variable injected into job-mode runs. Entries can apply globally to all Tricks or only to Tricks tied to a specific Prop.

## Mana and Sparks

User-facing platform credits and accounting concepts used for plan access, resource funding, grants, and usage enforcement. Explain them as account balance and usage concepts unless the user asks for exact billing behavior.

## Marquee

A Docker-capable host where Fibe runs Playgrounds and standalone Genie chats. A Marquee has connection settings, one or more domains, TLS/routing behavior, registry credentials, and health status.

## Mounted File

A user-provided file attached to an Agent, Playspec, or Playground so it is available inside the target workflow. Use mounted files for docs, prompts, scripts, fixtures, or config blobs that should not live in the application repository.

## Mutter

A short progress, evidence, or issue note produced during Genie or Playground work. Mutters are useful for timelines and status reporting; they should be understandable to users.

## Muti

Fibe's mutation-testing workflow. Muti tracks surviving mutations and can ask a Genie to write or improve tests so the mutation is no longer surviving.

## Player

A Fibe user account. A Player owns personal resources, sessions, profile settings, API keys, secrets, billing access, and integrations.

## Playground

A running environment created from a Playspec on a Marquee. It has services, URLs, logs, debug terminal access, expiration, lifecycle controls, and optional Agent attachment.

## Playspec

The configured blueprint for a launch. A Playspec combines a Template Version, launch variables, service settings, mounted files, persistence choices, automation settings, and a target Marquee.

## Prop

A connected Git repository. Props provide source code, branches, Compose files, environment defaults, webhook-triggered updates, build history, code hunks, and mutation targets.

## Rune

An invitation or access code. Runes can gate signup, beta access, domain/email access, or special onboarding flows.

## Schedule config

The cron-style automation block for a job-mode Template. It tells Fibe when and where to launch a Trick repeatedly.

## Secret

An encrypted user-owned credential or value. Use Secrets for long-lived sensitive values that should not be stored in source code or template YAML.

## Source defaults

A Template behavior that lets source-linked launches fill repository and branch information from the selected Prop. This makes one Template reusable across many repositories.

## Template

A reusable, versioned environment definition. Templates can be private, public, forked, source-linked, CI-tested, and launched into Playgrounds or Tricks.

## Template Version

An immutable snapshot of a Template's YAML, metadata, variables, and automation settings. New edits create new versions; existing launches remain tied to the version they used.

## Trick

A job-mode Playground. It starts, runs watched services until they exit, records success or failure, and cleans up. Use Tricks for tests, migrations, backups, cleanup, scheduled tasks, and VCS-triggered jobs.

## Trigger config

The VCS-event automation block for a job-mode Template. It launches a Trick when a matching push or pull-request event arrives for a configured repository and branch.

## Variable

A launch-time parameter declared in `x-fibe.gg.variables`. Variables can provide defaults, required input, generated random values, validation, UI hints, and YAML placement through `path`, `paths`, or inline tokens.

## Webhook

An outbound HTTP event subscription. Fibe sends signed callbacks to a user-provided URL when selected resources change.

## Related skills

- [fibe-product-map](fibe-product-map.md) for the platform model.
- [fibe-feature-surface](fibe-feature-surface.md) for feature areas.
- [fibe-resource-lifecycles](fibe-resource-lifecycles.md) for resource behavior over time.
- [convert-compose-to-fibe](convert-compose-to-fibe.md) for template authoring.
