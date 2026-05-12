import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import KonaHero from './KonaHero.vue'
import { setupClickTracking, track } from './track-clicks'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(KonaHero),
    })
  },
  enhanceApp() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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
                searchTimeout = setTimeout(() => {
                  const results = document.querySelectorAll('.DocSearch-Hit, .result')
                  track('docs_search', {
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
  },
}
