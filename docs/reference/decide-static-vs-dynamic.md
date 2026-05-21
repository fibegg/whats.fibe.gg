---
title: "Static Vs Dynamic"
description: "Use when classifying a Compose service as a Fibe static (prebuilt image) or dynamic (source-backed - cloned/built/mounted from a Git repository) service."
slug: /reference/decide-static-vs-dynamic
sidebar_label: "Static Vs Dynamic"
image: /img/og/reference-decide-static-vs-dynamic.png
keywords: ["Fibe", "Decision", "decide", "static", "vs", "dynamic"]
tags: ["reference", "decision"]
format: md
---

Every service in a Fibe template is one of two kinds. Successful classification is driven by source labels, not by intent.

## The dividing line

**Dynamic** when `fibe.gg/repo_url` is set and resolves to a Prop.

These signals require `fibe.gg/repo_url` and are errors without it:

1. Compose `build:` block exists.
2. `fibe.gg/source_mount` label is set.

**Static** otherwise — the service runs the image you specify, period.

There is no `fibe.gg/type` label; do not invent one. The classifier derives type from these signals.

## When to pick which

### Choose static when

- You consume a published image (`postgres:17`, `redis:8`, `nginx:alpine`, `node:24-slim`, app images from a registry).
- The app is configured purely through env vars and mounted volumes.
- You don't want Fibe to clone/sync source.
- The image already contains the runtime command (or you override via Compose `command:`).

### Choose dynamic when

- The app lives in a Git repo (GitHub or Gitea) and the user wants Fibe to clone/build/mount it.
- You want hot-reload by mounting the working tree.
- You want Fibe to manage build → image → rollout from a `Dockerfile` in the repo.
- The Playspec should be reusable across branches.

## What labels to add to a dynamic service

| Concern | Label |
|---|---|
| Repo URL | `fibe.gg/repo_url: https://github.com/owner/repo` (or `$$var__REPO_URL`) |
| Branch | `fibe.gg/branch: main` (default: repo default) |
| Dockerfile path | `fibe.gg/dockerfile: Dockerfile` (default) |
| Live source mount | `fibe.gg/source_mount: /app` (default) |
| Runtime command | `fibe.gg/start_command: bundle exec rails server -b 0.0.0.0` |
| Dev mode (mounted) | `fibe.gg/production: "false"` |
| Production mode (built image) | `fibe.gg/production: "true"` |
| Env example | `fibe.gg/env_file: env.example` |
| Build target | `fibe.gg/build_target: production` |
| Build args | `fibe.gg/build_args: "RAILS_ENV=production,NODE_VERSION=24"` |

Most are optional — defaults fit normal repos. See [reference-fibe-labels](reference-fibe-labels.md).

## Source-backed dev vs production

A dynamic service can run in two modes:

- **`fibe.gg/production: "false"`** — Fibe bind-mounts the cloned repo at `fibe.gg/source_mount` (default `/app`). Edits in the source tree are reflected immediately. The app must run a watch/dev process. See [recipe-source-mount](recipe-source-mount.md).
- **`fibe.gg/production: "true"`** — Fibe builds the Dockerfile and runs the resulting image. No bind-mount. Treat like static for ergonomics but with build management from Fibe.

The same template can switch between them by parameterizing the label with `$$var__PRODUCTION`.

## What about Compose `build:`

If the input compose has `build: .` or `build: { context: ..., dockerfile: ... }`, you have a dynamic service. Convert it:

```yaml
# Input
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev

# Fibe template (drop build:, lift to labels)
services:
  web:
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/dockerfile: Dockerfile.dev
      fibe.gg/source_mount: /app
      fibe.gg/start_command: ...
```

`build.context` is irrelevant on Fibe — context is always the repo root. If your `Dockerfile` lives in a subdirectory, set `fibe.gg/dockerfile: deploy/Dockerfile`.

See [recipe-build-to-repo-url](recipe-build-to-repo-url.md) and [recipe-build-args-and-target](recipe-build-args-and-target.md).

## Static services in source-backed templates

Even in a source-backed template (where the main app service is dynamic), supporting services (Postgres, Redis, MinIO, MailHog, Gitea) stay static — they use published images. Treat them as you would in any Compose project.

```yaml
services:
  web:                                    # dynamic
    image: ghcr.io/owner/repo:latest      # base image while waiting for build, OK
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/expose: external:3000
  db:                                     # static
    image: postgres:17
    volumes:
      - pg_data:/var/lib/postgresql/data
  redis:                                  # static
    image: redis:8-alpine
```

## Common mistakes

- Setting `fibe.gg/repo_url` on a `postgres` service because "the app uses Postgres". The label means "this service IS built from that repo" — never set on dependencies.
- Setting `fibe.gg/source_mount` without `fibe.gg/repo_url`. Validator rejects.
- Leaving Compose `build:` while also setting `fibe.gg/repo_url` — fine, but the `build.context` is ignored. Either remove `build:` entirely or keep it as documentation.

## Related skills

[reference-fibe-labels](reference-fibe-labels.md), [recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-source-mount](recipe-source-mount.md), [recipe-build-args-and-target](recipe-build-args-and-target.md), [playbook-rails-app](playbook-rails-app.md), [playbook-nodejs-dev](playbook-nodejs-dev.md).
