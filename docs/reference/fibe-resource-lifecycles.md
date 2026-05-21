---
title: "Resource Lifecycles"
description: "Use to explain how Fibe resources are created, updated, launched, shared, stopped, completed, upgraded, or retired from a user-facing perspective."
slug: /reference/fibe-resource-lifecycles
sidebar_label: "Resource Lifecycles"
image: /img/og/reference-fibe-resource-lifecycles.png
keywords: ["Fibe", "Foundation", "fibe", "resource", "lifecycles"]
tags: ["reference", "foundation"]
format: md
---

Use this skill when a task depends on resource state, launch order, updates, cleanup, or safe user-facing behavior.

## Marquee lifecycle

A Marquee starts as a host connection or a platform-managed tutorial request.

Typical lifecycle:

1. User adds or receives a Marquee.
2. Fibe stores connection settings and root-domain information.
3. User tests connection.
4. Marquee becomes available for Playgrounds and standalone Genie chats.
5. User may update display name, domains, TLS settings, registry credentials, or status.
6. If disabled or failing, new launches should avoid it.
7. If deleted, dependent running environments must be stopped or moved first.

Tutorial Marquees add provisioning progress, stricter cleanup, and fix-redeploy controls.

## Prop lifecycle

A Prop starts when the user creates or connects a repository.

Typical lifecycle:

1. User creates a built-in repository or imports an existing GitHub repository.
2. Fibe discovers branches and repository metadata.
3. Fibe detects useful files such as Docker Compose and example environment files.
4. Templates and dynamic services can use the Prop as source.
5. Push events refresh branches, build records, notifications, source-linked templates, and job triggers.
6. Users may commit Playground changes back to the repository from the UI.
7. Disabled or errored Props should not be used for new source-backed launches until fixed.

Props are user-scoped. Two users can connect the same repository independently.

## Template lifecycle

A Template is the reusable definition. A Template Version is the immutable launch body.

Typical lifecycle:

1. User creates, imports, forks, or discovers a Template.
2. User publishes a new Template Version with YAML, variables, metadata, and optional automation settings.
3. New launches default to the latest suitable version.
4. Existing Playspecs keep their original version until the user upgrades or switches them.
5. Source-linked Templates can publish a new version when the tracked source file changes.
6. Public versions can appear in a marketplace; private versions stay in the user's templates.
7. Forks are independent copies for customization.

Changes become new versions.

## Playspec lifecycle

A Playspec is a launch blueprint derived from a Template Version plus launch choices.

Typical lifecycle:

1. User chooses a Template, target Marquee, branch/source settings, variables, mounted files, service settings, and persistence options.
2. Fibe validates and compiles the template into a runnable environment plan.
3. The Playspec can create a Playground or Trick.
4. Playspec edits are allowed, but changes affect running Playgrounds only after rollout, restart, deploy, or reconciliation.
5. If a Playspec uses persistent volumes, warn before renaming services or volume keys because volume names tie data to service shape.
6. A Playspec can switch to another Template Version, with preview or bulk upgrade flows when available.

## Playground lifecycle

A Playground is a running environment.

Common statuses:

| Status | User-facing meaning |
| --- | --- |
| `pending` | Launch was requested and is waiting to start. |
| `in_progress` | Fibe is preparing source, images, routing, and services. |
| `running` | Services are up and the Playground can be used. |
| `error` | Launch or runtime setup failed. Inspect logs and retry after fixing. |
| `has_changes` | Linked source has changed and a rollout or restart may be needed. |
| `completed` | A job-mode Playground finished. |
| `stopping` | Stop is in progress. |
| `stopped` | Services are stopped but the Playground record remains restartable. |
| `destroying` | Cleanup is in progress. |

Main actions:

- Rollout: apply changes with minimal disruption; unchanged services usually stay running.
- Restart: stop and start the whole environment; use for corrupted state or major shape changes.
- Stop: stop services while preserving the resource record.
- Destroy: remove the Playground.
- Extend expiration: keep a temporary environment alive longer.
- Retry: re-run failed creation after fixing configuration or infrastructure.
- Attach or detach Agent: add or remove Genie support.

Data safety:

- Named volumes preserve service data across restarts when persistence is enabled.
- Restart may pull fresh images for floating tags.
- Rollout is safer for stateful support services because unchanged containers can remain running.
- Container-local files are disposable unless backed by a volume, repository, artefact, or mounted file.

## Trick lifecycle

A Trick is a job-mode Playground.

Typical lifecycle:

1. User launches manually, schedule fires, or VCS trigger matches.
2. Fibe starts services with job-mode constraints.
3. Watched services run until they exit.
4. If every watched service exits successfully, the Trick succeeds.
5. If any watched service exits non-zero, the Trick fails.
6. Logs and result information are captured.
7. Services are cleaned up automatically.

Use Tricks for tasks that finish. Do not use Tricks for web apps, dashboards, dev servers, or watchers that should stay alive.

## Agent lifecycle

An Agent is a stored Genie configuration.

Common statuses:

| Status | User-facing meaning |
| --- | --- |
| `pending` | Created but not ready to use. |
| `authenticated` | Credentials are available and valid. |
| `expired` | Credentials need refresh. |
| `revoked` | Credentials were removed or invalidated. |
| `deleting` | Removal is in progress and the Agent should not be used for new work. |

Agents can be duplicated, configured, given mounted files, and used for standalone chat or attached to a Playground.

## Webhook lifecycle

Webhook endpoints are created with a URL, event selection, optional filters, and a signing secret. They can be tested, enabled, disabled, updated, or deleted.

Delivery attempts are recorded. Repeated failures can disable an endpoint until the user fixes the receiver.

## Secret and Job ENV lifecycle

Secrets are long-lived encrypted values. Create them for credentials that Genies or workflows need without putting values in source code or templates.

Job ENV entries apply to job-mode runs. Use global entries for every Trick and Prop-scoped entries for one repository's job runs.

## Related skills

- [fibe-product-map](fibe-product-map.md)
- [fibe-agents-and-automation](fibe-agents-and-automation.md)
- [decide-job-mode](decide-job-mode.md)
- [decide-zero-downtime](decide-zero-downtime.md)
- [recipe-named-volumes](recipe-named-volumes.md)
