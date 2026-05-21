---
title: Limits & Quotas
description: Resource usage, account quotas, per-parent caps.
slug: /advanced/limits
sidebar_position: 3
keywords: [limits, quotas, usage, caps]
---

Current resource usage versus account quotas, plus per-parent caps applied to nested resources.

## Resource quotas

Per-resource counts and limits. Each row shows used / limit / status (OK, near limit, exceeded).

Resources typically tracked:

- Marquees.
- Templates.
- Playspecs.
- Playgrounds running.
- Tricks running.
- Genies.
- API keys.
- Webhook endpoints.

Quotas come from your plan. Top up via [Billing](/concepts/billing/) or upgrade to raise them.

## Per-parent caps

Maximums applied per parent resource. Examples:

- Files mounted per Genie.
- Deliveries per webhook endpoint.
- Conversations per Genie.
- Mutters per Playground.

These prevent one resource from monopolizing storage or throughput. Enforced silently at create time.

## Statuses

- **OK** — well under the limit.
- **Near limit** — within the configured warning band (typically 80%).
- **Exceeded** — at or past the limit; new creates are blocked until usage drops.

## Related

- [Billing](/concepts/billing/) — top up to raise quotas.
- [API Keys](/advanced/api-keys/) — scopes and rotation.
