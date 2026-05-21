---
name: fibe-tool-playgrounds-transform
description: Use when an existing deployed playground needs to be transformed end-to-end to a different stack, service shape, source layout, or prop set while preserving its id. Single-call brownfield analog of fibe_greenfield_create. Authors a new template inline if needed and provisions Gitea-backed private Props on the fly for new repos.
---

# fibe_playgrounds_transform

[MODE:BROWNFIELD] Tier: brownfield. Not idempotent.

The single-call tool for **changing the stack or service/source shape of an already-deployed playground** without recreating it. Preserves the playground id, repoints its playspec at a (possibly fresh) template, regenerates services, optionally provisions private Gitea repos for new props the player doesn't yet own, and rolls out — all in one MCP call.

This is the brownfield analog of `fibe_greenfield_create`. Routes through `/api/import_templates` (when authoring inline) + `/api/playspecs/:id/template_version_switch` + `/api/playgrounds/:id/rollout` server-side.

## When to use

- "I want this playground to be a completely different app now (FastAPI + AngularJS instead of bun web)" — change the entire stack while keeping the deployment id.
- "Switch this trick onto a different template version that has new dynamic props the player doesn't own yet."
- Any flow where the natural answer would be "delete and recreate" but the player needs to keep the same playground id (saved settings, share links, etc.).

## When NOT to use

- Brand-new playground from scratch — use `fibe_greenfield_create`.
- Template-author or admin workflows that specifically need to patch/overwrite/switch a template version primitive — use hidden `fibe_templates_change` through `fibe_call`.
- Job-mode Trick template patching/reruns — use hidden `fibe_templates_change` with `target_type:"trick"` through `fibe_call`.

## Top-level inputs

### Required
| Field | Type | Notes |
|---|---|---|
| `playground_id` | int | Numeric ID of the deployed playground. Preserved across the transformation. |
| One of: `template_body`, `template_body_path`, `template_id`, `template_version_id` | string / int | How the new template version is selected (see *Authoring vs reusing* below). |

### Authoring inline (no existing template)
| Field | Type | Notes |
|---|---|---|
| `template_body` | string | Full template YAML. The server creates an `ImportTemplate` (auto-named for this playground unless `template_name` is set) and a first `ImportTemplateVersion`, then switches the playground to it. |
| `template_body_path` | string | Local FS only. Absolute path to YAML. Mutually exclusive with `template_body`. |
| `template_name` | string | Optional name override for the freshly created template. |
| `changelog` | string | Optional changelog stamped on the freshly created version. |

### Reusing an existing template
| Field | Type | Notes |
|---|---|---|
| `template_id` | int | Existing ImportTemplate. Without `template_body`, the latest version is used. With `template_body`, a new version is published under it. |
| `template_version_id` | int | Exact existing ImportTemplateVersion to switch to. Mutually exclusive with `template_body`. |

### Variables
| Field | Type | Notes |
|---|---|---|
| `variables` | object | Variable values for the new template. |
| `regenerate_variables` | array of string | Variable names to regenerate from defaults instead of carrying over. |

### Provisioning new Props (the headline feature)
| Field | Type | Default | Notes |
|---|---|---|---|
| `provision_missing_props` | enum | `"gitea"` | `"off"` \| `"gitea"` \| `"github"`. When the new template references a repo URL the player doesn't already own a Prop for, the server creates a fresh **private** repo in the player's connected Gitea (or GitHub) account, seeds it from the template's declared `source_repo_url`, and creates a Prop record. Set to `"off"` to disable and require existing player Props. |
| `provision_private` | bool | `true` | Whether the freshly provisioned repos should be private. |
| `provision_inputs` | array | — | Per-URL overrides: `[{source_repo_url, name_override?, default_branch?, description?, auto_init?}]`. `source_repo_url` must match a URL declared by the new template. |

### Outcome controls
| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` | enum | `apply` | `preview` returns the diff, warnings, required variables, and prop-resolution preview without writes. `apply` commits. |
| `confirm` | bool | — | Required `true` for `mode:"apply"` unless server runs `--yolo`. |
| `confirm_warnings` | bool | `false` | Required `true` to proceed when preview reports switch warnings (dropped services, exposure changes, etc.). |
| `wait` | bool | `true` | Block on rollout completion. |
| `wait_timeout_seconds` | int | `180` | |
| `diagnose_on_failure` | bool | `true` | Pull `playgrounds.debug` summary if rollout fails. |
| `response_mode` | enum | `summary` | `summary` or `full`. |

## Authoring vs reusing

- **No existing template + you have YAML in mind** → pass `template_body`. The server creates everything.
- **Existing template, want its latest version** → pass `template_id`.
- **Specific existing version** → pass `template_version_id`.
- **Existing template, want a new version on top** → pass `template_id` + `template_body` (and optionally `changelog`).

## Workflow rules

- The **playground id is preserved**. Same `id`, same `playspec_id`. Only the playspec's `source_template_version_id` is repointed and `services[]` regenerated.
- For latency-sensitive brownfield rewrites, avoid trial-and-error discovery: gather the target playground, local mounts, and URLs first; then make one clear transform plan and apply it once.
- When the new services need custom source files before startup, pre-create all new Gitea repos in one `fibe_pipeline` batch, seed/commit/push their source, reference those real repo URLs in `template_body`, and then apply the transform. Use `provision_missing_props:"off"` when every referenced repo already has a Prop, so missing repos fail early instead of being silently replaced.
- When the new services can start from generated/default source, skip manual repo creation and let this tool provision missing Props. Provide a unique `source_repo_url` per service and matching `provision_inputs` with `auto_init:true` so the tool creates empty initialized repos instead of trying to clone placeholder URLs.
- For every exposed service, design the root path `/` as a Player-visible contract: frontend roots render UI; API/admin roots return useful JSON, status, or docs. Do not leave exposed roots as framework 404s.
- Props the new template references that the player **already owns** (matched by `repository_url` or fork) are reused — no new provisioning.
- Props the new template references that point to **public** repos auto-create a Prop pointing at the public URL (today's default behaviour; unaffected by `provision_missing_props`).
- Props for **private** repos the player doesn't own are handled by `provision_missing_props`:
  - `"gitea"` (this tool's default): provision a fresh private Gitea repo + Prop; seed from the template's `source_repo_url` if present, else auto-init.
  - `"github"`: same, in the player's connected GitHub account.
  - `"off"`: fail with `PROP_RESOLUTION_FAILED`. Use this only if you've pre-created the Props and want the switch to honour them strictly.
- Old Props that the new template no longer references stay in the DB (no auto-cleanup). Delete them with `fibe_resource_delete resource=prop` if desired.

## Preview mode — what the agent sees before applying

`mode:"preview"` returns a result that includes `prop_resolution_preview`:

```json
{
  "prop_resolution_preview": {
    "existing": [{ "url": "...", "prop_id": 42 }],
    "existing_forks": [],
    "would_create_public": [{ "url": "https://github.com/some/public-repo" }],
    "would_provision": [{ "url": "...", "service_name": "api", "provision_provider": "gitea" }],
    "missing_private": []
  },
  "warnings": [...],
  "diff": {...},
  "playground_rollout_plan": {...}
}
```

`would_provision` is populated only when `provision_missing_props != "off"` and surfaces what the apply will create. If you want to opt out for some URLs, pass `provision_inputs` overrides or pre-create the Props yourself.

`missing_private` (populated only when `provision_missing_props = "off"`) is the list of URLs that will fail apply.

## Output (apply)

```json
{
  "mode": "apply",
  "playground": { "id": 42, "name": "...", "playspec_id": 17, ... },
  "template": { "id": 99, "name": "playground-42-transform-..." },
  "template_version": { "id": 250, "version": 1 },
  "switch_result": { "from_template_version": ..., "target_template_version": ..., "playspec": ..., "diff": ..., "warnings": [] },
  "provisioned_props": [
    { "source_repo_url": "...", "service_name": "api", "provider": "gitea", "repo": {...}, "prop_id": 71, "default_branch": "main" }
  ],
  "wait_results": [{ "id": 42, "success": true, "status": "running" }],
  "diagnostics": null
}
```

## Headline example: "build me a FastAPI + AngularJS app on this playground"

The player has a deployed playground (id `42`) running the bun-web demo. They ask for a completely different stack with two dynamic services. No matching template exists.

```json
{
  "playground_id": 42,
  "template_body": "x-fibe.gg:\n  variables:\n    app_name:\n      name: 'App name'\n      required: true\nservices:\n  api:\n    image: python:3.12-slim\n    command: ['uvicorn', 'app:app', '--host', '0.0.0.0', '--port', '8000']\n    environment:\n      APP_NAME: $$var__app_name\n    labels:\n      fibe.gg/repo_url: 'https://github.com/fibegg/__fibe_greenfield_new_repo__'\n      fibe.gg/source_mount: '/srv'\n      fibe.gg/expose: 'external:8000'\n      fibe.gg/subdomain: '$$var__app_name-api'\n  frontend:\n    image: node:20-alpine\n    working_dir: /app\n    command: ['npx', 'serve', '-s', 'dist', '-l', '80']\n    labels:\n      fibe.gg/repo_url: 'https://github.com/fibegg/__fibe_greenfield_new_repo__'\n      fibe.gg/source_mount: '/app'\n      fibe.gg/expose: 'external:80'\n      fibe.gg/subdomain: '$$var__app_name-web'\n",
  "variables": { "app_name": "fastapi-angular-42" },
  "provision_missing_props": "gitea",
  "wait": true,
  "confirm": true
}
```

What happens server-side, atomically:

1. Author a fresh `ImportTemplate` (named `playground-42-transform-<timestamp>`) and a first `ImportTemplateVersion` with the supplied body.
2. Resolve the new template's prop URLs. The two `__fibe_greenfield_new_repo__` placeholders signal "spin up a fresh repo per service".
3. With `provision_missing_props:"gitea"`, create two **private** Gitea repos in the player's account (one for `api`, one for `frontend`), each auto-initialized.
4. Create two new Prop rows pointing at those Gitea repos and link them to the player.
5. Update the playspec in place: `source_template_version_id` repointed, `services[]` regenerated, base compose YAML compiled.
6. Update the playground row's services hash (drop the old single-service `web`, add `api` + `frontend` defaults).
7. Roll out the playground (same id `42`).
8. Wait until status is `running`. Return composite result.

## Gotchas

- `mode:"apply"` requires `confirm:true` (unless server is `--yolo`).
- `confirm_warnings:true` is needed when preview reports any warnings (dropped services, port collisions, etc.).
- `provision_missing_props:"gitea"` requires the player to have a connected Gitea account (otherwise fails with `GITEA_CONNECTION_REQUIRED`). Same for GitHub.
- Do not create repos one-by-one with separate reasoning loops for multi-service transforms. Batch independent repo creation with `fibe_pipeline`, then write files in each repo and apply one transform.
- `template_body_path` is local-only; on remote MCP transports, pass `template_body` directly.
- If you also edit app source in a Prop repo, commit and push those source edits before `mode:"apply"` rollout; the rollout path re-syncs mounted source from git HEAD.
- For source-mounted Node/Vite services, keep `node_modules/` out of git and use a named volume for dependencies; Vite 6+ also needs `server.allowedHosts: true` or the generated Fibe host.
- For Angular apps using Zone.js, import `zone.js` before bootstrapping or explicitly configure zoneless change detection. `NG0908` is a fatal browser verification failure.
- Browser-rendered apps must be verified with a real browser/Playwright check after rollout. Grepping initial HTML is insufficient for Angular/React/Vue/Svelte apps.
- Before handoff, verify each exposed root URL plus at least one real endpoint/data path. Container health and `/health` alone are not enough.
- For `postgres:18+`, mount persistent data at `/var/lib/postgresql` (not `/var/lib/postgresql/data`) or use a fresh volume name. Postgres 18 rejects old-style `/var/lib/postgresql/data` mounts when a reused volume contains prior data.
- Old Props that the new template no longer references are NOT auto-deleted. They become orphans owned by the player (harmless but cluttery). Delete via `fibe_resource_delete resource=prop`.
- Job-mode tricks cannot be transformed through this tool — use hidden `fibe_templates_change` with `target_type:"trick"` through `fibe_call`.

## Related

- `fibe_greenfield_create` — brand new playground from scratch.
- `fibe_templates_change` — hidden advanced primitive: patch/overwrite an existing template, switch a playspec to an existing version, patch Tricks, etc. Lower-level building block for this tool.
- `fibe_resource_get(resource:"playground", id:...)` — verify the playground after transforming.
- `fibe_playgrounds_debug` / `fibe_playgrounds_logs` — diagnose post-rollout.
- `fibe_resource_delete(resource:"prop", id:...)` — clean up orphaned Props from old templates.
