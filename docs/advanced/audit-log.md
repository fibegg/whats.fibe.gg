---
title: Audit log
description: Read-only history of important changes. Who, what, when, which actor. For investigation, not notifications.
slug: /advanced/audit-log
sidebar_position: 12
keywords: [audit log, history, accountability, investigation, compliance]
---

Read-only history of important changes. Answers:

- Who changed this?
- What resource changed?
- When did it happen?
- Was the actor a user, an API key, an automation, or a Genie?

For **investigation**, not live messaging. No notifications, no push. Open the dashboard when you need answers.

## What gets recorded

Every action that meaningfully changes account or resource state:

- Create, update, delete on Marquees, Props, Templates, Playspecs, Playgrounds, Tricks, Agents.
- Issue, rotate, revoke API keys.
- Add or modify webhooks.
- Add, rotate, revoke Secret Vault entries.
- Modify Job ENV entries.
- 2FA changes — enable, disable, register/remove security keys, regenerate recovery codes.
- Session revocations.

**Not** recorded:

- Routine reads (browsing your own resources).
- Per-message Genie activity (lives in Conversations).
- Audit-log access itself.

## Actor types

Every entry shows who took the action:

- **User** — you.
- **API key** — the entry shows which key.
- **Automation** — a scheduled job inside Fibe.
- **Genie** — an AI agent calling via an agent-accessible API key.

## What does notify you

The audit log doesn't notify. These do, on a separate path:

- **Genie messages** — in-app notification, FAB entry, browser push if enabled.
- **Commit notifications** for Props you follow.
- **Selected activity** you've opted into via [Inbox Notifications](/advanced/notifications/).

## Live status vs audit

The Playground page shows status per service, build steps, log streams, expiration timers — updating live. Separate from the audit log. Observability vs history.

## Export

Audit log exports as CSV or JSON via [Data Backup](/advanced/backup/). Ingest into your own tooling.

## Example investigation

"Who deleted my Trick yesterday afternoon?"

1. Open the audit log. Filter `action_type = trick.destroyed`, last 24 hours.
2. Entry: actor (an API key issued for CI), timestamp, Trick ID.
3. Drill into the key on the API Keys page to see what else it's been doing.
4. If something's off, rotate the key and review its granular scopes.

## FAQ

<details>
<summary>Retention?</summary>

Months. Exact retention depends on plan tier. The audit log page surfaces it.
</details>

<details>
<summary>Why doesn't audit notify?</summary>

Mixing audit and notifications makes audit noisy or notifications miss things. Audit log is searchable history; notifications are interrupting. Each surface has a clear job.
</details>

## Related

- [Security & Sessions](/advanced/security/) — 2FA events appear here.
- [API Keys](/advanced/api-keys/) — investigating per-key activity.
- [Webhooks](/advanced/webhooks/) — outbound notification path.
- [Data Backup](/advanced/backup/) — export the log.
