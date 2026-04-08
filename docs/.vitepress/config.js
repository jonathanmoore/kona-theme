import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import coastalTheme from './theme/coastal-theme.json'

export default withMermaid(defineConfig({
  title: 'Kona Theme',
  description: 'A Vite-powered Shopify theme with islands hydration',
  base: '/',
  appearance: 'force-dark',
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
  ],

  markdown: {
    theme: coastalTheme,
  },

  mermaid: {
    theme: 'dark',
  },

  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },

  themeConfig: {
    outline: { level: [2, 3] },

    nav: [
      { text: 'Guide', link: '/getting-started/' },
      { text: 'Architecture', link: '/architecture/' },
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
          { text: 'Islands Demo', link: '/architecture/islands-demo' },
        ],
      },
      {
        text: 'Assets',
        items: [
          { text: 'Overview', link: '/assets/' },
          { text: 'CSS', link: '/assets/css' },
          { text: 'Creating Islands', link: '/assets/creating-islands' },
          { text: 'Event System', link: '/assets/event-system' },
          { text: 'Lifecycle', link: '/assets/lifecycle' },
          { text: 'Utilities', link: '/assets/utilities' },
        ],
      },
      {
        text: 'Claude Code Skills',
        items: [
          { text: 'Overview', link: '/claude-code/' },
          { text: 'Liquid Reference', link: '/claude-code/liquid-reference' },
          { text: 'Accessibility', link: '/claude-code/accessibility' },
          { text: 'Coding Standards', link: '/claude-code/coding-standards' },
          { text: 'Component Creator', link: '/claude-code/component-creator' },
          { text: 'Translator', link: '/claude-code/translator' },
        ],
      },
      {
        text: 'CI/CD',
        items: [
          { text: 'Overview', link: '/ci-cd/' },
          { text: 'Workflows', link: '/ci-cd/workflows' },
          { text: 'PR Previews', link: '/ci-cd/pr-previews' },
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
      message: 'Created by <a href="https://jonathanmoore.com">Jonathan Moore</a>',
    },
  },
}))
