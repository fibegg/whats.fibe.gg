---
name: fibe-tool-find-github-repos
description: Use when you need to search GitHub repos across ALL the Player's connected GitHub App installations. Aggregates and deduplicates across orgs/accounts.
---

# fibe_find_github_repos

[MODE:DIALOG] Read-only, idempotent. Tier: other.

Aggregates repository search across every connected GitHub App installation for the authenticated Player. Maps to Rails `GET /api/github_repos/search` (`Api::GithubReposSearchController#index`), which fans out parallel threads (one per installation) and deduplicates by `full_name`.

## When to use
- "What repos can I deploy from?" without knowing which org/installation owns them.
- Pre-flight before `fibe_resource_mutate(resource:"prop", operation:"attach")`.
- Discovering repos when you don't have the org/account name handy.

## When NOT to use
- You already know `<owner>/<repo>` — just `prop.attach`.
- You need single-installation listing — use `fibe_call` with `fibe_installations_repos`.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | Substring on repo name (Octokit search semantics) |
| `page` | int | 1 | Clamped to 1..1000 |
| `per_page` | int | 30 | Clamped to 1..100 |

## Output
```json
{
  "data": [
    {
      "id": ..., "name": "demo", "full_name": "owner/demo",
      "private": false, "description": "...",
      "html_url": "...", "clone_url": "...", "ssh_url": "...",
      "default_branch": "main"
    }
  ],
  "meta": { "page":1, "per_page":30, "total":<dedup_count>, "installations_queried":<N> }
}
```

## Behavior
- One thread per installation; failed installations are logged + skipped, not propagated.
- Deduplication by `full_name` (most-specific repo wins).
- If the Player has zero installations, returns `data:[], total:0, installations_queried:0`.

## Gotchas
- Octokit search may return stale results vs API; if a freshly-created repo doesn't appear, retry after a short delay.
- Cannot search a repo the GitHub App doesn't have access to — install the App on the org first.
- `q` is GitHub's substring/keyword query, not regex.
- Rate limits: each installation pull counts against its own GitHub App quota.

## Related
- `fibe_get_github_token` — short-lived token for a found repo.
- `fibe_repo_status_check` — verify access to specific URLs.
- `fibe_github_repos_create` — make a new repo (OAuth path).
- `fibe_resource_mutate(resource:"prop", operation:"attach")` — register the found repo.
