---
name: playbook-test-runner
description: Use to build a Fibe template that runs a project's test suite on every git push or PR - job-mode + metadata.trigger_config + watched service running pytest/npm test/rspec/etc.
---

# Playbook: CI test runner on git push / PR

A complete worked example combining job-mode + `metadata.trigger_config` + source-mounted watched service. Use as a starting point for any "run tests on every push" CI need.

## Example: Node test runner

```yaml
services:
  test:
    image: node:22
    working_dir: /app
    volumes:
      - app_node_modules:/app/node_modules
    environment:
      NODE_ENV: test
      DATABASE_URL: "postgres://test:test@db:5432/test"
    depends_on:
      db:
        condition: service_healthy
    labels:
      fibe.gg/repo_url: $$var__REPO_URL
      fibe.gg/branch: $$var__BRANCH
      fibe.gg/source_mount: /app
      fibe.gg/start_command: sh -c "npm ci && npm test"
      fibe.gg/job_watch: "true"
      fibe.gg/production: "false"

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  app_node_modules:

x-fibe.gg:
  metadata:
    description: "Run npm test on every push"
    category: "CI"
    source_defaults: true
    job_mode: true
    trigger_config:
      enabled: true
      event_type: push
      repo_url: $$var__REPO_URL
      branch: $$var__BRANCH
      prop_id: 1
      marquee_id: 1
  variables:
    REPO_URL:
      name: "Repository URL"
      required: true
    BRANCH:
      name: "Branch (or '*' for all — must be a specific branch in trigger_config)"
      required: true
      default: "main"
```

## Test command per framework

| Framework | `fibe.gg/start_command` |
|---|---|
| Node (npm) | `sh -c "npm ci && npm test"` |
| Node (yarn) | `sh -c "yarn install --frozen-lockfile && yarn test"` |
| Node (pnpm) | `sh -c "pnpm install --frozen-lockfile && pnpm test"` |
| Python (pip) | `sh -c "pip install -r requirements-test.txt && pytest"` |
| Python (poetry) | `sh -c "poetry install --with test && poetry run pytest"` |
| Ruby (bundle) | `sh -c "bundle install && bundle exec rspec"` |
| Go | `sh -c "go mod download && go test ./..."` |
| Rust (cargo) | `cargo test --locked` |
| Java (gradle) | `./gradlew test` |
| Java (maven) | `mvn -B test` |
| PHP (composer) | `sh -c "composer install --no-interaction && vendor/bin/phpunit"` |

For long test suites, split into multiple watched services running in parallel — each declares `fibe.gg/job_watch: "true"` on a different scope of tests.

## Setting commit status back to the VCS

Fibe can post the run result back to GitHub/Gitea as a commit status check, IF the Prop has a configured VCS integration. This is automatic for triggered jobs — no extra config in the template.

## Caching `node_modules` / `pip` / Gemfile etc.

```yaml
services:
  test:
    volumes:
      - app_node_modules:/app/node_modules
      - npm_cache:/root/.npm
```

The named volumes persist between runs across the lifetime of the Playspec on this Marquee. Tests run faster after the first invocation.

For Rust, cache `~/.cargo/registry` and `target/`:

```yaml
volumes:
  - cargo_registry:/root/.cargo/registry
  - rust_target:/app/target
```

## Multi-watch parallel suites

If the test suite is partitionable:

```yaml
services:
  test-unit:
    # ... unit tests config ...
    command: npm run test:unit
    labels:
      fibe.gg/job_watch: "true"

  test-integration:
    # ... integration tests config ...
    command: npm run test:integration
    labels:
      fibe.gg/job_watch: "true"
```

Both must exit 0 for the run to pass. Both run in parallel.

## PR event vs push event

For PR triggers:

```yaml
trigger_config:
  enabled: true
  event_type: pull_request
  branch: main           # the BASE branch — fires when a PR targets main
  prop_id: 1
  marquee_id: 1
```

The container clones the PR's HEAD ref, not `main`. Tests run against the proposed changes.

For push triggers:

```yaml
trigger_config:
  event_type: push
  branch: main           # the BRANCH — fires when commits are pushed to main
```

Container clones `main` (the latest state).

## With `source_defaults: true`

If you want one template to work across many repos without per-repo edits:

```yaml
x-fibe.gg:
  metadata:
    source_defaults: true
    job_mode: true
    trigger_config:
      enabled: true
      event_type: pull_request
      # repo_url and branch auto-filled from source Prop
      prop_id: 1
      marquee_id: 1
```

When this template is imported through a source-backed Prop, the runtime fills the trigger's `repo_url`/`branch` from the Prop. Publishable as a generic "PR test runner" template in Pantry.

## Pitfalls

- **`source_mount` + `production: "false"` not working** — confirm Dockerfile exists in the repo. The dev mode still relies on an image to provide the runtime (`node:22`, `python:3.12`); the Dockerfile is built but not directly used in source-mount mode.
- **`npm ci` failing because package-lock.json mismatch** — pin the lockfile in the repo. Always include `package-lock.json` in CI tests.
- **Database fixtures not loading** — separate `migrate` service that runs before `test`:
  ```yaml
  migrate:
    image: my-app
    command: npm run migrate
    depends_on:
      db:
        condition: service_healthy

  test:
    depends_on:
      migrate:
        condition: service_completed_successfully
  ```
- **Tests that need an HTTP service** — start it as an unwatched service, point the watched test service at it. Don't expose ports externally.
- **Long-running flake-prone tests timing out** — Fibe doesn't impose a tight timeout (Playground-level limit applies). If the test runner hangs, it stays hung. Add a wrapper script with `timeout` to enforce an upper bound.

## Related skills

[mode-trigger-vcs](mode-trigger-vcs.md), [mode-job-trick](mode-job-trick.md), [recipe-source-mount](recipe-source-mount.md), [recipe-depends-on](recipe-depends-on.md), [decide-job-mode](decide-job-mode.md), [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md).
