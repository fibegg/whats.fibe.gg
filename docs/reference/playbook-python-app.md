---
title: "Python App"
description: "Use to convert a Python web docker-compose (FastAPI / Django / Flask) with Postgres into a Fibe template, with optional dev-mode source mount and production zero-downtime variants."
slug: /reference/playbook-python-app
sidebar_label: "Python App"
image: /img/og/reference-playbook-python-app.png
keywords: ["Fibe", "Playbook", "playbook", "python", "app"]
tags: ["reference", "playbook"]
format: md
---

FastAPI, Django, or Flask app + Postgres. Variants for dev (source mount, `--reload`) and production (built image, zero-downtime).

## Input (typical Python compose)

```yaml
version: "3"
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/app
    depends_on:
      - db
    command: uvicorn app:main --host 0.0.0.0 --reload
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: app
      POSTGRES_PASSWORD: secret
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

## Output: dev variant

```yaml
services:
  app:
    image: python:3.12
    working_dir: /app
    volumes:
      - pip_cache:/root/.cache/pip
    environment:
      DATABASE_URL: postgres://app:$$var__DB_PASS@db:5432/$$var__DB_NAME
      PYTHONUNBUFFERED: "1"
      PYTHONDONTWRITEBYTECODE: "1"
    depends_on:
      db:
        condition: service_healthy
    labels:
      fibe.gg/repo_url: $$var__REPO_URL
      fibe.gg/branch: $$var__BRANCH
      fibe.gg/source_mount: /app
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/start_command: sh -c "pip install -r requirements.txt && uvicorn app:main --host 0.0.0.0 --reload"
      fibe.gg/expose: external:8000
      fibe.gg/production: "false"
      fibe.gg/subdomain: $$var__SUBDOMAIN

  db:
    image: postgres:17.5
    environment:
      POSTGRES_DB: $$var__DB_NAME
      POSTGRES_USER: app
      POSTGRES_PASSWORD: placeholder
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  pg_data:
  pip_cache:

x-fibe.gg:
  variables:
    REPO_URL:
      name: "Repository URL"
      required: true
    BRANCH:
      name: "Branch"
      required: true
      default: "main"
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "py-app"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
    DB_NAME:
      name: "Database name"
      required: true
      default: "app"
    DB_PASS:
      name: "Postgres password"
      required: true
      random: true
      secret: true
      sensitive: true
      path: services.db.environment.POSTGRES_PASSWORD
  metadata:
    description: "Python web app (FastAPI/Django/Flask) with Postgres, source-mount dev mode"
    category: "Development"
    source_defaults: true
```

## Framework cheatsheet (start_command)

| Framework | Dev | Production |
|---|---|---|
| FastAPI / uvicorn | `uvicorn app:main --host 0.0.0.0 --reload` | `gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 app:main` |
| Django (dev) | `python manage.py runserver 0.0.0.0:8000` | `gunicorn -b 0.0.0.0:8000 project.wsgi` |
| Flask (dev) | `flask --app app run --host 0.0.0.0 --debug` | `gunicorn -b 0.0.0.0:8000 app:app` |
| Starlette | `uvicorn app:app --host 0.0.0.0 --reload` | `gunicorn -k uvicorn.workers.UvicornWorker app:app` |

For Django you'll also typically need:

```yaml
labels:
  fibe.gg/start_command: |
    sh -c "python manage.py migrate --noinput &&
           python manage.py collectstatic --noinput &&
           gunicorn -b 0.0.0.0:8000 project.wsgi"
```

Or split into a one-shot `setup` service (preferred — see [playbook-rails-app](playbook-rails-app.md) for the pattern).

## Production variant with zero-downtime

```yaml
services:
  app:
    image: ghcr.io/owner/app:$$var__APP_TAG
    environment:
      DATABASE_URL: postgres://app:$$var__DB_PASS@db:5432/$$var__DB_NAME
    depends_on:
      db:
        condition: service_healthy
    deploy:
      replicas: $$var__APP_REPLICAS
    labels:
      fibe.gg/expose: external:8000
      fibe.gg/subdomain: $$var__SUBDOMAIN
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: /healthz
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 5s
      fibe.gg/healthcheck_retries: "5"
      fibe.gg/healthcheck_start_period: 30s

x-fibe.gg:
  variables:
    APP_TAG:
      name: "App image tag"
      default: "latest"
      validation: "/^[A-Za-z0-9_.-]+$/"
    APP_REPLICAS:
      name: "App replicas"
      required: true
      default: "2"
      validation: "/^[1-9][0-9]*$/"
      path: services.app.deploy.replicas
    # ... others ...
```

For FastAPI add `GET /healthz: 200 OK` in routes. For Django add `django-health-check` or a small view.

## With Celery worker

```yaml
services:
  app:
    # ... web service as above ...

  worker:
    image: ghcr.io/owner/app:$$var__APP_TAG
    environment:
      DATABASE_URL: postgres://app:$$var__DB_PASS@db:5432/$$var__DB_NAME
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: celery -A project worker --loglevel=info
    # no fibe.gg/expose — workers don't serve HTTP

  redis:
    image: redis:8-alpine
    volumes:
      - redis_data:/data
```

## Pitfalls

- **`uvicorn --reload` without source mount** — `--reload` does nothing if there's no live source. Either source-mount or drop `--reload` for production.
- **`pip install` on every start** — slow. Bake into Dockerfile; the dev variant can still `pip install -r requirements.txt` in `start_command` for active development.
- **Django `ALLOWED_HOSTS`** — must include the Marquee subdomain. Either set `ALLOWED_HOSTS = ["*"]` for dev, or compose the env from the variable: `ALLOWED_HOSTS=$$var__SUBDOMAIN.$$root_domain`.
- **Flask debug mode in production** — `flask --debug run` is not production-safe. Use `gunicorn`.
- **Missing healthcheck endpoint** — zero-downtime defaults to `/up`; if the app does not serve that path, set `fibe.gg/healthcheck_path` to a real readiness endpoint such as `/healthz`.

## Related skills

[recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-source-mount](recipe-source-mount.md), [recipe-zero-downtime-healthcheck](recipe-zero-downtime-healthcheck.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [recipe-depends-on](recipe-depends-on.md), [playbook-postgres-app](playbook-postgres-app.md), [decide-static-vs-dynamic](decide-static-vs-dynamic.md).
