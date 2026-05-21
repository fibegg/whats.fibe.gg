---
title: Go library
description: Embed Fibe in your own Go programs. Client construction, resource managers, auto-retry, circuit breaker, idempotency, structured errors.
slug: /sdk/go-library
sidebar_position: 5
sidebar_label: Go library
image: /img/og/sdk-go-library.png
keywords: [fibe Go library, github.com/fibegg/sdk/fibe, retry, circuit breaker, idempotency, rate limit]
---

The Go library at `github.com/fibegg/sdk/fibe` is the same code the CLI uses internally — same retries, same circuit-breaker, same rate-limit handling, same structured errors. Embed it in your own Go programs when you want fine-grained control without shelling out to the CLI.

This page is the orientation. Per-method API docs live at [pkg.go.dev/github.com/fibegg/sdk/fibe](https://pkg.go.dev/github.com/fibegg/sdk/fibe).

## Install the library

```sh
go get github.com/fibegg/sdk/fibe
```

Pin to a tag for reproducible builds. The library follows semver.

## Construct a client

```go
package main

import (
    "context"
    "log"
    "os"
    "github.com/fibegg/sdk/fibe"
)

func main() {
    client, err := fibe.NewClient(
        fibe.WithAPIKey(os.Getenv("FIBE_API_KEY")),
        // optional:
        fibe.WithDomain("https://fibe.gg"),
        fibe.WithTimeout(30*time.Second),
        fibe.WithUserAgent("my-app/1.2"),
    )
    if err != nil { log.Fatal(err) }

    ctx := context.Background()
    user, err := client.Me(ctx)
    if err != nil { log.Fatal(err) }
    log.Printf("logged in as %s", user.Email)
}
```

`NewClient` reads from the same `~/.config/fibe/` profile system the CLI uses when no `WithAPIKey` is supplied. So the same machine, with the same profile active, gives you the same identity.

## Resource managers

Each resource family hangs off the client:

| Manager | Operates on |
| --- | --- |
| `client.Playgrounds` | Playgrounds (long-running environments) |
| `client.Tricks` | One-shot job runs |
| `client.Playspecs` | Launch blueprints |
| `client.Agents` | Genies |
| `client.Templates` | Reusable environment recipes |
| `client.Props` | Connected Git repositories |
| `client.Marquees` | Docker hosts |
| `client.Secrets` | Secret Vault entries |
| `client.JobEnv` | Job ENV entries |
| `client.APIKeys` | Your own API keys |
| `client.Webhooks` | Outbound event subscriptions |
| `client.Artefacts` | Generated outputs |
| `client.Mutters` | Progress notes |
| `client.Feedbacks` | Reviews on artefacts |
| `client.AuditLogs` | Read-only history |
| `client.Monitor` | Live event stream |

The common shape of a manager is:

```go
type PlaygroundsManager interface {
    List(ctx context.Context, opts ListOptions) ([]Playground, error)
    Get(ctx context.Context, idOrName string) (*Playground, error)
    Create(ctx context.Context, in *PlaygroundCreate) (*Playground, error)
    Update(ctx context.Context, id int64, patch *PlaygroundPatch) (*Playground, error)
    Delete(ctx context.Context, id int64) error

    Rollout(ctx context.Context, id int64) (*Playground, error)
    HardRestart(ctx context.Context, id int64) (*Playground, error)
    Stop(ctx context.Context, id int64) (*Playground, error)
    Start(ctx context.Context, id int64) (*Playground, error)
    Logs(ctx context.Context, id int64, opts LogOptions) (io.ReadCloser, error)
    Wait(ctx context.Context, id int64, status string, timeout time.Duration) (*Playground, error)
}
```

(Exact signatures live in godoc. The shape above is the pattern.)

## Built-in robustness

You don't manage retries or backoff yourself. The default configuration includes:

- **Automatic retry** on transient errors (5xx, network resets) with exponential backoff and jitter.
- **Idempotency-key generation** for `Create` and `Update` — safe to call the same method twice in a row.
- **Circuit breaker** that opens when the upstream is sustained-failing, so your program doesn't hammer a sick API.
- **Rate-limit awareness** — when the server returns a rate-limit header, the client sleeps for the indicated retry-after window.
- **Structured errors** — every error implements an interface that lets you ask `IsNotFound(err)`, `IsRateLimited(err)`, `RequestID(err)`, etc., instead of string-matching.

You can swap any of these by passing options to `NewClient`. Example: a tighter retry policy for a CI runner that should fail fast:

```go
client, _ := fibe.NewClient(
    fibe.WithAPIKey(key),
    fibe.WithRetryPolicy(fibe.RetryPolicy{Max: 1, BaseDelay: 200 * time.Millisecond}),
)
```

## Example — launch a Playground and stream logs

```go
ctx := context.Background()

pg, err := client.Playgrounds.Create(ctx, &fibe.PlaygroundCreate{
    Name:       "demo",
    PlayspecID: 42,
    MarqueeID:  1,
})
if err != nil { log.Fatal(err) }

// Wait until it's reachable.
if _, err := client.Playgrounds.Wait(ctx, pg.ID, "running", 5*time.Minute); err != nil {
    log.Fatal(err)
}

// Stream logs.
stream, err := client.Playgrounds.Logs(ctx, pg.ID, fibe.LogOptions{Follow: true, Service: "web"})
if err != nil { log.Fatal(err) }
defer stream.Close()
io.Copy(os.Stdout, stream)
```

## Example — trigger a Trick and report results

```go
trick, err := client.Tricks.Trigger(ctx, &fibe.TrickTrigger{
    PlayspecID: 99,
    Vars:       map[string]string{"BRANCH": "main"},
})
if err != nil { log.Fatal(err) }

final, err := client.Tricks.Wait(ctx, trick.ID, "completed", 30*time.Minute)
if err != nil { log.Fatal(err) }

if final.Status != "completed" || final.ExitCode != 0 {
    log.Fatalf("trick failed: exit %d", final.ExitCode)
}
```

## Testing with `fibetest`

The `github.com/fibegg/sdk/fibetest` package ships a mock client and a transport that records HTTP traffic for table-driven tests. Use it to test code that calls the SDK without touching a real Fibe.

```go
import "github.com/fibegg/sdk/fibetest"

func TestMyFlow(t *testing.T) {
    rec := fibetest.New(t)
    rec.OnGet("/api/playgrounds/12").Respond(fibetest.JSON(`{"id":12,"name":"demo","status":"running"}`))

    client := rec.Client()
    pg, _ := client.Playgrounds.Get(context.Background(), "12")
    if pg.Status != "running" { t.Fatal("expected running") }
}
```

Tests run offline; no network, no Fibe account needed.

## Concurrency

The client is safe to share across goroutines. Each call is independent; the rate limiter and circuit breaker coordinate across goroutines so you don't have to.

For workloads doing many parallel calls, increase `WithMaxConcurrency` or wrap calls in `errgroup.Group` — the client respects context cancellation.

## When the CLI is enough

You don't have to embed the library for every job. If you're doing one-off automation, the CLI with `-o json` and a bit of `jq` is often simpler:

```sh
fibe playgrounds list -o json --only id,status | jq '.[] | select(.status=="error")'
```

Reach for the Go library when you need typed responses, structured error handling, or you're embedding Fibe deep in another product.

## Next step

For AI agents that should drive Fibe themselves, [run the MCP server](/sdk/mcp-server/) and let them call typed tools.
