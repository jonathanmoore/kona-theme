import { hydrate } from '@/lib/island-demo'

class IslandDemoChild extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-child', IslandDemoChild)
