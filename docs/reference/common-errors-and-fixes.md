---
title: "Common Errors And Fixes"
description: "Use as a diagnostic table for typical errors when converting docker-compose to Fibe templates - unknown labels, bad regex matches, missing repo_url, zerodowntime conflicts, undeclared/unused variables, and trigger/schedule issues."
slug: /reference/common-errors-and-fixes
sidebar_label: "Common Errors And Fixes"
image: /img/og/reference-common-errors-and-fixes.png
keywords: ["Fibe", "Skill", "common", "errors", "and", "fixes"]
tags: ["reference", "skill"]
format: md
---

A short lookup of frequent validation and launch errors with the exact fix. The error text below is the substring Fibe usually returns through public validation, preview, launch, CLI, or MCP flows.

## Hidden runtime inference (no hard error, but behavior changes)

Some signals change behavior even when no explicit error is raised:

- **Job-mode lifecycle is enforced**
  If `x-fibe.gg.metadata.job_mode: true` is enabled, Fibe applies:
  - `restart: "no"` on all services
  - `deploy.replicas: 1` on all services
  If you intended a long-running app, remove job-mode.

- **`hostname:` is removed from compiled compose**
  Hostnames are stripped at compile time by platform-level routing rules.

- **Variable precedence is deterministic**
  Inline interpolation applies first, then `path`/`paths` rewrites. If both target the same value, path rewrite wins.

- **Source mode is inferred from structure**
  `build:` and `fibe.gg/source_mount` both require `fibe.gg/repo_url`. Missing either fails launch/preview.

## Schema and label-parser errors

### `Service '<n>': unknown label '<key>'`

You wrote a label under `fibe.gg/` that isn't in the whitelist. The 19 supported labels are listed in [reference-fibe-labels](reference-fibe-labels.md).

**Fix:** Remove the unknown label, or rename to a supported one. Non-`fibe.gg/` labels (`traefik.enable: "true"`, `com.example.owner`) pass through.

### `Service '<n>' has a build directive but lacks a fibe.gg/repo_url label`

Compose `build:` requires `fibe.gg/repo_url`.

**Fix:** Add `fibe.gg/repo_url: <repo>` to the service's `labels`. See [recipe-build-to-repo-url](recipe-build-to-repo-url.md).

### `Service '<n>' has source_mount but no repo_url`

`fibe.gg/source_mount` requires `fibe.gg/repo_url`.

**Fix:** Either add `fibe.gg/repo_url`, or remove `fibe.gg/source_mount`. See [recipe-source-mount](recipe-source-mount.md).

### `Service '<n>': zerodowntime services must have 'fibe.gg/port' set`

Zero-downtime requires an exposed HTTP service.

**Fix:** Add `fibe.gg/port: PORT`. Add `fibe.gg/visibility: internal` only for Basic Auth protected routes. See [decide-zero-downtime](decide-zero-downtime.md).

### `Service '<n>': zerodowntime services cannot have 'ports'`

Compose `ports:` is incompatible with rolling updates.

**Fix:** Remove `ports:`. The service is reachable via `fibe.gg/port`. See [recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md).

### `Service '<n>': zerodowntime services cannot have 'container_name'`

Container names must be unique; replicas duplicate them.

**Fix:** Remove `container_name:`. See [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md).

### `Service '<n>': invalid repo_url '<v>' — must be a valid GitHub or Gitea repository URL`

The URL isn't HTTPS / isn't a supported provider.

**Fix:** Use `https://github.com/owner/repo` or your Gitea host. SSH URLs (`git@...`) fail. See [recipe-build-to-repo-url](recipe-build-to-repo-url.md).

### `Service '<n>': invalid exposure visibility '<v>' — must be 'internal' or 'external'`

Only lowercase `internal` or `external`.

**Fix:** Use lowercase `internal` or `external`. `External` fails — case-sensitive. See [recipe-ports-to-expose](recipe-ports-to-expose.md).

### `Service '<n>': invalid exposure port '<v>' — must be a number between 1 and 65535`

Port out of range.

**Fix:** Use a real port number.

### `Service '<n>': invalid subdomain '<v>'`

Subdomain regex: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, or `@`, or empty.

**Fix:** Lowercase, no leading/trailing hyphen, no underscore. See [recipe-add-subdomain](recipe-add-subdomain.md).

### `Service '<n>': invalid path_rule '<v>' — must contain a valid Traefik path matcher`

`path_rule` must contain at least one of `Path(`, `PathPrefix(`, `PathRegexp(`.

**Fix:** Add a path matcher. See [recipe-add-path-rule](recipe-add-path-rule.md).

### `Service '<n>': invalid path_rule '<v>' — must only contain path matchers, not Host/Headers/Method/Query/ClientIP`

Forbidden matchers (Host/HostRegexp/HostSNI/HostSNIRegexp/Headers/HeadersRegexp/Method/Query/ClientIP) appear. Fibe owns Host rules.

**Fix:** Remove the forbidden matchers. See [recipe-add-path-rule](recipe-add-path-rule.md).

### `Service '<n>': invalid healthcheck_interval '<v>' — must be a duration`

Duration must match `^[0-9]+(ms|s|m)$`. Not `h`, not `d`.

**Fix:** Use `30s`, `1m`, `500ms`. Convert larger units (`60s` not `1m` is also valid).

### `Service '<n>': invalid healthcheck_retries '<v>' — must be a positive integer`

Healthcheck retries: `^[1-9][0-9]*$`. Not `0`. Not `-1`.

**Fix:** `"3"`, `"12"`, etc.

### `Service '<n>': invalid <label> value '<v>' — must be true or false`

Boolean labels accept only `true`/`false` (string or YAML bool).

**Fix:** Quote the value: `fibe.gg/zerodowntime: "true"`. Not `yes`/`no`/`on`/`off`/`1`/`0`.

### JSON Schema: unknown property under `x-fibe.gg.variables.X`

A variable definition has a non-standard field. The schema allows `additionalProperties: true`, so this is rare. If you see it, you're probably using a strict validator.

**Fix:** Remove the unknown field, or accept it (pass-through fields like `secret`/`sensitive` are common).

## Template-variables errors

### `Variable '<name>' is referenced but not declared` (`undeclared_var`)

A `$$var__NAME` reference has no matching declaration.

**Fix:** Declare under `x-fibe.gg.variables.<NAME>`, OR remove the reference.

### `Variable '<name>' is declared but never used` (`unused_var`)

The variable has no `path`/`paths` AND no inline reference.

**Fix:** Add a `path:` binding, add an inline `$$var__NAME` use, or remove the declaration.

### `Variable '<name>' must define a display 'name'` (`missing_name`)

The variable has no `name:` field or it's empty.

**Fix:** Add `name: "Display label"`.

### `Variable '<name>' has validation not wrapped in /.../` (`invalid_regex_format`)

Validation must be empty string OR `/.../`-wrapped.

**Fix:** Wrap: `validation: "/^[a-z]+$/"`. Or remove the field.

### `Variable '<name>' regex is invalid: ...` (`invalid_regex`)

Inner regex doesn't parse.

**Fix:** Fix the regex and keep it wrapped in `/.../`.

### `Variable '<name>' is required`

Required variable was not supplied at launch AND has no default AND is not random.

**Fix:** Supply the value, add a `default:`, or add `random: true`.

### `Variable '<name>' fails validation pattern <pattern>`

The supplied value doesn't match the variable's regex.

**Fix:** Either correct the value, loosen the regex, or remove the regex.

## Runtime errors

### `trigger_config.prop_id <N> not found`

The Prop ID doesn't exist or you don't have access.

**Fix:** Verify with `fibe_resource_get(resource: "prop", id: N)`. Re-set the trigger to a valid Prop you own.

### `schedule_config.marquee_id <N> not found`

Same as above but for Marquee.

**Fix:** Verify with `fibe_resource_get(resource: "marquee", id: N)`.

### Trigger doesn't fire

Possible causes:
- `enabled: false` — set to `true`.
- The Prop doesn't have a webhook installed (GitHub app missing / Gitea token missing).
- The event type doesn't match (PR event when you're pushing to the branch).

**Fix:** Inspect Prop webhooks via Fibe MCP; check the event type spelling.

### Scheduled job doesn't fire

Possible causes:
- `enabled: false`.
- Cron expression invalid — schema only checks string type; runtime parses on first fire.
- Marquee is paused/down.

**Fix:** Validate cron with an external tool (https://crontab.guru/); confirm Marquee state.

### Compose `${VAR}` substitution leaves `${VAR}` in output

The launcher didn't set the env var, and Compose left the placeholder.

**Fix:** Use Fibe's `$$var__VAR` form instead, OR ensure the var is provided at launch.

### Job-mode template runs forever

The watched service isn't exiting (started a dev server, sleep loop, etc.).

**Fix:** Use a command that exits when work is done. `fibe.gg/job_watch: "true"` watches exit code.

### Long-running template gets `restart: "no"` and `replicas: 1`

You accidentally set `job_mode: true` on a long-running template. The runtime forces these on job-mode.

**Fix:** Remove `job_mode: true` from `x-fibe.gg.metadata`, and from any root-level mirror if present.

## Compose-level pitfalls

### App returns 502 from public URL but works inside container

Container binds `localhost:PORT`, not `0.0.0.0:PORT`.

**Fix:** App must bind 0.0.0.0. See [decide-exposure-strategy](decide-exposure-strategy.md).

### Vite returns `Invalid Host header`

Vite 6+ rejects unknown hosts.

**Fix:** Set `server.allowedHosts: true` in `vite.config.js`. See [playbook-nodejs-dev](playbook-nodejs-dev.md).

### Healthcheck endpoint returns 200 too early

App accepts the request before DB/cache/external deps are ready. Rolling updates kill old replicas; users see errors.

**Fix:** Tighten the healthcheck (check actual readiness).

### Schema passes but runtime fails

The schema is a first pass. Compile and runtime layers catch additional issues. Always run `fibe_templates_launch` MCP tool with dry-run/preview before relying on a template.

See [reference-validation-pipeline](reference-validation-pipeline.md).

## Related skills

[reference-validation-pipeline](reference-validation-pipeline.md), [templates-publish-checklist](templates-publish-checklist.md), [reference-fibe-labels](reference-fibe-labels.md), [reference-template-variables](reference-template-variables.md), [decide-zero-downtime](decide-zero-downtime.md). Platform skills `fibe-debug`, `fibe-traefik`, `fibe-live-reload` for runtime debugging.
