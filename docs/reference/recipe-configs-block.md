---
title: "Configs Block"
description: "Use Docker Compose top-level `configs:` to inline small config files (init scripts, conf templates) without bind-mounting from the host. Distinct from Fibe Mounted Files."
slug: /reference/recipe-configs-block
sidebar_label: "Configs Block"
image: /img/og/reference-recipe-configs-block.png
keywords: ["Fibe", "Recipe", "recipe", "configs", "block"]
tags: ["reference", "recipe"]
format: md
---

Compose's `configs:` top-level key holds **inline content** that Compose mounts into containers as files. Unlike host bind mounts, the content lives in the template itself, so it's portable across Marquees and survives clean checkout.

## Why use `configs:`

- Small config snippets (5-50 lines): nginx conf, postgresql.conf, init.sh.
- Content that should ship with the template, not the app repo.
- Avoiding bind mounts from host paths that don't exist on Marquees.

For larger/binary files use **Fibe Mounted Files** (Playspec/Agent files via `fibe_artefact_upload`), not Compose `configs`. See platform skill `fibe-mounted-files`.

## Pattern

Declare at the root `configs:` block, reference from a service:

```yaml
services:
  postgres:
    image: postgres:17.5
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    configs:
      - source: pg_conf
        target: /etc/postgresql/postgresql.conf

configs:
  pg_conf:
    content: |
      listen_addresses = '*'
      shared_buffers = 1GB
      effective_cache_size = 3GB
      max_connections = 200
```

Use this pattern for small database config files, init scripts, proxy snippets, or other text files that should travel with the template.

## Inline shell script via `configs:`

```yaml
services:
  gitea-init:
    image: gitea/gitea:1.23
    configs:
      - source: init_script
        target: /init.sh
    command: ["/bin/sh", "/init.sh"]

configs:
  init_script:
    content: |
      if [ -f /data/gitea-admin-token ]; then
        echo "Already initialized." && exit 0
      fi
      gitea admin user create --admin --username admin --password "$$ADMIN_PWD"
      gitea admin user generate-access-token --username admin --raw > /data/gitea-admin-token
```

Notes:
- Use `$$` for a literal `$` in the script content if you want shell-style env var reference inside the container (e.g. `$$ADMIN_PWD` becomes `$ADMIN_PWD` after Compose escapes the double-dollar).
- For Fibe template variables you want substituted at compile time, use `$$var__NAME` (one `$$`).

## `configs:` vs `secrets:`

Compose's `secrets:` is similar but for sensitive content with stricter file permissions. Both work on Fibe; prefer `configs:` for plain config, `secrets:` for credentials. (Fibe Secrets — the resource type — is a different layer; use Fibe Secrets for Player-managed long-lived credentials.)

## Targets

The `target:` field is the absolute path inside the container. The container must be willing to read from that path. If the container's image expects the config at a specific path, set `target:` to match.

## File mode

Set `mode: 0o400` (or other octal) on the config to control permissions:

```yaml
configs:
  pg_conf:
    content: |
      ...
    mode: 0o644
```

Default mode varies by Docker version — explicit is safer.

## Variable-driven content

```yaml
configs:
  app_conf:
    content: |
      app_name = $$var__APP_NAME
      port = $$var__PORT

x-fibe.gg:
  variables:
    APP_NAME:
      name: "App name"
      default: "demo"
    PORT:
      name: "Port"
      default: "3000"
```

The Fibe compiler substitutes `$$var__NAME` inside `configs:` content too — it's text-level substitution.

## When NOT to use

- File is larger than ~10 KB. Move to a Mounted File or include in the Dockerfile.
- File is binary. Use Mounted File.
- File needs to change without redeploying the template — Mounted File can be re-uploaded.
- File is the app's source code — it belongs in the repo (use source mount).

## Pitfalls

- **Forgetting the leading pipe `|`** — drops the newlines and YAML may misparse.
- **YAML treating shell `$VAR` as an alias** — quote or escape. Use `$$VAR` for literal `$VAR`.
- **Inline content larger than YAML reasonably handles** — splitting a 200-line config across YAML indentation is fragile. Prefer Mounted Files or include in the image.
- **Forgetting the `target:` path** — without it, Compose mounts at `/<config_name>`, which is rarely what you want.

## Related skills

[recipe-anchors-and-aliases](recipe-anchors-and-aliases.md), [recipe-inline-variables](recipe-inline-variables.md), [playbook-rails-app](playbook-rails-app.md), [playbook-postgres-app](playbook-postgres-app.md). Platform skill `fibe-mounted-files` for large/binary files.
