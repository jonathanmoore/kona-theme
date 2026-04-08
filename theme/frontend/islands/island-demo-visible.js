import { hydrate } from '@/lib/island-demo'

class IslandDemoVisible extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-visible', IslandDemoVisible)
