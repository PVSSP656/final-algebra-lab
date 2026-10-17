import { useState, useMemo, useEffect } from "react";
import { MathView } from "./MathView";
import { TransformationChamber } from "./TransformationChamber";
import {
  ALPHABET,
  AFFINE_UNITS,
  S4,
  gcd,
  caesarValue,
  caesarText,
  affineValue,
  affineCompose,
  affineInverse,
  affineText,
  permutationApply,
  permutationCompose,
  permutationInverse,
  permutationLabel,
  permutationText,
  type AffineKey,
  type Permutation,
} from "../math/engine";

// ─── Section scroll navigation ──────────────────────────────────────────────

type SectionTab = "overview" | "reversible" | "axioms" | "composition" | "compare" | "takeaway";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 88;
  window.scrollTo({ top, behavior: "smooth" });
}

// ─── Small shared UI pieces ──────────────────────────────────────────────────

function SectionEyebrow({ label }: { label: string }) {
  return <div className="s-eyebrow">{label}</div>;
}

function ExpandToggle({
  open,
  onToggle,
  label = "Show formal definition",
}: {
  open: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="expand-toggle" onClick={onToggle}>
      {open ? "↑ Hide" : `↓ ${label}`}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CommonAlgebraicStructure() {
  const [activeSection, setActiveSection] = useState<SectionTab>("overview");

  // Scroll spy
  useEffect(() => {
    const ids: [string, SectionTab][] = [
      ["sec-overview", "overview"],
      ["sec-reversible", "reversible"],
      ["sec-axioms", "axioms"],
      ["sec-composition", "composition"],
      ["sec-compare", "compare"],
      ["sec-takeaway", "takeaway"],
    ];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const found = ids.find(([id]) => id === e.target.id);
            if (found) setActiveSection(found[1]);
          }
        }
      },
      { rootMargin: "-100px 0px -55% 0px", threshold: 0.05 }
    );
    ids.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // ── Section B: Three Systems ──────────────────────────────────────────────
  const [caesarWord, setCaesarWord] = useState("HELLO");
  const [caesarK, setCaesarK] = useState(3);
  const [affineWord, setAffineWord] = useState("HELLO");
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [permWord, setPermWord] = useState("MATH");
  const [permKeyIdx, setPermKeyIdx] = useState(13); // [3,1,4,2]

  const caesarOut = useMemo(
    () => caesarText(caesarWord, caesarK),
    [caesarWord, caesarK]
  );
  const affineGcd = useMemo(() => gcd(affineA, 26), [affineA]);
  const isAffineValid = affineGcd === 1;
  const affineOut = useMemo(() => {
    if (!isAffineValid) return "—";
    try { return affineText(affineWord, { a: affineA, b: affineB }); } catch { return "—"; }
  }, [affineWord, affineA, affineB, isAffineValid]);
  const permKey = S4[permKeyIdx] ?? S4[13];
  const permCleanWord = useMemo(() => {
    const raw = permWord.toUpperCase().replace(/[^A-Z]/g, "");
    return (raw + "ABCD").slice(0, 4);
  }, [permWord]);
  const permOut = useMemo(
    () => permutationText(permKey, permCleanWord),
    [permKey, permCleanWord]
  );

  // ── Section C: Reversibility ──────────────────────────────────────────────
  const [revSystem, setRevSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [revChar, setRevChar] = useState("G");
  const [revK, setRevK] = useState(5);
  const [revAffA, setRevAffA] = useState(5);
  const [revAffB, setRevAffB] = useState(8);
  const [revPermIdx, setRevPermIdx] = useState(13);
  const [showCollision, setShowCollision] = useState(false);

  const revPermKey = S4[revPermIdx] ?? S4[13];

  const revInput = useMemo(() => {
    if (revSystem === "permutation") return "MATH";
    return revChar;
  }, [revSystem, revChar]);

  const revEncrypted = useMemo(() => {
    if (revSystem === "caesar") {
      const v = revChar.charCodeAt(0) - 65;
      return ALPHABET[caesarValue(v, revK)];
    }
    if (revSystem === "affine") {
      if (!isAffineValid) return "?";
      const v = revChar.charCodeAt(0) - 65;
      return ALPHABET[affineValue(v, { a: revAffA, b: revAffB })];
    }
    return permutationApply(revPermKey, "MATH");
  }, [revSystem, revChar, revK, revAffA, revAffB, revPermKey, isAffineValid]);

  const revDecrypted = useMemo(() => {
    if (revSystem === "caesar") {
      const encV = (revEncrypted as string).charCodeAt(0) - 65;
      return ALPHABET[caesarValue(encV, -revK)];
    }
    if (revSystem === "affine") {
      if (!isAffineValid) return "?";
      try {
        const invKey = affineInverse({ a: revAffA, b: revAffB });
        const encV = (revEncrypted as string).charCodeAt(0) - 65;
        return ALPHABET[affineValue(encV, invKey)];
      } catch { return "?"; }
    }
    const inv = permutationInverse(revPermKey);
    return permutationApply(inv, revEncrypted as string);
  }, [revSystem, revEncrypted, revK, revAffA, revAffB, revPermKey, isAffineValid]);

  const revInverseLabel = useMemo(() => {
    if (revSystem === "caesar") return `shift −${revK} (mod 26)`;
    if (revSystem === "affine") {
      try {
        const inv = affineInverse({ a: revAffA, b: revAffB });
        return `E(${inv.a},${inv.b})`;
      } catch { return "—"; }
    }
    return permutationLabel(permutationInverse(revPermKey));
  }, [revSystem, revK, revAffA, revAffB, revPermKey]);

  // ── Section D: Group Axioms ───────────────────────────────────────────────
  const [axiomSystem, setAxiomSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [openAxiom, setOpenAxiom] = useState<number | null>(null);

  const toggleAxiom = (n: number) => setOpenAxiom(openAxiom === n ? null : n);

  // Axiom live examples (engine-computed)
  // Closure example
  const closureCaesar = { k1: 4, k2: 9, result: (4 + 9) % 26 };
  const closureAffine = useMemo(() => {
    const t1: AffineKey = { a: 3, b: 4 };
    const t2: AffineKey = { a: 5, b: 7 };
    return affineCompose(t2, t1);
  }, []);
  const closurePerm = useMemo(() => {
    const p1 = S4[6]!; // [1,0,2,3] zero-indexed → label [2,1,3,4]
    const p2 = S4[2]!; // [0,2,1,3] zero-indexed → label [1,3,2,4]
    return { p1, p2, result: permutationCompose(p2, p1) };
  }, []);

  // Identity examples
  // Inverse examples
  const caesarInvK = 5;
  const affineInvKey = useMemo(() => {
    try { return affineInverse({ a: 5, b: 8 }); } catch { return null; }
  }, []);

  // ── Section E: Composition ────────────────────────────────────────────────
  const [compSystem, setCompSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [compInput, setCompInput] = useState("H");
  const [compK1, setCompK1] = useState(3);
  const [compK2, setCompK2] = useState(5);
  const [compA1, setCompA1] = useState(3);
  const [compB1, setCompB1] = useState(4);
  const [compA2, setCompA2] = useState(5);
  const [compB2, setCompB2] = useState(7);
  const [compP1idx, setCompP1idx] = useState(13);
  const [compP2idx, setCompP2idx] = useState(9);
  const [compPermWord, setCompPermWord] = useState("MATH");
  const [showCompMath, setShowCompMath] = useState(false);

  const compInputVal = useMemo(() => {
    const c = compInput.toUpperCase().slice(0, 1) || "A";
    const v = c.charCodeAt(0) - 65;
    return v >= 0 && v < 26 ? v : 0;
  }, [compInput]);
  const compInputChar = ALPHABET[compInputVal];

  // Caesar path
  const compCaesarStep1Val = caesarValue(compInputVal, compK1);
  const compCaesarStep1Char = ALPHABET[compCaesarStep1Val];
  const compCaesarStep2Val = caesarValue(compCaesarStep1Val, compK2);
  const compCaesarStep2Char = ALPHABET[compCaesarStep2Val];
  const compCaesarCompK = (compK1 + compK2) % 26;
  const compCaesarInvK = (26 - compCaesarCompK) % 26;
  const compCaesarRecovered = ALPHABET[caesarValue(compCaesarStep2Val, compCaesarInvK)];

  // Affine path
  const compAffKey1 = useMemo<AffineKey>(() => ({ a: compA1, b: compB1 }), [compA1, compB1]);
  const compAffKey2 = useMemo<AffineKey>(() => ({ a: compA2, b: compB2 }), [compA2, compB2]);
  const compAffStep1Val = affineValue(compInputVal, compAffKey1);
  const compAffStep1Char = ALPHABET[compAffStep1Val];
  const compAffStep2Val = affineValue(compAffStep1Val, compAffKey2);
  const compAffStep2Char = ALPHABET[compAffStep2Val];
  const compAffCompKey = useMemo(() => affineCompose(compAffKey2, compAffKey1), [compAffKey1, compAffKey2]);
  const compAffInvKey = useMemo(() => affineInverse(compAffCompKey), [compAffCompKey]);
  const compAffRecovered = ALPHABET[affineValue(compAffStep2Val, compAffInvKey)];

  // Permutation path
  const compP1 = S4[compP1idx] ?? S4[13];
  const compP2 = S4[compP2idx] ?? S4[9];
  const compPermClean = useMemo(() => {
    const raw = compPermWord.toUpperCase().replace(/[^A-Z]/g, "");
    return (raw + "ABCD").slice(0, 4);
  }, [compPermWord]);
  const compPermStep1 = useMemo(() => permutationApply(compP1, compPermClean), [compP1, compPermClean]);
  const compPermStep2 = useMemo(() => permutationApply(compP2, compPermStep1), [compP2, compPermStep1]);
  const compPermComp = useMemo(() => permutationCompose(compP2, compP1), [compP1, compP2]);
  const compPermInv = useMemo(() => permutationInverse(compPermComp), [compPermComp]);
  const compPermRecovered = useMemo(() => permutationApply(compPermInv, compPermStep2), [compPermInv, compPermStep2]);

  // ── Section F: Compare (commutativity) ───────────────────────────────────
  const [commSystem, setCommSystem] = useState<"caesar" | "affine" | "permutation">("caesar");

  // Affine commutativity presets (engine-computed)
  const affTest1: AffineKey = useMemo(() => ({ a: 3, b: 2 }), []);
  const affTest2: AffineKey = useMemo(() => ({ a: 5, b: 7 }), []);
  const aff21 = useMemo(() => affineCompose(affTest2, affTest1), [affTest1, affTest2]);
  const aff12 = useMemo(() => affineCompose(affTest1, affTest2), [affTest1, affTest2]);

  // S4 commutativity presets (engine-computed)
  const pComm: Permutation = useMemo(() => [1, 0, 2, 3], []);
  const qComm: Permutation = useMemo(() => [0, 2, 1, 3], []);
  const pqComm = useMemo(() => permutationCompose(pComm, qComm), [pComm, qComm]);
  const qpComm = useMemo(() => permutationCompose(qComm, pComm), [pComm, qComm]);

  const commutes = commSystem === "caesar";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-wrap structure-page">

      {/* Page hero */}
      <div className="page-intro struc-hero">
        <p className="eyebrow">04 / THE ALGEBRAIC STRUCTURES</p>
        <h1>
          Reversibility through<br />
          <em>algebraic groups.</em>
        </h1>
        <p className="struc-hero-sub">
          Explore how three classical ciphers share one algebraic skeleton — invertible transformations under composition — and why that skeleton is called a <em>group</em>.
        </p>
      </div>

      {/* Sticky section nav */}
      <nav className="struc-nav" aria-label="Page sections">
        {[
          ["overview", "Three Systems"],
          ["reversible", "Reversibility"],
          ["axioms", "Group Axioms"],
          ["composition", "Composition"],
          ["compare", "Commutativity"],
          ["takeaway", "Summary"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`struc-nav-btn ${activeSection === key ? "active" : ""}`}
            onClick={() => scrollTo(`sec-${key}`)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ================================================================== */}
      {/* SECTION B — Three Systems, One Idea                                */}
      {/* ================================================================== */}
      <section id="sec-overview" className="struc-section">
        <SectionEyebrow label="01 · Three Systems, One Idea" />
        <h2 className="struc-h2">Three systems.<br /><em>One algebraic skeleton.</em></h2>
        <p className="struc-lead">
          Each system below shifts, scales, or rearranges letters. Adjust the controls — the output is computed by the mathematical engine, never hardcoded.
        </p>

        <div className="systems-grid">

          {/* Caesar */}
          <div className="sys-card caesar-card">
            <div className="sys-card-top">
              <span className="sys-pill violet">Caesar Cipher</span>
              <span className="sys-domain">
                <MathView math="(\mathbb{Z}_{26},\, +)" />
              </span>
            </div>
            <p className="sys-tagline">Shifts every letter by a fixed amount, wrapping at Z.</p>

            <div className="sys-demo">
              <div className="io-row">
                <input
                  type="text"
                  className="word-input"
                  value={caesarWord}
                  maxLength={8}
                  onChange={(e) => setCaesarWord(e.target.value.toUpperCase())}
                  spellCheck={false}
                />
                <span className="io-arrow">→</span>
                <div className="word-output violet">{caesarOut}</div>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">
                  Shift <MathView math="k" />
                  <span className="ctrl-val">{caesarK}</span>
                </label>
                <input
                  type="range" min={0} max={25} value={caesarK}
                  onChange={(e) => setCaesarK(Number(e.target.value))}
                  className="styled-slider violet-slider"
                />
              </div>
            </div>

            <div className="sys-formula">
              <MathView math="E_k(x) = (x + k) \bmod 26" display />
            </div>
          </div>

          {/* Affine */}
          <div className="sys-card affine-card">
            <div className="sys-card-top">
              <span className="sys-pill blue">Affine Cipher</span>
              <span className="sys-domain">
                <MathView math="\mathrm{Aff}(\mathbb{Z}_{26})" />
              </span>
            </div>
            <p className="sys-tagline">Multiplies then shifts each letter's numerical value.</p>

            <div className="sys-demo">
              <div className="io-row">
                <input
                  type="text"
                  className="word-input"
                  value={affineWord}
                  maxLength={8}
                  onChange={(e) => setAffineWord(e.target.value.toUpperCase())}
                  spellCheck={false}
                />
                <span className="io-arrow">→</span>
                <div className={`word-output blue ${!isAffineValid ? "invalid" : ""}`}>
                  {isAffineValid ? affineOut : "Invalid key"}
                </div>
              </div>
              {!isAffineValid && (
                <div className="inline-warning">
                  <MathView math={`\\gcd(${affineA}, 26) = ${affineGcd} \\ne 1`} /> — no inverse exists
                </div>
              )}
              <div className="ctrl-row">
                <label className="ctrl-label">
                  Multiplier <MathView math="a" />
                </label>
                <select
                  className="styled-select"
                  value={affineA}
                  onChange={(e) => setAffineA(Number(e.target.value))}
                >
                  {AFFINE_UNITS.map((u) => (
                    <option key={u} value={u}>a = {u}</option>
                  ))}
                  <option value={2}>a = 2 (invalid)</option>
                  <option value={4}>a = 4 (invalid)</option>
                  <option value={13}>a = 13 (invalid)</option>
                </select>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">
                  Shift <MathView math="b" />
                  <span className="ctrl-val">{affineB}</span>
                </label>
                <input
                  type="range" min={0} max={25} value={affineB}
                  onChange={(e) => setAffineB(Number(e.target.value))}
                  className="styled-slider blue-slider"
                />
              </div>
            </div>

            <div className="sys-formula">
              <MathView math="E_{a,b}(x) = (a{\cdot}x + b) \bmod 26" display />
            </div>
          </div>

          {/* Permutations */}
          <div className="sys-card perm-card">
            <div className="sys-card-top">
              <span className="sys-pill silver">Permutations</span>
              <span className="sys-domain">
                <MathView math="S_4" />
              </span>
            </div>
            <p className="sys-tagline">Rearranges four character positions within a block.</p>

            <div className="sys-demo">
              <div className="io-row">
                <input
                  type="text"
                  className="word-input mono"
                  value={permWord}
                  maxLength={4}
                  onChange={(e) => setPermWord(e.target.value.toUpperCase())}
                  spellCheck={false}
                />
                <span className="io-arrow">→</span>
                <div className="word-output silver">{permOut}</div>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">
                  Key <MathView math="\sigma" />
                  <span className="ctrl-val mono">{permutationLabel(permKey)}</span>
                </label>
                <div className="perm-quick-btns">
                  {[
                    [13, "[3,1,4,2]"],
                    [9, "[2,3,4,1]"],
                    [23, "[4,3,2,1]"],
                    [0, "[1,2,3,4] e"],
                  ].map(([idx, lbl]) => (
                    <button
                      key={idx}
                      type="button"
                      className={`perm-quick-btn ${permKeyIdx === idx ? "active" : ""}`}
                      onClick={() => setPermKeyIdx(idx as number)}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sys-formula">
              <MathView
                math={`[${permKey.map((v) => v + 1).join(",")}] : \\mathrm{${permCleanWord}} \\mapsto \\mathrm{${permOut}}`}
                display
              />
            </div>
          </div>

        </div>

        {/* Connecting thesis */}
        <div className="thesis-strip">
          <span className="thesis-bullet violet" />
          <span className="thesis-bullet blue" />
          <span className="thesis-bullet silver" />
          <span className="thesis-text">
            Different transformations. Different domains. Every key is a bijection. Every system is a group.
          </span>
        </div>

        {/* Foundational Mathematical Anchor: Different Transformations. One Common Structure. */}
        <div className="common-structure-foundation">
          <div className="found-header">
            <span className="sys-pill lav">Foundational Synthesis</span>
            <h3 className="found-title">Different Transformations. <em>One Common Structure.</em></h3>
            <p className="found-lead">
              While Caesar shifts letter positions along a cyclic ring, Affine applies linear scaling and translation, and <MathView math="S_4" /> permutes characters inside four-position blocks, all three systems share an identical abstract identity: <strong>they are mathematical groups under function composition <MathView math="(G, \circ)" /></strong>.
            </p>
          </div>

          {/* Intuitive Explanation Before Formal Notation */}
          <div className="found-intuitive-block">
            <h4 className="intuitive-subtitle">The Intuitive Idea: Reversibility Through Function Composition</h4>
            <p className="intuitive-text">
              At first glance, shifting a letter by an offset (Caesar), multiplying and shifting by modular arithmetic (Affine), and scrambling the positions of letters in a four-character block (<MathView math="S_4" />) feel like fundamentally different operations.
              However, abstract algebra reveals their shared DNA: <strong>every transformation is an invertible permutation (bijection) on a finite message space</strong>.
            </p>
            <p className="intuitive-text">
              When we perform one transformation after another, we are doing <em>function composition</em>. Because every step must be decodable, every transformation has a guaranteed inverse. Because &ldquo;doing nothing&rdquo; is a valid key, an identity element exists. And because composition of mappings is naturally associative, every one of these three systems forms an <strong>algebraic group <MathView math="(G, \circ)" /></strong>.
            </p>
          </div>

          <div className="found-formal-def">
            <div className="found-def-badge">Formal Definition</div>
            <p className="found-def-text">
              An algebraic group <MathView math="(G, \circ)" /> consists of a set of bijective mappings <MathView math="G" /> together with the binary operation of function composition <MathView math="\circ" />, satisfying four invariant axioms: closure, associativity, existence of an identity transformation, and existence of a unique inverse for every operation.
            </p>
          </div>

          {/* Deep-Dive Grid: Structured 6-Property Comparison */}
          <div className="found-systems-grid">
            {/* Caesar C26 */}
            <div className="found-system-box caesar-box">
              <div className="found-box-top">
                <span className="sys-pill violet">Caesar Group C₂₆</span>
                <span className="found-order-pill">Order |G| = 26</span>
              </div>
              <h4 className="found-sys-name">Cyclic Permutations of <MathView math="\mathbb{Z}_{26}" /></h4>
              <p className="found-sys-desc">
                Uniform modular shifts on individual letters. Forms an Abelian cyclic group generated by a single step.
              </p>
              
              <ul className="sys-properties-list">
                <li><strong>1. Transformation set:</strong> All 26 shifts <MathView math="C_{26} = \{E_k \mid k \in \mathbb{Z}_{26}\}" />, where <MathView math="E_k(x) = (x + k) \bmod 26" />.</li>
                <li><strong>2. Binary operation:</strong> Composition of shifts, corresponding to modular addition of keys: <MathView math="E_{k_2} \circ E_{k_1} = E_{(k_1 + k_2) \bmod 26}" />.</li>
                <li><strong>3. Identity element:</strong> Shift by zero <MathView math="E_0(x) = x" /> leaves all letters unchanged.</li>
                <li><strong>4. Inverse element:</strong> Shift by <MathView math="-k \bmod 26 = (26 - k) \bmod 26" />, satisfying <MathView math="E_k^{-1} = E_{26-k}" />.</li>
                <li><strong>5. Closure &amp; Associativity:</strong> Sum of integers mod 26 is closed; function composition is universally associative.</li>
                <li><strong>6. Commutative (Abelian):</strong> Yes. <MathView math="E_{k_1} \circ E_{k_2} = E_{k_2} \circ E_{k_1}" /> because addition modulo 26 is commutative.</li>
              </ul>

              <div className="found-sys-math">
                <MathView math="E_k(x) = (x + k) \bmod 26, \quad E_{k_2} \circ E_{k_1} = E_{(k_1 + k_2)\bmod 26}" display />
              </div>
            </div>

            {/* Affine G_aff */}
            <div className="found-system-box affine-box">
              <div className="found-box-top">
                <span className="sys-pill blue">Affine Group G_aff</span>
                <span className="found-order-pill">Order |G| = 312</span>
              </div>
              <h4 className="found-sys-name">Semidirect Product <MathView math="\mathbb{Z}_{26} \rtimes \mathbb{Z}_{26}^\times" /></h4>
              <p className="found-sys-desc">
                Combines modular scaling by a unit coprime to 26 with an additive shift. Forms a non-Abelian group.
              </p>
              
              <ul className="sys-properties-list">
                <li><strong>1. Transformation set:</strong> <MathView math="G_{\mathrm{aff}} = \{E_{a,b} \mid a \in \mathbb{Z}_{26}^\times, b \in \mathbb{Z}_{26}\}" />. 12 units <MathView math="\times" /> 26 shifts = 312 transformations.</li>
                <li><strong>2. Binary operation:</strong> Function composition (rightmost acts first): <MathView math="E_{a,b} \circ E_{c,d} = E_{ac \bmod 26, (ad + b) \bmod 26}" />.</li>
                <li><strong>3. Identity element:</strong> Key <MathView math="(a=1, b=0)" />, yielding <MathView math="E_{1,0}(x) = (1{\cdot}x + 0) \bmod 26 = x" />.</li>
                <li><strong>4. Inverse element:</strong> <MathView math="E_{a,b}^{-1}(y) = a^{-1}(y - b) \bmod 26 = E_{a^{-1}, -a^{-1}b \bmod 26}(y)" />, where <MathView math="a \cdot a^{-1} \equiv 1 \pmod{26}" />.</li>
                <li><strong>5. Closure &amp; Associativity:</strong> Products of coprimes are coprime mod 26; composition of affine maps is closed and associative.</li>
                <li><strong>6. Commutative (Abelian):</strong> No. The multiplier of the outer function scales the shift of the inner function, so order matters.</li>
              </ul>

              <div className="found-sys-math">
                <MathView math="E_{a,b} \circ E_{c,d} = E_{ac \bmod 26, (ad + b) \bmod 26}" display />
              </div>
            </div>

            {/* S4 Permutations */}
            <div className="found-system-box perm-box">
              <div className="found-box-top">
                <span className="sys-pill silver">Symmetric Group S₄</span>
                <span className="found-order-pill">Order |G| = 24</span>
              </div>
              <h4 className="found-sys-name">Full Permutation Group of Degree 4</h4>
              <p className="found-sys-desc">
                Rearranges character positions within 4-character blocks. Preserves project's 1-based indexing convention.
              </p>
              
              <ul className="sys-properties-list">
                <li><strong>1. Transformation set:</strong> <MathView math="S_4 = \{\sigma \mid \sigma : \{1,2,3,4\} \to \{1,2,3,4\} \text{ bijective}\}" />, containing <MathView math="4! = 24" /> permutations.</li>
                <li><strong>2. Binary operation:</strong> Permutation composition <MathView math="(\tau \circ \sigma)(x) = \tau(\sigma(x))" />, evaluating right-to-left.</li>
                <li><strong>3. Identity element:</strong> The identity permutation <MathView math="[1,2,3,4]" /> leaving all four character positions unchanged.</li>
                <li><strong>4. Inverse element:</strong> The inverse permutation <MathView math="\sigma^{-1}" /> swapping source and destination indices.</li>
                <li><strong>5. Closure &amp; Associativity:</strong> Composing two permutations on 4 elements produces another permutation in <MathView math="S_4" />; composition is associative.</li>
                <li><strong>6. Commutative (Abelian):</strong> No. Transpositions in <MathView math="S_4" /> do not commute in general: <MathView math="\tau \circ \sigma \ne \sigma \circ \tau" />.</li>
              </ul>

              <div className="found-sys-math">
                <MathView math="(\tau \circ \sigma)(x) = \tau(\sigma(x)), \quad |S_4| = 4! = 24" display />
              </div>
            </div>
          </div>

          {/* Section: What Is Shared — And What Differs */}
          <div className="shared-vs-differ-block">
            <div className="shared-differ-header">
              <span className="sys-pill lav">Comparative Synthesis</span>
              <h4 className="shared-differ-title">What Is Shared — <em>And What Differs</em></h4>
              <p className="shared-differ-lead">
                Having a common algebraic structure does not mean the three transformation systems are identical. Here is what they share and where their mathematical behaviors diverge.
              </p>
            </div>

            <div className="shared-differ-grid">
              <div className="shared-card">
                <div className="shared-badge">WHAT THEY SHARE</div>
                <h5 className="shared-card-h">The Invariant Group Blueprint</h5>
                <ul className="shared-list">
                  <li><strong>Bijective transformations:</strong> Every key is a 1-to-1, onto function on a finite domain, guaranteeing zero collisions.</li>
                  <li><strong>The four group axioms:</strong> Closure, associativity, identity, and unique inverses hold universally across all three.</li>
                  <li><strong>Deterministic reversibility:</strong> Decryption is the mathematically guaranteed application of the group inverse <MathView math="T^{-1}" />.</li>
                  <li><strong>Compositional reasoning:</strong> Abstract algebra lets us prove properties of chained transformations without inspecting character-level details.</li>
                </ul>
              </div>

              <div className="differ-card">
                <div className="differ-badge">WHAT DIFFERS</div>
                <h5 className="shared-card-h">Domains, Orders, and Algebra</h5>
                <ul className="differ-list">
                  <li><strong>Underlying domains:</strong> Caesar and Affine act on individual character residues in <MathView math="\mathbb{Z}_{26}" />, while <MathView math="S_4" /> acts on 4-position indices <MathView math="\{1,2,3,4\}" />.</li>
                  <li><strong>Group orders (keyspaces):</strong> <MathView math="|C_{26}| = 26" />, <MathView math="|G_{\mathrm{aff}}| = 312" />, <MathView math="|S_4| = 24" />.</li>
                  <li><strong>Commutativity:</strong> Caesar is strictly Abelian; Affine and <MathView math="S_4" /> are non-Abelian.</li>
                  <li><strong>Internal structure:</strong> Cyclic group vs. Semidirect product <MathView math="\mathbb{Z}_{26} \rtimes \mathbb{Z}_{26}^\times" /> vs. Symmetric permutation group.</li>
                </ul>
              </div>
            </div>

            {/* Cryptographic Security Clarification */}
            <div className="security-boundary-warning">
              <span className="warn-icon">⚠</span>
              <div className="warn-content">
                <strong>Crucial Distinction: Group Structure Does Not Imply Modern Cryptographic Security</strong>
                <p>
                  Satisfying group axioms is a <em>necessary condition</em> for reversible decryption, but it is <em>not sufficient</em> for secrecy. Because classical ciphers form closed groups of small order, cascading multiple passes collapses into a single pass with zero keyspace gain (<MathView math="E_{k_2} \circ E_{k_1} = E_{k^*}" />). Furthermore, Caesar and Affine preserve single-letter frequencies, while <MathView math="S_4" /> preserves block letter frequencies, making all three trivially vulnerable to cryptanalysis. Modern ciphers (e.g., AES) avoid closed groups across their complete round structure, incorporating non-linear S-boxes over Galois Fields <MathView math="\mathrm{GF}(2^8)" /> to resist algebraic attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION C — Reversibility                                          */}
      {/* ================================================================== */}
      <section id="sec-reversible" className="struc-section">
        <SectionEyebrow label="02 · Reversibility" />
        <h2 className="struc-h2">A transformation is reversible<br /><em>when its inverse exists.</em></h2>
        <p className="struc-lead">
          The pipeline below shows the complete round-trip: encrypt with a key, then decrypt with its exact inverse. The recovered output always matches the original.
        </p>

        {/* Interactive Cryptographic Transformation Chamber */}
        <TransformationChamber />

        {/* System Switcher */}
        <div className="tab-row">
          {(["caesar", "affine", "permutation"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn ${revSystem === s ? "active" : ""}`}
              onClick={() => setRevSystem(s)}
            >
              {s === "caesar" ? "Caesar" : s === "affine" ? "Affine" : "S₄"}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="rev-controls">
          {revSystem !== "permutation" && (
            <div className="ctrl-row">
              <label className="ctrl-label">Input letter</label>
              <select
                className="styled-select"
                value={revChar}
                onChange={(e) => setRevChar(e.target.value)}
              >
                {ALPHABET.split("").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          {revSystem === "caesar" && (
            <div className="ctrl-row">
              <label className="ctrl-label">
                Shift k <span className="ctrl-val">{revK}</span>
              </label>
              <input
                type="range" min={1} max={25} value={revK}
                onChange={(e) => setRevK(Number(e.target.value))}
                className="styled-slider violet-slider"
              />
            </div>
          )}
          {revSystem === "affine" && (
            <>
              <div className="ctrl-row">
                <label className="ctrl-label">Multiplier a</label>
                <select
                  className="styled-select"
                  value={revAffA}
                  onChange={(e) => setRevAffA(Number(e.target.value))}
                >
                  {AFFINE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">
                  Shift b <span className="ctrl-val">{revAffB}</span>
                </label>
                <input
                  type="range" min={0} max={25} value={revAffB}
                  onChange={(e) => setRevAffB(Number(e.target.value))}
                  className="styled-slider blue-slider"
                />
              </div>
            </>
          )}
          {revSystem === "permutation" && (
            <div className="ctrl-row">
              <label className="ctrl-label">Key σ</label>
              <div className="perm-quick-btns">
                {([13, 9, 23, 0] as const).map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`perm-quick-btn ${revPermIdx === idx ? "active" : ""}`}
                    onClick={() => setRevPermIdx(idx)}
                  >
                    {permutationLabel(S4[idx]!)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Round-trip Pipeline */}
        <div className="rev-pipeline">
          <div className="rev-stage">
            <div className="rev-stage-label">Input</div>
            <div className={`rev-bubble ${revSystem === "permutation" ? "perm-block" : ""}`}>{revInput}</div>
          </div>

          <div className="rev-connector forward">
            <div className="rev-op-label">
              {revSystem === "caesar" && `+${revK} mod 26`}
              {revSystem === "affine" && `E(${revAffA},${revAffB})`}
              {revSystem === "permutation" && permutationLabel(revPermKey)}
            </div>
            <div className="rev-arrow">→</div>
            <div className="rev-op-sublabel">encrypt</div>
          </div>

          <div className="rev-stage cipher">
            <div className="rev-stage-label">Ciphertext</div>
            <div className={`rev-bubble cipher-bubble ${revSystem === "permutation" ? "perm-block" : ""}`}>{revEncrypted}</div>
          </div>

          <div className="rev-connector inverse">
            <div className="rev-op-label">{revInverseLabel}</div>
            <div className="rev-arrow">→</div>
            <div className="rev-op-sublabel">decrypt</div>
          </div>

          <div className="rev-stage recovered">
            <div className="rev-stage-label">Recovered</div>
            <div className={`rev-bubble recovered-bubble ${revSystem === "permutation" ? "perm-block" : ""}`}>{revDecrypted}</div>
            <div className="rev-check">= Input ✓</div>
          </div>
        </div>

        {/* Collision demo toggle */}
        <div className="collision-toggle-row">
          <button
            type="button"
            className="collapse-link"
            onClick={() => setShowCollision((v) => !v)}
          >
            {showCollision ? "↑ Hide" : "↓ Show"} why non-invertible mappings fail
          </button>
        </div>

        {showCollision && (
          <div className="collision-panel">
            <div className="collision-header">
              <span className="warn-badge">⚠ Non-invertible example (not a valid cipher)</span>
            </div>
            <p className="collision-body">
              With multiplier <MathView math="a=2" />, we have <MathView math="\gcd(2,26)=2\ne 1" />. Two distinct inputs map to the same output, destroying information:
            </p>
            <div className="collision-pairs">
              {[
                { p: "A", v: 0 }, { p: "N", v: 13 },
              ].map(({ p, v }) => (
                <div key={p} className="collision-pair">
                  <span className="coll-input">{p} ({v})</span>
                  <span className="coll-arrow">→</span>
                  <span className="coll-formula">(2·{v}) mod 26 = {(2 * v) % 26}</span>
                  <span className="coll-output">{ALPHABET[(2 * v) % 26]}</span>
                </div>
              ))}
            </div>
            <p className="collision-conclusion">
              Both A and N both encrypt to <strong>A</strong>. The receiver cannot determine the original plaintext. No inverse exists.
            </p>
          </div>
        )}

        <div className="rev-formula-callout">
          <MathView math="T : X \to X \quad\text{is reversible}\iff T^{-1}(T(x)) = x \;\forall x \in X" display />
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION D — Group Axioms                                           */}
      {/* ================================================================== */}
      <section id="sec-axioms" className="struc-section">
        <SectionEyebrow label="03 · The Four Group Axioms" />
        <h2 className="struc-h2">Four rules.<br /><em>One algebraic group.</em></h2>
        <p className="struc-lead">
          A set of transformations forms a group if it satisfies exactly these four laws. Click any axiom to see a computed example and its formal definition.
        </p>

        <div className="tab-row">
          {(["caesar", "affine", "permutation"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn ${axiomSystem === s ? "active" : ""}`}
              onClick={() => { setAxiomSystem(s); setOpenAxiom(null); }}
            >
              {s === "caesar" ? "Caesar C₂₆" : s === "affine" ? "Affine G_aff" : "Permutations S₄"}
            </button>
          ))}
        </div>

        <div className="axioms-list">

          {/* 1. Closure */}
          <div className={`axiom-item ${openAxiom === 1 ? "open" : ""}`}>
            <button type="button" className="axiom-summary" onClick={() => toggleAxiom(1)}>
              <span className="axiom-num">01</span>
              <span className="axiom-name">Closure</span>
              <span className="axiom-formula">
                <MathView math="T_1, T_2 \in G \implies T_2 \circ T_1 \in G" />
              </span>
              <span className="axiom-chevron">{openAxiom === 1 ? "▲" : "▼"}</span>
            </button>
            {openAxiom === 1 && (
              <div className="axiom-detail">
                <p>Composing two valid transformations always produces another valid transformation in the same system.</p>
                {axiomSystem === "caesar" && (
                  <div className="axiom-calc">
                    <MathView
                      math={`E_{${closureCaesar.k1}} \\circ E_{${closureCaesar.k2}} = E_{(${closureCaesar.k1}+${closureCaesar.k2})\\bmod 26} = E_{${closureCaesar.result}} \\in C_{26}`}
                      display
                    />
                  </div>
                )}
                {axiomSystem === "affine" && (
                  <div className="axiom-calc">
                    <MathView
                      math={`E_{5,7} \\circ E_{3,4} = E_{${closureAffine.a}, ${closureAffine.b}} \\in G_{\\mathrm{aff}}`}
                      display
                    />
                  </div>
                )}
                {axiomSystem === "permutation" && (
                  <div className="axiom-calc">
                    <MathView
                      math={`${permutationLabel(closurePerm.p2)} \\circ ${permutationLabel(closurePerm.p1)} = ${permutationLabel(closurePerm.result)} \\in S_4`}
                      display
                    />
                  </div>
                )}
                <div className="axiom-formal">
                  <MathView math="\forall\, a, b \in G : a \circ b \in G" display />
                </div>
                <div className="axiom-crypto-insight">
                  <strong>Cryptographic Consequence:</strong> Group closure guarantees that combining multiple encryption passes never escapes the group's transformation space. Multi-encryption with classical keys collapses into a single equivalent key in <MathView math="G" />, providing zero keyspace expansion.
                </div>
              </div>
            )}
          </div>

          {/* 2. Associativity */}
          <div className={`axiom-item ${openAxiom === 2 ? "open" : ""}`}>
            <button type="button" className="axiom-summary" onClick={() => toggleAxiom(2)}>
              <span className="axiom-num">02</span>
              <span className="axiom-name">Associativity</span>
              <span className="axiom-formula">
                <MathView math="(T_3 \circ T_2) \circ T_1 = T_3 \circ (T_2 \circ T_1)" />
              </span>
              <span className="axiom-chevron">{openAxiom === 2 ? "▲" : "▼"}</span>
            </button>
            {openAxiom === 2 && (
              <div className="axiom-detail">
                <p>Grouping of sequential transformations does not change the outcome — both orderings reach the same result.</p>
                <div className="assoc-visual">
                  <div className="assoc-route">
                    <span className="assoc-tag">Route A</span>
                    <code>((T₃ ∘ T₂) ∘ T₁)(x)</code>
                    <span className="assoc-eq">= same output</span>
                  </div>
                  <div className="assoc-route">
                    <span className="assoc-tag">Route B</span>
                    <code>(T₃ ∘ (T₂ ∘ T₁))(x)</code>
                    <span className="assoc-eq">= same output</span>
                  </div>
                </div>
                <div className="axiom-formal">
                  <MathView math="\forall\, f, g, h \in G : (f \circ g) \circ h = f \circ (g \circ h)" display />
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                    This is inherited from function composition itself — no extra proof needed for each system.
                  </p>
                </div>
                <div className="axiom-crypto-insight">
                  <strong>Cryptographic Consequence:</strong> Multi-party encryption and decryption pipelines can group intermediate calculations without altering the end result: <MathView math="T_{\text{dec}} \circ (T_2 \circ T_1) = (T_{\text{dec}} \circ T_2) \circ T_1" />.
                </div>
              </div>
            )}
          </div>

          {/* 3. Identity */}
          <div className={`axiom-item ${openAxiom === 3 ? "open" : ""}`}>
            <button type="button" className="axiom-summary" onClick={() => toggleAxiom(3)}>
              <span className="axiom-num">03</span>
              <span className="axiom-name">Identity</span>
              <span className="axiom-formula">
                <MathView math="e \circ T = T \circ e = T" />
              </span>
              <span className="axiom-chevron">{openAxiom === 3 ? "▲" : "▼"}</span>
            </button>
            {openAxiom === 3 && (
              <div className="axiom-detail">
                <p>An identity transformation exists that leaves every message completely unchanged.</p>
                {axiomSystem === "caesar" && (
                  <div className="axiom-calc">
                    <MathView math="E_0(x) = (x + 0) \bmod 26 = x" display />
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>Shift k = 0 is the identity element of C₂₆.</p>
                  </div>
                )}
                {axiomSystem === "affine" && (
                  <div className="axiom-calc">
                    <MathView math="E_{1,0}(x) = (1{\cdot}x + 0) \bmod 26 = x" display />
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>Key (a=1, b=0) is the identity element of G_aff.</p>
                  </div>
                )}
                {axiomSystem === "permutation" && (
                  <div className="axiom-calc">
                    <MathView math="[1,2,3,4] : \mathrm{ABCD} \mapsto \mathrm{ABCD}" display />
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>The identity permutation leaves every position unchanged.</p>
                  </div>
                )}
                <div className="axiom-formal">
                  <MathView math="\exists\, e \in G \;\forall\, a \in G : e \circ a = a \circ e = a" display />
                </div>
                <div className="axiom-crypto-insight">
                  <strong>Cryptographic Consequence:</strong> The identity element corresponds to an unencrypted state (null cipher). It serves as the algebraic baseline against which decryption inverses are validated: <MathView math="T^{-1} \circ T = e" />.
                </div>
              </div>
            )}
          </div>

          {/* 4. Inverses */}
          <div className={`axiom-item ${openAxiom === 4 ? "open" : ""}`}>
            <button type="button" className="axiom-summary" onClick={() => toggleAxiom(4)}>
              <span className="axiom-num">04</span>
              <span className="axiom-name">Inverses</span>
              <span className="axiom-formula">
                <MathView math="T^{-1} \circ T = T \circ T^{-1} = e" />
              </span>
              <span className="axiom-chevron">{openAxiom === 4 ? "▲" : "▼"}</span>
            </button>
            {openAxiom === 4 && (
              <div className="axiom-detail">
                <p>Every transformation has a unique inverse that undoes it exactly, restoring the original input.</p>
                {axiomSystem === "caesar" && (
                  <div className="axiom-calc">
                    <MathView
                      math={`E_{${caesarInvK}}(E_{${caesarInvK}}(x)) = x \\quad \\Longleftarrow \\quad ${caesarInvK} + ${caesarInvK} \\equiv ${(caesarInvK + caesarInvK) % 26} \\pmod{26}`}
                      display
                    />
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      Inverse of shift +{caesarInvK} is shift −{caesarInvK} = shift {(26 - caesarInvK) % 26} mod 26.
                    </p>
                  </div>
                )}
                {axiomSystem === "affine" && affineInvKey && (
                  <div className="axiom-calc">
                    <MathView
                      math={`E_{${affineInvKey.a},${affineInvKey.b}}\\!\\left(E_{5,8}(x)\\right) = x`}
                      display
                    />
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      Inverse of E(5,8) is E({affineInvKey.a},{affineInvKey.b}), where {affineInvKey.a} = 5⁻¹ mod 26.
                    </p>
                  </div>
                )}
                {axiomSystem === "permutation" && (
                  <div className="axiom-calc">
                    <MathView
                      math={`[3,1,4,2]^{-1} = [2,4,1,3] \\quad\\text{and}\\quad \\sigma^{-1}(\\sigma(\\text{ABCD})) = \\text{ABCD}`}
                      display
                    />
                  </div>
                )}
                <div className="axiom-formal">
                  <MathView math="\forall\, a \in G \;\exists\, a^{-1} \in G : a \circ a^{-1} = a^{-1} \circ a = e" display />
                </div>
                <div className="axiom-crypto-insight">
                  <strong>Cryptographic Consequence:</strong> The existence of inverses is the foundational mathematical criterion for decryption without information loss. In Affine ciphers, this is why <MathView math="\gcd(a, 26) = 1" /> is an absolute prerequisite.
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION E — Composition                                            */}
      {/* ================================================================== */}
      <section id="sec-composition" className="struc-section">
        <SectionEyebrow label="04 · Composition" />
        <h2 className="struc-h2">Apply T₁, then T₂.<br /><em>The result is T₂ ∘ T₁.</em></h2>
        <p className="struc-lead">
          Composition means applying two transformations sequentially. The rightmost function acts first:{" "}
          <MathView math="(T_2 \circ T_1)(x) = T_2(T_1(x))" />.
          The composed transformation has its own inverse that restores the original.
        </p>

        <div className="tab-row">
          {(["caesar", "affine", "permutation"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn ${compSystem === s ? "active" : ""}`}
              onClick={() => setCompSystem(s)}
            >
              {s === "caesar" ? "Caesar" : s === "affine" ? "Affine" : "S₄"}
            </button>
          ))}
        </div>

        {/* Controls per system */}
        <div className="comp-controls">
          {compSystem === "caesar" && (
            <div className="comp-ctrl-grid">
              <div className="ctrl-row">
                <label className="ctrl-label">Input</label>
                <input
                  type="text" maxLength={1} value={compInput}
                  onChange={(e) => setCompInput(e.target.value.toUpperCase())}
                  className="char-input"
                />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">k₁ <span className="ctrl-val">{compK1}</span></label>
                <input type="range" min={0} max={25} value={compK1}
                  onChange={(e) => setCompK1(Number(e.target.value))}
                  className="styled-slider violet-slider" />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">k₂ <span className="ctrl-val">{compK2}</span></label>
                <input type="range" min={0} max={25} value={compK2}
                  onChange={(e) => setCompK2(Number(e.target.value))}
                  className="styled-slider violet-slider" />
              </div>
            </div>
          )}
          {compSystem === "affine" && (
            <div className="comp-ctrl-grid">
              <div className="ctrl-row">
                <label className="ctrl-label">Input</label>
                <input
                  type="text" maxLength={1} value={compInput}
                  onChange={(e) => setCompInput(e.target.value.toUpperCase())}
                  className="char-input"
                />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">T₁ (a₁)</label>
                <select className="styled-select" value={compA1}
                  onChange={(e) => setCompA1(Number(e.target.value))}>
                  {AFFINE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">T₁ (b₁) <span className="ctrl-val">{compB1}</span></label>
                <input type="range" min={0} max={25} value={compB1}
                  onChange={(e) => setCompB1(Number(e.target.value))}
                  className="styled-slider blue-slider" />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">T₂ (a₂)</label>
                <select className="styled-select" value={compA2}
                  onChange={(e) => setCompA2(Number(e.target.value))}>
                  {AFFINE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">T₂ (b₂) <span className="ctrl-val">{compB2}</span></label>
                <input type="range" min={0} max={25} value={compB2}
                  onChange={(e) => setCompB2(Number(e.target.value))}
                  className="styled-slider blue-slider" />
              </div>
            </div>
          )}
          {compSystem === "permutation" && (
            <div className="comp-ctrl-grid">
              <div className="ctrl-row">
                <label className="ctrl-label">Block</label>
                <input
                  type="text" maxLength={4} value={compPermWord}
                  onChange={(e) => setCompPermWord(e.target.value.toUpperCase())}
                  className="char-input mono"
                />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">π₁</label>
                <select className="styled-select" value={compP1idx}
                  onChange={(e) => setCompP1idx(Number(e.target.value))}>
                  {S4.map((p, i) => <option key={i} value={i}>{permutationLabel(p)}</option>)}
                </select>
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">π₂</label>
                <select className="styled-select" value={compP2idx}
                  onChange={(e) => setCompP2idx(Number(e.target.value))}>
                  {S4.map((p, i) => <option key={i} value={i}>{permutationLabel(p)}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline stages */}
        <div className="comp-pipeline">
          <div className="cp-stage">
            <div className="cp-label">Input</div>
            <div className="cp-box">
              {compSystem === "permutation" ? compPermClean : compInputChar}
            </div>
          </div>
          <div className="cp-arrow">
            <div className="cp-arrow-tag">T₁</div>
            <div className="cp-arrow-glyph">→</div>
          </div>
          <div className="cp-stage mid">
            <div className="cp-label">After T₁</div>
            <div className="cp-box">
              {compSystem === "caesar" ? compCaesarStep1Char
                : compSystem === "affine" ? compAffStep1Char
                : compPermStep1}
            </div>
          </div>
          <div className="cp-arrow">
            <div className="cp-arrow-tag">T₂</div>
            <div className="cp-arrow-glyph">→</div>
          </div>
          <div className="cp-stage output">
            <div className="cp-label">After T₂</div>
            <div className="cp-box accent">
              {compSystem === "caesar" ? compCaesarStep2Char
                : compSystem === "affine" ? compAffStep2Char
                : compPermStep2}
            </div>
          </div>
          <div className="cp-arrow inverse">
            <div className="cp-arrow-tag">(T₂∘T₁)⁻¹</div>
            <div className="cp-arrow-glyph">↺</div>
          </div>
          <div className="cp-stage recovered">
            <div className="cp-label">Recovered</div>
            <div className="cp-box recovered">
              {compSystem === "caesar" ? compCaesarRecovered
                : compSystem === "affine" ? compAffRecovered
                : compPermRecovered}
            </div>
            <div className="cp-check">= Input ✓</div>
          </div>
        </div>

        {/* Show/hide mathematics */}
        <div className="comp-math-toggle">
          <ExpandToggle
            open={showCompMath}
            onToggle={() => setShowCompMath((v) => !v)}
            label="Show composed transformation formula"
          />
        </div>

        {showCompMath && (
          <div className="comp-math-detail">
            {compSystem === "caesar" && (
              <MathView
                math={`E_{${compK2}} \\circ E_{${compK1}} = E_{(${compK1}+${compK2})\\bmod 26} = E_{${compCaesarCompK}}, \\quad E_{${compCaesarCompK}}^{-1} = E_{${compCaesarInvK}}`}
                display
              />
            )}
            {compSystem === "affine" && (
              <MathView
                math={`E_{${compA2},${compB2}} \\circ E_{${compA1},${compB1}} = E_{${compAffCompKey.a},${compAffCompKey.b}}, \\quad \\text{inv} = E_{${compAffInvKey.a},${compAffInvKey.b}}`}
                display
              />
            )}
            {compSystem === "permutation" && (
              <MathView
                math={`${permutationLabel(compP2)} \\circ ${permutationLabel(compP1)} = ${permutationLabel(compPermComp)}, \\quad \\text{inv} = ${permutationLabel(compPermInv)}`}
                display
              />
            )}
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* SECTION F — Commutativity Comparison                               */}
      {/* ================================================================== */}
      <section id="sec-compare" className="struc-section">
        <SectionEyebrow label="05 · Composition Order" />
        <h2 className="struc-h2">Does order matter?<br /><em>It depends on the system.</em></h2>
        <p className="struc-lead">
          When T₁∘T₂ = T₂∘T₁ the group is <em>commutative</em> (Abelian). Caesar is — Affine and S₄ are not. The results below are engine-computed, not illustrative.
        </p>

        <div className="tab-row">
          {(["caesar", "affine", "permutation"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn ${commSystem === s ? "active" : ""}`}
              onClick={() => setCommSystem(s)}
            >
              {s === "caesar" ? "Caesar ✓ Abelian" : s === "affine" ? "Affine ✗ Non-Abelian" : "S₄ ✗ Non-Abelian"}
            </button>
          ))}
        </div>

        <div className={`comm-display ${commutes ? "commutes" : "not-commutes"}`}>
          <div className="comm-verdict">
            {commutes
              ? <span className="verdict yes">T₂ ∘ T₁ = T₁ ∘ T₂</span>
              : <span className="verdict no">T₂ ∘ T₁ ≠ T₁ ∘ T₂</span>}
          </div>

          {commSystem === "caesar" && (
            <div className="comm-paths">
              <div className="comm-path">
                <span className="path-label">E₇ ∘ E₃:</span>
                <MathView math="(x + 3 + 7) \bmod 26 = E_{10}" />
              </div>
              <div className="comm-path">
                <span className="path-label">E₃ ∘ E₇:</span>
                <MathView math="(x + 7 + 3) \bmod 26 = E_{10}" />
              </div>
              <p className="comm-explanation">
                Addition is commutative mod 26, so Caesar shifts always commute. Every composition E_k₂ ∘ E_k₁ = E_(k₁+k₂) mod 26, regardless of order.
              </p>
            </div>
          )}

          {commSystem === "affine" && (
            <div className="comm-paths">
              <div className="comm-path">
                <span className="path-label">T₂ ∘ T₁ (T₁ first):</span>
                <MathView math={`E_{3,2} \\text{ then } E_{5,7} = E_{${aff21.a},${aff21.b}}`} />
              </div>
              <div className="comm-path">
                <span className="path-label">T₁ ∘ T₂ (T₂ first):</span>
                <MathView math={`E_{5,7} \\text{ then } E_{3,2} = E_{${aff12.a},${aff12.b}}`} />
              </div>
              <p className="comm-explanation">
                <MathView math={`E_{${aff21.a},${aff21.b}} \\ne E_{${aff12.a},${aff12.b}}`} /> — order matters. The affine group is non-Abelian because the shift terms interact with different multipliers.
              </p>
            </div>
          )}

          {commSystem === "permutation" && (
            <div className="comm-paths">
              <div className="comm-path">
                <span className="path-label">P ∘ Q (Q first on ABCD):</span>
                <code>{permutationApply(pqComm, "ABCD")}</code>
                <span className="comm-perm-label">{permutationLabel(pqComm)}</span>
              </div>
              <div className="comm-path">
                <span className="path-label">Q ∘ P (P first on ABCD):</span>
                <code>{permutationApply(qpComm, "ABCD")}</code>
                <span className="comm-perm-label">{permutationLabel(qpComm)}</span>
              </div>
              <p className="comm-explanation">
                P = [2,1,3,4] and Q = [1,3,2,4]. Since {permutationApply(pqComm, "ABCD")} ≠ {permutationApply(qpComm, "ABCD")}, S₄ is non-Abelian.
              </p>
            </div>
          )}
        </div>

        {/* Synthesis Comparison: One Algebraic Framework, Three Realizations */}
        <div className="synthesis-comparison-block">
          <div className="synthesis-header">
            <span className="sys-pill lav">Comparative Matrix</span>
            <h3 className="synthesis-title">One Algebraic Framework, <em>Three Realizations</em></h3>
            <p className="synthesis-lead">
              A comprehensive cross-comparison of how abstract group properties manifest across the three classical transformation systems.
            </p>
          </div>

          <div className="synthesis-table-wrap">
            <table className="synthesis-table">
              <thead>
                <tr>
                  <th>Structural Dimension</th>
                  <th>Caesar Cipher <MathView math="(C_{26})" /></th>
                  <th>Affine Cipher <MathView math="(G_{\mathrm{aff}})" /></th>
                  <th>Permutations <MathView math="(S_4)" /></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Underlying Domain <MathView math="X" /></td>
                  <td>Single residues in <MathView math="\mathbb{Z}_{26}" /> (A–Z)</td>
                  <td>Single residues in <MathView math="\mathbb{Z}_{26}" /> (A–Z)</td>
                  <td>4-position index set <MathView math="\{1,2,3,4\}" /></td>
                </tr>
                <tr>
                  <td className="row-label">Group Order <MathView math="|G|" /></td>
                  <td><span className="matrix-val highlight-violet">26</span></td>
                  <td><span className="matrix-val highlight-blue">312</span> (<MathView math="12 \times 26" />)</td>
                  <td><span className="matrix-val highlight-silver">24</span> (<MathView math="4!" />)</td>
                </tr>
                <tr>
                  <td className="row-label">Group Structure</td>
                  <td>Cyclic group <MathView math="\cong \mathbb{Z}_{26}" /></td>
                  <td>Semidirect product <MathView math="\mathbb{Z}_{26} \rtimes \mathbb{Z}_{26}^\times" /></td>
                  <td>Full symmetric group <MathView math="S_4" /></td>
                </tr>
                <tr>
                  <td className="row-label">Commutativity</td>
                  <td><span className="matrix-status yes">Abelian (Commutative)</span></td>
                  <td><span className="matrix-status no">Non-Abelian (Non-commutative)</span></td>
                  <td><span className="matrix-status no">Non-Abelian (Non-commutative)</span></td>
                </tr>
                <tr>
                  <td className="row-label">Identity Element <MathView math="e" /></td>
                  <td><MathView math="E_0(x) = (x + 0)\bmod 26" /></td>
                  <td><MathView math="E_{1,0}(x) = (1{\cdot}x + 0)\bmod 26" /></td>
                  <td><MathView math="[1,2,3,4]" /> (identity mapping)</td>
                </tr>
                <tr>
                  <td className="row-label">Inverse Formula</td>
                  <td><MathView math="E_k^{-1} = E_{(26 - k)\bmod 26}" /></td>
                  <td><MathView math="E_{a,b}^{-1} = E_{a^{-1}, -a^{-1}b \bmod 26}" /></td>
                  <td><MathView math="\sigma^{-1}" /> (positional inverted array)</td>
                </tr>
                <tr>
                  <td className="row-label">Composition Law</td>
                  <td><MathView math="E_k \circ E_j = E_{(j + k)\bmod 26}" /></td>
                  <td><MathView math="E_{c,d} \circ E_{a,b} = E_{ca, cb+d}" /></td>
                  <td><MathView math="(\tau \circ \sigma)(x) = \tau(\sigma(x))" /></td>
                </tr>
                <tr>
                  <td className="row-label">Cryptanalysis Vulnerability</td>
                  <td>Single-letter frequency (shift pattern)</td>
                  <td>Linear congruence frequency attack</td>
                  <td>Block anagramming / position counting</td>
                </tr>
                <tr>
                  <td className="row-label">Cascade Encryption Effect</td>
                  <td>No security gain (<MathView math="E_a \circ E_b = E_{a+b}" />)</td>
                  <td>No security gain (<MathView math="E_1 \circ E_2 = E_3" />)</td>
                  <td>No security gain (<MathView math="\tau \circ \sigma \in S_4" />)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="synthesis-takeaways-deck">
            <div className="synthesis-insight-card">
              <div className="insight-badge">Algebraic Principle 01</div>
              <h4 className="insight-title">Why Group Closure Prevents Multi-Encryption Gains</h4>
              <p className="insight-text">
                In classical cryptography, applying multiple encryption rounds with different keys creates an illusion of security. Because <MathView math="(G, \circ)" /> satisfies the <strong>closure axiom</strong>, composing any chain of keys <MathView math="E_{k_n} \circ \dots \circ E_{k_1}" /> strictly evaluates to an existing single element <MathView math="E_{k^*} \in G" />. An attacker needs only to search the original keyspace size <MathView math="|G|" />, rendering multiple passes completely redundant.
              </p>
            </div>
            <div className="synthesis-insight-card">
              <div className="insight-badge">Algebraic Principle 02</div>
              <h4 className="insight-title">Reversibility vs. Cryptographic Security</h4>
              <p className="insight-text">
                Group theory guarantees the <em>necessary condition</em> for any cipher: exact reversibility without message entropy loss. However, it does not provide the <em>sufficient condition</em> for confidentiality. Modern block ciphers like AES intentionally avoid low-order closed algebraic groups across their complete round structure, incorporating non-linear S-boxes over Galois Fields <MathView math="\mathrm{GF}(2^8)" /> to resist algebraic attacks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION G — Summary Takeaway                                        */}
      {/* ================================================================== */}
      <section id="sec-takeaway" className="struc-section">
        <SectionEyebrow label="06 · Summary" />
        <h2 className="struc-h2">What group theory<br /><em>establishes — and what it doesn't.</em></h2>

        <div className="takeaway-grid">

          <div className="takeaway-col">
            <h3 className="takeaway-col-title establishes-title">Rigorously established</h3>
            <ul className="takeaway-list">
              <li>
                <strong>Exact reversibility.</strong> Every validly encrypted message has a unique, deterministic decryption — no information is lost.
              </li>
              <li>
                <strong>Closure under composition.</strong> Combining multiple valid keys never escapes the group's transformation space.
              </li>
              <li>
                <strong>Subgroup relationship.</strong> <MathView math="C_{26} \trianglelefteq G_{\mathrm{aff}}" /> — Caesar is a normal cyclic subgroup of the Affine group.
              </li>
              <li>
                <strong>Finite cycle bounds.</strong> By Lagrange's theorem, repeated application of any key eventually returns to the identity.
              </li>
            </ul>
          </div>

          <div className="takeaway-col">
            <h3 className="takeaway-col-title not-title">Not established</h3>
            <ul className="takeaway-list not-list">
              <li>
                <strong>Cryptographic security.</strong> Group closure means multi-encryption gives zero keyspace advantage: <MathView math="E_{k_2} \circ E_{k_1} = E_{k_3}" />.
              </li>
              <li>
                <strong>Resistance to analysis.</strong> Caesar and Affine preserve letter frequencies. S₄ preserves block frequencies. Both are trivially broken by frequency analysis.
              </li>
              <li>
                <strong>Large keyspaces.</strong> |C₂₆| = 26, |G_aff| = 312, |S₄| = 24. All exhaustively searchable in microseconds.
              </li>
            </ul>
          </div>

        </div>

        {/* ============================================================= */}
        {/* SECTION G — Summary Chain                                      */}
        {/* ============================================================= */}
        <div className="summary-chain">
          {[
            { n: "01", label: "Reversible Bijections", sub: "T : X → X, no collisions" },
            { n: "02", label: "Closure & Inverses", sub: "stay inside G; undo exactly" },
            { n: "03", label: "Four Axioms Satisfied", sub: "closure, assoc., identity, inverses" },
            { n: "04", label: "Algebraic Group (G, ∘)", sub: "C₂₆, G_aff, or S₄" },
          ].map((item, i, arr) => (
            <div key={i} className="chain-item-wrap">
              <div className="chain-item">
                <span className="chain-num">{item.n}</span>
                <strong className="chain-label">{item.label}</strong>
                <small className="chain-sub">{item.sub}</small>
              </div>
              {i < arr.length - 1 && <div className="chain-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION H — One Structure, Three Transformation Systems (new)      */}
      {/* ================================================================== */}
      <section id="sec-unified" className="struc-section">
        <SectionEyebrow label="07 · One Framework, Three Systems" />
        <h2 className="struc-h2">One algebraic structure.<br /><em>Three different realizations.</em></h2>
        <p className="struc-lead">
          Abstract algebra does not care whether you are shifting letters, scaling them
          by a modular multiplier, or scrambling their positions. If the transformation set
          satisfies four axioms, it is a group. Here is the complete argument.
        </p>

        {/* A — Each system is a set of transformations */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">A</span>
            <h3 className="unified-sub-title">Each system is a set of transformations</h3>
          </div>
          <p className="unified-sub-body">
            The elements of each system are not individual letters or numbers — they are
            <strong> transformation functions</strong> that act on a finite message space.
          </p>
          <div className="unified-trio">
            <div className="unified-trio-card violet-card">
              <span className="trio-label">Caesar</span>
              <p className="trio-body">26 shift functions <MathView math="E_k : \mathbb{Z}_{26} \to \mathbb{Z}_{26}" />, one per valid offset
                <MathView math="k \in \{0,1,\ldots,25\}" />.
              </p>
            </div>
            <div className="unified-trio-card blue-card">
              <span className="trio-label">Affine</span>
              <p className="trio-body">312 invertible affine maps
                <MathView math="E_{a,b} : \mathbb{Z}_{26} \to \mathbb{Z}_{26}" />, one per valid pair
                <MathView math="(a,b)" /> with <MathView math="\gcd(a,26)=1" />.
              </p>
            </div>
            <div className="unified-trio-card silver-card">
              <span className="trio-label">S₄</span>
              <p className="trio-body">24 bijective reorderings of four positions,
                <MathView math="\sigma : \{1,2,3,4\} \to \{1,2,3,4\}" />. Each permutation is itself the transformation key.
              </p>
            </div>
          </div>
        </div>

        {/* B — Each transformation is reversible */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">B</span>
            <h3 className="unified-sub-title">Each transformation is reversible</h3>
          </div>
          <p className="unified-sub-body">
            Every valid transformation is a <strong>bijection</strong> — a one-to-one, onto function
            on a finite domain. Because it is a bijection, it has a unique inverse.
          </p>
          <div className="unified-trio">
            <div className="unified-trio-card violet-card">
              <span className="trio-label">Caesar</span>
              <p className="trio-body">
                Shift by <MathView math="+k" /> is undone by shift by <MathView math="-k \bmod 26" />.
                No two distinct plaintext letters map to the same ciphertext letter.
              </p>
              <div className="trio-math"><MathView math="E_k^{-1} = E_{(26-k)\bmod 26}" display /></div>
            </div>
            <div className="unified-trio-card blue-card">
              <span className="trio-label">Affine</span>
              <p className="trio-body">
                The map <MathView math="E_{a,b}(x)=(ax+b)\bmod 26" /> is invertible exactly when <MathView math="\gcd(a,26)=1" />,
                ensuring <MathView math="a" /> has a multiplicative inverse mod 26.
              </p>
              <div className="trio-math"><MathView math="E_{a,b}^{-1}(y) = a^{-1}(y-b)\bmod 26" display /></div>
            </div>
            <div className="unified-trio-card silver-card">
              <span className="trio-label">S₄</span>
              <p className="trio-body">
                Every permutation <MathView math="\sigma" /> of four positions is by definition a bijection.
                Its inverse <MathView math="\sigma^{-1}" /> swaps source and destination indices.
              </p>
              <div className="trio-math"><MathView math="\sigma^{-1}(\sigma(x)) = x \;\forall x" display /></div>
            </div>
          </div>
        </div>

        {/* C — Composition is the shared operation */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">C</span>
            <h3 className="unified-sub-title">Composition is the shared binary operation</h3>
          </div>
          <p className="unified-sub-body">
            Two transformations can be <strong>composed</strong>: apply one, then apply the other.
            The convention throughout this project is that the <em>rightmost function acts first</em>:
            <MathView math="(T_2 \circ T_1)(x) = T_2(T_1(x))" />.
          </p>
          <div className="unified-comp-grid">
            <div className="comp-rule-card">
              <span className="comp-rule-label">Caesar composition</span>
              <div className="comp-rule-math">
                <MathView math="E_{k_2} \circ E_{k_1} = E_{(k_1+k_2)\bmod 26}" display />
              </div>
              <p className="comp-rule-note">Composing two shifts produces a shift — the composed key is simply the sum mod 26.</p>
            </div>
            <div className="comp-rule-card">
              <span className="comp-rule-label">Affine composition</span>
              <div className="comp-rule-math">
                <MathView math="E_{a,b} \circ E_{c,d} = E_{ac \bmod 26,\; (ad+b)\bmod 26}" display />
              </div>
              <p className="comp-rule-note">The outer multiplier scales the inner shift. Order matters — this group is non-Abelian.</p>
            </div>
            <div className="comp-rule-card">
              <span className="comp-rule-label">S₄ composition</span>
              <div className="comp-rule-math">
                <MathView math="(\tau \circ \sigma)(i) = \tau(\sigma(i))" display />
              </div>
              <p className="comp-rule-note">Composing two valid permutations of four positions produces another valid permutation in S₄.</p>
            </div>
          </div>
        </div>

        {/* D — The four group axioms */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">D</span>
            <h3 className="unified-sub-title">The four group axioms — why they hold</h3>
          </div>
          <p className="unified-sub-body">
            A set of transformations with a binary operation forms an algebraic <strong>group</strong> exactly
            when the following four properties hold. All three systems satisfy each one.
          </p>
          <div className="axiom-explanation-grid">
            <div className="axiom-exp-card">
              <span className="axiom-exp-num">01</span>
              <h4 className="axiom-exp-name">Closure</h4>
              <p className="axiom-exp-body">
                Composing two valid transformations produces another valid transformation
                in the same system. For Caesar: <MathView math="E_a \circ E_b = E_{(a+b)\bmod 26} \in C_{26}" />.
                For Affine: the product of two coprime-to-26 multipliers is still coprime to 26.
                For S₄: composing two bijections on {"{1,2,3,4}"} gives another bijection on {"{1,2,3,4}"}.
              </p>
              <div className="axiom-exp-consequence">
                <strong>Cryptographic consequence:</strong> Multi-encryption with classical keys collapses
                into a single equivalent key — no keyspace expansion is possible.
              </div>
            </div>
            <div className="axiom-exp-card">
              <span className="axiom-exp-num">02</span>
              <h4 className="axiom-exp-name">Associativity</h4>
              <p className="axiom-exp-body">
                The grouping of sequential transformations does not change the outcome.
                <MathView math="(T_3 \circ T_2) \circ T_1 = T_3 \circ (T_2 \circ T_1)" /> for all three systems.
                This is inherited from function composition itself — no separate proof is needed for each system.
              </p>
              <div className="axiom-exp-consequence">
                <strong>Cryptographic consequence:</strong> Decryption pipelines can reorganise intermediate
                steps without changing the result.
              </div>
            </div>
            <div className="axiom-exp-card">
              <span className="axiom-exp-num">03</span>
              <h4 className="axiom-exp-name">Identity</h4>
              <p className="axiom-exp-body">
                A transformation that leaves every input unchanged exists in each system.
                Caesar: <MathView math="E_0(x) = x" />. Affine: <MathView math="E_{1,0}(x) = x" />.
                S₄: the identity permutation <MathView math="[1,2,3,4]" /> leaves all positions unchanged.
              </p>
              <div className="axiom-exp-consequence">
                <strong>Cryptographic consequence:</strong> The identity is the algebraic baseline
                against which <MathView math="T^{-1} \circ T = e" /> is verified.
              </div>
            </div>
            <div className="axiom-exp-card">
              <span className="axiom-exp-num">04</span>
              <h4 className="axiom-exp-name">Inverses</h4>
              <p className="axiom-exp-body">
                Every transformation has a unique inverse in the same system.
                Caesar: subtract the shift mod 26.
                Affine: the inverse exists because <MathView math="\gcd(a,26)=1" /> guarantees a
                multiplicative inverse for <MathView math="a" /> mod 26, making <MathView math="E_{a,b}^{-1}" /> well-defined.
                S₄: every bijection on a finite set has an inverse bijection.
              </p>
              <div className="axiom-exp-consequence">
                <strong>Cryptographic consequence:</strong> Decryption is guaranteed without information loss.
                For Affine, this is why <MathView math="\gcd(a,26)=1" /> is mandatory — without it, no inverse exists.
              </div>
            </div>
          </div>
        </div>

        {/* E — Important differences */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">E</span>
            <h3 className="unified-sub-title">Important differences between the systems</h3>
          </div>
          <p className="unified-sub-body">
            Sharing a group structure does not make the three systems identical.
            Their domains, orders, internal structures, and commutativity all differ.
          </p>
          <div className="diff-comparison-cards">
            <div className="diff-comp-card">
              <span className="diff-comp-tag violet">Caesar C₂₆</span>
              <ul className="diff-comp-list">
                <li><strong>Order:</strong> 26 (one element per shift value 0–25)</li>
                <li><strong>Structure:</strong> Cyclic group, isomorphic to <MathView math="(\mathbb{Z}_{26},+)" /></li>
                <li><strong>Commutativity:</strong> Strictly <em>Abelian</em> — shifts always commute</li>
                <li><strong>Domain:</strong> Individual letter residues in <MathView math="\mathbb{Z}_{26}" /></li>
              </ul>
            </div>
            <div className="diff-comp-card">
              <span className="diff-comp-tag blue">Affine G_aff</span>
              <ul className="diff-comp-list">
                <li><strong>Order:</strong> 312 (12 valid multipliers × 26 shifts)</li>
                <li><strong>Structure:</strong> Semidirect product <MathView math="\mathbb{Z}_{26} \rtimes \mathbb{Z}_{26}^\times" /></li>
                <li><strong>Commutativity:</strong> <em>Non-Abelian</em> in general — order of composition matters</li>
                <li><strong>Domain:</strong> Individual letter residues in <MathView math="\mathbb{Z}_{26}" /></li>
              </ul>
            </div>
            <div className="diff-comp-card">
              <span className="diff-comp-tag silver">Permutations S₄</span>
              <ul className="diff-comp-list">
                <li><strong>Order:</strong> 24 (= 4! permutations of four positions)</li>
                <li><strong>Structure:</strong> Full symmetric group on four elements</li>
                <li><strong>Commutativity:</strong> <em>Non-Abelian</em> — transpositions generally do not commute</li>
                <li><strong>Domain:</strong> 4-position index set <MathView math="\{1,2,3,4\}" /></li>
              </ul>
            </div>
          </div>
        </div>

        {/* F — What the comparison teaches */}
        <div className="unified-subsection">
          <div className="unified-sub-header">
            <span className="unified-sub-tag">F</span>
            <h3 className="unified-sub-title">What the comparison teaches us</h3>
          </div>
          <p className="unified-sub-body">
            By placing all three systems inside the same algebraic framework, abstract algebra lets
            us reason about their common and distinct properties through a single set of concepts.
          </p>
          <div className="unified-teaching-grid">
            <div className="teaching-point">
              <span className="teaching-icon">◈</span>
              <div>
                <strong className="teaching-title">Verify reversibility structurally</strong>
                <p className="teaching-body">
                  Instead of testing every possible plaintext individually, we prove that the transformation
                  set satisfies the inverse axiom — and reversibility follows for the entire system at once.
                </p>
              </div>
            </div>
            <div className="teaching-point">
              <span className="teaching-icon">◈</span>
              <div>
                <strong className="teaching-title">Reason about compositions without exhaustive testing</strong>
                <p className="teaching-body">
                  The closure and associativity axioms let us determine how chained transformations
                  behave without inspecting character-level output for every key combination.
                </p>
              </div>
            </div>
            <div className="teaching-point">
              <span className="teaching-icon">◈</span>
              <div>
                <strong className="teaching-title">Identify identities and inverses algebraically</strong>
                <p className="teaching-body">
                  Group theory gives us formulas for the identity and inverse of each system.
                  For Affine, the inverse formula <MathView math="E_{a^{-1},\,-a^{-1}b}" /> is derived directly
                  from the group axioms, not by trial and error.
                </p>
              </div>
            </div>
            <div className="teaching-point">
              <span className="teaching-icon">◈</span>
              <div>
                <strong className="teaching-title">Compare group order and commutativity</strong>
                <p className="teaching-body">
                  <MathView math="|C_{26}| = 26" />, <MathView math="|G_{\mathrm{aff}}| = 312" />, <MathView math="|S_4| = 24" />.
                  Different finite orders immediately rule out isomorphism between the systems,
                  and we can determine from commutativity whether key order matters without computing examples.
                </p>
              </div>
            </div>
            <div className="teaching-point">
              <span className="teaching-icon">◈</span>
              <div>
                <strong className="teaching-title">Build shared verification procedures</strong>
                <p className="teaching-body">
                  The mathematical engine in this project uses the same round-trip test
                  <MathView math="T^{-1}(T(x)) = x" /> for all three systems because the inverse axiom
                  guarantees it holds universally across every group element.
                </p>
              </div>
            </div>
          </div>

          {/* Security limitation — prominent */}
          <div className="unified-security-notice">
            <span className="warn-icon">⚠</span>
            <div className="warn-content">
              <strong>Crucial limitation: group structure does not imply modern cryptographic security.</strong>
              <p>
                These are classical mathematical transformations studied for their algebraic structure,
                not for confidentiality. Group closure means multi-encryption collapses into a single
                equivalent key with zero keyspace gain. Caesar and Affine preserve letter frequencies;
                S₄ preserves block-letter frequencies. All three are trivially broken by frequency analysis.
                Modern ciphers (e.g., AES) deliberately avoid closed low-order algebraic groups across
                their complete round structure, using non-linear operations over
                <MathView math="\mathrm{GF}(2^8)" /> to resist algebraic attacks.
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
