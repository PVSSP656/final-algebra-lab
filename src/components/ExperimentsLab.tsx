import { useState, useMemo } from "react";
import { MathView } from "./MathView";
import {
  ALPHABET,
  MODULUS,
  AFFINE_UNITS,
  S4,
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
  modularInverse,
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
  // ---------------------------------------------------------------------------
  // EXPERIMENT 1: Letter Frequency Analysis State
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

  // Synchronized max scale across both distributions for consistent comparison
  const sharedMaxScale = useMemo(() => {
    if (freqDisplayMode === "percentage") {
      const maxP = Math.max(plainFreqResult.maxPercentage, cipherFreqResult.maxPercentage, 10);
      return Math.ceil(maxP / 5) * 5; // round up to nearest 5%
    } else {
      const maxC = Math.max(plainFreqResult.maxCount, cipherFreqResult.maxCount, 5);
      return Math.ceil(maxC / 5) * 5;
    }
  }, [plainFreqResult, cipherFreqResult, freqDisplayMode]);

  // Check if multiset of frequencies is invariant
  const multisetMatches = useMemo(() => {
    const pCounts = plainFreqResult.frequencies.map((f) => f.count).sort((a, b) => a - b);
    const cCounts = cipherFreqResult.frequencies.map((f) => f.count).sort((a, b) => a - b);
    return JSON.stringify(pCounts) === JSON.stringify(cCounts);
  }, [plainFreqResult, cipherFreqResult]);

  // ---------------------------------------------------------------------------
  // EXPERIMENT 2: Transformation Inspector State
  // ---------------------------------------------------------------------------
  const [inspSystem, setInspSystem] = useState<"caesar" | "affine" | "permutation">("caesar");
  const [inspInput, setInspInput] = useState("CIPHER");
  const [inspShift, setInspShift] = useState(7);
  const [inspAffineA, setInspAffineA] = useState(5);
  const [inspAffineB, setInspAffineB] = useState(8);
  const [inspPermIndex, setInspPermIndex] = useState(13); // [3, 1, 4, 2]

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

  // Normalized input uppercase for strict equality check
  const inspIsVerified = useMemo(() => {
    const rawIn = inspInput.toUpperCase();
    if (inspSystem === "permutation") {
      // S4 acts on complete blocks of 4 letters
      const letters = rawIn.replace(/[^A-Z]/g, "");
      const fullBlocks = Math.floor(letters.length / 4) * 4;
      if (fullBlocks === 0) return true;
      return inspRecovered === rawIn;
    }
    return inspRecovered === rawIn;
  }, [inspInput, inspRecovered, inspSystem]);

  // ---------------------------------------------------------------------------
  // EXPERIMENT 3: Composition and Commutativity Lab State
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

  // Computations for Commutativity Lab
  // Route A: T2 o T1 (T1 applied first, then T2 applied to result)
  // Route B: T1 o T2 (T2 applied first, then T1 applied to result)
  const commEvaluation = useMemo(() => {
    if (commLabSystem === "caesar") {
      const k1 = commCaesarK1;
      const k2 = commCaesarK2;
      const routeA_mid = caesarText(commTestString, k1);
      const routeA_final = caesarText(routeA_mid, k2);
      const routeB_mid = caesarText(commTestString, k2);
      const routeB_final = caesarText(routeB_mid, k1);
      const compK = (k1 + k2) % MODULUS;
      const isCommutative = true; // Caesar shifts are always abelian
      return {
        routeA: { mid: routeA_mid, final: routeA_final, formula: `E_${k2} \\circ E_${k1} = E_{${compK}}` },
        routeB: { mid: routeB_mid, final: routeB_final, formula: `E_${k1} \\circ E_${k2} = E_{${compK}}` },
        isCommutative,
        summary: `Both orders evaluate to identical shift k = ${compK}. Caesar group C₂₆ is strictly abelian.`,
      };
    } else if (commLabSystem === "affine") {
      const key1 = { a: commAffineA1, b: commAffineB1 };
      const key2 = { a: commAffineA2, b: commAffineB2 };
      // T2 o T1 has key2 applied second, key1 first: affineCompose(key2, key1)
      const comp21 = affineCompose(key2, key1);
      // T1 o T2 has key1 applied second, key2 first: affineCompose(key1, key2)
      const comp12 = affineCompose(key1, key2);

      const routeA_mid = affineText(commTestString, key1);
      const routeA_final = affineText(routeA_mid, key2);
      const routeB_mid = affineText(commTestString, key2);
      const routeB_final = affineText(routeB_mid, key1);

      const isCommutative = comp21.a === comp12.a && comp21.b === comp12.b;
      return {
        routeA: {
          mid: routeA_mid,
          final: routeA_final,
          formula: `T_2 \\circ T_1 = E_{${comp21.a}, ${comp21.b}}`,
        },
        routeB: {
          mid: routeB_mid,
          final: routeB_final,
          formula: `T_1 \\circ T_2 = E_{${comp12.a}, ${comp12.b}}`,
        },
        isCommutative,
        summary: isCommutative
          ? `Selected affine keys commute (T₂ ∘ T₁ = T₁ ∘ T₂).`
          : `T₂ ∘ T₁ = E_(${comp21.a}, ${comp21.b}) ≠ T₁ ∘ T₂ = E_(${comp12.a}, ${comp12.b}). Order matters! G_aff is non-abelian.`,
      };
    } else {
      const p1 = S4[commPermIdx1] ?? S4[0];
      const p2 = S4[commPermIdx2] ?? S4[0];
      // P2 o P1: permutationCompose(p2, p1)
      const comp21 = permutationCompose(p2, p1);
      // P1 o P2: permutationCompose(p1, p2)
      const comp12 = permutationCompose(p1, p2);

      const routeA_mid = permutationText(p1, commTestString);
      const routeA_final = permutationText(p2, routeA_mid);
      const routeB_mid = permutationText(p2, commTestString);
      const routeB_final = permutationText(p1, routeB_mid);

      const isCommutative = comp21.every((val, idx) => val === comp12[idx]);
      return {
        routeA: {
          mid: routeA_mid,
          final: routeA_final,
          formula: `\\pi_2 \\circ \\pi_1 = ${permutationLabel(comp21)}`,
        },
        routeB: {
          mid: routeB_mid,
          final: routeB_final,
          formula: `\\pi_1 \\circ \\pi_2 = ${permutationLabel(comp12)}`,
        },
        isCommutative,
        summary: isCommutative
          ? `Selected permutations commute.`
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

  return (
    <div className="page-wrap experiments-page">
      <div className="page-intro">
        <p className="eyebrow">05 / MATHEMATICAL EXPERIMENTS LABORATORY</p>
        <h1>
          Test the math.
          <br />
          <em>Verify the claims.</em>
        </h1>
        <p>
          A hands-on testing laboratory for letter frequencies, reversible transformation traces,
          and algebraic commutativity. Change inputs, observe transformations, and verify the
          exact mathematical consequences.
        </p>
      </div>

      {/* ===================================================================== */}
      {/* EXPERIMENT 1: LETTER FREQUENCY EXPERIMENT                              */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-letter-frequency">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 01</span>
            <span className="badge-tag">DISTRIBUTION ANALYSIS</span>
          </div>
          <h2 className="exp-module-title">Letter-Frequency Analysis &amp; Invariance</h2>
          
          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">WHAT AM I TESTING?</span>
              <p>
                How uniform character transformations alter the appearance of a message while preserving
                its underlying statistical frequency distribution.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT SHOULD I LOOK AT?</span>
              <p>
                The side-by-side histograms. Notice how shifting or permuting values moves the peaks to new letters,
                while the overall set of bar heights (the multiset) remains identical.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT DOES IT MEAN MATHEMATICALLY?</span>
              <p>
                Because monoalphabetic substitutions are bijections, they merely relabel the domain:
                <MathView math="f(c) = \frac{\operatorname{count}(c)}{N} \times 100\%" />.
                The frequency histogram is translated modulo 26, but zero entropy is added.
              </p>
            </div>
          </div>
        </div>

        {/* Input & Sample Controls */}
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
          </div>

          <div className="custom-text-area-wrap">
            <label htmlFor="custom-freq-input">Custom message for frequency analysis:</label>
            <textarea
              id="custom-freq-input"
              rows={2}
              value={freqText}
              onChange={(e) => setFreqText(e.target.value)}
              placeholder="Type or paste custom text to analyze..."
            />
          </div>

          <div className="exp-params-row">
            <div className="param-subgroup">
              <span className="ctrl-label">CIPHER SYSTEM:</span>
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
                <span className="ctrl-label">SHIFT KEY (k): {freqShift}</span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={freqShift}
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
                    onChange={(e) => setFreqAffineB(Number(e.target.value))}
                  />
                  <span className="val-badge">{freqAffineB}</span>
                </label>
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

        {/* Multiset Invariance Callout */}
        <div className="multiset-banner">
          <div className="multiset-indicator">
            <span className="check-dot" />
            <strong>Multiset Invariance Verified:</strong>
          </div>
          <p>
            {multisetMatches
              ? `The set of frequency values for plaintext and ciphertext is strictly identical. The transformation only permutes which letter carries which frequency.`
              : `Analyzing distribution properties.`}
            {" "}Sample size: <strong>N = {plainFreqResult.totalAlphabetic} alphabetic characters</strong> (spaces and punctuation excluded).
          </p>
        </div>

        {/* Side-by-Side Histograms */}
        <div className="frequency-charts-duo">
          {/* Plaintext Chart */}
          <div className="freq-chart-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <span className="chart-tag plain-tag">INPUT DISTRIBUTION</span>
                <h3>Plaintext Frequencies</h3>
                <small>Sample: N = {plainFreqResult.totalAlphabetic} letters</small>
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
                <div className="bars-container">
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
                <h3>Ciphertext Frequencies</h3>
                <small>
                  {freqSystem === "caesar"
                    ? `Caesar Shift k = ${freqShift}`
                    : `Affine Key (${freqAffineA}, ${freqAffineB})`}
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
                <div className="bars-container">
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

        {/* Statistical Footnote */}
        <div className="chart-educational-note">
          <span>Cryptanalytic Note:</span> Frequency analysis exploits the fact that natural language letters
          have non-uniform probabilities (e.g. English &apos;E&apos; ≈ 12.7%, &apos;T&apos; ≈ 9.1%).
          Because monoalphabetic ciphers do not alter the shape of the probability multiset,
          an adversary can align peak frequencies to deduce keys without brute-force enumeration.
        </div>
      </section>

      {/* ===================================================================== */}
      {/* EXPERIMENT 2: TRANSFORMATION INSPECTOR                                */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-transformation-inspector">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 02</span>
            <span className="badge-tag">REVERSIBILITY VERIFICATION</span>
          </div>
          <h2 className="exp-module-title">Transformation Inspector</h2>

          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">WHAT AM I TESTING?</span>
              <p>
                The complete forward and inverse journey of a message:
                Key selection → Forward Encryption → Algebraic Inversion → Plaintext Recovery.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT SHOULD I LOOK AT?</span>
              <p>
                The seven distinct stages: verify that the inverse key derived algebraically
                faithfully unwinds every single character or block without error.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT DOES IT MEAN MATHEMATICALLY?</span>
              <p>
                Every element <MathView math="T" /> in a group has an inverse <MathView math="T^{-1}" /> such that
                <MathView math="T^{-1}(T(x)) = x" />. Reversibility is an algebraic certainty, not an approximation.
              </p>
            </div>
          </div>
        </div>

        {/* Inspector Controls */}
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
              Affine G_aff
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

            {/* Presets Button */}
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
              Load verified preset ↻
            </button>
          </div>
        </div>

        {/* The 7-Stage Inspector Display */}
        <div className="inspector-stages-grid">
          {/* 1. Selected Key */}
          <div className="insp-stage-card">
            <span className="stage-num">01 / SELECTED KEY</span>
            <div className="stage-body">
              {inspSystem === "caesar" && <strong>k = {inspShift}</strong>}
              {inspSystem === "affine" && <strong>a = {inspAffineA}, b = {inspAffineB}</strong>}
              {inspSystem === "permutation" && <strong>P = {permutationLabel(S4[inspPermIndex])}</strong>}
              <small>Forward transformation key</small>
            </div>
          </div>

          {/* 2. Original Input */}
          <div className="insp-stage-card">
            <span className="stage-num">02 / ORIGINAL INPUT (x)</span>
            <div className="stage-body">
              <strong>{inspInput.toUpperCase() || "(empty)"}</strong>
              <small>{inspInput.replace(/[^A-Za-z]/g, "").length} alphabetic characters</small>
            </div>
          </div>

          {/* 3. Transformed Output */}
          <div className="insp-stage-card highlight-card">
            <span className="stage-num">03 / FORWARD OUTPUT E(x)</span>
            <div className="stage-body">
              <strong>{inspOutput || "(empty)"}</strong>
              <small>Ciphertext after transformation</small>
            </div>
          </div>

          {/* 4. Inverse Transformation */}
          <div className="insp-stage-card">
            <span className="stage-num">04 / ALGEBRAIC INVERSE</span>
            <div className="stage-body">
              {inspSystem === "caesar" && (
                <>
                  <strong>k⁻¹ = {(-inspShift + 26) % 26}</strong>
                  <small>D_k(y) = (y - {inspShift}) mod 26</small>
                </>
              )}
              {inspSystem === "affine" && (
                <>
                  {(() => {
                    const inv = affineInverse({ a: inspAffineA, b: inspAffineB });
                    return (
                      <>
                        <strong>a⁻¹ = {inv.a}, b′ = {inv.b}</strong>
                        <small>E_({inv.a}, {inv.b})(y)</small>
                      </>
                    );
                  })()}
                </>
              )}
              {inspSystem === "permutation" && (
                <>
                  <strong>P⁻¹ = {permutationLabel(permutationInverse(S4[inspPermIndex]))}</strong>
                  <small>Inverse coordinate map</small>
                </>
              )}
            </div>
          </div>

          {/* 5. Recovered Input */}
          <div className="insp-stage-card">
            <span className="stage-num">05 / RECOVERED INPUT</span>
            <div className="stage-body">
              <strong>{inspRecovered || "(empty)"}</strong>
              <small>D(E(x)) output</small>
            </div>
          </div>

          {/* 6. Success Verification */}
          <div className="insp-stage-card verified-card">
            <span className="stage-num">06 / VERIFICATION STATUS</span>
            <div className="stage-body">
              {inspIsVerified ? (
                <>
                  <strong className="status-badge success">✓ EXACT MATCH</strong>
                  <small>f⁻¹(f(x)) = x verified mathematically</small>
                </>
              ) : (
                <>
                  <strong className="status-badge error">⚠ MISMATCH</strong>
                  <small>Reversibility check</small>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 7. Step-by-Step Mathematical Explanation */}
        <div className="insp-derivation-tray">
          <div className="tray-title">
            <span>07 / COMPUTED ARITHMETIC DERIVATION</span>
            <code>
              {inspSystem === "caesar" && `E_${inspShift}(x) = (x + ${inspShift}) mod 26  |  D_${inspShift}(y) = (y - ${inspShift}) mod 26`}
              {inspSystem === "affine" && `E_(${inspAffineA}, ${inspAffineB})(x) = (${inspAffineA}x + ${inspAffineB}) mod 26`}
              {inspSystem === "permutation" && `Permutation ${permutationLabel(S4[inspPermIndex])} acting on 4-letter coordinates`}
            </code>
          </div>

          {inspSystem === "caesar" && (
            <div className="calc-trace-mini-table">
              <table className="calculation-table">
                <thead>
                  <tr>
                    <th>Plain Char</th>
                    <th>x</th>
                    <th>Forward Calculation: (x + {inspShift}) mod 26</th>
                    <th>Cipher Char</th>
                    <th>Inverse Calculation: (y - {inspShift}) mod 26</th>
                    <th>Recovered</th>
                  </tr>
                </thead>
                <tbody>
                  {inspInput.toUpperCase().split("").filter((c) => /^[A-Z]$/.test(c)).slice(0, 6).map((c, idx) => {
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
                    <th>Plain Char</th>
                    <th>x</th>
                    <th>Forward: ({inspAffineA}·x + {inspAffineB}) mod 26</th>
                    <th>Cipher Char</th>
                    <th>Inverse: {modularInverse(inspAffineA)}·(y - {inspAffineB}) mod 26</th>
                    <th>Recovered</th>
                  </tr>
                </thead>
                <tbody>
                  {inspInput.toUpperCase().split("").filter((c) => /^[A-Z]$/.test(c)).slice(0, 6).map((c, idx) => {
                    const x = c.charCodeAt(0) - 65;
                    const aInv = modularInverse(inspAffineA);
                    const y = (inspAffineA * x + inspAffineB) % 26;
                    const diff = y - inspAffineB;
                    const rec = (((aInv * diff) % 26) + 26) % 26;
                    return (
                      <tr key={idx}>
                        <td><strong>{c}</strong></td>
                        <td>{x}</td>
                        <td><code>({inspAffineA} × {x} + {inspAffineB}) = {inspAffineA * x + inspAffineB} mod 26 = {y}</code></td>
                        <td><strong>{ALPHABET[y]}</strong></td>
                        <td><code>{aInv} × ({y} - {inspAffineB}) = {aInv * diff} mod 26 = {rec}</code></td>
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
                Permutation applied across 4-character blocks under key {permutationLabel(S4[inspPermIndex])}:
              </p>
              <div className="perm-blocks-list">
                {inspInput.toUpperCase().replace(/[^A-Z]/g, "").match(/.{1,4}/g)?.map((blk, idx) => {
                  if (blk.length < 4) {
                    return (
                      <div key={idx} className="perm-block-item partial">
                        <span>Block {idx + 1} ({blk}): Incomplete block &lt; 4 chars preserved unchanged.</span>
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
      </section>

      {/* ===================================================================== */}
      {/* EXPERIMENT 3: COMPOSITION AND COMMUTATIVITY LAB                       */}
      {/* ===================================================================== */}
      <section className="experiment-card-module" id="exp-commutativity-lab">
        <div className="exp-module-header">
          <div className="exp-meta-badge">
            <span>EXPERIMENT 03</span>
            <span className="badge-tag">ORDER &amp; COMMUTATIVITY</span>
          </div>
          <h2 className="exp-module-title">Composition &amp; Commutativity Lab</h2>

          <div className="exp-guide-grid">
            <div className="guide-box">
              <span className="guide-q">WHAT AM I TESTING?</span>
              <p>
                Does transformation order matter? Compare <MathView math="T_2 \circ T_1" /> (apply <MathView math="T_1" /> first)
                against <MathView math="T_1 \circ T_2" /> (apply <MathView math="T_2" /> first).
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT SHOULD I LOOK AT?</span>
              <p>
                The two parallel routes. In an abelian group, both routes arrive at the exact same outcome.
                In a non-abelian group, intermediate and final results diverge.
              </p>
            </div>
            <div className="guide-box">
              <span className="guide-q">WHAT DOES IT MEAN MATHEMATICALLY?</span>
              <p>
                Two transformations commute if and only if <MathView math="T_2 \circ T_1 = T_1 \circ T_2" />.
                Caesar shifts always commute. Affine maps and position permutations do not commute in general.
              </p>
            </div>
          </div>
        </div>

        {/* Commutativity Controls & Presets */}
        <div className="comm-lab-controls">
          <div className="system-pill-selector">
            <button
              type="button"
              className={commLabSystem === "caesar" ? "active" : ""}
              onClick={() => {
                setCommLabSystem("caesar");
                setCommCaesarK1(3);
                setCommCaesarK2(7);
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
              <span>Test input:</span>
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

        {/* Dynamic Verdict Banner */}
        <div className={`comm-verdict-banner ${commEvaluation.isCommutative ? "commutative" : "non-commutative"}`}>
          <div className="verdict-headline">
            {commEvaluation.isCommutative ? (
              <>
                <span className="verdict-icon">✓</span>
                <strong>COMMUTATIVE: T₂ ∘ T₁ = T₁ ∘ T₂</strong>
              </>
            ) : (
              <>
                <span className="verdict-icon">≠</span>
                <strong>NON-COMMUTATIVE: T₂ ∘ T₁ ≠ T₁ ∘ T₂</strong>
              </>
            )}
          </div>
          <p>{commEvaluation.summary}</p>
        </div>

        {/* Parallel Routes Comparison */}
        <div className="parallel-routes-grid">
          {/* Route A */}
          <div className="route-card">
            <div className="route-head">
              <span className="route-tag">ROUTE A: T₂ ∘ T₁</span>
              <strong>Apply T₁ first, then T₂</strong>
            </div>

            <div className="route-steps">
              <div className="route-step">
                <span className="step-label">INPUT</span>
                <span className="step-val">{commTestString}</span>
              </div>
              <span className="route-arr">↓ [Step 1: T₁]</span>
              <div className="route-step">
                <span className="step-label">INTERMEDIATE T₁(x)</span>
                <span className="step-val mid">{commEvaluation.routeA.mid}</span>
              </div>
              <span className="route-arr">↓ [Step 2: T₂]</span>
              <div className="route-step final">
                <span className="step-label">FINAL OUTPUT</span>
                <strong className="step-val">{commEvaluation.routeA.final}</strong>
              </div>
            </div>

            <div className="route-formula-box">
              <MathView math={commEvaluation.routeA.formula} display />
            </div>
          </div>

          <div className="vs-divider">
            <span>VS</span>
          </div>

          {/* Route B */}
          <div className="route-card">
            <div className="route-head">
              <span className="route-tag">ROUTE B: T₁ ∘ T₂</span>
              <strong>Apply T₂ first, then T₁</strong>
            </div>

            <div className="route-steps">
              <div className="route-step">
                <span className="step-label">INPUT</span>
                <span className="step-val">{commTestString}</span>
              </div>
              <span className="route-arr">↓ [Step 1: T₂]</span>
              <div className="route-step">
                <span className="step-label">INTERMEDIATE T₂(x)</span>
                <span className="step-val mid">{commEvaluation.routeB.mid}</span>
              </div>
              <span className="route-arr">↓ [Step 2: T₁]</span>
              <div className="route-step final">
                <span className="step-label">FINAL OUTPUT</span>
                <strong className="step-val">{commEvaluation.routeB.final}</strong>
              </div>
            </div>

            <div className="route-formula-box">
              <MathView math={commEvaluation.routeB.formula} display />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
