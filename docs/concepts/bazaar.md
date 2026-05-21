---
title: Bazaar
description: The public Template marketplace. Browse, fork, launch Templates other Players have published.
slug: /concepts/bazaar
sidebar_position: 2
image: /img/og/concepts-bazaar.png
keywords: [Bazaar, marketplace, public templates, discovery, fork, launch]
---

The **Bazaar** is the public marketplace for [Templates](/concepts/playspecs/#templates). Browse what other Players have published. Fork, launch, or both.

## What's in the Bazaar

Any Template version a Player published with publish-ready metadata (description, category, sensible defaults). The Bazaar listing is the view filter — Templates aren't a separate codebase, the same Templates power your private launches and the public marketplace.

## Browse

The Bazaar page lets you:

- Search by name, description, or keyword.
- Filter by category (CI, web app, database, dev environment, etc.).
- Sort by recency, popularity, or last update.
- Open a Template's detail page for the description, variables it asks for, screenshots, and version history.

## Launch from the Bazaar

Pick a Template, click Launch:

1. Fibe creates a fresh Playspec bound to the Template's latest version.
2. Fill in variables the Template asks for.
3. Pick a target Marquee.
4. Launch.

The result is a normal [Playground](/concepts/playgrounds/) you fully own. The original Template stays where it was — your Playspec carries a reference to the version you launched.

## Fork from the Bazaar

Forking makes a private copy of the Template in your account. The fork is independent — future updates to the original don't flow into your fork.

Use forking when you want to:

- Customize a published Template without publishing your own version.
- Hold a known-good snapshot even if the publisher updates theirs.
- Modify a Template to point at your own [Prop](/concepts/props/) instead of the publisher's.

## Publish to the Bazaar

From a Template you own:

1. Fill in publish-ready metadata — description, category, default values that work without your specific environment.
2. Walk the [publishing checklist](/operate/publishing/).
3. Flip the "publish to Bazaar" toggle on a version.

That version is now public. Future versions you publish appear too. You can unpublish a version at any time; existing forks keep working.

## Quality bar

The Bazaar is a public surface. Before publishing:

- Real test launch from a fresh setup. No leftover state.
- Variables are honest about what launchers must provide. No hidden hardcoded values.
- Screenshots in the launch's mutters so future launchers see success.
- Description explains what the Template does, not just what's in it.

See [Before you publish](/operate/publishing/) for the full checklist.

## Public profile

Templates you publish appear on your public profile alongside any [Genies you've opted into Build in Public](/concepts/agents/#build-in-public). Visitors see what you've made without a Fibe account.

## FAQ

<details>
<summary>Is the Bazaar moderated?</summary>

Yes. Templates flagged for malicious behavior, broken defaults, or misleading descriptions are removed. The publisher is notified.
</details>

<details>
<summary>Can I make my Bazaar Template require payment?</summary>

Not today. Bazaar Templates are free to launch. Hosting costs (Marquee usage) still apply to the launcher.
</details>

<details>
<summary>What happens to running Playgrounds if the publisher unpublishes?</summary>

Nothing. Running Playgrounds keep running. The Template version is already cloned into your Playspec. You just can't pull future versions from a Template that's no longer public.
</details>

## Related

- [Playspecs & Templates](/concepts/props/) — Template authoring lifecycle.
- [Playspecs](/concepts/playspecs/) — what a Bazaar launch produces.
- [Scrolls](/concepts/scrolls/) — Pantry is the private counterpart to the public Bazaar.
- [Before you publish](/operate/publishing/) — publishing checklist.
- **[Fibe Templates](/authoring/overview/)** — full authoring guide.
