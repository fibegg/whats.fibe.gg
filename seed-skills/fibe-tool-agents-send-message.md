---
name: fibe-tool-agents-send-message
description: Use when you need to send one text message to a managed Agent's chat runtime. Overseer-only.
---

# fibe_agents_send_message

[MODE:OVERSEER] Tier: overseer. Not idempotent.

Pushes one user-style message into the Agent's runtime chat queue. It can also pass image payloads and runtime attachment filenames. The Fibe server uploads local files before sending the message and then forwards the turn to the selected Agent runtime.

## When to use
- Driving an Agent programmatically from another Agent (Overseer mode).
- Re-prompting after a tool failure or feedback.
- Automated test scenarios.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `text` | string | yes | Message body (any length the runtime accepts) |
| `conversation_id` | string | no | Specific runtime conversation/thread ID |
| `busy_policy` | string | no | Behavior when runtime is busy, for example `queue` |
| `images` | array<string> | no | Image payloads, such as data URLs |
| `attachment_paths` | array<string> | no | Local file paths to upload before sending |
| `attachment_filenames` | array<string> | no | Runtime attachment filenames returned by a previous upload |

The MCP tool's strict input schema accepts `agent_id`, `text`, `conversation_id`, `busy_policy`, `images`, `attachment_paths`, and `attachment_filenames`.

## Output
HTTP 202 envelope from the Agent runtime — message accepted into queue. Does **not** return the runtime's response (the response will surface via mutter/artefact/event later).

## Behavior
1. The Fibe server authorizes the caller for the Agent.
2. Uploads any `attachment_paths` to the runtime and collects returned filenames.
3. Calls `agent.send_message_to_runtime` which POSTs to the runtime container's HTTP endpoint.
4. Returns 202 with the runtime's accept envelope.
5. Errors surface as `AGENT_COMMUNICATION_FAILED`.

## Gotchas
- **Runtime must be reachable.** Check `fibe_agents_runtime_status` first; sending while `runtime_reachable:false` errors out.
- When driving a multi-conversation Agent, always pass `conversation_id`; otherwise the runtime chooses its default conversation.
- Attachments are conversation-scoped when `conversation_id` is provided; pass the same value to upload and send.
- Long messages may be split runtime-side; behavior depends on the LLM provider config.
- This tool does NOT wait for the Agent to respond. Watch `fibe_agents_live_state`, `fibe_monitor_follow`, or `fibe_mutters_get` for downstream events.
- `text:""` is rejected (`required field not set`).

## Related
- `fibe_agents_start_chat` — ensure chat is running.
- `fibe_agents_runtime_status` — pre-flight health check.
- `fibe_agents_live_state` — observe conversation-scoped streaming state.
- `fibe_agents_interrupt` — stop a stuck turn.
- `fibe_monitor_follow` / `fibe_mutters_get` — observe Agent's response stream.
- `fibe_feedbacks_list` — see if the Agent's reply triggered Player feedback.
