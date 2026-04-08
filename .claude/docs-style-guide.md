# Docs Style Guide

The voice for Kona's documentation: a knowledgeable colleague showing you around the codebase — direct, practical, leads with what you need to start.

## Voice & Tone

| Principle | Avoid | Adopt |
|-----------|-------|-------|
| **Opener** | "Kona is a Vite-powered Shopify theme with islands hydration architecture." | "Get your dev environment running and start building with islands, Vite, and Tailwind." |
| **Perspective** | Third-person declarative ("The system uses...") | Second-person active ("You use...") |
| **Framing** | System description | Developer goal |
| **Density** | Multiple ideas per paragraph | One idea per paragraph, max 3 sentences |
| **Assumed knowledge** | Explains what Liquid is, how sections work, what Web Components are | Links to Shopify/MDN docs for basics, focuses on what's different here |

## Page Structure

```
# Title

1-3 sentence opener: what this page helps you do.

## What you'll learn  ← tutorials/guides only (bulleted, 3-5 items)

## Prerequisites  ← if any (bulleted, linked)

## Body
  - Tutorials: numbered steps
  - Concepts: one concept per H2
  - Reference: tables with 2-sentence intro

## Next steps  ← 2-4 forward links
```

## Writing Rules

1. **Lead with what's critical.** Don't bury the unique stuff after explaining the generic. If someone needs to know about hydration directives to use this theme, that goes first.
2. **One idea per paragraph.** If you're using "also" or "additionally," start a new paragraph.
3. **Lead with the action.** "Run `pnpm dev`" not "The pnpm dev command can be used to..."
4. **Headings describe outcomes.** "Start the dev server" not "Development Server Configuration"
5. **Assume Shopify familiarity.** Don't explain what sections, blocks, Liquid, or the Shopify CDN are. Link to shopify.dev for basics.
6. **Assume web platform familiarity.** Don't explain what Web Components, custom elements, or `IntersectionObserver` are. Link to MDN.
7. **Code blocks answer a question.** Every block answers "what do I type?" or "what does this look like?"
8. **Tables for lookup, prose for understanding.**
9. **One callout per page max.** Tips/warnings lose impact when overused.
10. **Don't repeat cross-page context.** Say "Liquid renders HTML server-side" once in the architecture overview, then link to it.
11. **Mermaid diagrams earn their spot.** Keep only when they reveal relationships not obvious from prose.
12. **Reference pages keep their length.** Don't try to shorten component-reference or utilities — their length is correct for lookup. Focus rewrites on tone and intros.

## Patterns Borrowed

**From Shopify docs:** "What you'll learn" sections, numbered steps, comparison sections, conversational openers, "Next steps" footer.

**From Barrel (shopify-vite):** Ultra-short overviews (1-2 sentences), code appears early, "fastest path" presented first, info callouts only at critical decision points, linear progression.

**Keep from current docs:** Cross-linking, frontmatter style, table-driven reference pages, mermaid for complex flows.
