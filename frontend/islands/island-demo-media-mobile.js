import { hydrate } from '@/lib/island-demo'

class IslandDemoMediaMobile extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-media-mobile', IslandDemoMediaMobile)
