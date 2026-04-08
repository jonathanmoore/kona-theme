# Coding Standards

Kona Theme enforces coding standards across three categories: JavaScript, CSS, and Accessibility. These standards are codified in Claude Code skill files (`.claude/skills/`) and enforced through linting, code review, and a completed [compliance audit](./compliance-audit).

## Why Standards Matter

Shopify themes run on every page of a storefront. Inconsistent patterns create maintenance burden, accessibility gaps, and performance regressions. These standards exist to keep the codebase predictable:

- **Every island follows the same lifecycle pattern** -- AbortController in `connectedCallback`, cleanup in `disconnectedCallback`, no listeners in constructors.
- **Every transition respects motion preferences** -- `motion-reduce:` variants on all animations, a global `prefers-reduced-motion` reset as a safety net.
- **Every interactive element meets touch target minimums** -- 44px on mobile, enforced through Tailwind's `min-h-11 min-w-11` utilities.
- **Every schema string is translatable** -- `t:` prefixed keys pointing to `en.default.schema.json`, never hardcoded English in `{% schema %}` blocks.

## Categories

### [JavaScript Standards](./javascript-standards)

Web Component lifecycle patterns, async/await, AbortController cleanup, `@/` imports, `for...of` loops, and no semicolons. All interactive behavior ships as vanilla custom elements with zero runtime dependencies.

### [CSS Standards](./css-standards)

Tailwind CSS v4 utility-first approach with a three-layer cascade (base, components, utilities). Design tokens via `@theme`, data attribute variants, and no inline styles except Shopify-generated CSS variables.

### [Accessibility](./accessibility)

WCAG 2.2 patterns for focus management, motion preferences, touch targets, landmarks, live regions, and form accessibility. Covers the reasoning behind specific decisions like keeping the cart drawer as `div[role="dialog"]` instead of native `<dialog>`.

## Compliance

The entire codebase was audited against these standards in a three-phase sprint. Every violation was fixed and verified with passing builds and lint checks.

- [Compliance Audit](./compliance-audit) -- Full record of the three-phase audit with specific files changed and patterns applied.
