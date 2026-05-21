---
title: Authentication & profiles
description: Two login flows — API key or browser device-code. Multiple profiles for switching between accounts and environments. Env-var fallbacks for CI.
slug: /sdk/authentication
sidebar_position: 3
sidebar_label: Authentication
image: /img/og/sdk-authentication.png
keywords: [fibe login, fibe auth, profiles, API key, device code, FIBE_API_KEY, CI authentication]
---

The CLI, Go library, and MCP server all authenticate the same way: every call carries either an API key (preferred for automation) or a session token obtained through a browser login (preferred for interactive use).

You can keep multiple credentials at once — staging, production, a teammate's view — by giving each one a **profile name**. Switching between them is one command.

## Two ways to log in

### Browser device-code (interactive)

```sh
fibe auth login
```

The CLI prints a short code and opens your browser to a Fibe URL. You confirm the code in the browser, the CLI polls for completion, and your session is stored on disk. No API key to copy around; the flow handles minting a token for you.

This is the right path on a personal machine.

### API key (scripted / CI / agent-accessible)

If you already have an API key (created from your account's [API keys page](/advanced/api-keys/)):

```sh
fibe login --api-key "fibe_live_yourkeyhere"
```

This validates the key against `/api/me`, saves it to your profile, and is ready immediately. Good for CI runners, scripts, and AI agents that need a stable credential.

You can pre-set the key without an interactive prompt by piping it on stdin or via the env var (see "Environment variables" below).

## Profiles

A profile is a named bundle of `{api_key | session_token, domain, default_marquee?}`. Profiles let you switch between accounts and environments without re-logging-in.

```sh
fibe auth list             # show profile names
fibe auth use staging      # switch the active profile
fibe auth status           # who am I, which profile, which domain
fibe --profile staging playgrounds list   # one-off override
fibe logout                # forget the active profile
```

Common patterns:

- A `default` profile for your main account.
- A `staging` profile pointing at a non-production Fibe deployment.
- A `ci-readonly` profile holding a restricted API key for scripted reads.

## Where credentials live

Credentials are stored under `~/.config/fibe/`:

| File | Contents |
| --- | --- |
| `credentials.json` | API keys and session tokens (the secret stuff) |
| `config.json` | Profile metadata: names, domains, default marquee, last-used timestamp |

Treat `credentials.json` like an SSH private key: never commit it, never paste it into a chat. The Go library and the MCP server read the same files when run on the same machine.

## Environment variables

Useful for CI, Docker containers, and anywhere a profile on disk isn't available:

| Variable | Purpose |
| --- | --- |
| `FIBE_API_KEY` | API key to use. Overrides whatever's in the active profile. |
| `FIBE_DOMAIN` | API domain. Defaults to `https://fibe.gg`. Useful for staging/local. |
| `FIBE_OUTPUT` | Default output format (`table` / `json` / `yaml`). |
| `FIBE_MCP_TOOLS` | Which tool surface to expose (`full`, `core`, or a comma-separated list of tiers). |
| `FIBE_MCP_YOLO` | Set to `1` to skip the confirmation gate on destructive MCP tools. |
| `FIBE_MCP_REQUIRE_AUTH` | Multi-tenant MCP: reject requests without `Authorization: Bearer`. |

When env vars are set, they take precedence over the active profile. When neither is set, the CLI uses the active profile. When neither is set **and** there's no active profile, every call fails with a clear "you need to log in" error.

## CI usage

A typical GitHub Actions step:

```yaml
- name: Trigger nightly trick
  env:
    FIBE_API_KEY: ${{ secrets.FIBE_API_KEY }}
  run: |
    fibe tricks trigger --playspec-id 42 --from-file inputs.json
```

Mint a **scoped, expiring** API key for CI (see [Granular resource restriction](/advanced/api-keys/)). Don't reuse your personal-account key for automation; it's a bigger blast radius if it leaks.

## Switching domains

For staging or a self-hosted Fibe:

```sh
fibe auth login --domain https://fibe.staging.example.com
# or, ad-hoc:
FIBE_DOMAIN=https://fibe.staging.example.com fibe playgrounds list
```

`--profile` and `--domain` can be combined in any CLI call without changing the active profile.

## MCP-mode authentication

When you run `fibe mcp serve` for an AI agent, three auth options stack:

1. **Inherits the active profile** by default. The CLI's `default` profile is the MCP server's identity.
2. **Per-request `Authorization: Bearer <key>` header** when running in HTTP/SSE mode — each requester carries their own credentials.
3. **`fibe_auth_set` tool** — a connected agent can switch credentials at run time without restarting the server.

For a hosted multi-tenant MCP server, set `FIBE_MCP_REQUIRE_AUTH=1` so no one can call tools without supplying a key.

## FAQ

<details>
<summary>How do I rotate an API key?</summary>

Mint a new one in the [API keys page](/advanced/api-keys/), update your profile (`fibe login --api-key NEWKEY`), then revoke the old one. The CLI exits with a clear error if a call uses the revoked key, so you'll know immediately if something is still using it.
</details>

<details>
<summary>Can a Genie use the same credentials as me?</summary>

Only if you've explicitly minted an **agent-accessible** API key — that's a key flag set at creation time. By default, your keys are not exposed to Genies. See [API keys → Keys your Genies can use](/advanced/api-keys/).
</details>

<details>
<summary>What if I forget which profile I'm using?</summary>

`fibe auth status` shows the active profile and what account it points at. `fibe doctor` runs a deeper check.
</details>

<details>
<summary>How does the CLI tell I'm logged in?</summary>

It looks (in order): `FIBE_API_KEY` env var → active profile → fail with "no credentials". Run `fibe doctor` to see exactly what it picked.
</details>

## Next step

You're authenticated. Time for the [CLI reference](/sdk/cli-reference/) — every command, grouped by resource.
