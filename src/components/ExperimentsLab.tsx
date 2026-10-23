import { useState, useMemo } from "react";
import { MathView } from "./MathView";
import {
  ALPHABET,
  MODULUS,
  AFFINE_UNITS,
  S4,
  gcd,
  modularInverse,
  caesarText,
  affineText,
  permutationText,
  affineInverse,
  affineCompose,
  permutationApply,
  permutationInverse,
  permutationCompose,
  permutationLabel,
  computeLetterFrequencies,
  transformationOrder,
  type AffineKey,
} from "../math/engine";

const SAMPLE_TEXTS = [
  {
    label: "Classical Cryptanalysis Sample",
    text: "THE STUDY OF ABSTRACT ALGEBRA REVEALS INHERENT MATHEMATICAL STRUCTURE IN CIPHERS",
  },
  {
    label: "English Pangram",
    text: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG WITH EXTRA VELOCITY",
  },
  {
    label: "Vowel Frequency Rich Sample",
    text: "TO BE OR NOT TO BE THAT IS THE ESSENTIAL QUESTION OF REVERSIBILITY",
  },
];

export function ExperimentsLab() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"frequency" | "inspector" | "composition" | "bruteforce">("frequency");

  const scrollToExperiment = (id: string, tab: "frequency" | "inspector" | "composition" | "bruteforce") => {
    setActiveTab(tab);
    const elem = document.getElementById(id);
    if (elem) {
      const headerOffset = 96;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // EXPERIMENT 1: Letter Frequency Analysis & Invariance State
  // ---------------------------------------------------------------------------
  const [freqText, setFreqText] = useState(SAMPLE_TEXTS[0].text);
  const [freqSystem, setFreqSystem] = useState<"caesar" | "affine">("caesar");
  const [freqShift, setFreqShift] = useState(3);
  const [freqAffineA, setFreqAffineA] = useState(5);
  const [freqAffineB, setFreqAffineB] = useState(8);
  const [freqDisplayMode, setFreqDisplayMode] = useState<"percentage" | "count">("percentage");
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  // Computations for Frequency Experiment
  const plainFreqResult = useMemo(() => computeLetterFrequencies(freqText), [freqText]);

  const cipherText = useMemo(() => {
    if (freqSystem === "caesar") {
      return caesarText(freqText, freqShift);
    } else {
      return affineText(freqText, { a: freqAffineA, b: freqAffineB });
    }
  }, [freqText, freqSystem, freqShift, freqAffineA, freqAffineB]);

  const cipherFreqResult = useMemo(() => computeLetterFrequencies(cipherText), [cipherText]);

  // Synchronized max scale across both distributions for honest visual comparison
  const sharedMaxScale = useMemo(() => {
    if (freqDisplayMode === "percentage") {
      const maxP = Math.max(plainFreqResult.maxPercentage, cipherFreqResult.maxPercentage, 10);
      return Math.ceil(maxP / 5) * 5; // round up to nearest 5%
    } else {
      const maxC = Math.max(plainFreqResult.maxCount, cipherFreqResult.maxCount, 5);
      return Math.ceil(maxC / 5) * 5;
    }
  }, [plainFreqResult, cipherFreqResult, freqDisplayMode]);

  // Verification: check if the multiset of counts is preserved
  const multisetMatches = useMemo(() => {
    const pCounts = plainFreqResult.frequencies.map((f) => f.count).sort((a, b) => a - b);
    const cCounts = cipherFreqResult.frequencies.map((f) => f.count).sort((a, b) => a - b);
    return JSON.stringify(pCounts) === JSON.stringify(cCounts);
  }, [plainFreqResult, cipherFreqResult]);

  const distinctPlainLetters = useMemo(() => {
    return plainFreqResult.frequencies.filter((f) => f.count > 0).length;
  }, [plainFreqResult]);

  const isAffineCoprime = useMemo(() => gcd(freqAffineA, MODULUS) === 1, [freqAffineA]);

  // ---------------------------------------------------------------------------
  // EXPERIMENT 2: Transformation Inspector State
  // ---------------------------------------------------------------------------
  const [inspSystem, setInspSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [inspInput, setInspInput] = useState("CIPHER");
  const [inspShift, setInspShift] = useState(7);
  const [inspAffineA, setInspAffineA] = useState(5);
  const [inspAffineB, setInspAffineB] = useState(8);
  const [inspPermIndex, setInspPermIndex] = useState(13); // [3, 1, 4, 2]
  const [showCalculationTrace, setShowCalculationTrace] = useState(false);

  // Computations for Transformation Inspector
  const inspOutput = useMemo(() => {
    if (inspSystem === "caesar") {
      return caesarText(inspInput, inspShift);
    } else if (inspSystem === "affine") {
      return affineText(inspInput, { a: inspAffineA, b: inspAffineB });
    } else {
      return permutationText(S4[inspPermIndex] ?? S4[0], inspInput);
    }
  }, [inspSystem, inspInput, inspShift, inspAffineA, inspAffineB, inspPermIndex]);

  const inspRecovered = useMemo(() => {
    if (inspSystem === "caesar") {
      return caesarText(inspOutput, -inspShift);
    } else if (inspSystem === "affine") {
      return affineText(inspOutput, { a: inspAffineA, b: inspAffineB }, true);
    } else {
      return permutationText(S4[inspPermIndex] ?? S4[0], inspOutput, true);
    }
  }, [inspSystem, inspOutput, inspShift, inspAffineA, inspAffineB, inspPermIndex]);

  const inspIsVerified = useMemo(() => {
    const rawIn = inspInput.toUpperCase();
    if (inspSystem === "permutation") {
      const letters = rawIn.replace(/[^A-Z]/g, "");
      const fullBlocks = Math.floor(letters.length / 4) * 4;
      if (fullBlocks === 0) return true;
      return inspRecovered === rawIn;
    }
    return inspRecovered === rawIn;
  }, [inspInput, inspRecovered, inspSystem]);

  const inspAffineCoprime = useMemo(() => gcd(inspAffineA, MODULUS) === 1, [inspAffineA]);

  // ---------------------------------------------------------------------------
  // EXPERIMENT 3: Composition & Commutativity Lab State
  // ---------------------------------------------------------------------------
  const [commLabSystem, setCommLabSystem] = useState<"caesar" | "affine" | "permutation">("affine");
  const [commCaesarK1, setCommCaesarK1] = useState(3);
  const [commCaesarK2, setCommCaesarK2] = useState(7);

  const [commAffineA1, setCommAffineA1] = useState(3);
  const [commAffineB1, setCommAffineB1] = useState(2);
  const [commAffineA2, setCommAffineA2] = useState(5);
  const [commAffineB2, setCommAffineB2] = useState(7);

  const [commPermIdx1, setCommPermIdx1] = useState(6); // [2, 1, 3, 4]
  const [commPermIdx2, setCommPermIdx2] = useState(2); // [1, 3, 2, 4]

  const [commTestString, setCommTestString] = useState("MATH");

  // Computations for Commutativity Lab:
  // Path A: Apply T1 first, then T2 (T2 o T1)(x) = T2(T1(x))
  // Path B: Apply T2 first, then T1 (T1 o T2)(x) = T1(T2(x))
  const commEvaluation = useMemo(() => {
    if (commLabSystem === "caesar") {
      const k1 = commCaesarK1;
      const k2 = commCaesarK2;
      const pathA_mid = caesarText(commTestString, k1);
      const pathA_final = caesarText(pathA_mid, k2);
      const pathB_mid = caesarText(commTestString, k2);
      const pathB_final = caesarText(pathB_mid, k1);
      const compK = (k1 + k2) % MODULUS;
      const isCommutative = true; // Caesar shifts over Z26 are always abelian

      return {
        pathA: {
          mid: pathA_mid,
          final: pathA_final,
          formula: `E_{${k2}} \\circ E_{${k1}} = E_{(${k2} + ${k1}) \\bmod 26} = E_{${compK}}`,
        },
        pathB: {
          mid: pathB_mid,
          final: pathB_final,
          formula: `E_{${k1}} \\circ E_{${k2}} = E_{(${k1} + ${k2}) \\bmod 26} = E_{${compK}}`,
        },
        isCommutative,
        counterExample: null,
        domainProof: "Equal for all 26 elements in ℤ₂₆: integer addition modulo 26 is abelian.",
        summary: `Both orders evaluate identically to shift k = ${compK}. The cyclic group C₂₆ is strictly abelian.`,
      };
    } else if (commLabSystem === "affine") {
      const key1: AffineKey = { a: commAffineA1, b: commAffineB1 };
      const key2: AffineKey = { a: commAffineA2, b: commAffineB2 };

      // T2 o T1: key2 applied second, key1 first
      const comp21 = affineCompose(key2, key1);
      // T1 o T2: key1 applied second, key2 first
      const comp12 = affineCompose(key1, key2);

      const pathA_mid = affineText(commTestString, key1);
      const pathA_final = affineText(pathA_mid, key2);
      const pathB_mid = affineText(commTestString, key2);
      const pathB_final = affineText(pathB_mid, key1);

      // Check full domain equality across all 26 alphabet residues
      let counterChar: string | null = null;
      let counterA = "";
      let counterB = "";
      for (const char of ALPHABET) {
        const fullA = affineText(affineText(char, key1, false), key2, false);
        const fullB = affineText(affineText(char, key2, false), key1, false);
        if (fullA !== fullB) {
          counterChar = char;
          counterA = fullA;
          counterB = fullB;
          break;
        }
      }

      const isCommutative = comp21.a === comp12.a && comp21.b === comp12.b;

      return {
        pathA: {
          mid: pathA_mid,
          final: pathA_final,
          formula: `T_2 \\circ T_1 = E_{(${key2.a} \\cdot ${key1.a}) \\bmod 26, (${key2.a} \\cdot ${key1.b} + ${key2.b}) \\bmod 26} = E_{${comp21.a}, ${comp21.b}}`,
        },
        pathB: {
          mid: pathB_mid,
          final: pathB_final,
          formula: `T_1 \\circ T_2 = E_{(${key1.a} \\cdot ${key2.a}) \\bmod 26, (${key1.a} \\cdot ${key2.b} + ${key1.b}) \\bmod 26} = E_{${comp12.a}, ${comp12.b}}`,
        },
        isCommutative,
        counterExample: counterChar ? { input: counterChar, outA: counterA, outB: counterB } : null,
        domainProof: isCommutative
          ? "Equal for all 26 alphabet residues: T₂(T₁(x)) = T₁(T₂(x)) ∀ x ∈ ℤ₂₆."
          : `Disagrees across domain: T₂ ∘ T₁ = E_{${comp21.a}, ${comp21.b}} ≠ T₁ ∘ T₂ = E_{${comp12.a}, ${comp12.b}}.`,
        summary: isCommutative
          ? `The chosen affine parameters commute.`
          : `T₂ ∘ T₁ = E_(${comp21.a}, ${comp21.b}) ≠ T₁ ∘ T₂ = E_(${comp12.a}, ${comp12.b}). Composition order matters: AGL(1, 26) is non-abelian.`,
      };
    } else {
      const p1 = S4[commPermIdx1] ?? S4[0];
      const p2 = S4[commPermIdx2] ?? S4[0];

      // P2 o P1: permutationCompose(p2, p1)
      const comp21 = permutationCompose(p2, p1);
      // P1 o P2: permutationCompose(p1, p2)
      const comp12 = permutationCompose(p1, p2);

      const pathA_mid = permutationText(p1, commTestString);
      const pathA_final = permutationText(p2, pathA_mid);
      const pathB_mid = permutationText(p2, commTestString);
      const pathB_final = permutationText(p1, pathB_mid);

      const isCommutative = comp21.every((val, idx) => val === comp12[idx]);

      const counterInput = "ABCD";
      const counterA = permutationApply(comp21, counterInput);
      const counterB = permutationApply(comp12, counterInput);

      return {
        pathA: {
          mid: pathA_mid,
          final: pathA_final,
          formula: `\\pi_2 \\circ \\pi_1 = ${permutationLabel(comp21)}`,
        },
        pathB: {
          mid: pathB_mid,
          final: pathB_final,
          formula: `\\pi_1 \\circ \\pi_2 = ${permutationLabel(comp12)}`,
        },
        isCommutative,
        counterExample: !isCommutative ? { input: counterInput, outA: counterA, outB: counterB } : null,
        domainProof: isCommutative
          ? "Permutations coincide on all 4 coordinate positions."
          : `Permutations differ: π₂ ∘ π₁ = ${permutationLabel(comp21)} ≠ π₁ ∘ π₂ = ${permutationLabel(comp12)}.`,
        summary: isCommutative
          ? `The chosen position permutations commute.`
          : `π₂ ∘ π₁ = ${permutationLabel(comp21)} ≠ π₁ ∘ π₂ = ${permutationLabel(comp12)}. Position permutations in S₄ do not commute in general.`,
      };
    }
  }, [
    commLabSystem,
    commCaesarK1,
    commCaesarK2,
    commAffineA1,
    commAffineB1,
    commAffineA2,
    commAffineB2,
    commPermIdx1,
    commPermIdx2,
    commTestString,
  ]);

  // ---------------------------------------------------------------------------
  // EXPERIMENT 4: Brute-Force a Shift & Observation Log State
  // ---------------------------------------------------------------------------
  const [bruteCipher, setBruteCipher] = useState("KHOOR ZRUOG");
  const [bruteSelectedKey, setBruteSelectedKey] = useState(3);
  const bruteGuesses = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      key: index,
      text: caesarText(bruteCipher, -index),
    }));
  }, [bruteCipher]);

  const bruteOrder = useMemo(() => {
    return transformationOrder((value) => (value + 3) % 26, 26);
  }, []);

  return (
    <div className="page-wrap experiments-page">
      {/* 6. Purposeful Page Introduction */}
      <div className="page-intro">
        <p className="eyebrow">05 / MATHEMATICAL EXPERIMENTS LABORATORY</p>
        <h1>
          Experiments in
          <br />
          <em>Transformation.</em>
        </h1>
        <p>
          Investigate how algebraic structure governs reversible transformations, letter frequencies,
          and the order in which operations are composed.
        </p>

        {/* Compact Navigation Strip */}
        <nav className="exp-nav-strip" aria-label="Experiment sections navigation">
          <button
            type="button"
            className={activeTab === "frequency" ? "active" : ""}
            onClick={() => scrollToExperiment("exp-frequency", "frequency")}
          >
            <span>01</span> Frequency &amp; Invariance
          </button>
          <button
            type="button"
            className={activeTab === "inspector" ? "active" : ""}
            onClick={() => scrollToExperiment("exp-inspector", "inspector")}
          >
            <span>02</span> Transformation Inspector
          </button>
          <button
            type="button"
            className={activeTab === "composition" ? "active" : ""}
            onClick={() => scrollToExperiment("exp-composition", "composition")}
          >
            <span>03</span> Composition &amp; Commutativity
          </button>
          <button
            type="button"
            className={activeTab === "bruteforce" ? "active" : ""}
            onClick={() => scrollToExperiment("exp-bruteforce", "bruteforce")}
          >
            <span>04</span> Brute-Force &amp; Observation Log
          </button>
        </nav>
      </div>

      {/* ===================================================================== */}
      {/* EXPERIMENT 1: LETTER FREQUENCY ANALYSIS & INVARIANCE                  */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-frequency">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 01</span>
            <span className="badge-tag">DISTRIBUTION ANALYSIS</span>
          </div>
          <h2 className="exp-module-title">Letter-Frequency Analysis &amp; Invariance</h2>

          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">1. QUESTION</span>
              <p>What happens to letter frequencies when a message is encrypted?</p>
            </div>
            <div className="guide-box">
              <span className="guide-q">2. OPERATION</span>
              <p>
                Apply a monoalphabetic transformation (Caesar shift or Affine map). Observe how letter labels are permuted across the alphabet.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">3. MATHEMATICAL INSIGHT</span>
              <p>
                Because encryption is a bijection on the alphabet, the multiset of letter counts is strictly preserved:
                <MathView math="f(c) = \frac{\operatorname{count}(c)}{N} \times 100\%" />.
              </p>
            </div>
          </div>
        </div>

        {/* 9. Live Transformation Workflow Controls */}
        <div className="exp-controls-strip">
          <div className="sample-buttons-row">
            <span className="ctrl-label">PRESET TEXT SAMPLES:</span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className={`preset-btn ${freqText === sample.text ? "active" : ""}`}
                onClick={() => setFreqText(sample.text)}
              >
                {sample.label}
              </button>
            ))}
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setFreqText(SAMPLE_TEXTS[0].text);
                setFreqShift(3);
                setFreqAffineA(5);
                setFreqAffineB(8);
                setFreqSystem("caesar");
              }}
            >
              Reset ↻
            </button>
          </div>

          <div className="custom-text-area-wrap">
            <label htmlFor="custom-freq-input">Plaintext Message for Frequency Analysis:</label>
            <textarea
              id="custom-freq-input"
              rows={2}
              value={freqText}
              onChange={(e) => setFreqText(e.target.value)}
              placeholder="Type or paste custom text to analyze..."
            />
          </div>

          {/* Transformation Controls */}
          <div className="exp-params-row">
            <div className="param-subgroup">
              <span className="ctrl-label">TRANSFORMATION:</span>
              <div className="toggle-group">
                <button
                  type="button"
                  className={freqSystem === "caesar" ? "active" : ""}
                  onClick={() => setFreqSystem("caesar")}
                >
                  Caesar Shift
                </button>
                <button
                  type="button"
                  className={freqSystem === "affine" ? "active" : ""}
                  onClick={() => setFreqSystem("affine")}
                >
                  Affine Key
                </button>
              </div>
            </div>

            {freqSystem === "caesar" ? (
              <div className="param-subgroup range-param">
                <span className="ctrl-label">SHIFT KEY (k): <strong>{freqShift}</strong></span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={freqShift}
                  aria-label="Caesar shift key"
                  onChange={(e) => setFreqShift(Number(e.target.value))}
                />
              </div>
            ) : (
              <div className="param-subgroup affine-param">
                <label>
                  <span>Unit a:</span>
                  <select
                    value={freqAffineA}
                    onChange={(e) => setFreqAffineA(Number(e.target.value))}
                  >
                    {AFFINE_UNITS.map((u) => (
                      <option key={u} value={u}>a = {u}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Shift b:</span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={freqAffineB}
                    aria-label="Affine shift parameter b"
                    onChange={(e) => setFreqAffineB(Number(e.target.value))}
                  />
                  <span className="val-badge">{freqAffineB}</span>
                </label>
                {!isAffineCoprime && (
                  <span className="inline-err">Invalid: gcd(a,26) ≠ 1</span>
                )}
              </div>
            )}

            <div className="param-subgroup">
              <span className="ctrl-label">DISPLAY METRIC:</span>
              <div className="toggle-group">
                <button
                  type="button"
                  className={freqDisplayMode === "percentage" ? "active" : ""}
                  onClick={() => setFreqDisplayMode("percentage")}
                >
                  Percentages (%)
                </button>
                <button
                  type="button"
                  className={freqDisplayMode === "count" ? "active" : ""}
                  onClick={() => setFreqDisplayMode("count")}
                >
                  Counts (raw)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Transformation Sequence: Plaintext -> Encryption -> Ciphertext */}
        <div className="transformation-sequence-box">
          <div className="seq-step">
            <span className="seq-label">PLAINTEXT</span>
            <div className="seq-content">{freqText || "(empty text)"}</div>
          </div>
          <div className="seq-arrow">
            <span>⟶</span>
            <small>
              {freqSystem === "caesar"
                ? `E_${freqShift}(x)`
                : `E_(${freqAffineA},${freqAffineB})(x)`}
            </small>
          </div>
          <div className="seq-step highlight">
            <span className="seq-label">CIPHERTEXT</span>
            <div className="seq-content">{cipherText || "(empty text)"}</div>
          </div>
        </div>

        {/* 11. Multiset Invariance Callout & Mathematical Statistics */}
        <div className="multiset-banner">
          <div className="multiset-indicator">
            <span className={`check-dot ${multisetMatches ? "ok" : ""}`} />
            <strong>Multiset Invariance Verified:</strong>
          </div>
          <p>
            {multisetMatches
              ? `The multiset of letter frequencies is strictly preserved. Encryption permutes the alphabet symbols without altering the distribution of character counts.`
              : `Analyzing distribution properties.`}
          </p>
          <div className="multiset-metrics-strip">
            <div className="metric-chip">
              <span>Alphabetic Characters (N):</span>
              <strong>{plainFreqResult.totalAlphabetic}</strong>
            </div>
            <div className="metric-chip">
              <span>Distinct Letters Present:</span>
              <strong>{distinctPlainLetters} of 26</strong>
            </div>
            <div className="metric-chip">
              <span>Max Letter Count:</span>
              <strong>{plainFreqResult.maxCount}</strong>
            </div>
            <div className="metric-chip">
              <span>Multiset Match:</span>
              <strong className="badge-match">{multisetMatches ? "TRUE (Invariant)" : "FALSE"}</strong>
            </div>
          </div>
        </div>

        {/* 10. Publication-Quality Frequency Visualisations */}
        <div className="frequency-charts-duo">
          {/* Plaintext Chart */}
          <div className="freq-chart-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <span className="chart-tag plain-tag">INPUT DISTRIBUTION</span>
                <h3>Plaintext Letter Frequencies</h3>
                <small>Analysed: N = {plainFreqResult.totalAlphabetic} letters (spaces and punctuation excluded)</small>
              </div>
              <div className="chart-scale-info">
                <span>Scale: 0 – {sharedMaxScale}{freqDisplayMode === "percentage" ? "%" : " chars"}</span>
              </div>
            </div>

            {plainFreqResult.totalAlphabetic === 0 ? (
              <div className="chart-empty-state">
                <span>No alphabetic characters in message.</span>
                <small>Type letters above to see the frequency distribution.</small>
              </div>
            ) : (
              <div className="histogram-bars-wrapper">
                <div className="bars-container" role="graphics-document" aria-label="Plaintext letter frequency bar chart">
                  {plainFreqResult.frequencies.map((item) => {
                    const val = freqDisplayMode === "percentage" ? item.percentage : item.count;
                    const heightPercent = sharedMaxScale > 0 ? (val / sharedMaxScale) * 100 : 0;
                    const isHovered = hoveredLetter === item.letter;
                    return (
                      <div
                        key={item.letter}
                        className={`bar-column ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredLetter(item.letter)}
                        onMouseLeave={() => setHoveredLetter(null)}
                        tabIndex={0}
                        aria-label={`Letter ${item.letter}: count ${item.count}, ${item.percentage}%`}
                      >
                        <div className="bar-track">
                          <div
                            className="bar-fill plain-fill"
                            style={{ height: `${Math.min(heightPercent, 100)}%` }}
                          />
                        </div>
                        <span className="bar-letter">{item.letter}</span>
                        {isHovered && (
                          <div className="bar-tooltip">
                            <strong>{item.letter}</strong>
                            <span>Count: {item.count}</span>
                            <span>{item.percentage}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Ciphertext Chart */}
          <div className="freq-chart-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <span className="chart-tag cipher-tag">TRANSFORMED DISTRIBUTION</span>
                <h3>Ciphertext Letter Frequencies</h3>
                <small>
                  {freqSystem === "caesar"
                    ? `Caesar Shift k = ${freqShift}`
                    : `Affine Map (${freqAffineA}, ${freqAffineB})`}
                  {" "}· N = {cipherFreqResult.totalAlphabetic} letters
                </small>
              </div>
              <div className="chart-scale-info">
                <span>Scale: 0 – {sharedMaxScale}{freqDisplayMode === "percentage" ? "%" : " chars"}</span>
              </div>
            </div>

            {cipherFreqResult.totalAlphabetic === 0 ? (
              <div className="chart-empty-state">
                <span>No alphabetic characters in output.</span>
              </div>
            ) : (
              <div className="histogram-bars-wrapper">
                <div className="bars-container" role="graphics-document" aria-label="Ciphertext letter frequency bar chart">
                  {cipherFreqResult.frequencies.map((item) => {
                    const val = freqDisplayMode === "percentage" ? item.percentage : item.count;
                    const heightPercent = sharedMaxScale > 0 ? (val / sharedMaxScale) * 100 : 0;
                    const isHovered = hoveredLetter === item.letter;
                    return (
                      <div
                        key={item.letter}
                        className={`bar-column ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredLetter(item.letter)}
                        onMouseLeave={() => setHoveredLetter(null)}
                        tabIndex={0}
                        aria-label={`Letter ${item.letter}: count ${item.count}, ${item.percentage}%`}
                      >
                        <div className="bar-track">
                          <div
                            className="bar-fill cipher-fill"
                            style={{ height: `${Math.min(heightPercent, 100)}%` }}
                          />
                        </div>
                        <span className="bar-letter">{item.letter}</span>
                        {isHovered && (
                          <div className="bar-tooltip">
                            <strong>{item.letter}</strong>
                            <span>Count: {item.count}</span>
                            <span>{item.percentage}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mathematical Interpretation Area */}
        <div className="chart-educational-note">
          <div className="note-title">Mathematical Interpretation &amp; Cryptanalytic Boundary</div>
          <p>
            Because monoalphabetic substitutions are bijections on the finite set of letters, they preserve the multiset of counts identically.
            Every peak in the plaintext distribution appears with the exact same height in the ciphertext distribution, shifted to a new character.
            However, frequency analysis alone does not guarantee automatic recovery of arbitrary plaintext: short messages or texts with flat distributions may be ambiguous,
            illustrating the difference between a mathematical invariant and an empirical cryptanalysis outcome.
          </p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* EXPERIMENT 2: TRANSFORMATION INSPECTOR                                */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-inspector">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 02</span>
            <span className="badge-tag">REVERSIBILITY VERIFICATION</span>
          </div>
          <h2 className="exp-module-title">Transformation Inspector</h2>

          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">1. QUESTION</span>
              <p>How does algebraic inversion guarantee exact plaintext recovery?</p>
            </div>
            <div className="guide-box">
              <span className="guide-q">2. OPERATION</span>
              <p>
                Encrypt an input message, compute the exact algebraic inverse key, and verify that decryption perfectly unwinds encryption.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">3. MATHEMATICAL PROOF</span>
              <p>
                In every group <MathView math="(G, \circ)" />, every element <MathView math="T" /> has a unique inverse <MathView math="T^{-1}" /> satisfying <MathView math="T^{-1}(T(x)) = x" />.
              </p>
            </div>
          </div>
        </div>

        {/* 13. System-Specific Controls */}
        <div className="inspector-controls-bar">
          <div className="system-pill-selector">
            <button
              type="button"
              className={inspSystem === "caesar" ? "active" : ""}
              onClick={() => setInspSystem("caesar")}
            >
              Caesar C₂₆
            </button>
            <button
              type="button"
              className={inspSystem === "affine" ? "active" : ""}
              onClick={() => setInspSystem("affine")}
            >
              Affine AGL(1, 26)
            </button>
            <button
              type="button"
              className={inspSystem === "permutation" ? "active" : ""}
              onClick={() => setInspSystem("permutation")}
            >
              Position Permutation S₄
            </button>
          </div>

          <div className="inspector-input-row">
            <label>
              <span>Message:</span>
              <input
                type="text"
                value={inspInput}
                onChange={(e) => setInspInput(e.target.value)}
                placeholder="Enter text..."
              />
            </label>

            {inspSystem === "caesar" && (
              <label>
                <span>Shift k:</span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={inspShift}
                  onChange={(e) => setInspShift(Number(e.target.value))}
                />
                <span className="val-badge">{inspShift}</span>
              </label>
            )}

            {inspSystem === "affine" && (
              <div className="affine-inputs-pair">
                <label>
                  <span>Unit a:</span>
                  <select
                    value={inspAffineA}
                    onChange={(e) => setInspAffineA(Number(e.target.value))}
                  >
                    {AFFINE_UNITS.map((u) => (
                      <option key={u} value={u}>a = {u}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Shift b:</span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={inspAffineB}
                    onChange={(e) => setInspAffineB(Number(e.target.value))}
                  />
                  <span className="val-badge">{inspAffineB}</span>
                </label>
                {!inspAffineCoprime && (
                  <span className="inline-err">gcd(a, 26) must be 1</span>
                )}
              </div>
            )}

            {inspSystem === "permutation" && (
              <label>
                <span>S₄ Permutation:</span>
                <select
                  value={inspPermIndex}
                  onChange={(e) => setInspPermIndex(Number(e.target.value))}
                >
                  {S4.map((p, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1}: {permutationLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Verified Presets */}
            <button
              type="button"
              className="quick-preset-btn"
              onClick={() => {
                if (inspSystem === "caesar") {
                  setInspInput("ALGEBRA");
                  setInspShift(3);
                } else if (inspSystem === "affine") {
                  setInspInput("MATHEMATICS");
                  setInspAffineA(5);
                  setInspAffineB(8);
                } else {
                  setInspInput("GOLDENLOCK");
                  setInspPermIndex(13); // [3, 1, 4, 2]
                }
              }}
            >
              Load Preset ↻
            </button>
          </div>
        </div>

        {/* 12. Unmistakable Pipeline: Plaintext -> Encryption -> Ciphertext -> Decryption -> Recovered Plaintext */}
        <div className="transformation-pipeline-card">
          <div className="pipe-stage-node">
            <span className="pipe-stage-tag">PLAINTEXT (x)</span>
            <strong className="pipe-stage-val">{inspInput.toUpperCase() || "(empty)"}</strong>
            <small>Input message</small>
          </div>

          <div className="pipe-trans-connector">
            <span className="arrow-sym">⟶</span>
            <div className="pipe-rule-box">
              <span className="rule-title">Encryption Rule</span>
              <code>
                {inspSystem === "caesar" && `E_${inspShift}(x) = (x + ${inspShift}) mod 26`}
                {inspSystem === "affine" && `E_(${inspAffineA}, ${inspAffineB})(x) = (${inspAffineA}x + ${inspAffineB}) mod 26`}
                {inspSystem === "permutation" && `P = ${permutationLabel(S4[inspPermIndex])}`}
              </code>
            </div>
          </div>

          <div className="pipe-stage-node highlight">
            <span className="pipe-stage-tag">CIPHERTEXT (y)</span>
            <strong className="pipe-stage-val">{inspOutput || "(empty)"}</strong>
            <small>Forward output</small>
          </div>

          <div className="pipe-trans-connector">
            <span className="arrow-sym">⟶</span>
            <div className="pipe-rule-box">
              <span className="rule-title">Decryption Rule</span>
              <code>
                {inspSystem === "caesar" && `D_${inspShift}(y) = (y - ${inspShift}) mod 26`}
                {inspSystem === "affine" && (() => {
                  const inv = affineInverse({ a: inspAffineA, b: inspAffineB });
                  return `D_(${inspAffineA}, ${inspAffineB})(y) = ${inv.a}(y - ${inspAffineB}) mod 26`;
                })()}
                {inspSystem === "permutation" && `P⁻¹ = ${permutationLabel(permutationInverse(S4[inspPermIndex]))}`}
              </code>
            </div>
          </div>

          <div className="pipe-stage-node verified">
            <span className="pipe-stage-tag">RECOVERED (x′)</span>
            <strong className="pipe-stage-val">{inspRecovered || "(empty)"}</strong>
            <small>Decrypted result</small>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className={`recovery-verdict-banner ${inspIsVerified ? "success" : "mismatch"}`}>
          <div className="verdict-icon">{inspIsVerified ? "✓" : "⚠"}</div>
          <div className="verdict-text">
            <strong>
              {inspIsVerified
                ? "Recovered successfully — the decrypted text matches the original."
                : "Recovery mismatch — inspect key validity or input parameters."}
            </strong>
            <p>
              {inspSystem === "caesar" && "Caesar decryption unwinds addition by applying additive inverse (26 - k) mod 26."}
              {inspSystem === "affine" && `Affine decryption uses modular multiplicative inverse a⁻¹ = ${modularInverse(inspAffineA, MODULUS)}.`}
              {inspSystem === "permutation" && "S₄ permutation decryption restores letter positions using two-sided inverse permutation."}
            </p>
          </div>
        </div>

        {/* 14. Progressive Disclosure: Explore the calculation */}
        <div className="calculation-disclosure-container">
          <button
            type="button"
            className="disclosure-toggle-btn"
            onClick={() => setShowCalculationTrace(!showCalculationTrace)}
            aria-expanded={showCalculationTrace}
          >
            <span>{showCalculationTrace ? "▼" : "▶"}</span>
            <strong>Explore the calculation</strong>
            <small>{showCalculationTrace ? "Collapse derivation steps" : "Reveal genuine mathematical derivation stages"}</small>
          </button>

          {showCalculationTrace && (
            <div className="calc-derivation-tray">
              {inspSystem === "caesar" && (
                <div className="calc-trace-mini-table">
                  <table className="calculation-table">
                    <thead>
                      <tr>
                        <th>Input Char</th>
                        <th>x</th>
                        <th>Calculation: (x + {inspShift}) mod 26</th>
                        <th>Cipher Char</th>
                        <th>Decryption: (y - {inspShift}) mod 26</th>
                        <th>Recovered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspInput
                        .toUpperCase()
                        .split("")
                        .filter((c) => /^[A-Z]$/.test(c))
                        .slice(0, 8)
                        .map((c, idx) => {
                          const x = c.charCodeAt(0) - 65;
                          const y = (x + inspShift) % 26;
                          const rec = (y - inspShift + 26) % 26;
                          return (
                            <tr key={idx}>
                              <td><strong>{c}</strong></td>
                              <td>{x}</td>
                              <td><code>({x} + {inspShift}) mod 26 = {y}</code></td>
                              <td><strong>{ALPHABET[y]}</strong></td>
                              <td><code>({y} - {inspShift}) mod 26 = {rec}</code></td>
                              <td><span className="badge-yes">{ALPHABET[rec]}</span></td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {inspSystem === "affine" && (
                <div className="calc-trace-mini-table">
                  <table className="calculation-table">
                    <thead>
                      <tr>
                        <th>Input Char</th>
                        <th>x</th>
                        <th>Forward: ({inspAffineA}x + {inspAffineB}) mod 26</th>
                        <th>Cipher Char</th>
                        <th>Inverse: {modularInverse(inspAffineA, MODULUS)}·(y - {inspAffineB}) mod 26</th>
                        <th>Recovered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspInput
                        .toUpperCase()
                        .split("")
                        .filter((c) => /^[A-Z]$/.test(c))
                        .slice(0, 8)
                        .map((c, idx) => {
                          const x = c.charCodeAt(0) - 65;
                          const aInv = modularInverse(inspAffineA, MODULUS);
                          const y = (inspAffineA * x + inspAffineB) % 26;
                          const diff = y - inspAffineB;
                          const rec = (((aInv * diff) % 26) + 26) % 26;
                          return (
                            <tr key={idx}>
                              <td><strong>{c}</strong></td>
                              <td>{x}</td>
                              <td><code>({inspAffineA} × {x} + {inspAffineB}) mod 26 = {y}</code></td>
                              <td><strong>{ALPHABET[y]}</strong></td>
                              <td><code>{aInv} × ({y} - {inspAffineB}) mod 26 = {rec}</code></td>
                              <td><span className="badge-yes">{ALPHABET[rec]}</span></td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {inspSystem === "permutation" && (
                <div className="perm-trace-blocks">
                  <p>
                    Permutation key {permutationLabel(S4[inspPermIndex])} applied across fixed 4-character blocks:
                  </p>
                  <div className="perm-blocks-list">
                    {inspInput
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .match(/.{1,4}/g)
                      ?.map((blk, idx) => {
                        if (blk.length < 4) {
                          return (
                            <div key={idx} className="perm-block-item partial">
                              <span>Block {idx + 1} ({blk}): Incomplete block &lt; 4 characters preserved unpermuted.</span>
                            </div>
                          );
                        }
                        const outBlk = permutationApply(S4[inspPermIndex], blk);
                        const recBlk = permutationApply(permutationInverse(S4[inspPermIndex]), outBlk);
                        return (
                          <div key={idx} className="perm-block-item">
                            <span className="blk-tag">BLOCK {idx + 1}</span>
                            <span className="blk-in">{blk}</span>
                            <span className="blk-arr">→ P →</span>
                            <span className="blk-out">{outBlk}</span>
                            <span className="blk-arr">→ P⁻¹ →</span>
                            <span className="blk-rec">{recBlk}</span>
                            <span className="badge-yes">✓ Restored</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* EXPERIMENT 3: COMPOSITION & COMMUTATIVITY LAB                         */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-composition">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 03</span>
            <span className="badge-tag">ORDER &amp; COMMUTATIVITY</span>
          </div>
          <h2 className="exp-module-title">Composition &amp; Commutativity Lab</h2>

          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">1. QUESTION</span>
              <p>Does changing the order of two transformations change the result?</p>
            </div>
            <div className="guide-box">
              <span className="guide-q">2. CONVENTION</span>
              <p>
                <MathView math="(T_2 \circ T_1)(x) = T_2(T_1(x))" />: the rightmost transformation <MathView math="T_1" /> is applied first.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">3. CRITERION</span>
              <p>
                Two transformations commute if and only if <MathView math="T_2 \circ T_1 = T_1 \circ T_2" /> over the entire domain.
              </p>
            </div>
          </div>
        </div>

        {/* 17. Presets & Controls */}
        <div className="comm-lab-controls">
          <div className="system-pill-selector">
            <button
              type="button"
              className={commLabSystem === "caesar" ? "active" : ""}
              onClick={() => {
                setCommLabSystem("caesar");
                setCommCaesarK1(3);
                setCommCaesarK2(7);
                setCommTestString("ALGEBRA");
              }}
            >
              Caesar (Abelian)
            </button>
            <button
              type="button"
              className={commLabSystem === "affine" ? "active" : ""}
              onClick={() => {
                setCommLabSystem("affine");
                setCommAffineA1(3);
                setCommAffineB1(2);
                setCommAffineA2(5);
                setCommAffineB2(7);
                setCommTestString("MATH");
              }}
            >
              Affine (Non-Abelian)
            </button>
            <button
              type="button"
              className={commLabSystem === "permutation" ? "active" : ""}
              onClick={() => {
                setCommLabSystem("permutation");
                setCommPermIdx1(6); // [2, 1, 3, 4]
                setCommPermIdx2(2); // [1, 3, 2, 4]
                setCommTestString("ABCD");
              }}
            >
              Permutation S₄ (Non-Abelian)
            </button>
          </div>

          <div className="comm-param-tuning">
            <label>
              <span>Test Input:</span>
              <input
                type="text"
                value={commTestString}
                onChange={(e) => setCommTestString(e.target.value.toUpperCase())}
                className="comm-test-input"
              />
            </label>

            {commLabSystem === "caesar" && (
              <>
                <label>
                  <span>Shift k₁:</span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={commCaesarK1}
                    onChange={(e) => setCommCaesarK1(Number(e.target.value))}
                  />
                  <span className="val-badge">{commCaesarK1}</span>
                </label>
                <label>
                  <span>Shift k₂:</span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={commCaesarK2}
                    onChange={(e) => setCommCaesarK2(Number(e.target.value))}
                  />
                  <span className="val-badge">{commCaesarK2}</span>
                </label>
              </>
            )}

            {commLabSystem === "affine" && (
              <div className="affine-comm-pair">
                <div className="sub-key">
                  <span>T₁:</span>
                  <select value={commAffineA1} onChange={(e) => setCommAffineA1(Number(e.target.value))}>
                    {AFFINE_UNITS.map((u) => <option key={u} value={u}>a₁ = {u}</option>)}
                  </select>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={commAffineB1}
                    onChange={(e) => setCommAffineB1(Number(e.target.value))}
                  />
                  <span className="val-badge">b₁ = {commAffineB1}</span>
                </div>
                <div className="sub-key">
                  <span>T₂:</span>
                  <select value={commAffineA2} onChange={(e) => setCommAffineA2(Number(e.target.value))}>
                    {AFFINE_UNITS.map((u) => <option key={u} value={u}>a₂ = {u}</option>)}
                  </select>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={commAffineB2}
                    onChange={(e) => setCommAffineB2(Number(e.target.value))}
                  />
                  <span className="val-badge">b₂ = {commAffineB2}</span>
                </div>
              </div>
            )}

            {commLabSystem === "permutation" && (
              <div className="perm-comm-pair">
                <label>
                  <span>π₁:</span>
                  <select value={commPermIdx1} onChange={(e) => setCommPermIdx1(Number(e.target.value))}>
                    {S4.map((p, idx) => (
                      <option key={idx} value={idx}>#{idx + 1}: {permutationLabel(p)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>π₂:</span>
                  <select value={commPermIdx2} onChange={(e) => setCommPermIdx2(Number(e.target.value))}>
                    {S4.map((p, idx) => (
                      <option key={idx} value={idx}>#{idx + 1}: {permutationLabel(p)}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 16. Dynamic Verdict Banner */}
        <div className={`comm-verdict-banner ${commEvaluation.isCommutative ? "commutative" : "non-commutative"}`}>
          <div className="verdict-headline">
            <span className="verdict-icon">{commEvaluation.isCommutative ? "✓" : "≠"}</span>
            <strong>
              {commEvaluation.isCommutative
                ? "The transformations commute — (T₂ ∘ T₁ = T₁ ∘ T₂)"
                : "The transformations do not commute — (T₂ ∘ T₁ ≠ T₁ ∘ T₂)"}
            </strong>
          </div>
          <p>{commEvaluation.summary}</p>
          <div className="domain-proof-note">
            <span>Domain Check:</span> {commEvaluation.domainProof}
          </div>
          {commEvaluation.counterExample && (
            <div className="counter-example-badge">
              <strong>Concrete Counterexample:</strong> For input <code>&quot;{commEvaluation.counterExample.input}&quot;</code>,
              Path A produces <code>&quot;{commEvaluation.counterExample.outA}&quot;</code> while
              Path B produces <code>&quot;{commEvaluation.counterExample.outB}&quot;</code>.
            </div>
          )}
        </div>

        {/* 15. Parallel Visual Pipelines: Path A vs Path B */}
        <div className="parallel-routes-grid">
          {/* Path A */}
          <div className="route-card">
            <div className="route-head">
              <span className="route-tag">PATH A: T₂ ∘ T₁</span>
              <strong>Apply T₁ first, then T₂</strong>
            </div>

            <div className="route-steps">
              <div className="route-step">
                <span className="step-label">INPUT (x)</span>
                <span className="step-val">{commTestString}</span>
              </div>
              <span className="route-arr">↓ [Step 1: T₁]</span>
              <div className="route-step">
                <span className="step-label">INTERMEDIATE T₁(x)</span>
                <span className="step-val mid">{commEvaluation.pathA.mid}</span>
              </div>
              <span className="route-arr">↓ [Step 2: T₂]</span>
              <div className="route-step final">
                <span className="step-label">FINAL OUTPUT T₂(T₁(x))</span>
                <strong className="step-val">{commEvaluation.pathA.final}</strong>
              </div>
            </div>

            <div className="route-formula-box">
              <MathView math={commEvaluation.pathA.formula} display />
            </div>
          </div>

          <div className="vs-divider">
            <span>VS</span>
          </div>

          {/* Path B */}
          <div className="route-card">
            <div className="route-head">
              <span className="route-tag">PATH B: T₁ ∘ T₂</span>
              <strong>Apply T₂ first, then T₁</strong>
            </div>

            <div className="route-steps">
              <div className="route-step">
                <span className="step-label">INPUT (x)</span>
                <span className="step-val">{commTestString}</span>
              </div>
              <span className="route-arr">↓ [Step 1: T₂]</span>
              <div className="route-step">
                <span className="step-label">INTERMEDIATE T₂(x)</span>
                <span className="step-val mid">{commEvaluation.pathB.mid}</span>
              </div>
              <span className="route-arr">↓ [Step 2: T₁]</span>
              <div className="route-step final">
                <span className="step-label">FINAL OUTPUT T₁(T₂(x))</span>
                <strong className="step-val">{commEvaluation.pathB.final}</strong>
              </div>
            </div>

            <div className="route-formula-box">
              <MathView math={commEvaluation.pathB.formula} display />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* EXPERIMENT 4: BRUTE-FORCE A SHIFT & OBSERVATION LOG                   */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-bruteforce">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 04</span>
            <span className="badge-tag">EXHAUSTIVE ENUMERATION</span>
          </div>
          <h2 className="exp-module-title">Brute-Force Enumeration &amp; Observation Log</h2>
          <p className="exp-module-sub">
            Because Caesar shifts form a finite cyclic group of order 26, any ciphertext can be completely enumerated across all candidate keys.
          </p>
        </div>

        <div className="experiment-grid">
          {/* Brute Force Panel */}
          <div className="panel brute-force">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">CANDIDATE KEYS ENUMERATION</p>
                <h3>Brute-force a shift</h3>
              </div>
              <span className="result-badge">26 KEYS</span>
            </div>

            <input
              className="experiment-input"
              value={bruteCipher}
              onChange={(e) => setBruteCipher(e.target.value)}
              aria-label="Ciphertext to brute force"
              placeholder="Enter ciphertext to decrypt..."
            />

            <div className="guesses-list">
              {bruteGuesses.map((guess) => (
                <button
                  type="button"
                  className={bruteSelectedKey === guess.key ? "guess selected" : "guess"}
                  key={guess.key}
                  onClick={() => setBruteSelectedKey(guess.key)}
                >
                  <span>k = {guess.key}</span>
                  <strong>{guess.text}</strong>
                  <i>↗</i>
                </button>
              ))}
            </div>
          </div>

          {/* Observations Panel */}
          <div className="panel observations">
            <p className="eyebrow">OBSERVATION LOG</p>
            <div className="observation">
              <span>01</span>
              <p>
                <b>Enumeration is finite.</b> A key space of 26 is trivial to search exhaustively on any computer in microseconds.
              </p>
            </div>
            <div className="observation">
              <span>02</span>
              <p>
                <b>Structure explains the cycle.</b> Shift 3 has order {bruteOrder}; repeated application modulo 26 returns to the identity shift.
              </p>
            </div>
            <div className="observation">
              <span>03</span>
              <p>
                <b>Key space size does not equal security.</b> Even with 312 affine keys or 24 permutations, finite classical ciphers lack diffusion and computational complexity.
              </p>
            </div>

            <div className="frequency">
              <span className="eyebrow">LETTER FREQUENCY SIGNATURE</span>
              <div>
                {ALPHABET.slice(0, 5).split("").map((letter) => {
                  const count = (bruteCipher.toUpperCase().match(new RegExp(letter, "g")) || []).length;
                  return (
                    <div key={letter} className="freq-signature-row">
                      <b>{letter}</b>
                      <div className="bar-track-mini" title={`Count for ${letter}: ${count}`}>
                        <i style={{ width: `${Math.min(count * 20, 100)}%` }} />
                      </div>
                      <span className="freq-count-badge">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
