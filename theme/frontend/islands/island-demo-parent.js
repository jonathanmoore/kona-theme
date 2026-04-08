import { hydrate } from '@/lib/island-demo'

class IslandDemoParent extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-parent', IslandDemoParent)
