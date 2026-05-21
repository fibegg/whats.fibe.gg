---
title: The x-fibe.gg settings block
description: Optional root key on the template. Holds launch-time variables and template metadata. Compose silently ignores it, so the file remains a valid docker compose file.
slug: /authoring/settings-block
sidebar_position: 4
image: /img/og/authoring-settings-block.png
keywords: [x-fibe.gg, variables, metadata, source_defaults, job_mode, schedule_config, trigger_config]
---

An optional root key on the template. Plain Docker Compose ignores it (anything beginning with `x-` is a vendor extension), so the file remains a valid Compose document for ordinary `docker compose up` testing.

## Shape

```yaml
x-fibe.gg:
  variables: { ... }              # launch-time inputs
  metadata:
    description: "..."            # what this template launches
    category: "..."               # a broad, discoverable category
    source_defaults: true|false   # auto-fill repo/branch on import
    job_mode: true|false          # mark this as a Trick template
    schedule_config: { ... }      # cron-driven launches
    trigger_config: { ... }       # VCS-triggered launches
```

:::info Where execution settings live
Execution settings (`job_mode`, `schedule_config`, `trigger_config`) live under `metadata`. Anything you put at the root is treated as a compatibility mirror but not authoritative.
:::

## variables

A map of launch-time inputs keyed by variable name. Each entry can carry:

- `name` — the display label shown in the launcher (required).
- `required` — must the launcher supply a value?
- `default` — used when no value is provided.
- `random` — generate a value automatically (good for first-launch passwords).
- `validation` — pattern the value must match (slash-wrapped regex).
- `path` or `paths` — where the value is written into the template body.
- `secret` / `sensitive` — UI hints for the launcher.

See [Launch variables](/authoring/variables/) for the full details.

## metadata

```yaml
metadata:
  description: "Production-ready Wiki.js + Postgres"
  category: "Productivity"
  source_defaults: true
```

`source_defaults: true` tells Fibe: when this template is launched from a connected Prop, fill in repository URLs and branches automatically on dynamic services that don't have them.

## schedule_config

```yaml
schedule_config:
  enabled: true
  cron: "0 * * * *"
  marquee_id: 1
```

Combined with `job_mode: true`. Cron is a standard 5-field expression. Fibe resolves `marquee_id` to a Marquee you own.

## trigger_config

```yaml
trigger_config:
  enabled: true
  event_type: push     # or "pull_request"
  repo_url: "https://github.com/owner/repo"
  branch: "main"
  prop_id: 1
  marquee_id: 1
```

Used with `job_mode: true`. With `source_defaults: true` and a source-backed launch, the repo URL and branch can be filled in for you.

## Example: full settings block

A Wiki.js template ready for the Bazaar:

```yaml
x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      default: "wiki"
      validation: "/^[a-z][a-z0-9-]*$/"
      path: services.wiki.labels.fibe.gg/subdomain
    DB_PASSWORD:
      name: "Database password"
      required: true
      random: true
      secret: true
      paths:
        - services.wiki.environment.DB_PASS
        - services.db.environment.POSTGRES_PASSWORD
  metadata:
    description: "Wiki.js with Postgres, ready to launch with one click"
    category: "Productivity"
    source_defaults: false
```

## Related

- [Launch variables](/authoring/variables/) — the inside of `variables:`.
- [Variable placement](/authoring/variable-placement/) — paths under templates.
- [Execution modes](/authoring/execution-modes/) — `job_mode`, schedule, trigger settings.
- Reference: [`reference-x-fibe-gg-namespace`](/reference/reference-x-fibe-gg-namespace/).
