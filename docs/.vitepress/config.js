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
    // Favicons
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],

    // Fonts
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],

    // Open Graph (Facebook, LinkedIn, Slack)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Kona Theme Documentation' }],
    ['meta', { property: 'og:image', content: 'https://kona-theme.jonathanmoore.com/kona-hero.jpg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://kona-theme.jonathanmoore.com/kona-hero.jpg' }],
    ['meta', { name: 'twitter:site', content: '@moore' }],

    // Additional meta
    ['meta', { name: 'theme-color', content: '#D4974A' }],

    // Structured Data for Google Rich Results
    ['script', {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Kona Theme Documentation',
        description: 'A Vite-powered Shopify theme with islands hydration',
        author: {
          '@type': 'Person',
          name: 'Jonathan Moore',
          url: 'https://jonathanmoore.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Style Hatch',
          logo: {
            '@type': 'ImageObject',
            url: 'https://kona-theme.jonathanmoore.com/favicon.svg',
          },
        },
        inLanguage: 'en-US',
        datePublished: '2026-04-09',
        dateModified: new Date().toISOString().split('T')[0],
      }),
    }],
  ],

  // Generate sitemap
  sitemap: {
    hostname: 'https://kona-theme.jonathanmoore.com',
    transformItems: (items) => {
      return items.map((item) => ({
        ...item,
        lastmod: new Date().toISOString(),
        changefreq: item.url === '/' ? 'weekly' : 'monthly',
        priority: item.url === '/' ? 1.0 : 0.8,
      }))
    },
  },

  // Auto-generate meta descriptions and canonical URLs
  async transformPageData(pageData) {
    // Auto-generate meta description from first paragraph if not set
    if (!pageData.frontmatter.description && pageData.content) {
      const firstParagraph = pageData.content
        .split('\n')
        .find(line => line.trim() && !line.startsWith('#'))
        ?.trim()
        .slice(0, 160) // SEO sweet spot: 150-160 chars

      if (firstParagraph) {
        pageData.frontmatter.description = firstParagraph
      }
    }

    // Set canonical URL for each page
    const canonicalUrl = `https://kona-theme.jonathanmoore.com${pageData.relativePath
      .replace(/\.md$/, '.html')
      .replace(/index\.html$/, '')}`

    pageData.frontmatter.head = pageData.frontmatter.head || []
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }])

    return pageData
  },

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
      message: '<a href="https://jonathanmoore.com">Created by Jonathan Moore</a>',
    },
  },
}))
