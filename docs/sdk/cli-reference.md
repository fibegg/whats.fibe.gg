---
title: CLI reference
description: Every fibe command grouped by resource family. Playgrounds, Tricks, Agents, Templates, repos, secrets, monitoring, and the lower-level utilities.
slug: /sdk/cli-reference
sidebar_position: 4
sidebar_label: CLI reference
image: /img/og/sdk-cli-reference.png
keywords: [fibe CLI, playgrounds, tricks, agents, templates, marquees, secrets, webhooks, audit logs, JSON output]
---

`fibe` follows a `fibe <resource> <action> [flags]` pattern. This page is the reference for every resource family. For deep workflow stories, see [Common workflows](/sdk/workflows/).

Every command supports `--help` (`fibe playgrounds --help`, `fibe playgrounds create --help`). Use it liberally; this page is the overview.

Commands that launch, restart, inspect, stream from, schedule onto, stop, destroy, clean up, or message a Marquee require that Marquee to be funded. Unpaid Marquees return `MARQUEE_NOT_FUNDED`.

## Global flags

These work on every command:

| Flag | Purpose |
| --- | --- |
| `--api-key <key>` | Override the API key for this call. |
| `--domain <url>` | Override the API domain. |
| `--profile <name>` | Use a specific profile for this call. |
| `--debug` | Verbose logging of HTTP traffic. |
| `-o, --output <fmt>` | Output format: `table` (default), `json`, `yaml`. Env: `FIBE_OUTPUT`. |
| `--only <field,field>` | Filter fields in JSON/YAML output. |
| `--page <n>`, `--per-page <n>` | Pagination on list commands. |
| `-f, --from-file <path>` | Load a JSON or YAML payload from a file or `-` for stdin. |
| `--explain-errors` | Print structured error output (tool family, request ID, hint). |

## Playgrounds

Long-running environments. Full lifecycle from the command line.

```sh
fibe playgrounds list
fibe playgrounds get <id|name>
fibe playgrounds create --name "demo" --playspec-id 5
fibe playgrounds update <id> -f patch.json
fibe playgrounds delete <id>

fibe playgrounds rollout <id>              # apply Playspec edits, minimal disruption
fibe playgrounds hard-restart <id>         # stop/start everything
fibe playgrounds stop <id>
fibe playgrounds start <id>
fibe playgrounds maintenance enable <id>
fibe playgrounds maintenance disable <id>
fibe playgrounds extend <id> --by 4h

fibe playgrounds status <id>
fibe playgrounds compose <id>              # the compiled compose for the running env
fibe playgrounds logs <id> [--service web] [--since 10m]
fibe playgrounds env <id>                  # injected env values
fibe playgrounds debug <id>                # comprehensive diagnostics
```

The shorthand `pg` works wherever `playgrounds` does: `fibe pg list`.

## Tricks

One-shot jobs.

```sh
fibe tricks list
fibe tricks trigger --playspec-id 12 --from-file inputs.json
fibe tricks get <id>
fibe tricks logs <id>
```

`fibe tricks trigger` accepts the same payload shape the API does. Use `--explain-errors` if a trigger fails — the error typically points at a missing variable or an unreachable repo.

## Agents (Genies)

```sh
fibe agents list
fibe agents get <id|name>
fibe agents create --name "sys-op" --provider claude-code
fibe agents update <id> -f patch.json
fibe agents delete <id>
fibe agents duplicate <id>                   # clone with a new name

fibe agents chat <id> --text "Hello"         # one-shot message
fibe agents start-chat <id>                  # establish a long-lived session
fibe agents restart-chat <id>
fibe agents purge-chat <id>
fibe agents runtime-status <id>              # reachability, queue depth, last activity
fibe agents watch <id>                       # follow messages in real time

fibe agents upload-attachment <id> --file context.zip
fibe agents download-attachment <id> <name> --to ./context.zip

fibe agents add-mounted-file <id> --path docs/style.md --content @style.md
fibe agents update-mounted-file <id> <file-id> -f patch.json
fibe agents remove-mounted-file <id> <file-id>

fibe agents pokes <id>                       # list pokes attached
fibe agents messages <id>                    # message history
fibe agents activity <id>                    # event timeline
fibe agents defaults                         # per-Player defaults for new agents
fibe agents gitea-token <id>                 # mint a short-lived Gitea token
fibe agents authenticate <id>                # device-code re-auth for an agent
```

The shorthand `ag` works wherever `agents` does.

## Playspecs, Props, Marquees, Templates

The bookkeeping resources around a launch.

```sh
fibe playspecs list
fibe playspecs get <id>
fibe playspecs create -f playspec.json

fibe props list
fibe props get <id>
fibe props create --repo-url https://github.com/owner/repo
fibe props delete <id>

fibe marquees list
fibe marquees get <id>
fibe marquees update <id> -f patch.json

fibe templates list
fibe templates get <id>
fibe templates search --query "Rails"
fibe templates launch --template-id <id> --marquee-id <id> --vars KEY=VAL
fibe templates change <id> -f patch.json     # advanced — patch a template
```

`fibe launch` is a top-level convenience wrapper around `fibe templates launch` — useful in shell scripts because it accepts the same flags more concisely.

Template launch, greenfield, tricks, agent chat, and playground commands all require the selected Marquee to be funded.

## Repos & installations

GitHub and Gitea integration.

```sh
fibe github-repos create --owner my-org --name new-repo
fibe gitea-repos create  --owner my-org --name new-repo

fibe github apps connect                     # print the GitHub App install URL
fibe installations list                      # GitHub Apps installed on your account
fibe repo-status <repo-url>                  # is this URL reachable / private / fork
```

## Secrets, Job ENV, API keys, Webhooks

The credentials and event-subscription surfaces.

```sh
fibe secrets list
fibe secrets create --name OPENAI_API_KEY --value "$(pbpaste)"
fibe secrets update <id> -f patch.json
fibe secrets delete <id>

fibe job-env list
fibe job-env create --scope global --name DEPLOY_KEY --value "$(pbpaste)"

fibe api-keys list
fibe api-keys create --name "ci-deploy" --scopes "launch:write" --expires "2026-01-01"
fibe api-keys revoke <id>

fibe webhooks list
fibe webhooks create -f webhook.json
fibe webhooks test <id>
fibe webhooks delete <id>
```

Managing secrets, API keys, and webhooks requires sudo re-auth on the underlying API; the CLI prompts you for your 2FA when needed.

## Artefacts, Mutters, Feedback

The trail your work leaves behind.

```sh
fibe artefacts list
fibe artefacts get <id> --to ./out/         # download an artefact

fibe mutters list
fibe mutter create --playground-id 12 --body "Healthcheck flapping; investigating."

fibe feedbacks list
fibe feedbacks get <id>
```

## Monitoring, audit log, status

```sh
fibe monitor                                # follow live activity stream
fibe monitor --resource playgrounds         # filter by family

fibe audit-logs list
fibe audit-logs get <id>

fibe status                                 # account dashboard
fibe server-info                            # API version, server-side build info
fibe wait playground 12 --status running --timeout 5m
fibe wait trick 99 --status completed --timeout 1h
```

## Greenfield & launch shortcuts

Launch an existing repo config, or use a repo config as a greenfield snapshot template.

```sh
fibe github apps connect

fibe launch owner/repo --marquee-id 12
fibe launch https://github.com/owner/repo --ref main --file deploy/fibe.yml

fibe greenfield owner/repo --marquee-id 12
fibe greenfield owner/repo@feature/foo --name custom-name
```

Both commands discover config files in this order: `fibe.yml`, `fibe.yaml`, `docker-compose.yml`, `docker-compose.yaml`. `--name` is optional and inferred from the repo basename after slug normalization; pass it explicitly when you want a stable custom name. If your account has multiple GitHub App installations, add `--github-account <owner>` or `--github-installation-id <id>`.

## Local playground inspection

If you're running a Marquee locally and want to peek at `/opt/fibe/playgrounds`:

```sh
fibe local playgrounds info
fibe local playgrounds link <id>            # symlink into the current directory
```

## Schema introspection

For agents (or you) who want to know what fields a resource has:

```sh
fibe schema list                            # all resource families
fibe schema show playground                 # show JSON schema for one
```

## Config & utility

```sh
fibe config get                             # dump the current config
fibe config set output yaml                 # change defaults
fibe doctor                                 # self-check
fibe version
fibe docs                                   # open docs in a browser
```

## Output formats

For scripts, switch to JSON:

```sh
fibe playgrounds list -o json | jq '.[].id'

# Filter to specific fields
fibe playgrounds list -o json --only id,name,status
```

Combine with `jq` for ad-hoc analysis, or pipe `-o yaml` to `yq` for richer queries.

## Reading commands from a file

The `-f` flag accepts a path, `-` for stdin, or `@path` for templated input. Useful when you've assembled a payload from another tool:

```sh
echo '{"name":"demo","playspec_id":5}' | fibe playgrounds create -f -
fibe agents update sys-op -f /tmp/sys-op-patch.yaml
```

## Next step

For programmatic access, the [Go library](/sdk/go-library/) gives you the same surface in Go. For AI agents, the [MCP server](/sdk/mcp-server/) exposes 42 typed tools.
