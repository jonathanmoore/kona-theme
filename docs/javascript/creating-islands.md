# Creating Islands

This guide walks through creating a new island component from scratch -- from the JavaScript file to the Liquid snippet to seeing it hydrate in the browser.

## What Is an Island?

An island is a Web Component (custom element) that hydrates a server-rendered Liquid snippet with client-side interactivity. The Liquid template renders the HTML; the island file adds behavior.

Each island file in `theme/frontend/islands/` maps to a custom element tag name. The filename determines the tag: `collapsible-text.js` becomes `<collapsible-text>`.

## Step 1: Create the Island File

Create a new file at `theme/frontend/islands/collapsible-text.js`:

```js
class CollapsibleText extends window.HTMLElement {
  connectedCallback() {
    this.controller = new AbortController()
    const { signal } = this.controller

    this.button = this.querySelector('[data-toggle]')
    this.content = this.querySelector('[data-content]')

    this.button.addEventListener('click', this.toggle.bind(this), { signal })
  }

  disconnectedCallback() {
    this.controller?.abort()
  }

  toggle() {
    const expanded = this.button.getAttribute('aria-expanded') === 'true'
    this.button.setAttribute('aria-expanded', String(!expanded))
    this.content.toggleAttribute('hidden', expanded)
  }
}

window.customElements.define('collapsible-text', CollapsibleText)
```

Key points:

- Extend `window.HTMLElement` (always use the window reference).
- Set up `AbortController` in `connectedCallback`, not the constructor.
- Pass `{ signal }` to every `addEventListener` call.
- Call `this.controller?.abort()` in `disconnectedCallback`.
- Register with `customElements.define()` at the bottom of the file.

## Step 2: Create the Liquid Snippet

Create `theme/snippets/collapsible-text.liquid`:

```liquid
{% doc %}
  Renders a collapsible text block with a toggle button.

  @param {string} heading - The toggle button text
  @param {string} content - The collapsible body text
{% enddoc %}

<collapsible-text client:visible>
  <button
    data-toggle
    type="button"
    aria-expanded="false"
    aria-controls="CollapsibleContent-{{ section.id }}"
    class="flex w-full items-center justify-between py-3 text-left"
  >
    <span>{{ heading }}</span>
    <span aria-hidden="true">+</span>
  </button>
  <div
    data-content
    id="CollapsibleContent-{{ section.id }}"
    hidden
    class="pb-4"
  >
    {{ content }}
  </div>
</collapsible-text>
```

The HTML is fully functional server-side -- the `hidden` attribute hides the content, and the button does nothing until JavaScript hydrates. This is progressive enhancement.

## Step 3: Use in a Section or Block

Render the snippet from any section or block:

```liquid
{% render 'collapsible-text',
  heading: block.settings.heading,
  content: block.settings.content
%}
```

## How Revive Discovers Islands

The hydration runtime (`vite-plugin-shopify-theme-islands/revive`) uses `import.meta.glob()` to build a map of all `theme/frontend/islands/*.js` files at build time. When the page loads, it:

1. Scans the DOM for custom elements with kebab-case tag names.
2. Checks if the tag name matches an island filename.
3. Reads the hydration directive attribute (`client:idle`, `client:visible`, or `client:media`).
4. Dynamically imports the matching island file using the appropriate strategy.

You do not need to manually register islands in any central file. Placing a `.js` file in the `islands/` directory and using the matching custom element tag in Liquid is all that is required.

## Hydration Directives

Set a hydration directive as an HTML attribute on the custom element tag to control when the island loads:

### `client:idle`

Loads when the browser's main thread is free, using `requestIdleCallback`. Best for components needed soon after page load but not immediately visible (e.g., cart drawer, product form).

```html
<cart-drawer client:idle>
  ...
</cart-drawer>
```

### `client:visible`

Loads when the element enters the viewport, using `IntersectionObserver`. Best for components below the fold (e.g., product recommendations, footer localization).

```html
<product-recommendations client:visible>
  ...
</product-recommendations>
```

### `client:media`

Loads when a CSS media query matches. Best for components that only exist at certain breakpoints (e.g., mobile menu drawer).

```html
<header-drawer client:media="(max-width: 1023px)">
  ...
</header-drawer>
```

## Extending an Existing Island

If your new island shares behavior with an existing one, extend its class instead of duplicating code:

```js
import DetailsModal from '@/islands/details-modal'

class MyModal extends DetailsModal {
  open(event) {
    // Custom open behavior
    super.open(event)
    this.classList.add('my-modal--active')
  }
}

window.customElements.define('my-modal', MyModal)
```

The parent class must use `export default` for this pattern. See the existing hierarchy:

- `DetailsModal` is extended by `HeaderDrawer` and `PasswordModal`
- `CartItems` is extended by `CartDrawerItems`
- `VariantSelects` is extended by `VariantRadios`

## Checklist

When creating a new island, verify:

1. **File location** -- `theme/frontend/islands/<tag-name>.js`
2. **Filename matches tag** -- `collapsible-text.js` defines `<collapsible-text>`
3. **AbortController** -- created in `connectedCallback`, aborted in `disconnectedCallback`
4. **All listeners use signal** -- `addEventListener(type, handler, { signal })`
5. **All fetch calls use signal** -- `fetch(url, { signal: this.controller.signal })`
6. **Minimal constructor** -- only `super()` and static reads; no listeners, no DOM queries that depend on parent context
7. **Hydration directive** -- the Liquid template sets `client:idle`, `client:visible`, or `client:media`
8. **Progressive enhancement** -- the server-rendered HTML works without JavaScript
9. **Import alias** -- use `@/` for all project imports (e.g., `@/lib/events`)
10. **No semicolons** -- follow the project style convention

## Further Reading

- [Lifecycle](./lifecycle) -- detailed callback patterns and anti-patterns
- [Event System](./event-system) -- dispatching and listening to theme events
- [Component Reference](./component-reference) -- all 16 production islands
- [Utilities](./utilities) -- helper functions available to islands
