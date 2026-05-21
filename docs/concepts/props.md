---
title: Props
description: A Prop is a connected Git repository. Fibe reads branches and files from it, mounts source into containers, and reacts to pushes.
slug: /concepts/props
sidebar_position: 5
image: /img/og/concepts-props.png
keywords: [Prop, Git repository, GitHub, GitHub App, Gitea, PAT, Personal Access Token, source control, branches, webhook, Compose detection]
---

A **Prop** is a connected Git repository. Fibe clones it for builds, mounts it for dev, triggers Tricks on push.

Without a Prop, a Template can still be a static `image:` recipe. With one, the Template gets dynamic — branches, commits, hot-reloaded source, push-triggered jobs.

## What a Prop gives you

| Capability | Detail |
| --- | --- |
| **Branch discovery** | Every branch listed for launchers to pick. |
| **Source for builds** | Templates that say `fibe.gg/repo_url: <this prop>` clone at launch. |
| **Live source mount** | Dev services mount the working tree. Edits show up live. |
| **Compose detection** | On connect, Fibe notices `docker-compose*.yml` and `.env.example`. Candidates for new Templates. |
| **Push notifications** | Refresh branch list, fire source-linked Templates that track changed files, trigger listening Tricks. |
| **In-browser git** | Stage, commit, push from the Playground terminal. |
| **Per-commit history** | What landed and when. |

## Supported providers

Two providers, each with its own auth path:

| Provider | URL shape | Auth |
| --- | --- | --- |
| **Built-in Gitea** | URL inside Fibe's Gitea host | Auto-provisioned per Player. No setup. |
| **GitHub** | `https://github.com/owner/repo` or `ssh://…` | GitHub App installation, or per-Prop Personal Access Token. |

Other providers (GitLab, Bitbucket, self-hosted) aren't supported today. The repo-URL validator only accepts the two above. To use code from another host, push a mirror into the built-in Gitea.

## Connect a GitHub repository

Three ways, in order of preference:

### 1. Install the Fibe GitHub App (recommended for orgs)

Best when you have multiple private repos in the same org and want webhooks + CI to work without per-Prop token management.

1. Go to **Profile → Advanced Settings → GitHub Apps**, click **Install on GitHub**.
2. GitHub asks which org/account and which repos to grant.
3. Pick repos. Return to Fibe; the installation is registered.
4. Create a Prop from any granted repo — no token needed. Fibe mints short-lived installation tokens at clone time.

Multiple installations per account are supported (one per org or repo set). Detail: [Advanced → GitHub Apps](/advanced/github-apps/).

### 2. Sign in with GitHub

Best when you mostly use your own (personal) repos and want a single OAuth click.

1. Click **Connect GitHub** from the profile. GitHub OAuth flow runs.
2. Your GitHub user is linked. Public repos clone without further setup; private ones still need an App installation or a PAT.

### 3. Paste a Personal Access Token (per-Prop)

Best for one-off integrations or when you can't install the App (no admin rights on the org).

When creating a Prop from the **GitHub Repository** tab:

- **Repo URL** — `https://github.com/owner/repo` or `owner/repo`.
- **Default branch** — defaults to the repo default.
- **Credentials (Personal Access Token)** — paste a PAT.
  - **Classic PAT** with the `repo` scope, **or** a **fine-grained PAT** scoped to the specific repo with the relevant permissions (contents read/write, metadata read).
  - Format `ghp_…` (classic) or `github_pat_…` (fine-grained).
  - Stored encrypted on the Prop. Used at clone time and for the API calls the Prop needs (read/write contents, metadata).

PATs are per-Prop and don't share across Props. Rotate from the Prop's settings page when the token expires.

When **both** an App installation and a PAT are available, the PAT wins. The Prop uses what's set on its `credentials` field; if blank, it falls back to the App installation token.

## Connect a built-in Gitea repository

Fibe runs an internal Gitea instance and provisions an account for every Player automatically.

### Auto-provisioning

The moment your Player is created, a background job runs:

1. Creates a Gitea user matching your Fibe username.
2. Generates a random password and stores it in your `gitea` provider connection metadata.
3. Mints a Gitea access token with `read/write:repository` and `read/write:user` scopes.

You don't take any action. When the job finishes you'll see a toast: *"Your Gitea account has been provisioned. Check your profile for credentials."*

### Where the Gitea credentials live

Profile page shows a **Gitea account** card:

- **Username** — same as your Fibe username.
- **Password** — the random one generated at provisioning. Copy it from the card. Hidden by default; click to reveal.
- **Profile** — link to your Gitea profile page.
- **Sign in** — link to the Gitea sign-in page. Gitea uses a separate session from Fibe.

Use these to log into Gitea directly (push from the command line, browse the web UI, manage SSH keys, etc.).

### Reset credentials

If you lose the password or want to rotate:

1. Profile → **Reset credentials** on the Gitea card.
2. 2FA confirmation required.
3. Fibe generates a new password and a new access token. The Prop's stored credential is updated; the password is shown again.

### Creating a Gitea repo

From **New Prop → New Repository** tab:

- **Repo name** — kebab-case, lowercase, unique under your Gitea account.
- **Private** — toggle.
- Click **Create Repository**. Fibe creates the repo in Gitea and saves the Prop.

The repo is owned by your Gitea user. You can push to it via HTTPS (Gitea credentials or PAT) or SSH (add a key to your Gitea profile).

### Provisioning failures

Provisioning retries automatically (polynomial backoff, up to 10 attempts for connection issues). If it ultimately fails, Profile shows a **Retry Gitea provisioning** button.

## What's auto-set up on connect

Whatever the provider and auth path, on creation Fibe:

1. Resolves the repo URL. Validates the format.
2. Discovers branches.
3. Notes useful files (`docker-compose*.yml`, `.env.example`) as candidates for new Templates.
4. Installs the webhook on the upstream (GitHub App or Gitea).

## Pushes

On commit, Fibe:

1. Refreshes the branch list.
2. Auto-publishes new Template versions for any source-linked Template tracking a changed file.
3. Fires Tricks configured for that push or PR.

The webhook is managed automatically.

## Editing source from a Playground

Playground terminal has full git tooling. The UI exposes a diff view, commit message field, push button.

Commits go back to the Prop. The webhook fires. Source-linked Templates and Tricks react.

## Props are personal

Each Player owns their Props. Two people can connect the same upstream repository independently, with separate credentials, branches, and Trick configurations.

If you fork a Template that points at someone else's Prop, your fork doesn't get access to their repository. Connect your own Prop (or a fork of theirs).

## Source-linked Templates

A Template can point at a file in a Prop — typically the Compose file at the repo root. Two effects:

1. **Auto-publish on file change.** New commits touching the file → new Template version. Body is the file at that commit.
2. **CI Trick.** Enable CI on the Template and Fibe creates a Trick that runs against the latest version on push or PR.

See [Playspecs → Source-linked Templates](/concepts/playspecs/#source-linked-templates--the-strongest-pattern) for full detail.

## FAQ

<details>
<summary>Which is better — GitHub App or PAT?</summary>

App, when you can install it: installation tokens are short-lived, scoped per-installation, and webhook delivery is managed centrally. PATs are convenient when you can't install the App (no org admin rights) or for one-off Props.
</details>

<details>
<summary>Can I use a PAT for an arbitrary git host (GitLab, Bitbucket, self-hosted)?</summary>

No. The `credentials` field works only for GitHub URLs. The URL validator rejects other hosts. To bring code in from elsewhere, push a mirror to the built-in Gitea.
</details>

<details>
<summary>Fine-grained vs classic PAT?</summary>

Both work. Fine-grained is preferred — you can scope it to one repo and one set of permissions. Classic PATs grant `repo` scope, which covers all of your repos at once.
</details>

<details>
<summary>What happens when a PAT expires?</summary>

Clones and webhook handlers fail. The Prop surfaces an authentication error on the next sync. Paste a fresh PAT into the Prop's Credentials field to fix.
</details>

<details>
<summary>Rotate credentials on a Prop?</summary>

Yes. Re-authenticate (or paste a new PAT) from the Prop settings. Old credentials revoked.
</details>

<details>
<summary>Where's my Gitea password if I never saved it?</summary>

Profile → Gitea account → reveal Password. If the password isn't visible ("Password is not saved for this account"), click **Reset credentials** to mint a new one.
</details>

<details>
<summary>Can I SSH into Gitea?</summary>

Yes. Add your SSH public key to your Gitea profile (Sign in to Gitea → Settings → SSH/GPG Keys). Then `git clone git@<gitea-host>:<your-username>/<repo>.git` works.
</details>

<details>
<summary>Deleted Prop?</summary>

Existing Playgrounds keep running (source is already on the Marquee). New launches that reference the missing Prop fail with a clear error.
</details>

## Related

- [Advanced → GitHub Apps](/advanced/github-apps/) — install and manage GitHub App installations.
- [Marquees](/concepts/marquees/) — where source runs.
- [Playspecs](/concepts/playspecs/) — Templates and the launches they produce.
- [Tricks](/concepts/tricks/) — what fires on pushes.
- Reference: [`recipe-build-to-repo-url`](/reference/recipe-build-to-repo-url/), [`recipe-source-mount`](/reference/recipe-source-mount/), [`mode-trigger-vcs`](/reference/mode-trigger-vcs/).
