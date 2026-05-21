---
title: Execution modes
description: A template runs in one of four shapes — long-running HTTP, Trick, scheduled Trick, triggered Trick. Decide first; everything else follows.
slug: /authoring/execution-modes
sidebar_position: 8
image: /img/og/authoring-execution-modes.png
keywords: [execution modes, job_mode, schedule, trigger, cron, push, pull_request]
---

A template runs in one of four shapes. Decide first; everything else follows.

## Long-running HTTP

The default. Just expose your services with `fibe.gg/expose` and they stay up until you stop them. No special settings needed.

## Trick (one-shot)

Required pieces:

- `x-fibe.gg.metadata.job_mode: true`
- `fibe.gg/job_watch: "true"` on at least one service.

Trick rules Fibe enforces for you:

- No service may be exposed — a Trick isn't there to serve traffic.
- Every service is forced to one replica and not to restart.
- Watched services must actually exit (don't run a dev server or sleep loop).
- The Trick succeeds when every watched service exits with status zero; non-zero on any watched service fails the run.

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

x-fibe.gg:
  metadata:
    description: "Run npm test against the repo"
    category: "CI"
    job_mode: true
```

## Scheduled (cron)

A Trick that fires on a recurring schedule. Add `schedule_config` with `enabled`, a 5-field cron expression, and the target Marquee.

| Cron | Meaning |
| --- | --- |
| `0 3 * * *` | daily at 03:00 |
| `*/5 * * * *` | every 5 minutes |
| `0 */2 * * *` | every 2 hours |
| `0 0 1 * *` | first of every month at midnight |
| `30 6 * * 1-5` | 06:30, Mon–Fri |

:::caution Overlap
If your job can run longer than its period, you'll get overlapping runs. Make the period longer than the maximum job time, or guard with a lock inside the job.
:::

```yaml
x-fibe.gg:
  metadata:
    job_mode: true
    description: "Nightly backup to S3"
    category: "Operations"
    schedule_config:
      enabled: true
      cron: "0 3 * * *"
      marquee_id: 1
```

## Triggered (push or pull request)

A Trick that fires on a Git event. Add `trigger_config` with the event type (`push` or `pull_request`), the repo URL, branch, the Prop the source is connected through, and the target Marquee.

- **push** fires when the named branch itself receives a commit.
- **pull_request** fires when a PR is opened or updated targeting the branch; the code under test is the PR head branch.
- Wildcards across many branches aren't supported — make a template per shape.

```yaml
x-fibe.gg:
  metadata:
    job_mode: true
    description: "Run tests on every push to main"
    category: "CI"
    trigger_config:
      enabled: true
      event_type: push
      repo_url: https://github.com/owner/repo
      branch: main
      prop_id: 1
      marquee_id: 1
```

## You can combine schedules and triggers

A Trick can be both scheduled (run every night) and triggered (run on every push). Each event fires its own run.

## Related

- [Tricks & automated jobs](/concepts/tricks/) — the concept page.
- Reference: [`mode-job-trick`](/reference/mode-job-trick/), [`mode-schedule-cron`](/reference/mode-schedule-cron/), [`mode-trigger-vcs`](/reference/mode-trigger-vcs/), [`decide-job-mode`](/reference/decide-job-mode/).
