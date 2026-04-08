import { fetchConfig } from '@/lib/utils'

class CartNote extends window.HTMLElement {
  connectedCallback() {
    this.controller = new AbortController()

    this.addEventListener('change', this.onChange.bind(this), {
      signal: this.controller.signal
    })
  }

  disconnectedCallback() {
    this.controller?.abort()
  }

  async onChange(event) {
    event.stopPropagation()
    const body = JSON.stringify({ note: event.target.value })
    try {
      await fetch(`${window.routes.cart_update_url}`, {
        ...fetchConfig(),
        body,
        signal: this.controller.signal
      })
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    }
  }
}

window.customElements.define('cart-note', CartNote)
