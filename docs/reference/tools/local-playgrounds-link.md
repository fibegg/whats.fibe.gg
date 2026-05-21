---
title: "Local Playgrounds Link"
description: "Use when you need to symlink a local Playground's mounts into a working directory (default /app/playground) so the Agent has direct file access. Brownfield handshake."
slug: /reference/tools/local-playgrounds-link
sidebar_label: "Local Playgrounds Link"
image: /img/og/reference-tools-local-playgrounds-link.png
keywords: ["Fibe", "Tool", "fibe", "tool", "local", "playgrounds", "link"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:BROWNFIELD] Tier: brownfield. Idempotent.

Creates symlinks from `/opt/fibe/playgrounds/<name>/...` (or `MARQUEE_ROOT`) into `link_dir` so the Agent container can edit Playground files directly. Wraps `fibe local playgrounds link <id-or-name> [--link-dir DIR]`.

## When to use
- After `fibe_greenfield_create` (called automatically — manually re-run only when the auto-link failed).
- Switching between Playgrounds within one Agent session.
- Recovering after `/app/playground` symlinks went stale (Playground recreated, paths changed).

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground` | string | conditional | Local playground ID, name, compose project, playspec, or unique playspec prefix |
| `playground_id` | number | conditional | Local numeric Playground ID. Pass either `playground` or `playground_id`, not both |
| `link_dir` | string | no | Target directory; default `/app/playground` |

## Output
Cobra-run envelope. `stdout` typically lists the created symlinks.

## Behavior
1. Resolves the target Playground locally (discover candidates with `fibe_local_playgrounds_info(view:"names")`).
2. Removes prior symlinks under `link_dir` that pointed to a different Playground.
3. Creates fresh symlinks for each mount slot — typically the Prop checkout, optional secondary repos, and shared volumes.

## Gotchas
- If the Playground was recreated, paths under `/opt/fibe/playgrounds/<name>` may have changed; re-link to refresh.
- `link_dir` must be writable by the Agent process — `/app/playground` is the standard mount and works in default Agent images.
- Files written through `link_dir` land in the real Marquee filesystem and become visible to the Playground's containers immediately (live-reload territory). Load the `fibe-live-reload` skill.
- Linking a Playground that doesn't exist locally errors; pre-flight with `fibe_local_playgrounds_info(view:"names")`.

## Related
- `fibe_local_playgrounds_info(view:"names")` — find target names.
- `fibe_local_playgrounds_info(view:"mounts")` — confirm source paths.
- `fibe-live-reload` skill — live editing semantics.
- `fibe_greenfield_create` — auto-links on success.
