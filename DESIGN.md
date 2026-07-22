# Design System: Raw Technical Architecture

## 1. Visual Theme & Atmosphere
A stark, hyper-structural, and unapologetically technical interface. The atmosphere is that of a declassified intelligence blueprint or a raw root-level terminal. It rejects all generic web templates in favor of extreme macro/micro typographic contrast, brutalist massive watermark text, and edge-docked intricate geometric SVGs. Density is high (Cockpit Dense - 8), Variance is structural but asymmetric (6), and Motion is intentionally restricted to ultra-slow background hover transitions (Static Restrained - 2) to maintain a serious, non-decorative tone.

## 2. Color Palette & Roles
The palette is strictly monochrome, relying on stark contrast to establish hierarchy without any saturated hues.
- **Abyss Canvas** (`#0A0A0A`) — Primary background surface. Deepest near-black.
- **Raw Ink** (`#EAEAEA`) — Primary text, SVG strokes, and structural borders.
- **System Grid** (`#222222`) — Secondary borders, muted dividers, and subtle background depths.
- **Pure Override** (`#FFFFFF`) — Single accent color for hover states, active transitions, and critical focus.
*(No other colors are permitted. No neons, no pastels, no AI purples.)*

## 3. Typography Rules
- **Display (Macro):** Extreme scales (`clamp(8rem,25vw,30rem)`). Uses massive tracking (`tracking-tighter`) and tight leading (`leading-[0.75]`). Incorporates transparent text with sharp white strokes (`-webkit-text-stroke: 2px #EAEAEA`).
- **Metadata (Micro):** Tiny, uppercase tracking-wide monospace or highly structural sans-serif for labels, file paths, and terminal syntax (`// SEC.02`, `[ CLASS: AUTOMATION ]`, `>> EXECUTE_MAILTO`).
- **Banned:** Generic system fonts (`Inter`, `Roboto`), any standard serif fonts (`Times New Roman`). Employs distinct sans-serif logic exclusively. No rounded or friendly typefaces.

## 4. Component Stylings
* **Labels / Tags:** Borderless raw text strings formatted as terminal paths or arrays. Completely rejects rounded pills or background-colored chips.
* **Cards:** BANNED. Content lives directly on the canvas or within rigid, border-separated grid cells or raw log table rows.
* **Buttons:** Naked typography with directional arrows (`ACCESS_FULL_ARCHIVE →`). Hover states trigger pure white text color shifts and aggressive translation of the arrow (`group-hover:translate-x-2`).
* **Background Graphics:** Scattered, ultra-low opacity (`0.05`), razor-thin (`stroke-width="0.2"`) geometric SVGs (wireframes, tactical grids, radar sweeps). Positioned strictly on the far outer margins to never overlap text.

## 5. Layout Principles
- **Grid-First & Asymmetric:** Sections use CSS Grid for structural integrity. The Hero is heavily asymmetric, prioritizing massive left-aligned typography against right-aligned lists.
- **Seamless Flow:** Sections utilize `min-h-[100dvh]` with absolute gradient fade masks (`bg-gradient-to-b from-transparent to-[#151515]`) to bleed into one another without harsh borders.
- **Staircase Stacking:** Information architecture relies on staggered, offset rows (zig-zag pattern) rather than uniform 3-column blocks.
- **Full-Width Logs:** Data is presented in 100% width raw tables with monospace timestamps and stark borders.

## 6. Motion & Interaction
- **Restraint Over Flash:** Zero bouncy, easing entrance animations. Elements do not fade or slide up on scroll.
- **Slow Burns:** Interactive background SVGs utilize extreme duration transitions (`duration-[3000ms]`, `opacity-10`) to slowly pulse or reveal when hovered near.
- **Hover Instants:** Typography and interactive links snap to `#FFFFFF` instantly on hover, maintaining a raw, reactive technical feel.

## 7. Anti-Patterns (Banned)
- **NEVER** use colored accents (reds, blues, neons). Monochrome only.
- **NEVER** use border-radius, rounded pills, chips, or traditional floating cards.
- **NEVER** use box-shadows, dropshadows, or glowing neon effects.
- **NEVER** use `Inter`, emojis, or conversational UI copywriting ("Elevate", "Seamless").
- **NEVER** use GSAP entrance reveal animations or bouncing scroll-down arrows.
- **NEVER** allow background SVGs to visually overlap or tangle with reading text.
- **NEVER** use 3-column equal card layouts. All layouts must be raw logs, asymmetric grids, or staircases.
