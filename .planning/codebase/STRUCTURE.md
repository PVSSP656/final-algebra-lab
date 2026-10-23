# Codebase Structure

**Analysis Date:** 2026-10-23

## Directory Layout

```
[project-root]/
├── .agent/              # Agent skill workflows, templates, and agent profiles
├── .firebase/           # Firebase hosting cache and metadata
├── files/               # Research documentation, drafts, dossiers, paper PDFs
│   └── Pavani_All_Files/# Research dossiers and literature reviews
├── public/              # Static public assets served directly by Vite
│   ├── documents/       # Downloadable research papers (research-paper.pdf)
│   └── images/          # Team member portraits and icons
│       └── team/        # Member profile images (JPEG, PNG, SVG)
├── scripts/             # Offline verification scripts
│   └── verify_math.py   # Python test suite verifying math algorithms
├── src/                 # Application source code
│   ├── assets/          # Static logos and graphic assets
│   ├── components/      # React interactive visualization components
│   ├── math/            # Pure mathematical engine
│   ├── App.css          # Core design system and application styling
│   ├── App.tsx          # App shell, navigation router, page implementations
│   ├── index.css        # Global CSS resets and base styles
│   └── main.tsx         # Application DOM root mount
├── .firebaserc          # Firebase project configuration
├── eslint.config.js     # ESLint configuration
├── firebase.json        # Firebase hosting deployment and rewrite rules
├── index.html           # HTML template
├── package.json         # Node.js project manifest and dependency list
├── tsconfig.json        # Solution TypeScript compiler configuration
├── tsconfig.app.json    # Application TypeScript compilation config
├── tsconfig.node.json   # Node build TypeScript configuration
└── vite.config.ts       # Vite bundler configuration
```

## Directory Purposes

**`src/`:**
- Purpose: Application source code.
- Contains: Root components, styling, page layouts, and entry points.
- Key files: `src/App.tsx`, `src/App.css`, `src/main.tsx`.

**`src/math/`:**
- Purpose: Pure mathematical transformation engine.
- Contains: `engine.ts` (modular arithmetic, Caesar shifts, Affine transformations, $S_4$ permutations, frequency counting, coprime GCD).
- Key files: `src/math/engine.ts`.

**`src/components/`:**
- Purpose: Visual and interactive lab components.
- Key files:
  - `CipherWheel.tsx`: Concentric interactive Caesar / Affine / $S_4$ cipher wheel SVG.
  - `ExperimentsLab.tsx`: Frequency distribution analysis and multiset preservation.
  - `CommonAlgebraicStructure.tsx`: Shared vs differing algebraic properties across groups.
  - `GroupCipherCards.tsx`: Expandable algebraic definition cards.
  - `TransformationChamber.tsx`: Interactive pipeline visualizer.
  - `LabCalculations.tsx`: Live calculation steps for encryption/decryption.
  - `MathView.tsx`: KaTeX formula wrapper.
  - `SwarmCursor.tsx`: Interactive canvas particle swarm cursor.

**`public/`:**
- Purpose: Static assets copied verbatim to `dist/`.
- Subdirectories:
  - `public/documents/`: Contains `research-paper.pdf`.
  - `public/images/team/`: Team member portraits and avatars.

**`scripts/`:**
- Purpose: Mathematical verification and test automation.
- Key files: `scripts/verify_math.py`.

**`files/`:**
- Purpose: Research documentation, academic drafts, and teammate dossiers.

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM bootstrap.
- `src/App.tsx`: Navigation router, global page components (`Home`, `Foundations`, `Groups`, `Lab`, `Team`, `Research`).
- `index.html`: Web document host.

**Core Mathematics:**
- `src/math/engine.ts`: All algebraic operations and cipher functions.

**Design System & Styles:**
- `src/App.css`: Design tokens (`:root`), glassmorphism, responsive styles, animations.

**Configuration:**
- `package.json`: Dependencies and npm run scripts (`dev`, `build`, `verify`, `lint`).
- `vite.config.ts`: Vite bundling and plugins.
- `tsconfig.app.json`: Strict TypeScript settings.
- `firebase.json`: Hosting rewrites and deployment rules.

## Naming Conventions

**Files:**
- `PascalCase.tsx`: React components (`CipherWheel.tsx`, `ExperimentsLab.tsx`).
- `camelCase.ts`: Utility and math modules (`engine.ts`).
- `kebab-case.py`: Python scripts (`verify_math.py`).
- `kebab-case.pdf`: Documents (`research-paper.pdf`).
- `kebab-case.json`: Configurations (`tsconfig.app.json`).

**Components & Functions:**
- `PascalCase`: React functional components (`CipherWheel`, `Lab`, `ExperimentsLab`).
- `camelCase`: Pure math functions (`caesarText`, `affineInverse`, `permutationApply`).
- `UPPER_SNAKE_CASE`: Constants and group sets (`ALPHABET`, `MODULUS`, `AFFINE_UNITS`, `S4`).

## Where to Add New Code

**New Mathematical Transformation:**
- Math implementation: Add pure functions to `src/math/engine.ts`.
- Verification: Add test assertions to `scripts/verify_math.py`.
- Interactive Lab UI: Update `src/components/LabCalculations.tsx` and `src/components/CipherWheel.tsx`.

**New Lab Experiment:**
- Component: Create new component in `src/components/`.
- Page route: Add to navigation in `src/App.tsx` or incorporate into `src/components/ExperimentsLab.tsx`.
- Styling: Add corresponding scoped rules in `src/App.css`.

---

*Structure analysis: 2026-10-23*
*Update after directory reorganizations*
