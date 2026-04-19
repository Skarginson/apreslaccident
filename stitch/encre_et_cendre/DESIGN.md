# Design System Document: The Relic Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Relic Ledger**
This design system moves away from the "app" aesthetic and toward the "artifact." We are not building a tool; we are curate-ing a digital space that feels like a heavy, ink-stained journal found in a quiet room. The experience must feel solemn, analog, and heavy with the weight of memory.

To achieve this, we reject standard "digital-first" layouts. We lean into **intentional asymmetry**, high-contrast editorial typography, and the concept of "The Breathing Page." We break the rigid grid by treating the screen as a physical canvas where elements are placed with the deliberation of a museum exhibit. Every pixel of whitespace is a moment of silence; do not rush to fill it.

---

### 2. Colors & Materiality
The palette is rooted in the tactile history of paper and ink. We use a sophisticated hierarchy of warm neutrals to define space without ever resorting to structural lines.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through tonal shifts. For example, a `surface_container_low` sidebar sits against a `surface` main body. This creates a soft, felt-like transition rather than a harsh digital cut.
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of stacked sheets.
    *   `surface_container_lowest`: Use for the most "recessed" or background elements.
    *   `surface`: The primary page color.
    *   `surface_container_high`: Use for "hovering" elements or active focal points.
*   **The "Ink & Grain" Rule:** To provide visual soul, all surfaces must feature a subtle, non-tiling paper grain texture (applied via a low-opacity overlay).
*   **Signature Gradients:** For primary CTAs (using the `primary` #6c1518 token), use a very subtle linear gradient toward `primary_container` (#8b2c2c). This simulates the way ink pools and dries unevenly on a page, providing a professional polish that flat hex codes lack.

---

### 3. Typography
Our typography is a dialogue between the "Chrome" (the world surrounding the player) and the "Soul" (the player's thoughts).

*   **UI/Chrome (Newsreader):** This is our authoritative, editorial voice. It should feel classic and timeless.
    *   **Display/Headline:** Use high-contrast sizing. A `display-lg` (3.5rem) should feel monumental, surrounded by significant whitespace.
    *   **Labels:** `label-sm` (0.6875rem) should be used for secondary metadata, tracked with extra letter-spacing (0.05rem) to feel like a cataloguer’s notes.
*   **The Journal (Caveat):** All user-generated content must use this handwritten face. It represents the fragile, human element within the solemn UI. It should never be used for buttons or navigation—only for the narrative.

---

### 4. Elevation & Depth
In an analog system, depth is achieved through **Tonal Layering** and physical stacking, not synthetic drop shadows.

*   **The Layering Principle:** Avoid shadows where possible. Achieve "lift" by placing a `surface_container_highest` element on top of a `surface_dim` background. This mimics the look of a card placed on a desk.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(29, 28, 22, 0.06)`. The shadow must be tinted with the `on_surface` color to feel like natural light occlusion rather than a "drop shadow" effect.
*   **The "Ghost Border" Fallback:** For accessibility in forms, use the `outline_variant` at 15% opacity. Never use 100% opaque borders.
*   **Edge Treatment:** All corners must be **0px (Sharp)**. Rounded corners are too modern and friendly for this experience. We want the sharp, clean cut of a paper trimmer.

---

### 5. Components

#### Buttons
*   **Primary:** A solid block of `primary` (#6c1518) with `on_primary` text. No rounded corners. The hover state should simply shift the color to `primary_container`.
*   **Secondary/Tertiary:** Avoid boxes. Use `title-sm` typography with a simple 1px underline (using `outline_variant` at 30% opacity) that expands on hover.

#### Input Fields
*   **Journal Area:** No box. A single horizontal line (`outline_variant`) at the bottom of the text area, simulating a lined notebook.
*   **Focus State:** The line color shifts to `primary`, and a subtle `surface_container_low` background wash appears.

#### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal rules to separate list items. Use **Vertical Spacing** (32px or 48px gaps) or alternating tonal shifts between `surface` and `surface_container_low`.
*   **Asymmetric Cards:** When displaying prompts, stagger the cards slightly off-center to break the "web-template" feel.

#### Icons
*   **Hand-Drawn Quality:** Icons must not be font-based or geometric. Use custom SVGs that look like quick ink sketches (suits, footprints). They should have slight imperfections and "rough" edges. Use `secondary` (#665d54) for icon strokes.

---

### 6. Do's and Don'ts

**Do:**
*   **Embrace the Void:** If a page feels empty, resist the urge to add "features." The emptiness is the atmosphere.
*   **Use Intentional Misalignment:** Align a title to the far left and the body text to the far right to create a sophisticated, editorial tension.
*   **Prioritize Readability:** Despite the "aged" look, ensure the contrast between `on_surface` and `surface` meets WCAG AA standards.

**Don't:**
*   **No Gamification:** Never use progress bars, glowing particles, or "level-up" style animations.
*   **No Smooth Easing:** If animating transitions, use "Cubic" or "Linear" fades. Avoid the "bouncy" or "snappy" easing typical of modern SaaS apps.
*   **No Pure Black:** Never use #000000. Use our "Near-Black Ink" (`on_surface` #1d1c16) to maintain the analog warmth.