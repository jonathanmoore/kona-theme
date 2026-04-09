import { hydrate } from '@/lib/island-demo'

class IslandDemoIdle extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-idle', IslandDemoIdle)
