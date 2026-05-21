---
title: API reference
description: Public /api namespace conventions for authentication, response envelopes, pagination, async operations, and endpoint groups.
slug: /api
sidebar_label: Overview
keywords: [Fibe API, REST API, bearer token, async requests]
---

# API reference

This reference covers the public `/api` namespace exposed by Fibe. It does not cover the legacy Stripe webhook route, commented team routes, or internal-only routes outside `/api`.

Use the SDK, CLI, or MCP server when you want a supported automation surface with command discovery and auth profile handling. Use the HTTP API when you need direct REST integration.

## Base URL

Use the environment host plus the `/api` namespace:

| Environment | Base URL |
| --- | --- |
| Production | `https://fibe.gg/api` |
| Staging | `https://next.fibe.live/api` |

## Authentication

Send API keys as bearer tokens:

```http
Authorization: Bearer fibe_...
Accept: application/json
Content-Type: application/json
```

API requests are authenticated as the player that owns the token. API access is limited to beta or super-admin players. Some endpoints also require scoped API keys, such as `monitor:read` for event monitoring.

`GET /api/me` returns the current API identity and the scopes attached to the token.

## Response shapes

Most resource reads return the serialized resource directly:

```json
{
  "id": 123,
  "name": "example"
}
```

List endpoints use a shared envelope:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 0
  }
}
```

Pagination parameters:

| Parameter | Default | Maximum | Notes |
| --- | --- | --- | --- |
| `page` | `1` | `1000` | One-based page number. |
| `per_page` | `25` | `100` | Page size. |
| `limit` | `25` | `100` | Alias used by endpoints that accept limit-style pagination. |

Validation and authorization failures use the shared error envelope:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {}
  }
}
```

Responses include `X-Request-Id` when a request id is available.

## Async operations

Long-running operations return `202 Accepted` with a polling URL:

```json
{
  "request_id": "req_...",
  "status": "queued",
  "status_url": "/api/async_requests/req_..."
}
```

Poll `GET /api/async_requests/:id` until the operation is terminal. Queued and running requests return `202`; terminal and error states return `200`. A missing async request returns `404`.

Some write endpoints support `Idempotency-Key` for safe retries. Reuse the same key only for retries of the same logical operation.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/async_requests/:id` | Poll a queued async operation. |

## Endpoint groups

| Group | Contents |
| --- | --- |
| [Platform](./platform.mdx) | Marquees, props, playgrounds, playspecs, template imports, launches, and compose validation. |
| [Agents and knowledge](./agents-and-knowledge.mdx) | Agents, conversations, artefacts, feedback, events, memory, uploads, and conversation synchronization. |
| [Integrations](./integrations.mdx) | API keys, secrets, job environment, GitHub and Gitea repositories, installations, webhooks, and audit logs. |

Each endpoint group is rendered from an OpenAPI 3.1 definition. Click **Authorize** on a group page, paste your `FIBE_API_KEY`, choose Production or Staging, and use **Try it out** to exercise an endpoint directly from the docs.
