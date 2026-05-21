// @ts-check
// Docusaurus config for whats.fibe.gg — the Fibe user guide and skills library.
// Mirrors conventions of the docs project at docs.fibe.gg.

import {themes as prismThemes} from 'prism-react-renderer';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Fibe — user guide & skills',
  tagline: 'Docker environments, AI Genies, and reusable templates.',
  favicon: 'img/favicon.ico',

  url: 'https://whats.fibe.gg',
  baseUrl: '/',
  organizationName: 'fibegg',
  projectName: 'fibe-skills',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  future: {v4: true},

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US'},
    },
  },

  headTags: [
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'}},
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '192x192', href: '/img/icon-192.png'}},
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '512x512', href: '/img/icon-512.png'}},
    {tagName: 'link', attributes: {rel: 'manifest', href: '/site.webmanifest'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#0f0f14'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: 'Fibe'}},
    {tagName: 'meta', attributes: {property: 'og:type', content: 'website'}},
    {tagName: 'meta', attributes: {name: 'twitter:card', content: 'summary_large_image'}},
    // Google Search Console verification.
    //
    // Replace the placeholder token below with the real one issued at:
    //   https://search.google.com/search-console
    // Then redeploy — Google will detect the meta tag and verify the domain.
    {tagName: 'meta', attributes: {name: 'google-site-verification', content: 'REPLACE_WITH_GSC_TOKEN'}},
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Fibe — user guide & skills',
        url: 'https://whats.fibe.gg',
        publisher: {'@type': 'Organization', name: 'Fibe', url: 'https://fibe.gg'},
      }),
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          showLastUpdateTime: true,
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        language: ['en'],
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchBarShortcutHint: true,
      }),
    ],
  ],

  plugins: [
    path.resolve(__dirname, './plugins/plugin-llms-txt.js'),
    path.resolve(__dirname, './plugins/plugin-og-images.js'),
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-default.png',
      metadata: [
        {name: 'description', content: 'Fibe user guide: Docker environments, AI Genies, reusable templates, automated jobs.'},
        {name: 'keywords', content: 'Fibe, fibe.gg, Docker, Docker Compose, dev environment, AI agent, Genie, Marquee, Playground, Trick, Bazaar, template, developer tools'},
        {name: 'author', content: 'Fibe'},
        {name: 'twitter:image:alt', content: 'Fibe — user guide'},
        {name: 'robots', content: 'index, follow, max-image-preview:large'},
      ],
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Fibe',
        // No logo image — title text alone, linking to home.
        items: [
          {href: 'https://fibe.gg', label: 'fibe.gg', position: 'right'},
          {href: 'https://github.com/fibegg/fibe-skills', label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        // Footer is rendered by the swizzled component at src/theme/Footer/index.js.
        // This entry exists so Docusaurus doesn't complain — the swizzled component
        // reads its links from a single source within itself.
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} fibe.gg`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['yaml', 'bash', 'ruby', 'docker'],
      },
    }),
};

export default config;
