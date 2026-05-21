---
name: fibe-tool-github-repos-create
description: Use when you need to create a new GitHub repository under the Player's OAuth-connected GitHub account and register it as a Fibe Prop.
---

# fibe_github_repos_create

[MODE:GREENFIELD] Tier: other. Not idempotent.

Creates a fresh GitHub repository on the Player's OAuth-linked GitHub account and registers a corresponding Prop. Wraps Rails `POST /api/github_repos` (`Api::GithubReposController#create`).

## When to use
- Greenfield flows that explicitly want code stored on GitHub (not Gitea).
- Player asks for "a new GitHub repo for project X".
- Standalone Prop creation tied to a brand-new GitHub repo.

## When NOT to use
- Player has no GitHub OAuth connection — fail fast with a redirect message.
- You only need to deploy something — `fibe_templates_launch` doesn't need a repo.
- Existing repo — use the `prop.attach` operation via `fibe_resource_mutate`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Repository name (no slash; org placement is implicit via OAuth account) |
| `private` | bool | no | Default `false` |
| `auto_init` | bool | no | Init with README; default `false` |
| `description` | string | no | Repo description |

## Auth
Requires the Player's GitHub **OAuth** token (NOT the GitHub App installation token — those are scoped to the App, not the user, and cannot create user/org repos). Without OAuth, Rails returns `GITHUB_OAUTH_REQUIRED`.

## Output
```json
{
  "id": 123456,
  "name": "demo",
  "full_name": "viktorvsk/demo",
  "html_url": "https://github.com/viktorvsk/demo",
  "clone_url": "https://github.com/viktorvsk/demo.git",
  "ssh_url": "git@github.com:viktorvsk/demo.git",
  "private": false,
  "description": null
}
```

## Gotchas
- This tool ONLY creates the GitHub repo. It does NOT create a Prop record. To register the repo with Fibe, follow with `fibe_resource_mutate(resource:"prop", operation:"attach", payload:{repo_full_name:"<owner>/<name>"})`. (Compare with `fibe_gitea_repos_create` which does both atomically.)
- Repository name collisions surface as `REPOSITORY_CREATION_FAILED` (Octokit::UnprocessableEntity).
- Private repos require a GitHub plan that allows them.
- The OAuth token's scopes must include `repo` (or `public_repo` for public-only).
- Idempotency-Key is honored server-side — retrying with the same key skips creation if the request already succeeded.

## Related
- `fibe_gitea_repos_create` — Gitea variant; creates Prop atomically.
- `fibe_get_github_token` — pull a usable installation token afterward (different scope!).
- `fibe_find_github_repos` — list existing repos before creating.
- `fibe_resource_mutate(resource:"prop", operation:"attach")` — register the new repo as a Prop.
