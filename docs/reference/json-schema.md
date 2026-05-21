---
title: JSON Schema
description: The official JSON Schema for Fibe Compose templates — fibe.gg/* labels, x-fibe.gg namespace, variables, metadata. Use it for editor autocomplete and CI validation.
slug: /reference/json-schema
sidebar_label: JSON Schema
sidebar_position: 99
image: /img/og/reference-json-schema.png
keywords: [JSON Schema, fibe.gg, validation, autocomplete, VSCode, IntelliJ, YAML, schema, compose template]
format: md
---

A machine-readable schema describes everything Fibe expects in a Compose template — every `fibe.gg/*` label, the `x-fibe.gg` namespace, template variables, scheduling, triggers. Point your editor at it for autocomplete and on-the-fly validation, or run it through any JSON-Schema validator in CI to gate your templates before launch.

## Where it lives

The same file is published in two places:

| Use | URL |
| --- | --- |
| Canonical (versioned) | [fibe.gg/schemas/fibe-compose.v1.schema.json](https://fibe.gg/schemas/fibe-compose.v1.schema.json) |
| Convenience alias on fibe.gg | [fibe.gg/schema.json](https://fibe.gg/schema.json) |
| Mirror on this docs site | [whats.fibe.gg/schemas/fibe-compose.v1.schema.json](https://whats.fibe.gg/schemas/fibe-compose.v1.schema.json) |
| Mirror alias on this docs site | [whats.fibe.gg/schema.json](https://whats.fibe.gg/schema.json) |

Prefer the **canonical** URL in production setups so you get whatever the live platform validates against. The mirror is here for environments where reaching `fibe.gg` is blocked or slower.

The schema's `$id` is the canonical URL. Versioned URLs (`/schemas/fibe-compose.v1...`) will keep working when newer versions land at `/schemas/fibe-compose.v2...`.

## How to use it

### VS Code

Install the [YAML extension by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), then add the schema mapping in `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "https://fibe.gg/schemas/fibe-compose.v1.schema.json": [
      "docker-compose*.yml",
      "docker-compose*.yaml",
      "compose.yml",
      "compose.yaml"
    ]
  }
}
```

Now hovering over a `fibe.gg/...` label shows its description, allowed values, and an example. Invalid values get a red squiggle.

### JetBrains IDEs (IntelliJ, RubyMine, PyCharm…)

Open **Settings → Languages & Frameworks → Schemas and DTDs → JSON Schema Mappings**, click **+**, paste the URL `https://fibe.gg/schemas/fibe-compose.v1.schema.json`, and pin it to the file patterns for your Compose files.

### Inline reference inside the file

You can also embed the schema URL with a `# yaml-language-server:` directive on the first line of the Compose file. Most YAML language servers respect it:

```yaml
# yaml-language-server: $schema=https://fibe.gg/schemas/fibe-compose.v1.schema.json
services:
  web:
    image: nginx:alpine
    labels:
      fibe.gg/expose: external:80
```

### In CI / scripts

Any JSON-Schema validator works. With [`ajv`](https://ajv.js.org/) from Node:

```sh
npx -p ajv-cli ajv validate \
  -s "https://fibe.gg/schemas/fibe-compose.v1.schema.json" \
  -d "docker-compose.yml" \
  --strict=false
```

Or with [`check-jsonschema`](https://github.com/python-jsonschema/check-jsonschema) from Python:

```sh
pipx run check-jsonschema --schemafile \
  "https://fibe.gg/schemas/fibe-compose.v1.schema.json" \
  docker-compose.yml
```

CI failure on schema-invalid input is a cheap way to catch problems before the platform sees them.

## What the schema covers

### Services

The template is a Docker Compose file. The schema validates that:

- The root has a `services:` map.
- Each service may carry `labels:` — either as an object (`{key: value}`) or an array (`["key=value"]`). Both forms are accepted; the schema validates the **fibe.gg/** subset in either shape.
- Any property not under `fibe.gg/` passes through untouched.

### `fibe.gg/*` labels

Eighteen labels are recognized. The table below summarizes each one — for the full prose explanation, see [Service labels](/authoring/service-labels/) and the [`reference-fibe-labels`](/reference/reference-fibe-labels/) skill.

| Label | Value shape | Required when | Example |
| --- | --- | --- | --- |
| `fibe.gg/repo_url` | HTTPS Git URL or `$$var__NAME` | service is dynamic (`build:`, `source_mount`, or source-backed) | `https://github.com/user/repo` |
| `fibe.gg/branch` | string | dynamic services (pin to non-default branch) | `main` |
| `fibe.gg/dockerfile` | path | dynamic services with `build:` | `./deploy/Dockerfile` |
| `fibe.gg/source_mount` | container path | live-source-mount services | `/app` |
| `fibe.gg/start_command` | string | when overriding the image's default | `bundle exec rails s` |
| `fibe.gg/env_file` | path inside Prop | when env values come from a non-default example | `env.example` |
| `fibe.gg/build_target` | string | multi-stage build | `production` |
| `fibe.gg/build_args` | `KEY=value` comma-list | when `--build-arg` values are needed | `KEY=val,K2=v2` |
| `fibe.gg/production` | `true` / `false` | distinguish built image vs source-mounted dev | `true` |
| `fibe.gg/expose` | `external:PORT`, `internal:PORT`, or bare port (1–65535) | the service should have a URL | `external:3000` |
| `fibe.gg/subdomain` | `@`, lowercase alnum+hyphen, or empty | overriding the default (service-name) subdomain | `api` |
| `fibe.gg/path_rule` | Traefik `Path` / `PathPrefix` / `PathRegexp` matcher | sharing one subdomain across services | `PathPrefix(\`/api\`)` |
| `fibe.gg/zerodowntime` | `true` / `false` | rolling updates wanted | `true` |
| `fibe.gg/healthcheck_path` | HTTP path starting `/` | `zerodowntime: true` | `/up` |
| `fibe.gg/healthcheck_interval` | duration (`Nms` / `Ns` / `Nm`) | `zerodowntime: true` | `10s` |
| `fibe.gg/healthcheck_timeout` | duration | `zerodowntime: true` | `5s` |
| `fibe.gg/healthcheck_retries` | positive integer | `zerodowntime: true` | `3` |
| `fibe.gg/healthcheck_start_period` | duration | `zerodowntime: true` | `30s` |
| `fibe.gg/job_watch` | `true` / `false` | the service whose exit decides a Trick's result | `true` |

:::tip Boolean values must be strings
Use quoted `"true"` / `"false"`, not `yes` / `no` / `1` / `0`. The schema rejects the unquoted forms.
:::

### `x-fibe.gg` namespace

The optional root block describing the template:

```yaml
x-fibe.gg:
  variables: { ... }          # launch-time inputs
  metadata:
    description: "..."        # what this template launches
    category: "..."           # broad, discoverable category
    source_defaults: true     # auto-fill repo/branch on import
    job_mode: true|false      # mark this template as a Trick
    schedule_config: { ... }  # cron-driven launches
    trigger_config: { ... }   # VCS-triggered launches
```

The schema accepts execution settings (`job_mode`, `schedule_config`, `trigger_config`) at both the root of `x-fibe.gg` and under `x-fibe.gg.metadata`. Current launch/import behavior reads them from `metadata` — keep them there.

### Template variables

Each entry under `x-fibe.gg.variables` is a small object:

```yaml
variables:
  SUBDOMAIN:
    name: "Subdomain"
    required: true
    random: false
    default: "demo"
    validation: "/^[a-z]+$/"
    path: services.web.labels.fibe.gg/subdomain
    paths:
      - services.web.environment.SUB
      - services.worker.environment.SUB
```

- Variable keys match `^[A-Za-z0-9_]+$`.
- `default` may be string / number / boolean / null.
- `validation` is either empty or a `/regex/`-wrapped pattern.
- `path` / `paths` must match the YAML-path grammar in the schema (`^[A-Za-z0-9_./\[\]-]+$`).

See [Launch variables](/authoring/variables/) for the full authoring guide.

### Scheduling and triggers

```yaml
schedule_config:
  enabled: true
  cron: "0 * * * *"
  marquee_id: 1
```

```yaml
trigger_config:
  enabled: true
  event_type: push          # or "pull_request"
  repo_url: "https://github.com/owner/repo"
  branch: "main"
  prop_id: 1
  marquee_id: 1
```

`marquee_id` and `prop_id` accept either a positive integer or its string form.

## The full schema

<details>
<summary>Click to expand the JSON</summary>

```bash
# Fetch the canonical:
curl -L https://fibe.gg/schemas/fibe-compose.v1.schema.json -o fibe-compose.v1.schema.json

# Or this mirror:
curl -L https://whats.fibe.gg/schemas/fibe-compose.v1.schema.json -o fibe-compose.v1.schema.json
```

For an inline copy, see [the mirrored file on this site](https://whats.fibe.gg/schemas/fibe-compose.v1.schema.json). It uses [JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12/release-notes).

</details>

## What the schema does *not* cover

A few rules are enforced by Fibe at compile/runtime but live outside the JSON Schema:

- **Required-when cross-label rules.** Example: a Compose `build:` block requires `fibe.gg/repo_url`. The schema describes individual labels but not their interdependencies.
- **Reachability of resources.** `marquee_id: 1` is valid JSON-Schema-wise but fails at runtime if you don't own Marquee 1.
- **Variable usage.** Declared-but-never-used or referenced-but-never-declared variables are flagged by the validator after schema check, not by the schema itself.
- **Job-mode constraints.** When `metadata.job_mode: true`, the runtime forces `restart: "no"` and `replicas: 1`, and forbids `expose:` — those are runtime enforcements, not schema constraints.

For the full validation pipeline (schema → cross-label → compile → runtime), see [`reference-validation-pipeline`](/reference/reference-validation-pipeline/).

## Related

- [Service labels](/authoring/service-labels/) — every `fibe.gg/*` label in prose form.
- [Settings block](/authoring/settings-block/) — the `x-fibe.gg` namespace.
- [Launch variables](/authoring/variables/) — variable shape and binding.
- Reference skills: [`reference-fibe-labels`](/reference/reference-fibe-labels/), [`reference-x-fibe-gg-namespace`](/reference/reference-x-fibe-gg-namespace/), [`reference-template-variables`](/reference/reference-template-variables/), [`reference-yaml-paths`](/reference/reference-yaml-paths/), [`reference-validation-pipeline`](/reference/reference-validation-pipeline/).
