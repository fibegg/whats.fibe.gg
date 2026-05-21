---
name: fibe-agents-and-automation
description: Use for Fibe AI Genies, standalone chats, Playground sidecars, Bridge, artefacts, mutters, feedback, job-mode Tricks, CI repair, scheduled jobs, VCS triggers, and mutation-testing automation.
---

# Fibe agents and automation

Use this skill when a user asks how Fibe's AI Genies work, how to automate work, or how jobs relate to Playgrounds.

## Agents / AI Genies

An Agent is a persistent AI assistant configuration. It stores provider choice, credentials, settings, prompts, mounted files, and runtime preferences.

Supported provider families include Gemini, Antigravity, Claude Code, OpenAI Codex, Cursor, and OpenCode. Credential type depends on provider: OAuth-style credentials, device-code credentials, pasted credential bundles, or API keys. Antigravity uses the Google OAuth code flow from its headless CLI.

An Agent is usable when authenticated and not expired or revoked.

## Agent settings

Common user-facing settings:

- Custom environment variables.
- Provider API key mode.
- Custom MCP configuration.
- Post-init script for preparing the Genie environment.
- Custom system prompt.
- Model options.
- Mounted files.
- Agent password for protected access.
- System-check toggle.

Mounted files are useful for large context, proprietary docs, scripts, fixtures, or data that should be available to a Genie without committing it to the application repository.

## Standalone chat

A standalone Genie chat runs on a selected Marquee without requiring a Playground. It gets its own protected URL and can keep conversation state. Use standalone chat when the user wants an AI workspace but does not need it attached to a specific running app.

Typical chat lifecycle:

1. User selects an authenticated Agent and target Marquee.
2. Chat starts and gets a protected URL.
3. User chats through Bridge or the Agent chat page.
4. User can extend the chat, stop it, or let it expire.

## Bridge

Bridge is the unified Genie workspace. It helps users switch among Agents and active chats, inspect reachability, open chat panes, and receive live updates from Genie work.

Use Bridge language when a user asks for "the agent hub", "all chats", "the floating agent workspace", or "switching between genies".

## Artefacts, mutters, feedback, and public activity

- Artefact: a generated output worth keeping, such as a report, screenshot, mockup, CSV, config, or interactive preview.
- Mutter: a short progress, evidence, or issue note tied to a Playground or Agent workflow.
- Feedback: user rating or review of a Genie output.
- Build in Public: optional public visibility for selected Genie activity and linked Playground context.

## Job mode and Tricks

A Trick is a job-mode Playground for tasks that should finish. It watches one or more services, waits for them to exit, records success or failure, and cleans up.

Good Trick use cases:

- Test suite run.
- Lint or build check.
- Database migration.
- Backup.
- Cleanup.
- Data sync.
- Documentation build.
- Scheduled task.
- VCS-triggered CI task.

Bad Trick use cases:

- Web app that should stay reachable.
- Background worker that should run forever.
- Development server with hot reload.
- Watch command that never exits.

## Scheduled jobs

A scheduled job is a Trick launched from a cron expression on a target Marquee.

Use scheduled jobs for repeated cleanup, backup, sync, or audit tasks. The template must be job-mode, and the watched service must exit.

## VCS-triggered jobs

A VCS-triggered job launches a Trick when a configured repository event matches, such as a push or pull request on a branch.

Use this for CI-style test runs, smoke checks, documentation builds, and automation that should react to source changes.


## Job ENV

Job ENV entries inject environment variables into Tricks. Use them for CI tokens, test service credentials, package registry tokens, and other job-only secrets.

Scopes:

- Global: applies to every Trick owned by the user.
- Prop-scoped: applies only when a Trick is tied to a specific repository.

Prefer Job ENV over template variables when a credential should be reused across many job runs and should not be supplied at every launch.

## Related skills

- [mode-job-trick](mode-job-trick.md)
- [mode-schedule-cron](mode-schedule-cron.md)
- [mode-trigger-vcs](mode-trigger-vcs.md)
- [playbook-test-runner](playbook-test-runner.md)
- [playbook-cron-scheduled](playbook-cron-scheduled.md)
- [decide-secrets-and-randoms](decide-secrets-and-randoms.md)
