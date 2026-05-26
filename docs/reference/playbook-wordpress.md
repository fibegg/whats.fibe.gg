---
title: "Wordpress"
description: "Use to convert a WordPress + MariaDB/MySQL docker-compose into a Fibe template - static images, generated DB password, persistent volumes for wp-content and DB data."
slug: /reference/playbook-wordpress
sidebar_label: "Wordpress"
image: /img/og/reference-playbook-wordpress.png
keywords: ["Fibe", "Playbook", "playbook", "wordpress"]
tags: ["reference", "playbook"]
format: md
---

WordPress + a relational DB (MariaDB or MySQL) is a classic two-service Compose template. All-static images, two named volumes, public HTTPS.

## Input (typical WordPress compose)

```yaml
version: "3"
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: wp_password
      WORDPRESS_DB_NAME: wordpress
    depends_on:
      - db
    volumes:
      - wp_data:/var/www/html

  db:
    image: mariadb:11
    environment:
      MARIADB_ROOT_PASSWORD: root_pw
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wp
      MARIADB_PASSWORD: wp_password
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wp_data:
  db_data:
```

## Output (Fibe template)

```yaml
services:
  wordpress:
    image: wordpress:$$var__WP_VERSION
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_DB_PASSWORD: placeholder        # overwritten by path binding
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - wp_data:/var/www/html
    restart: unless-stopped
    labels:
      fibe.gg/port: 80
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN

  db:
    image: mariadb:$$var__MARIADB_VERSION
    environment:
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wp
      MARIADB_PASSWORD: placeholder             # overwritten by path binding
      MARIADB_ROOT_PASSWORD: placeholder        # overwritten by path binding
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test:
        - "CMD"
        - "mariadb-admin"
        - "ping"
        - "-h"
        - "127.0.0.1"
        - "-u"
        - "root"
        - "-p${MARIADB_ROOT_PASSWORD}"
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  wp_data:
  db_data:

x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "blog"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
    WP_VERSION:
      name: "WordPress image tag"
      default: "latest"
      validation: "/^[A-Za-z0-9_.-]+$/"
    MARIADB_VERSION:
      name: "MariaDB version"
      default: "11"
      validation: "/^[A-Za-z0-9_.-]+$/"
    DB_USER_PASSWORD:
      name: "Database user password"
      required: true
      random: true
      secret: true
      sensitive: true
      paths:
        - services.db.environment.MARIADB_PASSWORD
        - services.wordpress.environment.WORDPRESS_DB_PASSWORD
    DB_ROOT_PASSWORD:
      name: "Database root password"
      required: true
      random: true
      secret: true
      sensitive: true
      path: services.db.environment.MARIADB_ROOT_PASSWORD
  metadata:
    description: "WordPress + MariaDB — production-ready blog/CMS stack"
    category: "Productivity"
```

## What changed

| Before | After | Why |
|---|---|---|
| `ports: ["8080:80"]` | `fibe.gg/port: 80` + `fibe.gg/visibility: external` | Public via Traefik |
| `wp_password` hardcoded | `random: true` variable | Generated per Playground |
| `root_pw` hardcoded | separate `random: true` variable | Distinct from user password |
| `wordpress:latest` | `wordpress:$$var__WP_VERSION` | Pin version per launch |
| `db:3306` host | unchanged | Compose network service-name DNS |

## Persistent volumes

Both `wp_data` and `db_data` are named volumes. Without these, every relaunch loses the site content and DB. They survive container restarts but not Marquee destruction — for true durability, point WordPress at S3-compatible object storage (plugins exist) and use managed MySQL.

## Notes on WordPress quirks

- WordPress serves at `/wp-admin`, `/wp-login.php`, etc. on the same port — no path rule needed.
- Some WordPress setups require setting `WORDPRESS_CONFIG_EXTRA` env to define `WP_HOME` / `WP_SITEURL` matching the public URL. Add:
  ```yaml
  WORDPRESS_CONFIG_EXTRA: |
    define('WP_HOME', 'https://$$var__SUBDOMAIN.$$root_domain');
    define('WP_SITEURL', 'https://$$var__SUBDOMAIN.$$root_domain');
  ```
- For HTTPS (which Fibe provides via Traefik), set `define('FORCE_SSL_ADMIN', true);` and trust the `X-Forwarded-Proto` header from Traefik:
  ```yaml
  WORDPRESS_CONFIG_EXTRA: |
    if (!empty($$_SERVER['HTTP_X_FORWARDED_PROTO']) && $$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
      $$_SERVER['HTTPS'] = 'on';
    }
    define('FORCE_SSL_ADMIN', true);
  ```

(Note `$$_SERVER` — Compose doubles the `$` to escape; Fibe's template compiler does NOT see `$$_SERVER` as a variable reference because it doesn't match `$$var__NAME`.)

## With Redis cache plugin

Some WordPress setups use Redis for object cache (with the W3 Total Cache or Redis Object Cache plugins). Add Redis:

```yaml
services:
  cache:
    image: redis:8-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  wordpress:
    environment:
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_REDIS_HOST', 'cache');
        define('WP_REDIS_PORT', 6379);
    depends_on:
      cache:
        condition: service_started
```

The plugin must be installed inside WordPress; the env vars just configure it.

## Pitfalls

- **WordPress doesn't see HTTPS** — login loops, admin AJAX 403. Fix the `X-Forwarded-Proto` check.
- **`upload_max_filesize` too small** — WordPress defaults limit media uploads. Mount a PHP config override via `configs:` or use an image that pre-sets it.
- **MariaDB volume from a different MariaDB major version** — data file format may have changed. Pin `MARIADB_VERSION` and never downgrade.
- **`db:3306` typo / wrong service name** — Compose DNS is exact. The service is `db`, so `db:3306` is right.

## Related skills

[recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [recipe-named-volumes](recipe-named-volumes.md), [recipe-depends-on](recipe-depends-on.md), [recipe-add-subdomain](recipe-add-subdomain.md), [playbook-postgres-app](playbook-postgres-app.md).
