import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Hero from '@site/src/components/Hero';
import FeatureGrid from '@site/src/components/FeatureGrid';

export default function Home() {
  return (
    <Layout
      title="Fibe — user guide"
      description="Docker environments, AI Genies, and reusable templates. The full user guide for Fibe."
    >
      <Head>
        <link rel="canonical" href="https://whats.fibe.gg/" />
        <meta property="og:title" content="Fibe — user guide" />
        <meta property="og:description" content="Docker environments, AI Genies, and reusable templates." />
        <meta property="og:url" content="https://whats.fibe.gg/" />
      </Head>
      <Hero />
      <main>
        <FeatureGrid />
      </main>
    </Layout>
  );
}
