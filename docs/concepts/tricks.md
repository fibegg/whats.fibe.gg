---
title: Tricks
description: A Trick runs a task and finishes — tests, migrations, backups, scheduled jobs, CI on push. Plain Compose, with Fibe enforcing one-shot rules.
slug: /concepts/tricks
sidebar_position: 8
image: /img/og/concepts-tricks.png
keywords: [Trick, job mode, scheduled job, cron, VCS trigger, CI, Job ENV, watched service]
---

A **Trick** runs a task and finishes. Same shape as a Playground (Compose, services, logs, terminal) but Fibe treats it as one-shot: one replica per service, no restart on exit, exit code of the watched service decides success.

Use Tricks for **work that should finish**: tests, migrations, backups, scheduled jobs, CI.

## Good for

- Test suites, lint checks.
- Migrations, schema setup.
- Backups, exports.
- Data syncs, cleanups, doc builds.
- Cron jobs.
- CI on push or PR.

## Not for

- Web apps that stay reachable.
- Background workers that loop.
- Hot-reload dev servers.
- Anything that watches and never exits.

If the task should finish → Trick. If it should stay up → [Playground](/concepts/playgrounds/).

## How a Trick decides success

Mark one service as the **watched service** with `fibe.gg/job_watch: "true"`. Its exit defines the result. Zero = success. Non-zero = failure.

Supporting services (databases, caches, queues) start alongside. When the watched service exits, Fibe stops them.

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: $$var__DB_PASSWORD
  test:
    image: node:20
    working_dir: /app
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/source_mount: /app
      fibe.gg/start_command: npm test
      fibe.gg/job_watch: "true"   # ← Trick succeeds/fails based on this
    depends_on:
      db:
        condition: service_healthy

x-fibe.gg:
  metadata:
    job_mode: true                # ← marks the template as a Trick
    description: "Run the test suite against Postgres"
    category: "CI"
```

## What Fibe Applies

Fibe applies one-shot rules. You don't write these:

- Every service set to **one replica**.
- Every service set to `restart: no`.
- Fibe labels stripped from the final compose at compile time.
- `fibe.gg/port` is forbidden — a Trick isn't there to serve traffic.

What you write:

- A service that **actually exits** when done. No idle loops, no `sleep infinity`.
- The watched-service marker on the one whose exit decides the outcome.

## Plain Compose locally

A Trick is a Docker Compose file with Fibe additions on top. `docker compose up` runs the same file locally for debugging. The only Fibe-specific piece is the watched-service marker.

## Schedules & triggers

| Mode | Settings | Use for |
| --- | --- | --- |
| **Manual** | (none) | Click to run. |
| **Scheduled** | `schedule_config` — cron expression + target Marquee. | Daily backups, hourly syncs, weekly reports. |
| **Triggered** | `trigger_config` — event (`push` or `pull_request`), repo, branch, Prop. | CI on every push, PR test runs. |

Combine both. A Trick can be scheduled and triggered — each event fires its own run.

See [Authoring → Execution modes](/authoring/execution-modes/), [`mode-schedule-cron`](/reference/mode-schedule-cron/), [`mode-trigger-vcs`](/reference/mode-trigger-vcs/).

## Job ENV — credentials for Trick runs

Tricks often need credentials the launcher shouldn't supply each time — deploy tokens, API keys, backup passwords.

Store them as **Job ENV entries**. Two scopes:

- **Global Job ENV** — available to every Trick.
- **Prop-scoped Job ENV** — applies only when the Trick is tied to that repository.

Prefer Job ENV over template variables when a credential is reused across many runs. See [Security → Secret Vault & Job ENV](/advanced/secrets/).

## Example: nightly backup

Scheduled Trick that dumps a database at 03:00 UTC:

```yaml
services:
  backup:
    image: my-org/backup-tool:1.4
    environment:
      DB_URL: $$var__DB_URL
      S3_BUCKET: backups.example.com
      AWS_ACCESS_KEY_ID: $$var__AWS_KEY      # Job ENV
      AWS_SECRET_ACCESS_KEY: $$var__AWS_SECRET # Job ENV
    command: ["./backup-now.sh"]
    labels:
      fibe.gg/job_watch: "true"

x-fibe.gg:
  variables:
    DB_URL: {name: "Database URL", required: true}
    AWS_KEY: {name: "AWS key", required: true, secret: true}
    AWS_SECRET: {name: "AWS secret", required: true, secret: true}
  metadata:
    job_mode: true
    description: "Nightly database backup to S3"
    category: "Operations"
    schedule_config:
      enabled: true
      cron: "0 3 * * *"
      marquee_id: 1
```

`AWS_KEY` and `AWS_SECRET` come from Job ENV at launch time.

## FAQ

<details>
<summary>Trick takes longer than its schedule period?</summary>

Overlapping runs result. Make the period longer than the max job time, or guard with a lock inside the job, or use a single-replica external queue. Fibe doesn't deduplicate scheduled runs.
</details>

<details>
<summary>Multiple branches on one Trick?</summary>

No wildcards. One Trick per branch. Explicit configuration is clearer than wildcard surprises.
</details>

<details>
<summary>`push` vs `pull_request`?</summary>

- **push** — fires when the named branch receives a commit.
- **pull_request** — fires when a PR is opened or updated targeting the branch. Code under test is the PR head.
</details>

<details>
<summary>Genie to debug a Trick?</summary>

Yes. Open a Genie chat against the Trick's logs. The Trick itself runs on its own — a Genie isn't part of the watched service.
</details>

## Related

- [Playgrounds](/concepts/playgrounds/) — long-running counterpart.
- [Authoring → Execution modes](/authoring/execution-modes/).
- [Security → Secret Vault & Job ENV](/advanced/secrets/).
- Reference: [`mode-job-trick`](/reference/mode-job-trick/), [`mode-schedule-cron`](/reference/mode-schedule-cron/), [`mode-trigger-vcs`](/reference/mode-trigger-vcs/), [`playbook-test-runner`](/reference/playbook-test-runner/), [`playbook-cron-scheduled`](/reference/playbook-cron-scheduled/).
