---
title: Variable placement (paths)
description: When you bind a variable to a location with path or paths, the location is a dotted reference into the template body.
slug: /authoring/variable-placement
sidebar_position: 6
image: /img/og/authoring-variable-placement.png
keywords: [path, paths, YAML path, dotted notation, array index, fibe.gg/port]
---

When you bind a variable to a location with `path:` or `paths:`, the location is a dotted reference into the template body.

## Typical paths

```text
services.web.environment.RAILS_ENV
services.web.deploy.replicas
services.web.labels.fibe.gg/port
services.web.labels.fibe.gg/subdomain
x-fibe.gg.metadata.description
services.web.environment[0]
services.web.command[2]
```

Square brackets index into arrays. Dotted keys like `fibe.gg/port` are matched as **single segments** under `labels:` even though they contain dots — Fibe knows the difference.

## Same value, many destinations

```yaml
DB_PASSWORD:
  name: "Database password"
  required: true
  random: true
  paths:
    - services.postgres.environment.POSTGRES_PASSWORD
    - services.pgbouncer.environment.DB_PASSWORD
    - services.web.environment.FIBE_DB_PASS
    - services.jobs.environment.FIBE_DB_PASS
```

One random value, four destinations. All four read the same value at launch time.

## How writes are typed

Fibe infers the type of the written value:

- All-digit strings → integers.
- The literals `true` and `false` → booleans.
- Anything else → strings.

If you need a literal `"3"`, supply the value with quotes via a different mechanism — a path write of `3` will become an integer.

## Useful behaviors

- **Path writes happen after any inline substitution.** If both target the same value, the path write wins.
- **Missing intermediate maps are created for you** — the path doesn't need to already exist.
- **Indexing into something that isn't an array** is treated as a no-op, not an error — the rest of the template still compiles.

## Related

- [Launch variables](/authoring/variables/) — what's in a variable definition.
- Reference: [`reference-yaml-paths`](/reference/reference-yaml-paths/).
