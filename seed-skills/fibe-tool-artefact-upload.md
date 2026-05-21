---
name: fibe-tool-artefact-upload
description: Use when you need to upload an Artefact (file/report/plan/result) for the current Agent. Persists to Rails AND mirrors into FIBE_WORKSPACE_PATH if set.
---

# fibe_artefact_upload

[MODE:SIDEEFFECTS] Tier: base. Not idempotent.

Creates an Artefact with attached file content for the current Agent. Wraps `c.Artefacts.Create` (multipart `POST /api/agents/:agent_id/artefacts`).

When `FIBE_WORKSPACE_PATH` is set, the same content is also written into that directory under `<workspace>/<filename>` so the Player can see it in their local workspace.

## When to use
- Player asks for a deliverable (report, plan, summary doc, generated file).
- Long-form output that doesn't fit a mutter.
- Capturing tool output for later download/review.

## When NOT to use
- Short progress updates — use `fibe_mutter`.
- Persistent data the agent will reuse — that's a Memory (`fibe_memorize`) not an Artefact.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Display name (alias `title`); also used as filename fallback |
| `filename` | string | no | Target filename; defaults to `name` |
| `description` | string | no | Human description |
| `content_base64` | string | one of | Base64 file bytes (alias `content`) |
| `content_path` | string | one of | Absolute local FS path (local MCP only) |

`agent_id` comes from `FIBE_AGENT_ID` env.

## Output
The created Artefact JSON, including its `id`, attached file URL hint, content type, and `agent_id`.

## Behavior
1. Resolves `FIBE_AGENT_ID`.
2. Picks `filename` (explicit > `name`).
3. Decodes file source (base64 → bytes; or reads `content_path`).
4. If `FIBE_WORKSPACE_PATH` set:
   - Cleans filename (rejects path traversal / absolute paths).
   - Writes content to `<workspace>/<filename>`.
   - Re-creates the reader from in-memory bytes for the upload.
5. Calls `c.Artefacts.Create(ctx, agentID, params, reader, filename)` — multipart upload.

## Filename safety
- `..` segments rejected.
- Absolute paths rejected.
- Subdirectories OK (`reports/2026-q1.md` writes under `<workspace>/reports/...`).

## Output download
To later read the file content, use `fibe_resource_get(resource:"artefact_attachment", id:<artefact_id>)` — returns base64.

## Gotchas
- `FIBE_AGENT_ID` env is required; missing → fails immediately.
- `content_base64` and `content_path` are mutually exclusive in practice (only one is read; base64 wins if both set).
- Without explicit `filename`, the artefact's filename equals `name` — make `name` filesystem-safe if you rely on this.
- `content_path` only works on local MCP transport — fails on remote-served MCP.
- Workspace writes use `0644`/`0755` permissions; existing files are overwritten silently.

## Related
- `fibe_resource_get(resource:"artefact_attachment")` — download the file.
- `fibe_resource_list(resource:"artefact")` — discover existing artefacts.
- `fibe_mutter` — short-form alternative.
- `fibe_resource_mutate(resource:"artefact", operation:"create")` — uniform alternative path.
