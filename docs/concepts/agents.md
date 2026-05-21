---
title: Agents
description: Configured AI assistants (Genies), Build in Public, and the artefacts and activity they leave behind.
slug: /concepts/agents
sidebar_position: 1
image: /img/og/concepts-agents.png
keywords: [Agent, Genie, AI assistant, providers, Claude, Gemini, Antigravity, OpenAI, Cursor, OpenCode, Pokes, conversations, Build in Public, Artefact, Mutter, Feedback]
---

A **Genie** is a configured AI assistant. Keep many — one per job. Each holds many parallel conversations.

Two ways to use one:

- **Standalone chat** — Fibe starts a chat with its own URL on a chosen Marquee.
- **Inside a Playground** — open the Genie as a side panel. It reads logs, runs commands, edits source.

## Configure a Genie

- **Provider** — Gemini, Antigravity, Claude Code, OpenAI Codex, Cursor, OpenCode.
- **Credentials** — provider-specific (OAuth, device code, pasted bundle, API key). Stored securely.
- **System prompt** — shapes behavior. E.g. "careful refactoring assistant; prefer minimal diffs; explain reasoning".
- **Custom environment values** — env vars the Genie process sees.
- **Model options** — context window, temperature, provider-specific options.
- **Custom tool servers** — additional MCP servers.
- **Mounted files** — docs, prompts, fixtures, scripts in the working tree on every run.
- **Post-init script** — runs once on environment setup. Use for `npm install`, dependency setup, anything pre-work.
- **Agent password** (optional) — passphrase to make the Genie's URL private.

## Settings cascade

Resolution order (most specific to most generic):

1. This Genie.
2. Your per-provider account default.
3. Your general account default.
4. Platform defaults.
5. Built-in defaults.

Hash-shaped settings (custom env, tool toggles) **merge across all levels** instead of replacing. Change "my default Claude model" once on the account; every Claude-based Genie picks it up.

## Standalone chat

Pick an authenticated Genie and a Marquee. Fibe starts a chat with a protected URL. You can:

- Extend it (push expiration out).
- Stop it (preserves history; restart later).
- Let it expire.

No Playground attached. Useful for ideation and docs search.

Starting, restarting, messaging, interrupting, reading live state from, stopping, or cleaning up a Genie runtime requires the selected Marquee to be funded. Unpaid Marquees fail with `MARQUEE_NOT_FUNDED`.

## Inside a Playground

Open a Genie as a side panel. It gets the run's context — logs, terminal, source, environment — and can:

- Debug failing services.
- Edit source.
- Run terminal commands.
- Generate artefacts (reports, diffs, mockups).
- Commit changes via in-browser git.
- Stay open while you work in other panes.

Switch Genies inside a Playground anytime.

## Conversations

Every chat is a **Conversation**: messages, replies, related activity stored together. A Genie holds many Conversations in parallel. Resume any later.

The special **Inbox** conversation collects general activity outside any thread — notifications, pokes, broadcasts.

## Pokes — scheduled prompts

A **Poke** sends a prompt to a Conversation on a recurring schedule. Useful for:

- Morning summary of new commits.
- Hourly deploy-log check.
- Weekly roadmap draft from open issues.

Each Poke has:

- A **cron schedule** (5-field POSIX).
- A **prompt body**.
- One **target Conversation** (not the Inbox — Pokes refuse it at validation).

Minimum interval: **five minutes**. Pause/resume from the Genie's settings. Deleting the target Conversation auto-pauses the Poke.

Scheduled Pokes claim and reschedule normally, but delivery to a Genie is blocked when the backing Marquee is unpaid.

## Notifications on activity

When a Genie sends a message:

- **In-app notification** surfaces immediately.
- Entry in the **FAB** (floating-action-button area).
- **Browser web-push** if enabled.

Audit-log entries don't notify. See [Audit log](/advanced/audit-log/).

## Genie example

```yaml
# Conceptual — set in the UI, not YAML
name: Refactorer
provider: Claude Code
system_prompt: |
  Careful refactoring assistant. Prefer the smallest possible diff. Run
  the relevant tests before claiming a change is done. Quote the test
  output back to me.
mounted_files:
  - ARCHITECTURE.md
  - STYLE_GUIDE.md
post_init: npm install --silent
custom_env:
  NODE_ENV: test
```

Opened in a Playground, the Genie has the docs, the env vars, and a clean install before you say a word.

## Build in Public

Opt selected Genies into your public profile. Visitors browse what you're working on without a Fibe account.

### Per-Genie toggle

Set per Genie, not per account. Flip the toggle in a Genie's settings; that Genie appears on your public profile. Other Genies stay private.

Use cases:

- Public main side project, private client work.
- Experimental Genie kept private until interesting.
- Public-facing demo Genie alongside private day-to-day Genies.

### Feature a Playground

With the toggle on, pick one of your Playgrounds to feature — typically a live demo. Visitors land on the Genie's page and see that Playground.

Rules:

- Only Playgrounds you can access are eligible.
- Turning Build in Public off clears the featured Playground.
- Featuring does **not** auto-publish the Playground. Public visibility of the Playground is separate.

### What visitors see

Public profile lists your build-in-public Genies. Visitors browse them. They can't sign in as you or modify anything. Account-level data (settings, Wallet, other Genies) stays private.

Each public Genie page shows:

- Name and short description.
- Featured Playground (if set) with its public URL.
- Timeline of public activity — public artefacts and public mutters.

Conversations and chat history are private. Publish parts explicitly as artefacts to expose them.

### Typical setup

1. Create a Genie tuned to your project.
2. Run a dev Playground with a public URL.
3. Feature the Playground on the Genie.
4. Capture milestones as artefacts marked public.
5. Share your public profile URL.

## Artefacts, mutters, feedback

The trail your work leaves behind.

### Artefact

A generated output worth keeping — report, screenshot, mockup, CSV, config snippet, interactive preview. Attaches to the Playground or Genie that produced it.

Use when:

- A Genie generates a useful file.
- A Playground produces a build output (logs, report, diagram).
- You want to mark a moment.

Mark an artefact public to surface it on a Build-in-Public profile.

### Mutter

A short progress, evidence, or issue note. Capture a "here's what I tried" or "here's where it broke", with screenshots optional.

Mutters describe **what happened**, not how. Good:

- "Migration on a fresh DB ran in 12s."
- "Healthcheck flapping. `start_period` is probably too short."
- "Pushed v2 of the auth flow. Preview at &lt;url&gt;."

Bad:

- "ERROR: connection refused." Paste the log into an artefact instead.
- "Refactored to use new ORM." Vague — what changed, why, what's left?

### Feedback

Rate or review a Genie's output. Feeds back into how you judge an assistant for a given task.

Use when:

- A response was particularly useful or particularly off.
- You want to remember which Genie was good at which task.
- You're evaluating providers or system prompts.

### Activity timelines

Artefacts, mutters, feedback, plus higher-level events (Genie sent a message, Trick failed, Playground rolled out) roll up into per-Playground and per-Genie timelines. Chronological order.

With Build in Public on, the public-marked subset appears on your public profile.

## FAQ

<details>
<summary>How many Genies can I have?</summary>

No hard cap. Each Genie's settings page shows current spend so you can monitor.
</details>

<details>
<summary>Two Genies share a Conversation?</summary>

No. Each Conversation belongs to one Genie. Switch Genies (new Conversation) or copy context across.
</details>

<details>
<summary>Does a Genie see my code?</summary>

In a Playground: yes — files mounted there. Standalone chat: only what you give in prompts plus mounted files. Mounted files don't leak across Genies.
</details>

<details>
<summary>Pokes and the Wallet?</summary>

Each Poke run costs the underlying model call. Poke settings show recent runs and their cost.
</details>

<details>
<summary>Can visitors chat with my public Genie?</summary>

No. Conversations belong to you. Visitors only read the profile and public artefacts.
</details>

<details>
<summary>Turning Build in Public off?</summary>

The Genie disappears from the public profile. Old URLs return 404. Re-enable to restore.
</details>

<details>
<summary>Profile public without opt-in Genies?</summary>

The profile URL exists by default. Without opted-in Genies, it's essentially empty.
</details>

<details>
<summary>Artefacts stored forever?</summary>

Until you delete them. Artefacts attached to a destroyed Playground move to the account-level artefact list.
</details>

<details>
<summary>Artefact vs file in a Prop?</summary>

A **Prop file** is source code in git. An **artefact** is a produced output — result of running something, snapshot of a state.
</details>

## Related

- [Playgrounds](/concepts/playgrounds/) — where Genies attach.
- [Run the MCP server](/sdk/mcp-server/) — Genies (and external agents) call Fibe directly. Conversation tools come from this server.
- [Advanced → Agent Defaults](/advanced/agent-defaults/) — account-wide defaults for new Genies.
- Reference: [`fibe-agents-and-automation`](/reference/fibe-agents-and-automation/).
