import { useState, useMemo } from "react";
import { MathView } from "./MathView";
import {
  ALPHABET,
  MODULUS,
  AFFINE_UNITS,
  S4,
  gcd,
  modularInverse,
  caesarValue,
  affineValue,
  affineCompose,
  affineInverse,
  permutationApply,
  permutationCompose,
  permutationInverse,
  permutationLabel,
  type AffineKey,
  type Permutation,
} from "../math/engine";

type SectionTab = "overview" | "reversible" | "axioms" | "composition" | "compare" | "limits";

export function CommonAlgebraicStructure() {
  const [activeSection, setActiveSection] = useState<SectionTab>("overview");

  // SECTION A: Interactive demo state for three panels
  const [sectionAView, setSectionAView] = useState<"all" | "caesar" | "affine" | "permutation">("all");
  const [caesarShiftA, setCaesarShiftA] = useState(3);
  const [caesarFocusLetterA, setCaesarFocusLetterA] = useState(23); // 'X' (23) -> wraps around with shift 3
  const [affineInputA, setAffineInputA] = useState("M");
  const [affineMultiplierA, setAffineMultiplierA] = useState(5);
  const [affineShiftA, setAffineShiftA] = useState(8);
  const [permKeyIndexA, setPermKeyIndexA] = useState(13); // [3, 1, 4, 2]
  const [permBlockA, setPermBlockA] = useState("ABCD");

  // SECTION B: Reversibility & Bijectivity mode
  const [bijectiveMode, setBijectiveMode] = useState<"bijective" | "non-bijective">("bijective");
  const [revCaesarShift, setRevCaesarShift] = useState(5);
  const [revCaesarChar, setRevCaesarChar] = useState("G");

  // SECTION C: Axioms state
  const [axiomSystem, setAxiomSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [expandedAxiom, setExpandedAxiom] = useState<number | null>(null);

  // SECTION D: Interactive composition visualizer state
  const [demoSystem, setDemoSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [caesarK1, setCaesarK1] = useState(3);
  const [caesarK2, setCaesarK2] = useState(5);
  const [caesarInput, setCaesarInput] = useState("H");

  const [affineA1, setAffineA1] = useState(3);
  const [affineB1, setAffineB1] = useState(4);
  const [affineA2, setAffineA2] = useState(5);
  const [affineB2, setAffineB2] = useState(7);
  const [affineInput, setAffineInput] = useState("M");

  const [permIdx1, setPermIdx1] = useState(2); // e.g. [1, 3, 2, 4]
  const [permIdx2, setPermIdx2] = useState(6); // e.g. [2, 1, 3, 4]
  const [permInput, setPermInput] = useState("MATH");

  // Section E: Commutativity demo system
  const [commSystem, setCommSystem] = useState<"caesar" | "affine" | "permutation">("affine");

  // ---------------------------------------------------------------------------
  // Calculations for Section A
  // ---------------------------------------------------------------------------
  // Caesar probe calculations
  const caesarProbeVal = caesarFocusLetterA;
  const caesarProbeChar = ALPHABET[caesarProbeVal];
  const caesarProbeShiftedVal = (caesarProbeVal + caesarShiftA) % 26;
  const caesarProbeShiftedChar = ALPHABET[caesarProbeShiftedVal];
  const caesarWrapsAround = caesarProbeVal + caesarShiftA >= 26;

  // Affine pipeline calculations
  const affineValA = useMemo(() => {
    const char = affineInputA.toUpperCase().slice(0, 1) || "A";
    const x = char.charCodeAt(0) - 65;
    return x >= 0 && x < 26 ? x : 0;
  }, [affineInputA]);

  const affineGcdVal = useMemo(() => gcd(affineMultiplierA, 26), [affineMultiplierA]);
  const isAffineValid = affineGcdVal === 1;

  const affineStepMultiply = affineMultiplierA * affineValA;
  const affineStepAdd = affineStepMultiply + affineShiftA;
  const affineStepMod = ((affineStepAdd % 26) + 26) % 26;
  const affineOutputCharA = ALPHABET[affineStepMod];
  const affineInvMult = useMemo(() => {
    if (!isAffineValid) return null;
    try {
      return modularInverse(affineMultiplierA, 26);
    } catch {
      return null;
    }
  }, [affineMultiplierA, isAffineValid]);

  // Permutation calculations for S4
  const permKeyA = S4[permKeyIndexA] ?? S4[13]; // [2, 0, 3, 1] zero-indexed
  const permCleanBlockA = useMemo(() => {
    const clean = (permBlockA.toUpperCase().replace(/[^A-Z]/g, "") + "ABCD").slice(0, 4);
    return clean;
  }, [permBlockA]);
  const permOutputBlockA = useMemo(() => {
    return permutationApply(permKeyA, permCleanBlockA);
  }, [permKeyA, permCleanBlockA]);

  // ---------------------------------------------------------------------------
  // Calculations for Section B: Reversible vs Non-bijective
  // ---------------------------------------------------------------------------
  const revInputVal = revCaesarChar.charCodeAt(0) - 65;
  const revEncryptedVal = caesarValue(revInputVal, revCaesarShift);
  const revEncryptedChar = ALPHABET[revEncryptedVal];
  const revDecryptedVal = caesarValue(revEncryptedVal, -revCaesarShift);
  const revDecryptedChar = ALPHABET[revDecryptedVal];

  // Non-bijective example: f(x) = (2x) mod 26 (multiplier 2 has gcd(2, 26) = 2 != 1)
  const nonBijectiveCollisions = useMemo(() => {
    return [
      { plainChar: "A", val: 0, calc: "(2 × 0) mod 26 = 0", cipherChar: "A" },
      { plainChar: "N", val: 13, calc: "(2 × 13) mod 26 = 26 mod 26 = 0", cipherChar: "A" },
      { plainChar: "B", val: 1, calc: "(2 × 1) mod 26 = 2", cipherChar: "C" },
      { plainChar: "O", val: 14, calc: "(2 × 14) mod 26 = 28 mod 26 = 2", cipherChar: "C" },
    ];
  }, []);

  // ---------------------------------------------------------------------------
  // Calculations for Section D: Interactive Composition
  // ---------------------------------------------------------------------------
  // Caesar
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

  // Affine
  const affineVal = useMemo(() => {
    const char = affineInput.toUpperCase().slice(0, 1) || "A";
    const x = char.charCodeAt(0) - 65;
    return x >= 0 && x < 26 ? x : 0;
  }, [affineInput]);
  const affineChar = ALPHABET[affineVal];
  const key1 = useMemo<AffineKey>(() => ({ a: affineA1, b: affineB1 }), [affineA1, affineB1]);
  const key2 = useMemo<AffineKey>(() => ({ a: affineA2, b: affineB2 }), [affineA2, affineB2]);
  const affineStep1Val = affineValue(affineVal, key1);
  const affineStep1Char = ALPHABET[affineStep1Val];
  const affineStep2Val = affineValue(affineStep1Val, key2);
  const affineStep2Char = ALPHABET[affineStep2Val];
  // Note: T2 o T1 has key2 applied second, key1 applied first
  // affineCompose(first, second) computes first o second (second first, first second)
  const affineCompKey = useMemo(
    () => affineCompose({ a: affineA2, b: affineB2 }, { a: affineA1, b: affineB1 }),
    [affineA1, affineB1, affineA2, affineB2]
  );
  const affineDirectVal = affineValue(affineVal, affineCompKey);
  const affineDirectChar = ALPHABET[affineDirectVal];
  const affineInvKey = useMemo(() => affineInverse(affineCompKey), [affineCompKey]);
  const affineRecoveredVal = affineValue(affineStep2Val, affineInvKey);
  const affineRecoveredChar = ALPHABET[affineRecoveredVal];

  // Permutation
  const permBlock = useMemo(() => {
    const raw = permInput.toUpperCase().replace(/[^A-Z]/g, "");
    return (raw + "WXYZ").slice(0, 4);
  }, [permInput]);
  const p1: Permutation = S4[permIdx1] ?? S4[0];
  const p2: Permutation = S4[permIdx2] ?? S4[0];
  const permStep1Block = permutationApply(p1, permBlock);
  const permStep2Block = permutationApply(p2, permStep1Block);
  // permutationCompose(p2, p1) calculates p2 o p1 (p1 first, p2 second)
  const permComp = useMemo(() => permutationCompose(p2, p1), [p2, p1]);
  const permDirectBlock = permutationApply(permComp, permBlock);
  const permInv = useMemo(() => permutationInverse(permComp), [permComp]);
  const permRecoveredBlock = permutationApply(permInv, permStep2Block);

  // ---------------------------------------------------------------------------
  // Section E: Commutativity calculation examples
  // ---------------------------------------------------------------------------
  // Affine preset: T1 = (3, 2), T2 = (5, 7)
  const affTest1: AffineKey = { a: 3, b: 2 };
  const affTest2: AffineKey = { a: 5, b: 7 };
  const aff21 = affineCompose(affTest2, affTest1); // T2 o T1 = (15, 17)
  const aff12 = affineCompose(affTest1, affTest2); // T1 o T2 = (15, 23)

  // S4 preset: P = [2, 1, 3, 4] -> (1, 0, 2, 3), Q = [1, 3, 2, 4] -> (0, 2, 1, 3)
  const pPreset: Permutation = [1, 0, 2, 3];
  const qPreset: Permutation = [0, 2, 1, 3];
  const pqPreset = permutationCompose(pPreset, qPreset); // P o Q (Q first) -> CABD
  const qpPreset = permutationCompose(qPreset, pPreset); // Q o P (P first) -> BCAD

  return (
    <div className="page-wrap structure-page">
      {/* Page Header */}
      <div className="page-intro">
        <p className="eyebrow">04 / THE ALGEBRAIC STRUCTURES</p>
        <h1>
          Reversibility through
          <br />
          <em>algebraic groups.</em>
        </h1>
        <p>
          Transformations, bijections, and the four group axioms. Show the mathematics first,
          interact with the transformations second, and inspect deeper definitions on demand.
        </p>
      </div>

      {/* Visual Navigation Tabs */}
      <nav className="structure-nav-strip" aria-label="Visual learning sections">
        <button
          className={activeSection === "overview" ? "active" : ""}
          onClick={() => setActiveSection("overview")}
        >
          <span>01</span> Three Systems
        </button>
        <button
          className={activeSection === "reversible" ? "active" : ""}
          onClick={() => setActiveSection("reversible")}
        >
          <span>02</span> Reversibility
        </button>
        <button
          className={activeSection === "axioms" ? "active" : ""}
          onClick={() => setActiveSection("axioms")}
        >
          <span>03</span> Group Axioms
        </button>
        <button
          className={activeSection === "composition" ? "active" : ""}
          onClick={() => setActiveSection("composition")}
        >
          <span>04</span> Composition Lab
        </button>
        <button
          className={activeSection === "compare" ? "active" : ""}
          onClick={() => setActiveSection("compare")}
        >
          <span>05</span> Group Comparison
        </button>
        <button
          className={activeSection === "limits" ? "active" : ""}
          onClick={() => setActiveSection("limits")}
        >
          <span>06</span> Concept Map & Limits
        </button>
      </nav>

      {/* ===================================================================== */}
      {/* SECTION A: Three Systems, One Mathematical Idea                        */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-overview">
        <div className="card-kicker">SECTION A ◈ THREE SYSTEMS, ONE MATHEMATICAL IDEA</div>
        <h2 className="section-title">The Three Systems at a Glance</h2>
        <p className="lead-paragraph">
          Three classical cryptographic transformation systems operating over distinct mathematical domains.
          Behind their unique mechanics lies the exact same core concept: sets of invertible bijections that satisfy the four axioms of a mathematical group.
        </p>

        {/* Conceptual Architecture Bridge */}
        <div className="arch-bridge-container">
          <div className="arch-bridge-step">
            <div className="arch-step-badge">STEP 1</div>
            <div className="arch-step-title">Three Concrete Systems</div>
            <div className="arch-step-desc">
              Caesar <MathView math="(\mathbb{Z}_{26}, +)" />, Affine <MathView math="\mathrm{Aff}(\mathbb{Z}_{26})" />, and <MathView math="S_4" /> position permutations.
            </div>
          </div>
          <div className="arch-bridge-arrow">⟶</div>
          <div className="arch-bridge-step">
            <div className="arch-step-badge">STEP 2</div>
            <div className="arch-step-title">Bijections & Composition</div>
            <div className="arch-step-desc">
              Every key is an invertible map <MathView math="T : X \to X" />. Applying keys sequentially defines composition <MathView math="T_2 \circ T_1" />.
            </div>
          </div>
          <div className="arch-bridge-arrow">⟶</div>
          <div className="arch-bridge-step highlighted">
            <div className="arch-step-badge">STEP 3</div>
            <div className="arch-step-title">Universal Group Axioms</div>
            <div className="arch-step-desc">
              Closure, Associativity, Identity <MathView math="e" />, and Inverses <MathView math="T^{-1}" /> form algebraic groups <MathView math="(G, \circ)" />.
            </div>
          </div>
        </div>

        {/* View Mode Toolbar */}
        <div className="section-a-toolbar">
          <div className="view-mode-label">Display Mode:</div>
          <div className="view-mode-pills" role="tablist">
            <button
              type="button"
              className={`view-pill ${sectionAView === "all" ? "active" : ""}`}
              onClick={() => setSectionAView("all")}
            >
              ⊞ Comparative View (All 3)
            </button>
            <button
              type="button"
              className={`view-pill ${sectionAView === "caesar" ? "active" : ""}`}
              onClick={() => setSectionAView("caesar")}
            >
              01 Caesar (C₂₆)
            </button>
            <button
              type="button"
              className={`view-pill ${sectionAView === "affine" ? "active" : ""}`}
              onClick={() => setSectionAView("affine")}
            >
              02 Affine (G_aff)
            </button>
            <button
              type="button"
              className={`view-pill ${sectionAView === "permutation" ? "active" : ""}`}
              onClick={() => setSectionAView("permutation")}
            >
              03 Permutations (S₄)
            </button>
          </div>
        </div>

        <div className={`three-systems-grid ${sectionAView !== "all" ? "single-system-active" : ""}`}>
          {/* ================================================================= */}
          {/* Panel 1: Caesar Cipher                                            */}
          {/* ================================================================= */}
          {(sectionAView === "all" || sectionAView === "caesar") && (
            <div className={`system-visual-panel caesar-panel ${sectionAView === "caesar" ? "expanded-panel" : ""}`}>
              <div className="panel-badge-top">
                <span className="system-pill violet">SYSTEM 01</span>
                <span className="domain-pill">Domain: <MathView math="\mathbb{Z}_{26}" /></span>
                <span className="order-tag">|C₂₆| = 26</span>
              </div>
              <div className="panel-header-content">
                <h3>Caesar Cipher</h3>
                <p className="panel-desc">Uniform cyclic translation along the 26-residue ring <MathView math="\mathbb{Z}_{26}" />.</p>
              </div>

              <div className="panel-workbench">
                {/* Controls Bar */}
                <div className="panel-controls-bar">
                  <div className="control-group">
                    <label htmlFor="caesar-shift-slider">
                      Shift Key <MathView math="k" />: <strong>{caesarShiftA}</strong>
                    </label>
                    <div className="slider-with-presets">
                      <input
                        id="caesar-shift-slider"
                        type="range"
                        min={0}
                        max={25}
                        value={caesarShiftA}
                        onChange={(e) => setCaesarShiftA(Number(e.target.value))}
                        className="caesar-slider"
                      />
                      <div className="preset-buttons">
                        <button
                          type="button"
                          className={`preset-btn ${caesarShiftA === 3 ? "active" : ""}`}
                          onClick={() => setCaesarShiftA(3)}
                        >
                          k=3 (Classical)
                        </button>
                        <button
                          type="button"
                          className={`preset-btn ${caesarShiftA === 13 ? "active" : ""}`}
                          onClick={() => setCaesarShiftA(13)}
                        >
                          k=13 (ROT13)
                        </button>
                        <button
                          type="button"
                          className={`preset-btn ${caesarShiftA === 25 ? "active" : ""}`}
                          onClick={() => setCaesarShiftA(25)}
                        >
                          k=25 (-1 mod 26)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dual-Row Alphabet Instrument */}
                <div className="alphabet-dual-track">
                  <div className="track-section-header">
                    <span>ROTATIONAL ALPHABET MAPPING</span>
                    <span className="track-sub-hint">Click any letter to trace wraparound</span>
                  </div>

                  <div className="dual-row-scroll-container">
                    <div className="dual-row-grid">
                      {/* Plaintext row */}
                      <div className="alphabet-row plain-row">
                        <div className="row-head">Plain <MathView math="x" />:</div>
                        <div className="cells-container">
                          {ALPHABET.split("").map((ch, idx) => {
                            const isWrap = idx + caesarShiftA >= 26;
                            const isProbe = idx === caesarFocusLetterA;
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`alphabet-cell ${isProbe ? "active-probe" : ""} ${isWrap ? "wrap-cell" : ""}`}
                                onClick={() => setCaesarFocusLetterA(idx)}
                                title={`x=${idx} (${ch}), E(${idx}) = (${idx} + ${caesarShiftA}) mod 26 = ${(idx + caesarShiftA) % 26} (${ALPHABET[(idx + caesarShiftA) % 26]})`}
                              >
                                <span className="cell-char">{ch}</span>
                                <span className="cell-num">{idx}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Directional Connectors */}
                      <div className="alphabet-connector-row">
                        <div className="row-head">
                          <span className="shift-indicator-badge">+{caesarShiftA}</span>
                        </div>
                        <div className="cells-container">
                          {ALPHABET.split("").map((_, idx) => {
                            const isWrap = idx + caesarShiftA >= 26;
                            const isProbe = idx === caesarFocusLetterA;
                            return (
                              <div
                                key={idx}
                                className={`connector-item ${isProbe ? "active-probe" : ""} ${isWrap ? "wrap-connector" : ""}`}
                              >
                                ↓
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ciphertext row */}
                      <div className="alphabet-row cipher-row">
                        <div className="row-head">Cipher <MathView math="E(x)" />:</div>
                        <div className="cells-container">
                          {ALPHABET.split("").map((_, idx) => {
                            const cipherVal = (idx + caesarShiftA) % 26;
                            const cipherChar = ALPHABET[cipherVal];
                            const isWrap = idx + caesarShiftA >= 26;
                            const isProbe = idx === caesarFocusLetterA;
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`alphabet-cell cipher-cell ${isProbe ? "active-probe" : ""} ${isWrap ? "wrap-cell" : ""}`}
                                onClick={() => setCaesarFocusLetterA(idx)}
                              >
                                <span className="cell-char">{cipherChar}</span>
                                <span className="cell-num">{cipherVal}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wraparound Callout & Active Probe */}
                  <div className="wraparound-integrated-callout">
                    <div className="wrap-zone-badge">
                      <span className="wrap-tag">WRAPAROUND ZONE</span>
                      <span className="wrap-desc">
                        Letters with <MathView math={`x + ${caesarShiftA} \\ge 26`} /> wrap past Z back to A:
                      </span>
                      <div className="wrap-examples-inline">
                        {caesarShiftA > 0 ? (
                          <span>
                            {ALPHABET[26 - Math.min(caesarShiftA, 3)]} ({26 - Math.min(caesarShiftA, 3)}) ⟶ {ALPHABET[(26 - Math.min(caesarShiftA, 3) + caesarShiftA) % 26]} ({(26 - Math.min(caesarShiftA, 3) + caesarShiftA) % 26}), ..., Z (25) ⟶ {ALPHABET[(25 + caesarShiftA) % 26]} ({(25 + caesarShiftA) % 26})
                          </span>
                        ) : (
                          <span>Shift is 0 (Identity mapping e; no wraparound)</span>
                        )}
                      </div>
                    </div>

                    <div className="probe-result-pill">
                      <span className="probe-title">Active Probe:</span>
                      <code>
                        '{caesarProbeChar}' ({caesarProbeVal}) + {caesarShiftA} = {caesarProbeVal + caesarShiftA}
                        {caesarWrapsAround ? ` ≡ ${caesarProbeShiftedVal}` : ""} mod 26 ⟶ '{caesarProbeShiftedChar}'
                      </code>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula */}
                <div className="panel-formula-card">
                  <div className="formula-label">MATHEMATICAL DEFINITION</div>
                  <MathView math="E_k(x) = (x + k) \bmod 26" display />
                  <div className="formula-eval">
                    <MathView
                      math={`E_{${caesarShiftA}}(${caesarProbeVal}) = (${caesarProbeVal} + ${caesarShiftA}) \\bmod 26 = ${caesarProbeShiftedVal} \\quad (\\text{'${caesarProbeChar}'} \\mapsto \\text{'${caesarProbeShiftedChar}'})`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* Panel 2: Affine Cipher                                            */}
          {/* ================================================================= */}
          {(sectionAView === "all" || sectionAView === "affine") && (
            <div className={`system-visual-panel affine-panel ${sectionAView === "affine" ? "expanded-panel" : ""}`}>
              <div className="panel-badge-top">
                <span className="system-pill blue">SYSTEM 02</span>
                <span className="domain-pill">Domain: <MathView math="\mathbb{Z}_{26}" /></span>
                <span className="order-tag">|G_aff| = 312</span>
              </div>
              <div className="panel-header-content">
                <h3>Affine Cipher</h3>
                <p className="panel-desc">A modular linear transformation combining scaling and translation.</p>
              </div>

              <div className="panel-workbench">
                {/* Controls Bar */}
                <div className="affine-controls-grid">
                  <div className="control-item">
                    <label htmlFor="affine-mult-select">
                      Multiplier <MathView math="a" /> (<MathView math="\gcd(a, 26)=1" />):
                    </label>
                    <select
                      id="affine-mult-select"
                      value={affineMultiplierA}
                      onChange={(e) => setAffineMultiplierA(Number(e.target.value))}
                      className="affine-select"
                    >
                      {AFFINE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          a = {u} (coprime)
                        </option>
                      ))}
                      <option value={2}>a = 2 (INVALID: gcd=2)</option>
                      <option value={4}>a = 4 (INVALID: gcd=2)</option>
                      <option value={13}>a = 13 (INVALID: gcd=13)</option>
                    </select>
                  </div>

                  <div className="control-item">
                    <label htmlFor="affine-shift-slider">
                      Shift <MathView math="b" />: <strong>{affineShiftA}</strong>
                    </label>
                    <input
                      id="affine-shift-slider"
                      type="range"
                      min={0}
                      max={25}
                      value={affineShiftA}
                      onChange={(e) => setAffineShiftA(Number(e.target.value))}
                      className="affine-slider"
                    />
                  </div>

                  <div className="control-item">
                    <label htmlFor="affine-input-select">Input Symbol <MathView math="x" />:</label>
                    <select
                      id="affine-input-select"
                      value={affineInputA}
                      onChange={(e) => setAffineInputA(e.target.value)}
                      className="affine-select"
                    >
                      {["A", "C", "E", "H", "M", "Q", "T", "X", "Z"].map((c) => (
                        <option key={c} value={c}>
                          {c} (x = {c.charCodeAt(0) - 65})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Validation Status */}
                {!isAffineValid ? (
                  <div className="affine-validation-error" role="alert">
                    <div className="error-title">
                      ⚠️ Invalid Key Multiplier: <MathView math={`\\gcd(${affineMultiplierA}, 26) = ${affineGcdVal} \\ne 1`} />
                    </div>
                    <p className="error-desc">
                      Because <MathView math={`${affineMultiplierA}`} /> shares factor <MathView math={`${affineGcdVal}`} /> with 26, the mapping is non-injective (causes collisions). No modular inverse exists, so decryption is mathematically impossible.
                    </p>
                  </div>
                ) : (
                  <div className="affine-validation-success">
                    <span className="success-icon">✓</span>
                    <span>
                      Valid key: <MathView math={`\\gcd(${affineMultiplierA}, 26) = 1`} />. Modular inverse <MathView math={`a^{-1} = ${affineInvMult ?? 'none'} \\pmod{26}`} /> exists.
                    </span>
                  </div>
                )}

                {/* Horizontally Aligned Precision Calculation Pipeline */}
                <div className="affine-pipeline-card">
                  <div className="pipeline-header">
                    <span>CALCULATION PIPELINE</span>
                    <code>(a · x + b) mod 26</code>
                  </div>

                  <div className="pipeline-horizontal-track">
                    {/* Node 1: Input Symbol */}
                    <div className="pipe-node">
                      <div className="pipe-node-label">01 INPUT</div>
                      <div className="pipe-node-box">
                        <strong className="pipe-char">{affineInputA}</strong>
                        <span className="pipe-val">x = {affineValA}</span>
                      </div>
                      <div className="pipe-subtext">Original residue</div>
                    </div>

                    {/* Arrow 1: Multiply */}
                    <div className="pipe-arrow-connector">
                      <span className="op-tag">× {affineMultiplierA}</span>
                      <span className="arrow-glyph">⟶</span>
                    </div>

                    {/* Node 2: Product */}
                    <div className="pipe-node">
                      <div className="pipe-node-label">02 MULTIPLY</div>
                      <div className="pipe-node-box">
                        <strong className="pipe-num">{affineStepMultiply}</strong>
                        <span className="pipe-val">{affineMultiplierA} · {affineValA}</span>
                      </div>
                      <div className="pipe-subtext">Scaled residue</div>
                    </div>

                    {/* Arrow 2: Add */}
                    <div className="pipe-arrow-connector">
                      <span className="op-tag">+ {affineShiftA}</span>
                      <span className="arrow-glyph">⟶</span>
                    </div>

                    {/* Node 3: Sum */}
                    <div className="pipe-node">
                      <div className="pipe-node-label">03 ADD</div>
                      <div className="pipe-node-box">
                        <strong className="pipe-num">{affineStepAdd}</strong>
                        <span className="pipe-val">{affineStepMultiply} + {affineShiftA}</span>
                      </div>
                      <div className="pipe-subtext">Shifted sum</div>
                    </div>

                    {/* Arrow 3: Modulo */}
                    <div className="pipe-arrow-connector">
                      <span className="op-tag">mod 26</span>
                      <span className="arrow-glyph">⟶</span>
                    </div>

                    {/* Node 4: Modulo Residue */}
                    <div className="pipe-node">
                      <div className="pipe-node-label">04 MODULO</div>
                      <div className="pipe-node-box">
                        <strong className="pipe-num">{affineStepMod}</strong>
                        <span className="pipe-val">{affineStepAdd} % 26</span>
                      </div>
                      <div className="pipe-subtext">Cyclic reduction</div>
                    </div>

                    {/* Arrow 4: Mapping */}
                    <div className="pipe-arrow-connector">
                      <span className="op-tag">Symbol</span>
                      <span className="arrow-glyph">⟶</span>
                    </div>

                    {/* Node 5: Output Ciphertext */}
                    <div className="pipe-node accent-node">
                      <div className="pipe-node-label">05 OUTPUT</div>
                      <div className="pipe-node-box accent-box">
                        <strong className="pipe-char accent-char">{affineOutputCharA}</strong>
                        <span className="pipe-val accent-val">y = {affineStepMod}</span>
                      </div>
                      <div className="pipe-subtext">Cipher character</div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula */}
                <div className="panel-formula-card">
                  <div className="formula-label">MATHEMATICAL DEFINITION</div>
                  <MathView math="E_{a,b}(x) = (a \cdot x + b) \bmod 26" display />
                  <div className="formula-eval">
                    <MathView
                      math={`E_{${affineMultiplierA}, ${affineShiftA}}(${affineValA}) = (${affineMultiplierA} \\cdot ${affineValA} + ${affineShiftA}) \\bmod 26 = ${affineStepAdd} \\bmod 26 = ${affineStepMod} \\implies \\text{'${affineOutputCharA}'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* Panel 3: Position Permutations                                    */}
          {/* ================================================================= */}
          {(sectionAView === "all" || sectionAView === "permutation") && (
            <div className={`system-visual-panel permutation-panel ${sectionAView === "permutation" ? "expanded-panel" : ""}`}>
              <div className="panel-badge-top">
                <span className="system-pill silver">SYSTEM 03</span>
                <span className="domain-pill">Domain: <MathView math="\{1, 2, 3, 4\}" /></span>
                <span className="order-tag">|S₄| = 24</span>
              </div>
              <div className="panel-header-content">
                <h3>Position Permutations</h3>
                <p className="panel-desc">Coordinate block bijection shuffling 4 character positions.</p>
              </div>

              <div className="panel-workbench">
                {/* Permutation Key Controls */}
                <div className="perm-controls-bar">
                  <div className="control-group">
                    <span className="control-label">Key <MathView math="\sigma \in S_4" />:</span>
                    <strong className="perm-key-label">{permutationLabel(permKeyA)}</strong>
                    <button
                      type="button"
                      className="cycle-key-button"
                      onClick={() => setPermKeyIndexA((prev) => (prev + 1) % S4.length)}
                      title="Step to next permutation in S4"
                    >
                      Cycle key ↻
                    </button>
                  </div>
                  <div className="preset-buttons perm-presets">
                    <button
                      type="button"
                      className={`preset-btn ${permKeyIndexA === 13 ? "active" : ""}`}
                      onClick={() => setPermKeyIndexA(13)}
                      title="Established research example [3, 1, 4, 2]"
                    >
                      [3, 1, 4, 2]
                    </button>
                    <button
                      type="button"
                      className={`preset-btn ${permKeyIndexA === 9 ? "active" : ""}`}
                      onClick={() => setPermKeyIndexA(9)}
                      title="4-cycle rotation"
                    >
                      [2, 3, 4, 1]
                    </button>
                    <button
                      type="button"
                      className={`preset-btn ${permKeyIndexA === 23 ? "active" : ""}`}
                      onClick={() => setPermKeyIndexA(23)}
                      title="Reversal involution"
                    >
                      [4, 3, 2, 1]
                    </button>
                    <button
                      type="button"
                      className={`preset-btn ${permKeyIndexA === 0 ? "active" : ""}`}
                      onClick={() => setPermKeyIndexA(0)}
                      title="Identity permutation"
                    >
                      [1, 2, 3, 4]
                    </button>
                  </div>
                </div>

                {/* Input Text Block Field */}
                <div className="perm-input-strip">
                  <label htmlFor="perm-block-input">4-Character Block:</label>
                  <input
                    id="perm-block-input"
                    type="text"
                    maxLength={4}
                    value={permBlockA}
                    onChange={(e) => setPermBlockA(e.target.value)}
                    className="perm-text-input"
                    placeholder="ABCD"
                  />
                  <span className="perm-input-note">Uppercase 4 letters</span>
                </div>

                {/* Precise Mapping Diagram */}
                <div className="perm-diagram-stage">
                  <div className="diagram-stage-header">
                    <span>COORDINATE BIJECTION DIAGRAM</span>
                    <code>{permutationLabel(permKeyA)}</code>
                  </div>

                  {/* Input Nodes Row */}
                  <div className="perm-nodes-row input-row">
                    <div className="nodes-row-legend">INPUT</div>
                    <div className="nodes-cells-grid">
                      {permCleanBlockA.split("").map((ch, idx) => {
                        // idx is 0..3 (positions 1..4)
                        const colors = ["#b0a3ff", "#9fcff1", "#f6c177", "#8df0a9"];
                        const destOutPos = (permKeyA as readonly number[]).indexOf(idx) + 1;
                        return (
                          <div
                            key={idx}
                            className={`perm-diagram-node input-node node-color-${idx}`}
                            style={{ borderColor: colors[idx] }}
                          >
                            <span className="node-pos-pill" style={{ color: colors[idx] }}>
                              POS {idx + 1}
                            </span>
                            <strong className="node-char">{ch}</strong>
                            <small className="node-dest-tag">⟶ out #{destOutPos}</small>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SVG Connected Mapping Paths */}
                  <div className="perm-svg-wrap">
                    <svg
                      className="perm-svg-canvas"
                      viewBox="0 0 400 90"
                      preserveAspectRatio="none"
                      aria-label="Permutation mapping diagram connecting inputs to outputs"
                    >
                      <defs>
                        {["#b0a3ff", "#9fcff1", "#f6c177", "#8df0a9"].map((color, idx) => (
                          <marker
                            key={idx}
                            id={`perm-arrow-${idx}`}
                            markerWidth="6"
                            markerHeight="6"
                            refX="5"
                            refY="3"
                            orient="auto"
                          >
                            <path d="M 0 0 L 6 3 L 0 6 z" fill={color} />
                          </marker>
                        ))}
                      </defs>

                      {/* 4 Connected Curves: output j receives from input permKeyA[j] */}
                      {permKeyA.map((srcIdx, outIdx) => {
                        const colors = ["#b0a3ff", "#9fcff1", "#f6c177", "#8df0a9"];
                        // Coordinates: 4 columns centered at 50, 150, 250, 350
                        const startX = 50 + srcIdx * 100;
                        const endX = 50 + outIdx * 100;
                        const color = colors[srcIdx];
                        return (
                          <path
                            key={outIdx}
                            d={`M ${startX} 4 C ${startX} 44, ${endX} 44, ${endX} 82`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                            markerEnd={`url(#perm-arrow-${srcIdx})`}
                            className="perm-vector-path"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Output Nodes Row */}
                  <div className="perm-nodes-row output-row">
                    <div className="nodes-row-legend">OUTPUT</div>
                    <div className="nodes-cells-grid">
                      {permOutputBlockA.split("").map((ch, outIdx) => {
                        const srcIdx = permKeyA[outIdx]; // 0..3
                        const colors = ["#b0a3ff", "#9fcff1", "#f6c177", "#8df0a9"];
                        const srcColor = colors[srcIdx];
                        return (
                          <div
                            key={outIdx}
                            className={`perm-diagram-node output-node node-color-${srcIdx}`}
                            style={{ borderColor: srcColor }}
                          >
                            <span className="node-pos-pill" style={{ color: "var(--dim)" }}>
                              POS {outIdx + 1}
                            </span>
                            <strong className="node-char" style={{ color: srcColor }}>{ch}</strong>
                            <small className="node-src-tag" style={{ color: srcColor }}>
                              ← in #{srcIdx + 1}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coordinate Mapping Explicit Table */}
                  <div className="perm-mapping-specs">
                    {permKeyA.map((srcIdx, outIdx) => (
                      <div key={outIdx} className="mapping-spec-item">
                        <span className="spec-out">Out Pos {outIdx + 1}</span>
                        <span className="spec-arrow">⟵</span>
                        <span className="spec-in">In Pos {srcIdx + 1} ('{permCleanBlockA[srcIdx]}')</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mathematical Formula */}
                <div className="panel-formula-card">
                  <div className="formula-label">MATHEMATICAL DEFINITION</div>
                  <MathView
                    math={`[${permKeyA.map((v) => v + 1).join(', ')}] : \\mathrm{${permCleanBlockA}} \\longmapsto \\mathrm{${permOutputBlockA}}`}
                    display
                  />
                  <div className="formula-eval">
                    <MathView math="|S_4| = 4! = 24 \text{ bijective coordinate permutations}" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section A Thesis & Shared Structure Comparison */}
        <div className="thesis-banner visual-thesis">
          <div className="thesis-top-row">
            <div className="thesis-kicker">SHARED ALGEBRAIC STRUCTURE</div>
            <div className="thesis-headline">
              Different transformations. Different domains. Shared group axioms.
            </div>
          </div>
          <p className="thesis-subtext">
            While each system operates over its own mathematical space, all three satisfy the identical formal requirements of a mathematical group.
            Their differences lie in their underlying sets, operations, and commutativity properties.
          </p>

          <div className="structure-comparison-cards">
            <div className="struct-comp-card">
              <div className="comp-card-badge violet">CAESAR CIPHER</div>
              <div className="comp-card-math"><MathView math="C_{26} \cong (\mathbb{Z}_{26}, +)" /></div>
              <ul className="comp-card-traits">
                <li><strong>Domain:</strong> Residues <MathView math="\mathbb{Z}_{26}" /></li>
                <li><strong>Operation:</strong> Translation <MathView math="(x+k) \bmod 26" /></li>
                <li><strong>Order:</strong> <MathView math="|C_{26}| = 26" /></li>
                <li><strong>Commutative:</strong> Yes (Abelian)</li>
              </ul>
            </div>

            <div className="struct-comp-card">
              <div className="comp-card-badge blue">AFFINE CIPHER</div>
              <div className="comp-card-math"><MathView math="\mathrm{Aff}(\mathbb{Z}_{26}) \cong \mathbb{Z}_{26} \rtimes \mathbb{Z}_{26}^\times" /></div>
              <ul className="comp-card-traits">
                <li><strong>Domain:</strong> Residues <MathView math="\mathbb{Z}_{26}" /></li>
                <li><strong>Operation:</strong> <MathView math="(ax+b) \bmod 26, \, \gcd(a,26)=1" /></li>
                <li><strong>Order:</strong> <MathView math="|G_{\mathrm{aff}}| = 12 \times 26 = 312" /></li>
                <li><strong>Commutative:</strong> No (Non-Abelian)</li>
              </ul>
            </div>

            <div className="struct-comp-card">
              <div className="comp-card-badge silver">POSITION PERMUTATIONS</div>
              <div className="comp-card-math"><MathView math="S_4 \text{ (Symmetric Group)}" /></div>
              <ul className="comp-card-traits">
                <li><strong>Domain:</strong> Coordinates <MathView math="\{1, 2, 3, 4\}" /></li>
                <li><strong>Operation:</strong> Coordinate bijection <MathView math="\sigma" /></li>
                <li><strong>Order:</strong> <MathView math="|S_4| = 4! = 24" /></li>
                <li><strong>Commutative:</strong> No (Non-Abelian)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION B: What Makes a Transformation Reversible?                     */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-reversibility">
        <div className="card-kicker">SECTION B ◈ WHAT MAKES A TRANSFORMATION REVERSIBLE?</div>
        <h2 className="section-title">Reversibility, Bijections, and Collisions</h2>
        <p className="lead-paragraph">
          Encryption is only useful if decryption is deterministic and complete.
          A transformation <MathView math="T : X \to X" /> is reversible if and only if it is a <strong>bijection</strong>:
          every input maps to exactly one output, and no two inputs collide.
        </p>

        {/* Mode Switcher: Reversible vs Non-Bijective */}
        <div className="reversibility-mode-switch">
          <button
            type="button"
            className={bijectiveMode === "bijective" ? "active-mode" : ""}
            onClick={() => setBijectiveMode("bijective")}
          >
            ✓ Reversible Bijection (Valid Encryption)
          </button>
          <button
            type="button"
            className={bijectiveMode === "non-bijective" ? "active-mode warning" : ""}
            onClick={() => setBijectiveMode("non-bijective")}
          >
            ⚠ Non-Bijective Collision (Conceptual Illustration)
          </button>
        </div>

        {bijectiveMode === "bijective" ? (
          <div className="reversibility-demo-box">
            <div className="demo-header-strip">
              <span>REVERSIBLE DEMONSTRATION / COMPUTED EXAMPLE</span>
              <span className="status-badge success">T⁻¹(T(x)) = x GUARANTEED</span>
            </div>

            <div className="reversibility-flow">
              <div className="rev-stage">
                <span className="stage-eyebrow">PLAINTEXT</span>
                <div className="symbol-bubble">{revCaesarChar}</div>
                <small>x = {revInputVal}</small>
              </div>

              <div className="rev-action">
                <span className="action-tag">Forward T</span>
                <span className="action-arrow">→</span>
                <small>+{revCaesarShift} mod 26</small>
              </div>

              <div className="rev-stage">
                <span className="stage-eyebrow">CIPHERTEXT</span>
                <div className="symbol-bubble cipher">{revEncryptedChar}</div>
                <small>y = {revEncryptedVal}</small>
              </div>

              <div className="rev-action">
                <span className="action-tag">Inverse T⁻¹</span>
                <span className="action-arrow">→</span>
                <small>-{revCaesarShift} mod 26</small>
              </div>

              <div className="rev-stage">
                <span className="stage-eyebrow">RECOVERED</span>
                <div className="symbol-bubble recovered">{revDecryptedChar}</div>
                <small>Exact match ✓</small>
              </div>
            </div>

            <div className="reversibility-controls">
              <label>
                Choose letter:
                <select
                  value={revCaesarChar}
                  onChange={(e) => setRevCaesarChar(e.target.value)}
                >
                  {ALPHABET.split("").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Shift key (k):
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={revCaesarShift}
                  onChange={(e) => setRevCaesarShift(Number(e.target.value))}
                />
                <span className="val-chip">{revCaesarShift}</span>
              </label>
            </div>

            <div className="formula-box">
              <MathView math="T : X \to X \quad \text{and} \quad T^{-1}(T(x)) = x" display />
            </div>
          </div>
        ) : (
          <div className="collision-demo-box">
            <div className="demo-header-strip warning-strip">
              <span>CONCEPTUAL ILLUSTRATION / WHY INVERSES FAIL</span>
              <span className="status-badge error">NON-INVERTIBLE: COLLISION OCCURS</span>
            </div>
            
            <p className="collision-explanation">
              Consider an illustrative mapping where the multiplier shares a common factor with 26:
              <br />
              <MathView math="f(x) = (2x) \bmod 26 \quad (\gcd(2, 26) = 2 \ne 1)" display />
              Because <MathView math="\gcd(2, 26) \ne 1" />, the multiplier has no modular inverse.
              Multiple distinct plaintexts map to the exact same ciphertext output:
            </p>

            <div className="collision-table-wrap">
              <table className="calculation-table">
                <thead>
                  <tr>
                    <th>Plaintext x</th>
                    <th>Numerical (x)</th>
                    <th>Computation: (2x) mod 26</th>
                    <th>Ciphertext y</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nonBijectiveCollisions.map((row, idx) => (
                    <tr key={idx} className={idx < 2 ? "collision-highlight-row" : ""}>
                      <td><strong>{row.plainChar}</strong></td>
                      <td>{row.val}</td>
                      <td><code>{row.calc}</code></td>
                      <td><strong className="collision-target">{row.cipherChar}</strong></td>
                      <td>
                        {idx < 2 ? (
                          <span className="badge-no">COLLISION ON &apos;A&apos;</span>
                        ) : (
                          <span className="badge-no">COLLISION ON &apos;C&apos;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="warning-callout">
              <strong>Decryption Ambiguity:</strong> When the receiver observes ciphertext <strong>&apos;A&apos;</strong>,
              was the original plaintext <strong>&apos;A&apos; (0)</strong> or <strong>&apos;N&apos; (13)</strong>?
              Information has been permanently destroyed. An inverse mapping cannot exist.
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* SECTION C: Discover the Four Group Properties Visually                 */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-axioms">
        <div className="card-kicker">SECTION C ◈ DISCOVER THE FOUR GROUP PROPERTIES VISUALLY</div>
        <h2 className="section-title">The Four Group Axioms</h2>
        <p className="lead-paragraph">
          A set of reversible transformations <MathView math="G" /> forms a group under composition
          <MathView math="\circ" /> if and only if it satisfies four foundational algebraic laws.
        </p>

        {/* System Toggle for Axioms */}
        <div className="axioms-system-selector">
          <button
            className={axiomSystem === "caesar" ? "selected" : ""}
            onClick={() => setAxiomSystem("caesar")}
          >
            Caesar C₂₆
          </button>
          <button
            className={axiomSystem === "affine" ? "selected" : ""}
            onClick={() => setAxiomSystem("affine")}
          >
            Affine G_aff
          </button>
          <button
            className={axiomSystem === "permutation" ? "selected" : ""}
            onClick={() => setAxiomSystem("permutation")}
          >
            Permutations S₄
          </button>
        </div>

        {/* 4 Interactive Visual Modules */}
        <div className="four-axioms-visual-grid">
          {/* 1. Closure */}
          <div className="axiom-module-card">
            <div className="axiom-module-head">
              <span className="axiom-number">01</span>
              <h4>Closure</h4>
              <MathView math="T_1, T_2 \in G \implies T_2 \circ T_1 \in G" />
            </div>
            <div className="axiom-visual-content">
              {axiomSystem === "caesar" && (
                <div className="axiom-inline-calc">
                  <span>Shift k₁ = 4</span>
                  <i>+</i>
                  <span>Shift k₂ = 9</span>
                  <i>=</i>
                  <strong className="result-highlight">Shift k = 13 ∈ C₂₆</strong>
                </div>
              )}
              {axiomSystem === "affine" && (
                <div className="axiom-inline-calc">
                  <span>E_(3, 4)</span>
                  <i>∘</i>
                  <span>E_(5, 7)</span>
                  <i>=</i>
                  <strong className="result-highlight">E_(15, 1) ∈ G_aff</strong>
                </div>
              )}
              {axiomSystem === "permutation" && (
                <div className="axiom-inline-calc">
                  <span>[2, 1, 3, 4]</span>
                  <i>∘</i>
                  <span>[1, 3, 2, 4]</span>
                  <i>=</i>
                  <strong className="result-highlight">[3, 1, 2, 4] ∈ S₄</strong>
                </div>
              )}
              <p className="axiom-module-desc">
                Composing any two valid encryptions never leaves the system. It always yields another valid key.
              </p>
            </div>
            <button
              type="button"
              className="expand-def-btn"
              onClick={() => setExpandedAxiom(expandedAxiom === 1 ? null : 1)}
            >
              {expandedAxiom === 1 ? "Hide formal definition" : "Formal mathematical definition ▼"}
            </button>
            {expandedAxiom === 1 && (
              <div className="expanded-def-content">
                <p>
                  For all <MathView math="a, b \in G" />, the operation <MathView math="a \circ b" /> is uniquely defined and an element of <MathView math="G" />.
                  In cryptography, this proves multi-layered encryption using keys from the same group provides no keyspace expansion.
                </p>
              </div>
            )}
          </div>

          {/* 2. Associativity */}
          <div className="axiom-module-card">
            <div className="axiom-module-head">
              <span className="axiom-number">02</span>
              <h4>Associativity</h4>
              <MathView math="(T_3 \circ T_2) \circ T_1 = T_3 \circ (T_2 \circ T_1)" />
            </div>
            <div className="axiom-visual-content">
              <div className="associativity-branch-visual">
                <div className="branch-line">
                  <span className="branch-tag">Route A:</span>
                  <code>((T₃ ∘ T₂) ∘ T₁)(x)</code>
                  <span className="branch-eq">=</span>
                  <strong>Same output</strong>
                </div>
                <div className="branch-line">
                  <span className="branch-tag">Route B:</span>
                  <code>(T₃ ∘ (T₂ ∘ T₁))(x)</code>
                  <span className="branch-eq">=</span>
                  <strong>Same output</strong>
                </div>
              </div>
              <p className="axiom-module-desc">
                Grouping of sequential transformations does not alter the outcome. Associativity is universally inherited from function composition.
              </p>
            </div>
            <button
              type="button"
              className="expand-def-btn"
              onClick={() => setExpandedAxiom(expandedAxiom === 2 ? null : 2)}
            >
              {expandedAxiom === 2 ? "Hide formal definition" : "Formal mathematical definition ▼"}
            </button>
            {expandedAxiom === 2 && (
              <div className="expanded-def-content">
                <p>
                  For all <MathView math="f, g, h \in G" />, <MathView math="(f \circ g) \circ h = f \circ (g \circ h)" />.
                  Proof: For any <MathView math="x \in X" />, <MathView math="((f \circ g) \circ h)(x) = (f \circ g)(h(x)) = f(g(h(x))) = (f \circ (g \circ h))(x)" />.
                </p>
              </div>
            )}
          </div>

          {/* 3. Identity */}
          <div className="axiom-module-card">
            <div className="axiom-module-head">
              <span className="axiom-number">03</span>
              <h4>Identity</h4>
              <MathView math="e \circ T = T \circ e = T" />
            </div>
            <div className="axiom-visual-content">
              {axiomSystem === "caesar" && (
                <div className="axiom-inline-calc">
                  <span>Shift k = 0 :</span>
                  <code>E₀(x) = (x + 0) mod 26 = x</code>
                  <span className="badge-yes">Neutral</span>
                </div>
              )}
              {axiomSystem === "affine" && (
                <div className="axiom-inline-calc">
                  <span>Key (1, 0) :</span>
                  <code>E_(1,0)(x) = (1·x + 0) mod 26 = x</code>
                  <span className="badge-yes">Neutral</span>
                </div>
              )}
              {axiomSystem === "permutation" && (
                <div className="axiom-inline-calc">
                  <span>[1, 2, 3, 4] :</span>
                  <code>ABCD ↦ ABCD</code>
                  <span className="badge-yes">Neutral</span>
                </div>
              )}
              <p className="axiom-module-desc">
                An identity element exists that leaves every message completely unchanged.
              </p>
            </div>
            <button
              type="button"
              className="expand-def-btn"
              onClick={() => setExpandedAxiom(expandedAxiom === 3 ? null : 3)}
            >
              {expandedAxiom === 3 ? "Hide formal definition" : "Formal mathematical definition ▼"}
            </button>
            {expandedAxiom === 3 && (
              <div className="expanded-def-content">
                <p>
                  There exists a unique element <MathView math="e \in G" /> such that for all <MathView math="a \in G" />,
                  <MathView math="e \circ a = a \circ e = a" />.
                </p>
              </div>
            )}
          </div>

          {/* 4. Inverses */}
          <div className="axiom-module-card">
            <div className="axiom-module-head">
              <span className="axiom-number">04</span>
              <h4>Inverses</h4>
              <MathView math="T^{-1} \circ T = T \circ T^{-1} = e" />
            </div>
            <div className="axiom-visual-content">
              {axiomSystem === "caesar" && (
                <div className="axiom-inline-calc">
                  <span>Shift +3 followed by Shift -3 :</span>
                  <code>E₋₃(E₃(x)) = (x + 3 - 3) = x</code>
                  <span className="badge-yes">Restored</span>
                </div>
              )}
              {axiomSystem === "affine" && (
                <div className="axiom-inline-calc">
                  <span>E_(5,8) followed by E_(21,14) :</span>
                  <code>E_(21,14)(E_(5,8)(x)) = x</code>
                  <span className="badge-yes">Restored</span>
                </div>
              )}
              {axiomSystem === "permutation" && (
                <div className="axiom-inline-calc">
                  <span>P = [3,1,4,2] &amp; P⁻¹ = [2,4,1,3] :</span>
                  <code>P⁻¹(P(ABCD)) = ABCD</code>
                  <span className="badge-yes">Restored</span>
                </div>
              )}
              <p className="axiom-module-desc">
                Every valid transformation key possesses an exact algebraic inverse that unwinds it.
              </p>
            </div>
            <button
              type="button"
              className="expand-def-btn"
              onClick={() => setExpandedAxiom(expandedAxiom === 4 ? null : 4)}
            >
              {expandedAxiom === 4 ? "Hide formal definition" : "Formal mathematical definition ▼"}
            </button>
            {expandedAxiom === 4 && (
              <div className="expanded-def-content">
                <p>
                  For every <MathView math="a \in G" />, there exists <MathView math="a^{-1} \in G" /> such that
                  <MathView math="a \circ a^{-1} = a^{-1} \circ a = e" />. This is the mathematical guarantee of exact decryption.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION D: Make Composition Intuitive                                 */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-composition">
        <div className="card-kicker">SECTION D ◈ MAKE COMPOSITION INTUITIVE</div>
        <h2 className="section-title">Interactive Composition Visualizer</h2>
        <p className="lead-paragraph">
          Select two transformations <MathView math="T_1" /> and <MathView math="T_2" />.
          Observe how the pipeline applies <MathView math="T_1" /> first and <MathView math="T_2" /> second,
          how they combine into a single direct map <MathView math="T_{\mathrm{comp}} = T_2 \circ T_1" />,
          and how <MathView math="T_{\mathrm{comp}}^{-1}" /> restores the original input.
        </p>

        {/* Convention Callout Banner */}
        <div className="composition-convention-banner">
          <span className="banner-badge">MATHEMATICAL CONVENTION</span>
          <div className="convention-equation">
            <MathView math="(T_2 \circ T_1)(x) = T_2(T_1(x))" display />
          </div>
          <p className="convention-explainer">
            The <strong>rightmost function is applied first</strong>.
            <MathView math="T_1" /> acts on the input <MathView math="x" />. Then <MathView math="T_2" /> acts on the intermediate output <MathView math="T_1(x)" />.
          </p>
        </div>

        {/* System Picker */}
        <div className="demo-system-picker">
          <button
            type="button"
            className={demoSystem === "caesar" ? "active" : ""}
            onClick={() => setDemoSystem("caesar")}
          >
            Caesar Shift (<MathView math="C_{26}" />)
          </button>
          <button
            type="button"
            className={demoSystem === "affine" ? "active" : ""}
            onClick={() => setDemoSystem("affine")}
          >
            Affine Map (<MathView math="G_{\mathrm{aff}}" />)
          </button>
          <button
            type="button"
            className={demoSystem === "permutation" ? "active" : ""}
            onClick={() => setDemoSystem("permutation")}
          >
            Position Permutation (<MathView math="S_4" />)
          </button>
        </div>

        {/* Dynamic Controls */}
        <div className="composition-controls-panel">
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
                <span>First Shift (k₁ - Applied 1st):</span>
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
                <span>Second Shift (k₂ - Applied 2nd):</span>
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
                <span className="pair-title">T₁ (Applied 1st):</span>
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
                <span className="pair-title">T₂ (Applied 2nd):</span>
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
                <span>π₁ (Applied 1st):</span>
                <select value={permIdx1} onChange={(e) => setPermIdx1(Number(e.target.value))}>
                  {S4.map((p, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1}: {permutationLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>π₂ (Applied 2nd):</span>
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

        {/* Visual Pipeline with Sequential Badges */}
        <div className="transformation-pipeline">
          {/* Stage 1: Initial Input */}
          <div className="pipeline-card stage-input">
            <span className="stage-num">01 / INITIAL INPUT</span>
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
            <span className="connector-badge step1-badge">1ST APPLIED</span>
            <span className="connector-label">T₁</span>
            <span className="connector-arrow">→</span>
          </div>

          {/* Stage 2: Intermediate Result T1(x) */}
          <div className="pipeline-card stage-mid">
            <span className="stage-num">02 / INTERMEDIATE T₁(x)</span>
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
            <span className="connector-badge step2-badge">2ND APPLIED</span>
            <span className="connector-label">T₂</span>
            <span className="connector-arrow">→</span>
          </div>

          {/* Stage 3: Final Output T2(T1(x)) */}
          <div className="pipeline-card stage-output">
            <span className="stage-num">03 / FINAL OUTPUT T₂(T₁(x))</span>
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
            <span className="connector-badge inv-badge">INVERSE</span>
            <span className="connector-label">T_comp⁻¹</span>
            <span className="connector-arrow">↺</span>
          </div>

          {/* Stage 4: Recovered Plaintext */}
          <div className="pipeline-card stage-recovered">
            <span className="stage-num">04 / RECOVERED x</span>
            <div className="stage-symbol">
              {demoSystem === "permutation" ? permRecoveredBlock : (demoSystem === "caesar" ? caesarRecoveredChar : affineRecoveredChar)}
            </div>
            <div className="stage-detail">
              <span className="match-confirmed">✓ Exact Recovery Confirmed</span>
            </div>
          </div>
        </div>

        {/* Single Composed Transformation Analysis */}
        <div className="algebraic-composition-summary">
          <h4>Single Direct Transformation: <MathView math="T_{\mathrm{composed}} = T_2 \circ T_1" /></h4>

          <div className="composition-math-box">
            {demoSystem === "caesar" && (
              <div>
                <p>
                  Composing shifts <MathView math={`k_1 = ${caesarK1}`} /> and <MathView math={`k_2 = ${caesarK2}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${caesarK2}} \\circ E_{${caesarK1}} = E_{(${caesarK1} + ${caesarK2}) \\bmod 26} = E_{${caesarCompK}}`}
                    display
                  />
                </div>
                <p>
                  Direct single evaluation on <MathView math={`x = ${caesarVal}`} />:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${caesarCompK}}(${caesarVal}) = (${caesarVal} + ${caesarCompK}) \\bmod 26 = ${caesarDirectVal} \\quad (\\mathrm{${caesarDirectChar}})`}
                    display
                  />
                </div>
                <p>
                  Inverse transformation <MathView math={`E_{${caesarCompK}}^{-1} = E_{${caesarInvK}}`} /> restores the input:
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
                  Inverse key <MathView math={`T_{\\mathrm{comp}}^{-1} = E_{${affineInvKey.a}, ${affineInvKey.b}}`} /> restores the input:
                </p>
                <div className="formula-box">
                  <MathView
                    math={`E_{${affineInvKey.a}, ${affineInvKey.b}}(${affineDirectVal}) = (${affineInvKey.a} \\cdot ${affineDirectVal} + ${affineInvKey.b}) \\bmod 26 = ${affineRecoveredVal} \\quad (\\mathrm{${affineRecoveredChar}})`}
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

      {/* ===================================================================== */}
      {/* SECTION E: Compare the Three Groups Visually                           */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-compare">
        <div className="card-kicker">SECTION E ◈ ALGEBRAIC COMPARISON</div>
        <h2 className="section-title">Comparing the Three Groups</h2>
        <p className="lead-paragraph">
          All three systems satisfy the four group axioms, but they possess fundamentally different algebraic structures,
          domains, and commutativity properties.
        </p>

        {/* Order Metric Highlights */}
        <div className="order-metrics-grid">
          <div className="order-metric-card violet">
            <span className="metric-symbol">C₂₆</span>
            <strong className="metric-order">|C₂₆| = 26</strong>
            <span className="metric-name">Cyclic Group of Order 26</span>
            <small>Abelian (Commutative) &middot; Domain: ℤ₂₆</small>
          </div>
          <div className="order-metric-card blue">
            <span className="metric-symbol">G_aff</span>
            <strong className="metric-order">|G_aff| = 312</strong>
            <span className="metric-name">Affine Group mod 26</span>
            <small>Non-Abelian &middot; 12 units × 26 shifts &middot; Domain: ℤ₂₆</small>
          </div>
          <div className="order-metric-card silver">
            <span className="metric-symbol">S₄</span>
            <strong className="metric-order">|S₄| = 24</strong>
            <span className="metric-name">Symmetric Group on 4 Positions</span>
            <small>Non-Abelian &middot; 4! = 24 &middot; Domain: &#123;1, 2, 3, 4&#125;</small>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
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
                <td><MathView math="E_{a^{-1}, -a^{-1}b \bmod 26}" /></td>
                <td>Inverse permutation <MathView math="\pi^{-1}" /></td>
              </tr>
              <tr>
                <td className="prop-name">Group Structure</td>
                <td><MathView math="C_{26} \cong (\mathbb{Z}_{26}, +)" /> (Cyclic)</td>
                <td><MathView math="G_{\mathrm{aff}}" /> (Affine general linear)</td>
                <td><MathView math="S_4" /> (Symmetric group)</td>
              </tr>
              <tr>
                <td className="prop-name">Commutativity</td>
                <td><span className="badge-yes">Yes (Abelian)</span></td>
                <td><span className="badge-no">No (Non-abelian)</span></td>
                <td><span className="badge-no">No (Non-abelian)</span></td>
              </tr>
              <tr>
                <td className="prop-name">Subgroup Relationship</td>
                <td>Normal subgroup of <MathView math="G_{\mathrm{aff}}" /></td>
                <td>Contains <MathView math="C_{26}" /> as subgroup (<MathView math="a=1" />)</td>
                <td>Independent domain (block coordinates)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Subgroup Callout */}
        <div className="subgroup-callout-panel">
          <div className="subgroup-title">
            <span>SUBGROUP RELATION</span>
            <strong>Caesar is a Subgroup of the Affine Group: <MathView math="C_{26} \le G_{\mathrm{aff}}" /></strong>
          </div>
          <p>
            When the affine multiplier is fixed to <MathView math="a = 1" />, the affine equation
            <MathView math="E_{1, b}(x) = (1x + b) \bmod 26 = (x + b) \bmod 26" /> coincides precisely with Caesar shift <MathView math="E_b" />.
            The 26 Caesar shifts form a normal cyclic subgroup inside the 312-element affine group.
          </p>
        </div>

        {/* Commutativity Verified Engine Demonstration */}
        <div className="commutativity-lab-box">
          <h4>Live Verified Commutativity Profiles</h4>
          <div className="comm-system-tabs">
            <button
              className={commSystem === "caesar" ? "active" : ""}
              onClick={() => setCommSystem("caesar")}
            >
              Caesar: Commutative
            </button>
            <button
              className={commSystem === "affine" ? "active" : ""}
              onClick={() => setCommSystem("affine")}
            >
              Affine: Non-Commutative
            </button>
            <button
              className={commSystem === "permutation" ? "active" : ""}
              onClick={() => setCommSystem("permutation")}
            >
              S₄: Non-Commutative
            </button>
          </div>

          <div className="comm-results-display">
            {commSystem === "caesar" && (
              <div className="comm-panel-card">
                <div className="comm-status-badge yes">COMMUTATIVE: T₂ ∘ T₁ = T₁ ∘ T₂</div>
                <p>
                  Consider shifts <MathView math="k_1 = 3" /> and <MathView math="k_2 = 7" />:
                </p>
                <div className="comm-split-equations">
                  <div className="comm-eq-side">
                    <span>E₇ ∘ E₃:</span>
                    <code>(x + 3 + 7) mod 26 = (x + 10) mod 26 = E₁₀</code>
                  </div>
                  <div className="comm-eq-side">
                    <span>E₃ ∘ E₇:</span>
                    <code>(x + 7 + 3) mod 26 = (x + 10) mod 26 = E₁₀</code>
                  </div>
                </div>
                <p className="comm-summary">
                  Because integer addition is commutative modulo 26, the order of Caesar shifts never alters the ciphertext.
                </p>
              </div>
            )}

            {commSystem === "affine" && (
              <div className="comm-panel-card">
                <div className="comm-status-badge no">NON-COMMUTATIVE: T₂ ∘ T₁ ≠ T₁ ∘ T₂</div>
                <p>
                  Computed from mathematical engine for <MathView math="T_1 = E_{3,2}" /> and <MathView math="T_2 = E_{5,7}" />:
                </p>
                <div className="comm-split-equations">
                  <div className="comm-eq-side">
                    <span>T₂ ∘ T₁ (T₁ applied first):</span>
                    <strong>E_({aff21.a}, {aff21.b})</strong>
                    <small>5·(3x + 2) + 7 = 15x + 17 mod 26</small>
                  </div>
                  <div className="comm-vs-badge">≠</div>
                  <div className="comm-eq-side">
                    <span>T₁ ∘ T₂ (T₂ applied first):</span>
                    <strong>E_({aff12.a}, {aff12.b})</strong>
                    <small>3·(5x + 7) + 2 = 15x + 23 mod 26</small>
                  </div>
                </div>
                <p className="comm-summary">
                  Since <MathView math="E_{15, 17} \ne E_{15, 23}" />, composition order cannot be interchanged.
                  The affine transformation group is non-abelian.
                </p>
              </div>
            )}

            {commSystem === "permutation" && (
              <div className="comm-panel-card">
                <div className="comm-status-badge no">NON-COMMUTATIVE: P ∘ Q ≠ Q ∘ P</div>
                <p>
                  Computed from mathematical engine for <MathView math="P = [2, 1, 3, 4]" /> (swap pos 1,2)
                  and <MathView math="Q = [1, 3, 2, 4]" /> (swap pos 2,3) on <strong>ABCD</strong>:
                </p>
                <div className="comm-split-equations">
                  <div className="comm-eq-side">
                    <span>P ∘ Q (Q applied first):</span>
                    <strong>{permutationApply(pqPreset, "ABCD")}</strong>
                    <small>Permutation: {permutationLabel(pqPreset)}</small>
                  </div>
                  <div className="comm-vs-badge">≠</div>
                  <div className="comm-eq-side">
                    <span>Q ∘ P (P applied first):</span>
                    <strong>{permutationApply(qpPreset, "ABCD")}</strong>
                    <small>Permutation: {permutationLabel(qpPreset)}</small>
                  </div>
                </div>
                <p className="comm-summary">
                  Because <MathView math="\mathrm{CABD} \ne \mathrm{BCAD}" />, <MathView math="S_4" /> is strictly non-abelian.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION F: Concept Map & What Group Theory Establishes                 */}
      {/* ===================================================================== */}
      <section className="structure-card visual-card" id="section-limits">
        <div className="card-kicker">SECTION F ◈ SCIENTIFIC RESPONSIBILITY & CONCEPT MAP</div>
        <h2 className="section-title">The Unified Concept Map</h2>
        <p className="lead-paragraph">
          How reversible transformations, bijections, group axioms, and algebraic structures form a coherent hierarchy.
        </p>

        {/* Visual Concept Map */}
        <div className="concept-map-container">
          <div className="concept-node">
            <span className="node-num">01</span>
            <strong>Reversible Transformations</strong>
            <small>Mappings T : X → X where every message has a trail.</small>
          </div>
          <div className="concept-link-arrow">→</div>
          <div className="concept-node">
            <span className="node-num">02</span>
            <strong>Bijective Mappings</strong>
            <small>One-to-one and onto. Zero collisions; unique inverses.</small>
          </div>
          <div className="concept-link-arrow">→</div>
          <div className="concept-node">
            <span className="node-num">03</span>
            <strong>Composition & Inverses</strong>
            <small>Combining successive keys and recovering original states.</small>
          </div>
          <div className="concept-link-arrow">→</div>
          <div className="concept-node">
            <span className="node-num">04</span>
            <strong>Group Axioms</strong>
            <small>Closure, Associativity, Identity, and Inverses.</small>
          </div>
          <div className="concept-link-arrow">→</div>
          <div className="concept-node accent-node">
            <span className="node-num">05</span>
            <strong>Algebraic Structure</strong>
            <small>C₂₆ (cyclic), G_aff (affine), S₄ (permutations).</small>
          </div>
        </div>

        {/* Dual Panel: What is Established vs What is NOT Established */}
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
                <strong>Subgroup Hierarchies:</strong> Formally demonstrates that the Caesar shift cipher is a normal cyclic subgroup of the affine group: <MathView math="C_{26} \triangleleft G_{\mathrm{aff}}" />.
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
                <strong>Trivial Keyspace Exhaustion:</strong> The keyspaces (<MathView math="|C_{26}|=26" />, <MathView math="|G_{\mathrm{aff}}|=312" />, <MathView math="|S_4|=24" />) can be searched exhaustively on modern hardware in less than one millisecond.
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
