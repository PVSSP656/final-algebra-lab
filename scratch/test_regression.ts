import { permutationText, S4, permutationLabel } from '../src/math/engine.ts';

// Find permutation matching 1-based key
function findPerm(oneBased: number[]) {
  const zeroBased = oneBased.map(x => x - 1);
  const idx = S4.findIndex(p => p.every((val, i) => val === zeroBased[i]));
  if (idx === -1) throw new Error(`Permutation not found: ${JSON.stringify(oneBased)}`);
  return { idx, perm: S4[idx] };
}

const perm3142 = findPerm([3, 1, 4, 2]);
const perm2413 = findPerm([2, 4, 1, 3]);

console.log('--- REGRESSION TEST SUITE ---');

// Test 1: Encrypt ABCD with [3,1,4,2]
const t1 = permutationText(perm3142.perm, 'ABCD', false);
console.log(`Test 1: Encrypt 'ABCD' with [3,1,4,2] -> Expected 'CADB', Got '${t1}' [${t1 === 'CADB' ? 'PASS' : 'FAIL'}]`);

// Test 2: Decrypt CADB with [3,1,4,2]
const t2 = permutationText(perm3142.perm, 'CADB', true);
console.log(`Test 2: Decrypt 'CADB' with [3,1,4,2] -> Expected 'ABCD', Got '${t2}' [${t2 === 'ABCD' ? 'PASS' : 'FAIL'}]`);

// Test 3: Encrypt ABCD with [2,4,1,3]
const t3 = permutationText(perm2413.perm, 'ABCD', false);
console.log(`Test 3: Encrypt 'ABCD' with [2,4,1,3] -> Expected 'BDAC', Got '${t3}' [${t3 === 'BDAC' ? 'PASS' : 'FAIL'}]`);

// Test 4: Encrypt CADB with [2,4,1,3]
const t4 = permutationText(perm2413.perm, 'CADB', false);
console.log(`Test 4: Encrypt 'CADB' with [2,4,1,3] -> Expected 'ABCD', Got '${t4}' [${t4 === 'ABCD' ? 'PASS' : 'FAIL'}]`);

// Test 5: Round trip ABCD with [3,1,4,2]
const t5Enc = permutationText(perm3142.perm, 'ABCD', false);
const t5Dec = permutationText(perm3142.perm, t5Enc, true);
console.log(`Test 5: Round-trip 'ABCD' with [3,1,4,2] -> Enc: '${t5Enc}', Dec: '${t5Dec}' [${t5Enc === 'CADB' && t5Dec === 'ABCD' ? 'PASS' : 'FAIL'}]`);

// Test 6: Round trip WXYZ with [3,1,4,2]
const t6Enc = permutationText(perm3142.perm, 'WXYZ', false);
const t6Dec = permutationText(perm3142.perm, t6Enc, true);
console.log(`Test 6: Round-trip 'WXYZ' with [3,1,4,2] -> Enc: '${t6Enc}', Dec: '${t6Dec}' [${t6Enc === 'YWZX' && t6Dec === 'WXYZ' ? 'PASS' : 'FAIL'}]`);

if (t1 === 'CADB' && t2 === 'ABCD' && t3 === 'BDAC' && t4 === 'ABCD' && t5Dec === 'ABCD' && t6Dec === 'WXYZ') {
  console.log('ALL 6 REGRESSION TESTS PASSED!');
} else {
  console.error('SOME TESTS FAILED!');
  process.exit(1);
}
