---
title: Decision guides
description: Short answers to the questions you'll ask while authoring — static or dynamic, exposed how, rolling updates or not, where does the credential go.
slug: /authoring/decisions
sidebar_position: 7
image: /img/og/authoring-decisions.png
keywords: [decisions, static vs dynamic, exposure, zero-downtime, credentials, job mode]
---

Short answers to the questions you'll ask while authoring.

## Static or dynamic?

A service is **dynamic** if it has a repository URL — either through a Compose `build:` block or the `fibe.gg/repo_url` label. Otherwise it's **static**.

**Choose static when:**

- You consume a published image like `postgres:17`, `redis:8`, or `nginx:alpine`.
- The service is configured through environment variables and volumes.
- The image already contains the runtime command.

**Choose dynamic when:**

- Your app's code lives in a repository and Fibe should clone, build, or live-mount it.
- You want hot-reload by mounting the working tree.
- You want the template to work cleanly across branches.

See [`decide-static-vs-dynamic`](/reference/decide-static-vs-dynamic/).

## How should it be reachable?

| Service | Reachable? |
| --- | --- |
| Public web app | `fibe.gg/visibility: external` with `fibe.gg/port: PORT` |
| Internal admin / metrics | `fibe.gg/visibility: internal` with `fibe.gg/port: PORT` (Basic Auth) |
| Background worker | not exposed |
| Database / cache / queue | not exposed |
| Auxiliary build-time service | not exposed |
| WebSocket service used by a sibling web app | share a subdomain with a `path_rule` |

:::caution Bind correctly inside the container
An HTTP service must listen on `0.0.0.0`, not `localhost` — otherwise it works from inside the container but returns 502 from the outside.
:::

See [`decide-exposure-strategy`](/reference/decide-exposure-strategy/).

## Should I enable rolling updates?

**Yes, when all are true:**

- The service is exposed.
- It speaks HTTP — a path-based healthcheck makes sense.
- It can run with multiple replicas concurrently (stateless or session-shared).
- It doesn't pin `container_name` or publish ports.

**No, for:**

- Stateful singletons (Postgres, MySQL, SQLite).
- Single-instance caches (Redis, memcached).
- Message brokers (Kafka, RabbitMQ).
- Background workers and other non-HTTP services.

See [`decide-zero-downtime`](/reference/decide-zero-downtime/) and [`recipe-zero-downtime-healthcheck`](/reference/recipe-zero-downtime-healthcheck/).

## Where does this credential go?

| Value | Where to keep it |
| --- | --- |
| App-level launch config (app name, environment label) | template variable |
| Generated DB password unique to a launch | variable with `random: true` |
| External API token (Stripe, OpenAI…) | Secret Vault |
| Credential reused across many Tricks | Job ENV entry |
| Sensitive value the launcher should type each time | variable marked `sensitive` |

:::caution Anti-patterns
- Putting a real secret in `default:` — it lives in source.
- Re-randomizing a database password on every launch — existing data becomes unreachable.
- Asking the launcher to type a long-lived API key every time — use the vault.
:::

See [`decide-secrets-and-randoms`](/reference/decide-secrets-and-randoms/) and [Secret Vault & Job ENV](/advanced/secrets/).

## Long-running, Trick, scheduled, or triggered?

| Shape | When |
| --- | --- |
| Long-running HTTP | Service should stay up. Default. |
| Trick (job mode) | Task should finish. Mark a watched service. |
| Scheduled Trick | Trick + cron schedule for recurring runs. |
| Triggered Trick | Trick + push/PR trigger for CI-style jobs. |

See [Execution modes](/authoring/execution-modes/) and [`decide-job-mode`](/reference/decide-job-mode/).

## Related

- Reference: [`decide-static-vs-dynamic`](/reference/decide-static-vs-dynamic/), [`decide-exposure-strategy`](/reference/decide-exposure-strategy/), [`decide-zero-downtime`](/reference/decide-zero-downtime/), [`decide-secrets-and-randoms`](/reference/decide-secrets-and-randoms/), [`decide-job-mode`](/reference/decide-job-mode/).
