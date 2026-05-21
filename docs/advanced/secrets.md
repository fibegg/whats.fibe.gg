---
title: Secret Vault & Job ENV
description: Encrypted credential storage. Secret Vault for long-lived shared secrets; Job ENV for credentials Tricks need at run time.
slug: /advanced/secrets
sidebar_position: 5
keywords: [secret vault, secrets, credentials, encrypted storage, Job ENV, environment variables]
---

Two homes for credentials, depending on who needs them and when.

## Secret Vault

Encrypted store for long-lived values that shouldn't appear in source or template bodies. Use for external API tokens, third-party credentials, anything you'd rotate every few months and reuse from many places.

A Secret is **fetched by name** when something needs it — a Genie call, a workflow, a launch. The vault is the canonical home, not a duplicate of a template variable.

### When to use

- An LLM provider API key your Genies need.
- A Stripe API key your scheduled report Trick needs.
- A third-party webhook signing secret.
- An OAuth client secret for a custom integration.

### Properties

- Encrypted at rest.
- Listed by name; raw value shown only on explicit reveal.
- Edit, rotate, revoke from the Vault page.
- Modifying entries requires [2FA re-authentication](/advanced/security/).

## Job ENV entries

Inject environment values into **Trick runs**. Two scopes:

- **Global** — available to every Trick you run.
- **Prop-scoped** — only when the Trick is tied to that repository.

Prefer Job ENV over template variables when a credential is reused across many runs and the launcher shouldn't have to supply it each time.

### When to use Job ENV

- A deploy token your CI Trick needs on every push.
- An AWS access key your nightly backup Trick uses.
- A Slack webhook URL your daily-summary Trick posts to.

### Two scopes

- **Global Job ENV** — credentials every Trick needs (e.g. one Slack webhook URL).
- **Prop-scoped Job ENV** — multiple repos with different deploy keys. Repo A's CI Trick gets repo A's key; B gets B's; they never see each other's.

## Where to keep what

| Value | Home |
| --- | --- |
| App-level launch config (app name, environment label) | Template variable |
| Generated DB password unique to a launch | Variable with `random: true` |
| External API token (Stripe, LLM provider, etc.) | **Secret Vault** |
| Credential reused across many Tricks | **Job ENV entry** |
| Sensitive value the launcher should type each time | Variable marked `sensitive` |

## Anti-patterns

- **Don't** put a real secret in a Template's `default:` field. It lands in git when the Template is source-linked.
- **Don't** re-randomize a database password on every launch — existing data becomes unreachable.
- **Don't** ask the launcher to type a long-lived API key every time. Use the vault.
- **Don't** store a credential in both Vault and Job ENV. Pick one home.

## Audit

Every read of a vault entry creates an audit log row. See [Audit log](/advanced/audit-log/).

## FAQ

<details>
<summary>Can a Genie see Vault secrets?</summary>

Only when explicitly handed one. A Genie's config can reference a Vault secret by name; value is injected at run time. Raw value isn't visible in the Genie settings page.
</details>

<details>
<summary>Job ENV values in Trick logs?</summary>

Fibe scrubs them from log output where it can. If your job code echoes a secret to stdout, it appears in logs. Don't print secrets.
</details>

<details>
<summary>Export Vault contents?</summary>

Via [Data Backup](/advanced/backup/). Includes encrypted Vault entries. Treat the export file as sensitive.
</details>

## Related

- [API Keys](/advanced/api-keys/) — credentials for Fibe itself, not your services.
- [Webhooks](/advanced/webhooks/) — outbound events; signing secrets live in the Vault.
- [Tricks](/concepts/tricks/) — what consumes Job ENV.
- Reference: [`decide-secrets-and-randoms`](/reference/decide-secrets-and-randoms/), [`recipe-random-and-secrets`](/reference/recipe-random-and-secrets/).
