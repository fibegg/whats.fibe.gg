---
title: Troubleshooting
description: Debug mode, common errors, rate limits, the doctor command, schema introspection. What to check when something isn't working.
slug: /sdk/troubleshooting
sidebar_position: 9
sidebar_label: Troubleshooting
image: /img/og/sdk-troubleshooting.png
keywords: [fibe debug, fibe doctor, rate limits, circuit breaker, schema introspection, common errors, MCP errors]
---

What to do when the CLI, library, or MCP server isn't behaving.

## Step one: `fibe doctor`

```sh
fibe doctor
```

The first thing to try, always. It checks:

- Whether you can reach the Fibe API.
- Whether your active profile / `FIBE_API_KEY` is valid.
- Basic environment sanity (binary version, OS, network).

The output points at the actual problem. **If `fibe doctor` is green, the cause is in your code or in the resource you're calling against**, not in the SDK setup.

## Verbose logging

`--debug` makes the CLI dump every HTTP request, response, retry, and circuit-breaker event:

```sh
fibe --debug playgrounds create --name "x" --playspec-id 5
```

For the Go library, set the logger:

```go
client, _ := fibe.NewClient(
    fibe.WithAPIKey(key),
    fibe.WithDebugLogger(log.New(os.Stderr, "[fibe] ", 0)),
)
```

For the MCP server, run it with `FIBE_MCP_DEBUG=1`.

## Structured errors

`--explain-errors` makes the CLI emit a JSON error description instead of a friendly message:

```sh
fibe --explain-errors playgrounds get does-not-exist
```

The structured output includes the tool family, request ID, suggested next action, and any schema-validation details. Useful for AI agents trying to recover from errors.

## Common errors

### "no credentials"

`FIBE_API_KEY` isn't set and there's no active profile. Run `fibe login` or set the env var.

### "401 Unauthorized" / "403 Forbidden"

Your credentials are wrong, expired, or scoped too narrowly. Check:

```sh
fibe auth status     # who am I supposed to be
fibe doctor          # does the API agree
```

If the scope is wrong, mint a key with the right scopes in [API keys](/advanced/api-keys/).

### "429 Too Many Requests" / rate limited

The Fibe API enforces per-account rate limits. The Go library auto-respects the retry-after header; the CLI surfaces a clear message. If you hit this consistently:

- For automation, slow down or batch (use `fibe_pipeline` instead of many separate calls).
- For interactive use, wait a minute.
- If you genuinely need a higher limit, contact support.

### "circuit breaker open"

The library opens a circuit when the upstream is sustained-failing. It re-attempts periodically. If it stays open more than a few minutes, something is wrong with the API or your network. Run `fibe doctor` again.

### "validation failed: missing required field"

The resource creation or update is missing a required field. Use schema introspection to see what's needed:

```sh
fibe schema show playspec | jq '.properties | keys'
```

Or `fibe playspecs create --help` for a CLI-formatted version.

### "broken pipe" / "connection reset" mid-stream

The Playground or Trick has stopped emitting data. For `playgrounds logs --follow`, this usually means the service ended. Run `fibe playgrounds status` to confirm.

### MCP: "Authorization required" but the agent set a header

Double-check the transport (`--transport http` or `sse`, not stdio for multi-tenant). Stdio mode ignores headers and uses the host's default profile.

### MCP: tools list is empty

Likely one of:

- `FIBE_MCP_TOOLS` is set to a tier with no tools.
- The MCP server isn't running (check the client's logs).
- The client's MCP config points at the wrong binary path.

## Schema introspection

When you don't know what shape a resource takes, ask the API:

```sh
fibe schema list                    # all resource families
fibe schema show playground         # JSON schema for one
fibe schema show playspec | yq '.properties.metadata'  # drill down
```

For agents, the same is exposed as `fibe_schema`. Use it liberally before composing a `fibe_resource_mutate` call.

## Looking up a specific tool's error

Every MCP tool's detail page (see the [Tools catalog](/sdk/tools-catalog/)) documents the errors it can return. The `--explain-errors` flag on the CLI does the same.

## "Help me figure out which command to run"

```sh
fibe docs            # open this site in a browser
fibe help            # CLI help
fibe schema list     # resource families
fibe doctor          # is auth/setup OK
```

From an MCP client, the equivalent tools are `fibe_help`, `fibe_schema`, `fibe_doctor`, `fibe_tools_catalog`.

## When to file a bug

If `fibe doctor` is green, your scopes are right, and you've tried with `--debug` and a fresh `fibe login` — and the same call works through the web UI but fails via the SDK — that's a real bug. Open an issue with:

- `fibe version`
- `fibe doctor` output
- `--debug` output of the failing call (redact the API key)
- The expected vs actual behavior

## When you're stuck

Sometimes the fastest answer is a Genie. Open one of your AI assistants with access to the [reference library](/reference/intro/), give it the error message, and have it walk the relevant tool docs. The MCP server's tools (especially [`fibe_doctor`](/reference/tools/doctor/), [`fibe_status`](/reference/tools/status/), [`fibe_schema`](/reference/tools/schema/), and [`fibe_help`](/reference/tools/help/)) are designed for exactly this — they let an agent figure out the platform with you.

## Related

- [Authentication](/sdk/authentication/) — credential setup.
- [Tools catalog](/sdk/tools-catalog/) — every tool with annotations.
- [Common problems & fixes (product-side)](/operate/common-problems/) — errors that come from your template or your Playground, not the SDK.
