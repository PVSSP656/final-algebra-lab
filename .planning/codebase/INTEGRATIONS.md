# External Integrations

**Analysis Date:** 2026-10-23

## APIs & External Services

**Hosting & CDN:**
- Firebase Hosting (Google Cloud)
  - Target: `dist/`
  - Rewrite rules: `**` -> `/index.html` (SPA single-page navigation support)
  - Config file: `firebase.json`, `.firebaserc`
  - Deployment tool: `firebase-tools` (`firebase deploy --only hosting`)

**External Content & Fonts:**
- KaTeX Font Assets:
  - TTF, WOFF, WOFF2 fonts bundled directly into `dist/assets/` during Vite production build
  - No external Google Fonts CDN runtime dependency required for math rendering
- System Fonts:
  - Sans-serif fallback stack, `Playfair Display` (serif), `DM Mono` (monospace)

**External Repositories & Links:**
- GitHub Repository:
  - URL: `https://github.com/PVSSP656/final-algebra-lab`
  - Linked from Team page and Overview CTA

## Data Storage

**Databases:**
- None. The application operates as an entirely self-contained, client-side computational environment.
- Mathematical transformations are computed live in-memory via pure functions in `src/math/engine.ts`.

**File Storage:**
- Static asset serving from `public/`:
  - `public/documents/research-paper.pdf` - Downloadable team research paper
  - `public/images/team/` - Team member portraits (JPEG/PNG/SVG)
  - `public/favicon.svg` - Site favicon

**Caching:**
- Browser HTTP caching for immutable built chunks (`dist/assets/*`)
- Firebase Hosting CDN caching via `firebase.json` headers

## Authentication & Identity

**Auth Provider:**
- None. Public educational and scientific laboratory site. No user login, cookies, or tracking IDs.

## Monitoring & Observability

**Error Tracking:**
- None configured in client build. Console errors during development caught via Vite overlay and TypeScript checks.

**Analytics:**
- None. Completely private and privacy-preserving.

**Logs:**
- Browser console logging minimal/clean in production.

## CI/CD & Deployment

**Hosting Platform:**
- Firebase Hosting
  - Public directory: `dist`
  - Ignore list: `firebase.json`, `**/.*`, `**/node_modules/**`

**Deployment Workflow:**
- Local or CI build:
  1. `npm run build` (runs `tsc -b && vite build`)
  2. `firebase deploy --only hosting`

## Environment Configuration

**Development:**
- No `.env` files required. Zero environment-specific configuration needed for local development.
- Server startup: `npm run dev` (Vite dev server default port 5173).

**Production:**
- Static output generated in `dist/`. No secrets or environment variables needed at runtime.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-10-23*
*Update when adding/removing external services*
