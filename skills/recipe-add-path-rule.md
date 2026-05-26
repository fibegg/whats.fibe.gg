---
name: recipe-add-path-rule
description: Use to write `fibe.gg/path_rule` Traefik path matchers (`Path`, `PathPrefix`, `PathRegexp`) when multiple services share a subdomain. Avoid forbidden matchers.
---

# Recipe: `fibe.gg/path_rule`

`fibe.gg/path_rule` lets two or more services share a subdomain by partitioning HTTP traffic on the URL path. Common case: one service answers `/cable` and `/health`; another answers everything else.

## Allowed matchers

ONLY these three Traefik matchers, in any boolean combination with `&&` and `||`:

- `` Path(`/exact/url`) ``
- `` PathPrefix(`/prefix`) ``
- `` PathRegexp(`/users/[0-9]+`) ``

Schema check: value must contain `\b(?:Path|PathPrefix|PathRegexp)\s*\(`.

## Forbidden matchers

Fibe owns the **Host** rule, so these matchers are explicitly rejected by both schema and runtime:

- `Host(...)`, `HostRegexp(...)`, `HostSNI(...)`, `HostSNIRegexp(...)`
- `Headers(...)`, `HeadersRegexp(...)`
- `Method(...)`, `Query(...)`, `ClientIP(...)`

Schema check fails with: `must only contain path matchers, not Host/Headers/Method/Query/ClientIP`.

## Examples

### One specific path, one catch-all

```yaml
services:
  web:
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/subdomain: app
      # no fibe.gg/path_rule — catch-all on app.<root>

  api:
    labels:
      fibe.gg/port: 8080
      fibe.gg/visibility: external
      fibe.gg/subdomain: app                       # same subdomain
      fibe.gg/path_rule: PathPrefix(`/api`)
```

`https://app.<root>/api/...` → `api` service. Everything else → `web`.

### Multiple paths combined

```yaml
services:
  ws:
    labels:
      fibe.gg/port: 8081
      fibe.gg/visibility: external
      fibe.gg/subdomain: app
      fibe.gg/path_rule: Path(`/cable`) || Path(`/health`) || PathPrefix(`/ws`)
```

This sends `/cable`, `/health`, and `/ws...` requests to the websocket service while keeping the rest of the host on the main web service.

### Path regex

```yaml
services:
  legacy:
    labels:
      fibe.gg/port: 5000
      fibe.gg/visibility: external
      fibe.gg/subdomain: app
      fibe.gg/path_rule: PathRegexp(`/v[0-9]+/legacy/.*`)
```

## Backticks vs quotes in path arguments

Traefik's official syntax uses backticks around the path literal: `` Path(`/foo`) ``. Single or double quotes would be ambiguous with YAML and JSON. **Always use backticks.**

In YAML, the entire label value is a string, so backticks need no escaping:

```yaml
fibe.gg/path_rule: Path(`/cable`) || Path(`/health`)
```

If you need to template-interpolate inside the literal, mix in `$$var__NAME`:

```yaml
fibe.gg/path_rule: PathPrefix(`/$$var__PATH_PREFIX`)
```

The schema's `templatedString` rule allows variable markers anywhere in the string.

## Boolean combinations

| Combination | Meaning |
|---|---|
| `Path(`/a`) || Path(`/b`)` | matches `/a` OR `/b` |
| `Path(`/a`) && PathPrefix(`/sub`)` | matches `/a` AND URL begins with `/sub` (rare; `&&` of `Path()` makes little sense) |
| `(Path(`/a`) || Path(`/b`)) && PathPrefix(`/`) | grouped — unusual but supported by Traefik |

In practice, `||` between `Path()` / `PathPrefix()` / `PathRegexp()` is the only combination needed.

## Pattern: catch-all `web` + specific `ws`

This is the most common multi-service-per-subdomain pattern:

```yaml
services:
  web:                                  # default route
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN
      # no path_rule

  ws:                                   # specific
    labels:
      fibe.gg/port: 8081
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN
      fibe.gg/path_rule: Path(`/cable`) || Path(`/health`)
```

Traefik's matchers prefer the more specific rule, so `ws` wins on `/cable` and `/health`; `web` wins elsewhere.

## Pitfalls

- **No path matcher at all** — value like `Host(`foo.bar`)` is rejected. Value MUST contain `Path`, `PathPrefix`, or `PathRegexp`.
- **Wrong quote style** — `Path('/api')` or `Path("/api")` aren't valid Traefik. Use backticks.
- **Trailing slash mismatch** — `PathPrefix(`/api`)` matches `/api` and `/api/x`. `Path(`/api`)` matches ONLY `/api`. Know which you want.
- **Trying to route by Host or Method** — Fibe owns host; the validator rejects. If you need method-based routing, do it in the app.
- **Two services with same `path_rule`** — only one wins; you'll see flapping. Make the rules disjoint.
- **Forgetting `fibe.gg/path_rule` is `req_exposed`** — required-when-exposed in the schema annotation, but the schema doesn't enforce it (presence-only requirement). Set it explicitly when sharing a subdomain.

## Related skills

[recipe-add-subdomain](recipe-add-subdomain.md), [decide-exposure-strategy](decide-exposure-strategy.md), [recipe-inline-variables](recipe-inline-variables.md), [reference-fibe-labels](reference-fibe-labels.md), [playbook-rails-app](playbook-rails-app.md).
