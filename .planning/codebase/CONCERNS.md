# Codebase Concerns

**Analysis Date:** 2026-10-23

## Tech Debt

**CSS Monolith (`src/App.css`):**
- Issue: `src/App.css` is over 9,000 lines long, housing styles for all components, animations, media queries, and legacy layouts in a single file.
- Impact: Difficult to track CSS class collisions; editing requires careful line-by-line inspection to avoid unintended overrides across sections.
- Recommendation: Gradually modularize into CSS modules or split by component (`CipherWheel.module.css`, `ExperimentsLab.module.css`, `Team.module.css`).

**Vite Chunk Size Warning:**
- Issue: Production build logs `(!) Some chunks are larger than 500 kB after minification (dist/assets/index-*.js ~844 kB)`.
- Cause: KaTeX, Motion, and all 7 site pages are bundled into a single main vendor/app chunk.
- Impact: Initial page load includes assets for all sections regardless of current route.
- Fix approach: Implement code-splitting using `React.lazy()` and dynamic imports for secondary pages (`ExperimentsLab`, `CommonAlgebraicStructure`).

**Encoding Sensitivity on Windows:**
- Issue: Windows PowerShell tools (like default `Get-Content`) can misinterpret UTF-8 without BOM as Windows-1252 ANSI, converting characters like `C₂₆` into `Câ‚‚â‚†` if not explicitly handled with UTF-8 encoding flags.
- Mitigation: Always specify explicit UTF-8 encoding when reading or modifying files via scripts (`-Encoding UTF8` in PowerShell or Node.js UTF-8 APIs).

## Known Bugs & Edge Cases

**Punctuation in Block Permutations ($S_4$):**
- Description: Position permutations operate strictly on complete blocks of 4 characters. If input length is not a multiple of 4, remaining tail characters are left unpermuted or padded.
- Current Status: Handled gracefully by preserving uncompleted tail blocks, but users must be aware that partial blocks are not permuted.

**SVG Wheel Centering and Scaling:**
- Description: The circular cipher wheel SVG is sized to `viewBox="0 0 500 500"`. On narrow mobile screens (<360px), tight padding can cause edge clipping if container width is constrained.
- Current Status: Protected with `width: min(100%, 460px)` and responsive media queries, but extreme aspect ratios should be monitored.

## Security Considerations

**Static Site Exposure:**
- Risk: Leaking local build paths or proprietary keys.
- Current Mitigation: The app is purely static and client-side; zero secrets, tokens, or environment keys exist in the codebase.
- Recommendation: Ensure `.env*` remains ignored if future backend APIs are introduced.

**Public Research Papers:**
- Risk: Inadvertent exposure of draft research papers.
- Current Status: `public/documents/research-paper.pdf` is publicly served. Only final, peer-reviewed/authorized drafts should be placed in `public/documents/`.

## Performance Bottlenecks

**SwarmCursor Particle Rendering:**
- Issue: `src/components/SwarmCursor.tsx` runs an active `requestAnimationFrame` loop rendering particles on a `<canvas>` element.
- Measurement: Negligible on modern GPUs; can increase CPU load on lower-powered mobile devices or battery saver modes.
- Mitigation: Particle count capped, and animation loop pauses when window is inactive.

**KaTeX Formula Density:**
- Issue: Rendering dozens of simultaneous KaTeX math blocks on `CommonAlgebraicStructure.tsx` triggers multiple DOM manipulations.
- Current Status: Fast initial render (<100ms), but should be memoized if complex matrix representations are added in future milestones.

## Fragile Areas

**Transformation State Coupling:**
- Why fragile: State variables (`message`, `shift`, `affine`, `permutationIndex`, `decrypt`) are shared between the left control panel, right cipher wheel, engine trace, and calculation component.
- Risk: Modifying key representation formats (e.g. 0-based vs 1-based permutation indices) without updating all consuming components can cause off-by-one errors or inverse verification failures.
- Recommendation: Always run `python scripts/verify_math.py` and test UI roundtrips after editing transformation parameters.

---

*Concerns audit: 2026-10-23*
*Update as issues are identified and resolved*
