---
title: Billing
description: Plans, Wallet, Mana, Sparks, top-ups, subscriptions, referrals, Runes. Everything that goes through Profile → Billing.
slug: /concepts/billing
sidebar_position: 9
image: /img/og/concepts-billing.png
keywords: [Billing, Wallet, Mana, Sparks, plan, subscription, top-up, referral, Rune]
---

Everything financial — plans, balance, subscriptions, referrals — lives in **Profile → Billing**. Fibe doesn't push monthly subscriptions on you. You hold a balance in two currencies and spend on action.

## Wallet

The Wallet holds your account balance. It's the page you'll see most often under Billing.

### What the Wallet page shows

- **Current balance** in each of the two currencies (see below).
- **History** — every credit and debit, with a description and a link to the resource that triggered it.
- **Pending charges** — anything provisioned but not yet billed (e.g. a Marquee disabled mid-cycle).
- **Promotional credits** tallied separately from paid balance, so you can see what came from grants, [Runes](#runes), or referrals.

### Top up

From the Wallet page:

1. Pick an amount, or pick a top-up pack (bundles at a small discount).
2. Pay via the billing provider shown in the checkout flow.
3. Balance credited — usually immediately, sometimes after the provider clears the transaction.

You can also top up via:

- A **[Rune](#runes)** (an invite or promotional code).
- A **[referral](#referrals)** payout.
- An occasional **grant** the platform issues directly.

### Auto-recharge

Some plan tiers let you set an auto-recharge threshold: when the balance drops below the threshold, the configured top-up pack is billed automatically every N days. The plan card shows the recharge cadence.

Use auto-recharge for production setups where you don't want a Marquee disabled because the balance hit zero.

## Mana

Mana is the **primary** currency. Use it for anything persistent.

### Mana spend categories

- **Marquees** — the base cost per tier. Charged on a recurring cadence as long as the Marquee is active.
- **Top-up packs** — purchased as a bundle.
- **Other persistent infrastructure** the platform exposes — disk, dedicated runner pools, account-level features.

### Plan card

The Wallet shows a plan card per Marquee tier. Each card has:

- **Effective per-Marquee cost** — what you pay per month for one Marquee at this tier.
- **Fuel line** — how many Marquees the balance can fuel for how many days (e.g. "this can fuel 3 Marquees for 14 days").
- **Features** — what the tier includes (CPU/RAM, concurrent Playgrounds, dev-environment capacity).
- **Best-value markers** when one tier is materially cheaper per Marquee than another.

Pick a tier when you add a [Marquee](/concepts/marquees/), or upgrade a tier from the Marquee's own page.

## Sparks

Sparks are the **bursty** currency. Use them for one-off and premium actions.

### Sparks spend categories

- **Premium Genie features** — larger context windows, faster models, higher rate limits inside a session.
- **Trick credits** for paid execution modes (e.g. high-priority queue).
- **One-off purchases** the checkout flow surfaces at the point of use.

### Mana → Sparks conversion

Convert Mana to Sparks at a fixed rate from the Wallet page. One-way: Sparks can't be converted back to Mana.

Convert when you hit a Sparks-only checkout but don't want to top up via the billing provider for a small amount.

## Subscriptions

If you're on a plan that includes recurring entitlements — a managed Marquee, a feature bundle, anything else billed on a cycle — those show up in the **Active Subscriptions** section of the Billing page.

Per-subscription columns:

- **Plan** — what's being subscribed to.
- **Provider** — the billing provider (e.g. card on file, third-party processor).
- **Period** — current billing cycle dates.
- **Status** — active, past due, cancelled, etc.

Manage (upgrade, downgrade, cancel) from the subscription's row.

## Referrals

Share your **referral code** with people who'd benefit from Fibe. When they sign up using your code, both sides get a credit.

The Billing page shows:

- **Your Code** — the referral code unique to your account.
- **Referrals desc** — a short description of the program (terms, payout, current promotion).
- **Referred** — list of accounts that signed up using your code.

Credit posts to your Wallet once the referred account hits the qualifying milestone (typically: first paid top-up or first Marquee).

## Runes

A **Rune** is a single-use code that grants something — a top-up, a credit, a feature unlock, or a tutorial Marquee.

Types of Runes you'll see:

- **Invite Runes** — issued during private beta and special launches.
- **Promotional Runes** — given at events or with marketing campaigns.
- **Compensation Runes** — issued by support when something went wrong.

Redeem from the Billing page. Once redeemed, a Rune is marked **Used** and the granted item posts to your Wallet or activates on your account.

The page shows:

- **Rune** — the code, masked except the prefix.
- **Used** — when (if) it was redeemed.

## What's free

You don't need to spend anything to:

- Sign up.
- Use a tutorial Marquee.
- Author Templates privately.
- Browse the [Bazaar](/concepts/bazaar/).
- Open a standalone Genie chat on a tutorial Marquee.

You start spending when you add your first paid Marquee or buy a premium Sparks-priced action.

## FAQ

<details>
<summary>Do credits expire?</summary>

Paid Mana and Sparks don't expire. Promotional credits (from Runes, referrals, grants) usually do — expiration shown when applied. Check the Wallet history for exact dates.
</details>

<details>
<summary>Refunds?</summary>

Unused balance is refundable within a reasonable window after purchase. Specific items follow standard SaaS conventions. The checkout flow shows the policy.
</details>

<details>
<summary>Cheapest way to start?</summary>

Tutorial Marquee — free, platform-managed. When ready for real work, top up enough Mana for one Single Marquee for a month.
</details>

<details>
<summary>Sparks needed but I only have Mana?</summary>

Convert on the Wallet page at the fixed rate. Immediate. One-way.
</details>

<details>
<summary>What happens if my balance hits zero?</summary>

Persistent infrastructure (Marquees) gets disabled — existing Playgrounds keep running until next renewal cycle but new launches are blocked. Top up to re-enable. Auto-recharge prevents this.
</details>

<details>
<summary>Where do I see the invoice for a top-up?</summary>

The Wallet history row links to the invoice from the billing provider. Click the row.
</details>

## Related

- [Marquees](/concepts/marquees/) — the main Mana spender.
- [Agents](/concepts/agents/) — Sparks consumers (premium model features, Pokes).
- [Advanced → Limits & Quotas](/advanced/limits/) — what your plan-level quotas are.
- [Advanced → Data Backup](/advanced/backup/) — covered by your plan, not a Sparks spend.
