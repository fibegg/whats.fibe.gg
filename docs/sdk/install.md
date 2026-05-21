---
title: Install the fibe CLI
description: Homebrew, Go install, prebuilt release binaries, or Docker. Whatever fits your environment. First run is fibe doctor.
slug: /sdk/install
sidebar_position: 2
sidebar_label: Install
image: /img/og/sdk-install.png
keywords: [fibe install, brew, go install, release binaries, fibe doctor, shell completion]
---

The `fibe` binary is the same single executable whether you use it as a CLI, a Go library dependency, or an MCP server. Pick whichever install method fits your environment.

## Homebrew (macOS, Linux)

The easiest path for individual machines:

```sh
brew install fibegg/sdk/fibe

# or, two-step if you prefer:
brew tap fibegg/sdk
brew install fibe
```

This installs the latest release and keeps it up to date with `brew upgrade`.

## `go install`

If you have a Go toolchain handy:

```sh
go install github.com/fibegg/sdk/cmd/fibe@latest
```

This installs into `$(go env GOBIN)` (typically `~/go/bin`). Make sure that's on your `PATH`.

Use `@latest`, a tag (`@v1.2.3`), or a commit SHA. For reproducible CI, pin to a tag.

## Prebuilt release binaries

For systems without Homebrew or Go, download a binary from the project's [releases page](https://github.com/fibegg/sdk/releases). Builds are published for:

- macOS — amd64, arm64
- Linux — amd64, arm64
- Windows — amd64

```sh
# Linux example
curl -L https://github.com/fibegg/sdk/releases/latest/download/fibe_Linux_x86_64.tar.gz | tar xz
sudo mv fibe /usr/local/bin/
fibe version
```

## Docker

Pull the `e2e` image when you want a runnable `fibe` without installing anything on the host. Useful for CI containers and short-lived shells:

```sh
docker run --rm -it ghcr.io/fibegg/sdk:latest fibe version
```

For day-to-day use, native install is faster — Docker adds a per-invocation startup cost.

## Verify the install

```sh
fibe version
fibe doctor
```

`fibe doctor` runs a self-check: connectivity to the Fibe API, validity of any cached credentials, basic environment sanity. If it's green you're ready to go. If it's red, the output points at the problem (no API key, wrong domain, network, expired token).

## Shell completion

Tab-completion makes a noticeable difference for a tree this wide. Generate completion scripts:

```sh
# Bash (current shell)
source <(fibe completion bash)

# Bash (persistent — Linux)
fibe completion bash | sudo tee /etc/bash_completion.d/fibe

# Zsh (with Oh-My-Zsh / Prezto)
fibe completion zsh > "${fpath[1]}/_fibe"

# Fish
fibe completion fish | source

# PowerShell
fibe completion powershell | Out-String | Invoke-Expression
```

After this, `fibe pl<Tab>` completes to `fibe playgrounds`, and so on through every subcommand and flag.

## Upgrading

- **Homebrew**: `brew upgrade fibe`
- **Go install**: `go install github.com/fibegg/sdk/cmd/fibe@latest`
- **Release binary**: download the new tarball and overwrite the existing binary.

The CLI is backward-compatible across patch versions; minor versions occasionally add new commands and tools. Major versions only happen with notable API changes — they're called out in the changelog.

## Next step

You have a binary. Now [authenticate](/sdk/authentication/) it so it can talk to Fibe.
