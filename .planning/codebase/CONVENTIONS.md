# Coding Conventions

**Analysis Date:** 2026-10-23

## Naming Patterns

**Files:**
- React Components: `PascalCase.tsx` (e.g., `CipherWheel.tsx`, `ExperimentsLab.tsx`, `MathView.tsx`)
- Pure Modules: `camelCase.ts` (e.g., `src/math/engine.ts`)
- Script files: `snake_case.py` (e.g., `scripts/verify_math.py`)

**Functions & Variables:**
- Functions: `camelCase` (e.g., `caesarValue`, `affineInverse`, `permutationCompose`, `computeLetterFrequencies`)
- React State Handlers: `handle*` or inline setters (e.g., `handlePointerMove`, `handleCardClick`)
- React Hooks: Standard `use*` prefix (e.g., `useMemo`, `useState`, `useCallback`, `useRef`)
- Variables: `camelCase` (e.g., `plainIdx`, `cipherIdx`, `multisetMatches`)
- Global Constants: `UPPER_SNAKE_CASE` (e.g., `ALPHABET`, `MODULUS`, `AFFINE_UNITS`, `S4`, `DEG_STEP`)

**Types & Interfaces:**
- Types: `PascalCase` (e.g., `System`, `Page`, `AffineKey`, `Permutation`, `TeamMember`)
- Interface Props: `PascalCase` with `Props` suffix (e.g., `CipherWheelProps`, `TransformationChamberProps`)

## Code Style

**Formatting & Typography:**
- Semicolons: Required
- Quotes: Double quotes `""` preferred in JSX/TSX, template literals for dynamic strings
- Indentation: 2 spaces
- Trailing commas: Multiline trailing commas enabled

**Linting:**
- ESLint 10 with flat configuration (`eslint.config.js`)
- Enforces React hooks rules (`eslint-plugin-react-hooks`)
- Enforces Fast Refresh constraints (`eslint-plugin-react-refresh`)
- Run check via: `npm run lint`

**CSS Architecture:**
- Monolithic, centralized stylesheet in `src/App.css`
- Design tokens defined under `:root`:
  - Surfaces: `--surface: rgba(15, 16, 24, 0.82)`, `--surface-solid: #151620`, `--surface-soft: rgba(24, 24, 37, 0.72)`
  - Lines: `--line: rgba(173, 166, 211, 0.2)`, `--line-bright: rgba(190, 181, 255, 0.45)`
  - Accents: `--lav: #b0a3ff`, `--ice: #9fcff1`, `--violet: #7668c1`
  - Typography: `--mono: "DM Mono", monospace`, `--serif: "Playfair Display", serif`
- BEM / semantic utility hybrid naming (`.seg-control`, `.seg-indicator`, `.seg-btn.seg-active`, `.action-btn.encrypt-btn.active`)
- Extensive glassmorphism with `backdrop-filter: blur(...)` and layered translucency
- Dedicated `@media (prefers-reduced-motion: reduce)` accessibility queries

## Import Organization

**Standard Import Hierarchy:**
1. React core hooks and types (`import { useState, useMemo, useCallback } from "react"`)
2. Animation and UI libraries (`import { motion, AnimatePresence } from "motion/react"`, `import { Download } from "lucide-react"`)
3. Mathematical domain imports (`import { ALPHABET, caesarText } from "../math/engine"`)
4. Subcomponents (`import { MathView } from "./MathView"`)
5. Stylesheet imports (`import "./App.css"`)

## Error Handling & Defensive Math

**Mathematical Bounds:**
- All modular operations must strictly map into positive residue classes: `((val % m) + m) % m`.
- Coprime validation: Invertibility checked via `gcd(a, 26) === 1`.
- Alphabet index lookups: Check `ALPHABET.includes(c)` before applying modular maps; non-alphabetic characters bypass transformations cleanly.
- Permutation arrays: Always verified for 0-indexed vs 1-based representations before block slicing.

**Component Resilience:**
- Empty string guard: Computations handle empty strings and whitespace without throwing exceptions or generating undefined index lookups.
- Fallback values: Safe defaults provided for missing or partial keys (e.g., `{ a: 5, b: 8 }` fallback for affine parameters).

---

*Conventions analysis: 2026-10-23*
*Update as project style evolves*
