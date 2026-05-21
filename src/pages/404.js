import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import SearchBar from '@theme/SearchBar';
import Head from '@docusaurus/Head';
import styles from './404.module.css';

export default function NotFound() {
  return (
    <Layout title="Page not found" description="The page you're looking for doesn't exist here.">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className={styles.wrap}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>404</p>
          <h1 className={styles.title}>That page isn't here.</h1>
          <p className={styles.lede}>
            The link is broken, the URL was mistyped, or the page has moved.
            Try the search, or jump to one of the entry points below.
          </p>

          <div className={styles.searchBox} role="search" aria-label="Search the docs">
            <SearchBar />
          </div>

          <div className={styles.ctas}>
            <Link className={`button button--primary button--lg ${styles.cta}`} to="/intro/">
              Start the guide →
            </Link>
            <Link className={`button button--secondary button--lg ${styles.cta}`} to="/sdk/intro/">
              SDK &amp; CLI
            </Link>
            <Link className={`button button--secondary button--lg ${styles.cta}`} to="/reference/intro/">
              Reference (skills &amp; tools)
            </Link>
          </div>

          <p className={styles.hint}>
            Looking for a specific skill or tool? The full index lives at{' '}
            <Link to="/reference/intro/">/reference/intro/</Link>{' '}
            or{' '}
            <a href="/llm-skills.txt">/llm-skills.txt</a>{' '}
            for the machine-readable version.
          </p>
        </div>
      </main>
    </Layout>
  );
}
