---
title: Tools catalog
description: Every MCP tool fibe ships, organized by family. Each row links to a detail page. Read the catalog top-to-bottom or jump straight to a tool.
slug: /sdk/tools-catalog
sidebar_position: 7
sidebar_label: Tools catalog
image: /img/og/sdk-tools-catalog.png
keywords: [MCP tools, fibe tools, tool catalog, resource_mutate, greenfield_create, playgrounds_transform, pipeline]
---

Every tool the [MCP server](/sdk/mcp-server/) ships, grouped by what it operates on. Click through to a tool's detail page for parameters, return shape, examples, and edge cases.

For a deep how-to, [Common workflows](/sdk/workflows/) walks through the end-to-end stories these tools support.

Tools preserve unpaid Marquee failures as `MARQUEE_NOT_FUNDED` with HTTP status `402`. Funding and billing reads remain available.

## Auth, doctor & meta

The thin tools that bootstrap the rest. Every agent calls one or two of these at the start of a session.

| Tool | Purpose |
| --- | --- |
| [`fibe_auth_set`](/reference/tools/auth-set/) | Set credentials for this session (multi-tenant). |
| [`fibe_doctor`](/reference/tools/doctor/) | Self-diagnostic — connectivity, auth, environment sanity. |
| [`fibe_status`](/reference/tools/status/) | Account dashboard — resource counts, quotas, rate-limit headroom. |
| [`fibe_schema`](/reference/tools/schema/) | Introspect a resource's JSON schema. |
| [`fibe_help`](/reference/tools/help/) | Equivalent of `fibe ... --help` for any command. |
| [`fibe_tools_catalog`](/reference/tools/tools-catalog/) | This catalog, but as a tool the agent can call. |
| [`fibe_call`](/reference/tools/call/) | Dynamic invocation of hidden tools (escape hatch). |
| [`fibe_run`](/reference/tools/run/) | Run any CLI command (last-resort escape hatch). |
| [`fibe_update_name`](/reference/tools/update-name/) | Rename a resource. |

## Resource CRUD

The five tools that handle every resource family — Playgrounds, Tricks, Agents, Playspecs, Props, Marquees, Templates, Secrets, Webhooks, API keys, Artefacts, etc.

| Tool | Purpose |
| --- | --- |
| [`fibe_resource_list`](/reference/tools/resource-list/) | List resources of a family with filters. |
| [`fibe_resource_get`](/reference/tools/resource-get/) | Fetch one resource by ID/name. Supports file downloads (agent / artefact attachments). |
| [`fibe_resource_mutate`](/reference/tools/resource-mutate/) | Create / update / run resource-scoped operations. |
| [`fibe_resource_delete`](/reference/tools/resource-delete/) | Delete by ID/name. |
| `fibe_resource_watch` | Watch events on a resource. (Listed in the upstream catalog; no detail page yet.) |

## Playgrounds

Long-running environments — the brownfield half of the platform.

| Tool | Purpose |
| --- | --- |
| [`fibe_playgrounds_wait`](/reference/tools/playgrounds-wait/) | Block until a Playground reaches a status. |
| [`fibe_playgrounds_logs`](/reference/tools/playgrounds-logs/) | Consolidated log dump. |
| [`fibe_playgrounds_logs_follow`](/reference/tools/playgrounds-logs-follow/) | Stream live logs with progress notifications. |
| [`fibe_playgrounds_action`](/reference/tools/playgrounds-action/) | Rollout, hard-restart, stop, start, retry, maintenance on/off. Actions that use the Marquee require funding. |
| [`fibe_playgrounds_debug`](/reference/tools/playgrounds-debug/) | Comprehensive diagnostics for a stuck Playground. |
| [`fibe_playgrounds_transform`](/reference/tools/playgrounds-transform/) | One-call brownfield transform — swap template, provision repos, rollout, wait. Preserves the Playground ID. |

## Agents (Genies)

Configure, chat with, and observe AI assistants from inside another AI assistant.

| Tool | Purpose |
| --- | --- |
| [`fibe_agents_duplicate`](/reference/tools/agents-duplicate/) | Clone an agent's config with a new name. |
| [`fibe_agents_runtime_status`](/reference/tools/agents-runtime-status/) | Reachability, auth, queue depth, processing state. Live checks require a funded Marquee. |
| [`fibe_agents_send_message`](/reference/tools/agents-send-message/) | Send a chat message (with attachments). Requires a funded Marquee. |
| [`fibe_agents_start_chat`](/reference/tools/agents-start-chat/) | Start / reconnect a chat session. Requires a funded Marquee. |
| [`fibe_agents_interrupt`](/reference/tools/agents-interrupt/) | Interrupt a long-running tool call. |
| [`fibe_agents_messages`](/reference/tools/agents-messages/) | Read message history. |
| [`fibe_agents_activity`](/reference/tools/agents-activity/) | Event timeline for one agent. |
| [`fibe_agents_live_state`](/reference/tools/agents-live-state/) | Current in-flight tools, status, scratchpad. |
| [`fibe_agents_create_conversation`](/reference/tools/agents-create-conversation/) | Start a new conversation thread. |
| [`fibe_agents_delete_conversation`](/reference/tools/agents-delete-conversation/) | Tear one down. |
| [`fibe_agent_defaults_get`](/reference/tools/agent-defaults-get/) | Read your per-Player default agent config. |
| [`fibe_agent_defaults_update`](/reference/tools/agent-defaults-update/) | Write per-Player default agent config. |
| [`fibe_agent_defaults_reset`](/reference/tools/agent-defaults-reset/) | Reset defaults to platform values. |

## Greenfield: one-call setup

For "I have nothing yet; build me the whole thing".

| Tool | Purpose |
| --- | --- |
| [`fibe_launch_create`](/reference/tools/launch-create/) | Launch inline Compose, a local config file, or a GitHub repo config. |
| [`fibe_greenfield_create`](/reference/tools/greenfield-create/) | Repos → template version → Playspec → Playground → running. Single call. |
| [`fibe_templates_launch`](/reference/tools/templates-launch/) | Bootstrap a Playground from an existing import-template. |
| [`fibe_templates_search`](/reference/tools/templates-search/) | Search the template catalog. |
| [`fibe_templates_change`](/reference/tools/templates-change/) | Patch / overwrite a template, optionally rollout. |
| [`fibe_github_repos_create`](/reference/tools/github-repos-create/) | Provision a new GitHub repo (uses your GitHub App). |
| [`fibe_gitea_repos_create`](/reference/tools/gitea-repos-create/) | Same for Gitea. |

## Monitoring, mutters, feedback, artefacts

The trail your work leaves and the live event stream that surfaces it.

| Tool | Purpose |
| --- | --- |
| [`fibe_monitor_list`](/reference/tools/monitor-list/) | List recent events. |
| [`fibe_monitor_follow`](/reference/tools/monitor-follow/) | Stream events live. |
| [`fibe_mutter`](/reference/tools/mutter/) | Post a mutter (progress / evidence / blocker note). |
| [`fibe_mutters_get`](/reference/tools/mutters-get/) | Read mutters for a resource. |
| [`fibe_feedbacks_list`](/reference/tools/feedbacks-list/) | List feedback on artefacts. |
| [`fibe_feedbacks_get`](/reference/tools/feedbacks-get/) | Read one feedback. |
| [`fibe_artefact_upload`](/reference/tools/artefact-upload/) | Upload a file as an artefact attached to a resource. |

## Pipelines

The most powerful tool. Run multiple calls in sequence, parallel, or for-each, with JSONPath bindings between steps.

| Tool | Purpose |
| --- | --- |
| [`fibe_pipeline`](/reference/tools/pipeline/) | Execute a multi-step plan with bindings, parallel blocks, for-each loops, caching. |
| [`fibe_pipeline_result`](/reference/tools/pipeline-result/) | Look up a cached pipeline result (5-min TTL). |

For an example, see [Common workflows → Pipelines](/sdk/workflows/).

## Local dev

For users running a Marquee locally and wanting to peek at what's on disk.

| Tool | Purpose |
| --- | --- |
| [`fibe_local_playgrounds_info`](/reference/tools/local-playgrounds-info/) | Inspect `/opt/fibe/playgrounds/...` on the local host. |
| [`fibe_local_playgrounds_link`](/reference/tools/local-playgrounds-link/) | Mount a local Playground into the current dir. |

## Repos

Connect Fibe to source-control providers.

| Tool | Purpose |
| --- | --- |
| [`fibe_find_github_repos`](/reference/tools/find-github-repos/) | Search GitHub across your installations. |
| [`fibe_get_github_token`](/reference/tools/get-github-token/) | Mint a short-lived GitHub token. |
| [`fibe_repo_status_check`](/reference/tools/repo-status-check/) | Verify access / privacy / fork status for a repo URL. |

## Annotations

Every tool's detail page surfaces three annotations from the canonical catalog:

- **Destructive** — can permanently change or delete data. The MCP server confirms before calling these by default.
- **Idempotent** — calling twice has the same effect as calling once (good for retries).
- **Read-only** — never modifies state. Safe to call freely.

The catalog file at `/Users/vvsk/play/sdk/fibe_mcp_tools_catalog.md` is the upstream source of truth for the annotations.

## Next step

For end-to-end usage of these tools, head to [Common workflows](/sdk/workflows/) — greenfield, brownfield, pipelines, monitoring, CI integration.
