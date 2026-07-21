---
name: hyper-structural-ui
description: Elite UI protocol synthesizing GPT Taste, Impeccable, Minimalist UI, and Industrial Brutalism. Enforces hyper-structural 1px grids, extreme macro/micro typographic duality, massive GSAP-driven editorial whitespace, and absolute rejection of generic AI templates.
---

# Protocol: Hyper-Structural Editorial UI

This skill synthesizes four advanced design paradigms (GPT Taste, Impeccable, Minimalist UI, Industrial Brutalism) into a single, elite aesthetic. It creates interfaces that feel like a high-end editorial magazine engineered by a military aerospace firm.

## 1. The Core Synthesis
- **From GPT-Taste:** Massive, exaggerated whitespace; extreme GSAP ScrollTrigger motion (pinning, scrubbing, stacking); inline micro-images.
- **From Impeccable:** Production-grade detail; absolute ban on AI tells (no generic bento boxes, no glassmorphism, no ghost cards, no `01 / ABOUT` eyebrows).
- **From Minimalist UI:** Premium, restrained color palettes (warm off-white or absolute black); precisely calculated typographic contrast; muted/pastel tactical accents.
- **From Industrial Brutalism:** Unforgiving 1px architectural grids; total rejection of `border-radius`; macro-vs-micro typography duality; physical degradation (noise, CRT grain).

## 2. Absolute Bans (Anti-Slop Protocol)
Refuse-and-rewrite if any of these are present:
- **No Soft UI:** Zero drop shadows, zero glassmorphism (`backdrop-blur` allowed ONLY for fixed navbars), zero rounded corners (`border-radius: 0` exclusively).
- **No Generic Scaffolding:** No 3-column equal card grids. No repetitive `01 · SECTION` kickers.
- **No System Defaults:** Ban `Inter`, `Roboto`, `Lucide`, `Feather`.
- **No Mathematical Centering as Default:** Layouts must embrace asymmetry, offset grids, and deliberate tension.

## 3. Typographic Architecture
Typography is the primary structural material. Use extreme contrast:
- **Macro-Structure:** Heavy Grotesk (e.g., `Inter Black`, `Clash Display`, `Helvetica Neue`) deployed at massive fluid scales (`clamp(4rem, 15vw, 15rem)`). Tracking must be tight (`-0.04em` to `-0.06em`). All caps.
- **Micro-Data:** Technical Monospace (`JetBrains Mono`, `Space Mono`) at `10px - 12px`. Wide tracking (`0.05em`). Used for all metadata, labels, and timestamps.
- **Editorial Disruption:** High-Contrast Serif (`Playfair Display`, `Newsreader`, `Instrument Serif`). Used sparingly for quotes, massive background watermarks, or italicized emphasis within Grotesk headlines.

## 4. Architectural Layout & Grid Determinism
- **1px Mathematical Grids:** Use `display: grid; gap: 1px;` with contrasting background/surface colors to draw flawless 1px dividing lines.
- **Massive Whitespace (GPT-Taste):** Spacing must be uncomfortable. Use `py-32`, `py-48`, or `min-h-[100dvh]` for section padding. Elements must not crowd each other.
- **Inline Micro-Assets:** Embed tiny, meticulously placed images or SVG icons (24x24px) directly within flowing editorial text.

## 5. Color Strategy (Committed Monochrome)
Pick ONE substrate and commit fully. No gradients.
- **Light Mode (Editorial Print):** Canvas `#FBFBFA` (Bone White). Ink `#050505` (Carbon). Grid Lines `#EAEAEA`. Accents: Washed-out utilitarian pastels (Pale Red, Pale Blue).
- **Dark Mode (Tactical Telemetry):** Canvas `#0A0A0A` (Deactivated CRT). Ink `#EAEAEA` (White Phosphor). Grid Lines `#222222`. Accents: Aviation Red (`#FF2A2A`) or Terminal Green (`#4AF626`).

## 6. Physical Textures & Degradation
- **Always Apply Noise:** A fixed `pointer-events-none` SVG noise overlay (`opacity: 0.03` to `0.05`) must cover the entire viewport to kill digital flatness.
- **Halftone / Scanlines:** Incorporate CSS repeating linear gradients (scanlines) or SVG dot matrices (halftones) to degrade perfect vector shapes or photography.

## 7. Motion & Interaction (GSAP Mastery)
Motion must feel heavy, deliberate, and hardware-accelerated.
- **ScrollTriggers:** Use GSAP ScrollTrigger for true parallax, section pinning (e.g., pinning the left column while the right column scrolls), and text-color scrubbing.
- **Sharp Reveals:** Elements enter with `expo.out` easing. No elastic bounces. Use `clip-path` reveals or sharp `translateY` slides.
- **Interactive States:** Hover states trigger 1px border color shifts, text color inversion, or subtle `-translate-y-[1px]` movements. Focus states must use sharp, high-contrast outlines (accessibility enforced by `impeccable`).

## Execution Flow
1. **Canvas Setup:** Establish the 1px grid, the color substrate, and the SVG noise layer.
2. **Typography Constraints:** Implement the Grotesk / Mono / Serif triad.
3. **Macro-Structure:** Map out asymmetric sections using massive padding.
4. **Motion Injection:** Wire up GSAP for scroll-driven pinning and sharp entry reveals.
5. **Impeccable QA:** Scrutinize for generic AI patterns, contrast failures, and missing keyboard focus states. Eliminate them.
