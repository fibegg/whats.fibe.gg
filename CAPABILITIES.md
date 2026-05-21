# Fibe Skills Capabilities

This file lists what an LLM agent can do after loading the right `fibe-skills` files. It is a capability map for this repository, not a source-code map.

## Product Understanding

| Capability | Primary skills |
| --- | --- |
| Explain Fibe's user-facing product model and core nouns | [skills/fibe-product-map.md](skills/fibe-product-map.md), [skills/glossary.md](skills/glossary.md) |
| Describe the end-to-end path from repository to running environment | [skills/fibe-product-map.md](skills/fibe-product-map.md), [skills/fibe-resource-lifecycles.md](skills/fibe-resource-lifecycles.md) |
| Choose whether a user needs a Marquee, Prop, Template, Playspec, Playground, Trick, Agent, Secret, Webhook, or API Key | [skills/fibe-product-map.md](skills/fibe-product-map.md), [skills/fibe-feature-surface.md](skills/fibe-feature-surface.md) |
| Explain feature areas without leaking implementation details | [skills/fibe-feature-surface.md](skills/fibe-feature-surface.md) |
| Describe safe resource lifecycle behavior, including expiration, rollouts, hard restarts, versioning, and job completion | [skills/fibe-resource-lifecycles.md](skills/fibe-resource-lifecycles.md) |
| Explain collaboration, access, security, billing access, and integrations | [skills/fibe-security-access-and-integrations.md](skills/fibe-security-access-and-integrations.md) |

## Fibe Feature Capabilities

An agent can explain or guide a user through:

- Creating and managing Players, sessions, sudo verification, TOTP, recovery codes, and WebAuthn security keys.
- Creating Teams, inviting members, assigning roles, and sharing resources with read or manage access.
- Managing subscriptions, plan allowances, referral or invitation access, and wallet-style platform credits at a user-facing level.
- Connecting user-managed or platform-managed Marquees for Docker-based environments.
- Configuring DNS, TLS, public routes, internal routes, wildcard certificates, and local/direct routing.
- Connecting GitHub or built-in Git repositories as Props, selecting branches, detecting Compose files, and tracking code changes.
- Creating reusable Templates and immutable Template Versions.
- Launching Templates into Playspecs and Playgrounds.
- Publishing, discovering, forking, and launching community Templates through Fleet, Bazaar, or Pantry-style flows.
- Running long-lived Playgrounds with logs, service URLs, debug terminals, rollout, hard restart, stop, retry, and expiration controls.
- Running one-shot Tricks for tests, migrations, backups, CI repair, scheduled tasks, VCS-triggered tasks, and mutation-testing repair loops.
- Creating AI Genies, authenticating providers, starting standalone chats, attaching Genies to Playgrounds, and using mounted files.
- Using Bridge as a unified Genie/chat workspace.
- Handling artefacts, feedback, mutters, public build-in-public timelines, and live activity feeds.
- Creating API keys with scopes, granular restrictions, expiry, rate limits, and optional agent access.
- Storing sensitive values in Secret Vault and wiring Job ENV values into job-mode runs.
- Creating webhooks with event filters, HMAC signatures, delivery history, retries, and SSRF-safe delivery rules.
- Reading audit logs, monitoring live status, receiving notifications, and using data export/import for portability.

## Compose Template Capabilities

An agent can convert Docker Compose into Fibe templates that:

- Preserve valid Docker Compose structure while adding Fibe behavior.
- Use `fibe.gg/expose` for public or internal HTTP routing.
- Use `fibe.gg/subdomain` and `fibe.gg/path_rule` for host and path routing.
- Convert `ports:` to Fibe-managed routing where appropriate.
- Preserve internal-only services such as databases, caches, queues, and utility containers.
- Use `fibe.gg/repo_url`, `fibe.gg/branch`, `fibe.gg/dockerfile`, `fibe.gg/build_target`, and `fibe.gg/build_args` for source-backed builds.
- Use `fibe.gg/source_mount`, `fibe.gg/start_command`, and `fibe.gg/production: "false"` for live development mode.
- Decide static image services versus dynamic source-backed services.
- Add zero-downtime rollout labels and optional healthcheck tuning labels only when the service can support them.
- Use `deploy.replicas` for scale and expose replica count as a launch variable when useful.
- Rewrite incompatible Compose keys such as host `ports:`, fixed container names, and host-only bind mounts.
- Use named volumes for durable data.
- Use `depends_on` conditions for startup ordering.
- Use YAML anchors and aliases to keep large templates readable.
- Use Compose `configs:` for small inline configuration files.
- Extract Compose `${VAR}` values into `x-fibe.gg.variables`.
- Use whole-node `path` / `paths` bindings for typed substitutions.
- Use inline `$$var__NAME`, `$$random__NAME`, and `$$root_domain` interpolation when the variable is part of a larger string.
- Mark variables as required, random, secret, sensitive, validated, or defaulted.
- Decide whether a credential belongs in a launch variable, Secret Vault, or Job ENV.
- Add metadata needed for reusable or publishable templates.
- Validate templates and map errors to concrete fixes.

## Job And Automation Capabilities

An agent can build templates for:

- Long-running web or worker stacks.
- One-shot job-mode Tricks that complete when watched services exit.
- Cron-style scheduled jobs using `metadata.schedule_config`.
- VCS-triggered jobs using `metadata.trigger_config` for push or pull-request events.
- CI test runners that capture pass/fail results.
- Agent-assisted CI repair flows that feed logs into a Genie.
- Mutation-testing flows that send surviving mutations to a Genie.
- Database backup, cleanup, migration, and data-processing tasks.

## Security And Integration Capabilities

An agent can explain or configure:

- Session expiry, trust, sudo mode, 2FA, WebAuthn, and recovery behavior.
- API key scope families and granular restrictions.
- Team roles and shared-resource permissions.
- Secret Vault versus template variables versus Job ENV.
- Webhook event families, filters, signatures, retries, and safety rules.
- Audit logs and actor context at a product level.
- Data portability exports/imports and rollback choices.
- Notification preferences, in-app notifications, web push, and commit notifications.

## Skill-by-Skill Index

| Skill | Agent capability |
| --- | --- |
| `fibe-product-map` | Build a correct mental model of Fibe's product topology and normal user journey. |
| `fibe-feature-surface` | Answer "what can Fibe do?" and choose which feature area applies. |
| `fibe-resource-lifecycles` | Explain how resources are created, updated, shared, stopped, completed, upgraded, or retired. |
| `fibe-agents-and-automation` | Work with Genies, chats, artefacts, mutters, feedback, job mode, schedules, triggers, CI repair, and mutation repair. |
| `fibe-security-access-and-integrations` | Explain auth, teams, API keys, secrets, webhooks, audit logs, data portability, notifications, and plan access. |
| `glossary` | Resolve Fibe terms quickly without reading multiple skills. |
| `convert-compose-to-fibe` | Orchestrate a full Compose-to-Fibe conversion. |
| `decide-static-vs-dynamic` | Classify each service as image-only or source-backed. |
| `decide-exposure-strategy` | Choose public, internal, path-based, root, or no exposure. |
| `decide-zero-downtime` | Decide whether a service should use rolling updates. |
| `decide-job-mode` | Choose long-running, one-shot, scheduled, or VCS-triggered execution. |
| `decide-secrets-and-randoms` | Decide where credentials and generated values belong. |
| `reference-fibe-labels` | Look up every supported `fibe.gg/*` label and its value rules. |
| `reference-x-fibe-gg-namespace` | Look up `x-fibe.gg` variables, metadata, job, schedule, trigger, and mutation-testing blocks. |
| `reference-template-variables` | Author variable declarations and interpolation safely. |
| `reference-yaml-paths` | Bind variables to whole YAML nodes with `path` and `paths`. |
| `reference-validation-pipeline` | Understand which validation layer catches which problem. |
| `reference-runtime-implied-semantics` | Predict behavior implied by labels and template shape. |
| `recipe-ports-to-expose` | Replace host ports with Fibe HTTP routing. |
| `recipe-add-subdomain` | Set service hostnames, including root-domain routing. |
| `recipe-add-path-rule` | Share a hostname across services using allowed path matchers. |
| `recipe-zero-downtime-healthcheck` | Tune optional zero-downtime healthcheck labels when defaults do not match the app. |
| `recipe-replicas-and-scale` | Set or parameterize service replica counts. |
| `recipe-build-to-repo-url` | Convert Compose builds into source-backed Fibe labels. |
| `recipe-build-args-and-target` | Move build args and build targets into Fibe labels. |
| `recipe-source-mount` | Configure live-edit development services. |
| `recipe-env-file` | Point dynamic services at example env files for defaults. |
| `recipe-extract-env-variables` | Turn Compose env interpolation into launch variables. |
| `recipe-inline-variables` | Use inline variable tokens inside strings. |
| `recipe-whole-node-paths` | Use variable paths for complete YAML node replacement. |
| `recipe-random-and-secrets` | Generate passwords, mark sensitive inputs, and avoid leaking secrets. |
| `recipe-strip-incompatible-keys` | Remove or rewrite Compose fields that conflict with Fibe routing or scale. |
| `recipe-anchors-and-aliases` | Keep large templates compact with YAML anchors. |
| `recipe-configs-block` | Inline small config files with Compose `configs:`. |
| `recipe-named-volumes` | Preserve durable service data with named volumes. |
| `recipe-depends-on` | Model startup ordering and setup steps. |
| `recipe-add-metadata` | Add publish-ready descriptions, categories, and source defaults. |
| `mode-job-trick` | Build one-shot job templates. |
| `mode-schedule-cron` | Add cron scheduling to job templates. |
| `mode-trigger-vcs` | Add push or pull-request triggers to job templates. |
| `playbook-wikijs` | Convert Wiki.js plus Postgres. |
| `playbook-nginx-static` | Convert a static nginx or prebuilt SPA service. |
| `playbook-rails-app` | Convert a Ruby on Rails app stack as a user workload. |
| `playbook-nodejs-dev` | Convert Node.js dev-mode hot-reload stacks. |
| `playbook-python-app` | Convert FastAPI, Django, or Flask stacks. |
| `playbook-wordpress` | Convert WordPress plus MariaDB or MySQL. |
| `playbook-postgres-app` | Convert a generic web app plus Postgres. |
| `playbook-multi-service` | Convert large stacks with shared configuration. |
| `playbook-cron-scheduled` | Build scheduled backup, cleanup, or sync jobs. |
| `playbook-test-runner` | Build CI-style test runner jobs. |
| `common-errors-and-fixes` | Diagnose common validation, compile, and launch failures. |
| `pantry-publish-checklist` | Final-check reusable templates before publishing. |
