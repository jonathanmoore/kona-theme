---
title: Islands Demo
---

# Islands Demo

An educational section demonstrating the island hydration system with observable transitions and a real-time event log. Each demo card shows a "Waiting" to "Hydrated" transition with timestamps and event capture.

## Demo Components

Nine island components demonstrate each hydration directive:

| Component | Directive | Trigger |
|-----------|-----------|---------|
| `island-demo-idle` | `client:idle` | `requestIdleCallback` (500ms timeout) |
| `island-demo-visible` | `client:visible` | `IntersectionObserver` (200px rootMargin) |
| `island-demo-media` | `client:media="(min-width: 768px)"` | Desktop viewport |
| `island-demo-media-mobile` | `client:media="(max-width: 767px)"` | Mobile viewport |
| `island-demo-defer` | `client:defer` | `setTimeout` (2s) |
| `island-demo-interaction` | `client:interaction` | `mouseenter`, `touchstart`, `focusin` |
| `island-demo-parent` | `client:idle` | Parent in nested demo |
| `island-demo-child` | `client:visible` | Child in nested demo |

## How It Works

Each demo island shares a `hydrate()` function from `frontend/lib/island-demo.js` that updates the card's class, timestamp, and status attributes when the component hydrates.

### Unique Tag Names

The hydration runtime tracks islands **per tag name**, not per element. Each demo card uses a unique custom element tag so directives run independently of each other.

### Nested Islands

The nested demo shows cascading discovery. The child element is invisible until the parent hydrates and renders its content. Once the parent is in the DOM, the runtime re-walks the parent's subtree and discovers the child. Timestamps on each card demonstrate the timing cascade.

### Event Log

The demo section captures `islands:load` events from the hydration runtime. Each event includes:

```js
{
  tag: 'island-demo-idle',  // Custom element tag name
  duration: 12,             // Hydration time in ms
  attempt: 1                // Import attempt (1 = first try)
}
```

A classic `<script>` tag (non-module) registers event listeners before ES modules execute, ensuring no events are missed.

## Adding the Demo to Your Store

The demo section is included in the homepage template at `templates/index.json`. It can be added to any page through the Shopify theme editor by adding the "Islands Demo" section.

The section schema supports a customizable heading:

```json
{
  "name": "t:sections.islands_demo.name",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "t:sections.islands_demo.settings.heading.label"
    }
  ]
}
```

## Source Files

- **Section**: `theme/sections/islands-demo.liquid`
- **Shared hydration helper**: `theme/frontend/lib/island-demo.js`
- **Island files**: `theme/frontend/islands/island-demo-*.js`

## Related

- [Islands Architecture](/architecture/islands) — How the hydration system works
- [Hydration Directives](/architecture/hydration-directives) — All 5 directives explained
- [Creating Islands](/javascript/creating-islands) — Build your own island component
