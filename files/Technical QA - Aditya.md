# ABSALG_Aditya_TechQA_v1.md

**Project:** *Cryptography Through Abstract Algebra: An Interactive Study of Three Transformation Systems*  
**Role:** Technical QA and Reproducibility — Aditya Datta  
**Prepared:** 18 October 2026  
**Repository baseline inspected:** `PVSSP656/final-algebra-lab`, branch `main`  
**Status:** Updated working dossier — public source inspection, local build/lint/Python verification, and manual browser observations are recorded. The permutation-decryption fix passed the reported browser regression test and two follow-up checks; the tested post-fix commit/build identity is not recorded, so this is not a full release sign-off.

## Evidence labels

Use exactly one class per claim:

1. Mathematical proof
2. Direct calculation
3. Published evidence (source and exact location)
4. Python execution
5. TypeScript source inspection
6. TypeScript execution
7. Browser observation
8. Unverified or unresolved

This dossier does not treat source inspection as execution, a passing script as proof, or repository documentation as proof of browser testing.

## Access limits and evidence boundaries

- **Local environment:** Local environment and command results were supplied during the current project workflow. Details and results are recorded in Section 3. **[D-01; Classes 5/6]**
- **Clean-clone execution:** A clean-clone run has not been recorded. The local checkout was tested instead; do not describe it as a clean-clone reproduction. **[D-02; Class 8]**
- **Browser:** Aditya performed the manual browser observations recorded in D-62 through D-69. These are user-reported observations, not independently captured browser automation or screenshots attached to this dossier. **[D-03; Class 7]**
- **Lead's prior local run:** The earlier team-reported run remains separate from Aditya's local command evidence. **[D-04; Class 8]**
- **Professor's required paper format/citation style:** Not provided. **[D-05; Class 8]**

## 1. Repository and stack summary

### 1.1 Public repository identity

- Repository: https://github.com/PVSSP656/final-algebra-lab
- Default branch observed through GitHub repository metadata: `main`. **[D-06; Class 3: GitHub repository metadata]**
- Latest commit observed at inspection time: `13d2a3cec6dc283b38505f4023a36db0babc39c3`, commit message `Improve team profiles and cryptographic lab`, timestamp `2026-10-17T18:09:10Z`. This is the public branch tip, not a claim about the user's local checkout. **[D-07; Class 3: GitHub commit metadata]**
- The files inspected were fetched from the public repository's default branch; their blob identifiers are recorded below. **[D-08; Class 3: GitHub file contents]**

### 1.2 Files inspected

| File | Purpose / finding | Evidence ID and class |
|---|---|---|
| `README.md` | Project description, local run instructions, checks, input conventions | D-09 — Class 3 |
| `package.json` | npm scripts and declared dependency ranges | D-10 — Class 3 |
| `scripts/verify_math.py` | Independent Python implementation and assertions | D-11 — Class 5 |
| `src/math/engine.ts` | Shared TypeScript calculation layer | D-12 — Class 5 |
| `src/App.tsx` | Main page navigation and primary cipher selection/output flow | D-13 — Class 5 |
| `tsconfig.json` | References app and node TypeScript configurations | D-14 — Class 5 |
| `tsconfig.app.json` | Browser/app TypeScript compiler options | D-15 — Class 5 |
| `tsconfig.node.json` | Vite config TypeScript compiler options | D-16 — Class 5 |
| `vite.config.ts` | Vite config with React plugin | D-17 — Class 5 |
| `src/components/ExperimentsLab.tsx` | Uses engine functions for frequency, transformation inspection and composition experiments | D-18 — Class 5 |
| `src/components/CommonAlgebraicStructure.tsx` | Uses engine functions for transformations, inverses, and structure demonstrations | D-19 — Class 5 |
| `src/components/LabCalculations.tsx` | Uses trace functions to display calculation derivations | D-20 — Class 5 |
| `src/components/TransformationChamber.tsx` | Uses engine functions for forward/inverse visual demonstration | D-21 — Class 5 |

### 1.3 Stack and declared dependencies

The repository is a React + TypeScript app built with Vite, based on the inspected `package.json`, `vite.config.ts`, and TypeScript configurations. **[D-22; Class 5]**

Declared `dependencies` (ranges as written in `package.json`; these are not confirmed installed/resolved versions):

- `katex`: `^0.19.0`
- `lucide-react`: `^1.57.0`
- `motion`: `^14.2.0`
- `react`: `^19.2.8`
- `react-dom`: `^19.2.8`

Declared `devDependencies`:

- `@eslint/js`: `^10.0.1`
- `@types/katex`: `^0.16.8`
- `@types/node`: `^24.13.3`
- `@types/react`: `^19.2.18`
- `@types/react-dom`: `^19.2.7`
- `@vitejs/plugin-react`: `^6.1.1`
- `eslint`: `^10.10.0`
- `eslint-plugin-react-hooks`: `^7.1.1`
- `eslint-plugin-react-refresh`: `^0.5.6`
- `globals`: `^17.12.0`
- `typescript`: `~6.0.2`
- `typescript-eslint`: `^8.69.0`
- `vite`: `^8.3.0`

Source: `package.json`. **[D-23; Class 3]**

The declared scripts are:
- `dev`: `vite`
- `build`: `tsc -b && vite build`
- `lint`: `eslint .`
- `verify`: `python scripts/verify_math.py`
- `preview`: `vite preview`

The `verify` script runs the Python verifier; it does not invoke TypeScript directly. **[D-24; Class 3]**

### 1.4 Repository structure and test-file search

The recursive public Git tree was inspected. Relevant paths include `public/`, `scripts/verify_math.py`, `src/App.tsx`, `src/App.css`, `src/index.css`, `src/main.tsx`, `src/components/`, `src/math/engine.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, and `vite.config.ts`. **[D-25; Class 3]**

A path-name search of the public tree for `test`, `spec`, `vitest`, `jest`, `playwright`, `cypress`, `PROJECT_CHARTER`, `MATHEMATICAL_SPECIFICATION`, and `IMPLEMENTATION_PLAN` returned no matching paths. This supports the narrower claim that no files with those names/patterns appeared in the inspected public tree; it does not rule out tests named unusually or external/manual testing. **[D-26; Class 3]**

The README calls the app “a tested educational tool” but does not identify a TypeScript test framework or describe what that word “tested” means. The inspected `package.json` has no `test` script; it does have `lint`, `build`, and `verify`. Therefore, the public source inspected does not establish the existence of an automated TypeScript test suite. **[D-27; Class 3]**

The README also describes `scripts/verify_math.py` as independently checking approved conventions, counts, inverses, composition laws and representative message behavior. This is a documentation claim about the script's purpose; the actual assertions are inspected separately below. **[D-28; Class 3]**

## 2. Source-to-claim map

| Claim | File / function | Evidence class | Status | Risk |
|---|---|---|---|---|
| The TypeScript engine uses modulus 26 and the uppercase A–Z alphabet | `src/math/engine.ts`: `MODULUS`, `ALPHABET` | Class 5 | Confirmed by source | Low |
| The affine unit list contains 12 multipliers | `src/math/engine.ts`: `AFFINE_UNITS` | Class 5 | Confirmed by source; not a runtime test | Low |
| `caesarValue` applies modular addition | `caesarValue`, `mod` | Class 5 | Source formula matches convention | Low |
| `caesarText` uppercases text and preserves characters outside A–Z | `caesarText` | Class 5 | Confirmed by source | Low |
| `affineValue` checks the multiplier against the allowed unit list | `affineValue` | Class 5 | Confirmed by source | Low |
| `affineValue` separately validates `b` | `affineValue` | Class 5 | It does not impose a separate range/integer check on `b`; modulo reduction is applied to the result | Medium |
| Affine composition implements the documented formula | `affineCompose` | Class 5 | Formula in source is `(first.a*second.a, first.a*second.b+first.b) mod 26` | Low |
| Affine inverse uses a modular inverse of `a` | `affineInverse`, `modularInverse` | Class 5 | Confirmed by source | Low |
| Permutation application uses output-position-to-input-index convention | `permutationApply` | Class 5 | Confirmed by source | Low |
| Permutation composition returns `second[first[i]]` | `permutationCompose` | Class 5 | Confirmed by source | Medium: explanatory composition notation must state the action convention carefully |
| S4 text processing forms blocks from letters only and leaves a final incomplete block unchanged | `permutationText` | Classes 5 and 7 | Source inspection plus browser checks for `ABCDE` and `ABC`; nonletter positioning is consistent for the tested sample | Medium |
| Trace functions create step-by-step calculation records | `getCaesarTrace`, `getAffineTrace`, `getPermutationTrace` | Class 5 | Confirmed by source | Low |
| Frequency rows are rounded to two decimal places | `computeLetterFrequencies` | Class 5 | Confirmed by source: `Number(percentage.toFixed(2))` | Low |
| `maxPercentage` uses the rounded row percentage | `computeLetterFrequencies` | Class 5 | Not so: maximum is updated using unrounded `percentage`, while row output is rounded | Medium |
| The Python verifier imports/calls `engine.ts` | `scripts/verify_math.py` | Class 5 | No import or TypeScript invocation appears in the inspected file | High if Python pass is presented as TypeScript validation |
| `npm run verify` executes TypeScript tests | `package.json` | Class 3 | No: script is `python scripts/verify_math.py` | High if reported as TypeScript execution |
| The website was browser-tested | User-reported browser observations D-67–D-69 | Class 7 | Manual browser checks are recorded for selected frequency and permutation cases; not exhaustive and not automated | Medium |
| The app has a TypeScript automated test suite | Public tree and `package.json` | Class 3 | No test files matched the searched names/patterns and no `test` script is declared; external/manual tests remain possible | Medium |

## 3. Command log and local execution evidence

**Environment and repository details reported from the local Windows checkout:**

| Item | Observed value | Evidence |
|---|---|---|
| Operating system | Windows 10 Home Single Language, 64-bit | D-62 — Class 6 |
| Shell | Windows PowerShell 5.1 | D-62 — Class 6 |
| Node.js | `v24.22.0` | D-62 — Class 6 |
| npm | `11.19.1`, invoked as `npm.cmd` because PowerShell blocks `npm.ps1` under the current execution policy | D-62 — Class 6 |
| Python | `3.14.3`, invoked with `py`; `python` resolves to the Microsoft Store alias in this environment | D-62 — Class 6 |
| Local repository root | `C:\Users\12600\algebra-lab-clean` | D-62 — Class 6 |
| Git root | `C:/Users/12600/algebra-lab-clean` | D-62 — Class 6 |
| Branch | `main` | D-62 — Class 6 |
| Local HEAD | `91fb67b13a47bf62ca2e7dedc348ad69a6863e66` (`91fb67b`) | D-62 — Class 6 |
| HEAD message | `Render all unique letter mappings` | D-62 — Class 6 |
| HEAD author/time | P.V.S. Subramanya Prasad; Sun Oct 18 15:25:20 2026 +0530 | D-62 — Class 6 |
| Working tree | `git status --short` was clean at time of inspection | D-62 — Class 6 |
| Remote | `origin` points to `https://github.com/PVSSP656/final-algebra-lab` | D-62 — Class 6 |

### 3.1 Local command results

| Command | Result | Exact reported output / notes | Evidence |
|---|---|---|---|
| `npm.cmd run build` | PASS | Vite v8.3.4; 438 modules transformed; build completed in 866 ms. `dist/assets/index-DtGZHepR.js` 835.13 kB (gzip 238.06 kB); `index-Cv0mGB4N.css` 161.69 kB (gzip 32.49 kB). Vite emitted an advisory warning that some chunks exceed 500 kB after minification. | D-63 — Class 6 |
| `npm.cmd run lint` | PASS | Completed without reported errors or warnings. | D-64 — Class 6 |
| `py scripts/verify_math.py` | PASS | `All Caesar, affine, S4, and frequency verification checks passed successfully.` | D-65 — Class 6 |
| `npm.cmd run dev` | PASS (manual startup observation) | Development server started and the app opened in the browser. This is not a production deployment test. | D-66 — Class 6/7 |
| `npm` (without `.cmd`) | Environment limitation | PowerShell selects `npm.ps1`, which is blocked by the current execution policy. The working invocation was `npm.cmd`; no execution policy change was made. | D-62 — Class 6 |
| `python` (without `py`) | Environment limitation | Resolves to the Microsoft Store alias; use `py` in this environment. | D-62 — Class 6 |

The successful build, lint, and Python verification results apply to the local checkout at the recorded commit. They do not constitute a clean-clone test, do not establish that the Python verifier exercises the TypeScript engine, and do not override the manual browser decryption failure.

### 3.2 Test inventory

No common test/spec/Vitest/Jest/Playwright/Cypress paths were found in the inspected repository tree, and `package.json` has no `test` script. This does not rule out externally maintained tests or manually executed tests. The Python verification script defines its own checks and does not directly import or execute `src/math/engine.ts`. **[D-26, D-27, D-65]**

## 4. Reproducibility and handoff checklist

- [x] Record local OS, shell, Node.js/npm/Python versions and repository root. **[D-62]**
- [x] Record local branch, commit, remote and clean working-tree status at time of inspection. **[D-62]**
- [x] Run local build and preserve reported build output/warning. **[D-63]**
- [x] Run local lint. **[D-64]**
- [x] Run local Python mathematical verifier and preserve exact success message. **[D-65]**
- [x] Perform and record manual browser checks for Caesar/affine frequency analysis and permutation behavior. **[D-67–D-69]**
- [ ] Run `npm install`, build, lint and verify in a fresh clean clone if the project lead specifically requires clean-clone reproducibility; current results are from the local checkout.
- [x] Re-run the permutation decryption regression test after the lead reported a fix: `CADB` → `ABCD` with `[3,1,4,2]`. **[D-70; Class 7]**
- [x] Record the post-fix inverse-key and incomplete-block checks. **[D-70; Class 7]**
- [ ] Record the exact commit/version tested after the fix, and rerun build/lint/verify against that version if the team requires release-level sign-off.
- [ ] Confirm whether the lead wants a cross-language comparison script; do not create or add one to the repository without approval.
- [ ] Reconcile the public branch tip and local checkout before claiming the local results apply to a later commit.
- [ ] Add any screenshots or terminal captures the team requires; the current browser results are recorded from user-reported observations.

## 5. Function map for Ananya

This map links exported functions/constants in `src/math/engine.ts` to likely user-facing components based on imports and visible call sites. “Source-linked” means code imports/calls were inspected; it does not mean the UI was executed.

| Engine export | Mathematical / computational role | UI location(s) found in source | Evidence |
|---|---|---|---|
| `MODULUS`, `ALPHABET`, `AFFINE_UNITS`, `S4` | Shared constants and allowed keys | `App.tsx`, `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx`, `TransformationChamber.tsx` | D-30 — Class 5 |
| `mod` | Least nonnegative modular reduction | Used by arithmetic helpers in engine; direct UI use not established in inspected imports | D-31 — Class 5 |
| `gcd` | Coprimality check | `CommonAlgebraicStructure.tsx`, `ExperimentsLab.tsx`, `LabCalculations.tsx` | D-32 — Class 5 |
| `modularInverse` | Finds multiplicative inverse modulo a modulus | `ExperimentsLab.tsx`, `LabCalculations.tsx`; also called inside engine functions | D-33 — Class 5 |
| `caesarValue` | Scalar Caesar shift on a residue mod 26 | `CommonAlgebraicStructure.tsx`, `TransformationChamber.tsx` | D-34 — Class 5 |
| `caesarText` | Caesar transformation of text | `App.tsx`, `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx` | D-35 — Class 5 |
| `affineValue` | Scalar affine map | `CommonAlgebraicStructure.tsx`, `TransformationChamber.tsx` | D-36 — Class 5 |
| `affineText` | Affine encryption/decryption of text | `App.tsx`, `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx` | D-37 — Class 5 |
| `affineCompose` | Composition of affine keys | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx` | D-38 — Class 5 |
| `affineInverse` | Inverse affine key | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx`, `TransformationChamber.tsx` | D-39 — Class 5 |
| `permutationApply` | Apply a position permutation to a block | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx`, `TransformationChamber.tsx` | D-40 — Class 5 |
| `permutationCompose` | Compose two S4 index maps | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx` | D-41 — Class 5 |
| `permutationInverse` | Inverse S4 key | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx`, `LabCalculations.tsx`, `TransformationChamber.tsx` | D-42 — Class 5 |
| `permutationText` | Transform complete four-letter blocks in a text while retaining nonletters and incomplete final letters | `App.tsx`, `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx` | D-43 — Class 5 |
| `permutationLabel` | Display zero-based keys as one-based labels | `ExperimentsLab.tsx`, `CommonAlgebraicStructure.tsx`, `LabCalculations.tsx`, `TransformationChamber.tsx` | D-44 — Class 5 |
| `permutationIsValid` | Check whether a numeric list is a valid four-position permutation | Exported from engine; UI call site not established in inspected excerpts | D-45 — Class 5 |
| `transformationOrder` | Iteratively compute the order of a finite transformation over a supplied domain | `ExperimentsLab.tsx` | D-46 — Class 5 |
| `getCaesarTrace` | Produce per-letter Caesar calculation steps | `LabCalculations.tsx` | D-47 — Class 5 |
| `getAffineTrace` | Produce per-letter affine calculation steps | `LabCalculations.tsx` | D-48 — Class 5 |
| `getPermutationTrace` | Produce block-level mappings, inverse key, leftover letters, and output | `LabCalculations.tsx` | D-49 — Class 5 |
| `computeLetterFrequencies` | Count A–Z letters and calculate percentages/maxima | `ExperimentsLab.tsx` | D-50 — Class 5 |

### Message for Ananya

The source-linked function map above is intended as a handoff aid. Please validate each claimed UI feature in the browser and record screenshots/steps under your own evidence IDs (`A-01`, `A-02`, ...). Do not treat this source inspection as browser evidence. In particular, confirm actual behavior for nonletters, lowercase input, incomplete final S4 blocks, calculation traces, composition displays, and frequency visualizations.

## 6. Discrepancy report

### D-51 — README “tested” claim is underspecified
- **Claim:** README describes the app as a “tested educational tool.”
- **Evidence:** README wording; `package.json` declares `build`, `lint`, and `verify`, but no `test` script. Public tree search found no paths matching common test/spec runner filenames.
- **Class:** 3 — Published evidence.
- **Status:** No automated TypeScript test suite is established by the inspected repository metadata. The README may refer to manual testing or the Python verifier; the precise meaning is unresolved.
- **Risk:** Readers may mistake a Python assertion script or a manual browser check for a TypeScript unit-test suite.

### D-52 — Python verifier is independent code, not a TypeScript test
- **Claim:** `scripts/verify_math.py` does not import `src/math/engine.ts`.
- **Evidence:** The inspected Python file defines its own functions (`shift`, `affine`, `affine_compose`, `affine_inverse`, `perm_apply`, `perm_compose`, `perm_inverse`) and uses Python assertions. `package.json` maps `verify` to `python scripts/verify_math.py`.
- **Class:** 5 — TypeScript/Python source inspection.
- **Status:** Confirmed by source inspection.
- **Risk:** A passing Python run cannot establish that the TypeScript engine compiles, runs, or matches the Python implementation.

### D-53 — F1: permutation composition comment and index-map convention
- **Claim under review:** The comment says `first(second(x))`, while code returns `second[first[i]]`; the code is consistent with the project’s block-action convention.
- **Evidence:** `permutationApply(p, block)` returns characters `block[p[i]]`; `permutationCompose(first, second)` returns `first.map(index => second[index])`. The Python verifier uses the same `tuple(q[p[i]] ...)` convention and checks application agreement.
- **Class:** 5 — Source inspection.
- **Status:** The implementation matches the Python verifier's index-map convention. The comment's function-composition notation must be read with the action convention stated explicitly; to avoid ambiguity in the paper, state that the product `pq` means apply `q` to the block first, then `p`, while the index-map formula reverses the order relative to ordinary function composition.
- **Risk:** A reader could assume the keys are ordinary position functions and infer the wrong multiplication order.

### D-54 — F2: Python does not test TypeScript
- **Claim:** The Python verifier does not exercise `engine.ts`.
- **Evidence:** `verify` script invokes Python; Python source contains its own definitions and no TypeScript import/runtime invocation.
- **Class:** 5 — Source inspection.
- **Status:** Confirmed.
- **Risk:** Overstating coverage as cross-language validation.

### D-55 — F3: casing and S4 treatment of nonletters
- **Claim:** Lowercase text is uppercased; S4 blocks are formed from letters only.
- **Evidence:** `caesarText` and `affineText` iterate over `text.toUpperCase()` and preserve characters outside A–Z. `permutationText` collects the positions of A–Z letters, transforms complete groups of four letters, then writes transformed letters back to their original letter positions. The leftover letters are not transformed.
- **Class:** 5 — Source inspection.
- **Status:** Confirmed by source; browser checks covered an incomplete final block, short input, and one spaces/punctuation example. Lowercase/mixed-case behavior remains untested in this round.
- **Risk:** Do not generalize these selected browser observations to all possible text inputs. Non-ASCII letters are not treated as A–Z by the regex/ASCII index logic.

### D-56 — F4: `affineValue` validation of `b`
- **Claim:** `affineValue` does not separately validate the additive parameter `b`.
- **Evidence:** It validates `key.a` against `AFFINE_UNITS`, then returns `mod(key.a * value + key.b)`. No explicit integer/range check for `key.b` appears in the function.
- **Class:** 5 — Source inspection.
- **Status:** Confirmed. Inputs with noncanonical `b` values are reduced through the output formula rather than rejected; this is not by itself evidence of incorrect output for integer `b`, but input validation policy is implicit.
- **Risk:** The UI and paper should distinguish canonical key presentation (`b` modulo 26) from what the function accepts.

### D-57 — F5: rounded row percentages versus maximum percentage
- **Claim:** Frequency percentages are rounded but the maximum is not.
- **Evidence:** `computeLetterFrequencies` computes raw `percentage`, updates `maxPercentage` using that raw number, and stores `Number(percentage.toFixed(2))` in each row.
- **Class:** 5 — Source inspection.
- **Status:** Confirmed.
- **Risk:** `maxPercentage` can differ slightly from the maximum of the displayed, rounded percentages. This matters if the UI uses `maxPercentage` as a displayed value or scale; the UI's current use should be checked by Ananya.

### D-58 — Missing project documentation files
- **Claim:** The project assignments mention `docs/PROJECT_CHARTER.md`, `docs/MATHEMATICAL_SPECIFICATION.md`, and `docs/IMPLEMENTATION_PLAN.md`, but those paths are absent from the inspected public tree.
- **Evidence:** Recursive public Git tree path search.
- **Class:** 3 — Published evidence.
- **Status:** Those exact paths were not found in the inspected tree. Whether they exist locally, in another branch, or in an older repository is unresolved.
- **Risk:** Team members may cite specifications that are not present in the current baseline.

### D-59 — Repository naming discrepancy
- **Claim:** Older assignment material uses `abstract-algebra-lab`, while the current baseline is `final-algebra-lab`.
- **Evidence:** Current repository URL and public metadata; older assignment reference from the team handoff.
- **Class:** 8 — Unverified or unresolved.
- **Status:** Current baseline for this dossier is `PVSSP656/final-algebra-lab`; confirm the local clone's remote and commit before attributing local outputs to this baseline.
- **Risk:** Command logs may describe a different repository revision.

### D-62 — Local environment and repository baseline
- **Evidence:** Local environment/command details reported during the QA workflow.
- **Class:** 6 — User-reported local execution/environment evidence.
- **Status:** Windows 10 Home Single Language 64-bit; PowerShell 5.1; Node.js v24.22.0; npm 11.19.1 via `npm.cmd`; Python 3.14.3 via `py`; repository `C:\Users\12600\algebra-lab-clean`; branch `main`; local commit `91fb67b13a47bf62ca2e7dedc348ad69a6863e66`; working tree clean at time checked.
- **Limit:** These details describe the checkout at the time observed, not any later lead fix or clean clone.

### D-63 — Local production build
- **Command:** `npm.cmd run build`
- **Result:** PASS. Vite v8.3.4, 438 modules transformed, build completed in 866 ms. Main JS bundle was 835.13 kB (gzip 238.06 kB); CSS was 161.69 kB (gzip 32.49 kB).
- **Class:** 6 — Local command execution.
- **Note:** Vite warned that some chunks exceed 500 kB after minification. This is an advisory bundle-size warning, not a build failure.

### D-64 — Local lint
- **Command:** `npm.cmd run lint`
- **Result:** PASS; no lint errors or warnings reported.
- **Class:** 6 — Local command execution.

### D-65 — Local Python verifier
- **Command:** `py scripts/verify_math.py`
- **Result:** PASS; exact output: `All Caesar, affine, S4, and frequency verification checks passed successfully.`
- **Class:** 6 — Local command execution.
- **Limit:** The Python verifier uses its own Python implementations; it does not directly execute the TypeScript engine. This pass does not contradict the browser-observed decryption failure.

### D-66 — Development server startup
- **Command:** `npm.cmd run dev`
- **Result:** Development server opened the application in the browser.
- **Class:** 6/7 — Local command and manual browser observation.
- **Limit:** This establishes that the development app could be launched, not that all features behave correctly.

### D-67 — Caesar and affine frequency-analysis checks
- **Caesar case 1:** `ABBA`, shift `k=3`, expected `DEED`; equal counts preserved (A/B each 2, D/E each 2). PASS.
- **Caesar case 2:** `AAAAAB`, shift `k=3`, expected `DDDDDE`; 5:1 frequency ratio preserved. PASS.
- **Affine case 1:** `ABBA`, key `(a,b)=(5,8)`, expected `INNI`; I and N each occur twice. PASS.
- **Affine case 2:** `AAAAAB`, key `(a,b)=(5,8)`, expected `IIIIIN`; I occurs five times and N once. PASS.
- **Class:** 7 — Browser observation reported by user.
- **Conclusion:** These cases support the expected letter-count relabelling behavior for the tested inputs; they are not exhaustive coverage of every frequency-chart state.

### D-68 — Group Explorer mathematical explanations
- **Caesar `C26`:** identity shift `k=0` and inverse shift explanation confirmed; no composition control/table was visible in the inspected panel. This is a UI-scope observation, not a mathematical failure.
- **Affine transformations:** coprime multiplier condition, 12 valid multipliers/312 keys, and modular inverse in decryption confirmed in the displayed explanation.
- **Permutation `S4`:** 24 elements and example `[3,1,4,2]` mapping `ABCD` to `CADB` confirmed. Composition order was not confirmed in the displayed explanation.
- **Class:** 7 — Browser observation reported by user.
- **Limit:** These checks establish what the visible explanatory panels stated, not that an interactive composition tool was tested.

### D-69 — Permutation Lab browser observations (before fix)
- **Encryption:** key `[3,1,4,2]`, `ABCD` → `CADB`. PASS.
- **Decryption regression:** ciphertext `CADB`, same key `[3,1,4,2]`, should return `ABCD`; observed output was incorrect. FAIL, reproduced on more than one attempt.
- **Inverse-key cross-check previously reported:** key `[2,4,1,3]` applied as an encryption key to `CADB` returned `ABCD`. This supports that the expected inverse permutation is `[2,4,1,3]`; it does not resolve the UI decryption failure.
- **Incomplete final block:** `ABCDE` → `CADBE`. PASS.
- **Short input:** `ABC` → `ABC`. PASS.
- **Spaces/punctuation:** `ABCD EFGH!` → `CADB GEHF!`. PASS after correcting the expected output. With the convention output position `i` receives input at position `p_i`, `EFGH` maps to `GEHF`.
- **Class:** 7 — Browser observation reported by user.
- **Status at the time of these observations:** Decryption discrepancy reproduced; root cause was unconfirmed. The project lead subsequently reported a fix. Post-fix results are recorded separately in D-70.

### D-70 — Post-fix permutation regression checks
- **Context:** The project lead reported that the permutation-decryption issue had been fixed. Aditya repeated the browser checks on the updated app. The exact post-fix commit/hash and whether it matches the recorded local checkout are not established in this dossier.
- **Primary regression:** Ciphertext `CADB`, key `[3,1,4,2]`, Decrypt → `ABCD`. PASS, reported by user from the browser.
- **Inverse-key cross-check:** Encrypt `CADB` using `[2,4,1,3]` → `ABCD`. PASS, reported by user from the browser.
- **Incomplete-block regression:** Encrypt `ABCDE` using `[3,1,4,2]` → `CADBE`. PASS, reported by user from the browser.
- **Class:** 7 — Browser observations reported by user; screenshots are not attached.
- **Disposition:** The original decryption defect is **resolved for the tested browser case**. Do not infer that all permutation keys, all inputs, or the full application have been exhaustively tested. A build/lint/verify run against the exact post-fix version has not been recorded.

## 7. Limitations and outstanding evidence

1. **Clean-clone reproduction is outstanding.** The build, lint, and Python verifier passed in the local checkout, but a clean clone was not separately tested. **[D-02; D-63–D-65]**
2. **Permutation decryption fix passed the reported regression case.** `CADB` decrypted to `ABCD` with key `[3,1,4,2]`; inverse-key encryption and the `ABCDE` incomplete-block check also passed after the fix. The exact post-fix commit/build identity is not recorded, and no build/lint/verify run against that version is documented. **[D-70]**
3. **Browser evidence is user-reported.** The test steps and observed outputs are recorded, but this dossier does not include screenshot attachments for every test. **[D-67–D-69]**
4. **Python verification is not TypeScript execution.** It uses independent Python implementations and should not be described as a test of `src/math/engine.ts`. **[D-65; D-52/D-54]**
5. **Build bundle-size advisory remains.** Vite warned that some minified chunks exceed 500 kB; the build still passed. **[D-63]**
6. **No common automated TypeScript test suite was identified** in the inspected public tree, and no `test` script is declared. External or differently named tests may exist. **[D-26–D-27]**
7. **Frequency `maxPercentage` rounding observation** remains source-level; visible impact depends on UI usage and has not been established as a browser defect. **[D-57]**
8. **Affine `b` validation policy** is implicit at the engine level; source inspection alone does not establish a user-visible failure. **[D-56]**
9. **Permutation composition notation** needs an explicit action convention in the paper: product `pq` means apply `q` to the block first, then `p`; the index-map formula reverses the order relative to ordinary function composition. **[D-53, D-68]**
10. **Professor's required paper format/citation style** remains unconfirmed. **[D-05]**
11. **Clean-clone and cross-language work:** no cross-language comparison script has been written; ask the lead before starting one. **[D-61]**
12. **Other team evidence:** Ananya's browser evidence and Varun's independent mathematical verification should be kept separate and integrated only when supplied. Pavani's literature review is outside this dossier's evidence scope.

### Unverified or pending list

- **D-02:** Clean-clone dependency/build/lint/verify run.
- **D-05:** Professor's paper format and citation style.
- **D-29:** Exact output/screenshots from the earlier lead-run claim.
- **D-59:** Whether older repository naming refers to another clone/branch or a superseded repository.
- **D-61:** Lead approval for a cross-language comparison script.
- **D-70:** Exact post-fix commit/version and build/lint/verify results, if required for release-level sign-off.

## 8. Handoff summary

### Work completed
- Inspected public repository metadata, README, package scripts, TypeScript engine, application components, TypeScript/Vite configuration, and Python verifier.
- Recorded the local environment and local commit baseline.
- Ran `npm.cmd run build` (PASS with bundle-size advisory), `npm.cmd run lint` (PASS), and `py scripts/verify_math.py` (PASS).
- Started the development app and performed manual browser checks reported in this dossier.
- Tested four Caesar/affine frequency cases; all expected outputs and tested frequency counts matched.
- Inspected the visible Group Explorer explanations for `C26`, affine transformations, and `S4`.
- Tested permutation encryption, incomplete blocks, short input, and spaces/punctuation.
- Reproduced a permutation decryption failure and documented the expected result.
- Re-tested after the lead reported a fix: `CADB` → `ABCD` using `[3,1,4,2]` passed; inverse-key encryption and incomplete-block regression checks passed. **[D-70]**

### Current disposition

**QA investigation:** Substantially complete for the defined manual test scope.  
**Dossier:** Updated working version; review before submission.  
**Permutation decryption defect:** RESOLVED FOR THE TESTED CASE — post-fix browser regression passed.  
**Clean-clone reproducibility:** Not performed.  
**Post-fix build verification:** Build/lint/verify results for the exact post-fix version are not recorded.

### Required next actions
1. Tell the lead that the reported fix passed the browser regression case and follow-up checks in D-70.
2. Review this dossier for consistency with the team's agreed evidence format and add screenshots if required.
3. Complete the function-map handoff and any requested evidence from Ananya/Varun without conflating their observations with Aditya's.
4. Submit `ABSALG_Aditya_TechQA_v1.md` by the 21 October 2026 dossier deadline.
5. If release-level sign-off is required, confirm the exact post-fix commit/version and rerun build, lint and verify against that version.

### Recommended use in the research paper
- Use this dossier for claims about the tested local build/lint/verifier status, source-to-function mapping, the manual browser cases, and reproducibility limitations.
- Describe the Python verifier as an independent Python assertion script, not as a TypeScript unit-test suite or a mathematical proof.
- Report the decryption issue as fixed for the tested case, citing the post-fix regression results in D-70; retain the limitation that the exact post-fix build identity and broader coverage are unverified.
- Use Ananya's browser evidence for any additional UI claims, Varun's independent verification for algebraic claims, and Pavani's literature review for related-work claims.
- Avoid saying the application is fully tested or bug-free; the recorded evidence is limited to the specific checks above.

**Handoff status:** Ready for team review; the permutation-decryption fix passed the reported regression case and follow-up checks. Clean-clone reproduction and exact post-fix build verification remain outstanding.
