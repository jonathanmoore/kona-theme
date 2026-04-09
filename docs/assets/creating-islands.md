# Creating Islands

Build a new island from scratch — the JS file, the Liquid snippet, and the hydration directive.

## What you'll learn

- How to create an island Web Component with proper lifecycle management
- How to write a Liquid snippet that works with and without JavaScript
- How revive discovers and hydrates islands automatically

## Step 1: Create the island file

Create `theme/frontend/islands/collapsible-text.js`:

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

- Extend `window.HTMLElement` (always use the window reference)
- Create `AbortController` in `connectedCallback`, not the constructor
- Pass `{ signal }` to every `addEventListener` call
- Call `this.controller?.abort()` in `disconnectedCallback`
- Register with `customElements.define()` at the bottom

## Step 2: Create the Liquid snippet

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

The HTML works without JavaScript — `hidden` hides the content, and the button is inert until the island hydrates. This is progressive enhancement.

## Step 3: Use in a section or block

```liquid
{% render 'collapsible-text',
  heading: block.settings.heading,
  content: block.settings.content
%}
```

## How revive discovers islands

The hydration runtime from [`vite-plugin-shopify-theme-islands`](https://github.com/Rees1993/vite-plugin-shopify-theme-islands) uses `import.meta.glob()` to build a map of all `theme/frontend/islands/*.js` files at build time. When the page loads, it scans the DOM for matching custom elements, reads the `client:*` directive, and dynamically imports the module.

You don't register islands in any central file. Place a `.js` file in `islands/` and use the matching tag in Liquid — that's it.

## Choose a hydration directive

Set one on the custom element tag to control when the island loads:

- **`client:idle`** — After the main thread is free. Best for above-the-fold components needed soon (cart drawer, product form).
- **`client:visible`** — When the element enters the viewport. Best for below-the-fold content.
- **`client:media="(query)"`** — When a media query matches. Best for viewport-specific components (mobile menu).

See [Hydration Directives](/architecture/hydration-directives) for all five options.

## Extend an existing island

If your island shares behavior with an existing one, extend its class:

```js
import DetailsModal from '@/islands/details-modal'

class MyModal extends DetailsModal {
  open(event) {
    super.open(event)
    this.classList.add('my-modal--active')
  }
}

window.customElements.define('my-modal', MyModal)
```

Existing hierarchy: `DetailsModal` → `HeaderDrawer`, `PasswordModal`. `CartItems` → `CartDrawerItems`. `VariantSelects` → `VariantRadios`.

## Checklist

1. **File location** — `theme/frontend/islands/<tag-name>.js`
2. **Filename matches tag** — `collapsible-text.js` → `<collapsible-text>`
3. **AbortController** — created in `connectedCallback`, aborted in `disconnectedCallback`
4. **All listeners use signal** — `addEventListener(type, handler, { signal })`
5. **All fetch calls use signal** — `fetch(url, { signal: this.controller.signal })`
6. **Minimal constructor** — only `super()` and static reads
7. **Hydration directive** — `client:idle`, `client:visible`, or `client:media`
8. **Progressive enhancement** — server-rendered HTML works without JS
9. **Import alias** — `@/` for all project imports
10. **No semicolons**

## Next steps

- [Lifecycle](./lifecycle) — Detailed callback patterns and anti-patterns
- [Event System](./event-system) — Dispatch and listen to theme events
- [Utilities](./utilities) — Helper functions available to islands
