---
name: fibe-tool-local-playgrounds-info
description: Use when you need to get filesystem-level info about one local Playground (name, path, playspec, mounts) without an API call.
---

# fibe_local_playgrounds_info

[MODE:BROWNFIELD] Read-only, idempotent. Tier: local.

Returns local Playground names, URLs, source mounts, or full metadata from the local Marquee filesystem. No Rails API call.

## When to use
- Discover local Playgrounds with `view:"names"`.
- Discover service URLs with `view:"urls"`.
- Discover per-service source mount paths with `view:"mounts"`.
- Confirm a local Playground's compose project name / paths.
- Pre-flight before `fibe_local_playgrounds_link` to verify the target.
- Mapping a name to its mount directory for ad-hoc shell debugging.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `view` | string | yes | `names`, `urls`, `mounts`, or `details` |
| `playground` | string | conditional | Local playground ID, name, compose project, playspec, or unique playspec prefix. Omit for `view:"names"` |
| `playground_id` | number | conditional | Local numeric Playground ID. Omit for `view:"names"`. Pass either `playground` or `playground_id`, not both |

## Output
Native structured MCP data, not a cobra `stdout` envelope.

`view:"names"`:
```json
[{ "id": "42", "name": "demo-app--42", "playspec": "demo-app", "path": "/opt/fibe/playgrounds/demo-app--42" }]
```

`view:"urls"`:
```json
[{ "service": "web", "url": "web.phoenix.test" }]
```

`view:"mounts"`:
```json
[{ "service": "web", "mount": "/opt/fibe/playgrounds/demo-app--42/props/acme--demo-app/main", "prop": "demo-app", "branch": "main" }]
```

`view:"details"` returns the full local Playground object with service metadata.

## Gotchas
- `view:"names"` does not accept a target selector.
- `urls`, `mounts`, and `details` require one target selector.
- Numeric selectors match the local compose project suffix (`<name>--<id>`), not a Rails query.
- Ambiguous playspec prefixes return an error listing candidates.
- Filesystem-only — local data may be stale if the Playground has been remotely deleted.

## Related
- `fibe_local_playgrounds_link` — symlink for `/app/playground`.
