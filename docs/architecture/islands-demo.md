---
title: Islands Demo
---

# Islands Demo

A theme section that visualizes island hydration in real time. Each card transitions from "Waiting" to "Hydrated" with timestamps, so you can see exactly when each directive fires.

## Components

Nine islands demonstrate each directive:

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

## How it works

Each island calls a shared `hydrate()` function from `frontend/lib/island-demo.js` that updates the card's class, timestamp, and status.

### Unique tag names

The hydration runtime tracks islands per tag name, not per element. Each demo card uses a unique tag so directives run independently.

### Nested islands

The child is invisible until the parent hydrates. Once the parent renders, the runtime re-walks its subtree and discovers the child. Timestamps show the timing cascade.

### Event log

The section captures `islands:load` events. Each event includes:

```js
{
  tag: 'island-demo-idle',  // Custom element tag name
  duration: 12,             // Hydration time in ms
  attempt: 1                // Import attempt (1 = first try)
}
```

A classic `<script>` tag (non-module) registers listeners before ES modules execute, so no events are missed.

## Add the demo to your store

The section is included in the homepage template. Add it to any page through the theme editor. The schema supports a customizable heading:

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

## Source files

| File | Purpose |
|------|---------|
| `theme/sections/islands-demo.liquid` | Section template |
| `theme/frontend/lib/island-demo.js` | Shared hydration helper |
| `theme/frontend/islands/island-demo-*.js` | Individual demo islands |

## Next steps

- [Islands Architecture](/architecture/islands) — How the hydration system works
- [Hydration Directives](/architecture/hydration-directives) — All 5 directives explained
- [Creating Islands](/assets/creating-islands) — Build your own island component
