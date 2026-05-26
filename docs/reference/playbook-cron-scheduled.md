---
title: "Cron Scheduled"
description: "Use to build a Fibe template for a scheduled cron job - daily DB backup, periodic data sync, log cleanup. Combines `metadata.job_mode: true` + `metadata.schedule_config` + watched service."
slug: /reference/playbook-cron-scheduled
sidebar_label: "Cron Scheduled"
image: /img/og/reference-playbook-cron-scheduled.png
keywords: ["Fibe", "Playbook", "playbook", "cron", "scheduled"]
tags: ["reference", "playbook"]
format: md
---

A complete example of a job-mode template with `metadata.schedule_config`. Use as a starting point for any "run this on a schedule" need.

## Example: nightly Postgres → S3 backup

```yaml
services:
  backup:
    image: postgres:17-alpine
    environment:
      PGHOST: $$var__PG_HOST
      PGUSER: $$var__PG_USER
      PGPASSWORD: $$var__PG_PASS
      PGDATABASE: $$var__PG_DB
      AWS_ACCESS_KEY_ID: $$var__AWS_KEY_ID
      AWS_SECRET_ACCESS_KEY: $$var__AWS_SECRET
      AWS_DEFAULT_REGION: $$var__AWS_REGION
      S3_BUCKET: $$var__S3_BUCKET
    command:
      - /bin/bash
      - -ec
      - |
        # install aws cli (alpine image; do it inline to keep template small)
        apk add --no-cache aws-cli ca-certificates
        TS=$$(date -u +%Y%m%dT%H%M%SZ)
        FILE="/tmp/${PGDATABASE}-${TS}.sql.gz"
        echo "Dumping $$PGDATABASE..."
        pg_dump --no-owner --no-privileges | gzip -c > "$$FILE"
        echo "Uploading to s3://$$S3_BUCKET/..."
        aws s3 cp "$$FILE" "s3://$$S3_BUCKET/$(basename "$$FILE")"
        echo "Done."
    restart: "no"
    labels:
      fibe.gg/job_watch: "true"

x-fibe.gg:
  metadata:
    description: "Nightly Postgres backup to S3"
    category: "Operations"
    job_mode: true
    schedule_config:
      enabled: true
      cron: "0 3 * * *"        # 03:00 UTC daily
      marquee_id: 1
  variables:
    PG_HOST:
      name: "Postgres host (production DB endpoint)"
      required: true
    PG_USER:
      name: "Postgres user"
      required: true
      default: "backup_role"
    PG_PASS:
      name: "Postgres password"
      required: true
      secret: true
      sensitive: true
    PG_DB:
      name: "Postgres database"
      required: true
    AWS_KEY_ID:
      name: "AWS access key ID"
      required: true
      secret: true
    AWS_SECRET:
      name: "AWS secret access key"
      required: true
      secret: true
      sensitive: true
    AWS_REGION:
      name: "AWS region"
      required: true
      default: "us-east-1"
    S3_BUCKET:
      name: "S3 bucket name"
      required: true
```

## What this does

- Every day at 03:00 UTC, Fibe creates a new Playground from this template on Marquee `1`.
- The `backup` container starts. It dumps Postgres, gzips, uploads to S3.
- `fibe.gg/job_watch: "true"` says: "watch this service's exit code". Exit 0 → success. Exit non-zero → failure.
- After the container exits, Fibe tears down the Playground.
- The run result is logged for inspection via `fibe_resource_list(resource: "trick", ...)`.

## Why this is the right shape

| Decision | Reason |
|---|---|
| No `fibe.gg/port` | Job-mode forbids exposed services |
| `fibe.gg/job_watch: "true"` | One watched service decides success/failure |
| `restart: "no"` | Required behavior; runtime forces it anyway |
| `command:` inline shell | Self-contained — no Dockerfile build needed |
| `$$var__NAME` for secrets | Generated via launcher, masked with `secret: true` |
| Cron in UTC | Default; if the org needs local time, document explicitly |

## Variant: cleanup old data

```yaml
services:
  cleanup:
    image: alpine:3
    command:
      - /bin/sh
      - -ec
      - |
        apk add --no-cache curl
        echo "Calling cleanup endpoint..."
        curl -fSL -X POST -H "Authorization: Bearer $$API_TOKEN" \
          "https://api.example.com/internal/cleanup-old?days=30"
    environment:
      API_TOKEN: $$var__API_TOKEN
    labels:
      fibe.gg/job_watch: "true"
    restart: "no"

x-fibe.gg:
  variables:
    API_TOKEN:
      name: "API token"
      required: true
      secret: true
      sensitive: true
  metadata:
    description: "Weekly cleanup — calls internal endpoint to purge data older than 30 days"
    category: "Operations"
    job_mode: true
    schedule_config:
      enabled: true
      cron: "0 4 * * 0"        # weekly, Sunday 04:00 UTC
      marquee_id: 1
```

## Variant: fan-out across props

If you want the same scheduled job to run for several Props (e.g. backups across multiple Player DBs), create one template per Prop, each with its own `schedule_config.marquee_id` and Prop-specific variables. There is no "for each Prop" in `schedule_config` — schedule fires one job at a time.

## Cron expressions cheat sheet

```
0 3 * * *        ← 03:00 daily
*/15 * * * *     ← every 15 minutes
0 */2 * * *      ← every 2 hours
0 9 * * 1-5      ← 09:00 Monday–Friday
0 0 1 * *        ← midnight, first of month
0 0 * * 0        ← midnight Sunday
```

5 fields: `min hour day-of-month month day-of-week`. Standard POSIX cron syntax. Test with an external tool like https://crontab.guru/ before deploying.

## Running on demand (one-off manual)

`fibe_resource_mutate(resource: "trick", operation: "trigger", payload: { template_id: ... })` to fire the same template outside the schedule. Useful for testing.

To re-run the last fire: `fibe_resource_mutate(resource: "trick", operation: "rerun", payload: { trick_id: ... })`.

## Inspecting results

`fibe_resource_list(resource: "trick", params: { template_id: ... })` shows recent runs. Each has status, started/finished timestamps, exit code, log location.

## Pitfalls

- **Missing `job_watch`** — without a watched service the run is "always succeeding" or undefined. Always set on the service whose exit defines outcome.
- **Bash with single `$VAR`** — Compose substitutes `$VAR` from its env, leaving an empty string if not set. Use `$$VAR` to escape and get a literal `$VAR` for the shell to expand.
- **Fibe template `$$var__NAME`** vs **shell `$$VAR`** — easy to confuse. `$$var__NAME` is substituted by Fibe at compile time; `$$VAR` is `$VAR` to the shell at runtime.
- **Job exceeding the next cron interval** — runs overlap. Make the cron sparse enough or gate with a flock/distributed lock.
- **Cron in wrong timezone** — schedule is UTC by default. If the team thinks in local time, document or convert.
- **Missing AWS config / IAM creds** — silent S3 upload failure. Log diagnostics in the script.

## Related skills

[mode-job-trick](mode-job-trick.md), [mode-schedule-cron](mode-schedule-cron.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [decide-secrets-and-randoms](decide-secrets-and-randoms.md), [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md).
