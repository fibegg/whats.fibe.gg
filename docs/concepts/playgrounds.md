---
title: Playgrounds
description: A Playground is the running environment a Playspec produces — services, URLs, logs, terminals, lifecycle controls.
slug: /concepts/playgrounds
sidebar_position: 7
image: /img/og/concepts-playgrounds.png
keywords: [Playground, rollout, hard restart, lifecycle, maintenance mode, Docker Compose]
---

A **Playground** is the running environment launched from a [Playspec](/concepts/playspecs/). Services, URLs, logs, terminal access, an optional Genie panel.

Starting, changing, stopping, or destroying a Playground runtime requires its Marquee to be funded. If billing has expired, these actions return `MARQUEE_NOT_FUNDED`.

## Lifecycle states

| State | Meaning |
| --- | --- |
| **pending** | Queued. Marquee hasn't started provisioning. |
| **in progress** | Images pulling, containers starting, healthchecks settling. |
| **running** | Up. URLs work. |
| **has changes** | Playspec edited. Running Playground hasn't picked them up. Rollout or Hard restart applies. |
| **completed** | Tricks only. Watched service finished. |
| **error** | Launch failed. Logs say why. |
| **destroying** | Tearing down. |

## Actions

- **Rollout** — apply edits with minimum disruption. Unchanged services keep running.
- **Hard restart** — stop everything, start fresh. Use when state has drifted or after structural changes.
- **Stop** — turn off services, keep the Playground record. Restart later.
- **Retry** — re-run a failed launch.
- **Extend** — push expiration out.
- **Destroy** — remove the Playground.
- **Maintenance mode** — route traffic to a maintenance page. Containers stay up. Toggle, not a state.

`force` can bypass some state protections when the server permits it.

:::tip Expiration with uncommitted changes
If a Playground has uncommitted changes when expiration falls due, Fibe holds off and surfaces a warning. Commit, extend, or destroy.
:::

## What the page gives you

- **Service URLs** — public and internal, HTTPS.
- **Live logs** per service.
- **In-browser terminal** per service.
- **Environment overrides** — change values without rebuilding the image.
- **Service discovery** — containers reach each other by service name inside the Compose network.
- **Status timeline** — build → ready.
- **Genie side panel** — chat in context with any configured [Genie](/concepts/agents/).

## Plain Docker Compose

A Playground's body is a Docker Compose file plus a few Fibe additions (labels, optional settings block). Run the same file locally with `docker compose up` — no Fibe service required for local dev.

On a Marquee the Fibe additions activate (routing, source mounting, variables, healthchecks). Locally they're ignored by Compose.

What this means:

- No Fibe install needed for local development.
- Debug a launch by running the Compose against local Docker.
- The recipe stays portable. Fibe is one place to run it, not the only one.

## Data durability

| Where data lives | Survives restart | Use for |
| --- | --- | --- |
| **Named volume** | Yes | Databases, uploads, anything you'd be sad to lose. |
| **External service** (S3, managed DB) | Yes | Production-shaped data. |
| **Container filesystem** | No | Disposable. Gone on rollout. |

A hard restart can pull a fresh image. Pin tags (`postgres:17`, not `postgres:latest`). Renaming services or volume keys can detach existing data — the product warns first.

## FAQ

<details>
<summary>How long does a Playground stay alive?</summary>

Until you stop it, destroy it, or its expiration passes. Expiration is surfaced prominently.
</details>

<details>
<summary>Can I have many Playgrounds at once?</summary>

Yes. Limited by Marquee capacity. A small Marquee runs a handful; a bigger one runs many.
</details>

<details>
<summary>Rollout vs Hard restart?</summary>

**Rollout** keeps unchanged services running; only changed ones restart. Use for everyday edits.

**Hard restart** stops and starts every service. Use after structural changes (renamed service, volume layout change) or when state has drifted.
</details>

<details>
<summary>502 from outside but works in the container terminal?</summary>

Almost always: the service binds to `localhost` instead of `0.0.0.0`. Fix the bind address. See [Common problems](/operate/common-problems/) for per-framework commands.
</details>

<details>
<summary>What does Maintenance mode do?</summary>

The Marquee proxy serves a maintenance page for the Playground's URLs. Containers stay up — SSH in, read logs, edit. Toggle it off and routing returns. The Playground's state (running, has_changes, error) is unaffected.
</details>

## Related

- [Playspecs](/concepts/playspecs/) — the blueprint that produces a Playground.
- [Marquees](/concepts/marquees/) — where Playgrounds run.
- [Templates](/concepts/playspecs/#templates) — what Playspecs are launched from.
- [Tricks](/concepts/tricks/) — the one-shot variant.
- [Genies inside a Playground](/concepts/agents/) — chat with AI in context.
- Reference: [`fibe-resource-lifecycles`](/reference/fibe-resource-lifecycles/), [`reference-runtime-implied-semantics`](/reference/reference-runtime-implied-semantics/).
