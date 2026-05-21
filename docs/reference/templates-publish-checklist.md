---
title: "Templates Publish Checklist"
description: "Use as the final gate before publishing or submitting a reusable Fibe Compose template - covers safety, validation, naming, defaults, secrets, and security rejects."
slug: /reference/templates-publish-checklist
sidebar_label: "Templates Publish Checklist"
image: /img/og/reference-templates-publish-checklist.png
keywords: ["Fibe", "Skill", "templates", "publish", "checklist"]
tags: ["reference", "skill"]
format: md
---

Before a template is submitted as a public template, walk this list. If any check fails, fix and re-run.

## Gates (must pass)

1. **Valid YAML.** Parses cleanly as YAML.
2. **Compose-shaped root.** Has `services:`. Every service is a mapping.
3. **JSON Schema passes.** `fibe_schema(resource: "compose", operation: "validate", payload: {...})` returns valid.
4. **Runtime / server validation passes.** `fibe_templates_launch` with dry-run / preview succeeds.
5. **Starts on a normal Docker host** with equivalent env values supplied. (Local `docker compose up` works if you mock the Fibe-injected bits.)

Schema success alone is not enough. See [reference-validation-pipeline](reference-validation-pipeline.md).

## Service modeling

- [ ] Static services use `image:` only; no fake source backing.
- [ ] Dynamic services declare `fibe.gg/repo_url`.
- [ ] Compose `build:` services also declare `fibe.gg/repo_url`.
- [ ] Source-mounted services have sensible `working_dir`, `fibe.gg/source_mount`.
- [ ] Databases / queues / caches use named volumes (not host bind mounts).
- [ ] `depends_on:` exists where startup order matters; the app should still retry.
- [ ] No `container_name:`, especially when `fibe.gg/zerodowntime: "true"`.

## Labels / routing

- [ ] No unknown `fibe.gg/*` labels.
- [ ] Map-form labels preferred (easier to target with paths).
- [ ] Boolean labels use only `"true"` / `"false"` strings or YAML booleans (in map form).
- [ ] Expose values lowercase `internal` / `external`; concrete ports in `1..65535` or `$$var__NAME`.
- [ ] User-facing HTTP via `fibe.gg/expose`, never Compose `ports:`.
- [ ] `fibe.gg/subdomain` set only when default routing isn't right.
- [ ] `fibe.gg/path_rule` uses only `Path`, `PathPrefix`, `PathRegexp` — never `Host`, `Headers`, `Method`, `Query`, `ClientIP`.
- [ ] Internal-only routes use `internal:PORT`.
- [ ] Non-Fibe labels are intentional and safe (e.g. `traefik.enable`, vendor labels are pass-through).

## Zero-downtime

Opt in **only** if:
- [ ] Service is exposed via `fibe.gg/expose`.
- [ ] Service is HTTP and supports multi-replica concurrency.
- [ ] Has a real HTTP healthcheck endpoint.
- [ ] No `ports:` or `container_name:`.
- [ ] If zero-downtime healthcheck labels are overridden, values are realistic (interval > timeout, sufficient `start_period`).

## Variables

- [ ] All variable keys match `^[A-Za-z0-9_]+$`.
- [ ] Each variable has a non-empty `name:`.
- [ ] Defaults are safe and realistic — pasteable into a fresh launch.
- [ ] `validation:` regex is wrapped as `"/.../"`.
- [ ] Whole-node values use `path:` / `paths:`. Inline `$$var__NAME` only for string fragments.
- [ ] No real secrets in `default:`. Use `random: true` for generated, or platform Secrets for external creds.
- [ ] No hardcoded passwords anywhere — environment, configs, scripts.
- [ ] No undeclared `$$var__NAME` references.
- [ ] No declared-but-unused variables (declare with `path:`/`paths:` to make "unused" OK).

## Metadata

- [ ] `x-fibe.gg.metadata.description` explains what launches.
- [ ] `category` is broad and discoverable (Web, CI, Operations, Database, Productivity, Development, AI, Storage).
- [ ] `job_mode`, `schedule_config`, `trigger_config` only present when needed.
- [ ] Runtime IDs (`marquee_id`, `prop_id`) are environment-specific — consider whether the template should ship these or have them filled at launch.
- [ ] Trigger `event_type` is `push` or `pull_request` (no other values).

## Runtime quality

- [ ] Web services bind `0.0.0.0` inside their container.
- [ ] Dev templates use watch/dev commands when live editing matters; mention this in the description.
- [ ] Production templates avoid source mounts unless intended.
- [ ] Required env values come from defaults, variables, env files, or platform secrets.
- [ ] Migrations / setup are explicit (a dedicated `setup` service, or built into the app's `command`).
- [ ] Healthchecks don't depend on external internet.
- [ ] Images pinned to a stable tag — not `:latest` in production templates.

## Security rejects

Reject / revise templates that:

- [ ] Publicly expose unauthenticated admin consoles (pgAdmin, MinIO Console, Sidekiq dashboard) without `internal:` (which adds Basic Auth).
- [ ] Hardcode real secrets, private URLs, customer-specific paths.
- [ ] Mount the Docker socket (`/var/run/docker.sock`).
- [ ] Run privileged containers without a specific documented need.
- [ ] Require non-generic host paths (`/data/...`, `/mnt/...`).
- [ ] Publish user-facing non-HTTP ports through Compose `ports:` (TCP/UDP exposure isn't covered by Fibe routing).

## Common pre-publish failures

- `ports:` left in instead of `fibe.gg/expose`.
- `External:3000` (uppercase E).
- `yes` / `on` / `1` as boolean values.
- `Host(...)` in `path_rule`.
- Unused or undeclared variables.
- Expecting container ENV to configure labels/image/routing AFTER container start (it can't — labels are read pre-container).
- Zero-downtime on stateful singleton (Postgres, single-instance Redis).

## Final review

- [ ] Compare to the closest playbook listed in [Compose Conversion](convert-compose-to-fibe.md) — does the structure match the convention?
- [ ] Load [reference-fibe-labels](reference-fibe-labels.md) for any borderline label value.
- [ ] Run `fibe_schema(resource: "compose", operation: "validate", payload: {...})` from MCP.
- [ ] Run `fibe_templates_launch` with dry-run / preview.
- [ ] Record: launch result, exposed service URLs, required variables. Put in the submission description.

## After publish

- [ ] Test launch from a fresh Player + fresh Marquee — make sure required variables are honest about what launchers must provide.
- [ ] Add a Mutter on first launch with screenshots / proof so future Players can compare.
- [ ] Plan a maintenance window / version bump cadence — pinned image tags drift.

## Related skills

[reference-validation-pipeline](reference-validation-pipeline.md), [common-errors-and-fixes](common-errors-and-fixes.md), [reference-fibe-labels](reference-fibe-labels.md), [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md), [decide-zero-downtime](decide-zero-downtime.md), [recipe-add-metadata](recipe-add-metadata.md), [decide-secrets-and-randoms](decide-secrets-and-randoms.md).
