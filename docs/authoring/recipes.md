---
title: Recipes
description: Pattern-level building blocks. Each one is a small set of changes that solve a single authoring question.
slug: /authoring/recipes
sidebar_position: 9
image: /img/og/authoring-recipes.png
keywords: [recipes, patterns, ports to expose, subdomain, path_rule, build, source mount, variables]
---

Pattern-level building blocks. Each one is a small set of changes that solve a single authoring question.

For each recipe, the [Reference](/reference/intro/) section has a full skill file with the exact YAML. This page is an index — pick the recipe that matches your need and follow the link.

## Routing & exposure

- [Replace `ports:` with `expose`](/reference/recipe-ports-to-expose/) — Compose port publishing → Fibe HTTPS routing.
- [Pick a subdomain](/reference/recipe-add-subdomain/) — set the host label; use `@` for the root.
- [Share a subdomain with a path rule](/reference/recipe-add-path-rule/) — several services, one subdomain.

## Source & build

- [Convert `build:` to repo labels](/reference/recipe-build-to-repo-url/) — Compose builds → Fibe dynamic services.
- [Live source mount](/reference/recipe-source-mount/) — dev-mode templates with hot reload.
- [Build args & targets](/reference/recipe-build-args-and-target/) — multi-stage builds, custom build args.
- [Env file pointer](/reference/recipe-env-file/) — tell Fibe which env example file to read.

## Variables & secrets

- [Lift Compose `${VAR}`](/reference/recipe-extract-env-variables/) — turn Compose interpolations into Fibe variables.
- [Inline a variable into a string](/reference/recipe-inline-variables/) — `$$var__NAME` in URLs, tags, partial strings.
- [Bind a whole node with a path](/reference/recipe-whole-node-paths/) — `path:` / `paths:` for whole values.
- [Generate & mark sensitive](/reference/recipe-random-and-secrets/) — `random: true` for launch-unique secrets.

## Compose hygiene

- [Strip incompatible keys](/reference/recipe-strip-incompatible-keys/) — what to remove.
- [Use named volumes](/reference/recipe-named-volumes/) — for persistent data.
- [Order with `depends_on`](/reference/recipe-depends-on/) — start services in the right order.
- [Share with anchors](/reference/recipe-anchors-and-aliases/) — YAML anchors for repeated config.
- [Inline config files](/reference/recipe-configs-block/) — `configs:` for small init scripts.
- [Fill in metadata](/reference/recipe-add-metadata/) — description, category, source_defaults.

## Scaling & healthchecks

- [Healthcheck labels for rolling updates](/reference/recipe-zero-downtime-healthcheck/) — the five healthcheck labels.

## Related

- [App playbooks](/authoring/playbooks/) — end-to-end conversions by app shape.
- [Compose → Fibe](/authoring/compose-to-fibe/) — the conversion flow.
