---
title: Launch variables
description: Two ways to weave a variable's value into the template — inline inside a string, or as a whole-node replacement at a specific location.
slug: /authoring/variables
sidebar_position: 5
image: /img/og/authoring-variables.png
keywords: [variables, $$var__, path, paths, random, default, validation, secret]
---

Two ways to weave a variable's value into the template — **inline** inside a string, or as a **whole-node replacement** at a specific location.

## Inline: `$$var__NAME`

Use it anywhere inside a string — an image tag, a URL, an environment value, a label value.

```yaml
services:
  web:
    image: ghcr.io/acme/app:$$var__TAG
    environment:
      DATABASE_URL: "postgres://user:$$var__DB_PASSWORD@db:5432/app"
      PUBLIC_URL: "https://$$var__SUBDOMAIN.$$root_domain"
    labels:
      fibe.gg/port: $$var__PORT
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN
```

`$$root_domain` is special — Fibe always replaces it with the launching Marquee's root domain. You don't need to declare it.

## Whole-node: `path:` / `paths:`

Bind a variable to a specific location inside the template. The whole value at that location is replaced.

```yaml
x-fibe.gg:
  variables:
    REPLICAS:
      name: "Web replicas"
      default: 2
      path: services.web.deploy.replicas
    DEBUG:
      name: "Debug mode"
      default: false
      paths:
        - services.web.environment.DEBUG
        - services.worker.environment.DEBUG
```

See [Variable placement](/authoring/variable-placement/) for the path syntax.

## Which form to choose

| Usage | Best form |
| --- | --- |
| Whole scalar value (env entry, replica count, label value) | `path:` / `paths:` |
| Fragment inside a larger string (URL, tag prefix) | `$$var__NAME` |
| Replacing an existing Compose `${VAR}` reference | `$$var__` |
| Same value in many places | `paths:` with an array |

## Defaulting

When the launcher doesn't supply a value, Fibe uses:

1. The variable's `default`, if set.
2. A generated value if `random: true`.
3. Otherwise, an error if the variable is `required: true`.

## Random values

- Set `random: true` and the launcher doesn't have to supply anything.
- The generated value is **persisted with the launch** and reused on subsequent compiles — your database password doesn't reset every time.
- Mark a variable `secret` or `sensitive` to nudge the launcher UI to mask the value.

## Validation patterns

Constrain what a launcher can type. The validation is a regular expression wrapped in slashes:

```yaml
validation: "/^[a-z][a-z0-9-]*$/"     # slug-like
validation: "/^[0-9]+$/"               # integer-as-string
validation: "/^[A-Za-z0-9_.-]+$/"      # image tag
```

Leave it empty or omit it when any value is fine.

## A example

```yaml
x-fibe.gg:
  variables:
    APP_NAME:
      name: "Application name"
      required: true
      default: "myapp"
      validation: "/^[a-z][a-z0-9-]*$/"
      paths:
        - services.web.environment.APP_NAME
        - services.worker.environment.APP_NAME

    SUBDOMAIN:
      name: "Subdomain"
      default: "demo"
      validation: "/^[a-z][a-z0-9-]*$/"
      path: services.web.labels.fibe.gg/subdomain

    DB_PASSWORD:
      name: "Database password"
      required: true
      random: true
      secret: true
      paths:
        - services.web.environment.DB_PASS
        - services.db.environment.POSTGRES_PASSWORD

    REPLICAS:
      name: "Web replicas"
      default: 2
      path: services.web.deploy.replicas

    DEBUG:
      name: "Debug mode"
      default: false
      paths:
        - services.web.environment.DEBUG
```

## Related

- [Variable placement](/authoring/variable-placement/) — what goes in `path:` / `paths:`.
- [Settings block](/authoring/settings-block/) — where `variables:` lives.
- Reference: [`reference-template-variables`](/reference/reference-template-variables/), [`recipe-random-and-secrets`](/reference/recipe-random-and-secrets/).
