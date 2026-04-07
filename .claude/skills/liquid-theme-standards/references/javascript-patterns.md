# JavaScript Patterns for Island Hydration Theme

## Island Component Lifecycle

```javascript
// theme/frontend/islands/my-component.js

class MyComponent extends HTMLElement {
  #abortController = null

  constructor() {
    super()
    // Bind event listeners that need the constructor context
    this.addEventListener('keyup', (evt) => {
      if (evt.code === 'Escape') this.close()
    })
  }

  connectedCallback() {
    this.#abortController = new AbortController()
    this.#setup()
  }

  disconnectedCallback() {
    this.#abortController?.abort()
  }

  #setup() {
    // Initialize refs, bind events using abort signal
    this.querySelector('[data-trigger]')?.addEventListener(
      'click',
      this.#handleClick.bind(this),
      { signal: this.#abortController.signal }
    )
  }

  #handleClick(event) {
    event.preventDefault()
    // Handle interaction
  }
}

customElements.define('my-component', MyComponent)
```

## Hydration Directive Usage

Choose the right directive based on when the component needs to be interactive:

```liquid
{%- comment -%} Visible: for below-fold content (most common) {%- endcomment -%}
<product-recommendations client:visible>
  <!-- Loads JS when user scrolls to it -->
</product-recommendations>

{%- comment -%} Idle: for non-critical above-fold interactivity {%- endcomment -%}
<details-disclosure client:idle>
  <!-- Loads JS during browser idle time -->
</details-disclosure>

{%- comment -%} Media: for desktop-only components {%- endcomment -%}
<mega-menu client:media="(min-width: 768px)">
  <!-- Only loads JS on desktop viewports -->
</mega-menu>

{%- comment -%} No directive: loads immediately (use sparingly) {%- endcomment -%}
<sticky-header>
  <!-- Loads JS right away — only for critical above-fold components -->
</sticky-header>
```

## Event-Driven Architecture

### Custom Events with Typed Details

```javascript
/**
 * @typedef {Object} CartUpdateDetail
 * @property {number} itemCount - Total items in cart
 * @property {number} totalPrice - Cart total in cents
 */

// Dispatching
/** @type {CustomEvent<CartUpdateDetail>} */
const event = new CustomEvent('cart:updated', {
  detail: { itemCount: 3, totalPrice: 4500 },
  bubbles: true
})
this.dispatchEvent(event)

// Listening (in another island)
document.addEventListener('cart:updated', (event) => {
  const { itemCount, totalPrice } = event.detail
  this.#updateDisplay(itemCount, totalPrice)
})
```

### Event Naming Convention

Use `namespace:action` format:
- `cart:item-added`, `cart:updated`, `cart:emptied`
- `variant:selected`, `variant:unavailable`
- `filter:applied`, `filter:cleared`
- `search:submitted`, `search:results-loaded`

## Data Loading Pattern

```javascript
class ProductLoader extends HTMLElement {
  #controller = null

  async load(url) {
    this.#controller?.abort()
    this.#controller = new AbortController()

    this.setAttribute('aria-busy', 'true')

    try {
      const response = await fetch(url, {
        signal: this.#controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const newContent = doc.querySelector('.product-grid')

      if (newContent) {
        this.querySelector('.product-grid')?.replaceWith(newContent)
      }

      return newContent
    } catch (error) {
      if (error.name === 'AbortError') return null
      console.error('Load error:', error)
      throw error
    } finally {
      this.setAttribute('aria-busy', 'false')
    }
  }

  disconnectedCallback() {
    this.#controller?.abort()
  }
}

customElements.define('product-loader', ProductLoader)
```

## Section Rendering Pattern

Many islands re-render sections via Shopify's Section Rendering API:

```javascript
class CartForm extends HTMLElement {
  getSectionsToRender() {
    return [
      { id: 'cart-drawer', selector: '#CartDrawer' },
      { id: 'cart-icon-bubble' }
    ]
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML
  }

  renderContents(parsedState) {
    for (const section of this.getSectionsToRender()) {
      const element = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id)

      element.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      )
    }
  }
}
```

## URL Manipulation

```javascript
// Reading URL parameters
const url = new URL(window.location.href)
const filter = url.searchParams.get('filter')

// Updating URL parameters
const updateURL = (params) => {
  const url = new URL(window.location.href)

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
  }

  history.pushState(null, '', url.toString())
}

// Never do this:
// let url = window.location.pathname + '?filter=' + value
```

## Optimistic UI

```javascript
async addToCart(variantId) {
  // 1. Update UI immediately
  this.#setButtonState('adding')
  this.#incrementCartCount()

  try {
    // 2. Make request
    const formData = new FormData()
    formData.append('id', variantId)
    formData.append('quantity', '1')

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Failed')

    // 3. Confirm success
    this.#setButtonState('added')
  } catch (error) {
    // 4. Revert on failure
    this.#setButtonState('error')
    this.#decrementCartCount()
    console.error('Add to cart failed:', error)
  }
}
```

## Debounce Pattern

```javascript
/**
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Usage: search input (300ms), resize handler (150ms)
const handleSearch = debounce((query) => {
  // Perform search
}, 300)
```

## Using Shared Libraries

Import shared utilities from `@/lib/`:

```javascript
// Focus management
import { trapFocus, removeTrapFocus } from '@/lib/a11y'

// In your island:
open(trigger) {
  this.activeElement = trigger
  trapFocus(this.querySelector('#Container'), this.querySelector('[tabindex="-1"]'))
}

close() {
  removeTrapFocus(this.activeElement)
}
```

## JSDoc Type Annotations

```javascript
/**
 * @typedef {Object} ProductData
 * @property {string} id - Product ID
 * @property {string} title - Product title
 * @property {number} price - Price in cents
 * @property {boolean} available - Whether in stock
 * @property {string[]} tags - Product tags
 */

/**
 * Formats a price from cents to display string.
 * @param {number} cents - Price in cents
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted price
 */
const formatPrice = (cents, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100)
}
```

## Error Handling

```javascript
// Always wrap fetch in try/catch
const fetchJSON = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') return null
    console.error(`Fetch error for ${url}:`, error)
    return null
  }
}

// Validate DOM elements before use
const getElement = (selector, context = document) => {
  const element = context.querySelector(selector)
  if (!element) {
    console.warn(`Element not found: ${selector}`)
  }
  return element
}
```

## File Organization

Each island file = one component. Group related functionality by feature:

```
theme/frontend/islands/
├── cart-drawer.js           # Cart drawer open/close/render
├── cart-drawer-items.js     # Cart line item interactions
├── cart-items.js            # Cart page line items
├── cart-note.js             # Cart note textarea
├── cart-remove-button.js    # Remove item from cart
├── product-form.js          # Add to cart form
├── variant-radios.js        # Radio-based variant picker
├── variant-selects.js       # Select-based variant picker
├── header-drawer.js         # Mobile menu drawer
├── sticky-header.js         # Scroll-aware header
└── details-disclosure.js    # Enhanced details/summary
```

Unlike the old pattern of grouping multiple classes in one file, each island file exports a single component that maps 1:1 with its custom element tag name.
