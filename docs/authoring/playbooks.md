---
title: App playbooks
description: Examples by app shape. Each one shows the before/after diff for the input and explains every line.
slug: /authoring/playbooks
sidebar_position: 10
image: /img/og/authoring-playbooks.png
keywords: [playbook, Rails, Node, Python, WordPress, Wiki.js, Postgres, cron, test runner]
---

Examples by app shape. Each one shows the before/after diff for the input and explains every line.

For each playbook, the [Reference](/reference/intro/) section has a full skill file with the actual YAML. This page is an index — pick the playbook that matches your app and follow the link.

## By app type

| Shape | Playbook |
| --- | --- |
| **nginx serving static HTML or an SPA** | [`playbook-nginx-static`](/reference/playbook-nginx-static/) |
| **Node.js with hot reload (Vite, Next.js, nodemon)** | [`playbook-nodejs-dev`](/reference/playbook-nodejs-dev/) |
| **Generic web app + Postgres** | [`playbook-postgres-app`](/reference/playbook-postgres-app/) |
| **Python web (FastAPI / Django / Flask)** | [`playbook-python-app`](/reference/playbook-python-app/) |
| **Rails (web + db + redis + jobs + websocket)** | [`playbook-rails-app`](/reference/playbook-rails-app/) |
| **Wiki.js** | [`playbook-wikijs`](/reference/playbook-wikijs/) |
| **WordPress + MariaDB / MySQL** | [`playbook-wordpress`](/reference/playbook-wordpress/) |
| **Multi-service with shared config** | [`playbook-multi-service`](/reference/playbook-multi-service/) |
| **Scheduled cron job** | [`playbook-cron-scheduled`](/reference/playbook-cron-scheduled/) |
| **Test runner on every push or PR** | [`playbook-test-runner`](/reference/playbook-test-runner/) |

## How to use a playbook

1. **Find the closest match** to what you're trying to launch.
2. **Read the before/after diff** to see what changed.
3. **Adapt the variable names** to your app — most playbooks ask for a subdomain, image tag, DB password, etc.
4. **Cross-check the relevant recipes** at the end of each playbook for any extra patterns you need.
5. **Run a preview launch** before publishing.

If none of the playbooks match exactly, find the closest one and combine it with [recipes](/authoring/recipes/) for the differences. Most real-world templates are 80% one playbook + 20% recipes.

## Related

- [Recipes](/authoring/recipes/) — smaller patterns to combine.
- [Compose → Fibe](/authoring/compose-to-fibe/) — the master conversion flow.
- [Before you publish](/operate/publishing/) — the polish checklist.
