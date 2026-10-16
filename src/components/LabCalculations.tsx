import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { MathView } from "./MathView";
import {
  type AffineKey,
  type Permutation,
  type CaesarTraceStep,
  type AffineTraceStep,
  getCaesarTrace,
  getAffineTrace,
  getPermutationTrace,
  permutationLabel,
  permutationInverse,
  modularInverse,
  gcd,
  MODULUS,
} from "../math/engine";

type LabCalculationsProps = {
  system: "caesar" | "affine" | "permutation";
  message: string;
  output: string;
  shift: number;
  affine: AffineKey;
  permutation: Permutation;
  decrypt: boolean;
};

function getCaesarLatex(step: CaesarTraceStep, decrypt: boolean): string {
  const y = step.inputValue;
  const k = step.shift;
  const x = step.outputValue;

  if (decrypt) {
    const diff = y - k;
    if (diff >= 0) {
      return `(${y} - ${k}) \\bmod 26 = ${diff}`;
    } else {
      return `(${y} - ${k}) \\bmod 26 = ${diff} \\bmod 26 = ${x}`;
    }
  } else {
    const sum = y + k;
    if (sum < 26) {
      return `(${y} + ${k}) \\bmod 26 = ${sum}`;
    } else {
      return `(${y} + ${k}) \\bmod 26 = ${sum} \\bmod 26 = ${x}`;
    }
  }
}

function getAffineLatex(step: AffineTraceStep, decrypt: boolean): string {
  const y = step.inputValue;
  const a = step.a;
  const b = step.b;
  const aInv = step.aInv;
  const x = step.outputValue;

  if (decrypt) {
    const diff = y - b;
    const prod = aInv * diff;
    if (diff === 0) {
      return `${aInv} \\cdot (${y} - ${b}) \\bmod 26 = 0`;
    } else if (diff > 0 && prod < 26) {
      return `${aInv} \\cdot (${y} - ${b}) \\bmod 26 = ${prod}`;
    } else {
      return `${aInv} \\cdot (${y} - ${b}) \\bmod 26 = ${aInv} \\cdot (${diff}) \\bmod 26 = ${prod} \\bmod 26 = ${x}`;
    }
  } else {
    const raw = a * y + b;
    if (raw < 26) {
      return `(${a} \\cdot ${y} + ${b}) \\bmod 26 = ${raw}`;
    } else {
      return `(${a} \\cdot ${y} + ${b}) \\bmod 26 = ${raw} \\bmod 26 = ${x}`;
    }
  }
}

export function LabCalculations({
  system,
  message,
  output,
  shift,
  affine,
  permutation,
  decrypt,
}: LabCalculationsProps) {
  const isInputEmpty = !message || message.trim().length === 0;

  if (isInputEmpty) {
    return (
      <div className="dynamic-calc-panel empty-state">
        <div className="calc-header">
          <div className="calc-header-title-wrap">
            <span className="calc-eyebrow">◈ DYNAMIC CALCULATION TRACE</span>
            <h3 className="calc-title">
              {decrypt ? "Decryption Arithmetic Trace" : "Encryption Arithmetic Trace"}
            </h3>
          </div>
          <div className="calc-meta-chips">
            <span className="meta-chip chip-neutral">WAITING FOR INPUT</span>
          </div>
        </div>
        <p className="empty-notice">
          Enter text in the message field above and select <strong>Encrypt</strong> or{" "}
          <strong>Decrypt</strong> to view the real-time typeset mathematical derivation.
        </p>
      </div>
    );
  }

  // Active LaTeX formula
  const activeFormulaLatex =
    system === "caesar"
      ? decrypt
        ? `D_{${shift}}(y) = (y - ${shift}) \\bmod 26`
        : `E_{${shift}}(x) = (x + ${shift}) \\bmod 26`
      : system === "affine"
        ? decrypt
          ? `D_{${affine.a},${affine.b}}(y) = ${affine.a}^{-1}(y - ${affine.b}) \\bmod 26`
          : `E_{${affine.a},${affine.b}}(x) = (${affine.a}x + ${affine.b}) \\bmod 26`
        : decrypt
          ? `P^{-1} = ${permutationLabel(permutationInverse(permutation))}`
          : `P = ${permutationLabel(permutation)}`;

  return (
    <div className="dynamic-calc-panel">
      {/* 1. Header */}
      <div className="calc-header">
        <div className="calc-header-title-wrap">
          <span className="calc-eyebrow">◈ DYNAMIC CALCULATION TRACE</span>
          <h3 className="calc-title">
            {decrypt ? "Decryption Arithmetic Trace" : "Encryption Arithmetic Trace"}
          </h3>
        </div>
        <div className="calc-meta-chips">
          <div className={`meta-chip chip-mode ${decrypt ? "chip-decrypt" : "chip-encrypt"}`}>
            <span className="chip-indicator" />
            <span>{decrypt ? "INVERSE / DECRYPT" : "FORWARD / ENCRYPT"}</span>
          </div>
          <div className="meta-chip chip-system">
            {system === "caesar" && (
              <>
                <MathView math="C_{26}" />
                <span className="system-name-tag">Caesar</span>
              </>
            )}
            {system === "affine" && (
              <>
                <MathView math="\mathrm{AGL}(1, 26)" />
                <span className="system-name-tag">Affine</span>
              </>
            )}
            {system === "permutation" && (
              <>
                <MathView math="S_4" />
                <span className="system-name-tag">Permutation</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Typeset Active Mathematical Expression Panel */}
      <div className="active-formula-card">
        <div className="formula-card-top">
          <div className="formula-kicker-group">
            <span className="formula-kicker">
              {decrypt ? "ACTIVE DECRYPTION RULE" : "ACTIVE ENCRYPTION RULE"}
            </span>
            <span className="formula-subtext">
              {system === "caesar" &&
                (decrypt
                  ? "Recover the plaintext value by subtracting the shift and reducing modulo 26."
                  : "Calculate the ciphertext value by adding the shift and reducing modulo 26.")}
              {system === "affine" &&
                (decrypt
                  ? "Subtract shift b, multiply by the modular inverse a⁻¹, and reduce modulo 26."
                  : "Multiply by unit a, add shift b, and reduce modulo 26.")}
              {system === "permutation" &&
                (decrypt
                  ? "Apply inverse permutation P⁻¹ across fixed four-character blocks."
                  : "Permute character positions within fixed four-character blocks.")}
            </span>
          </div>
          <div className="formula-group-tag">
            <span className="group-label">STRUCTURE</span>
            <span className="group-val">
              {system === "caesar" && <MathView math="(\mathbb{Z}_{26}, +)" />}
              {system === "affine" && <MathView math="\mathbb{Z}_{26}^\times \ltimes \mathbb{Z}_{26}" />}
              {system === "permutation" && <MathView math="|S_4| = 24" />}
            </span>
          </div>
        </div>

        <div className="formula-display-area">
          <MathView math={activeFormulaLatex} display={true} className="main-math-equation" />
        </div>
      </div>

      {/* 3. Detailed Derivation Layout */}
      {system === "caesar" && (
        <CaesarCalculations text={message} shift={shift} decrypt={decrypt} />
      )}

      {system === "affine" && (
        <AffineCalculations text={message} affine={affine} decrypt={decrypt} />
      )}

      {system === "permutation" && (
        <PermutationCalculations
          text={message}
          permutation={permutation}
          decrypt={decrypt}
          output={output}
        />
      )}
    </div>
  );
}

function CaesarCalculations({
  text,
  shift,
  decrypt,
}: {
  text: string;
  shift: number;
  decrypt: boolean;
}) {
  const steps = getCaesarTrace(text, shift, decrypt);

  if (steps.length === 0) {
    return (
      <div className="no-letters-note">
        No alphabetic characters in input. Non-alphabetic symbols are preserved without modification.
      </div>
    );
  }

  return (
    <div className="trace-stream-wrap">
      {/* Stream Column Headers */}
      <div className="trace-stream-header">
        <div className="col-head col-step">STEP</div>
        <div className="col-head col-char">{decrypt ? "CIPHER LETTER" : "PLAIN LETTER"}</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-key">KEY</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-derivation">MATHEMATICAL DERIVATION</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-char">{decrypt ? "RECOVERED PLAIN" : "CIPHER OUTPUT"}</div>
      </div>

      {/* Rows */}
      <div className="trace-rows-list">
        {steps.map((step, idx) => {
          const latexDerivation = getCaesarLatex(step, decrypt);
          return (
            <div key={`caesar-step-${idx}`} className="trace-item-row">
              {/* Step Index */}
              <div className="trace-cell col-step">
                <span className="step-pill">0{idx + 1}</span>
              </div>

              {/* Input Character Tile */}
              <div className="trace-cell col-char">
                <div className="character-tile input-tile">
                  <span className="tile-main-letter">{step.inputChar}</span>
                  <span className="tile-math-index">
                    <MathView math={decrypt ? `y = ${step.inputValue}` : `x = ${step.inputValue}`} />
                  </span>
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Key Chip */}
              <div className="trace-cell col-key">
                <div className="param-chip">
                  <span className="param-label">SHIFT</span>
                  <span className="param-val">
                    <MathView math={`k = ${step.shift}`} />
                  </span>
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Typeset Mathematical Calculation */}
              <div className="trace-cell col-derivation">
                <div className="math-expression-container">
                  <MathView math={latexDerivation} />
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Output Character Tile */}
              <div className="trace-cell col-char">
                <div className="character-tile output-tile">
                  <span className="tile-main-letter">{step.outputChar}</span>
                  <span className="tile-math-index">
                    <MathView math={decrypt ? `x = ${step.outputValue}` : `y = ${step.outputValue}`} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Elegant Mathematical Footer */}
      <div className="trace-footer">
        <div className="footer-left">
          <span className="footer-chip count-chip">
            <span className="footer-pulse-dot" />
            {steps.length} {steps.length === 1 ? "character" : "characters"} transformed
          </span>
          <span className="footer-chip group-chip">
            <MathView math="C_{26}" /> &middot; Cyclic group of order 26
          </span>
        </div>
        <div className="footer-right">
          <span className="mapping-legend-label">Residue mapping:</span>
          <span className="mapping-legend-math">
            <MathView math="A \leftrightarrow 0,\; B \leftrightarrow 1,\; \dots,\; Z \leftrightarrow 25" />
          </span>
        </div>
      </div>
    </div>
  );
}

function AffineCalculations({
  text,
  affine,
  decrypt,
}: {
  text: string;
  affine: AffineKey;
  decrypt: boolean;
}) {
  const isValidA = gcd(affine.a, MODULUS) === 1;

  if (!isValidA) {
    return (
      <div className="calc-error-banner">
        <strong>Invalid Multiplier: gcd({affine.a}, 26) = {gcd(affine.a, MODULUS)} ≠ 1</strong>
        <p>
          The multiplier <code>a</code> must be invertible modulo 26.
          Valid units: <code>&#123;1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25&#125;</code>.
        </p>
      </div>
    );
  }

  let steps: AffineTraceStep[];
  let aInv: number;
  try {
    steps = getAffineTrace(text, affine, decrypt);
    aInv = modularInverse(affine.a, MODULUS);
  } catch (error) {
    return (
      <div className="calc-error-banner">
        <strong>Calculation error:</strong> {(error as Error).message}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="no-letters-note">
        No alphabetic characters in input. Non-alphabetic symbols are preserved without modification.
      </div>
    );
  }

  return (
    <div className="trace-stream-wrap">
      {/* Mathematical Parameters Sub-Banner */}
      <div className="affine-math-info-bar">
        <div className="info-chip">
          <span className="info-label">MULTIPLIER:</span>
          <MathView math={`a = ${affine.a}`} />
        </div>
        <div className="info-chip">
          <span className="info-label">SHIFT:</span>
          <MathView math={`b = ${affine.b}`} />
        </div>
        <div className="info-chip highlight-chip">
          <span className="info-label">MODULAR INVERSE:</span>
          <MathView math={`a^{-1} = ${aInv}`} />
          <span className="inverse-proof">
            (<MathView math={`${affine.a} \\times ${aInv} = ${affine.a * aInv} \\equiv 1 \\pmod{26}`} />)
          </span>
        </div>
      </div>

      {/* Stream Column Headers */}
      <div className="trace-stream-header">
        <div className="col-head col-step">STEP</div>
        <div className="col-head col-char">{decrypt ? "CIPHER LETTER" : "PLAIN LETTER"}</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-key">KEY VALUES</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-derivation">MATHEMATICAL DERIVATION</div>
        <div className="col-head col-arrow" />
        <div className="col-head col-char">{decrypt ? "RECOVERED PLAIN" : "CIPHER OUTPUT"}</div>
      </div>

      {/* Rows */}
      <div className="trace-rows-list">
        {steps.map((step, idx) => {
          const latexDerivation = getAffineLatex(step, decrypt);
          return (
            <div key={`affine-step-${idx}`} className="trace-item-row">
              {/* Step Index */}
              <div className="trace-cell col-step">
                <span className="step-pill">0{idx + 1}</span>
              </div>

              {/* Input Character Tile */}
              <div className="trace-cell col-char">
                <div className="character-tile input-tile">
                  <span className="tile-main-letter">{step.inputChar}</span>
                  <span className="tile-math-index">
                    <MathView math={decrypt ? `y = ${step.inputValue}` : `x = ${step.inputValue}`} />
                  </span>
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Key Chip */}
              <div className="trace-cell col-key">
                <div className="param-chip">
                  <span className="param-label">{decrypt ? "KEY (a⁻¹, b)" : "KEY (a, b)"}</span>
                  <span className="param-val">
                    <MathView math={decrypt ? `(${step.aInv}, ${step.b})` : `(${step.a}, ${step.b})`} />
                  </span>
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Typeset Mathematical Calculation */}
              <div className="trace-cell col-derivation">
                <div className="math-expression-container">
                  <MathView math={latexDerivation} />
                </div>
              </div>

              {/* Progression Arrow */}
              <div className="trace-cell col-arrow" aria-hidden="true">
                <span className="progression-arrow">→</span>
              </div>

              {/* Output Character Tile */}
              <div className="trace-cell col-char">
                <div className="character-tile output-tile">
                  <span className="tile-main-letter">{step.outputChar}</span>
                  <span className="tile-math-index">
                    <MathView math={decrypt ? `x = ${step.outputValue}` : `y = ${step.outputValue}`} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="trace-footer">
        <div className="footer-left">
          <span className="footer-chip count-chip">
            <span className="footer-pulse-dot" />
            {steps.length} {steps.length === 1 ? "character" : "characters"} transformed
          </span>
          <span className="footer-chip group-chip">
            <MathView math="\mathrm{AGL}(1, 26)" /> &middot; Order 312
          </span>
        </div>
        <div className="footer-right">
          <span className="mapping-legend-label">Bijection:</span>
          <span className="mapping-legend-math">
            <MathView math="x = a^{-1}(y - b) \pmod{26}" />
          </span>
        </div>
      </div>
    </div>
  );
}

function PermutationCalculations({
  text,
  permutation,
  decrypt,
}: {
  text: string;
  permutation: Permutation;
  decrypt: boolean;
  output: string;
}) {
  const result = getPermutationTrace(permutation, text, decrypt);
  const inversePerm = permutationInverse(permutation);
  const activePerm = decrypt ? inversePerm : permutation;

  if (result.blocks.length === 0) {
    return (
      <div className="no-letters-note">
        Input requires at least four alphabetic characters to form a complete block under S₄.
        {result.leftoverLetters.length > 0 && (
          <span>
            {" "}Found {result.leftoverLetters.length} character(s): <code>{result.leftoverLetters}</code> (insufficient for a full 4-position block).
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="trace-stream-wrap">
      {/* Parameters Info Bar */}
      <div className="affine-math-info-bar">
        <div className="info-chip">
          <span className="info-label">KEY P:</span>
          <span className="mono-code">{permutationLabel(permutation)}</span>
        </div>
        <div className="info-chip highlight-chip">
          <span className="info-label">INVERSE KEY P⁻¹:</span>
          <span className="mono-code">{permutationLabel(inversePerm)}</span>
        </div>
        <div className="info-chip">
          <span className="info-label">BLOCKS:</span>
          <span>{result.blocks.length} ({result.blocks.length * 4} letters)</span>
        </div>
      </div>

      {/* S4 Block Derivation Cards */}
      <div className="perm-blocks-stream">
        {result.blocks.map((block) => (
          <div key={`perm-block-${block.blockIndex}`} className="perm-derivation-card">
            <div className="perm-card-head">
              <span className="block-tag">BLOCK {String(block.blockIndex).padStart(2, "0")}</span>
              <div className="block-trans-visual">
                <span className="trans-in">{block.inputBlock}</span>
                <span className="trans-arrow">→</span>
                <span className="trans-out">{block.outputBlock}</span>
              </div>
              <span className="active-perm-label">
                {decrypt ? "Applied P⁻¹" : "Applied P"}: {permutationLabel(activePerm)}
              </span>
            </div>

            <div className="block-mapping-grid">
              {block.mappings.map((m) => (
                <div key={`mapping-${block.blockIndex}-${m.outputPosition}`} className="mapping-cell-card">
                  <div className="cell-top">
                    <span className="cell-dest-label">Output Pos {m.outputPosition}</span>
                    <span className="cell-char-badge">{m.letter}</span>
                  </div>
                  <div className="cell-derivation">
                    <MathView
                      math={
                        decrypt
                          ? `\\text{Cipher}[${m.sourcePosition}] \\to \\text{Plain}[${m.outputPosition}]`
                          : `\\text{Input}[${m.sourcePosition}] \\to \\text{Output}[${m.outputPosition}]`
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result.leftoverLetters.length > 0 && (
        <div className="leftover-notice">
          <span className="notice-icon">ℹ</span>
          <span>
            Remaining unpadded characters: <code>{result.leftoverLetters}</code>. Incomplete final blocks are preserved without permutation per S₄ convention.
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="trace-footer">
        <div className="footer-left">
          <span className="footer-chip count-chip">
            <span className="footer-pulse-dot" />
            {result.blocks.length * 4} letters permuted across {result.blocks.length} block{result.blocks.length === 1 ? "" : "s"}
          </span>
          <span className="footer-chip group-chip">
            <MathView math="S_4" /> &middot; Symmetric group on 4 elements
          </span>
        </div>
        <div className="footer-right">
          <span className="mapping-legend-label">Bijective transposition:</span>
          <span className="mapping-legend-math">
            <MathView math="\pi \in S_4 \implies \pi^{-1} \circ \pi = \mathrm{id}" />
          </span>
        </div>
      </div>
    </div>
  );
}
