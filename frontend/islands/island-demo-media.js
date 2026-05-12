import { hydrate } from '@/lib/island-demo'

class IslandDemoMedia extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-media', IslandDemoMedia)
