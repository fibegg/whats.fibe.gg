---
title: "Feature Surface"
description: "Use to answer broad \"what can Fibe do?\" questions and choose the correct user-facing Fibe feature area without leaking implementation details."
slug: /reference/fibe-feature-surface
sidebar_label: "Feature Surface"
image: /img/og/reference-fibe-feature-surface.png
keywords: ["Fibe", "Foundation", "fibe", "feature", "surface"]
tags: ["reference", "foundation"]
format: md
---

Use this skill when a user asks what Fibe supports, where a workflow belongs, or how user-facing features relate.

## Marquees and infrastructure

A Marquee is where environments run. Users can connect a Docker-capable host over SSH or receive a platform-managed tutorial Marquee.

Marquees provide:

- Docker execution.
- Public and internal routing.
- TLS certificate handling.
- DNS and root-domain association.
- Connection tests.
- SSH terminal access.
- Registry credentials for private images.
- Capacity for multiple Playgrounds.

## Props and source control

Props connect Fibe to Git repositories. They support built-in repositories, GitHub imports, branch discovery, Compose detection, push notifications, code-change history, and in-browser git actions from Playgrounds.

Use Props when the question involves source code, branches, builds, repository credentials, GitHub/Gitea, webhooks from git providers.

## Templates and Bazaar

Templates are reusable environment definitions. They are versioned, forkable, publishable, searchable, and launchable.

Feature names:

- Templates: the user's personal template collection.
- Bazaar: public template discovery and launch.

Templates can be pasted directly, imported from a Prop, source-linked to a file, refreshed from source changes, tested with a CI Marquee, and upgraded into downstream Playspecs.

## Playspecs and Playgrounds

A Playspec is the configured blueprint for a launch. A Playground is the running environment.

Playgrounds support:

- Service URLs.
- Public and internal exposure.
- Logs.
- Debug terminal.
- Service discovery.
- Environment overrides.
- Expiration and extension.
- Rollout and hard restart.
- Stop, destroy, retry, and deploy actions.
- Git diff and commit flows.
- Live status updates.

## Tricks and automated jobs

Tricks are job-mode Playgrounds. They run tasks that should finish, then record results and clean up.

Use this area for:

- Test runners.
- Migrations.
- Backups.
- Scheduled cron jobs.
- Push or pull-request triggers.
- CI repair with a Genie.
- Mutation-testing repair workflows.
- Per-Prop Job ENV values.

## Agents, artefacts, and feedback

Agents, also called Genies, are persistent AI assistant configurations. They support multiple providers, stored credentials, standalone chats, Playground attachment, custom prompts, mounted files, MCP access, post-init setup, duplication, live activity, artefacts, feedback, mutters, and build-in-public timelines.

## Secrets, API keys, and webhooks

Secret Vault stores encrypted credentials for users and Genies. API keys provide scoped programmatic access. Webhooks deliver signed events to external systems.

Use this area when the user asks about automation credentials, third-party API tokens, MCP access, event subscriptions, HMAC signatures, event filters, delivery history, or safe external callbacks.

## Monitoring, notifications, and diagnostics

Fibe gives live feedback through service status, build steps, logs, in-app notifications, browser push notifications, commit notifications, audit logs, diagnostics, and maintenance tools.

Use this area when a user asks how to observe a Playground, track changes, inspect failures, or receive updates.

## Data portability

Users can export and import resources for backup or migration. Exportable areas include Props, Marquees, Playspecs, Agents, Playgrounds, Templates, Secrets, and Webhooks. Imports support conflict handling and rollback for created resources.

## Related skills

- [fibe-product-map](fibe-product-map.md) for the conceptual model.
- [fibe-resource-lifecycles](fibe-resource-lifecycles.md) for resource behavior over time.
- [fibe-agents-and-automation](fibe-agents-and-automation.md) for Genies and jobs.
- [fibe-security-access-and-integrations](fibe-security-access-and-integrations.md) for access and integration surfaces.
