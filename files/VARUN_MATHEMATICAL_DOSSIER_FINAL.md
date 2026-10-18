# Mathematical Research Dossier: Analysis of Three Transformation Systems

**Project title:** Cryptography Through Abstract Algebra: An Interactive Study of Three Transformation Systems  
**Website:** https://abstract-algebra-lab.web.app/  
**Repository (current project code):** https://github.com/PVSSP656/final-algebra-lab (inspected at commit `5ac11db`; see Section 3.2)  
**Assigned analyst:** Varun Raaj V J  
**Submission deadline:** 24 October 2026  
**Document status:** Final edited version, 18 October 2026

---

## Abstract

This dossier studies three finite transformation systems through elementary group theory: Caesar shifts modulo 26, invertible affine transformations modulo 26, and position permutations on four-character blocks. It derives their operations, identities, inverses, selected element orders, selected subgroup structures, and worked examples of composition. The two composition orders of a pair of four-position permutations are recomputed from first principles, and the convention used by the project's position-index representation is stated precisely.

Mathematical derivations, manual calculations, source inspection, executed software checks, and pending work are kept in separate categories (Section 3). The algebraic results are proved or calculated by hand. The project's source files were inspected and a limited set of commands was executed in the editor's own sandbox at a recorded commit. Those executions are not a substitute for runs on the team's own machines, which remain pending (Section 10).

These systems are useful pedagogical models of finite groups and reversible transformations. Their reversibility does not imply modern cryptographic security.

## 1. Scope and research questions

The investigation is restricted to three systems:

1. **Caesar transformations:** \(E_k(x)=x+k \pmod{26}\), indexed by \(k\in\mathbb{Z}_{26}\).
2. **Invertible affine transformations:** \(E_{a,b}(x)=ax+b \pmod{26}\), where \(a\) is a unit modulo 26 and \(b\in\mathbb{Z}_{26}\).
3. **Four-position permutations:** rearrangements of four-character blocks, represented by elements of \(S_4\).

The main questions are:

- How do these transformations form groups under composition?
- How are identities and inverses calculated?
- What are the element orders and representative subgroups?
- Which systems are abelian?
- How does the project's position-index representation of a permutation relate to the standard mathematical notation, and how do two such permutations compose?

This document does not claim that these classical systems provide secure modern encryption.

## 2. Notation and conventions

- Letters are encoded as residues: \(A=0, B=1, \ldots, Z=25\).
- For functions, \(g\circ f\) means "apply \(f\) first, then \(g\)" (right-to-left composition).
- Literal strings such as `ABCD` are written in code font and are never mathematical symbols.
- Permutation keys in the position-index representation are written one-based, for example \([3,1,4,2]\). The project source code stores them zero-based internally and displays them one-based (see Section 3.2).

## 3. Evidence and verification status

### 3.1 Evidence categories

| Category | Meaning | Where it appears |
| --- | --- | --- |
| **Proof** | Follows from definitions by algebraic argument. | Sections 5–7 (derivations and propositions) |
| **Manual calculation** | An explicitly worked numerical example. | Sections 5.4, 6.3, 6.4, 7.5, 7.6 |
| **Source inspection** | A statement confirmed by reading source files at a named commit. | Section 3.2 |
| **Executed software verification** | A statement supported by actual command output. | Section 3.3 |
| **Pending** | Work not yet evidenced. | Section 10 |

A correct derivation does not prove that the code implements it. A successful build does not prove mathematical correctness. Each category is reported separately.

### 3.2 Source inspection (repository identification and findings)

**Which repository is intended.** Project materials cite two repositories. Both were cloned and compared.

| Item | `final-algebra-lab` | `abstract-algebra-lab` |
| --- | --- | --- |
| Head commit inspected | `5ac11db`, 18 Oct 2026 (merge of pull request #3) | `8212c79`, 14 Oct 2026 |
| README | Describes the working app, `npm run build`, `npm run lint`, `npm run verify`, and the input conventions | States "No website UI has been implemented" and describes a scope-migration stage |
| `src/math/engine.ts` | 341 lines | 111 lines (older version) |
| Other evidence | Firebase hosting config, KaTeX dependency, `evidence/screenshots/` directory, in-app link to this repository | Includes `docs/` with charter and specification |

The `.firebaserc` file in `final-algebra-lab` sets the default Firebase project to `abstract-algebra-lab`, which is consistent with the website address `abstract-algebra-lab.web.app`. The website name therefore does not imply that the GitHub repository is named `abstract-algebra-lab`. The current code and documentation point to **`final-algebra-lab`** as the intended project repository, and this dossier cites it. The earlier draft cited `abstract-algebra-lab`; this change is deliberate and is flagged for team confirmation (Section 10, item 1). Whether the deployed website was built from commit `5ac11db` has not been verified.

**Findings at commit `5ac11db`** (files `src/math/engine.ts`, `scripts/verify_math.py`, `package.json`, `README.md`):

- `permutationCompose(first, second)` returns `first.map((index) => second[index])`. For zero-based lists, entry \(i\) of the result is `second[first[i]]`. The source comment states that `second` is applied first and `first` is applied second (S1).
- `permutationApply(permutation, block)` returns `permutation.map((index) => block[index])`, so output position \(i\) receives input position `permutation[i]` (S1). This matches the convention in Section 7.6.
- `permutationInverse` sets `inverse[value] = index` for each entry (S1).
- `permutationText` uppercases the text, extracts letters only, transforms each complete group of four letters, leaves a final group of fewer than four letters unchanged, and puts non-letters back in their original places. Decryption applies the inverse key (S1).
- `perm_compose(p, q)` in the Python verifier returns `tuple(q[p[i]] for i in range(len(p)))`, the same formula as the TypeScript function, and `perm_apply` uses the same output-position convention (S2).
- `package.json` defines `build`, `lint`, and `verify` scripts but no test script. `npm run verify` runs `python scripts/verify_math.py` only (S3). The Python verifier does not import `engine.ts`, so the two implementations are checked independently, not against each other, by the project's own commands.
- The source comment "(first o second)(x) = first(second(x))" describes composition of *operations on strings*. Viewed as index lists, entry \(i\) of the result equals `second[first[i]]`, which is the composition of *index functions* in the opposite order (Section 7.6). Both readings are consistent, but the comment would be clearer if it said so.
- The verifier's permutation checks use the key `[3,1,4,2]` (encryption, inverse, round trip) and a different non-commutativity pair. They do not include the pair \(p=[3,1,4,2]\), \(q=[2,1,4,3]\) used in Section 7.6 and do not test incomplete blocks (S2).

Only the permutation functions and `affineInverse` were read in detail in `engine.ts`. Other functions (for example affine composition, order computation, and user-interface trace code) were not inspected.

### 3.3 Executed verification

The following commands were run by the editor in a Linux sandbox (Python 3.12.3, Node 22.22.2, npm 10.9.7) on a fresh clone of `final-algebra-lab` at commit `5ac11db67f02843511ab93debb1aad7720c1748d`. They were **not** run on a team member's machine.

| Command | Result |
| --- | --- |
| `python3 scripts/verify_math.py` | Exit code 0. Printed: `All Caesar, affine, S4, and frequency verification checks passed successfully.` |
| `npm ci` | Completed; 169 packages added. |
| `npm run build` | Completed (`tsc -b && vite build`, built in under one second). Vite printed a warning that one output chunk exceeds 500 kB; this is a size warning, not an error. |
| `npm run lint` | Completed with no findings printed. |
| A small Node script that imports `src/math/engine.ts` directly (editor's own harness, not part of the repository) | Output recorded in Section 7.7. |

Not executed: the script through `npm run verify`, any browser or deployed-website behavior, and any run on a team machine.

A separate brute-force script written by the editor (not project code) re-checked the arithmetic and group-theoretic claims in Sections 5–7: Caesar order counts and generators, the affine group size, composition and inverse laws, the center and translation normality, orders of selected affine elements, \(S_4\) cycle-type counts, \(A_4\), \(V_4\), the order-8 subgroup, and both composition orders in Section 7.6. All agreed with the hand derivations. This is a cross-check of the mathematics, not a verification of the project software.

## 4. Mathematical preliminaries

A group \(G\) under an operation \(\circ\) satisfies:

1. **Closure:** if \(g,h\in G\), then \(g\circ h\in G\).
2. **Associativity:** \((f\circ g)\circ h=f\circ(g\circ h)\).
3. **Identity:** there is an element \(e\) with \(e\circ g=g\circ e=g\) for all \(g\).
4. **Inverses:** for every \(g\) there is \(g^{-1}\) with \(g\circ g^{-1}=g^{-1}\circ g=e\).

Functions from a set to itself compose associatively. Bijections are invertible, and the inverse of a bijection is a bijection. Consequently, any collection of bijections of a set that contains the identity and is closed under composition and inverses is a group (Fraleigh, 2003; Dummit & Foote, 2004).

The **order** of an element \(g\), written \(\operatorname{ord}(g)\), is the least positive integer \(n\) such that \(g^n=e\). A group is **cyclic** if one element generates it. A cyclic group of order \(n\) has exactly one subgroup for each positive divisor of \(n\) (Fraleigh, 2003; Dummit & Foote, 2004).

## 5. Caesar transformations: the cyclic group \(C_{26}\)

### 5.1 Definition and group structure

**[Proof]** For \(k\in\mathbb{Z}_{26}\), define

\[
E_k(x)=x+k \pmod{26}.
\]

Composition gives

\[
(E_j\circ E_k)(x)=(x+k)+j \pmod{26}=E_{j+k}(x).
\]

Composition of transformations therefore corresponds to addition in \(\mathbb{Z}_{26}\). Addition modulo 26 is closed and associative, has identity \(0\), and each \(k\) has additive inverse \(-k \pmod{26}\). Hence the Caesar transformations form a group isomorphic to the cyclic group \(C_{26}\) (Stinson, 2005, describes the shift cipher; Fraleigh, 2003, covers cyclic groups). The group is abelian because modular addition is commutative.

The identity is \(E_0\). The inverse of \(E_k\) is \(E_{-k}\), equal to \(E_{26-k}\) for nonzero \(k\).

### 5.2 Element orders and generators

**[Proof]** The order of a shift is

\[
\operatorname{ord}(E_k)=\frac{26}{\gcd(k,26)},
\]

where \(\gcd(0,26)=26\), so the formula gives order \(1\) for the identity \(E_0\).

Since \(26=2\cdot 13\), the possible orders are \(1, 2, 13, 26\):

| Order | Shifts \(k\) | Count |
| --- | --- | --- |
| 1 | \(0\) | 1 |
| 2 | \(13\) | 1 |
| 13 | \(2,4,6,\ldots,24\) (even \(k\) with \(k\neq 0\)) | 12 |
| 26 | \(k\) with \(\gcd(k,26)=1\) | 12 |

The counts sum to \(1+1+12+12=26\). An element generates \(C_{26}\) exactly when its order is 26, that is, when \(\gcd(k,26)=1\). The generator keys are

\[
\{1,3,5,7,9,11,15,17,19,21,23,25\},
\]

and there are \(\varphi(26)=12\) of them.

### 5.3 Subgroups

**[Proof]** Because \(C_{26}\) is cyclic, it has exactly one subgroup for each divisor of 26, namely \(1, 2, 13, 26\):

- Order 1: \(\{E_0\}\).
- Order 2: \(\langle E_{13}\rangle=\{E_0,E_{13}\}\).
- Order 13: \(\langle E_2\rangle=\{E_0,E_2,E_4,\ldots,E_{24}\}\), the even shifts.
- Order 26: the full group.

There are exactly four subgroups.

### 5.4 Worked example

**[Manual calculation]** Encrypt `ABC` with shift \(k=3\). With \(A=0\), \(B=1\), \(C=2\):

\[
(0+3,\ 1+3,\ 2+3) \pmod{26} = (3,4,5),
\]

which is `DEF`. Decrypt with shift \(-3\equiv 23 \pmod{26}\):

\[
(3+23,\ 4+23,\ 5+23) \pmod{26} = (0,1,2),
\]

which recovers `ABC`.

## 6. Affine transformations modulo 26

### 6.1 Definition and size

**[Proof]** Define

\[
E_{a,b}(x)=ax+b \pmod{26},
\]

where \(a,b\in\mathbb{Z}_{26}\) and \(\gcd(a,26)=1\). The condition on \(a\) is necessary and sufficient for multiplication by \(a\) to be invertible modulo 26, so each such map is a bijection of \(\mathbb{Z}_{26}\). There are \(\varphi(26)=12\) valid multipliers and 26 choices of \(b\), so the group has

\[
12\cdot 26 = 312
\]

elements (Stinson, 2005, counts the keys of the affine cipher). The project source labels this group \(\mathrm{AGL}(1,26)\) (S4).

### 6.2 Composition, identity, and inverse

**[Proof]** Apply \(E_{a_1,b_1}\) first and \(E_{a_2,b_2}\) second:

\[
\begin{aligned}
(E_{a_2,b_2}\circ E_{a_1,b_1})(x) &= a_2(a_1x+b_1)+b_2 \\
&= a_2a_1x+(a_2b_1+b_2) \pmod{26}.
\end{aligned}
\]

The composition rule is therefore

\[
E_{a_2,b_2}\circ E_{a_1,b_1}=E_{a_2a_1,\ a_2b_1+b_2},
\]

with both parameters reduced modulo 26. The product \(a_2a_1\) is a unit, so the result is again in the set. The identity is \(E_{1,0}\).

To invert \(y=ax+b \pmod{26}\), multiply by \(a^{-1}\):

\[
x=a^{-1}(y-b) \pmod{26}.
\]

Therefore

\[
E_{a,b}^{-1}(y)=a^{-1}y-a^{-1}b \pmod{26},
\qquad\text{that is,}\qquad
E_{a,b}^{-1}=E_{a^{-1},\,-a^{-1}b}.
\]

The inverse multiplier \(a^{-1}\) is a unit because \(a\) is a unit. As a check, \(E_{a,b}^{-1}(E_{a,b}(x))=a^{-1}(ax+b)-a^{-1}b=x\).

### 6.3 Worked example: \(a=5,\ b=8\)

**[Manual calculation]** Since \(5\cdot 21=105=4\cdot 26+1\), we have \(5^{-1}\equiv 21 \pmod{26}\). The inverse offset is

\[
-21\cdot 8=-168\equiv 14 \pmod{26},
\]

because \(168=6\cdot 26+12\) and \(-12\equiv 14\). Hence

\[
E_{5,8}^{-1}(y)=21y+14 \pmod{26},
\qquad\text{that is,}\qquad E_{5,8}^{-1}=E_{21,14}.
\]

Encrypt `ABC`:

- \(A=0\mapsto 5\cdot 0+8=8\mapsto\) `I`.
- \(B=1\mapsto 5\cdot 1+8=13\mapsto\) `N`.
- \(C=2\mapsto 5\cdot 2+8=18\mapsto\) `S`.

The ciphertext is `INS`. Decrypt:

- \(I=8\mapsto 21\cdot 8+14=182=7\cdot 26\equiv 0\mapsto\) `A`.
- \(N=13\mapsto 21\cdot 13+14=287=11\cdot 26+1\equiv 1\mapsto\) `B`.
- \(S=18\mapsto 21\cdot 18+14=392=15\cdot 26+2\equiv 2\mapsto\) `C`.

The result is `ABC`.

### 6.4 Noncommutativity and the center

**[Manual calculation]** Let \(f=E_{3,1}\) and \(g=E_{1,5}\). Both are valid, since \(\gcd(3,26)=\gcd(1,26)=1\).

Apply \(f\) first, then \(g\):

\[
(g\circ f)(x)=(3x+1)+5=3x+6 \pmod{26},
\]

so \(g\circ f=E_{3,6}\). Apply \(g\) first, then \(f\):

\[
(f\circ g)(x)=3(x+5)+1=3x+16 \pmod{26},
\]

so \(f\circ g=E_{3,16}\). These maps differ; for example at \(x=0\) the outputs are \(6\) and \(16\). The affine group is therefore **non-abelian**.

**[Proof]** Individual elements can still commute with everything. The center of the group (the elements commuting with all others) is

\[
Z=\{E_{1,0},\ E_{1,13}\}.
\]

*Argument.* Suppose \(E_{a,b}\) commutes with every translation \(E_{1,c}\). Comparing \(E_{a,b}\circ E_{1,c}=ax+ac+b\) with \(E_{1,c}\circ E_{a,b}=ax+b+c\) at \(c=1\) gives \(a\equiv 1\). Next suppose \(E_{1,b}\) commutes with every multiplier \(E_{u,0}\). Then \(ux+b\equiv ux+ub\), so \((u-1)b\equiv 0 \pmod{26}\) for every unit \(u\). Taking \(u=3\) gives \(2b\equiv 0\), so \(b\in\{0,13\}\). Conversely, every unit \(u\) is odd, so \(u-1\) is even and \((u-1)\cdot 13\equiv 0 \pmod{26}\); thus \(E_{1,13}\) commutes with all multipliers and all translations, and hence with every element.

### 6.5 Translation subgroup and semidirect product

**[Proof]** The translations \(T_b=E_{1,b}\) satisfy \(T_c\circ T_b=T_{b+c}\), so they form a subgroup isomorphic to \((\mathbb{Z}_{26},+)\), of order 26. The multiplier maps \(M_a=E_{a,0}\), with \(a\in\mathbb{Z}_{26}^{\times}\), form a subgroup isomorphic to the unit group \(\mathbb{Z}_{26}^{\times}\), of order 12. Every affine map factors uniquely as a multiplier followed by a translation:

\[
E_{a,b}=T_b\circ M_a.
\]

The two subgroups intersect only in the identity, and \(26\cdot 12=312\).

Conjugation by a multiplier acts on translations by

\[
M_a\circ T_b\circ M_a^{-1}=T_{ab}.
\]

*Check:* \(x\mapsto a^{-1}x\mapsto a^{-1}x+b\mapsto a(a^{-1}x+b)=x+ab\). The translation subgroup is therefore normal, and

\[
\operatorname{Aff}(\mathbb{Z}_{26})\cong \mathbb{Z}_{26}\rtimes \mathbb{Z}_{26}^{\times},
\]

where a unit \(u\) acts on the additive group by multiplication \(b\mapsto ub\) (Dummit & Foote, 2004, treat semidirect products).

### 6.6 Representative element orders

**[Proof]** Repeated composition gives

\[
E_{a,b}^{\,n}(x)=a^n x+b\,(1+a+\cdots+a^{n-1}) \pmod{26}.
\]

The order of \(E_{a,b}\) is the least positive \(n\) for which both \(a^n\equiv 1\) and \(b\,(1+a+\cdots+a^{n-1})\equiv 0 \pmod{26}\). Examples:

- \(E_{1,0}\) has order 1.
- A translation \(E_{1,b}\) has order \(26/\gcd(b,26)\). In particular \(E_{1,1}\) has order 26 and \(E_{1,13}\) has order 2.
- \(E_{25,0}=E_{-1,0}\) has order 2, since \((-1)^2\equiv 1\).
- \(E_{5,8}\) has order 4. The powers of 5 modulo 26 are \(5, 25, 21, 1\), so \(a^n\not\equiv 1\) for \(n=1,2,3\) and \(5^4\equiv 1\). Also \(1+5+25+125=156=6\cdot 26\equiv 0\), so the offset term vanishes at \(n=4\) and \(E_{5,8}^{\,4}=E_{1,0}\).

A complete classification of all 312 element orders and of all subgroups is **not** attempted here. The claims above concern the group order, the translation and multiplier subgroups, the center, the semidirect-product structure, and the stated examples.

### 6.7 Caesar transformations as a subgroup

The Caesar shifts are exactly the affine maps with multiplier \(a=1\), namely \(\{E_{1,b}: b\in\mathbb{Z}_{26}\}\). The Caesar group is therefore the translation subgroup of the affine group: a normal subgroup of order 26.

## 7. Four-position permutations and \(S_4\)

### 7.1 Group structure and size

The symmetric group \(S_4\) consists of all permutations of four positions. It has

\[
\lvert S_4\rvert = 4! = 24
\]

elements. Under function composition, permutations are closed, composition is associative, the identity fixes every position, and every permutation has an inverse, so \(S_4\) is a group (Fraleigh, 2003; Dummit & Foote, 2004).

### 7.2 Cycle types, counts, and orders

**[Proof]** The order of a permutation is the least common multiple of its disjoint cycle lengths. The five cycle types correspond to the five partitions of 4.

| Cycle type | Example | Number of elements | Element order |
| --- | --- | --- | --- |
| Identity, \(1^4\) | \(e\) | 1 | 1 |
| Transposition, \(2,1^2\) | \((1\,2)\) | 6 | 2 |
| Double transposition, \(2^2\) | \((1\,2)(3\,4)\) | 3 | 2 |
| 3-cycle, \(3,1\) | \((1\,2\,3)\) | 8 | 3 |
| 4-cycle, \(4\) | \((1\,2\,3\,4)\) | 6 | 4 |
| **Total** | | **24** | |

The counts follow from choosing the moved positions and arranging the cycles. There are \(\binom{4}{2}=6\) transpositions; three ways to split four points into two unordered pairs; \(\binom{4}{3}\cdot 2=8\) three-cycles; and \((4-1)!=6\) four-cycles. The sum is \(1+6+3+8+6=24\).

### 7.3 Even permutations, \(A_4\), and \(V_4\)

A transposition is odd; a 3-cycle is even, being a product of two transpositions; a 4-cycle is odd, being a product of three transpositions. The alternating group \(A_4\) consists of all even permutations and has order \(4!/2=12\). It contains the identity, all eight 3-cycles, and all three double transpositions: \(1+8+3=12\).

The Klein four-group is

\[
V_4=\{e,\ (1\,2)(3\,4),\ (1\,3)(2\,4),\ (1\,4)(2\,3)\}.
\]

Every nonidentity element has order 2, and the product of any two distinct nonidentity elements is the third. It is a subgroup of \(A_4\), and it is normal in \(S_4\) because conjugation preserves cycle type and therefore maps double transpositions to double transpositions.

### 7.4 Representative cyclic and dihedral subgroups

- A transposition generates a cyclic subgroup of order 2.
- A 3-cycle generates a cyclic subgroup of order 3.
- A 4-cycle generates a cyclic subgroup of order 4.
- Let \(r=(1\,2\,3\,4)\) and \(s=(1\,3)\). Then \(r^4=e\), \(s^2=e\), and \(srs=r^{-1}\) (conjugating \(r\) by \(s\) swaps the symbols 1 and 3, giving \((3\,2\,1\,4)=(1\,4\,3\,2)=r^{-1}\)). They generate a subgroup of order 8, the symmetry group of a square:

\[
\{e,\ (1\,2\,3\,4),\ (1\,3)(2\,4),\ (1\,4\,3\,2),\ (1\,3),\ (2\,4),\ (1\,4)(2\,3),\ (1\,2)(3\,4)\}.
\]

  The eight elements are \(e,\ r,\ r^2,\ r^3,\ s,\ rs,\ r^2s,\ r^3s\), and they are distinct.

Some authors write \(D_4\) and others \(D_8\) for this group. To avoid ambiguity, this dossier calls it "the dihedral group of order 8".

### 7.5 Noncommutativity in standard function notation

**[Manual calculation]** Let \(\sigma=(1\,2)\) and \(\tau=(2\,3)\), composed right to left.

- \(\sigma\circ\tau\): \(1\mapsto 1\mapsto 2\), \(2\mapsto 3\mapsto 3\), \(3\mapsto 2\mapsto 1\). So \(\sigma\circ\tau=(1\,2\,3)\).
- \(\tau\circ\sigma\): \(1\mapsto 2\mapsto 3\), \(3\mapsto 3\mapsto 2\), \(2\mapsto 1\mapsto 1\). So \(\tau\circ\sigma=(1\,3\,2)\).

These differ, so \(S_4\) is non-abelian. Section 7.6 gives a second noncommutativity example in the project's position-index representation.

### 7.6 Position-index representation for four-character blocks

#### Convention

**[Proof]** A key is a list \(p=[p_1,p_2,p_3,p_4]\), a rearrangement of \(1,2,3,4\). The key **acts on a four-character string** \(x=x_1x_2x_3x_4\) by

\[
P_p(x)_i = x_{p_i},
\]

that is, **output position \(i\) receives the character from input position \(p_i\)**.

*Example.* \(p=[3,1,4,2]\) on `ABCD`:

- output 1 receives input 3: `C`;
- output 2 receives input 1: `A`;
- output 3 receives input 4: `D`;
- output 4 receives input 2: `B`.

So applying \(P_p\) to `ABCD` gives `CADB`.

*Relation to standard notation.* Read the list as the function \(i\mapsto p_i\). In the usual "moves-to" description of a permutation, the character at input position \(j\) moves to output position \(\pi(j)\). The rule \(P_p(x)_i=x_{p_i}\) says the character at input position \(p_i\) moves to output position \(i\), so \(\pi(p_i)=i\), that is, \(\pi=p^{-1}\). The list \(p\) and the "moves-to" permutation are inverses of each other, so the two notations must not be confused.

#### Composition formula

**[Proof]** Apply \(q\) first, then \(p\). Then

\[
P_p\bigl(P_q(x)\bigr)_i = \bigl(P_q(x)\bigr)_{p_i} = x_{q_{p_i}}.
\]

Therefore \(P_p\circ P_q=P_{p\star q}\), where the composite list for "apply \(q\) first, then \(p\)" is

\[
\boxed{(p\star q)_i = q_{p_i}}.
\]

Equivalently, \(p\star q\) is the composition \(q\circ p\) of the index functions \(i\mapsto p_i\) and \(i\mapsto q_i\). The correspondence \(p\mapsto P_p\) therefore reverses the order of composition: \(P_p\circ P_q=P_{q\circ p}\) when the lists are read as functions on indices. The identity list is \([1,2,3,4]\), and the inverse list \(p^{-1}\) satisfies \((p\star p^{-1})_i=p^{-1}_{p_i}=i\) and \((p^{-1}\star p)_i=p_{p^{-1}_i}=i\), so \(P_{p^{-1}}\) undoes \(P_p\).

#### Worked example (all indices recomputed)

**[Manual calculation]** Take \(p=[3,1,4,2]\), \(q=[2,1,4,3]\), and input `ABCD`. The input positions are \(1=\)`A`, \(2=\)`B`, \(3=\)`C`, \(4=\)`D`.

**Order A: apply \(q\) first, then \(p\).**

1. Apply \(q=[2,1,4,3]\) to `ABCD`: output 1 takes input 2 (`B`); output 2 takes input 1 (`A`); output 3 takes input 4 (`D`); output 4 takes input 3 (`C`). The result is `BADC`.
2. Apply \(p=[3,1,4,2]\) to `BADC`, whose positions are \(1=\)`B`, \(2=\)`A`, \(3=\)`D`, \(4=\)`C`: output 1 takes input 3 (`D`); output 2 takes input 1 (`B`); output 3 takes input 4 (`C`); output 4 takes input 2 (`A`). The result is `DBCA`.
3. Composite list, \((p\star q)_i=q_{p_i}\):
   - \(i=1\): \(p_1=3\), \(q_3=4\), so the entry is \(4\).
   - \(i=2\): \(p_2=1\), \(q_1=2\), so the entry is \(2\).
   - \(i=3\): \(p_3=4\), \(q_4=3\), so the entry is \(3\).
   - \(i=4\): \(p_4=2\), \(q_2=1\), so the entry is \(1\).

   So \(p\star q=[4,2,3,1]\).
4. Check: apply \([4,2,3,1]\) directly to `ABCD`: output 1 takes input 4 (`D`); output 2 takes input 2 (`B`); output 3 takes input 3 (`C`); output 4 takes input 1 (`A`). The result is `DBCA`, which equals the two-step result.

**Order B: apply \(p\) first, then \(q\).**

1. Apply \(p=[3,1,4,2]\) to `ABCD`: output 1 takes input 3 (`C`); output 2 takes input 1 (`A`); output 3 takes input 4 (`D`); output 4 takes input 2 (`B`). The result is `CADB`.
2. Apply \(q=[2,1,4,3]\) to `CADB`, whose positions are \(1=\)`C`, \(2=\)`A`, \(3=\)`D`, \(4=\)`B`: output 1 takes input 2 (`A`); output 2 takes input 1 (`C`); output 3 takes input 4 (`B`); output 4 takes input 3 (`D`). The result is `ACBD`.
3. Composite list, \((q\star p)_i=p_{q_i}\):
   - \(i=1\): \(q_1=2\), \(p_2=1\), so the entry is \(1\).
   - \(i=2\): \(q_2=1\), \(p_1=3\), so the entry is \(3\).
   - \(i=3\): \(q_3=4\), \(p_4=2\), so the entry is \(2\).
   - \(i=4\): \(q_4=3\), \(p_3=4\), so the entry is \(4\).

   So \(q\star p=[1,3,2,4]\).
4. Check: apply \([1,3,2,4]\) directly to `ABCD`: output 1 takes input 1 (`A`); output 2 takes input 3 (`C`); output 3 takes input 2 (`B`); output 4 takes input 4 (`D`). The result is `ACBD`, which equals the two-step result.

**Conclusion.** Order A gives `DBCA` with composite list \([4,2,3,1]\); order B gives `ACBD` with composite list \([1,3,2,4]\). The strings and the lists both differ, so \(P_p\) and \(P_q\) do not commute: the order of composition matters.

*Cycle-notation check.* Read as functions \(i\mapsto p_i\), \(p=(1\,3\,4\,2)\) and \(q=(1\,2)(3\,4)\). The index composition \(q\circ p\) gives \(1\mapsto 3\mapsto 4\), \(2\mapsto 1\mapsto 2\), \(3\mapsto 4\mapsto 3\), \(4\mapsto 2\mapsto 1\), which is the list \([4,2,3,1]=p\star q\), as derived.

#### Inverse and round trip

**[Manual calculation]** For \(p=[3,1,4,2]\), solving \(p^{-1}_{p_i}=i\) gives \(p^{-1}=[2,4,1,3]\). Applying \(p^{-1}\) to `CADB`: output 1 takes input 2 (`A`); output 2 takes input 4 (`B`); output 3 takes input 1 (`C`); output 4 takes input 3 (`D`). The result is `ABCD`. The composite \(p\star p^{-1}\) has entries \(p^{-1}_{p_i}\): \(p^{-1}_3=1\), \(p^{-1}_1=2\), \(p^{-1}_4=3\), \(p^{-1}_2=4\), giving \([1,2,3,4]\).

### 7.7 Agreement with the project code and incomplete blocks

**[Source inspection] and [Executed software verification]** The mapping from this notation to the code (S1, S2) is:

- `permutationApply(p, block)` implements \(P_p\).
- `permutationCompose(first, second)` returns the list for "apply `second` first, then `first`", so `permutationCompose(p, q)` \(=p\star q\). The Python function `perm_compose(p, q)` has the same argument order and formula.
- `permutationInverse` computes \(p^{-1}\).

The editor imported `src/math/engine.ts` into a small Node script (not part of the repository) at commit `5ac11db` and obtained the following output, with keys given one-based as above:

| Check | Output |
| --- | --- |
| \(P_p\) on `ABCD` (encrypt, \(p=[3,1,4,2]\)) | `CADB` |
| \(P_q\) on `ABCD` | `BADC` |
| `permutationCompose(p, q)` | \([4,2,3,1]\), applied to `ABCD` gives `DBCA`; stepwise gives `DBCA` |
| `permutationCompose(q, p)` | \([1,3,2,4]\), applied to `ABCD` gives `ACBD`; stepwise gives `ACBD` |
| `permutationInverse(p)` | \([2,4,1,3]\) |
| Decrypt `CADB` with \(p\) | `ABCD` |
| `permutationCompose(p, inverse)` and `permutationCompose(inverse, p)` | both \([1,2,3,4]\) |
| Composite equals stepwise application, all \(24\times 24\) pairs, two test strings | 0 mismatches in 1152 cases; the 24 keys in `S4` are distinct |
| Encrypt then decrypt `ABCDEFGH` for all 24 keys | 0 failures |

These outputs agree with the hand calculation in Section 7.6.

**Incomplete trailing blocks.** The abstract group \(S_4\) says nothing about leftover characters; this is implementation behavior. In the inspected code, only complete groups of four *letters* are rearranged. Letters are uppercased and collected while skipping non-letters, and non-letters are restored to their original positions. In the editor's run with \(p=[3,1,4,2]\): `ABCDEF` gave `CADBEF`, `ABC` gave `ABC`, and `AB-CD EF!` gave `CA-DB EF!`. The behavior of the website interface itself was not checked.

## 8. Comparative analysis

| Property | Caesar shifts | Affine maps mod 26 | Four-position permutations |
| --- | --- | --- | --- |
| Mathematical group | \(C_{26}\) | \(\mathbb{Z}_{26}\rtimes\mathbb{Z}_{26}^{\times}\) | \(S_4\) |
| Number of elements | 26 | 312 | 24 |
| Identity | \(E_0\) | \(E_{1,0}\) | identity permutation (list \([1,2,3,4]\)) |
| Inverse | \(E_{-k}\) | \(E_{a^{-1},\,-a^{-1}b}\) | inverse permutation |
| Abelian? | Yes | No | No |
| Possible element orders | \(1,2,13,26\) | not fully classified here | \(1,2,3,4\) |
| Main structural feature | cyclic group | semidirect product; Caesar group is a normal subgroup | symmetric group; contains \(A_4\), \(V_4\), order-8 dihedral subgroup |
| Role in the project | alphabet shifts | substitution by multiplier and offset | rearrangement of positions within blocks |

The three groups have different orders (26, 312, 24), so no two are isomorphic. The Caesar group is a subgroup of the affine group; \(S_4\) is not related to either by inclusion in this construction. All three satisfy the same group axioms but differ in structure.

## 9. Limitations and cryptographic scope

These systems illustrate finite algebraic structure and reversible transformations. A bijection has an inverse, but this does not imply confidentiality or resistance to attack.

- Caesar and affine ciphers are monoalphabetic substitutions: under a fixed key, equal plaintext letters give equal ciphertext letters, so the multiset of letter frequencies is preserved up to relabeling (the project's Python verifier checks this for one sample sentence, S2). Non-letters are handled according to the implementation.
- A fixed-block position permutation preserves the multiset of characters within each complete block; it changes positions, not characters.
- The key spaces are tiny: 26 Caesar keys (including the identity), 312 affine keys, and 24 permutation keys. Exhaustive search over any of them is trivial. Classical-cipher cryptanalysis is discussed in Stinson (2005).

The project should be described as an educational exploration of groups, cyclic generators, subgroups, permutation composition, and reversibility, not as a new or secure cryptographic protocol.

## 10. Implementation verification checklist

Status as of 18 October 2026. "Editor sandbox" means the runs described in Section 3.3, not a team machine.

| # | Item | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Confirm the correct repository and branch | **Pending team confirmation.** Code and documentation point to `final-algebra-lab` (head `5ac11db`). | Source inspection, Section 3.2 |
| 2 | Inspect `permutationCompose` argument order and index formula in `src/math/engine.ts` | Done: `first.map(i => second[i])`; `second` applied first. | Source inspection (S1) |
| 3 | Compare with `scripts/verify_math.py` | Done: same formula and argument order. | Source inspection (S1, S2) |
| 4 | Run `npm run build` and `npm run lint` | Passed in editor sandbox. **Pending on a team machine.** | Executed, Section 3.3 |
| 5 | Run the verification command | `python3 scripts/verify_math.py` passed in editor sandbox. **Pending:** run through `npm run verify` and on a team machine. | Executed, Section 3.3 |
| 6 | Test `[3,1,4,2]` on `ABCD` gives `CADB` | Passed in the editor's engine script, and asserted in the Python verifier. | Executed, Sections 3.3 and 7.7 |
| 7 | Test a composition and its inverse through the implementation | Passed for the pair in Section 7.6, for all \(24\times 24\) pairs, and for all-key round trips (engine script). The Python verifier asserts the same laws. The Section 7.6 pair is **not yet a repository test**. | Executed, Section 7.7 |
| 8 | Incomplete trailing blocks | Source inspection and engine script agree (leftover letters unchanged). **Pending:** browser check of the website interface. | Sections 3.2 and 7.7 |
| 9 | Website and repository refer to the same project version | **Pending.** Not checked whether the deployed site was built from `5ac11db`. | None |
| 10 | Other `engine.ts` functions (affine composition, order calculation, trace and UI code) | **Pending** inspection and tests. | None |
| 11 | Repository has no automated test calling `engine.ts` | Noted. **Pending decision** on adding regression tests (including the Section 7.6 pair). | Source inspection (S3) |
| 12 | Textbook page or section locators for in-text citations | **Pending** check against the edition used. | None |

No item marked pending may be reported as passed until evidence is recorded.

## 11. Conclusion

The three systems provide complementary finite-group examples. Caesar transformations form the cyclic group \(C_{26}\), with 26 elements, orders \(1,2,13,26\), twelve generators, and exactly four subgroups. Invertible affine transformations form a non-abelian group of 312 maps with center \(\{E_{1,0},E_{1,13}\}\), described as the semidirect product of the translations by the units modulo 26; the Caesar group is its normal translation subgroup, and the inverse of \(E_{5,8}\) is \(E_{21,14}\), \(y\mapsto 21y+14\). Four-position permutations form the symmetric group \(S_4\), with 24 elements and five cycle types.

For the project's output-position representation, the composite of "apply \(q\) first, then \(p\)" is \((p\star q)_i=q_{p_i}\). For \(p=[3,1,4,2]\) and \(q=[2,1,4,3]\), the two orders give `DBCA` (list \([4,2,3,1]\)) and `ACBD` (list \([1,3,2,4]\)), which differ. The inspected TypeScript and Python code use this same formula, and the editor's executions at commit `5ac11db` agree with the hand calculations. Mathematical conclusions, source inspection, executed checks, and pending work remain separated as set out in Sections 3 and 10.

## 12. References

### 12.1 Textbook references

Dummit, D. S., & Foote, R. M. (2004). *Abstract Algebra* (3rd ed.). John Wiley & Sons.

Fraleigh, J. B. (2003). *A First Course in Abstract Algebra* (7th ed.). Addison-Wesley.

Stinson, D. R. (2005). *Cryptography: Theory and Practice* (3rd ed.). Chapman & Hall/CRC.

*Verification note.* Author, title, edition, publisher, and year were checked against publisher and library catalogue records. Some catalogues list a different imprint year (for example 2002 for Fraleigh and 2006 for Stinson). Confirm the year against the physical or electronic copy used. No page numbers, section numbers, or quotations are cited because the exact editions' pages have not been checked; in-text citations are therefore at book level.

### 12.2 Project-specific source references

These support statements about the project's implementation only. They are not evidence for mathematical theorems.

- **S1.** `src/math/engine.ts`, repository `PVSSP656/final-algebra-lab`, commit `5ac11db67f02843511ab93debb1aad7720c1748d` (18 October 2026). https://github.com/PVSSP656/final-algebra-lab
- **S2.** `scripts/verify_math.py`, same repository and commit.
- **S3.** `package.json` and `README.md`, same repository and commit.
- **S4.** Project README and in-app labels (for the name \(\mathrm{AGL}(1,26)\) and the input conventions), same repository and commit.
- **S5.** Project website, https://abstract-algebra-lab.web.app/. A demonstration only; interface behavior is not evidence of mathematical correctness and was not inspected for this dossier.
- **S6.** `PVSSP656/abstract-algebra-lab`, commit `8212c79` (14 October 2026). Earlier or alternative repository named in project materials; not used as the basis for the claims above.

## 13. Handover summary

**Completed in this document**

- Section 7.6 rewritten: contradictory intermediate results removed; both composition orders recomputed index by index; both composite lists verified against direct application (`DBCA` with \([4,2,3,1]\); `ACBD` with \([1,3,2,4]\)); convention and its relation to standard notation stated precisely.
- Repository identified by code and documentation as `final-algebra-lab`; `engine.ts`, `verify_math.py`, and `package.json` inspected; formulas agree.
- All equations reformatted in standard `\( \)` and `\[ \]` notation; conversion artifacts removed.
- Mathematical content re-audited. Additions: order of \(E_{5,8}\) is 4; the affine center; explicit order-8 subgroup; key-space sizes. Removed: references to earlier drafts.
- Placeholder citations replaced by author–date citations and a reference list that separates textbooks from project sources.

**Still to be done by Varun or another team member**

- Confirm the canonical repository name and that the deployed website was built from it (items 1, 9).
- Run `npm run build`, `npm run lint`, and `npm run verify` on a team machine and record the output (items 4, 5).
- Check the website's behavior for incomplete blocks and the Section 7.6 example in a browser (item 8).
- Inspect the remaining `engine.ts` functions and decide whether to add regression tests, including the Section 7.6 pair (items 7, 10, 11).
- Check textbook edition pages and add locators if the paper needs them (item 12).
