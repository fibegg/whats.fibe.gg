---
title: "Agents Send Message"
description: "Use when you need to send one text message to a managed Agent chat. Overseer-only."
slug: /reference/tools/agents-send-message
sidebar_label: "Agents Send Message"
image: /img/og/reference-tools-agents-send-message.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "send", "message"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Not idempotent.

Sending to an agent requires the chat Marquee to be funded. Unpaid Marquees return `MARQUEE_NOT_FUNDED`.

Pushes one user-style message into the Agent's chat queue. It can also pass image payloads and attachment filenames. Fibe uploads local files before sending the message and then forwards the turn to the selected Agent.

## When to use
- Driving an Agent programmatically from another Agent (Overseer mode).
- Re-prompting after a tool failure or feedback.
- Automated test scenarios.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `text` | string | yes | Message body |
| `conversation_id` | string | no | Specific conversation/thread ID |
| `busy_policy` | string | no | Behavior when the agent is busy, for example `queue` |
| `images` | array&lt;string&gt; | no | Image payloads, such as data URLs |
| `attachment_paths` | array&lt;string&gt; | no | Local file paths to upload before sending |
| `attachment_filenames` | array&lt;string&gt; | no | Attachment filenames returned by a previous upload |

The MCP tool's strict input schema accepts `agent_id`, `text`, `conversation_id`, `busy_policy`, `images`, `attachment_paths`, and `attachment_filenames`.

## Output
HTTP 202 envelope — message accepted into queue. Does **not** return the Agent's response; that response will surface via mutter/artefact/event later.

## Behavior
1. The Fibe server authorizes the caller for the Agent.
2. Uploads any `attachment_paths` and collects returned filenames.
3. Sends the message to the selected Agent.
4. Returns 202 with the accepted-message envelope.
5. Errors surface as `AGENT_COMMUNICATION_FAILED`.

## Gotchas
- **Agent must be reachable.** Check `fibe_agents_runtime_status` first; sending while `runtime_reachable:false` errors out.
- When driving a multi-conversation Agent, always pass `conversation_id`; otherwise the default conversation is used.
- Attachments are conversation-scoped when `conversation_id` is provided; pass the same value to upload and send.
- Long messages may be split before delivery; behavior depends on the LLM provider config.
- This tool does NOT wait for the Agent to respond. Watch `fibe_agents_live_state`, `fibe_monitor_follow`, or `fibe_mutters_get` for downstream events.
- `text:""` is rejected (`required field not set`).

## Related
- `fibe_agents_start_chat` — ensure chat is running.
- `fibe_agents_runtime_status` — pre-flight health check.
- `fibe_agents_live_state` — observe conversation-scoped streaming state.
- `fibe_agents_interrupt` — stop a stuck turn.
- `fibe_monitor_follow` / `fibe_mutters_get` — observe Agent's response stream.
- `fibe_feedbacks_list` — see if the Agent's reply triggered Player feedback.
