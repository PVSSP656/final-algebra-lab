# Testing Patterns

**Analysis Date:** 2026-10-23

## Test Framework

**Mathematical Verification Suite:**
- Runner: Python `scripts/verify_math.py`
- Scope: Validates core mathematical engines, group closure, bijectivity, modular inverses, permutation composition, and multiset frequency invariance.
- Run Command:
  ```bash
  npm run verify
  # or directly:
  python scripts/verify_math.py
  ```

**Type Checking & Build Verification:**
- Runner: TypeScript Compiler (`tsc -b`) & Vite build
- Run Command:
  ```bash
  npm run build
  ```
- Ensures complete type safety across all React components, math engines, and props interfaces.

**Linting Checks:**
- Runner: ESLint 10 (`eslint .`)
- Run Command:
  ```bash
  npm run lint
  ```

## Mathematical Test Organization

**File Location:**
- `scripts/verify_math.py`

**Test Cases Covered:**
1. **Caesar Cipher ($C_{26}$):**
   - Forward encryption with key $k$: $E_k(x) = (x + k) \bmod 26$
   - Inverse decryption with key $-k$: $D_k(y) = (y - k) \bmod 26$
   - Identity preservation: $D_k(E_k(x)) = x$
   - Cyclic shift closure mod 26
2. **Affine Cipher ($\mathrm{AGL}(1, 26)$):**
   - Units verification: $\mathbb{Z}_{26}^\times = \{1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25\}$
   - Extended Euclidean modular inverse computation: $a \cdot a^{-1} \equiv 1 \pmod{26}$
   - Inverse affine map parameters: $a' = a^{-1} \bmod 26$, $b' = (-a^{-1}b) \bmod 26$
   - Roundtrip recovery: $D_{(a,b)}(E_{(a,b)}(x)) = x$
3. **Symmetric Permutations ($S_4$):**
   - Verification of all 24 permutations in $S_4$
   - Proper 0-indexed representation (`[p0, p1, p2, p3]`) and 1-based display (`[1, 2, 3, 4]`)
   - Inverse permutation computation: $\pi \circ \pi^{-1} = \mathrm{id}$
   - 4-block slicing and reversibility
4. **Frequency & Multiset Invariance:**
   - Multi-character frequency distribution preservation under monoalphabetic substitution

## Adding New Tests

**When adding a new mathematical system:**
1. Implement the mathematical functions in `src/math/engine.ts`.
2. Add parallel assertion blocks in `scripts/verify_math.py`:
   ```python
   def test_new_system():
       # Forward transformation
       # Inverse transformation
       # Invertibility check
       assert recovered == original, f"Expected {original}, got {recovered}"
   ```
3. Run `npm run verify` to confirm offline correctness.
4. Run `npm run build` to confirm TypeScript compatibility.

---

*Testing analysis: 2026-10-23*
*Update when adding test frameworks or testing strategies*
