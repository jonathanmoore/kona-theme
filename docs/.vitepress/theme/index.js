import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import KonaHero from './KonaHero.vue'
import DocFooterCredit from './DocFooterCredit.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(KonaHero),
      'doc-footer-before': () => h(DocFooterCredit),
    })
  },
}
