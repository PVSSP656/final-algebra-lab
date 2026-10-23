# Architecture

**Analysis Date:** 2026-10-23

## Pattern Overview

**Overall:** Client-Side Mathematical Reactive Single-Page Application (SPA) with Decoupled Pure Mathematical Engine.

**Key Characteristics:**
- **Decoupled Math Engine:** Core mathematical definitions, modular arithmetic, group theory operations, and frequency computations reside in pure TypeScript modules (`src/math/engine.ts`) with zero UI dependencies.
- **Single Source of Truth:** Mathematical state (current transformation system, message, shift key, affine key, permutation index, decrypt flag) is hoisted to top-level `App` component and distributed via props.
- **Reactive Computation Pipeline:** Transformation outputs, reverse operations, frequency distributions, and step-by-step trace steps derive reactively via React `useMemo` hooks.
- **Declarative Navigation:** Custom stateful page router (`page` state) supporting seamless animated page transitions via Framer Motion's `<AnimatePresence mode="wait">`.

## Layers

**1. Mathematical Domain Layer (`src/math/`):**
- Purpose: Implements pure mathematical algorithms, group operations, modular arithmetic, and cryptographic transformation functions.
- Contains: `src/math/engine.ts`
- Depends on: No external libraries (pure TypeScript/JavaScript mathematics).
- Used by: All interactive components and UI calculation panels.

**2. Visual & Interactive Component Layer (`src/components/`):**
- Purpose: Specialized interactive controls and visualizations for each mathematical domain.
- Contains:
  - `CipherWheel.tsx`: Concentric SVG visualization of $\mathbb{Z}_{26}$ modular rotation with dynamic letter cards.
  - `ExperimentsLab.tsx`: Frequency distribution analysis and multiset preservation.
  - `CommonAlgebraicStructure.tsx`: Comprehensive algebraic structural comparison.
  - `TransformationChamber.tsx`: Step-by-step mapping node visualizer.
  - `GroupCipherCards.tsx`: Interactive expandable cards with group axiom definitions.
  - `LabCalculations.tsx`: Live algebraic step traces.
  - `MathView.tsx`: KaTeX renderer wrapper.
  - `SwarmCursor.tsx`: Interactive canvas particle swarm cursor.
- Depends on: Mathematical domain layer, KaTeX, Framer Motion.
- Used by: Application pages in `src/App.tsx`.

**3. Application Shell & Page Layer (`src/App.tsx`):**
- Purpose: Topbar navigation, page routing, global parameter state, and page container layouts.
- Contains: Page views (`Home`, `Foundations`, `Groups`, `Lab`, `Team`, `Research`), topbar navigation, footer.
- Depends on: Component layer and math layer.
- Used by: Entry point `src/main.tsx`.

**4. Styling & Presentation Layer (`src/App.css`):**
- Purpose: Design tokens (CSS custom properties), dark glassmorphism aesthetic, typography scales, responsive layouts, and keyframe animations.
- Contains: `src/App.css`, `src/index.css`.
- Depends on: KaTeX stylesheet fonts.

## Data Flow

**Interactive Cipher Transformation Flow:**
1. **User Input:** User enters message in `<textarea id="message">`, selects transformation system ($C_{26}$, $\mathrm{AGL}(1,26)$, or $S_4$), and adjusts key parameters (shift slider, affine $(a,b)$ selectors, or $S_4$ key dropdown).
2. **Reactive Execution:** `useMemo` in `App.tsx` invokes `caesarText`, `affineText`, or `permutationText` from `src/math/engine.ts` based on `system` and `decrypt` mode.
3. **Synchronization:** Output propagates to `<CipherWheel>` (rotates rings, updates mapping tiles), `<LabCalculations>` (renders step trace), and `<output-message>` (renders result with animation).
4. **Inverse Verification:** Math engine verifies $f^{-1}(f(x)) = x$ live and displays verified confirmation badge.

**State Management:**
- Stateless client architecture — no server-side sessions.
- In-memory React state (`useState`) hoisted to `App` component.
- Derived states memoized using `useMemo` for optimal render performance.

## Key Abstractions

**Transformation System:**
- System mode: `"caesar" | "affine" | "permutation"`
- Metadata map `systemMeta`: Encapsulates display name, mathematical symbol ($C_{26}$, $\mathrm{AGL}(1, 26)$, $S_4$), algebraic order ($26, 312, 24$), and accent color.

**Key Types (`src/math/engine.ts`):**
- `AffineKey`: `{ a: number, b: number }` with coprime requirement $\gcd(a, 26) = 1$.
- `Permutation`: `[number, number, number, number]` representing elements of symmetric group $S_4$.
- `LetterFrequency`: Frequency count, percentage, and rank for cryptanalytic analysis.

**MathView Component:**
- Renders raw LaTeX expressions via `katex.renderToString` with error fallback handling.

## Entry Points

**Web Application:**
- `index.html`: Base HTML template, viewport meta, fonts, root `<div id="root">`.
- `src/main.tsx`: React DOM root initialization (`createRoot`), renders `<App />` in React StrictMode.
- `src/App.tsx`: App shell, topbar header, navigation routing, page views.

**Testing Entry Point:**
- `scripts/verify_math.py`: Python CLI verification script verifying group axioms, bijection, composition, and reversibility.

## Error Handling

**Strategy:**
- Defensive validation in math engine (clamping values mod 26, coprime filtering for affine $a \in \mathbb{Z}_{26}^\times$).
- Safe character filtering: Non-alphabet characters (spaces, punctuation) are preserved untouched in Caesar/Affine ciphers, avoiding out-of-bounds array lookups.
- MathView error resilience: Falls back to raw text rendering if LaTeX parsing fails.

---

*Architecture analysis: 2026-10-23*
*Update after major architectural refactoring*
