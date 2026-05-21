---
name: playbook-nginx-static
description: Use to convert a static-image Compose service (nginx serving HTML, prebuilt SPA) into a one-service public Fibe template - the minimum viable conversion.
---

# Playbook: nginx static site

The simplest Fibe template: one static service, one image, one expose label.

## Input

```yaml
version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./public:/usr/share/nginx/html:ro
    restart: unless-stopped
```

## Output (basic)

```yaml
services:
  web:
    image: nginx:alpine
    restart: unless-stopped
    labels:
      fibe.gg/expose: external:80

x-fibe.gg:
  metadata:
    description: "Static nginx server"
    category: "Web"
```

## What changed

| Before | After | Why |
|---|---|---|
| `ports: ["80:80"]` | `fibe.gg/expose: external:80` | Routed through Traefik |
| `volumes: - ./public:/usr/share/nginx/html:ro` | dropped | Host-path bind isn't portable across Marquees |

If you have actual HTML files to ship, two options:

### Option A — inline content via `configs:` (small)

```yaml
services:
  web:
    image: nginx:alpine
    restart: unless-stopped
    configs:
      - source: index_html
        target: /usr/share/nginx/html/index.html
    labels:
      fibe.gg/expose: external:80

configs:
  index_html:
    content: |
      <!doctype html>
      <html>
        <head><title>Hello</title></head>
        <body><h1>Hello, Fibe!</h1></body>
      </html>

x-fibe.gg:
  metadata:
    description: "Inline-content nginx demo"
    category: "Web"
```

See [recipe-configs-block](recipe-configs-block.md).

### Option B — repo-backed (source-mounted)

```yaml
services:
  web:
    image: nginx:alpine
    restart: unless-stopped
    labels:
      fibe.gg/repo_url: https://github.com/owner/site
      fibe.gg/source_mount: /usr/share/nginx/html
      fibe.gg/expose: external:80
      fibe.gg/production: "false"

x-fibe.gg:
  metadata:
    description: "Static site from GitHub repo"
    category: "Web"
```

Whatever's at the repo root gets mounted into the nginx serving dir.

### Option C — pre-built image

If the site is built and pushed to a registry (CI workflow):

```yaml
services:
  web:
    image: ghcr.io/owner/site:$$var__TAG
    restart: unless-stopped
    labels:
      fibe.gg/expose: external:80

x-fibe.gg:
  variables:
    TAG:
      name: "Image tag"
      default: "latest"
      validation: "/^[A-Za-z0-9_.-]+$/"
  metadata:
    description: "Pre-built static site"
    category: "Web"
```

## With custom subdomain at launch

```yaml
services:
  web:
    image: nginx:alpine
    restart: unless-stopped
    labels:
      fibe.gg/expose: external:80
      fibe.gg/subdomain: $$var__SUBDOMAIN

x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "site"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
  metadata:
    description: "Static nginx — pick your subdomain"
    category: "Web"
```

## Root subdomain

For a "this is the marquee's only app" deployment:

```yaml
labels:
  fibe.gg/expose: external:80
  fibe.gg/subdomain: "@"
```

URL becomes `https://<root-domain>/`, no leftmost label.

## Pitfalls

- **Forgetting to omit `ports:`** — schema accepts, but Traefik can't route until you remove it. Always remove.
- **Mounting a host path** — won't exist on the Marquee. Use `configs:`, source mount, or pre-built image.
- **Bind-mounting `/etc/nginx/nginx.conf` from host** — same issue. Use `configs:` to ship the nginx config inline.

## Related skills

[recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-configs-block](recipe-configs-block.md), [recipe-source-mount](recipe-source-mount.md), [recipe-add-subdomain](recipe-add-subdomain.md), [convert-compose-to-fibe](convert-compose-to-fibe.md).
