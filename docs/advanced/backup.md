---
title: Data Backup
description: Export your account data or import from a backup file.
slug: /advanced/backup
sidebar_position: 11
keywords: [backup, export, import, data portability]
---

Export account data or import from a backup file.

## Export

Produces a single archive containing:

- Profile settings.
- Marquees (definitions, not the host content).
- Props (definitions, not the repos themselves).
- Templates with all published versions.
- Playspecs (the blueprints, not running Playgrounds).
- Genies with their configuration.
- Vault entries (encrypted with a passphrase you supply).
- API keys (metadata only — secrets are not exported).
- Webhook endpoints (URL and event subscriptions; signing secrets are not exported).
- Audit log.

What's **not** in the export:

- Running Playgrounds and their volumes.
- Past Trick runs' logs and artefacts beyond a retention window.
- Mutters and conversations beyond a retention window.

Pick a passphrase for the vault portion. Keep it. Without it the vault entries can't be re-imported.

## Import

Two modes:

- **Replace** — wipe matching resources and load from the archive. Destructive.
- **Merge** — only create resources that don't already exist. Existing ones untouched.

Import surfaces a preview of what will change before commit.

## Scheduling

Exports can be run on demand or scheduled (daily, weekly). Scheduled exports are dropped into your account's artefact store. Configure on the Data Backup page.

## Related

- [Audit log](/advanced/audit-log/) — included in exports.
- [Secret Vault](/advanced/secrets/) — exported encrypted; passphrase required to re-import.
