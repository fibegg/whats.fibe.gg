---
title: "Job Mode"
description: "Use to decide whether a template should be a long-running HTTP service, a one-shot job (Trick) with `job_watch`, a scheduled job via `schedule_config`, or a VCS-triggered job via `trigger_config`."
slug: /reference/decide-job-mode
sidebar_label: "Job Mode"
image: /img/og/reference-decide-job-mode.png
keywords: ["Fibe", "Decision", "decide", "job", "mode"]
tags: ["reference", "decision"]
format: md
---

A Fibe template runs in one of four execution shapes. Pick first; everything else follows.

## The four shapes

| Shape | Marker | Lifecycle |
|---|---|---|
| Long-running HTTP | (nothing — default) | Stays up; serves requests; healthchecks monitor. |
| Job-mode (Trick) | `x-fibe.gg.metadata.job_mode: true` + `fibe.gg/job_watch: "true"` on at least one service | Starts, runs, all watched services exit, tear down. |
| Scheduled job | Job-mode + `x-fibe.gg.metadata.schedule_config` | Cron-driven launch of a job-mode template. |
| Triggered job | Job-mode + `x-fibe.gg.metadata.trigger_config` | VCS event-driven launch (push, pull_request). |

You can combine schedule + trigger on one template — Fibe will launch on either.

## Choosing

```
input intent
├─ "deploy a web app"
│  └─ long-running, with fibe.gg/port
│
├─ "run a one-off task that exits"
│  └─ job-mode (Trick), with fibe.gg/job_watch
│
├─ "run a one-off task every N minutes/hours/days"
│  └─ job-mode + schedule_config (cron)
│
└─ "run tests / CI when someone pushes to a repo"
   └─ job-mode + metadata.trigger_config (push or pull_request)
```

## Long-running HTTP (the default)

Don't add anything special. The presence of `fibe.gg/port` is enough. Examples: Rails web app, WordPress, Wiki.js, nginx, Flask, FastAPI. See [convert-compose-to-fibe](convert-compose-to-fibe.md) for the standard flow.

## Job-mode

Add **both**:

1. `x-fibe.gg.metadata.job_mode: true`.
2. `fibe.gg/job_watch: "true"` label on the service whose exit decides success/failure.

```yaml
services:
  test:
    image: node:22
    working_dir: /app
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/source_mount: /app
      fibe.gg/start_command: npm test
      fibe.gg/job_watch: "true"
      fibe.gg/production: "false"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
x-fibe.gg:
  metadata:
    description: "Run npm test against the repo"
    category: "CI"
    job_mode: true
```

Job-mode constraints (runtime-enforced):

- **No `fibe.gg/port`** anywhere — job services are not user-facing.
- Watched services must **exit** (not run a dev server / sleep loop).
- Unwatched services (DB, queue, cache) just need to start; they get torn down when all watched services finish.
- Fibe **forces** `restart: "no"` and `deploy.replicas: 1` on every service in a job-mode template.
- Fibe uses service labels to prepare the run; the job itself should behave like ordinary Compose services once started.

See [mode-job-trick](mode-job-trick.md).

## Scheduled (cron)

Add `schedule_config` under `x-fibe.gg.metadata`:

```yaml
x-fibe.gg:
  metadata:
    description: "Nightly cleanup job"
    category: "Operations"
    job_mode: true
    schedule_config:
      enabled: true
      cron: "0 3 * * *"      # daily at 3:00 UTC
      marquee_id: 1          # required, positive integer or its string form
```

Cron is the 5-field POSIX form. `marquee_id` must be a Marquee the Player owns. Fibe resolves the ID at scheduling time.

See [mode-schedule-cron](mode-schedule-cron.md).

## Triggered (VCS events)

Add `trigger_config`:

```yaml
x-fibe.gg:
  metadata:
    description: "Run tests on every push to main"
    category: "CI"
    source_defaults: true
    job_mode: true
    trigger_config:
      enabled: true
      event_type: push                              # or "pull_request"
      repo_url: https://github.com/owner/repo
      branch: main
      prop_id: 1                                    # the Prop that wires the source
      marquee_id: 1
```

`event_type` is enum: `push` or `pull_request`. `source_defaults: true` on the metadata tells Fibe to auto-fill `repo_url`/`branch` from the source Prop when imported via a source-backed mechanism.

See [mode-trigger-vcs](mode-trigger-vcs.md).

## Compatibility matrix

| Template shape | Can have `fibe.gg/port`? | Must have `job_watch` somewhere? | `restart` honored? | Replicas honored? |
|---|---|---|---|---|
| Long-running HTTP | yes | no | yes | yes |
| Job-mode | no | yes | forced to `no` | forced to `1` |
| Scheduled | no | yes | forced to `no` | forced to `1` |
| Triggered | no | yes | forced to `no` | forced to `1` |

## Pitfalls

- "I want a scheduled HTTP service" — Fibe does not do this. Long-running services serve continuously; if you want periodic work behind an HTTP endpoint, use a long-running service that runs a job internally (cron in-app), OR run a job-mode template alongside.
- "I want a triggered HTTP preview environment" — use `fibe_resource_mutate(resource: "playground", operation: "create")` from a webhook, not the template's `trigger_config`. Trigger config only fires the job-mode template, not arbitrary long-running ones.
- Forgetting `metadata.job_mode: true` — services with `job_watch` may still not enter job lifecycle. Set both metadata job mode and a watched service label.

## Related skills

[mode-job-trick](mode-job-trick.md), [mode-schedule-cron](mode-schedule-cron.md), [mode-trigger-vcs](mode-trigger-vcs.md), [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md), [playbook-test-runner](playbook-test-runner.md), [playbook-cron-scheduled](playbook-cron-scheduled.md).
