import { useState, useMemo } from "react";
import { MathView } from "./MathView";
import {
  ALPHABET,
  MODULUS,
  AFFINE_UNITS,
  S4,
  caesarValue,
  affineValue,
  affineCompose,
  affineInverse,
  permutationApply,
  permutationCompose,
  permutationInverse,
  permutationLabel,
  modularInverse,
  type AffineKey,
  type Permutation,
} from "../math/engine";

export function CommonAlgebraicStructure() {
  // Interactive Demonstration State
  const [demoSystem, setDemoSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  
  // Caesar demo controls
  const [caesarK1, setCaesarK1] = useState(3);
  const [caesarK2, setCaesarK2] = useState(5);
  const [caesarInput, setCaesarInput] = useState("H");

  // Affine demo controls
  const [affineA1, setAffineA1] = useState(3);
  const [affineB1, setAffineB1] = useState(4);
  const [affineA2, setAffineA2] = useState(5);
  const [affineB2, setAffineB2] = useState(7);
  const [affineInput, setAffineInput] = useState("M");

  // Permutation demo controls
  const [permIdx1, setPermIdx1] = useState(2); // e.g. [1, 3, 2, 4]
  const [permIdx2, setPermIdx2] = useState(6); // e.g. [2, 1, 3, 4]
  const [permInput, setPermInput] = useState("MATH");

  // Derived calculations for Caesar demo
  const caesarVal = useMemo(() => {
    const char = caesarInput.toUpperCase().slice(0, 1) || "A";
    const x = char.charCodeAt(0) - 65;
    return x >= 0 && x < 26 ? x : 0;
  }, [caesarInput]);

  const caesarChar = ALPHABET[caesarVal];
  const caesarStep1Val = caesarValue(caesarVal, caesarK1);
  const caesarStep1Char = ALPHABET[caesarStep1Val];
  const caesarStep2Val = caesarValue(caesarStep1Val, caesarK2);
  const caesarStep2Char = ALPHABET[caesarStep2Val];
  const caesarCompK = (caesarK1 + caesarK2) % MODULUS;
  const caesarDirectVal = caesarValue(caesarVal, caesarCompK);
  const caesarDirectChar = ALPHABET[caesarDirectVal];
  const caesarInvK = (MODULUS - caesarCompK) % MODULUS;
  const caesarRecoveredVal = caesarValue(caesarStep2Val, caesarInvK);
  const caesarRecoveredChar = ALPHABET[caesarRecoveredVal];

  // Derived calculations for Affine demo
  const affineVal = useMemo(() => {
    const char = affineInput.toUpperCase().slice(0, 1) || "A";
    const x = char.charCodeAt(0) - 65;
    return x >= 0 && x < 26 ? x : 0;
  }, [affineInput]);

  const affineChar = ALPHABET[affineVal];
  const key1: AffineKey = { a: affineA1, b: affineB1 };
  const key2: AffineKey = { a: affineA2, b: affineB2 };
  const affineStep1Val = affineValue(affineVal, key1);
  const affineStep1Char = ALPHABET[affineStep1Val];
  const affineStep2Val = affineValue(affineStep1Val, key2);
  const affineStep2Char = ALPHABET[affineStep2Val];

  // T2 o T1: T2(T1(x)) = a2*(a1*x + b1) + b2 = (a2*a1)*x + (a2*b1 + b2)
  const affineCompKey = useMemo(() => affineCompose(key2, key1), [key2, key1]);
  const affineDirectVal = affineValue(affineVal, affineCompKey);
  const affineDirectChar = ALPHABET[affineDirectVal];
  const affineInvKey = useMemo(() => affineInverse(affineCompKey), [affineCompKey]);
  const affineRecoveredVal = affineValue(affineStep2Val, affineInvKey);
  const affineRecoveredChar = ALPHABET[affineRecoveredVal];

  // Derived calculations for Permutation demo
  const permBlock = useMemo(() => {
    const raw = permInput.toUpperCase().replace(/[^A-Z]/g, "");
    return (raw + "WXYZ").slice(0, 4);
  }, [permInput]);

  const p1: Permutation = S4[permIdx1] ?? S4[0];
  const p2: Permutation = S4[permIdx2] ?? S4[0];
  const permStep1Block = permutationApply(p1, permBlock);
  const permStep2Block = permutationApply(p2, permStep1Block);
  // In our engine convention: permutationApply(p, block) puts block[p[i]] at output pos i.
  // When applying p1 then p2: output of p1 at pos j is block[p1[j]].
  // Then p2 takes index p2[i] of that intermediate block, which is block[p1[p2[i]]].
  // Hence p_comp[i] = p1[p2[i]], which matches permutationCompose(p2, p1)!
  const permComp = useMemo(() => permutationCompose(p2, p1), [p2, p1]);
  const permDirectBlock = permutationApply(permComp, permBlock);
  const permInv = useMemo(() => permutationInverse(permComp), [permComp]);
  const permRecoveredBlock = permutationApply(permInv, permStep2Block);

  return (
    <div className="page-wrap structure-page">
      {/* Page Header */}
      <div className="page-intro">
        <p className="eyebrow">04 / THE COMMON ALGEBRAIC STRUCTURE</p>
        <h1>
          Reversibility through
          <br />
          <em>algebraic groups.</em>
        </h1>
        <p>
          What do a single-character shift, an invertible affine mapping, and a 4-position permutation share?
          Behind disparate domains lies the exact same mathematical foundation: a group of bijective transformations.
        </p>
      </div>

      {/* Section A: The Common Idea */}
      <section className="structure-card">
        <div className="card-kicker">SECTION A ◈ CORE THESIS</div>
        <h2 className="section-title">The Unifying Algebraic Perspective</h2>
        <p className="lead-paragraph">
          In classical cryptography, encryption algorithms often appear as unrelated collections of mechanical recipes:
          shifting wheels, numerical substitutions, or positional transpositions. Abstract algebra provides a single,
          rigorous viewpoint that dissolves these superficial differences:
        </p>
        
        <div className="thesis-banner">
          <p className="thesis-quote">
            Each cipher is a set of <strong>bijective transformations</strong> acting on a mathematical domain.
            Composition combines successive keys, the identity leaves messages unchanged, and the inverse operation
            guarantees error-free decryption. Together, these form a <strong>mathematical group</strong>.
          </p>
        </div>

        <div className="domain-split-grid">
          <div className="domain-card">
            <div className="domain-chip">ALPHABET RESIDUE DOMAIN</div>
            <h3>Caesar and Affine Systems</h3>
            <p>
              Both ciphers act on isolated alphabet symbols represented by elements of the cyclic ring:
            </p>
            <div className="formula-box">
              <MathView math="X = \mathbb{Z}_{26} = \{0, 1, 2, \dots, 25\}" display />
            </div>
            <p className="domain-note">
              Transformations preserve character boundaries and rely on the modular arithmetic of residues modulo 26.
            </p>
          </div>

          <div className="domain-card">
            <div className="domain-chip">POSITIONAL COORDINATE DOMAIN</div>
            <h3>Position Permutation System</h3>
            <p>
              The permutation cipher operates on the coordinates of 4-character blocks, independent of letter identities:
            </p>
            <div className="formula-box">
              <MathView math="X = \{1, 2, 3, 4\} \quad \text{acting on tuples } (c_1, c_2, c_3, c_4)" display />
            </div>
            <p className="domain-note">
              Transformations alter message layout rather than letter values, operating entirely through coordinate reordering.
            </p>
          </div>
        </div>

        <p className="section-footer-note">
          Despite their distinct operational domains, all three systems obey the universal axioms of group theory.
          This commonality enables us to compare their structural complexity, verify their reversibility, and study their
          mathematical vulnerabilities within a unified framework.
        </p>
      </section>

      {/* Section B: Mathematical Foundation */}
      <section className="structure-card">
        <div className="card-kicker">SECTION B ◈ THEORETICAL FRAMEWORK</div>
        <h2 className="section-title">The Mathematical Foundation: Sets, Bijections, and Groups</h2>
        
        <div className="concept-progression">
          <div className="progression-item">
            <span className="step-tag">01</span>
            <div className="progression-body">
              <h3>Transformations and Bijectivity</h3>
              <p>
                Let <MathView math="X" /> be a non-empty set representing the message space (individual symbols or block coordinates).
                A <em>transformation</em> is a mapping:
              </p>
              <div className="formula-box">
                <MathView math="T : X \longrightarrow X" display />
              </div>
              <p>
                In cryptography, a transformation is unusable for reliable encryption unless it is a <strong>bijection</strong>:
              </p>
              <ul className="math-bullets">
                <li>
                  <strong>Injective (one-to-one):</strong> <MathView math="T(x_1) = T(x_2) \implies x_1 = x_2" />.
                  No two plaintexts produce the same ciphertext, preventing ambiguous decryption collisions.
                </li>
                <li>
                  <strong>Surjective (onto):</strong> For every ciphertext <MathView math="y \in X" />, there exists a plaintext <MathView math="x \in X" /> such that <MathView math="T(x) = y" />.
                </li>
              </ul>
              <p>
                By the fundamental theorem of bijections, <MathView math="T" /> is invertible if and only if it is bijective.
                There exists a unique inverse mapping <MathView math="T^{-1} : X \to X" /> satisfying:
              </p>
              <div className="formula-box">
                <MathView math="T^{-1} \circ T = T \circ T^{-1} = \operatorname{id}_X" display />
              </div>
              <p>
                where <MathView math="\operatorname{id}_X(x) = x" /> is the identity transformation that leaves every element invariant.
              </p>
            </div>
          </div>

          <div className="progression-item">
            <span className="step-tag">02</span>
            <div className="progression-body">
              <h3>The Definition and Axioms of a Group</h3>
              <p>
                A group <MathView math="(G, \circ)" /> is a set of transformations <MathView math="G" /> equipped with an operation
                (here, function composition <MathView math="\circ" />) satisfying four foundational axioms:
              </p>
              
              <div className="axioms-grid">
                <div className="axiom-box">
                  <span className="axiom-id">AXIOM 1 ◈ CLOSURE</span>
                  <MathView math="\forall T_1, T_2 \in G, \quad T_2 \circ T_1 \in G" display />
                  <p>Composing any two valid encryptions yields another valid encryption in the same system.</p>
                </div>
                <div className="axiom-box">
                  <span className="axiom-id">AXIOM 2 ◈ ASSOCIATIVITY</span>
                  <MathView math="(T_3 \circ T_2) \circ T_1 = T_3 \circ (T_2 \circ T_1)" display />
                  <p>Grouping of successive transformations does not affect the final result. Inherited naturally from functions.</p>
                </div>
                <div className="axiom-box">
                  <span className="axiom-id">AXIOM 3 ◈ IDENTITY</span>
                  <MathView math="\exists \operatorname{id} \in G : \quad T \circ \operatorname{id} = \operatorname{id} \circ T = T" display />
                  <p>A null operation exists (shift 0, unit multiplier, identity permutation) that leaves input unchanged.</p>
                </div>
                <div className="axiom-box">
                  <span className="axiom-id">AXIOM 4 ◈ INVERSES</span>
                  <MathView math="\forall T \in G, \; \exists T^{-1} \in G : \quad T \circ T^{-1} = T^{-1} \circ T = \operatorname{id}" display />
                  <p>Every encryption key possesses an exact algebraic decryption key within the same transformation set.</p>
                </div>
              </div>

              <div className="warning-callout">
                <strong>A Crucial Distinction:</strong> An arbitrary collection of bijections on <MathView math="X" /> does <em>not</em> automatically
                form a group. It forms a group if and only if it is <strong>closed</strong> under composition and contains the identity and inverses.
                Associativity is automatically inherited because composition of functions is universally associative:
                <div className="formula-box" style={{ marginTop: "8px" }}>
                  <MathView math="((f \circ g) \circ h)(x) = f(g(h(x))) = (f \circ (g \circ h))(x)" display />
                </div>
              </div>
            </div>
          </div>

          <div className="progression-item">
            <span className="step-tag">03</span>
            <div className="progression-body">
              <h3>Why Group Theory is Essential for Reversible Transformations</h3>
              <p>
                Group theory frees cryptographers and mathematicians from tedious point-by-point verification.
                Instead of testing all 26 letters or all 456,976 four-letter combinations, group-theoretic theorems prove:
              </p>
              <ul className="math-bullets">
                <li>
                  <strong>Deterministic Invertibility:</strong> By Lagrange&apos;s Theorem, every element in a finite group has a finite order <MathView math="m = \operatorname{ord}(T)" />, meaning <MathView math="T^m = \operatorname{id}" /> and <MathView math="T^{-1} = T^{m-1}" />.
                </li>
                <li>
                  <strong>Vulnerability to Key Composition:</strong> By closure, applying cipher <MathView math="T_1" /> followed by <MathView math="T_2" /> never increases the keyspace; it simply executes a single equivalent transformation <MathView math="T_3 \in G" />.
                </li>
                <li>
                  <strong>Commutativity Profiling:</strong> Group commutativity determines whether encryption order can be swapped without altering ciphertext (<MathView math="T_2 \circ T_1 = T_1 \circ T_2" />).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: System 1 - Caesar */}
      <section className="structure-card">
        <div className="card-kicker">SECTION C ◈ SYSTEM 1</div>
        <h2 className="section-title">The Caesar Shift Group <MathView math="C_{26}" /></h2>
        
        <div className="system-overview-grid">
          <div>
            <p>
              The classical Caesar cipher represents the Latin alphabet by integers modulo 26:
            </p>
            <div className="formula-box">
              <MathView math="\mathbb{Z}_{26} = \{0, 1, 2, \dots, 25\}, \quad \mathrm{A}=0, \mathrm{B}=1, \dots, \mathrm{Z}=25" display />
            </div>
            <p>
              Each shift key <MathView math="k \in \mathbb{Z}_{26}" /> induces a translation transformation:
            </p>
            <div className="formula-box">
              <MathView math="E_k(x) = (x + k) \bmod 26" display />
            </div>
            <p>
              The collection of all 26 distinct shifts is the transformation set:
            </p>
            <div className="formula-box">
              <MathView math="C_{26} = \{ E_k : k \in \mathbb{Z}_{26} \}, \quad |C_{26}| = 26" display />
            </div>
          </div>

          <div className="system-properties-box">
            <h4>Algebraic Properties</h4>
            <div className="prop-row">
              <span>Composition:</span>
              <MathView math="E_a \circ E_b = E_{(a+b) \bmod 26}" />
            </div>
            <div className="prop-row">
              <span>Identity Element:</span>
              <MathView math="E_0(x) = (x + 0) \bmod 26 = x" />
            </div>
            <div className="prop-row">
              <span>Inverse Element:</span>
              <MathView math="E_k^{-1} = E_{(-k) \bmod 26} = E_{(26 - k) \bmod 26}" />
            </div>
            <div className="prop-row">
              <span>Group Isomorphism:</span>
              <MathView math="(C_{26}, \circ) \cong (\mathbb{Z}_{26}, +)" />
            </div>
            <div className="prop-row">
              <span>Abelian:</span>
              <span className="badge-yes">Yes (Commutative)</span>
            </div>
          </div>
        </div>

        <div className="worked-example-box">
          <h4>Worked Mathematical Derivation: Composition & Decryption</h4>
          <p>
            <strong>Composition:</strong> Consider key <MathView math="k_1 = 8" /> followed by key <MathView math="k_2 = 5" /> on letter <strong>C</strong> (<MathView math="x = 2" />):
          </p>
          <div className="formula-box">
            <MathView math="(E_5 \circ E_8)(2) = E_5(E_8(2)) = E_5((2 + 8) \bmod 26) = E_5(10) = (10 + 5) \bmod 26 = 15 \quad (\mathrm{P})" display />
          </div>
          <p>
            Directly through group composition:
          </p>
          <div className="formula-box">
            <MathView math="E_5 \circ E_8 = E_{(5+8) \bmod 26} = E_{13} \implies E_{13}(2) = (2 + 13) \bmod 26 = 15 \quad (\mathrm{P})" display />
          </div>
          <p>
            <strong>Decryption:</strong> To decrypt ciphertext <strong>P</strong> (<MathView math="y = 15" />) under key <MathView math="k = 13" />, compute the group inverse <MathView math="E_{13}^{-1} = E_{(-13) \bmod 26} = E_{13}" />:
          </p>
          <div className="formula-box">
            <MathView math="E_{13}^{-1}(15) = (15 - 13) \bmod 26 = 2 \quad (\mathrm{C})" display />
          </div>
        </div>
      </section>

      {/* Section D: System 2 - Affine */}
      <section className="structure-card">
        <div className="card-kicker">SECTION D ◈ SYSTEM 2</div>
        <h2 className="section-title">The Affine Transformation Group <MathView math="\mathrm{AGL}(1, 26)" /></h2>
        
        <div className="system-overview-grid">
          <div>
            <p>
              The affine cipher combines modular multiplication and modular addition into a linear transformation:
            </p>
            <div className="formula-box">
              <MathView math="E_{a,b}(x) = (ax + b) \bmod 26, \quad a, b \in \mathbb{Z}_{26}" display />
            </div>
            <p>
              To ensure bijectivity, the multiplier <MathView math="a" /> must have a modular multiplicative inverse.
              By Bézout&apos;s Identity, this requires <MathView math="\gcd(a, 26) = 1" />.
              The invertible multipliers are the units <MathView math="\mathbb{Z}_{26}^\times" />:
            </p>
            <div className="formula-box">
              <MathView math="\mathbb{Z}_{26}^\times = \{1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25\}, \quad |\mathbb{Z}_{26}^\times| = \varphi(26) = 12" display />
            </div>
            <p>
              With 12 valid values for <MathView math="a" /> and 26 possible translations for <MathView math="b" />, the total group order is:
            </p>
            <div className="formula-box">
              <MathView math="|\mathrm{AGL}(1, 26)| = 12 \times 26 = 312 \text{ transformations}" display />
            </div>
          </div>

          <div className="system-properties-box">
            <h4>Algebraic Properties</h4>
            <div className="prop-row">
              <span>Composition Rule:</span>
              <MathView math="E_{a,b} \circ E_{c,d} = E_{(ac) \bmod 26, \; (ad+b) \bmod 26}" />
            </div>
            <div className="prop-row">
              <span>Identity Element:</span>
              <MathView math="E_{1,0}(x) = (1x + 0) \bmod 26 = x" />
            </div>
            <div className="prop-row">
              <span>Inverse Formula:</span>
              <MathView math="E_{a,b}^{-1}(y) = a^{-1}(y - b) \bmod 26" />
            </div>
            <div className="prop-row">
              <span>Subgroup Relation:</span>
              <MathView math="C_{26} \le \mathrm{AGL}(1, 26) \quad (\text{subgroup with } a=1)" />
            </div>
            <div className="prop-row">
              <span>Abelian:</span>
              <span className="badge-no">No (Non-commutative in general)</span>
            </div>
          </div>
        </div>

        <div className="worked-example-box">
          <h4>Worked Mathematical Derivation: Affine Inversion & Non-Commutativity</h4>
          <p>
            <strong>Decryption Formula Derivation:</strong> Let <MathView math="y = (ax + b) \bmod 26" />.
            Subtract <MathView math="b" /> from both sides: <MathView math="y - b \equiv ax \pmod{26}" />.
            Multiply by <MathView math="a^{-1}" />:
          </p>
          <div className="formula-box">
            <MathView math="x = a^{-1}(y - b) \bmod 26 = (a^{-1}y - a^{-1}b) \bmod 26" display />
          </div>
          <p>
            <strong>Demonstration of Non-Commutativity:</strong>
            Let <MathView math="T_1 = E_{3, 2}" /> and <MathView math="T_2 = E_{7, 5}" />.
            Note that <MathView math="3 \in \mathbb{Z}_{26}^\times" /> and <MathView math="7 \in \mathbb{Z}_{26}^\times" />.
          </p>
          <div className="formula-box">
            <MathView math="T_2 \circ T_1 = E_{7,5} \circ E_{3,2} = E_{(7 \cdot 3) \bmod 26, \; (7 \cdot 2 + 5) \bmod 26} = E_{21, 19}" display />
          </div>
          <div className="formula-box">
            <MathView math="T_1 \circ T_2 = E_{3,2} \circ E_{7,5} = E_{(3 \cdot 7) \bmod 26, \; (3 \cdot 5 + 2) \bmod 26} = E_{21, 17}" display />
          </div>
          <p>
            Since <MathView math="E_{21, 19} \ne E_{21, 17}" />, composition order cannot be interchanged:
            <MathView math="T_2 \circ T_1 \ne T_1 \circ T_2" />. The Affine group is strictly non-abelian.
          </p>
        </div>
      </section>

      {/* Section E: System 3 - S4 */}
      <section className="structure-card">
        <div className="card-kicker">SECTION E ◈ SYSTEM 3</div>
        <h2 className="section-title">The Symmetric Group on Four Coordinates <MathView math="S_4" /></h2>
        
        <div className="system-overview-grid">
          <div>
            <p>
              The fixed-block permutation cipher acts on the indices of 4-character blocks <MathView math="(c_1, c_2, c_3, c_4)" />.
              Its transformations are permutations of the set <MathView math="\{1, 2, 3, 4\}" />:
            </p>
            <div className="formula-box">
              <MathView math="S_4 = \{ \pi : \{1, 2, 3, 4\} \to \{1, 2, 3, 4\} \mid \pi \text{ is bijective} \}" display />
            </div>
            <p>
              The number of possible bijections of four positions is:
            </p>
            <div className="formula-box">
              <MathView math="|S_4| = 4! = 4 \times 3 \times 2 \times 1 = 24 \text{ permutations}" display />
            </div>
            <p>
              <strong>Permutation Convention:</strong> In this laboratory, a 1-based permutation key <MathView math="[p_1, p_2, p_3, p_4]" />
              specifies that output position <MathView math="i" /> receives the character from input position <MathView math="p_i" />:
            </p>
            <div className="formula-box">
              <MathView math="[3, 1, 4, 2] : \mathrm{ABCD} \longmapsto \mathrm{CADB}" display />
            </div>
          </div>

          <div className="system-properties-box">
            <h4>Algebraic Properties</h4>
            <div className="prop-row">
              <span>Domain:</span>
              <MathView math="\{1, 2, 3, 4\} \quad (\text{Coordinate indices})" />
            </div>
            <div className="prop-row">
              <span>Identity Element:</span>
              <MathView math="\operatorname{id} = [1, 2, 3, 4]" />
            </div>
            <div className="prop-row">
              <span>Inverse Permutation:</span>
              <MathView math="\pi^{-1} \text{ satisfies } \pi(\pi^{-1}(i)) = i" />
            </div>
            <div className="prop-row">
              <span>Example Inverse:</span>
              <MathView math="[3, 1, 4, 2]^{-1} = [2, 4, 1, 3]" />
            </div>
            <div className="prop-row">
              <span>Abelian:</span>
              <span className="badge-no">No (Non-commutative)</span>
            </div>
          </div>
        </div>

        <div className="worked-example-box">
          <h4>Worked Mathematical Derivation: Permutation Inversion & Non-Commutativity</h4>
          <p>
            <strong>Inversion Verification:</strong> Let key <MathView math="\pi = [3, 1, 4, 2]" /> act on <MathView math="\mathrm{ABCD}" />:
          </p>
          <div className="formula-box">
            <MathView math="\pi(\mathrm{ABCD}) = \mathrm{CADB}" display />
          </div>
          <p>
            Applying the inverse key <MathView math="\pi^{-1} = [2, 4, 1, 3]" /> to <MathView math="\mathrm{CADB}" />:
            Position 1 receives index 2 (&apos;A&apos;), position 2 receives index 4 (&apos;B&apos;), position 3 receives index 1 (&apos;C&apos;), and position 4 receives index 3 (&apos;D&apos;):
          </p>
          <div className="formula-box">
            <MathView math="\pi^{-1}(\mathrm{CADB}) = \mathrm{ABCD}" display />
          </div>
          <p>
            <strong>Non-Commutativity in <MathView math="S_4" />:</strong>
            Let <MathView math="\pi_1 = [2, 1, 3, 4]" /> (transposing positions 1 and 2) and <MathView math="\pi_2 = [1, 3, 2, 4]" /> (transposing positions 2 and 3).
          </p>
          <div className="formula-box">
            <MathView math="(\pi_2 \circ \pi_1)(\mathrm{ABCD}) = \pi_2(\pi_1(\mathrm{ABCD})) = \pi_2(\mathrm{BACD}) = \mathrm{BCAD}" display />
          </div>
          <div className="formula-box">
            <MathView math="(\pi_1 \circ \pi_2)(\mathrm{ABCD}) = \pi_1(\pi_2(\mathrm{ABCD})) = \pi_1(\mathrm{ACBD}) = \mathrm{CABD}" display />
          </div>
          <p>
            Because <MathView math="\mathrm{BCAD} \ne \mathrm{CABD}" />, we have <MathView math="\pi_2 \circ \pi_1 \ne \pi_1 \circ \pi_2" />.
            <MathView math="S_4" /> is non-abelian for all <MathView math="n \ge 3" />.
          </p>
        </div>
      </section>

      {/* Section F: What is Common, and What is Different? */}
      <section className="structure-card">
        <div className="card-kicker">SECTION F ◈ COMPARATIVE SYNTHESIS</div>
        <h2 className="section-title">What is Common, and What is Different?</h2>
        <p className="lead-paragraph">
          The table below rigorously contrasts the three systems across ten algebraic dimensions:
        </p>

        <div className="comparison-table-wrapper">
          <table className="algebraic-comparison-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Caesar Cipher</th>
                <th>Affine Cipher</th>
                <th>Position Permutations</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="prop-name">Underlying Domain</td>
                <td><MathView math="\mathbb{Z}_{26}" /> (Alphabet residues)</td>
                <td><MathView math="\mathbb{Z}_{26}" /> (Alphabet residues)</td>
                <td><MathView math="\{1, 2, 3, 4\}" /> (4-position blocks)</td>
              </tr>
              <tr>
                <td className="prop-name">Transformation Rule</td>
                <td><MathView math="E_k(x) = (x + k) \bmod 26" /></td>
                <td><MathView math="E_{a,b}(x) = (ax + b) \bmod 26" /></td>
                <td><MathView math="y_i = x_{p_i} \quad (1 \le i \le 4)" /></td>
              </tr>
              <tr>
                <td className="prop-name">Transformation Count</td>
                <td><span className="mono-highlight">26</span></td>
                <td><span className="mono-highlight">312</span> (<MathView math="12 \times 26" />)</td>
                <td><span className="mono-highlight">24</span> (<MathView math="4!" />)</td>
              </tr>
              <tr>
                <td className="prop-name">Composition Operation</td>
                <td>Modular addition of shifts</td>
                <td>Affine function composition</td>
                <td>Permutation mapping composition</td>
              </tr>
              <tr>
                <td className="prop-name">Identity Element</td>
                <td>Shift by 0: <MathView math="E_0" /></td>
                <td><MathView math="a=1, b=0 : E_{1,0}" /></td>
                <td>Identity permutation: <MathView math="[1, 2, 3, 4]" /></td>
              </tr>
              <tr>
                <td className="prop-name">Inverse Transformation</td>
                <td>Opposite shift: <MathView math="(-k) \bmod 26" /></td>
                <td><MathView math="a^{-1}(y - b) \bmod 26" /></td>
                <td>Inverse permutation <MathView math="\pi^{-1}" /></td>
              </tr>
              <tr>
                <td className="prop-name">Group Structure</td>
                <td><MathView math="C_{26} \cong (\mathbb{Z}_{26}, +)" /> (Cyclic)</td>
                <td><MathView math="\mathrm{AGL}(1, 26)" /> (Affine general linear)</td>
                <td><MathView math="S_4" /> (Symmetric group)</td>
              </tr>
              <tr>
                <td className="prop-name">Commutativity</td>
                <td><span className="badge-yes">Yes (Abelian)</span></td>
                <td><span className="badge-no">No (Non-abelian)</span></td>
                <td><span className="badge-no">No (Non-abelian)</span></td>
              </tr>
              <tr>
                <td className="prop-name">Relationship to Others</td>
                <td>Normal subgroup of <MathView math="\mathrm{AGL}(1, 26)" /></td>
                <td>Contains <MathView math="C_{26}" /> as subgroup (<MathView math="a=1" />)</td>
                <td>Independent domain (block transposition)</td>
              </tr>
              <tr>
                <td className="prop-name">What Algebra Verifies</td>
                <td>Cyclic period 26, uniform shifts</td>
                <td>Unit multipliers, exact invertibility</td>
                <td>Cycle decompositions, order divides 24</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="shared-structure-panel">
          <h3>The Seven Universally Shared Group Properties</h3>
          <p>
            The profound insight of modern algebra is that despite their surface differences, all three systems
            satisfy the exact same axiomatic framework:
          </p>
          <div className="shared-properties-grid">
            <div className="shared-item">
              <span className="num">1</span>
              <div>
                <strong>Defined Collection of Maps:</strong> Each system specifies an unambiguous set of transformations acting on a well-defined domain.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">2</span>
              <div>
                <strong>Reversible Bijections:</strong> Every allowable transformation is bijective, guaranteeing zero loss of information during encryption.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">3</span>
              <div>
                <strong>Closure under Composition:</strong> Successive applications of transformations always collapse into another transformation within the set.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">4</span>
              <div>
                <strong>Neutral Identity Element:</strong> An identity operation exists in each system that preserves messages exactly without modification.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">5</span>
              <div>
                <strong>Universal Inverses:</strong> Every valid encryption key possesses an exact algebraic counterpart that decrypts the message.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">6</span>
              <div>
                <strong>Associativity of Operations:</strong> Grouping of successive key transformations does not alter the output: <MathView math="(T_3 \circ T_2) \circ T_1 = T_3 \circ (T_2 \circ T_1)" />.
              </div>
            </div>
            <div className="shared-item">
              <span className="num">7</span>
              <div>
                <strong>Systematic Group Reasoning:</strong> Group theorems (Lagrange, isomorphism, orders) allow global reasoning without brute-force enumeration.
              </div>
            </div>
          </div>

          <div className="non-isomorphism-callout">
            <strong>Shared Axioms vs. Identical Structure:</strong> Having a group structure does <em>not</em> mean the three groups are isomorphic!
            Since <MathView math="|C_{26}| = 26" />, <MathView math="|\mathrm{AGL}(1, 26)| = 312" />, and <MathView math="|S_4| = 24" />,
            their finite orders alone preclude any group isomorphism between them. Furthermore, <MathView math="C_{26}" /> is abelian and cyclic,
            whereas <MathView math="\mathrm{AGL}(1, 26)" /> and <MathView math="S_4" /> are non-abelian and non-cyclic.
          </div>
        </div>
      </section>

      {/* Section G: Interactive Visual Demonstration */}
      <section className="structure-card">
        <div className="card-kicker">SECTION G ◈ INTERACTIVE DEMONSTRATION</div>
        <h2 className="section-title">Visualizing Composition & Inverses in Real Time</h2>
        <p className="lead-paragraph">
          Select any of the three transformation systems to dynamically observe how two successive keys <MathView math="T_1" /> and <MathView math="T_2" />
          compose into a single transformation <MathView math="T_{\mathrm{comp}} = T_2 \circ T_1" />, and how the group inverse <MathView math="T_{\mathrm{comp}}^{-1}" />
          recovers the initial plaintext.
        </p>

        {/* System Picker */}
        <div className="demo-system-picker">
          <button
            className={demoSystem === "caesar" ? "active" : ""}
            onClick={() => setDemoSystem("caesar")}
          >
            Caesar Shift (<MathView math="C_{26}" />)
          </button>
          <button
            className={demoSystem === "affine" ? "active" : ""}
            onClick={() => setDemoSystem("affine")}
          >
            Affine Map (<MathView math="\mathrm{AGL}(1, 26)" />)
          </button>
          <button
            className={demoSystem === "permutation" ? "active" : ""}
            onClick={() => setDemoSystem("permutation")}
          >
            Position Permutation (<MathView math="S_4" />)
          </button>
        </div>

        {/* Interactive Controls per System */}
        <div className="demo-controls-panel">
          {demoSystem === "caesar" && (
            <div className="controls-row">
              <label>
                <span>Input Character:</span>
                <input
                  type="text"
                  maxLength={1}
                  value={caesarInput}
                  onChange={(e) => setCaesarInput(e.target.value.toUpperCase())}
                  className="demo-input-char"
                />
              </label>
              <label>
                <span>First Shift (<MathView math="k_1" />):</span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={caesarK1}
                  onChange={(e) => setCaesarK1(Number(e.target.value))}
                />
                <span className="val-badge">{caesarK1}</span>
              </label>
              <label>
                <span>Second Shift (<MathView math="k_2" />):</span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={caesarK2}
                  onChange={(e) => setCaesarK2(Number(e.target.value))}
                />
                <span className="val-badge">{caesarK2}</span>
              </label>
            </div>
          )}

          {demoSystem === "affine" && (
            <div className="controls-grid-affine">
              <label>
                <span>Input Character:</span>
                <input
                  type="text"
                  maxLength={1}
                  value={affineInput}
                  onChange={(e) => setAffineInput(e.target.value.toUpperCase())}
                  className="demo-input-char"
                />
              </label>
              <div className="affine-pair">
                <span className="pair-title">Key 1 (<MathView math="T_1" />):</span>
                <select value={affineA1} onChange={(e) => setAffineA1(Number(e.target.value))}>
                  {AFFINE_UNITS.map((u) => (
                    <option key={u} value={u}>a₁ = {u}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={affineB1}
                  onChange={(e) => setAffineB1(Number(e.target.value))}
                />
                <span className="val-badge">b₁ = {affineB1}</span>
              </div>
              <div className="affine-pair">
                <span className="pair-title">Key 2 (<MathView math="T_2" />):</span>
                <select value={affineA2} onChange={(e) => setAffineA2(Number(e.target.value))}>
                  {AFFINE_UNITS.map((u) => (
                    <option key={u} value={u}>a₂ = {u}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={affineB2}
                  onChange={(e) => setAffineB2(Number(e.target.value))}
                />
                <span className="val-badge">b₂ = {affineB2}</span>
              </div>
            </div>
          )}

          {demoSystem === "permutation" && (
            <div className="controls-row">
              <label>
                <span>Input 4-Letter Block:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={permInput}
                  onChange={(e) => setPermInput(e.target.value.toUpperCase())}
                  className="demo-input-block"
                />
              </label>
              <label>
                <span>Permutation 1 (<MathView math="\pi_1" />):</span>
                <select value={permIdx1} onChange={(e) => setPermIdx1(Number(e.target.value))}>
                  {S4.map((p, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1}: {permutationLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Permutation 2 (<MathView math="\pi_2" />):</span>
                <select value={permIdx2} onChange={(e) => setPermIdx2(Number(e.target.value))}>
                  {S4.map((p, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1}: {permutationLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Live Step-by-Step Visualization */}
        <div className="transformation-pipeline">
          {/* Step 1: Input */}
          <div className="pipeline-card stage-input">
            <span className="stage-num">01 / INPUT</span>
            <div className="stage-symbol">
              {demoSystem === "permutation" ? permBlock : (demoSystem === "caesar" ? caesarChar : affineChar)}
            </div>
            <div className="stage-detail">
              {demoSystem === "permutation" ? (
                <span>Position indices: (1, 2, 3, 4)</span>
              ) : (
                <MathView math={`x = ${demoSystem === "caesar" ? caesarVal : affineVal}`} />
              )}
            </div>
          </div>

          <div className="pipeline-connector">
            <span className="connector-label">T₁</span>
            <span className="connector-arrow">→</span>
          </div>

          {/* Step 2: Intermediate */}
          <div className="pipeline-card stage-mid">
            <span className="stage-num">02 / AFTER T₁</span>
            <div className="stage-symbol">
              {demoSystem === "permutation" ? permStep1Block : (demoSystem === "caesar" ? caesarStep1Char : affineStep1Char)}
            </div>
            <div className="stage-detail">
              {demoSystem === "caesar" && (
                <MathView math={`E_{${caesarK1}}(${caesarVal}) = ${caesarStep1Val}`} />
              )}
              {demoSystem === "affine" && (
                <MathView math={`E_{${affineA1},${affineB1}}(${affineVal}) = ${affineStep1Val}`} />
              )}
              {demoSystem === "permutation" && (
                <span>{permutationLabel(p1)} applied</span>
              )}
            </div>
          </div>

          <div className="pipeline-connector">
            <span className="connector-label">T₂</span>
            <span className="connector-arrow">→</span>
          </div>

          {/* Step 3: Final Output */}
          <div className="pipeline-card stage-output">
            <span className="stage-num">03 / AFTER T₂</span>
            <div className="stage-symbol">
              {demoSystem === "permutation" ? permStep2Block : (demoSystem === "caesar" ? caesarStep2Char : affineStep2Char)}
            </div>
            <div className="stage-detail">
              {demoSystem === "caesar" && (
                <MathView math={`E_{${caesarK2}}(${caesarStep1Val}) = ${caesarStep2Val}`} />
              )}
              {demoSystem === "affine" && (
                <MathView math={`E_{${affineA2},${affineB2}}(${affineStep1Val}) = ${affineStep2Val}`} />
              )}
              {demoSystem === "permutation" && (
                <span>{permutationLabel(p2)} applied</span>
              )}
            </div>
          </div>

          <div className="pipeline-connector">
            <span className="connector-label">T_comp⁻¹</span>
            <span className="connector-arrow">↺</span>
          </div>

          {/* Step 4: Recovered */}
          <div className="pipeline-card stage-recovered">
            <span className="stage-num">04 / RECOVERED</span>
            <div className="stage-symbol">
              {demoSystem === "permutation" ? permRecoveredBlock : (demoSystem === "caesar" ? caesarRecoveredChar : affineRecoveredChar)}
            </div>
            <div className="stage-detail">
              <span className="match-confirmed">✓ Exact Match</span>
            </div>
          </div>
        </div>

        {/* Algebraic Composition Card */}
        <div className="algebraic-composition-summary">
          <h4>Single Composed Transformation: <MathView math="T_{\mathrm{composed}} = T_2 \circ T_1" /></h4>
          <p className="composition-notation-note">
            <em>Notation Note:</em> In mathematical notation <MathView math="(T_2 \circ T_1)(x) = T_2(T_1(x))" />, transformations are written
            from right to left in composition order: <MathView math="T_1" /> is applied first to <MathView math="x" />, and <MathView math="T_2" /> is applied
            to the intermediate result.
          </p>

          <div className="composition-math-box">
            {demoSystem === "caesar" && (
              <div>
                <p>
                  Composing shifts <MathView math="k_1 = {caesarK1}" /> and <MathView math="k_2 = {caesarK2}" />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${caesarK2}} \\circ E_{${caesarK1}} = E_{(${caesarK1} + ${caesarK2}) \\bmod 26} = E_{${caesarCompK}}`}
                    display
                  />
                </div>
                <p>
                  Direct evaluation on <MathView math="x = {caesarVal}" />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${caesarCompK}}(${caesarVal}) = (${caesarVal} + ${caesarCompK}) \\bmod 26 = ${caesarDirectVal} \\quad (\\mathrm{${caesarDirectChar}})`}
                    display
                  />
                </div>
                <p>
                  Inverse transformation <MathView math="E_{${caesarCompK}}^{-1} = E_{${caesarInvK}}" /> recovers plaintext:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${caesarInvK}}(${caesarDirectVal}) = (${caesarDirectVal} + ${caesarInvK}) \\bmod 26 = ${caesarRecoveredVal} \\quad (\\mathrm{${caesarRecoveredChar}})`}
                    display
                  />
                </div>
              </div>
            )}

            {demoSystem === "affine" && (
              <div>
                <p>
                  Composing <MathView math={`T_1 = E_{${affineA1}, ${affineB1}}`} /> and <MathView math={`T_2 = E_{${affineA2}, ${affineB2}}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${affineA2}, ${affineB2}} \\circ E_{${affineA1}, ${affineB1}} = E_{(${affineA2} \\cdot ${affineA1}) \\bmod 26, \\; (${affineA2} \\cdot ${affineB1} + ${affineB2}) \\bmod 26} = E_{${affineCompKey.a}, ${affineCompKey.b}}`}
                    display
                  />
                </div>
                <p>
                  Direct single evaluation on <MathView math={`x = ${affineVal}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${affineCompKey.a}, ${affineCompKey.b}}(${affineVal}) = (${affineCompKey.a} \\cdot ${affineVal} + ${affineCompKey.b}) \\bmod 26 = ${affineDirectVal} \\quad (\\mathrm{${affineDirectChar}})`}
                    display
                  />
                </div>
                <p>
                  Inverse key <MathView math={`T_{\\mathrm{comp}}^{-1} = E_{${affineInvKey.a}, ${affineInvKey.b}}`} /> (since <MathView math={`${affineCompKey.a}^{-1} \\equiv ${affineInvKey.a} \\pmod{26}`} />):
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${affineInvKey.a}, ${affineInvKey.b}}(${affineDirectVal}) = ${affineInvKey.a}(${affineDirectVal} - ${affineCompKey.b}) \\bmod 26 = ${affineRecoveredVal} \\quad (\\mathrm{${affineRecoveredChar}})`}
                    display
                  />
                </div>
              </div>
            )}

            {demoSystem === "permutation" && (
              <div>
                <p>
                  Composing <MathView math={`\\pi_1 = ${permutationLabel(p1)}`} /> and <MathView math={`\\pi_2 = ${permutationLabel(p2)}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`\\pi_{\\mathrm{composed}} = \\pi_2 \\circ \\pi_1 = ${permutationLabel(permComp)}`}
                    display
                  />
                </div>
                <p>
                  Direct evaluation on block <strong>{permBlock}</strong>:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`\\pi_{\\mathrm{composed}}(\\mathrm{${permBlock}}) = \\mathrm{${permDirectBlock}}`}
                    display
                  />
                </div>
                <p>
                  Inverse permutation <MathView math={`\\pi_{\\mathrm{composed}}^{-1} = ${permutationLabel(permInv)}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`\\pi_{\\mathrm{composed}}^{-1}(\\mathrm{${permDirectBlock}}) = \\mathrm{${permRecoveredBlock}}`}
                    display
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section H: What this structure does and does not establish */}
      <section className="structure-card">
        <div className="card-kicker">SECTION H ◈ SCIENTIFIC RESPONSIBILITY</div>
        <h2 className="section-title">What This Structure Does and Does Not Establish</h2>
        
        <div className="limits-grid">
          <div className="limits-box establishes">
            <h4>What Abstract Algebra Rigorously Establishes</h4>
            <ul className="limits-list">
              <li>
                <strong>Error-Free Reversibility:</strong> Proves that every validly encrypted message can be recovered uniquely and deterministically without information loss.
              </li>
              <li>
                <strong>Composition Closure:</strong> Establishes that multiple encryptions within the system never escape the group&apos;s transformation space.
              </li>
              <li>
                <strong>Finite Cycle Bounds:</strong> By Lagrange&apos;s theorem, guarantees that repeated application of any key eventually returns to the identity transformation.
              </li>
              <li>
                <strong>Subgroup Hierarchies:</strong> Formally demonstrates that the Caesar shift cipher is a normal cyclic subgroup of the affine general linear group: <MathView math="C_{26} \triangleleft \mathrm{AGL}(1, 26)" />.
              </li>
            </ul>
          </div>

          <div className="limits-box limitations">
            <h4>What Group Structure Does NOT Establish</h4>
            <ul className="limits-list">
              <li>
                <strong>NOT Modern Cryptographic Security:</strong> Having a group structure does <em>not</em> imply resistance against cryptanalysis. In fact, classical group closure means multi-encryption provides zero extra security (<MathView math="E_{k_2} \circ E_{k_1} = E_{k_3}" />).
              </li>
              <li>
                <strong>Trivial Keyspace Exhaustion:</strong> The keyspaces (<MathView math="|C_{26}|=26" />, <MathView math="|\mathrm{AGL}(1,26)|=312" />, <MathView math="|S_4|=24" />) can be searched exhaustively on modern hardware in less than one millisecond.
              </li>
              <li>
                <strong>Vulnerability to Frequency Analysis:</strong> Caesar and Affine maps preserve letter frequency distributions identically; <MathView math="S_4" /> preserves global letter frequencies across blocks.
              </li>
              <li>
                <strong>Educational vs. Production Scope:</strong> These transformation systems are pedagogical models designed to illuminate algebraic mechanics, not modern cryptographic protocols like AES-GCM or RSA.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
