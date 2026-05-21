---
title: Marquees
description: A Marquee is a Docker host where Playgrounds and Tricks run. Connect your own or use a managed tutorial host. Marquees handle routing, TLS, registry credentials, capacity.
slug: /concepts/marquees
sidebar_position: 4
image: /img/og/concepts-marquees.png
keywords: [Marquee, Docker host, Fibe infrastructure, routing, TLS, SSH, root domain]
---

A **Marquee** is a Docker host registered with Fibe. Once connected, it runs as many Playgrounds and Tricks as its capacity allows. Marquees handle TLS, public and internal HTTP routing, registry credentials, and the SSH terminal.

A Marquee must be funded before Fibe can launch, restart, build, stream live logs, SSH, run connection tests, restart routing, schedule work, stop or destroy runtime, or send Genie messages through it. If unpaid, those actions return `MARQUEE_NOT_FUNDED`. Billing and funding screens stay available so you can restore service.

## What a Marquee gives you

| Capability | Detail |
| --- | --- |
| **Docker execution** | Compose files run as containers on the host. Fibe drives Docker; you don't. |
| **Public routing (HTTPS)** | `external` services get a URL under your root domain. TLS terminates at the Marquee. |
| **Internal routing** | `internal` services share the URL shape but sit behind Basic Auth. |
| **DNS at the root domain** | Point a wildcard at the Marquee. Every service gets a subdomain. |
| **Registry credentials** | Add once. Every Playground using those images can pull. |
| **SSH terminal** | Open from the Marquee page. Inspect disk, containers, the Docker daemon. |
| **Capacity** | Many environments side-by-side. Limit is host CPU/memory. |

## Add a Marquee

Connect any Docker-capable host reachable over SSH, or use a managed **tutorial Marquee** to start without infrastructure.

You supply:

- **SSH details** — address, user, key. Fibe installs and operates Docker remotely.
- **Root domain** — every service becomes `<subdomain>.<root-domain>`. Requires a wildcard DNS record.
- **TLS** — automatic (Let's Encrypt) or your own certificate.
- **Optional registry credentials** — Docker Hub, GHCR, ECR, etc.

:::tip Tutorial Marquees
The first Marquee in a new account is typically a tutorial Marquee — pre-provisioned, platform-owned. Use it to learn. Add your own for real work.
:::

## Marquee types

Marquees come in tiers, purchased from your [Wallet](/concepts/billing/). Differences are capacity (CPU, RAM, concurrent Playgrounds), not feature gates.

## Routing & URLs

Two URL kinds per service:

- **Public (`external:PORT`)** — `https://<subdomain>.<root-domain>`. Anyone with the URL reaches it.
- **Internal (`internal:PORT`)** — same shape, Basic Auth in front.

Choice is per-service, via the `fibe.gg/expose` label. Container ports are not published manually. Fibe handles binding, certificates, the proxy.

```yaml
services:
  web:
    image: nginx:alpine
    labels:
      fibe.gg/expose: external:80   # → https://web.<root-domain>
  admin:
    image: my-org/admin:1.0
    labels:
      fibe.gg/expose: internal:8080 # → https://admin.<root-domain> (Basic Auth)
```

Subdomain defaults to the service name. Override with `fibe.gg/subdomain`. See [Service labels → Routing & exposure](/authoring/service-labels/).

## Health & capacity

The Marquee page shows:

- **Live status** — reachability, Docker daemon, service health.
- **Capacity** — running Playgrounds, CPU/memory usage.
- **Schedule** — Playgrounds and Tricks running here.
- **SSH terminal**.
- **Connection test** — re-runs the check. Surfaces firewall, key, disk problems.

Connection tests and live diagnostics also require a funded Marquee because they contact the remote host.

**Disable a Marquee** for maintenance. No new launches scheduled. Existing Playgrounds keep running.

## Removing a Marquee

Stop or move attached Playgrounds and Tricks first. The product lists what's attached.

Decommission flow:

1. Disable the Marquee.
2. Stop or destroy obsolete Playgrounds.
3. Move long-running Playgrounds to another Marquee.
4. Delete the Marquee. The host machine is untouched.

## Example: connect a DigitalOcean droplet

1. Ubuntu droplet, 2 vCPU / 4 GB RAM minimum.
2. Wildcard DNS `*.dev.example.com → <droplet IP>`.
3. **Add Marquee** in Fibe with:
   - Host: `dev.example.com`
   - SSH user, SSH key.
   - Root domain: `dev.example.com`.
   - TLS: automatic.
4. **Test connection.** Fibe verifies SSH, installs Docker, opens ports.
5. Marquee ready. Launch a Playground.

## FAQ

<details>
<summary>How many Marquees can I have?</summary>

Plan-dependent. Tutorial Marquees count separately. Top up the [Wallet](/concepts/billing/) for more.
</details>

<details>
<summary>Move a running Playground to a different Marquee?</summary>

Yes. "Move to another Marquee" on the Playground page. Fibe stops, copies relevant volume contents, relaunches. Not instantaneous — schedule downtime.
</details>

<details>
<summary>Can two people share a Marquee?</summary>

No. Marquees are owned by one Player.
</details>

<details>
<summary>Host goes down?</summary>

Connection check flips the Marquee to error. Playgrounds become unreachable until the host returns. No automatic failover.
</details>

<details>
<summary>Does the Marquee see my source?</summary>

Source-mounted dev templates: yes — the Marquee clones the repo via Prop credentials. Built images: only the image, not raw source. Either way, source lives on the Marquee for the Playground's lifetime.
</details>

## Related

- [Wallet, Mana & Sparks](/concepts/billing/) — how you fund a Marquee.
- [Props](/concepts/props/) — repos Fibe pulls from.
- [Playgrounds](/concepts/playgrounds/) — what runs on Marquees.
- Reference: [`fibe-product-map`](/reference/fibe-product-map/), [`fibe-feature-surface`](/reference/fibe-feature-surface/), [`reference-fibe-labels`](/reference/reference-fibe-labels/).
