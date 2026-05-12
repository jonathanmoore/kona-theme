import { hydrate } from '@/lib/island-demo'

class IslandDemoInteraction extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-interaction', IslandDemoInteraction)
