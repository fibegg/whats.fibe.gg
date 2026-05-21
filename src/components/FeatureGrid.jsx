import React from 'react';
import Link from '@docusaurus/Link';
import styles from './FeatureGrid.module.css';
import {
  MarqueeIcon,
  PropsIcon,
  TemplatesIcon,
  PlaygroundsIcon,
  TricksIcon,
  GeniesIcon,
  ComposeIcon,
  SdkIcon,
  WalletIcon,
} from './FibeIcons';

const FEATURES = [
  {
    title: 'Marquees',
    blurb: 'Docker-capable hosts where your environments run. Public HTTPS routing and internal access handled for you.',
    href: '/concepts/marquees/',
    Icon: MarqueeIcon,
  },
  {
    title: 'Props',
    blurb: 'Your Git repositories, connected. Fibe watches them for pushes and feeds source into Playgrounds and Templates.',
    href: '/concepts/props/',
    Icon: PropsIcon,
  },
  {
    title: 'Templates',
    blurb: 'Reusable environment recipes. Author one, launch it many times, publish polished ones to the Bazaar.',
    href: '/concepts/playspecs/#templates',
    Icon: TemplatesIcon,
  },
  {
    title: 'Playgrounds',
    blurb: 'The running environment. URLs, logs, terminals, lifecycle controls, optional Genie panel — all in your browser.',
    href: '/concepts/playgrounds/',
    Icon: PlaygroundsIcon,
  },
  {
    title: 'Tricks',
    blurb: 'Run a task and finish — test suites, migrations, backups. Schedule them, trigger them on push, repair on failure.',
    href: '/concepts/tricks/',
    Icon: TricksIcon,
  },
  {
    title: 'Genies',
    blurb: 'Configure assistants, open them inside Playgrounds, chat alongside the code.',
    href: '/concepts/agents/',
    Icon: GeniesIcon,
  },
  {
    title: 'Compose → Fibe',
    blurb: 'Take your existing docker-compose.yml and turn it into a launchable Fibe template in nine clean steps.',
    href: '/authoring/compose-to-fibe/',
    Icon: ComposeIcon,
  },
  {
    title: 'Fibe SDK / CLI / MCP',
    blurb: 'Drive Fibe from your terminal or wire it into an MCP-aware agent. One binary, scripted workflows, full tool catalog.',
    href: '/sdk/intro/',
    Icon: SdkIcon,
  },
  {
    title: 'Wallet, Mana & Sparks',
    blurb: 'Top up once, spend as you go. Mana funds Marquees and persistent infrastructure; Sparks cover bursty, premium actions.',
    href: '/concepts/billing/',
    Icon: WalletIcon,
  },
];

export default function FeatureGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h2>Find your way around</h2>
        <p>The nine most-visited corners of the guide.</p>
      </div>
      <div className={styles.grid}>
        {FEATURES.map(({title, blurb, href, Icon}) => (
          <Link key={href} to={href} className={styles.card}>
            <span className={styles.iconBox} aria-hidden="true">
              <Icon />
            </span>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.blurb}>{blurb}</p>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
