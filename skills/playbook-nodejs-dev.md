---
name: playbook-nodejs-dev
description: Use to convert a Node.js dev-mode docker-compose (live source mount + hot reload via Vite, Next.js, nodemon) into a Fibe template using `fibe.gg/source_mount` and `fibe.gg/production: false`.
---

# Playbook: Node.js dev mode with hot reload

For developers who want to iterate on a Node app live, with the source tree mounted from the repo and the dev server reloading on save.

## Input (typical Node dev compose)

```yaml
version: "3"
services:
  app:
    image: node:22
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    command: npm run dev -- --host 0.0.0.0
    environment:
      NODE_ENV: development
```

## Output (Fibe template)

```yaml
services:
  app:
    image: node:22
    working_dir: /app
    volumes:
      - app_node_modules:/app/node_modules
    environment:
      NODE_ENV: development
    labels:
      fibe.gg/repo_url: $$var__REPO_URL
      fibe.gg/branch: $$var__BRANCH
      fibe.gg/source_mount: /app
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/env_file: .env.example
      fibe.gg/start_command: npm run dev -- --host 0.0.0.0
      fibe.gg/expose: external:5173
      fibe.gg/production: "false"
      fibe.gg/subdomain: $$var__SUBDOMAIN

volumes:
  app_node_modules:

x-fibe.gg:
  variables:
    REPO_URL:
      name: "Repository URL"
      required: true
      default: "https://github.com/owner/repo"
    BRANCH:
      name: "Branch"
      required: true
      default: "main"
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "dev"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
  metadata:
    description: "Node.js dev mode with live source mount and hot reload"
    category: "Development"
    source_defaults: true
```

## Key choices explained

| Decision | Reason |
|---|---|
| `image: node:22` (not built) | Source-mounted dev — image just provides the runtime |
| `volumes: app_node_modules:/app/node_modules` | Named volume layered on top of the source mount so `node_modules/` doesn't leak into the repo |
| `fibe.gg/source_mount: /app` | Bind-mount cloned repo into `/app` |
| `fibe.gg/start_command: npm run dev -- --host 0.0.0.0` | Dev server with watcher; binds 0.0.0.0 |
| `fibe.gg/production: "false"` | Source-mounted mode (no built image) |
| `fibe.gg/expose: external:5173` | Vite's default; change for Next.js (3000), Express (8080), etc. |

## Critical: `node_modules` not in repo

The repo's `.gitignore` MUST list `node_modules/`. Otherwise the cloned source tree ships its own (probably wrong) `node_modules`, which conflicts with the named volume.

The recommended pattern is:

1. `.gitignore` ignores `node_modules/`.
2. Dockerfile runs `npm ci` in a layer (so initial container has them).
3. Named volume `app_node_modules:/app/node_modules` keeps them across restarts.

## Vite-specific (essential for Vite 6+)

Vite 6 added `server.allowedHosts` and rejects unknown hosts. Behind Fibe/Traefik, the request arrives with the Marquee subdomain as `Host`, and Vite returns 403. Add to `vite.config.js`:

```js
export default {
  server: {
    host: '0.0.0.0',
    allowedHosts: true,    // or list specific hosts
  },
};
```

Without this, the container is reachable but the browser sees `Invalid Host header`.

## Framework variants

### Next.js dev

```yaml
labels:
  fibe.gg/start_command: npm run dev -- -H 0.0.0.0
  fibe.gg/expose: external:3000
```

### Express + nodemon

```yaml
labels:
  fibe.gg/start_command: npx nodemon --inspect=0.0.0.0:9229 -- app.js
  fibe.gg/expose: external:3000
```

### Polling for filesystem events (rare)

Some Docker setups don't propagate inotify across bind mounts; the watcher misses changes. Enable polling:

```yaml
services:
  app:
    environment:
      NODE_ENV: development
      CHOKIDAR_USEPOLLING: "true"       # for Vite, nodemon (chokidar-based)
```

## Production variant in same template

```yaml
services:
  app:
    image: node:22
    labels:
      fibe.gg/repo_url: $$var__REPO_URL
      fibe.gg/branch: $$var__BRANCH
      fibe.gg/source_mount: /app
      fibe.gg/start_command: $$var__START_COMMAND
      fibe.gg/expose: external:$$var__PORT
      fibe.gg/production: $$var__PRODUCTION

x-fibe.gg:
  variables:
    PRODUCTION:
      name: "Production mode (built image)"
      default: "false"
    PORT:
      name: "Container port"
      default: "5173"
      validation: "/^[0-9]+$/"
    START_COMMAND:
      name: "Start command"
      default: "npm run dev -- --host 0.0.0.0"
```

Launcher picks dev vs production.

## Adding a database

For a Node app + Postgres:

```yaml
services:
  app:
    # ... as above ...
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://app:$$var__DB_PASS@db:5432/app

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: placeholder
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  app_node_modules:
  db_data:

x-fibe.gg:
  variables:
    DB_PASS:
      name: "Database password"
      required: true
      random: true
      secret: true
      sensitive: true
      paths:
        - services.db.environment.POSTGRES_PASSWORD
    # ... other variables ...
```

## Pitfalls

- **`node_modules` committed to repo** — clone pulls them; volume layers underneath; old versions stick around. Always `.gitignore`.
- **No `0.0.0.0` bind** — container appears running, requests hang. Always add `--host 0.0.0.0` to dev command.
- **Vite 6+ without `allowedHosts`** — 403 from Vite. Set `allowedHosts: true` in `vite.config.js`.
- **Missing Dockerfile** — the source-mount workflow still needs a Dockerfile to build the initial image. Even a stub `FROM node:22\nWORKDIR /app` works.
- **Production mode with source mount labels** — labels stay valid but source mount is unused. Use one or the other.
- **`fibe.gg/start_command: npm start`** when `start` is a build, not a dev server — container exits. Use `npm run dev` or your actual watcher.

## Related skills

[recipe-source-mount](recipe-source-mount.md), [recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-named-volumes](recipe-named-volumes.md), [convert-compose-to-fibe](convert-compose-to-fibe.md). Platform skill `fibe-live-reload` for runtime debugging.
