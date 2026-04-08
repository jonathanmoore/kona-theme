# Islands Architecture Demo

An educational section that demonstrates every hydration directive supported by `vite-plugin-shopify-theme-islands`. Each card shows a live waiting-to-hydrated transition with timestamps, and a real-time event log captures every `islands:load` event as it fires.

## Why

The island hydration system is the core architectural pattern of this theme, but it's invisible by default — components just work. This demo section makes the hydration behavior observable: you can see exactly when each directive triggers, compare timestamps, and understand the cascading discovery of nested islands. Useful for onboarding developers, debugging hydration timing, and validating that directives behave as documented.

## File Overview

| File | Purpose |
|------|---------|
| `frontend/lib/island-demo.js` | Shared `hydrate()` function used by all demo islands |
| `frontend/islands/island-demo-idle.js` | `<island-demo-idle>` — demonstrates `client:idle` |
| `frontend/islands/island-demo-visible.js` | `<island-demo-visible>` — demonstrates `client:visible` |
| `frontend/islands/island-demo-media.js` | `<island-demo-media>` — demonstrates `client:media` (desktop) |
| `frontend/islands/island-demo-media-mobile.js` | `<island-demo-media-mobile>` — demonstrates `client:media` (mobile) |
| `frontend/islands/island-demo-defer.js` | `<island-demo-defer>` — demonstrates `client:defer` |
| `frontend/islands/island-demo-interaction.js` | `<island-demo-interaction>` — demonstrates `client:interaction` |
| `frontend/islands/island-demo-parent.js` | `<island-demo-parent>` — parent in the nested islands demo |
| `frontend/islands/island-demo-child.js` | `<island-demo-child>` — child in the nested islands demo |
| `snippets/islands-demo-card.liquid` | Reusable snippet rendering one demo card |
| `sections/islands-demo.liquid` | The full demo section (header, grid, nested demo, event log) |

## Architecture

### Why One Tag Per Card

The hydration runtime (`vite-plugin-shopify-theme-islands`) tracks islands **per tag name**, not per element instance. When the runtime encounters a custom element tag it hasn't seen before, it:

1. Queues the tag name (deduplicating — only the first element of that tag triggers loading)
2. Runs the directive orchestration (e.g. `waitIdle`, `waitVisible`) on that first element
3. Loads the JS chunk, which calls `customElements.define()`
4. The browser then calls `connectedCallback` on **all** existing elements of that tag simultaneously

This means if all five demo cards shared a single `<island-demo>` tag, only the first card's directive would run — and all five would hydrate at the same time when that one directive resolves.

The fix: each card uses a unique tag (`island-demo-idle`, `island-demo-visible`, etc.), so the runtime runs each directive independently. All tags share the same `hydrate()` function via `frontend/lib/island-demo.js`.

### Shared Hydrate Function

`frontend/lib/island-demo.js` exports a single `hydrate(el)` function. Each island file is a thin wrapper:

```js
import { hydrate } from '@/lib/island-demo'

class IslandDemoIdle extends window.HTMLElement {
  connectedCallback() { hydrate(this) }
}

window.customElements.define('island-demo-idle', IslandDemoIdle)
```

The `hydrate()` function:

1. Adds `is-hydrated` class to the host element (triggers CSS transitions on children)
2. Adds `is-active` class to `[data-demo-indicator]` (animates the progress bar)
3. Sets `[data-demo-timestamp]` to a `HH:MM:SS.mmm` timestamp
4. Sets `[data-demo-status]` text from "Waiting" to "Hydrated" and adds a `data-hydrated` attribute (triggers the green badge style)

### Reusable Snippet

`snippets/islands-demo-card.liquid` accepts parameters via `{% render %}`:

| Parameter | Required | Example | Purpose |
|-----------|----------|---------|---------|
| `tag` | Yes | `'island-demo-idle'` | Custom element tag name |
| `directive` | Yes | `'client:idle'` | Hydration attribute name |
| `directive_value` | No | `'(min-width: 768px)'` | Attribute value (for media, defer) |
| `title` | Yes | `'client:idle'` | Display label in the card header |
| `description` | Yes | `'Hydrates when...'` | Explanation paragraph |

The snippet renders `<{{ tag }} {{ directive }}="{{ directive_value }}">` — a dynamic tag with a dynamic attribute. CSS transitions are driven by the `[.is-hydrated&]` ancestor selector pattern already established in the codebase.

## Directive Demos

### Directive Grid

Six cards in a responsive grid (`md:grid-cols-2 lg:grid-cols-3`):

| Card | Directive | Behavior |
|------|-----------|----------|
| `client:idle` | `requestIdleCallback` (500ms timeout) | Hydrates almost immediately after page load |
| `client:visible` | `IntersectionObserver` (200px root margin) | Hydrates when scrolled into view |
| `client:media` (desktop) | `matchMedia("(min-width: 768px)")` | Hydrates on viewports >=768px; stays "Waiting" on mobile |
| `client:media` (mobile) | `matchMedia("(max-width: 767px)")` | Hydrates on viewports <768px; stays "Waiting" on desktop |
| `client:defer` | `setTimeout(2000)` | Hydrates after a 2-second delay |
| `client:interaction` | `mouseenter`, `touchstart`, `focusin` | Hydrates on hover, touch, or keyboard focus |

The two `client:media` cards are complementary — at any viewport width, exactly one will be "Hydrated" and the other will be "Waiting".

### Nested Islands

A dedicated subsection demonstrating cascading island discovery:

- **Parent** (`<island-demo-parent client:interaction>`) — Waits for user interaction (hover/touch/tab)
- **Child** (`<island-demo-child client:defer="1000">`) — Nested inside the parent's DOM

The child is invisible to the runtime during the initial DOM walk because its parent tag is queued. After the parent hydrates, the runtime re-walks the parent's children (see `runtime.js` line 539: `lifecycle.walk(el)`) and discovers the child. The child then starts its own 1-second defer countdown.

Comparing timestamps makes the cascade visible: the child's timestamp is always ~1s after the parent's.

## Event Log

The section includes a live event log at the bottom that captures every `islands:load` and `islands:error` event dispatched by the hydration runtime.

### Why a Non-Module Script

The event log uses an inline `<script>` (not `<script type="module">`) because:

1. The revive runtime loads as an ES module via `theme.js` in `<head>`
2. ES modules execute deferred — after DOMContentLoaded
3. A `<script type="module">` in the section body would execute *after* modules in `<head>`, missing early events
4. A classic `<script>` runs synchronously during HTML parse, guaranteeing the `addEventListener` call registers before any module fires events

### Event Detail Shape

The `islands:load` event detail object from the runtime:

```js
{
  tag: 'island-demo-idle',  // string — custom element tag name
  duration: 12.3,           // number — ms from directive resolution to chunk load
  attempt: 1                // number — 1 = first try, 2+ = retries
}
```

The log renders each entry as: `#1 islands:load <island-demo-idle> 12.3ms (attempt 1)`

## Adding to a Page

The section is added to the homepage via `templates/index.json` as the last entry in the `order` array. It can also be added to any page through the Shopify theme editor using the "Islands demo" preset.

### Schema

```json
{
  "name": "t:sections.islands_demo.name",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.islands_demo.settings.heading.label",
      "default": "Islands Architecture Demo"
    }
  ],
  "presets": [{ "name": "t:sections.islands_demo.presets.name" }]
}
```

## Lessons Learned

1. **Directives are per-tag, not per-element.** The runtime deduplicates by tag name. After `customElements.define()` runs, the browser calls `connectedCallback` on all existing instances. This is a fundamental constraint of the Web Components spec — `define()` is global.

2. **Nested islands are deferred until parent hydrates.** The runtime's `activate()` function skips any element whose ancestor tag is still in the queue. After a parent loads, `lifecycle.walk(el)` re-scans children. This is intentional — it prevents loading child JS before the parent has set up its DOM.

3. **Event listeners must register before modules execute.** For capturing hydration events from fast directives like `client:idle`, a synchronous classic script is necessary. Module scripts always defer, even when inline.
