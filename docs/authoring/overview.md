---
title: Authoring a template
description: A Fibe template is a Docker Compose file with a few Fibe-specific additions — labels on the services that need them, and an optional settings block at the top.
slug: /authoring/overview
sidebar_position: 1
image: /img/og/authoring-overview.png
keywords: [template authoring, Docker Compose, fibe.gg, x-fibe.gg, labels, variables]
---

A Fibe template is a Docker Compose file with a few Fibe-specific additions — labels on the services that need them, and an optional settings block at the top for launch variables and template metadata.

If you can write Compose, you can author a Fibe template. The additions are small and additive; a Compose file without them is still a valid Fibe template (just with no Fibe-specific behavior).

## The two ingredients

- **Service labels** under `labels:` on each service. These tell Fibe how to route, build, expose, and watch the service.
- **A settings block** at the root under `x-fibe.gg:`. Holds launch-time variables and template metadata. Optional, but you'll want it once you have anything customizable.

Everything else is plain Docker Compose. A template that doesn't need Fibe features is just a Compose file.

## The smallest template

```yaml
services:
  web:
    image: nginx:alpine
    labels:
      fibe.gg/expose: external:80
```

One service, one label. You get a public HTTPS URL with no other setup.

## Where it ships

While you're iterating, the template lives in your private **Templates** collection. When it's polished — clear description, sensible defaults, no hardcoded private values — you can publish it to the **Bazaar** for anyone to launch.

See [Before you publish](/operate/publishing/) for the polish checklist.

## What to read next

- **Coming from an existing `docker-compose.yml`?** Walk [Compose → Fibe](/authoring/compose-to-fibe/) — a nine-step conversion.
- **Authoring from scratch?** Skim [Service labels](/authoring/service-labels/) for the label reference, then [Settings block](/authoring/settings-block/) for variables/metadata.
- **Choosing between modes?** Read [Execution modes](/authoring/execution-modes/) — long-running, Trick, scheduled, triggered.
- **Stuck on a decision?** [Decision guides](/authoring/decisions/) has short opinionated answers.
- **Looking for a pattern?** [Recipes](/authoring/recipes/) — small, copy-pasteable changes.
- **A worked end-to-end example?** [Playbooks](/authoring/playbooks/) — Rails, Node dev mode, WordPress, Wiki.js, and more.
