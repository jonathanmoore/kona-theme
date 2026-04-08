import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kona Theme',
  description: 'A Vite-powered Shopify OS 2.0 theme with islands architecture',
  base: '/kona-theme/',
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/kona-theme/favicon.svg' }],
  ],

  themeConfig: {
    outline: { level: [2, 3] },

    nav: [
      { text: 'Guide', link: '/getting-started/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Reference', link: '/javascript/component-reference' },
      { text: 'Demo Store', link: 'https://kona-theme.myshopify.com/' },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/jonathanmoore/kona-theme' },
          { text: 'Shopify Docs', link: 'https://shopify.dev/docs/themes' },
          { text: 'Vite', link: 'https://vite.dev' },
          { text: 'vite-plugin-shopify', link: 'https://github.com/barrel/barrel-shopify/tree/main/packages/vite-plugin-shopify' },
          { text: 'vite-plugin-shopify-theme-islands', link: 'https://github.com/nicholasray/vite-plugin-shopify-theme-islands' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started/' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Development', link: '/getting-started/development' },
          { text: 'Deployment', link: '/getting-started/deployment' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/' },
          { text: 'Islands Architecture', link: '/architecture/islands' },
          { text: 'Hydration Directives', link: '/architecture/hydration-directives' },
          { text: 'Build Pipeline', link: '/architecture/build-pipeline' },
          { text: 'Project Layout', link: '/architecture/project-layout' },
        ],
      },
      {
        text: 'CSS',
        items: [
          { text: 'Overview', link: '/css/' },
          { text: 'Design Tokens', link: '/css/design-tokens' },
          { text: 'Shopify Integration', link: '/css/shopify-integration' },
        ],
      },
      {
        text: 'JavaScript',
        items: [
          { text: 'Overview', link: '/javascript/' },
          { text: 'Creating Islands', link: '/javascript/creating-islands' },
          { text: 'Event System', link: '/javascript/event-system' },
          { text: 'Component Reference', link: '/javascript/component-reference' },
          { text: 'Lifecycle', link: '/javascript/lifecycle' },
          { text: 'Utilities', link: '/javascript/utilities' },
        ],
      },
      {
        text: 'Shopify',
        items: [
          { text: 'Overview', link: '/shopify/' },
          { text: 'Sections & Blocks', link: '/shopify/sections-blocks' },
          { text: 'Liquid Patterns', link: '/shopify/liquid-patterns' },
          { text: 'Templates', link: '/shopify/templates' },
          { text: 'Icons', link: '/shopify/icons' },
        ],
      },
      {
        text: 'Internationalization',
        items: [
          { text: 'Overview', link: '/i18n/' },
          { text: 'Translation Pipeline', link: '/i18n/translation-pipeline' },
          { text: 'Adding Translations', link: '/i18n/adding-translations' },
        ],
      },
      {
        text: 'CI/CD',
        items: [
          { text: 'Overview', link: '/ci-cd/' },
          { text: 'Workflows', link: '/ci-cd/workflows' },
          { text: 'PR Previews', link: '/ci-cd/pr-previews' },
          { text: 'GitHub Pages', link: '/ci-cd/github-pages' },
        ],
      },
      {
        text: 'Standards',
        items: [
          { text: 'Overview', link: '/standards/' },
          { text: 'JavaScript', link: '/standards/javascript-standards' },
          { text: 'CSS', link: '/standards/css-standards' },
          { text: 'Accessibility', link: '/standards/accessibility' },
          { text: 'Compliance Audit', link: '/standards/compliance-audit' },
        ],
      },
      {
        text: 'Claude Code Skills',
        items: [
          { text: 'Overview', link: '/claude-code/' },
        ],
      },
      {
        text: 'Demo',
        items: [
          { text: 'Islands Demo', link: '/demo/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'x', link: 'https://x.com/moore' },
      { icon: 'github', link: 'https://github.com/jonathanmoore/kona-theme' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/jonathanmoore/kona-theme/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Built by <a href="https://jonathanmoore.com">Jonathan Moore</a>',
    },
  },
})
