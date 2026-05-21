---
name: fibe-tool-resource-mutate
description: Use when you need a single tool for create/update and resource-scoped operations (attach, mirror, sync, fork, trigger, rerun, action, etc.) across Fibe resources. Schema-validates locally before API call.
---

# fibe_resource_mutate

[MODE:SIDEEFFECTS] Tier: base. Not idempotent (per resource semantics).

Unified mutation entry point. Validates `payload` against `fibe_schema(resource, operation)` locally, then dispatches to the SDK service for that resource. Use `dry_run:true` to validate without sending the request.

## Always preface with fibe_schema
Payload shapes differ wildly per resource. `fibe_schema(resource:"<r>", operation:"<op>")` is the only authoritative reference; the validator inside `fibe_resource_mutate` runs the same schema.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `resource` | string (enum) | yes | Canonical or alias |
| `operation` | string (enum) | yes | Op name; varies per resource |
| `payload` | object | yes | Op-specific args; schema-validated |
| `dry_run` | bool | no | Validate-only; returns `{valid:true,...}` without API call |
| `confirm` | bool | sometimes | Required for `playground.action` unless `--yolo` |

## Supported (resource, operation) matrix

**Agents**: `create`, `update`, `restart_chat`
**API keys**: `create`
**Marquees**: `create`, `update`, `autoconnect_token`, `generate_ssh_key`, `test_connection`
**Playgrounds**: `create`, `update`, `action` (lifecycle)
**Playspecs**: `create`, `update`
**Props**: `create`, `update`, `attach` (existing repo), `mirror` (clone external repo to managed Gitea), `sync` (re-pull from remote)
**Secrets**: `create`, `update`
**Templates**: `create`, `update` (incl. cover image), `fork`, `source_refresh`, `source_set`, `upgrade_playspecs`
**Template versions**: `create` (incl. patch-create), `toggle_public`
**Tricks**: `trigger`, `rerun`
**Webhooks**: `create`, `update`, `test`
**Job env**: `create` (i.e., `set`), `update`
**Artefact**: `create` (multipart upload — prefer dedicated `fibe_artefact_upload` tool)
**Memory**: `memorize` (preferred via `fibe_memorize`)

## Specific operations — quick reference

### `playground.create`
- Required: `playspec_id` (or playspec name via named resolution).
- `marquee_id` falls back to `FIBE_MARQUEE_ID` env if omitted.
- Returns the created Playground with status `creating`.

### `playground.action`
Synchronous-ish lifecycle action. Required `confirm:true` (or `--yolo`).
- `action_type`: `rollout` | `hard_restart` | `stop` | `start` | `retry_compose` | `enable_maintenance` | `disable_maintenance`.
- `force`: bypass state guards Rails permits forced execution for.

Rails returns 202 + `request_id`; SDK polls `GET /api/playgrounds/:id/action/:request_id` until terminal. Use `fibe_playgrounds_wait` for explicit status confirmation.

### `prop.attach`
Reuses an existing Player-owned GitHub/Gitea repo (full name like `owner/repo`); creates a Prop record without provisioning a new repository.

### `prop.mirror`
Clones an external public repo into the player's managed Gitea, returns the resulting Prop. Requires `source_url` + `name`.

### `prop.sync`
Triggers a forced re-pull of the Prop's mirror from upstream.

### `template.create` / `template.update`
- `update` accepts metadata-only diffs (name/description/category) AND/OR a cover image (`image_data` base64, `content_base64`, or `content_path`). At least one mutation field required.

### `template_version.create`
Creates a new versioned template body. Pass `template_body` inline OR `template_body_path` (local FS only). Optional `public:true`, `changelog`. `response_mode` defaults to `summary` (skips heavy metadata).

### `trick.trigger`
Schedule-style trigger. Required `playspec_id`; `marquee_id` defaults to env.

### `trick.rerun`
Re-runs an existing Trick by ID; reuses prior Playspec + Marquee.

### `marquee.test_connection` / `marquee.generate_ssh_key`
Long-running async (Rails returns `request_id`); the SDK polls. Use `fibe_resource_get(resource:"marquee", id:...)` to check `status` after.

### `webhook.test`
Sends a `webhook.test_ping` event to verify the endpoint is reachable.

## Output
Operation-specific. Most return the affected resource's JSON. Long-running mutations return a request envelope while the SDK polls under the hood.

`dry_run` short-circuits to:
```json
{
  "resource": "<canonical>",
  "operation": "<canonical>",
  "dry_run": true,
  "valid": true,
  "message": "Payload is valid; no request was sent."
}
```

## Gotchas
- **Named resource references are normalized.** Pass `playspec_id:"my-app-spec"` and the SDK resolves to the numeric ID. Same for `marquee_id`, `prop_id`, `playground_id`, `agent_id`.
- `playground.action` requires `confirm:true`; the dispatcher errors with `confirmRequiredError` otherwise.
- `template_body_path` is local-only — fails when the MCP server runs remotely.
- `secret.create/update` accepts plaintext in payload; the value is hashed/encrypted server-side and never returned plaintext again.
- `playspec.update` services use `prop_id` field for slot binding (named or numeric); the SDK splits this out before binding params.
- `memorize` works but use the dedicated `fibe_memorize` for the conversation snapshot logic.
- For artefact uploads, prefer `fibe_artefact_upload` — it handles base64/file-path decoding and `FIBE_AGENT_ID` resolution.

## Related
- `fibe_schema(resource:..., operation:...)` — required reference.
- `fibe_pipeline` — chain mutate → wait → get in one round-trip.
- `fibe_resource_get` / `fibe_resource_list` / `fibe_resource_delete`.
- Domain shortcuts: `fibe_artefact_upload`, `fibe_memorize`, `fibe_mutter`, `fibe_playgrounds_action`, `fibe_templates_launch`.
