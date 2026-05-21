---
title: "Get Github Token"
description: "Use when you need to mint a short-lived GitHub installation access token for a specific repository. Auto-resolves the correct GitHub App installation."
slug: /reference/tools/get-github-token
sidebar_label: "Get Github Token"
image: /img/og/reference-tools-get-github-token.png
keywords: ["Fibe", "Tool", "fibe", "tool", "get", "github", "token"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: other. Idempotent (Fibe caches tokens server-side).

Returns a fresh GitHub App **installation** token scoped to the installation that has access to `<owner>/<repo>` through `GET /api/github_token?repo=<owner/repo>`.

## When to use
- Need to clone/push to a Fibe-managed Prop's underlying GitHub repo from the Agent container.
- Issuing a one-off `git push` outside of the SDK's flow.
- Webhook subscription / API call against the repo's GitHub App-managed endpoints.

## When NOT to use
- You need *user-level* OAuth (creating new repos, accessing user profile) — installation tokens have App-scoped permissions only.
- Pure Fibe API access — that's `FIBE_API_KEY`, not a GitHub token.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `repo` | string | yes | Full repo name `owner/name` |

## Output
```json
{
  "token": "ghs_...",
  "expires_in": 3600   // seconds; token is valid this long
}
```

## Behavior
1. Looks up the GitHub App installation that has access to `repo` for the current Player.
2. If none → 404 `GITHUB_INSTALLATION_NOT_FOUND` with hint to install the App on the org/account.
3. Otherwise mints (or re-uses cached) installation token via `Github::App.installation_token`.

## Gotchas
- Tokens are short-lived (typically ~1 hour). Re-fetch when expired.
- Installation tokens have App-defined permissions — they cannot do anything the GitHub App config doesn't allow (e.g., creating new repos).
- Fibe's cache TTL is shorter than the token's actual lifetime to avoid serving expired tokens.
- This is **not** the user OAuth token. For user OAuth, use the GitHub OAuth flow on the Player profile.
- Octokit errors propagate as `GITHUB_TOKEN_ERROR` with HTTP 503.

## Related
- `fibe_find_github_repos` — discover repos before pulling tokens.
- `fibe_repo_status_check` — verify access without minting a token.
- `fibe_github_repos_create` — create new repo (OAuth path, different mechanism).
