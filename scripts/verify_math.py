"""Independent checks for the three approved transformation systems."""
from itertools import permutations, product
from math import gcd
M = 26
UNITS = tuple(a for a in range(M) if gcd(a, M) == 1)

def shift(k, x): return (x + k) % M

def affine(key, x):
    a, b = key
    if gcd(a, M) != 1: raise ValueError("invalid affine multiplier")
    return (a * x + b) % M

def affine_compose(f, g):
    a, b = f; c, d = g
    return ((a * c) % M, (a * d + b) % M)

def affine_inverse(f):
    a, b = f
    inverse = pow(a, -1, M)
    return inverse, (-inverse * b) % M

def perm_apply(p, block): return tuple(block[i] for i in p)

def perm_compose(p, q): return tuple(q[p[i]] for i in range(len(p)))

def perm_inverse(p):
    if sorted(p) != list(range(len(p))): raise ValueError("invalid permutation")
    result = [0] * len(p)
    for index, value in enumerate(p): result[value] = index
    return tuple(result)

S4 = tuple(permutations(range(4)))
assert len({shift(k, 0) for k in range(M)}) == 26
assert all(shift(k, shift(l, x)) == shift(k + l, x) for k, l, x in product(range(M), repeat=3))
assert all(shift(-k, shift(k, x)) == x for k, x in product(range(M), repeat=2))
assert len(UNITS) == 12 and len(UNITS) * M == 312
assert all(affine_compose(f, g) in {(a, b) for a in UNITS for b in range(M)} for f, g in product([(a, b) for a in UNITS for b in range(M)], repeat=2))
assert all(affine(affine_compose(f, g), x) == affine(f, affine(g, x)) for f, g in product([(a, b) for a in UNITS for b in range(M)], repeat=2) for x in range(M))
assert all(affine(affine_inverse(f), affine(f, x)) == x for f in [(a, b) for a in UNITS for b in range(M)] for x in range(M))
assert len(S4) == 24
assert all(perm_apply(perm_compose(p, q), x) == perm_apply(p, perm_apply(q, x)) for p, q in product(S4, repeat=2) for x in permutations(range(4)))
assert all(perm_apply(perm_inverse(p), perm_apply(p, x)) == x for p in S4 for x in permutations(range(4)))
assert perm_apply((2, 0, 3, 1), tuple("ABCD")) == tuple("CADB")
assert perm_compose((1, 0, 2, 3), (0, 2, 1, 3)) != perm_compose((0, 2, 1, 3), (1, 0, 2, 3))
print("All Caesar, affine and S4 verification checks passed.")
