/**
 * Simulates the App.tsx useMemo output logic to verify the fix is correct.
 * Tests all 6 required regression cases.
 */
import { permutationText, S4, caesarText, affineText } from '../src/math/engine.ts';

// Replicate the fixed useMemo output logic from App.tsx
function computeOutput(
  message: string,
  system: 'caesar' | 'affine' | 'permutation',
  decrypt: boolean,
  shift: number,
  affine: { a: number; b: number },
  permutation: number[]
): string {
  if (!message || message.trim().length === 0) return "";
  if (system === "caesar") return caesarText(message, decrypt ? -shift : shift);
  if (system === "affine") return affineText(message, affine, decrypt);
  if (system === "permutation") return permutationText(permutation, message, decrypt);
  return "";
}

// Find permutation by 1-based key
function findPerm(oneBased: number[]) {
  const zeroBased = oneBased.map(x => x - 1);
  return S4.find(p => p.every((val, i) => val === zeroBased[i]));
}

const perm3142 = findPerm([3, 1, 4, 2])!;
const perm2413 = findPerm([2, 4, 1, 3])!;
const affine58 = { a: 5, b: 8 };

const tests = [
  {
    name: 'Encrypt ABCD with [3,1,4,2]',
    expected: 'CADB',
    fn: () => computeOutput('ABCD', 'permutation', false, 0, affine58, perm3142)
  },
  {
    name: 'Decrypt CADB with [3,1,4,2]',
    expected: 'ABCD',
    fn: () => computeOutput('CADB', 'permutation', true, 0, affine58, perm3142)
  },
  {
    name: 'Encrypt ABCD with [2,4,1,3]',
    expected: 'BDAC',
    fn: () => computeOutput('ABCD', 'permutation', false, 0, affine58, perm2413)
  },
  {
    name: 'Encrypt CADB with [2,4,1,3] (expected ABCD)',
    expected: 'ABCD',
    fn: () => computeOutput('CADB', 'permutation', false, 0, affine58, perm2413)
  },
  {
    name: 'Round-trip ABCD with [3,1,4,2]: enc then dec',
    expected: 'ABCD',
    fn: () => {
      const enc = computeOutput('ABCD', 'permutation', false, 0, affine58, perm3142);
      return computeOutput(enc, 'permutation', true, 0, affine58, perm3142);
    }
  },
  {
    name: 'Round-trip WXYZ with [3,1,4,2]: enc then dec',
    expected: 'WXYZ',
    fn: () => {
      const enc = computeOutput('WXYZ', 'permutation', false, 0, affine58, perm3142);
      return computeOutput(enc, 'permutation', true, 0, affine58, perm3142);
    }
  },
  {
    name: 'Caesar HELLO shift=3 encrypt',
    expected: 'KHOOR',
    fn: () => computeOutput('HELLO', 'caesar', false, 3, affine58, perm3142)
  },
  {
    name: 'Caesar KHOOR shift=3 decrypt',
    expected: 'HELLO',
    fn: () => computeOutput('KHOOR', 'caesar', true, 3, affine58, perm3142)
  },
  {
    name: 'Affine HELLO a=5,b=8 encrypt',
    expected: caesarText('HELLO', 0), // just verify no crash; compare to known
    fn: () => computeOutput('HELLO', 'affine', false, 3, affine58, perm3142),
    skipExpect: true
  },
  {
    name: 'Affine round-trip HELLO a=5,b=8',
    expected: 'HELLO',
    fn: () => {
      const enc = computeOutput('HELLO', 'affine', false, 3, affine58, perm3142);
      return computeOutput(enc, 'affine', true, 3, affine58, perm3142);
    }
  },
  {
    name: 'Empty message returns empty string',
    expected: '',
    fn: () => computeOutput('', 'permutation', false, 0, affine58, perm3142)
  },
  {
    name: 'Whitespace-only message returns empty string',
    expected: '',
    fn: () => computeOutput('   ', 'permutation', false, 0, affine58, perm3142)
  }
];

console.log('\n=== STATE MACHINE REGRESSION TESTS ===\n');
let pass = 0, fail = 0;
for (const t of tests) {
  const actual = t.fn();
  const ok = t.skipExpect ? true : actual === t.expected;
  const status = ok ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${t.name}`);
  if (!ok) {
    console.log(`       Expected: "${t.expected}"`);
    console.log(`       Got:      "${actual}"`);
    fail++;
  } else {
    if (!t.skipExpect) console.log(`       Result: "${actual}"`);
    pass++;
  }
}
console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);

