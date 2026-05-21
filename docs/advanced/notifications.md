---
title: Inbox Notifications
description: Choose which events trigger toast notifications. New notification types are opt-in.
slug: /advanced/notifications
sidebar_position: 10
keywords: [notifications, toasts, inbox, events]
---

Choose which events trigger toast notifications. New notification types added by Fibe are disabled until you enable them.

## Groups

Notifications are grouped:

- **Player & Security** — sign-ins, security changes.
- **Playground** — launch, rollout, error, destroy.
- **AI Agents & Apps** — Genie messages, Pokes, Build-in-Public activity.
- **Content & Dev** — Templates, Props, Compose detection.
- **Drift & Playguard** — environment drift, healthcheck flapping.
- **Integrations** — webhooks, GitHub Apps.

Each group has its own list of event types with a per-event toggle.

## Bulk toggles

Per group: **Enable all** / **Disable all**.

## Default state

New notification types arrive disabled. You opt in explicitly. This is intentional — Fibe never enables a new toast for you.

## Related

- [Webhooks](/advanced/webhooks/) — for events that should go to an external system instead of a toast.
