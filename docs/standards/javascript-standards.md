# JavaScript Standards

All interactive behavior in Kona Theme is implemented as vanilla Web Components. No frameworks, no runtime npm dependencies. These rules keep island code consistent, leak-free, and easy to review.

## No Semicolons

Prettier is configured to omit semicolons. This is enforced by the formatter -- no manual effort required.

::: tip Do
```js
const x = 1
const name = 'cart'
```
:::

::: danger Don't
```js
const x = 1;
const name = 'cart';
```
:::

## async/await Over .then() Chains

All asynchronous code uses `async`/`await` with `try`/`catch`/`finally`. The `catch` block must check for `AbortError` to avoid logging expected abort signals from cleanup.

::: tip Do
```js
async updateQuantity(line, quantity) {
  try {
    const response = await fetch(
      routes.cart_change_url,
      fetchConfig('javascript', { line, quantity })
    )
    const data = await response.json()
    this.renderSections(data)
  } catch (e) {
    if (e.name !== 'AbortError') console.error(e)
  } finally {
    this.classList.remove('loading')
  }
}
```
:::

::: danger Don't
```js
updateQuantity(line, quantity) {
  fetch(routes.cart_change_url, fetchConfig('javascript', { line, quantity }))
    .then((response) => response.json())
    .then((data) => {
      this.renderSections(data)
    })
    .catch(console.error)
    .finally(() => {
      this.classList.remove('loading')
    })
}
```
:::

## @/ Path Alias

All imports use the `@/` alias which resolves to `theme/frontend/`. Relative imports between island files break when files move and create inconsistency across the codebase.

::: tip Do
```js
import CartItems from '@/islands/cart-items'
import { trapFocus, removeTrapFocus } from '@/lib/a11y'
import { fetchConfig } from '@/lib/utils'
```
:::

::: danger Don't
```js
import CartItems from './cart-items'
import { trapFocus } from '../lib/a11y'
import { fetchConfig } from '../../lib/utils'
```
:::

The alias is configured in both `jsconfig.json` (for editor resolution) and `vite.config.js` (via the `sourceCodeDir` option in vite-plugin-shopify). The `~/` alias also works and resolves to the same directory.

## for...of Over .forEach()

Use `for...of` loops instead of `.forEach()`. They are easier to read, can be broken out of with `break` or `return`, and work with any iterable -- not just arrays.

::: tip Do
```js
for (const section of this.getSectionsToRender()) {
  const element = document.getElementById(section.id)
  element.innerHTML = this.getSectionInnerHTML(
    parsedState.sections[section.section],
    section.selector
  )
}
```
:::

::: danger Don't
```js
this.getSectionsToRender().forEach((section) => {
  const element = document.getElementById(section.id)
  element.innerHTML = this.getSectionInnerHTML(
    parsedState.sections[section.section],
    section.selector
  )
})
```
:::

## AbortController for All Listeners and Fetch Calls

Every island that registers event listeners or makes fetch calls must use an `AbortController`. The controller is created in `connectedCallback` and aborted in `disconnectedCallback`. This prevents memory leaks when Shopify's Section Rendering API replaces DOM nodes.

::: tip Do
```js
connectedCallback() {
  this.controller = new AbortController()
  const { signal } = this.controller

  this.addEventListener('change', this.onChange.bind(this), { signal })
  document.addEventListener('cart:refresh', this.onRefresh.bind(this), { signal })
}

disconnectedCallback() {
  this.controller?.abort()
}

async fetchCart() {
  const response = await fetch(routes.cart_url, {
    ...fetchConfig(),
    signal: this.controller.signal,
  })
  return response.json()
}
```
:::

::: danger Don't
```js
constructor() {
  super()
  this.addEventListener('change', this.onChange.bind(this))
  document.addEventListener('cart:refresh', this.onRefresh.bind(this))
}

// No disconnectedCallback -- listeners leak when the element is removed
```
:::

Pass the signal to both `addEventListener` (for automatic listener removal) and `fetch` (to cancel in-flight requests). When the controller is aborted, all listeners are removed and all pending fetches throw an `AbortError`.

## Lifecycle Patterns

### Minimal Constructors

Constructors should contain only `super()` and optionally static property reads. Never register event listeners, query the DOM, or access attributes in the constructor -- the element may not be connected to the document yet.

::: tip Do
```js
constructor() {
  super()
}
```
:::

::: danger Don't
```js
constructor() {
  super()
  this.button = this.querySelector('button')
  this.addEventListener('click', this.onClick.bind(this))
  this.setAttribute('role', 'dialog')
}
```
:::

### connectedCallback for Setup

All setup logic goes in `connectedCallback` -- event listeners, DOM queries, attribute reads, and AbortController creation. This method runs when the element is inserted into the document, so the DOM is available.

```js
connectedCallback() {
  this.controller = new AbortController()
  const { signal } = this.controller

  this.button = this.querySelector('button')
  this.addEventListener('click', this.onClick.bind(this), { signal })
}
```

### disconnectedCallback for Cleanup

All cleanup goes in `disconnectedCallback` -- abort the controller, clear timeouts, cancel animation frames. This method runs when the element is removed from the document.

```js
disconnectedCallback() {
  this.controller?.abort()
  clearTimeout(this.scrollTimeout)
}
```

## Web Components Only

Islands are pure Web Components extending `HTMLElement`. No frameworks, no reactive state libraries, no templating engines. Each island is a single file in `theme/frontend/islands/` that calls `customElements.define()` at the end.

```js
class CartNote extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController()
    this.addEventListener('change', this.onChange.bind(this), {
      signal: this.controller.signal,
    })
  }

  disconnectedCallback() {
    this.controller?.abort()
  }

  async onChange() {
    try {
      await fetch(routes.cart_update_url, {
        ...fetchConfig('javascript', { note: this.querySelector('textarea').value }),
        signal: this.controller.signal,
      })
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    }
  }
}

customElements.define('cart-note', CartNote)
export default CartNote
```

## Further Reading

- [CSS Standards](./css-standards) -- Tailwind utility-first patterns and the layer system
- [Accessibility](./accessibility) -- WCAG 2.2 patterns that affect island JavaScript
- [Compliance Audit](./compliance-audit) -- Record of all JavaScript violations found and fixed
