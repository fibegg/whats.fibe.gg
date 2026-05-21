---
title: "Greenfield Create"
description: "Use when bootstrapping a greenfield app in one call — creates one or more repos/Props from a template or GitHub repo snapshot, an app-owned template version, a deployed Playground, waits for running, and links it locally to /app/playground."
slug: /reference/tools/greenfield-create
sidebar_label: "Greenfield Create"
image: /img/og/reference-tools-greenfield-create.png
keywords: ["Fibe", "Tool", "fibe", "tool", "greenfield", "create"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:GREENFIELD] Tier: greenfield. Not idempotent.

Deployment requires a funded Marquee. If the selected Marquee is unpaid, the tool fails with `MARQUEE_NOT_FUNDED` before deployment starts.

The single canonical entry point for creating a new app from scratch. Bundles repo/Prop creation + Template version + Playground + wait + symlink into one round-trip. Multi-repo templates are supported: each distinct dynamic source repo becomes its own private destination repo and Prop. Calls `POST /api/greenfields`, returns a `request_id`, and polls the returned `status_url` until done.

It can start from an existing template selector, inline `template_body`, or a GitHub repository config snapshot. Repository snapshot mode fetches `fibe.yml`, `fibe.yaml`, `docker-compose.yml`, or `docker-compose.yaml` through the Player's GitHub App installation, validates it as-is, creates new app-owned destination repo(s), and then launches normally.

## When to use
- Player asks to "create a new &lt;type&gt; app", "spin up a Tower for X", "scaffold a project".
- Player provides a GitHub repository that contains a Fibe-compatible `fibe.yml` or Docker Compose file and wants a new app created from that snapshot.
- After deciding template/git_provider/marquee in Greenfield mode (see `system.md`).

## When NOT to use
- Player is iterating on an existing app — use `fibe_playgrounds_transform` (Brownfield).
- Just need a Playground from an existing Template — use `fibe_templates_launch` (no repo creation).
- Player wants to **change the stack of an already-deployed playground** while preserving its id (e.g., "rebuild this playground with FastAPI + AngularJS instead") — use `fibe_playgrounds_transform`. That tool is the brownfield analog of this one and provisions Gitea-backed private Props on the fly the same way.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | no | Repository/app name; inferred from `repository_url` basename when omitted |
| `template_id` | number | no | Template to base on; defaults to platform base template |
| `version` | string | no | Template version tag (e.g. `v1`); requires `template_id` |
| `template_body` | string | no | Inline YAML; mutually exclusive with `template_id`/`version` |
| `template_body_path` | string | no | Local FS path to YAML file (local MCP only) |
| `repository_url` | string | no | GitHub repo as `owner/repo`, `owner/repo@ref`, or `https://github.com/owner/repo`; mutually exclusive with template inputs |
| `config_path` | string | no | Config file path inside the repo. If omitted, Fibe tries `fibe.yml`, `fibe.yaml`, `docker-compose.yml`, `docker-compose.yaml` |
| `github_ref` | string | no | Branch, tag, or commit for the config file. Only the config file revision; service refs stay in YAML |
| `github_account` | string | no | Friendly GitHub App installation owner alias when multiple installations exist |
| `github_installation_id` | number | no | Exact GitHub App installation selector for automation or duplicate account names |
| `git_provider` | enum | no | `gitea` (default) or `github` |
| `private` | bool | no | Create destination repo(s) as private |
| `marquee_id_or_name` | string/number | no | Target Marquee. Falls back to `FIBE_MARQUEE_ID` env |
| `variables` | object | no | Template variables, e.g. `{"app_name":"Tower"}` |
| `service_subdomains` | object | no | Per exposed service subdomain overrides, e.g. `{"app":"tower","admin":"tower-admin"}` |
| `wait_timeout` | string | no | Go duration; default `10m` |

## What it does (under the hood)
1. Validates inputs; reads `template_body_path` or fetches repository config if provided.
2. Resolves the target Marquee from `marquee_id_or_name` or env if missing.
3. Calls the server Greenfield endpoint with normalized variables.
4. Polls request status until terminal.
5. On `success`: re-fetches the Playground (server may have promoted state since the request finished).
6. Calls `localplaygrounds.Link(target, "/app/playground")` to symlink the playground's mounted volumes into the Agent container's working directory.

The server-side `GreenfieldCreateJob` does roughly:
- Resolve dynamic source repos from the selected template or fetched repository snapshot.
- Create a Git repo via the chosen provider for each distinct source repo.
- Create one Prop per created repo.
- Create an Import Template version owned by the App (or use the requested template).
- Create a Playspec from the template version.
- Create a Playground on the resolved Marquee and trigger rollout.

## Output
```json
{
  "name": "demo",
  "git_repo": { ... },
  "prop": { ... },
  "repos": [{ "repository_url": "...", "source_repo_url": "...", "service_names": ["app"] }],
  "props": [{ "id": 17, "repository_url": "...", "service_names": ["app"] }],
  "template": { ... },
  "playspec": { ... },
  "playground": { "id": 42, "name": "...", "status": "running", ... },
  "service_urls": [{ "name": "app", "url": "https://..." }, { "name": "admin", "url": "https://..." }],
  "link": { "linked": true, "path": "/app/playground" }
}
```

If `wait_timeout` elapses before `running`, the call returns whatever was reached and the playground will still be in `creating`/`building`. `link` is null on link failure (e.g., volumes not yet mounted).

## Variables
The platform's base template uses `{{var__app_name}}` style placeholders compiled by `FibeCore::compose.compile_template`. Variables you don't pass keep template defaults; the platform also automatically injects `$$root_domain` (the Marquee's base domain).

## Gotchas
- `template_body` and `template_id`/`version` are mutually exclusive — error if both set.
- `repository_url` is mutually exclusive with `template_body`, `template_body_path`, `template_id`, `template_version_id`, and `version`.
- Repository snapshot mode does not auto-convert plain Compose or inject missing Fibe labels. The fetched file must already be a valid Fibe template/source.
- GitHub App installation is required even for public repos. If no installation exists, run `fibe github apps connect`; if more than one exists, pass `github_account` or `github_installation_id`.
- `owner/repo@ref` shorthand is accepted for `repository_url`; full GitHub URLs must use `github_ref`.
- `template_body_path` only works when the MCP server has filesystem access — fails on remote/HTTP transports.
- `git_provider:"github"` controls destination repo creation and requires the Player to have linked GitHub OAuth. GitHub App installation tokens are only for reading repository snapshot inputs, not for creating destination repos.
- For multi-service templates, pass `service_subdomains` when the caller needs deterministic URLs. Overrides apply only to exposed services and are validated before repos are created.
- A duplicate `name` collides with an existing Playground/Repo — the server returns `VALIDATION_FAILED` (handle and retry with a different name).
- Greenfield is **not idempotent**. Re-calling produces a duplicate (or fails on naming collision). Use the request_id-based status endpoint to recover from network drops if the SDK call gets cut.
- The Marquee must be `running` and chat_launchable for the Playground to deploy. Check `fibe_resource_get(resource:"marquee", ...)` if rollout stalls.
- `wait_timeout` "0" is treated as "skip wait" — the call returns as soon as initial setup finishes (status may still be `creating`).

## Related
- `fibe_templates_search` — find a fitting template *first*.
- `fibe_templates_launch` — Playground from an existing Template (no new repo).
- `fibe_playgrounds_transform` — iterate after landing.
- `fibe_local_playgrounds_link` — re-link if `/app/playground` symlinks went stale.
