---
title: GitHub Apps
description: Install GitHub Apps for private repo access, CI triggers, and Genie integration.
slug: /advanced/github-apps
sidebar_position: 7
keywords: [GitHub, GitHub Apps, integration, private repos, CI, webhooks]
---

GitHub App installations. Used for private repo access, CI triggers, and direct Genie integration.

## What an installation grants

- **Repo cloning** — Props use the installation to clone private repositories.
- **Webhooks** — push and pull-request events flow into Fibe to fire Tricks and refresh Template versions.
- **Status checks** — CI Tricks post results back to commits and PRs.
- **PR comments** — Genies tied to a repo can comment on PRs.

## Install

1. Open the Advanced → GitHub Apps page.
2. Pick which Fibe GitHub App to install (the page lists available apps; typically one per environment).
3. Click Install. GitHub asks which orgs/repos to grant.
4. Pick repos. Return to Fibe; the installation is registered.

Multiple installations supported per account — one per org or per repo set.

## Per-installation page

Shows:

- Account or org the installation belongs to.
- Repos selected.
- Permissions granted.
- Installation ID.
- Last sync.

Actions:

- **Resync** — re-fetch repos and permissions from GitHub.
- **Update on GitHub** — opens the GitHub install page to edit repo selection.
- **Uninstall** — revokes the installation. Props using it lose access; existing Playgrounds keep running.

## Revoking

Uninstall from Fibe or from GitHub. Either side disables the installation. Props using it surface a "Reconnect" prompt at next sync.

## Related

- [Props](/concepts/props/) — what consumes installations.
- [Tricks](/concepts/tricks/) — CI consumers.
