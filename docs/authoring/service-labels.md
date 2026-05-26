---
title: Service labels
description: The complete set of fibe.gg/* labels you can add under labels on a service. Source & build, routing & exposure, rolling updates, automation.
slug: /authoring/service-labels
sidebar_position: 3
image: /img/og/authoring-service-labels.png
keywords: [fibe.gg labels, repo_url, port, visibility, subdomain, path_rule, healthcheck, source_mount, job_watch]
---

The complete set of `fibe.gg/*` labels you can add under `labels:` on a service. Any unrecognized `fibe.gg/*` label is rejected, so typos surface quickly.

## Source & build

| Label | Purpose |
| --- | --- |
| `fibe.gg/repo_url` | HTTPS GitHub or Gitea URL the service comes from. Required for built services and source-mounted services. |
| `fibe.gg/branch` | Pin to a non-default branch. |
| `fibe.gg/dockerfile` | Dockerfile path relative to the repo root (defaults to `Dockerfile`). |
| `fibe.gg/build_target` | Name of the stage when using a multi-stage build. |
| `fibe.gg/build_args` | Comma-separated `KEY=value` pairs for build-time arguments. |
| `fibe.gg/source_mount` | Container path to live-mount the working tree at (defaults to `/app`). |
| `fibe.gg/start_command` | Command to run, overriding the image's default. For dev-mode templates this is where you put your hot-reload command (`bin/rails server -b 0.0.0.0`, `next dev -H 0.0.0.0`, `vite --host 0.0.0.0`, `uvicorn app:main --reload --host 0.0.0.0`). |
| `fibe.gg/env_file` | Path to the env example file in your Prop (defaults to `.env.example`). Fibe reads this file to surface what env values your service expects; your service still loads the file itself at runtime. |
| `fibe.gg/production` | Set to `"true"` for built images, `"false"` for source-mounted dev mode. When it's false, Fibe mounts your repository into the container so edits show up live — pair it with `fibe.gg/start_command` set to your dev/watch command so reloads actually happen. |

## Routing & exposure

| Label | Purpose |
| --- | --- |
| `fibe.gg/port` | Container port to route through Traefik. |
| `fibe.gg/visibility` | `external` for a public HTTPS URL, or `internal` for a URL gated by Basic Auth. Defaults to `external`. |
| `fibe.gg/subdomain` | Choose the subdomain under the Marquee's root domain. Lowercase letters and digits, optional hyphens. Use `@` to bind at the root domain itself. Defaults to the service name. |
| `fibe.gg/path_rule` | Share a subdomain across multiple services using path matchers like `Path`, `PathPrefix`, and `PathRegexp`. Combine with `&&` or `||`. |

## Rolling updates

Set `fibe.gg/zerodowntime: "true"` when the service is exposed, speaks HTTP, and can run multiple replicas at once. Then add the healthcheck labels so Fibe knows when a new replica is ready:

| Label | Purpose |
| --- | --- |
| `fibe.gg/healthcheck_path` | HTTP path that returns 2xx when the service is ready. |
| `fibe.gg/healthcheck_interval` | How often to poll (`10s`, `500ms`, `1m`). |
| `fibe.gg/healthcheck_timeout` | How long to wait for a response — keep it shorter than the interval. |
| `fibe.gg/healthcheck_retries` | Consecutive failures that mark the replica unhealthy. |
| `fibe.gg/healthcheck_start_period` | Grace window during boot — match real boot time. |

## Automation

| Label | Purpose |
| --- | --- |
| `fibe.gg/job_watch` | Set to `"true"` on the service whose exit defines the result of a Trick. |

## Booleans: quote them

Label values that look boolean (like `"true"` or `"false"`) should be written as **quoted strings**. Avoid `yes`, `no`, `on`, `off`, `1`, or `0` — only the literal strings are recognized.

```yaml
labels:
  fibe.gg/production: "true"
  fibe.gg/zerodowntime: "false"
```

## Cross-label rules

The runtime enforces these consistency rules:

- A Compose `build:` block **requires** `fibe.gg/repo_url`.
- `fibe.gg/source_mount` **requires** `fibe.gg/repo_url`.
- `fibe.gg/zerodowntime: "true"` **requires** `fibe.gg/port`, and the service **must not** declare `ports:` or `container_name`.
- Any label value can be a variable reference using `$$var__NAME`.

## A example

A Rails dev-mode service with source mount, dev server command, healthcheck, and rolling updates disabled (since Rails dev mode is single-process):

```yaml
services:
  web:
    image: ruby:3.3
    working_dir: /app
    labels:
      fibe.gg/repo_url: https://github.com/owner/rails-app
      fibe.gg/source_mount: /app
      fibe.gg/start_command: bin/rails server -b 0.0.0.0 -p 3000
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/subdomain: app
      fibe.gg/production: "false"
      fibe.gg/env_file: .env.example
    depends_on:
      - db
```

## Related

- [Compose → Fibe](/authoring/compose-to-fibe/) — the conversion flow.
- [Settings block](/authoring/settings-block/) — `x-fibe.gg` reference.
- [Execution modes](/authoring/execution-modes/) — `job_watch` in context.
- Reference: [`reference-fibe-labels`](/reference/reference-fibe-labels/) — the authoritative skill.
