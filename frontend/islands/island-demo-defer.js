import { hydrate } from '@/lib/island-demo'

class IslandDemoDefer extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-defer', IslandDemoDefer)
