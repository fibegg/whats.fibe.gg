---
title: "Gitea Repos Create"
description: "Use when you need to create a new repo on the Player's connected Gitea (managed or external) and atomically register it as a Fibe Prop."
slug: /reference/tools/gitea-repos-create
sidebar_label: "Gitea Repos Create"
image: /img/og/reference-tools-gitea-repos-create.png
keywords: ["Fibe", "Tool", "fibe", "tool", "gitea", "repos", "create"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:GREENFIELD] Tier: other. Not idempotent.

Creates a Gitea repository AND a Prop pointing at it through `POST /api/gitea_repos`. Default greenfield git provider (used by `fibe_greenfield_create` when `git_provider` is unset).

## When to use
- Default flow for Greenfield: GitHub OAuth not required.
- Player wants a repo on the platform's managed Gitea.
- Need a fresh Prop bound to that repo immediately (vs `fibe_github_repos_create` which leaves Prop creation to a follow-up).
- Brownfield transforms where a new source-mounted service needs real files before first rollout. For multiple new services, call this through `fibe_pipeline` so repos are created in one round-trip, then seed/commit/push all new repos before `fibe_playgrounds_transform`.

## When NOT to use
- Player explicitly wants GitHub — use `fibe_github_repos_create` + `prop.attach`.
- Already have an external repo — use `prop.mirror` or `prop.attach`.
- You only need empty repos for a transform and do not need to write source before rollout — let `fibe_playgrounds_transform` provision missing Gitea Props with `provision_inputs` instead.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Repository name |
| `private` | bool | no | Default `false` |
| `auto_init` | bool | no | Init with README |
| `description` | string | no | Repo description |

## Auth
Requires a Gitea connection on the Player's account with a non-empty access token. Fibe returns `GITEA_CONNECTION_REQUIRED` if missing.

## Output
```json
{
  "name": "demo",
  "full_name": "fibegg/demo",
  "html_url": "https://gitea.fibegg.local/fibegg/demo",
  "clone_url": "...",
  "default_branch": "main",
  "private": false,
  "repo": { ... },           // alias for the same structure
  "prop": { "id": 17, "name":"demo", "repository_url":"...", "provider":"gitea", ... },
  "prop_id": 17
}
```

## Behavior
1. Create repo via Gitea API.
2. Normalize URL via `Gitea::UrlNormalizer` and check if a Prop already exists for it.
3. If exists — return existing Prop (de-dup).
4. Otherwise create a new Prop owned by the current player and link via `player_resources`.

## Gotchas
- Idempotency-Key supported (`with_idempotency_key`). A retry with the same key returns the cached prior response, even on failure.
- Name collision returns `VALIDATION_FAILED` from `ActiveRecord::RecordInvalid`.
- Gitea API errors surface as `GITEA_API_ERROR` with the upstream message.
- The Prop is owned by the Player who triggered creation, not the Gitea owner — they may differ when a player has external Gitea credentials.
- Cannot re-target an existing Prop — if a duplicate URL exists, the existing Prop is returned untouched.

## Related
- `fibe_github_repos_create` — GitHub variant (no atomic Prop creation).
- `fibe_resource_mutate(resource:"prop", ...)` — attach/mirror/sync existing repos.
- `fibe_greenfield_create` — calls this internally as default `git_provider`.
