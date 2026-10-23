import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ALPHABET } from "../math/engine";

type CipherWheelProps = {
  shift: number;
  setShift: (value: number) => void;
  plaintext: string;
  ciphertext: string;
  system: "caesar" | "affine" | "permutation";
  affineKey?: { a: number; b: number };
  affine?: { a: number; b: number };
  permKey?: number[] | [number, number, number, number];
  permutation?: number[] | [number, number, number, number];
  resetKey?: number;
};

const CENTER = 250;
const R_OUTER_ORBIT = 226;
const R_OUTER_LETTERS = 196;
const R_DIVIDER_TICKS = 162;
const R_INNER_LETTERS = 132;
const R_INNER_ORBIT = 104;
const R_CORE = 78;

const DEG_STEP = 360 / 26; // 13.846 deg per letter

function polarToCartesian(radius: number, angleDeg: number) {
  // -90deg is 12 o'clock
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/** Returns the new accumulated angle that is closest to `from` and represents the same wheel position as `target`. */
function shortestPath(from: number, to: number): number {
  const delta = ((to - from) % 360 + 540) % 360 - 180;
  return from + delta;
}

export function CipherWheel({
  shift,
  setShift,
  plaintext,
  ciphertext,
  system,
  affineKey,
  affine,
  permKey,
  permutation,
  resetKey,
}: CipherWheelProps) {
  // Guaranteed valid Affine parameters (default to valid a=5, b=8 if not provided)
  const effectiveAffine = useMemo(() => {
    const candidate = affineKey ?? affine;
    if (candidate && typeof candidate.a === "number" && typeof candidate.b === "number") {
      return candidate;
    }
    return { a: 5, b: 8 };
  }, [affineKey, affine]);

  // Guaranteed valid 1-based Permutation array (e.g. [3, 1, 4, 2])
  const permOneBased = useMemo(() => {
    const candidate = permKey ?? permutation;
    if (Array.isArray(candidate) && candidate.length === 4) {
      if (candidate.some((v) => v === 4) || candidate.every((v) => v >= 1 && v <= 4)) {
        return candidate;
      }
      return candidate.map((v) => v + 1);
    }
    // Default valid key: [3, 1, 4, 2] (corresponds to S4[13] [2, 0, 3, 1])
    return [3, 1, 4, 2];
  }, [permKey, permutation]);

  // Parallax / Cursor Lighting
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Event-driven rotation state (accumulated degrees, never clamped to 0-360)
  const [outerDeg, setOuterDeg] = useState(0);
  const [innerDeg, setInnerDeg] = useState(0);
  const [outerTransition, setOuterTransition] = useState("none");
  const [innerTransition, setInnerTransition] = useState("none");

  // Refs so animateToLetters always has fresh values without stale closures
  const outerDegRef = useRef(0);
  const innerDegRef = useRef(0);
  const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Highlight state: hovered letter or card index
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Check reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Smooth canonical reset for both rings simultaneously
  const resetToCanonical = useCallback((reduced: boolean) => {
    pendingRef.current.forEach(clearTimeout);
    pendingRef.current = [];

    const newOuter = shortestPath(outerDegRef.current, 0);
    const newInner = shortestPath(innerDegRef.current, 0);

    outerDegRef.current = newOuter;
    innerDegRef.current = newInner;

    setOuterTransition(
      reduced ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
    );
    setInnerTransition(
      reduced ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
    );

    setOuterDeg(newOuter);
    setInnerDeg(newInner);

    // After animation finishes, cleanly normalize refs and state to exact 0
    const normalizeTimer = setTimeout(() => {
      outerDegRef.current = 0;
      innerDegRef.current = 0;
      setOuterTransition("none");
      setInnerTransition("none");
      setOuterDeg(0);
      setInnerDeg(0);
    }, reduced ? 0 : 550);
    pendingRef.current.push(normalizeTimer);
  }, []);

  // Reset wheel state when resetKey increments
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    setHoveredLetter(null);
    setHoveredCardIndex(null);
    resetToCanonical(prefersReducedMotion);
  }, [resetKey, prefersReducedMotion, resetToCanonical]);

  // Core animation function: smoothly rotate outer ring then inner ring
  const animateToLetters = useCallback(
    (plainIdx: number, cipherIdx: number, reduced: boolean) => {
      // Cancel any pending inner-ring timer
      pendingRef.current.forEach(clearTimeout);
      pendingRef.current = [];

      // Target: letter i sits at i*DEG_STEP from top-zero. Rotating by -i*DEG_STEP brings it to 12 o'clock.
      const targetOuter = -plainIdx * DEG_STEP;
      const targetInner = -cipherIdx * DEG_STEP;

      const newOuter = shortestPath(outerDegRef.current, targetOuter);
      outerDegRef.current = newOuter;
      setOuterTransition(
        reduced ? "none" : "transform 0.6s cubic-bezier(0.22,1,0.36,1)"
      );
      setOuterDeg(newOuter);

      const delay = reduced ? 0 : 320;
      const t = setTimeout(() => {
        const newInner = shortestPath(innerDegRef.current, targetInner);
        innerDegRef.current = newInner;
        setInnerTransition(
          reduced ? "none" : "transform 0.6s cubic-bezier(0.22,1,0.36,1)"
        );
        setInnerDeg(newInner);
      }, delay);
      pendingRef.current.push(t);
    },
    []
  );

  // Animate when shift changes (caesar mode only)
  useEffect(() => {
    if (system !== "caesar") return;
    const plainIdx = 0; // keep A at top for outer
    const cipherIdx = shift % 26; // Caesar maps A -> ALPHABET[shift]
    const timer = setTimeout(() => {
      animateToLetters(plainIdx, cipherIdx, prefersReducedMotion);
    }, 0);
    return () => clearTimeout(timer);
  }, [shift, system, prefersReducedMotion, animateToLetters]);

  // Pointer interactions for parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setCursorOffset({ x, y });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setCursorOffset({ x: 0, y: 0 });
    setHoveredLetter(null);
    setHoveredCardIndex(null);
  };

  const changeShift = useCallback(
    (delta: number) => {
      setShift((shift + delta + 26) % 26);
    },
    [shift, setShift]
  );

  // Derive which letters are at 12 o'clock from current rotation
  const topOuterIndex = useMemo(() => {
    const norm = ((-outerDeg % 360) + 360) % 360;
    return Math.round(norm / DEG_STEP) % 26;
  }, [outerDeg]);

  const topInnerIndex = useMemo(() => {
    const norm = ((-innerDeg % 360) + 360) % 360;
    return Math.round(norm / DEG_STEP) % 26;
  }, [innerDeg]);

  const topOuterChar = ALPHABET[topOuterIndex]!;
  const topInnerChar = ALPHABET[topInnerIndex]!;

  // Counter-rotation of the gyro tick ring
  const gyroRotation = -outerDeg * 1.5;

  // Letter cards computation from plaintext input: dynamic rendering of unique letters in first-appearance order
  const mappingCards = useMemo(() => {
    const cleanLetters = [...plaintext.toUpperCase()].filter((c) =>
      ALPHABET.includes(c)
    );
    const outLetters = [...ciphertext.toUpperCase()].filter((c) =>
      ALPHABET.includes(c)
    );

    const seen = new Set<string>();
    const cards: Array<{
      index: number;
      plain: string;
      plainIdx: number;
      cipher: string;
      cipherIdx: number;
    }> = [];

    cleanLetters.forEach((pChar, idx) => {
      if (seen.has(pChar)) {
        return; // Preserves repeated-letter handling by representing each distinct letter once in first-appearance order
      }
      seen.add(pChar);

      const pIdx = ALPHABET.indexOf(pChar);
      let cChar = outLetters[idx];
      if (!cChar || !ALPHABET.includes(cChar)) {
        if (system === "caesar") {
          cChar = ALPHABET[(pIdx + shift) % 26]!;
        } else if (system === "affine" && effectiveAffine) {
          cChar = ALPHABET[(effectiveAffine.a * pIdx + effectiveAffine.b) % 26]!;
        } else {
          cChar = ALPHABET[(pIdx + shift) % 26]!;
        }
      }

      cards.push({
        index: cards.length + 1,
        plain: pChar,
        plainIdx: pIdx,
        cipher: cChar,
        cipherIdx: ALPHABET.indexOf(cChar),
      });
    });

    return cards;
  }, [plaintext, ciphertext, shift, system, effectiveAffine]);

  // Card click handler: animate wheel to that card's letters
  function handleCardClick(
    card: {
      plain: string;
      plainIdx: number;
      cipher: string;
      cipherIdx: number;
    },
    i: number
  ) {
    setHoveredLetter(card.plain);
    setHoveredCardIndex(i);
    animateToLetters(card.plainIdx, card.cipherIdx, prefersReducedMotion);
  }

  // Determine active highlighted letters
  const hasActiveInput = plaintext.trim().length > 0;

  const activePlainChar = hasActiveInput
    ? (hoveredLetter
        ? hoveredLetter
        : hoveredCardIndex != null && mappingCards[hoveredCardIndex]
        ? mappingCards[hoveredCardIndex].plain
        : topOuterChar)
    : null;

  const activeCipherChar = hasActiveInput
    ? (hoveredLetter
        ? (mappingCards.find((c) => c.plain === hoveredLetter)?.cipher ??
           (system === "affine" && effectiveAffine
             ? ALPHABET[(effectiveAffine.a * ALPHABET.indexOf(hoveredLetter) + effectiveAffine.b) % 26]!
             : ALPHABET[(ALPHABET.indexOf(hoveredLetter) + shift) % 26]!))
        : hoveredCardIndex != null && mappingCards[hoveredCardIndex]
        ? mappingCards[hoveredCardIndex].cipher
        : topInnerChar)
    : null;

  return (
    <div
      className="futuristic-wheel-wrapper"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="region"
      aria-label="Interactive Futuristic Caesar Cipher Wheel"
    >
      {/* Top Banner / Heading */}
      <div className="wheel-top-bar">
        <div className="wheel-badge">
          <span className="live-dot" />
          <span>
            {system === "caesar"
              ? "CYBERNETIC CRYPTOGRAPHIC WHEEL / C₂₆"
              : system === "affine"
                ? "AFFINE TRANSFORMATION WHEEL / G_aff"
                : "POSITION PERMUTATION WHEEL / S₄"}
          </span>
        </div>
        <div className="wheel-meta-tags">
          <span className="wheel-tag-item">
            {system === "caesar"
              ? "BIJECTIVE SHIFT"
              : system === "affine"
                ? "MODULAR BIJECTION"
                : "4-BLOCK PERMUTATION"}
          </span>
          <span className="wheel-tag-item">
            {system === "caesar"
              ? "ORDER |C₂₆| = 26"
              : system === "affine"
                ? "ORDER |G_aff| = 312"
                : "ORDER |S₄| = 24"}
          </span>
          <span className="wheel-tag-mode">ACTIVE / LIVE</span>
        </div>
      </div>

      {/* Main Interactive Stage with SVG */}
      <div
        className="wheel-stage-viewport"
        style={{
          transform:
            !prefersReducedMotion && isHovered
              ? `perspective(800px) rotateX(${-cursorOffset.y * 3.5}deg) rotateY(${cursorOffset.x * 3.5}deg)`
              : "perspective(800px) rotateX(0deg) rotateY(0deg)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
        }}
      >
        <svg
          className="futuristic-wheel-svg"
          viewBox="0 0 500 500"
          aria-label={
            system === "caesar"
              ? `Caesar Shift Wheel key ${shift}`
              : system === "affine"
                ? `Affine Transformation Wheel a=${effectiveAffine.a} b=${effectiveAffine.b}`
                : `Permutation Wheel key [${permOneBased.join(", ")}]`
          }
        >
          <defs>
            {/* Violet Outer Glow Filter */}
            <filter id="violetGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feFlood floodColor="#b0a3ff" floodOpacity="0.85" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Cyan Inner Glow Filter */}
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feFlood floodColor="#00e5ff" floodOpacity="0.85" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle Core Background Gradient */}
            <radialGradient id="coreBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1829" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0f1019" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#08090d" stopOpacity="1" />
            </radialGradient>

            {/* Linear Gradient for Cardinal Lines */}
            <linearGradient id="radialGuideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b0a3ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b0a3ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Ambient Circles */}
          <circle cx={CENTER} cy={CENTER} r="244" className="ambient-orbit outer-boundary" />
          <circle cx={CENTER} cy={CENTER} r={R_OUTER_ORBIT} className="ambient-orbit track-orbit" />
          <circle cx={CENTER} cy={CENTER} r={R_DIVIDER_TICKS} className="ambient-orbit dotted-divider" />
          <circle cx={CENTER} cy={CENTER} r={R_INNER_ORBIT} className="ambient-orbit track-orbit-cyan" />

          {/* Gyroscopic Radial Ticks (counter-rotating for sci-fi instrument depth) */}
          <g
            style={{
              transform: `rotate(${gyroRotation}deg)`,
              transformOrigin: `${CENTER}px ${CENTER}px`,
            }}
            opacity={0.22}
          >
            {Array.from({ length: 52 }).map((_, i) => {
              const ang = i * (360 / 52);
              const p1 = polarToCartesian(R_DIVIDER_TICKS - 5, ang);
              const p2 = polarToCartesian(R_DIVIDER_TICKS + 5, ang);
              return (
                <line
                  key={`tick-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={i % 2 === 0 ? "rgba(176, 163, 255, 0.45)" : "rgba(0, 229, 255, 0.35)"}
                  strokeWidth={i % 4 === 0 ? 1.5 : 0.8}
                />
              );
            })}
          </g>

          {/* Fine Outer Perimeter Minute Ticks */}
          <g opacity={0.18}>
            {Array.from({ length: 104 }).map((_, i) => {
              const ang = i * (360 / 104);
              const p1 = polarToCartesian(R_OUTER_ORBIT + 3, ang);
              const p2 = polarToCartesian(R_OUTER_ORBIT + (i % 4 === 0 ? 8 : 5), ang);
              return (
                <line
                  key={`out-tick-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(173, 166, 211, 0.4)"
                  strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
                />
              );
            })}
          </g>

          {/* Cardinal Diamond Markers (Fixed at 12, 3, 6, 9 o'clock) */}
          {/* Top 12 o'clock Diamond */}
          <polygon
            points={`${CENTER},20 ${CENTER - 5},28 ${CENTER},36 ${CENTER + 5},28`}
            fill="#b0a3ff"
            opacity={0.8}
          />
          {/* Right 3 o'clock Diamond */}
          <polygon
            points="480,250 472,245 464,250 472,255"
            fill="rgba(176, 163, 255, 0.6)"
          />
          {/* Bottom 6 o'clock Diamond */}
          <polygon
            points={`${CENTER},480 ${CENTER - 5},472 ${CENTER},464 ${CENTER + 5},472`}
            fill="rgba(176, 163, 255, 0.6)"
          />
          {/* Left 9 o'clock Diamond */}
          <polygon
            points="20,250 28,245 36,250 28,255"
            fill="rgba(176, 163, 255, 0.6)"
          />

          {/* =============================================================== */}
          {/* 1. OUTER ALPHABET RING (A–Z) — CSS transition rotation            */}
          {/* =============================================================== */}
          <g
            style={{
              transform: `rotate(${outerDeg}deg)`,
              transformOrigin: `${CENTER}px ${CENTER}px`,
              transition: outerTransition,
            }}
            className="outer-ring-group"
          >
            {ALPHABET.split("").map((letter, i) => {
              const angDeg = i * DEG_STEP;
              const { x, y } = polarToCartesian(R_OUTER_LETTERS, angDeg);
              const isSelected = letter === activePlainChar && activePlainChar !== null;

              return (
                <g
                  key={`outer-${letter}`}
                  className={`letter-node outer-letter-node ${isSelected ? "selected-node" : ""}`}
                  onMouseEnter={() => setHoveredLetter(letter)}
                  onClick={() => setHoveredLetter(letter)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Plaintext letter ${letter}`}
                >
                  {/* Subtle hit area */}
                  <circle cx={x} cy={y} r="14" fill="transparent" />

                  {/* Letter Glyph — Counter-rotated so it remains upright! */}
                  <g
                    style={{
                      transform: `rotate(${-outerDeg}deg)`,
                      transformOrigin: `${x}px ${y}px`,
                      transition: outerTransition,
                    }}
                  >
                    <text
                      x={x}
                      y={y + 0.5}
                      className={`wheel-letter-glyph outer-glyph ${isSelected ? "active-violet" : ""}`}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {letter}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* =============================================================== */}
          {/* 2. INNER ALPHABET RING (Shifted A–Z) — CSS transition rotation   */}
          {/* =============================================================== */}
          <g
            style={{
              transform: `rotate(${innerDeg}deg)`,
              transformOrigin: `${CENTER}px ${CENTER}px`,
              transition: innerTransition,
            }}
            className="inner-ring-group"
          >
            {ALPHABET.split("").map((letter, i) => {
              const angDeg = i * DEG_STEP;
              const { x, y } = polarToCartesian(R_INNER_LETTERS, angDeg);
              const isSelected = letter === activeCipherChar && activeCipherChar !== null;

              return (
                <g
                  key={`inner-${letter}`}
                  className={`letter-node inner-letter-node ${isSelected ? "selected-node" : ""}`}
                  onMouseEnter={() => {
                    // Find corresponding plaintext letter
                    const cIdx = ALPHABET.indexOf(letter);
                    const pIdx = (cIdx - shift + 26) % 26;
                    setHoveredLetter(ALPHABET[pIdx]!);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ciphertext letter ${letter}`}
                >
                  <circle cx={x} cy={y} r="13" fill="transparent" />

                  {/* Letter Glyph — Counter-rotated so it remains upright! */}
                  <g
                    style={{
                      transform: `rotate(${-innerDeg}deg)`,
                      transformOrigin: `${x}px ${y}px`,
                      transition: innerTransition,
                    }}
                  >
                    <text
                      x={x}
                      y={y + 0.5}
                      className={`wheel-letter-glyph inner-glyph ${isSelected ? "active-cyan" : ""}`}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {letter}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* =============================================================== */}
          {/* 3. FIXED SELECTION MARKERS (12 O'CLOCK POSITION)                */}
          {/* =============================================================== */}
          {hasActiveInput && (
            <g className="fixed-selection-markers" pointerEvents="none">
              {/* Vertical Radial Alignment Line connecting 12 o'clock outer to core */}
              <line
                x1={CENTER}
                y1="40"
                x2={CENTER}
                y2={CENTER - R_CORE - 4}
                stroke="url(#radialGuideGrad)"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity={0.6}
              />

              {/* Outer Letter Luminous Circle at 12 o'clock */}
              <circle
                cx={CENTER}
                cy={CENTER - R_OUTER_LETTERS}
                r="17"
                className="fixed-marker-circle outer-marker"
                filter="url(#violetGlow)"
              />

              {/* Inner Letter Luminous Circle at 12 o'clock */}
              <circle
                cx={CENTER}
                cy={CENTER - R_INNER_LETTERS}
                r="15"
                className="fixed-marker-circle inner-marker"
                filter="url(#cyanGlow)"
              />
            </g>
          )}

          {/* =============================================================== */}
          {/* 4. CENTRAL CORE — System-aware display                          */}
          {/* =============================================================== */}
          <g className="wheel-central-core">
            {/* Solid Multi-ring Backdrop */}
            <circle cx={CENTER} cy={CENTER} r={R_CORE + 12} fill="url(#coreBg)" />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R_CORE + 8}
              fill="none"
              stroke="rgba(176, 163, 255, 0.4)"
              strokeWidth="1.2"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R_CORE + 2}
              fill="none"
              stroke="rgba(0, 229, 255, 0.5)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R_CORE - 4}
              fill="none"
              stroke="rgba(176, 163, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Core Typography — system-aware */}
            {system === "caesar" && (
              <>
                <text x={CENTER} y={CENTER - 26} className="core-text-eyebrow" textAnchor="middle">
                  SHIFT KEY
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 8}
                  className="core-text-value"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  +{shift}
                </text>
                <text x={CENTER} y={CENTER + 36} className="core-text-mod" textAnchor="middle">
                  mod 26
                </text>
              </>
            )}
            {system === "affine" && (
              <>
                <text x={CENTER} y={CENTER - 26} className="core-text-eyebrow" textAnchor="middle">
                  AFFINE MAP
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 5}
                  className="core-text-value"
                  style={{ fontSize: 16, letterSpacing: "1px" }}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  a = {effectiveAffine.a}
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 28}
                  className="core-text-value"
                  style={{ fontSize: 16, letterSpacing: "1px" }}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  b = {effectiveAffine.b}
                </text>
              </>
            )}
            {system === "permutation" && (
              <>
                <text x={CENTER} y={CENTER - 26} className="core-text-eyebrow" textAnchor="middle">
                  PERMUTATION
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 6}
                  className="core-text-value"
                  style={{ fontSize: 16, letterSpacing: "1px" }}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {`[${permOneBased.join(", ")}]`}
                </text>
                <text x={CENTER} y={CENTER + 34} className="core-text-mod" textAnchor="middle">
                  group S₄
                </text>
              </>
            )}
          </g>
        </svg>

        {/* Floating Quick Key Adjuster (+ / -) — Caesar only */}
        {system === "caesar" && (
          <div className="wheel-floating-controls" aria-label="Adjust shift key">
            <button
              type="button"
              className="key-step-btn dec-btn"
              onClick={() => changeShift(-1)}
              aria-label="Decrease key by 1"
            >
              −
            </button>
            <span className="key-step-label">KEY {shift}</span>
            <button
              type="button"
              className="key-step-btn inc-btn"
              onClick={() => changeShift(1)}
              aria-label="Increase key by 1"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 5. LETTER-BY-LETTER MAPPING CARDS (Matching Reference Screenshot)    */}
      {/* =================================================================== */}
      <div className="wheel-mapping-cards-tray" role="region" aria-label="Letter-by-letter transformation stream">
        {mappingCards.map((card, i) => {
          const isCardActive =
            hasActiveInput && (
              hoveredCardIndex === i ||
              (hoveredLetter === card.plain && hoveredCardIndex === null)
            );

          return (
            <div key={`card-${card.plain}-${i}`} className="mapping-card-item-wrap">
              <div
                className={`mapping-card-box ${isCardActive ? "card-active" : ""}`}
                onMouseEnter={() => setHoveredCardIndex(i)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                onClick={() => handleCardClick(card, i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(card, i);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Letter ${card.plain} maps to ${card.cipher}`}
              >
                {/* Top Badge Circle with Step Number */}
                <span className="card-badge-circle">{card.index}</span>

                {/* Plaintext Letter (White) */}
                <span className="card-plain-char">{card.plain}</span>

                {/* Downward Transform Arrow */}
                <span className="card-arrow-down">↓</span>

                {/* Ciphertext Letter (Cyan) */}
                <span className="card-cipher-char">{card.cipher}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
