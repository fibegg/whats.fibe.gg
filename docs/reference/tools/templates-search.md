---
title: "Templates Search"
description: "Use when you need to search the Fibe Import Template catalog (own + public + team) by full-text or PostgreSQL regex before greenfield/launch."
slug: /reference/tools/templates-search
sidebar_label: "Templates Search"
image: /img/og/reference-tools-templates-search.png
keywords: ["Fibe", "Tool", "fibe", "tool", "templates", "search"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:GREENFIELD] Read-only, idempotent. Tier: greenfield.

Searches Templates the current Player can read — own templates, public templates, team-shared templates — through `GET /api/import_templates/search`.

## When to use
- Greenfield mode, choosing a starting template.
- Looking up a known template by name / tag / topic before `fibe_templates_launch`.
- Surveying available capabilities ("what Postgres templates exist?").

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `query` | string | no | Search query (full-text by default) |
| `template_id` | number | no | Restrict to one specific template (variant lookup) |
| `regex` | bool | no | Treat `query` as PostgreSQL regex |

## Regex mode constraints
Regex search is prefiltered with a 3+ character literal token from the regex; if no such token exists, the search errors out (`RegexSearchError`). Examples:
- `"^demo-"` — works (literal `demo-`).
- `".*"` — rejected (no token).
- `"foo|bar"` — works (each alternative ≥3 chars).

## Output
```json
{
  "data": [
    {
      "id": 1,
      "name": "fibe/postgres",
      "description": "...",
      "category": "...",
      "owner": { ... },
      "latest_version": { "id": 5, "version": 5, "public": true },
      "scope": "own" | "public",
      "full_access": true | false,
      ...
    }
  ],
  "meta": { "page": 1, "per_page": <N>, "total": <N> }
}
```

`scope` distinguishes: `own` (you can update), `public` (read-only). `full_access:true` means you can edit & version it.

## Search padding
When the `query` is non-empty and matches nothing in your accessible scope, Fibe attempts a fallback recall against the broader scope so you get *some* results to consider — these are marked `mode: :public` with `full_access: false`.

## Gotchas
- Empty `query` returns the full accessible catalog (paginated by `per_page` from caller, defaults vary).
- Regex without a literal token returns 422 `RegexSearchError` with a hint message.
- `template_id` filter is exact-match — useful for "show me all versions / variants of template 42".
- Visibility follows CanCanCan policies: a private template owned by another player is invisible even if its name matches.

## Recipes
- "find Tower-style apps": `{ query:"tower" }`.
- Strict prefix only: `{ query:"^tower-", regex:true }`.
- Versions of a known template: `{ template_id:42 }`.

## Related
- `fibe_templates_launch` — launch a found template.
- `fibe_greenfield_create` — uses `template_id` from this output.
- `fibe_resource_list(resource:"template", params:{q:"..."})` — alternative listing path.
