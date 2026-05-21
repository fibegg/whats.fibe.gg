---
name: fibe-tool-repo-status-check
description: Use when you need to verify Fibe's view of multiple GitHub repository URLs in one call — accessibility, App installation status, default branch, etc.
---

# fibe_repo_status_check

[MODE:DIALOG] Read-only, idempotent. Tier: other.

Bulk repository status query. Up to 50 GitHub URLs at once. Maps to Rails `POST /api/repo_status` (`Api::RepoStatusController#check`) which delegates to `Github::RepoStatusService`.

## When to use
- Pre-flight before `prop.attach` for a list of repos.
- Diagnosing why a Prop sync fails (App not installed? repo private? renamed?).
- Bulk audit: "do I still have access to all my Props' repos?"

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `github_urls` | array of string | yes | Up to 50 URLs; extras truncated |

## Output
```json
{
  "repos": [
    {
      "url": "...",
      "accessible": true | false,
      "installation_id": 12345,
      "default_branch": "main",
      "private": false,
      "found": true,
      "error": null | "..."
    }
  ]
}
```

## Behavior
- Validates each URL, looks up the player's installation that has access to it, checks the repo through Octokit.
- Inaccessible repos return `accessible:false` with an `error` reason instead of 404.

## Gotchas
- Maximum 50 URLs — extras are dropped silently. Pre-chunk if you have more.
- The result's order matches the input order.
- Empty `github_urls` returns `{repos: []}`.
- This is read-only — does not mint tokens or modify state.
- URLs must be GitHub URLs; Gitea URLs are rejected.

## Related
- `fibe_find_github_repos` — discovery.
- `fibe_get_github_token` — once you've confirmed access.
- `fibe_resource_mutate(resource:"prop", operation:"sync")` — fix accessible-but-stale repos.
