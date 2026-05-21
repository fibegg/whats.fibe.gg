import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>The user guide for Fibe</p>
        <h1 className={styles.title}>
          Docker environments, <br />
          AI Genies, <br />
          reusable templates.
        </h1>
        <p className={styles.lede}>
          Fibe runs your projects in real Docker environments — connected to your
          compute hosts, fed from your Git repositories, and steered from your
          browser. Launch an environment in seconds, share its URL, and work
          alongside an AI assistant when you want help.
        </p>
        <div className={styles.ctas}>
          <Link className={`button button--primary button--lg ${styles.cta}`} to="/intro/">
            Start the guide →
          </Link>
          <Link className={`button button--secondary button--lg ${styles.cta}`} to="/reference/intro/">
            Reference (skills &amp; tools)
          </Link>
        </div>
      </div>
    </header>
  );
}
