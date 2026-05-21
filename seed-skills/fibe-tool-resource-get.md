---
name: fibe-tool-resource-get
description: Use when you need to fetch a single Fibe resource by id, or by name for playgrounds, tricks, playspecs, props, marquees, and agents. Includes artefact_attachment download.
---

# fibe_resource_get

[MODE:DIALOG] Read-only, idempotent. Tier: base.

Generic single-record fetch. Routes to the SDK's typed `Get` / `GetByIdentifier` for each resource, hitting `GET /api/<plural>/:id` (or named lookup where supported).

## When to use
- "What's the current state of playground X?"
- "Does this name resolve to a real prop?"
- Pre-mutation read to avoid lost-update.
- Downloading an artefact's attached file (`resource:"artefact_attachment"`).

## Inputs
| Field | Type | Notes |
|---|---|---|
| `resource` | string (enum), required | Canonical or alias |
| `id` | number | Numeric ID (preferred for ID-only resources) |
| `identifier` | string | Numeric ID OR slug-safe name (named resources only) |

Pass exactly one of `id` / `identifier`. Named-resolved resources (`playground`, `trick`, `playspec`, `prop`, `marquee`, `agent`) accept either.

## Output
The resource's detailed JSON serialization. Nested includes vary per resource:
- `playground` — playspec, marquee, services, status, urls.
- `prop` — provider, repository_url, default_branch.
- `playspec` — services, source_template_version, mounted files.
- `template` — versions, source, lineage hints.

## artefact_attachment (special case)
Downloads the artefact's single attached file, base64-encoded:
```json
{
  "resource": "artefact_attachment",
  "id": 123
}
```
returns
```json
{
  "resource": "artefact_attachment",
  "artefact_id": 123,
  "filename": "report.pdf",
  "content_type": "application/pdf",
  "content_base64": "<...>",
  "size": 12345
}
```
Use this for the actual file bytes; `resource:"artefact"` returns metadata only.

## Secrets / job_env
- `secret` — returns metadata only. Plaintext is **never** revealed via this tool, regardless of API key scope. Use the dedicated CLI/UI reveal flow.
- `job_env` — same; the field `reveal` is rejected here.

## Gotchas
- Named lookup is case-sensitive (slug-style). For ambiguous text use list + filter.
- Numeric strings work for `identifier` ("123" parses as ID 123).
- Passing `reveal` returns an error — secrets cannot be unmasked through this tool.
- `artefact` get without `attachment` keyword returns metadata; you must explicitly use `artefact_attachment` for the file.
- For audit_log / memory the `delete` op exists in schema but is allowlist-restricted; `get` is unrestricted within accessibility.

## Related
- `fibe_resource_list` — bulk fetch / discovery.
- `fibe_resource_mutate` — modify.
- `fibe_resource_delete` — remove (destructive).
