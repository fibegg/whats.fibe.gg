---
title: Webhooks
description: Signed event callbacks to external systems. Family subscription plus granular event filters, HMAC signing, test deliveries.
slug: /advanced/webhooks
sidebar_position: 6
keywords: [webhooks, HTTP, notifications, events, signature, HMAC, granular filters, event_filters, tool_filters]
---

Send signed event callbacks to external systems when Fibe resources change. Outbound counterpart to API keys: API keys let things call **into** Fibe; webhooks let Fibe call **out**.

## Subscribing to event families

Each webhook has:

- A **destination URL** — HTTPS required.
- A **selection of event families** to listen for.
- A **signing secret** — Fibe HMAC-signs every payload; verify on receipt.

Available families cover **Playgrounds, Marquees, Props, Playspecs, Agents, Templates, Artefacts, Mutters, Feedback, API keys, Secrets, Webhooks**.

## Granular event filters

Family subscription often delivers more than you want. Narrow with **event filters** and **tool filters** — receive callbacks only for the events, tools, or resources you care about.

Examples:

- Playground family, only state changes on **one Playground**.
- Agent activity, only events tied to a **specific tool**.
- Template events, only when **one specific Template** publishes a new version.

## Create an endpoint

Fields:

- **URL**.
- **Events** — one or more event types.
- **Description** — your reference.
- **Active** — toggle to pause without deleting.

Signing secret generated at creation. Use it to verify deliveries.

## Event types (examples)

- `playground.launched`, `playground.failed`, `playground.destroyed`
- `trick.succeeded`, `trick.failed`
- `template.version_published`
- `marquee.connection_failed`
- `genie.message_sent`
- `wallet.charged`

The endpoint page shows the full catalog.

## Delivery model

- Each event produces one POST to your URL with a JSON body.
- Retries on non-2xx with exponential backoff (5 retries by default).
- Each delivery has a unique `id`. Use it for idempotency.
- `X-Fibe-Signature` header carries an HMAC over the body using your secret.

## Verify signatures

```python
import hmac, hashlib

def verify(body: bytes, header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(header, expected)
```

Constant-time compare.

## Test & observe

- **Test delivery** from the endpoint page before depending on it.
- **Delivery history** shows payloads sent, timestamps, receiver responses. Useful for debugging.

## Resilience

- Payloads are HMAC-signed.
- Repeated failures **auto-disable** the endpoint until you fix the receiver.
- Re-enabling does **not** replay missed events. Use the [Audit log](/advanced/audit-log/) for missed events.

## Common pitfalls

- Pointing a webhook at a private network address from a protected environment — callback never arrives.
- Logging the raw payload alongside the secret — defeats signing.
- Skipping signature verification because the URL is "secret enough" — it isn't.

## Example: Slack notification on Trick failure

- **Destination URL** — your Slack incoming-webhook URL.
- **Event families** — Tricks.
- **Event filters** — `status: failed`.
- **Signing secret** — HMAC secret verified in your Slack-relay function.

In practice, relay through a small worker that translates Fibe's payload into Slack blocks.

## FAQ

<details>
<summary>Signing scheme?</summary>

HMAC-SHA256 with the signing secret, over the raw request body. Signature sent in a header. Verify before doing anything with the payload.
</details>

<details>
<summary>How many webhooks can I have?</summary>

Plan-dependent. See [Limits & Quotas](/advanced/limits/) for current counts.
</details>

<details>
<summary>Webhook triggering another Fibe action?</summary>

No. Webhooks are outbound. To trigger a Fibe action from an external event, use an API key from that external system.
</details>

## Related

- [API Keys](/advanced/api-keys/) — inbound counterpart.
- [Audit log](/advanced/audit-log/) — searchable history of changes.
- [Tricks](/concepts/tricks/) — common webhook trigger source.
