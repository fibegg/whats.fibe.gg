---
name: fibe-tool-templates-change
description: Use when an advanced template-author or admin workflow needs the hidden lower-level primitive for patching, overwriting, or switching template versions, including Trick reruns and global template promotion.
---

# fibe_templates_change

[MODE:BROWNFIELD] Tier: brownfield. Hidden advanced primitive. Not idempotent.

The lower-level template change primitive. Combines: pick a target → patch, overwrite, or switch its template version → preview or apply → optionally rollout/trigger → wait → diagnose. Routes through `/api/import_templates/:id/versions/patch_*` and `/api/playspecs/:id/template_version_switch`.

## When to use
- Template-author workflows that need exact patch/overwrite control over a template version.
- Switching a Playspec/Playground/Trick to a specific existing template version.
- Job-mode Trick template patching followed by `post_apply:"trigger_trick"`.
- Promoting an experimental reusable template change across all linked Playgrounds (`rollout_all`).
- Internal workflows that already have exact template/version ids and do not need end-to-end Prop/repo provisioning.

## When NOT to use
- Normal existing deployed Playground stack/source/service changes — use `fibe_playgrounds_transform`; it is the agent-facing end-to-end tool and handles inline template authoring, private Prop provisioning, rollout, wait, and diagnostics.
- Initial creation — use `fibe_greenfield_create` or `fibe_templates_launch`.
- Need to delete a template version — use `fibe_resource_delete(resource:"template_version", id:...)`.

## Top-level inputs

### Required
| Field | Type | Notes |
|---|---|---|
| `target_type` | enum | `template` \| `playspec` \| `playground` \| `trick` |
| `target_id` | number | The ID of that target |
| `mode` | enum | `preview` (no writes) \| `apply` (commits) |
| `change_type` | enum | `patch` \| `overwrite` \| `switch_existing` |

### Patch-mode inputs
| Field | Type | Notes |
|---|---|---|
| `patches` / `edits` | array | At least one entry. YAML path set/remove or exact search/replace. |
| `base_version_id` | number | Defaults from target (latest version, or playspec's source). |

### Overwrite-mode inputs
| Field | Type | Notes |
|---|---|---|
| `template_body` | string | Full replacement YAML. Mutually exclusive with `template_body_path`. |
| `template_body_path` | string | Local FS only. |

### Switch-existing inputs
| Field | Type | Notes |
|---|---|---|
| `target_template_version_id` | number | Required. The version to switch to. Can belong to a completely different template — the server reconciles the prop set and regenerates services. |
| `switch_variables` | object | New variable values. |
| `regenerate_variables` | array of string | Variable names to regenerate from defaults. |
| `confirm_warnings` | bool | Required `true` to proceed when preview reports switch warnings. |
| `provision_missing_props` | enum | `off` \| `gitea` \| `github`. When the new template references repos the player doesn't yet own a Prop for, automatically provision a fresh git repo (in the player's connected Gitea or GitHub account) and create a Prop for each. Defaults to `off` (today's behaviour: public repos auto-create Props, private repos fail with a manual-creation hint). |
| `provision_private` | bool | Whether the freshly provisioned repos should be private. Defaults to `true`. |
| `provision_inputs` | array | Per-URL overrides: `[{source_repo_url, name_override?, default_branch?, description?, auto_init?}]`. Each `source_repo_url` must match a URL declared by the new template. |

### Outcome controls
| Field | Type | Default | Notes |
|---|---|---|---|
| `post_apply` | enum | `none` | `none` \| `rollout_target` \| `rollout_all` \| `trigger_trick` |
| `wait` | bool | `false` | Block on rollout / trick completion |
| `wait_timeout_seconds` | int | `180` | |
| `diagnose_on_failure` | bool | `true` | Pull `playgrounds.debug` summaries when wait fails |
| `response_mode` | enum | `summary` | `summary` or `full` |
| `changelog` | string | — | Stamp on the created template version (patch / overwrite). |
| `public` | bool | — | Make the new version public on creation. |
| `confirm` | bool | — | Required `true` for `mode:"apply"` unless `--yolo` |

## Workflow rules
- `target_type:"template"` only supports `post_apply:"none"` — there's no Playground/Playspec to roll out yet.
- `post_apply:"trigger_trick"` requires the target to be a Trick (job-mode Playspec).
- `post_apply:"rollout_target"` requires `target_type:"playground"`.
- `post_apply:"rollout_all"` rolls out every Playground linked to the affected Playspec.
- `change_type:"switch_existing"` requires a Playspec (or one resolvable from the target).

## Normal Playground transformations
For user-facing app changes such as "add Redis", "convert this to React + FastAPI", "split the worker out", "swap the runtime", or "add a new repo-backed service", prefer `fibe_playgrounds_transform`.

Use this hidden primitive only when the caller intentionally needs a template-version operation:

1. The target template/version already exists, or a patch/overwrite must land on an existing template.
2. The caller explicitly wants template-author/admin behavior rather than a project-local transform.
3. The caller accepts lower-level switch semantics and knows how Props should be resolved.

Never use `post_apply:"rollout_all"` for a single-user app/project chat. Reserve `rollout_all` for explicit admin/global promotion workflows. Never update the default/global Import Template unless the user is intentionally administering reusable templates.

## Preview mode
Returns the diff and warnings without writing anything. Always run `mode:"preview"` first when the change is non-trivial — switch-existing previews surface variable-collision warnings you can resolve via `regenerate_variables`/`switch_variables`.

## Output (apply)
```json
{
  "result": <patch_or_switch_result>,
  "wait_results": [ { "id": 42, "success": true, "status": "running" } ],
  "diagnostics": { "42": { ... debug summary ... } },
  "triggered_trick": { ... }   // only when post_apply=trigger_trick
}
```

## Patch DSL
```json
{
  "patches": [
    { "op": "set",    "path": "services.web.image", "value": "ruby:3.3", "create_missing": true },
    { "op": "remove", "path": "services.legacy", "allow_missing": true },
    { "search": "OLDVAR=1", "replace": "NEWVAR=2" }
  ]
}
```
`patches` and `edits` are equivalent aliases.

## Example: advanced patch of one Playground's template
```json
{
  "target_type": "playground",
  "target_id": 42,
  "mode": "apply",
  "change_type": "patch",
  "post_apply": "rollout_target",
  "wait": true,
  "confirm": true,
  "confirm_warnings": true,
  "changelog": "Add Redis cache for this project",
  "patches": [
    { "op": "set", "path": "services.redis", "create_missing": true, "value": { "image": "redis:7-alpine", "volumes": ["redis-data:/data"] } },
    { "op": "set", "path": "services.web.depends_on", "create_missing": true, "value": ["redis"] },
    { "op": "set", "path": "services.web.environment.REDIS_URL", "create_missing": true, "value": "redis://redis:6379/0" },
    { "op": "set", "path": "volumes.redis-data", "create_missing": true, "value": {} }
  ]
}
```

## Example: advanced overwrite
For template-author changes where patches would be fragile, use `change_type:"overwrite"` with a complete template body. Preserve the project's app-owned source repo labels on dynamic services, keep only the intended public service exposed, then apply with `target_type:"playground"`, `post_apply:"rollout_target"`, and `wait:true`.

## Example: switch to a different existing template version

When the user wants to transform an existing playground onto a stack with a *different* set of dynamic services and Props that don't yet exist for them, prefer **`fibe_playgrounds_transform`** — single call, takes `template_body`, handles inline template authoring + private Gitea-backed Prop provisioning + rollout in one shot.

Use `fibe_templates_change change_type:"switch_existing"` directly only when:
- The target template version already exists, and
- The player already owns Props for any private repos the new template references (or `provision_missing_props` lets the server provision them).

Example with `provision_missing_props`:
```json
{
  "target_type": "playground",
  "target_id": 42,
  "mode": "apply",
  "change_type": "switch_existing",
  "target_template_version_id": 250,
  "post_apply": "rollout_target",
  "wait": true,
  "confirm": true,
  "confirm_warnings": true,
  "provision_missing_props": "gitea"
}
```

## Gotchas
- `mode:"apply"` requires `confirm:true` (unless server is `--yolo`).
- `target_type:"trick"` only works when the resolved Playspec is `job_mode:true`.
- `template_body_path` is local-only; on remote MCP transports use `template_body`.
- Rolling out job-mode tricks is rejected — use `trigger_trick` instead.
- `wait_timeout_seconds` ≤ 0 falls back to default 180.
- The patch is created as a new template version each apply — never mutates an existing version (immutability).
- When you `apply` a switch, the SDK auto-sets `auto_switch:true` on the playspec to flip references atomically.

## Related
- `fibe_playgrounds_transform` — single-call brownfield analog of `fibe_greenfield_create` for transforming a deployed playground onto a different stack with new private Gitea-backed Props.
- `fibe_resource_get(resource:"template", id:...)` — review current state.
- `fibe_playgrounds_wait` / `fibe_playgrounds_debug` — diagnose post-rollout.
- `fibe_resource_mutate(resource:"template_version", operation:"toggle_public")` — share a version.
