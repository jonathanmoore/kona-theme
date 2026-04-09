import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import KonaHero from './KonaHero.vue'
import { setupPostHog, trackEvent } from './posthog'
import { setupClickTracking } from './track-clicks'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(KonaHero),
    })
  },
  enhanceApp({ app, router }) {
    // Initialize PostHog (client-side only)
    if (typeof window !== 'undefined') {
      setupPostHog(router)

      // Make trackEvent available globally for custom events
      app.config.globalProperties.$trackEvent = trackEvent

      // Setup click tracking and search tracking after DOM is ready
      if (typeof document !== 'undefined') {
        // Use nextTick or simple timeout to wait for initial DOM
        setTimeout(() => {
          setupClickTracking()

          // Track search queries (VitePress local search)
          const observer = new MutationObserver(() => {
            const searchInput = document.querySelector('.DocSearch-Input, .VPLocalSearchBox input')
            if (searchInput && !searchInput.dataset.tracked) {
              searchInput.dataset.tracked = 'true'

              let searchTimeout
              searchInput.addEventListener('input', (e) => {
                const query = e.target.value
                clearTimeout(searchTimeout)

                if (query.length >= 3) {
                  // Debounce search tracking
                  searchTimeout = setTimeout(() => {
                    const results = document.querySelectorAll('.DocSearch-Hit, .result')
                    trackEvent('docs_search', {
                      query,
                      results_count: results.length,
                    })
                  }, 500)
                }
              })
            }
          })

          observer.observe(document.body, { childList: true, subtree: true })
        }, 100)
      }
    }
  },
}
