"""Independent checks for the three approved transformation systems."""
from itertools import permutations, product
from math import gcd
from collections import Counter

M = 26
UNITS = tuple(a for a in range(M) if gcd(a, M) == 1)

def shift(k, x):
    return (x + k) % M

def affine(key, x):
    a, b = key
    if gcd(a, M) != 1:
        raise ValueError("invalid affine multiplier")
    return (a * x + b) % M

def affine_compose(f, g):
    """Computes (f o g)(x) = f(g(x)), where g is applied first and f is applied second."""
    a, b = f
    c, d = g
    return ((a * c) % M, (a * d + b) % M)

def affine_inverse(f):
    a, b = f
    inv_a = pow(a, -1, M)
    return (inv_a, (-inv_a * b) % M)

def perm_apply(p, block):
    """Output pos i receives character at block[p[i]]."""
    return tuple(block[i] for i in p)

def perm_compose(p, q):
    """Computes (p o q)(x) = p(q(x)), where q is applied first and p is applied second."""
    return tuple(q[p[i]] for i in range(len(p)))

def perm_inverse(p):
    if sorted(p) != list(range(len(p))):
        raise ValueError("invalid permutation")
    result = [0] * len(p)
    for index, value in enumerate(p):
        result[value] = index
    return tuple(result)

# 1. Caesar Verification
assert len({shift(k, 0) for k in range(M)}) == 26
# Identity
assert all(shift(0, x) == x for x in range(M))
# Composition and Associativity
assert all(shift(k, shift(l, x)) == shift(k + l, x) for k, l, x in product(range(M), repeat=3))
# Inverses
assert all(shift(-k, shift(k, x)) == x for k, x in product(range(M), repeat=2))
# Negative modular reduction check
assert (-6) % M == 20
assert shift(-6, 0) == 20
# Commutativity
assert all(shift(k, shift(l, x)) == shift(l, shift(k, x)) for k, l, x in product(range(M), repeat=3))

# 2. Affine Verification
assert len(UNITS) == 12 and len(UNITS) * M == 312
# Identity
assert all(affine((1, 0), x) == x for x in range(M))
# Closure
assert all(
    affine_compose(f, g) in {(a, b) for a in UNITS for b in range(M)}
    for f, g in product([(a, b) for a in UNITS for b in range(M)], repeat=2)
)
# Composition agreement with function application: (f o g)(x) == f(g(x))
assert all(
    affine(affine_compose(f, g), x) == affine(f, affine(g, x))
    for f, g in product([(a, b) for a in UNITS for b in range(M)], repeat=2)
    for x in range(M)
)
# Inverse restoration
assert all(
    affine(affine_inverse(f), affine(f, x)) == x
    for f in [(a, b) for a in UNITS for b in range(M)]
    for x in range(M)
)
# Specific affine inverse test: for (5, 8), a^-1 = 21, b' = -21 * 8 % 26 = -168 % 26 = 14
assert affine_inverse((5, 8)) == (21, 14)
assert (-21 * 8) % 26 == 14
assert all(affine((21, 14), affine((5, 8), x)) == x for x in range(M))
# Non-commutativity verified preset: T1 = (3, 2), T2 = (5, 7)
t1 = (3, 2)
t2 = (5, 7)
comp_21 = affine_compose(t2, t1) # (15, 17)
comp_12 = affine_compose(t1, t2) # (15, 23)
assert comp_21 == (15, 17)
assert comp_12 == (15, 23)
assert comp_21 != comp_12

# 3. S4 Verification
S4 = tuple(permutations(range(4)))
assert len(S4) == 24
# Identity
assert perm_apply((0, 1, 2, 3), tuple("ABCD")) == tuple("ABCD")
# Composition agreement: (p o q)(x) == p(q(x))
assert all(
    perm_apply(perm_compose(p, q), x) == perm_apply(p, perm_apply(q, x))
    for p, q in product(S4, repeat=2)
    for x in permutations(range(4))
)
# Inverse restoration
assert all(
    perm_apply(perm_inverse(p), perm_apply(p, x)) == x
    for p in S4
    for x in permutations(range(4))
)
# Standard project example: [3, 1, 4, 2] (0-indexed: (2, 0, 3, 1))
key_example = (2, 0, 3, 1)
assert perm_apply(key_example, tuple("ABCD")) == tuple("CADB")
# Inverse of [3, 1, 4, 2] is [2, 4, 1, 3] (0-indexed: (1, 3, 0, 2))
key_inv_example = perm_inverse(key_example)
assert key_inv_example == (1, 3, 0, 2)
assert perm_apply(key_inv_example, tuple("CADB")) == tuple("ABCD")
# Non-commutativity verified preset: P = [2, 1, 3, 4] -> (1, 0, 2, 3), Q = [1, 3, 2, 4] -> (0, 2, 1, 3)
p_preset = (1, 0, 2, 3)
q_preset = (0, 2, 1, 3)
pq = perm_compose(p_preset, q_preset)
qp = perm_compose(q_preset, p_preset)
assert pq != qp
assert perm_apply(pq, tuple("ABCD")) == tuple("CABD")
assert perm_apply(qp, tuple("ABCD")) == tuple("BCAD")

# 4. Multiset letter frequency invariance
text = "THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG"
plain_counts = sorted(Counter(text).values())
cipher_caesar = "".join(chr(65 + shift(7, ord(c) - 65)) for c in text)
caesar_counts = sorted(Counter(cipher_caesar).values())
assert plain_counts == caesar_counts

cipher_affine = "".join(chr(65 + affine((5, 8), ord(c) - 65)) for c in text)
affine_counts = sorted(Counter(cipher_affine).values())
assert plain_counts == affine_counts

print("All Caesar, affine, S4, and frequency verification checks passed successfully.")
