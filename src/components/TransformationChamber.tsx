import { useState, useRef, useMemo, useCallback } from "react";
import { MathView } from "./MathView";
import {
  ALPHABET,
  S4,
  caesarValue,
  affineValue,
  affineInverse,
  permutationApply,
  permutationInverse,
  permutationLabel,
  type AffineKey,
} from "../math/engine";

type SystemMode = "caesar" | "affine" | "permutation";
type ActiveNodeId = "input" | "forward" | "output" | "inverse" | "recovered" | null;

interface TransformationChamberProps {
  className?: string;
}

export function TransformationChamber({ className = "" }: TransformationChamberProps) {
  const [system, setSystem] = useState<SystemMode>("caesar");

  // Selected parameters per system
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarInputLetter, setCaesarInputLetter] = useState("K");

  const [affineKey, setAffineKey] = useState<AffineKey>({ a: 5, b: 8 });
  const [affineInputLetter, setAffineInputLetter] = useState("M");

  const [permIndex, setPermIndex] = useState(13); // [3,1,4,2]
  const [permInputBlock, setPermInputBlock] = useState("MATH");

  // Active highlighted node modal / card
  const [activeNode, setActiveNode] = useState<ActiveNodeId>(null);

  // Animation cycle state: idle | forward | output | inverse | complete
  const [animStage, setAnimStage] = useState<"idle" | "forward" | "output" | "inverse" | "complete">("idle");
  const [isCycleRunning, setIsCycleRunning] = useState(false);

  // Parallax / cursor tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Calculations for current system
  const currentComputation = useMemo(() => {
    if (system === "caesar") {
      const inChar = caesarInputLetter.toUpperCase().slice(0, 1) || "A";
      const xVal = inChar.charCodeAt(0) - 65;
      const validX = xVal >= 0 && xVal < 26 ? xVal : 0;
      const inClean = ALPHABET[validX]!;
      const fxVal = caesarValue(validX, caesarShift);
      const fxChar = ALPHABET[fxVal]!;
      const recVal = caesarValue(fxVal, -caesarShift);
      const recChar = ALPHABET[recVal]!;
      const invShift = (26 - (caesarShift % 26)) % 26;
      return {
        inputDisplay: inClean,
        inputValueDesc: `x = ${validX} (${inClean})`,
        forwardFormula: `E_{${caesarShift}}(x) = (x + ${caesarShift}) \\bmod 26`,
        forwardLabel: `Caesar Shift (+${caesarShift})`,
        outputDisplay: fxChar,
        outputValueDesc: `f(x) = ${fxVal} (${fxChar})`,
        inverseFormula: `E_{${caesarShift}}^{-1}(y) = (y - ${caesarShift}) \\bmod 26 = (y + ${invShift}) \\bmod 26`,
        inverseLabel: `Inverse Shift (−${caesarShift} ≡ +${invShift})`,
        recoveredDisplay: recChar,
        recoveredValueDesc: `f^{-1}(f(x)) = ${recVal} (${recChar})`,
        isMatch: inClean === recChar,
        systemName: "Caesar Cyclic Group C₂₆",
        orderText: "|C₂₆| = 26 elements (Abelian)",
      };
    } else if (system === "affine") {
      const inChar = affineInputLetter.toUpperCase().slice(0, 1) || "A";
      const xVal = inChar.charCodeAt(0) - 65;
      const validX = xVal >= 0 && xVal < 26 ? xVal : 0;
      const inClean = ALPHABET[validX]!;
      const fxVal = affineValue(validX, affineKey);
      const fxChar = ALPHABET[fxVal]!;
      const invKey = affineInverse(affineKey);
      const recVal = affineValue(fxVal, invKey);
      const recChar = ALPHABET[recVal]!;
      return {
        inputDisplay: inClean,
        inputValueDesc: `x = ${validX} (${inClean})`,
        forwardFormula: `E_{${affineKey.a},${affineKey.b}}(x) = (${affineKey.a}x + ${affineKey.b}) \\bmod 26`,
        forwardLabel: `Affine Map E(${affineKey.a}, ${affineKey.b})`,
        outputDisplay: fxChar,
        outputValueDesc: `f(x) = ${fxVal} (${fxChar})`,
        inverseFormula: `E_{${invKey.a},${invKey.b}}(y) = ${invKey.a}(y - ${affineKey.b}) \\bmod 26`,
        inverseLabel: `Affine Inverse E(${invKey.a}, ${invKey.b})`,
        recoveredDisplay: recChar,
        recoveredValueDesc: `f^{-1}(f(x)) = ${recVal} (${recChar})`,
        isMatch: inClean === recChar,
        systemName: "Affine Group G_aff",
        orderText: "|G_aff| = 312 elements (Non-Abelian)",
      };
    } else {
      const raw = permInputBlock.toUpperCase().replace(/[^A-Z]/g, "");
      const cleanBlock = (raw + "ABCD").slice(0, 4);
      const permKey = S4[permIndex] ?? S4[13]!;
      const outBlock = permutationApply(permKey, cleanBlock);
      const invKey = permutationInverse(permKey);
      const recBlock = permutationApply(invKey, outBlock);
      return {
        inputDisplay: cleanBlock,
        inputValueDesc: `Block: ${cleanBlock}`,
        forwardFormula: `\\sigma = ${permutationLabel(permKey)}`,
        forwardLabel: `Permutation σ = ${permutationLabel(permKey)}`,
        outputDisplay: outBlock,
        outputValueDesc: `f(x) = ${outBlock}`,
        inverseFormula: `\\sigma^{-1} = ${permutationLabel(invKey)}`,
        inverseLabel: `Inverse Permutation σ⁻¹ = ${permutationLabel(invKey)}`,
        recoveredDisplay: recBlock,
        recoveredValueDesc: `σ⁻¹(σ(x)) = ${recBlock}`,
        isMatch: cleanBlock === recBlock,
        systemName: "Symmetric Group S₄",
        orderText: "|S₄| = 24 elements (Non-Abelian)",
      };
    }
  }, [system, caesarShift, caesarInputLetter, affineKey, affineInputLetter, permIndex, permInputBlock]);

  // Cursor parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setCursorPos({ x, y });
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setCursorPos({ x: 0, y: 0 });
  };

  // Run automated recovery demonstration
  const runRecoveryDemo = useCallback(() => {
    if (isCycleRunning) return;
    setIsCycleRunning(true);
    setAnimStage("forward");

    const t1 = setTimeout(() => {
      setAnimStage("output");
    }, 700);

    const t2 = setTimeout(() => {
      setAnimStage("inverse");
    }, 1400);

    const t3 = setTimeout(() => {
      setAnimStage("complete");
      setIsCycleRunning(false);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isCycleRunning]);

  const resetRecoveryDemo = () => {
    setAnimStage("idle");
    setIsCycleRunning(false);
  };

  const handleSystemChange = (newSys: SystemMode) => {
    setSystem(newSys);
    setAnimStage("idle");
    setIsCycleRunning(false);
    setActiveNode(null);
  };

  // Transform styles for subtle parallax
  const parallaxCoreStyle = {
    transform: `translate(${cursorPos.x * 12}px, ${cursorPos.y * 12}px)`,
    transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
  };

  const parallaxRingsStyle = {
    transform: `translate(${cursorPos.x * -8}px, ${cursorPos.y * -8}px)`,
    transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
  };

  // Descriptions for interactive nodes
  const nodeExplanations: Record<NonNullable<ActiveNodeId>, { title: string; subtitle: string; desc: string; math: string }> = {
    input: {
      title: "Input Element (x)",
      subtitle: "Plaintext Domain Element",
      desc: "The starting cryptographic message element. In Caesar and Affine systems, this is a residue in ℤ₂₆ (letters A–Z as 0–25). In S₄, it is a 4-character positional block.",
      math: `x = \\text{${currentComputation.inputDisplay}}`,
    },
    forward: {
      title: "Forward Transformation (f)",
      subtitle: "Bijective Group Element",
      desc: "An invertible mapping f: X → X acting on the message space. Because f is a bijection, every input maps to exactly one output with zero collisions.",
      math: currentComputation.forwardFormula,
    },
    output: {
      title: "Ciphertext Output f(x)",
      subtitle: "Transformed Message State",
      desc: "The encrypted value resulting from applying the transformation. Without the correct inverse key, this appears scrambled, yet retains full structural reversibility.",
      math: `f(x) = \\text{${currentComputation.outputDisplay}}`,
    },
    inverse: {
      title: "Inverse Transformation (f⁻¹)",
      subtitle: "Guaranteed Group Inverse",
      desc: "By the inverse axiom of group theory, every element f ∈ G possesses a unique inverse f⁻¹ ∈ G such that (f⁻¹ ∘ f)(x) = x. Decryption is simply applying this group inverse.",
      math: currentComputation.inverseFormula,
    },
    recovered: {
      title: "Recovered Plaintext",
      subtitle: "Complete Information Recovery",
      desc: "Applying f⁻¹ to f(x) restores the exact initial element. This mathematical round-trip proves that reversibility is guaranteed by group structure.",
      math: `f^{-1}(f(x)) = x \\;\\checkmark`,
    },
  };

  return (
    <div
      className={`scifi-chamber-wrap ${className}`}
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-label="Interactive Mathematical Transformation Chamber"
    >
      {/* Top Header / Mode Bar */}
      <div className="chamber-header">
        <div className="chamber-title-block">
          <div className="chamber-badge">
            <span className="live-signal-dot" />
            <span>CRYPTOGRAPHIC TRANSFORMATION CHAMBER</span>
          </div>
          <h3 className="chamber-heading">
            Reversibility Demonstration: <em>x → f(x) → f⁻¹(f(x)) = x</em>
          </h3>
          <p className="chamber-subheading">
            Select a system below, turn the keys, or click any node to inspect its mathematical role.
          </p>
        </div>

        {/* System Selector */}
        <div className="chamber-system-selector" role="tablist" aria-label="Transformation Systems">
          <button
            type="button"
            role="tab"
            aria-selected={system === "caesar"}
            className={`chamber-sys-btn ${system === "caesar" ? "active violet" : ""}`}
            onClick={() => handleSystemChange("caesar")}
          >
            <span className="sys-code">C₂₆</span>
            <span className="sys-label">Caesar Shift</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={system === "affine"}
            className={`chamber-sys-btn ${system === "affine" ? "active blue" : ""}`}
            onClick={() => handleSystemChange("affine")}
          >
            <span className="sys-code">G_aff</span>
            <span className="sys-label">Affine Map</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={system === "permutation"}
            className={`chamber-sys-btn ${system === "permutation" ? "active silver" : ""}`}
            onClick={() => handleSystemChange("permutation")}
          >
            <span className="sys-code">S₄</span>
            <span className="sys-label">Permutation</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="chamber-stage-container">
        {/* Ambient Grid Lines & Ticks */}
        <div className="chamber-grid-overlay" aria-hidden="true">
          <div className="grid-tick tick-tl">+42.88°</div>
          <div className="grid-tick tick-tr">RAD_INVERSE</div>
          <div className="grid-tick tick-bl">SYM_GROUP_FLOW</div>
          <div className="grid-tick tick-br">VERIFIED ✓</div>
        </div>

        {/* Outer Orbital Rings & Gyroscope */}
        <div className="chamber-orbital-rig" style={parallaxRingsStyle} aria-hidden="true">
          <div className="chamber-ring ring-outer" />
          <div className="chamber-ring ring-segmented" />
          <div className="chamber-ring ring-inner" />
          <div className="chamber-axis-line axis-x" />
          <div className="chamber-axis-line axis-y" />
        </div>

        {/* Central Core with Parallax */}
        <div className="chamber-core-assembly" style={parallaxCoreStyle}>
          {/* Signal Pulse Paths (SVG) */}
          <svg className="chamber-svg-paths" viewBox="0 0 800 440" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="forwardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--ice)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="var(--lav)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--ice)" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="inverseGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--ice)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8df0a9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8df0a9" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Path: Input -> Forward Node -> Output */}
            <path
              d="M 160 220 C 260 110, 340 110, 400 130 C 460 110, 540 110, 640 220"
              className={`trace-path forward-trace ${animStage === "forward" || animStage === "output" ? "active-flow" : ""}`}
              filter="url(#glowFilter)"
            />

            {/* Path: Output -> Inverse Node -> Recovered / Input */}
            <path
              d="M 640 220 C 540 330, 460 330, 400 310 C 340 330, 260 330, 160 220"
              className={`trace-path inverse-trace ${animStage === "inverse" || animStage === "complete" ? "active-flow-inv" : ""}`}
              filter="url(#glowFilter)"
            />
          </svg>

          {/* Node 1: Input x */}
          <div
            className={`chamber-node node-input ${animStage === "forward" || activeNode === "input" ? "node-active" : ""}`}
            style={{ left: "20%", top: "50%" }}
          >
            <span className="node-outer-tag">INPUT {system === "permutation" ? "BLOCK" : "x"}</span>
            <button
              type="button"
              className={`node-circle ${system === "permutation" ? "block-circle" : ""}`}
              onClick={() => setActiveNode(activeNode === "input" ? null : "input")}
              aria-label={`Input node: ${currentComputation.inputDisplay}`}
            >
              <span className="node-halo" />
              <strong className={`node-val ${system === "permutation" ? "block-text" : ""}`}>
                {currentComputation.inputDisplay}
              </strong>
            </button>
            <span className="node-caption">Plaintext</span>
          </div>

          {/* Node 2: Forward Transformation f */}
          <div
            className={`chamber-node node-forward ${animStage === "forward" || activeNode === "forward" ? "node-active" : ""}`}
            style={{ left: "50%", top: "24%" }}
          >
            <span className="node-outer-tag transform-tag">TRANSFORMATION</span>
            <button
              type="button"
              className="node-circle core-circle"
              onClick={() => setActiveNode(activeNode === "forward" ? null : "forward")}
              aria-label={`Forward transformation: ${currentComputation.forwardLabel}`}
            >
              <span className="node-halo" />
              <strong className="node-val node-symbol">f</strong>
            </button>
            <span className="node-caption">{currentComputation.forwardLabel}</span>
          </div>

          {/* Node 3: Output f(x) */}
          <div
            className={`chamber-node node-output ${animStage === "output" || animStage === "inverse" || activeNode === "output" ? "node-active" : ""}`}
            style={{ left: "80%", top: "50%" }}
          >
            <span className="node-outer-tag">CIPHERTEXT {system === "permutation" ? "BLOCK" : "f(x)"}</span>
            <button
              type="button"
              className={`node-circle ${system === "permutation" ? "block-circle" : ""}`}
              onClick={() => setActiveNode(activeNode === "output" ? null : "output")}
              aria-label={`Output node: ${currentComputation.outputDisplay}`}
            >
              <span className="node-halo" />
              <strong className={`node-val output-text ${system === "permutation" ? "block-text" : ""}`}>
                {currentComputation.outputDisplay}
              </strong>
            </button>
            <span className="node-caption">Encrypted State</span>
          </div>

          {/* Node 4: Inverse Transformation f⁻¹ */}
          <div
            className={`chamber-node node-inverse ${animStage === "inverse" || animStage === "complete" || activeNode === "inverse" ? "node-active" : ""}`}
            style={{ left: "50%", top: "76%" }}
          >
            <button
              type="button"
              className="node-circle core-circle inv-circle"
              onClick={() => setActiveNode(activeNode === "inverse" ? null : "inverse")}
              aria-label={`Inverse transformation: ${currentComputation.inverseLabel}`}
            >
              <span className="node-halo" />
              <strong className="node-val node-symbol">f⁻¹</strong>
            </button>
            <span className="node-outer-tag inv-tag">INVERSE OPERATOR</span>
            <span className="node-caption">{currentComputation.inverseLabel}</span>
          </div>

          {/* Center Orb / Identity Core */}
          <div className="chamber-center-core" aria-hidden="true">
            <span className="center-identity-glyph">e</span>
            <small className="center-identity-desc">f⁻¹ ∘ f = e</small>
          </div>
        </div>

        {/* Live Recovery Banner (shows when cycle finishes or on hover) */}
        <div className={`chamber-recovery-status ${animStage === "complete" ? "verified" : ""}`}>
          <div className="recovery-badge">
            <span className="recovery-icon">{animStage === "complete" ? "✓" : "◈"}</span>
            <span className="recovery-text">
              {animStage === "idle" && "Ready: click 'Run Inverse Recovery Cycle' or interact with keys"}
              {animStage === "forward" && `Forward phase: applying ${currentComputation.forwardLabel}...`}
              {animStage === "output" && `Output computed: ${currentComputation.outputDisplay} (encrypted state)`}
              {animStage === "inverse" && `Inverse phase: applying ${currentComputation.inverseLabel}...`}
              {animStage === "complete" && (
                <strong>
                  Exact Inverse Verified: Recovered '{currentComputation.recoveredDisplay}' = Input '{currentComputation.inputDisplay}'
                </strong>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Control Deck for Inputs, Keys & Simulation Playback */}
      <div className="chamber-control-deck">
        <div className="deck-col params-col">
          <div className="deck-col-header">
            <span className="deck-label">TRANSFORMATION PARAMETERS</span>
            <span className="deck-sub">{currentComputation.systemName}</span>
          </div>

          {/* Caesar Controls */}
          {system === "caesar" && (
            <div className="deck-controls-row">
              <div className="ctrl-input-group">
                <label htmlFor="ch-caesar-in" className="deck-ctrl-label">Input Letter</label>
                <select
                  id="ch-caesar-in"
                  className="styled-select"
                  value={caesarInputLetter}
                  onChange={(e) => setCaesarInputLetter(e.target.value)}
                >
                  {ALPHABET.split("").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-input-group flex-1">
                <div className="deck-slider-head">
                  <label htmlFor="ch-caesar-k" className="deck-ctrl-label">Shift Key (k)</label>
                  <span className="deck-ctrl-val">+{caesarShift}</span>
                </div>
                <input
                  id="ch-caesar-k"
                  type="range"
                  min={0}
                  max={25}
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(Number(e.target.value))}
                  className="styled-slider violet-slider"
                />
              </div>
            </div>
          )}

          {/* Affine Controls */}
          {system === "affine" && (
            <div className="deck-controls-row">
              <div className="ctrl-input-group">
                <label htmlFor="ch-aff-in" className="deck-ctrl-label">Input Letter</label>
                <select
                  id="ch-aff-in"
                  className="styled-select"
                  value={affineInputLetter}
                  onChange={(e) => setAffineInputLetter(e.target.value)}
                >
                  {ALPHABET.split("").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-input-group">
                <label htmlFor="ch-aff-a" className="deck-ctrl-label">Multiplier a (gcd=1)</label>
                <select
                  id="ch-aff-a"
                  className="styled-select"
                  value={affineKey.a}
                  onChange={(e) => setAffineKey({ ...affineKey, a: Number(e.target.value) })}
                >
                  {[1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25].map((u) => (
                    <option key={u} value={u}>a = {u}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-input-group flex-1">
                <div className="deck-slider-head">
                  <label htmlFor="ch-aff-b" className="deck-ctrl-label">Shift b</label>
                  <span className="deck-ctrl-val">+{affineKey.b}</span>
                </div>
                <input
                  id="ch-aff-b"
                  type="range"
                  min={0}
                  max={25}
                  value={affineKey.b}
                  onChange={(e) => setAffineKey({ ...affineKey, b: Number(e.target.value) })}
                  className="styled-slider blue-slider"
                />
              </div>
            </div>
          )}

          {/* Permutation Controls */}
          {system === "permutation" && (
            <div className="deck-controls-row">
              <div className="ctrl-input-group">
                <label htmlFor="ch-perm-in" className="deck-ctrl-label">4-Letter Block</label>
                <input
                  id="ch-perm-in"
                  type="text"
                  maxLength={4}
                  value={permInputBlock}
                  onChange={(e) => setPermInputBlock(e.target.value.toUpperCase())}
                  className="char-input mono"
                />
              </div>

              <div className="ctrl-input-group flex-1">
                <label htmlFor="ch-perm-k" className="deck-ctrl-label">S₄ Permutation Key</label>
                <select
                  id="ch-perm-k"
                  className="styled-select"
                  value={permIndex}
                  onChange={(e) => setPermIndex(Number(e.target.value))}
                >
                  {S4.map((p, i) => (
                    <option key={i} value={i}>
                      {permutationLabel(p)} {i === 0 ? "(Identity)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="deck-col action-col">
          <button
            type="button"
            className="primary-button deck-run-btn"
            onClick={runRecoveryDemo}
            disabled={isCycleRunning}
          >
            {isCycleRunning ? "Simulating Cycle..." : "Run Inverse Recovery Cycle"} <span>↺</span>
          </button>
          <button
            type="button"
            className="secondary-button deck-reset-btn"
            onClick={resetRecoveryDemo}
          >
            Reset State
          </button>
        </div>
      </div>

      {/* Pop-up / Details Card for Active Node */}
      {activeNode && (
        <div className="chamber-node-detail-card" role="region" aria-label="Selected Node Details">
          <div className="node-detail-header">
            <div>
              <span className="eyebrow">{nodeExplanations[activeNode].subtitle}</span>
              <h4 className="node-detail-title">{nodeExplanations[activeNode].title}</h4>
            </div>
            <button
              type="button"
              className="details-close-btn"
              onClick={() => setActiveNode(null)}
              aria-label="Close node details"
            >
              ✕
            </button>
          </div>
          <p className="node-detail-body">{nodeExplanations[activeNode].desc}</p>
          <div className="node-detail-math">
            <MathView math={nodeExplanations[activeNode].math} display />
          </div>
        </div>
      )}
    </div>
  );
}
