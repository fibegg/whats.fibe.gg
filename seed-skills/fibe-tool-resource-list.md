---
name: fibe-tool-resource-list
description: Use when you need to list any flat Fibe resource (playground, prop, marquee, agent, secret, webhook, audit_log, memory, artefact, etc.) with schema-validated filters.
---

# fibe_resource_list

[MODE:DIALOG] Read-only, idempotent. Tier: base.

Generic list endpoint over the resource registry. Maps `resource:"<name>"` to the matching SDK call (`c.<Resource>.List`) which hits Rails `GET /api/<plural>` with paginated/filterable params.

## When to use
- Any time you need a collection of resources by filter — there is almost always a single canonical list call.
- Cheaper than `fibe_call` because it short-circuits the validation layer.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `resource` | string (enum) | yes | Canonical name or alias |
| `params` | object | no | Resource-specific filters; validated against `fibe_schema(resource:<r>, operation:"list")` |

## Supported resources
`playground`, `trick`, `agent`, `artefact`, `playspec`, `prop`, `marquee`, `secret`, `api_key`, `webhook`, `webhook_delivery`, `template`, `template_version`, `job_env`, `audit_log`, `memory`, `category`.

Aliases include plurals and dashed forms (`playgrounds`, `webhook-endpoints`). Resource catalog: `fibe_schema(resource:"list")`.

## Output (typical)
```json
{
  "data": [ { "id": 1, "name": "...", ... } ],
  "meta": { "page": 1, "per_page": 25, "total": 7 }
}
```
Some resources omit `meta` for unpaginated list endpoints.

## Resource-specific filter highlights
| Resource | Common params |
|---|---|
| `playground` | `name`, `status`, `playspec_id`, `marquee_id`, `job_mode` (defaults to `false` — set `true` to list tricks via this resource) |
| `trick` | same as playground; `job_mode` is forced |
| `agent` | `name`, `marquee_id` |
| `prop` | `name`, `provider`, `repository_url` |
| `marquee` | `name`, `status` |
| `secret` | `name` (values never returned in plaintext) |
| `webhook_delivery` | requires `webhook_id` filter |
| `template_version` | requires `template_id` filter |
| `template` | `q` (full-text search) |
| `audit_log` | `since`, `until`, `actor_id`, `resource_type` |
| `memory` | `q`, `provider`, `project`, `tags`, `conversation_id` |

## Pagination
Standard: `params.page` (1-based), `params.per_page` (default 25, max 100). `params.sort` is allowlisted per resource.

## Gotchas
- `playground` excludes job-mode tricks by default. Pass `params.job_mode:true` to include them, or use `resource:"trick"`.
- `secret` and `job_env` list returns metadata only — no plaintext values, even with reveal scopes.
- `webhook_delivery` and `template_version` list **require** their parent ID in `params`.
- Filters not in the schema are silently dropped — call `fibe_schema(resource:..., operation:"list")` if a filter "doesn't work".

## Related
- `fibe_resource_get` — single-record fetch.
- `fibe_resource_mutate` — create/update/etc.
- `fibe_schema(resource:..., operation:"list")` — exact filter shape.
