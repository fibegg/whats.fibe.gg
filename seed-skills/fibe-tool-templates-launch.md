---
name: fibe-tool-templates-launch
description: Use when you need to bootstrap and launch a Playground directly from an existing import template, without creating a new repo. Greenfield-lite.
---

# fibe_templates_launch

[MODE:GREENFIELD] Tier: greenfield. Idempotent (per `name` + `template_id`).

Spins up a Playground from an Import Template version. Skips repo creation. Maps to Rails `POST /api/import_templates/:id/launches` (`Api::ImportTemplatesController#launch`).

## When to use
- Player wants to deploy a known template (Postgres, n8n, MetaBase, custom team Template, etc.) without owning the source code.
- Demoing a template via Marquee.
- Re-launching a Trick template as a Playground for ad-hoc inspection.

## When NOT to use
- Need to deploy an existing source repo config — use `fibe_launch_create`.
- Need Fibe to create app-owned destination repo(s) from a template or repo snapshot — use `fibe_greenfield_create`.
- Already have a Playground and want to change its stack/source/service shape — use `fibe_playgrounds_transform`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `template_id_or_name` | string/number | yes | Template to launch |
| `marquee_id_or_name` | string/number | no | Target Marquee. Falls back to `FIBE_MARQUEE_ID` |
| `name` | string | no | Playground name override |
| `version` | number | no | Specific template version (defaults to latest accessible) |
| `variables` | object | no | Template variables |
| `env_overrides` | object | no | Extra env vars merged into all services |
| `service_subdomains` | object | no | Per-service subdomain overrides for exposed services |
| `services` | object | no | Per-service config overrides (image, command, env, etc.) |

## Output
The created Playspec + Playground envelope, mirroring `fibe_greenfield_create`'s payload minus repo/prop fields.

## Behavior
1. SDK validates inputs and resolves `marquee_id_or_name`, falling back to `FIBE_MARQUEE_ID`.
2. Rails resolves the template version (latest if unspecified), compiles the Compose YAML with provided variables, applies overrides.
3. Creates a Playspec linked to the template version, then a Playground, then schedules rollout.
4. Returns immediately with `creating`/`building` status — combine with `fibe_playgrounds_wait` for confirmation.

## Variables
Same engine as Greenfield: `{{var__name}}` placeholders, plus implicit `$$root_domain`. Variables not provided fall back to template defaults defined in `x-fibe.gg.variables`.

## env_overrides vs service.env
- `env_overrides` — flat map merged into every service's env.
- `services.<name>.env` — per-service overrides; takes precedence.

## Gotchas
- Public templates require `:read` access; private templates require ownership.
- `service_subdomains` only applies to exposed services. Unknown service names and invalid subdomains are rejected by the server.
- This tool does NOT wait for `running`. Pair with `fibe_playgrounds_wait` or use a `fibe_pipeline` chain.
- Same name as an existing Playground triggers a `VALIDATION_FAILED` response — retry with a unique name.

## Related
- `fibe_templates_search` — find templates by query / regex.
- `fibe_launch_create` — launch directly from inline Compose or a GitHub repository config file.
- `fibe_greenfield_create` — when new app-owned repo(s) are also needed.
- `fibe_playgrounds_transform` — modify after launch.
- `fibe_playgrounds_wait` — confirm `running`.
