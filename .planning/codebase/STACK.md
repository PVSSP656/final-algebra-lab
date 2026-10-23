# Technology Stack

**Analysis Date:** 2026-10-23

## Languages

**Primary:**
- TypeScript 6.0 (`typescript ~6.0.2`, `target: es2023`) - All application code, components, math engine, and typing definitions (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- Python 3.11+ - Offline mathematical correctness test suite (`scripts/verify_math.py`)
- CSS3 - Custom CSS system with CSS variables, responsive design, animations (`src/App.css`, `src/index.css`)
- HTML5 - Application shell and entry markup (`index.html`)

## Runtime

**Environment:**
- Browser (Modern evergreen browsers with ES2023 support, WebGL/Canvas, CSS Backdrop Filter)
- Node.js 20+ / 24+ - Build and local development environment

**Package Manager:**
- npm 10+
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.8 (`react`, `react-dom`) - Component hierarchy, reactive state management, custom navigation
- Vite 8.3.0 (`vite`, `@vitejs/plugin-react`) - Development server, fast HMR, production bundling with Rolldown/ESBuild

**Testing & Verification:**
- Python `unittest` / custom test verification (`scripts/verify_math.py`) for algebraic group axioms and cipher transforms
- TypeScript compiler (`tsc -b`) for static type safety

**Build/Dev:**
- Vite 8.3.0 (`vite build`)
- ESLint 10.10.0 (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`)

## Key Dependencies

**Critical:**
- `katex` (^0.19.0) - High-performance LaTeX mathematical formula rendering across the research and calculation panels
- `motion` (^14.2.0) - Declarative layout transitions, page enter/exit motions, and interactive spring physics
- `lucide-react` (^1.57.0) - Iconography (download button, status indicators)

**Infrastructure:**
- `@types/katex` (^0.16.8) - KaTeX TypeScript type definitions
- `@types/react` (^19.2.18) & `@types/react-dom` (^19.2.7) - React 19 types
- `@types/node` (^24.13.3) - Node.js ambient types

## Configuration

**Environment:**
- No runtime environment variables required (pure client-side static application)
- Static PDF asset configuration in `public/documents/`

**Build:**
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - Solution tsconfig with project references
- `tsconfig.app.json` - Application compiler settings (`bundler` module resolution, `verbatimModuleSyntax`, `noEmit`)
- `tsconfig.node.json` - Node environment compiler configuration
- `eslint.config.js` - Modern flat config for ESLint 10

## Platform Requirements

**Development:**
- Windows, macOS, or Linux with Node.js 20+ and Python 3.10+
- PowerShell / Bash shell access

**Production:**
- Firebase Hosting (`firebase.json` routing all requests to `/index.html` from `dist/`)
- Static file host (Vercel, Cloudflare Pages, GitHub Pages, or any CDN hosting `dist/`)

---

*Stack analysis: 2026-10-23*
*Update after major dependency changes*
