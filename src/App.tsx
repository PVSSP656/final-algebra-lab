import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AFFINE_UNITS,
  ALPHABET,
  S4,
  affineCompose,
  affineText,
  caesarText,
  permutationCompose,
  permutationInverse,
  permutationLabel,
  permutationText,
  type AffineKey,
  type Permutation,
} from "./math/engine";
import { CipherWheel } from "./components/CipherWheel";
import { GroupCipherCards } from "./components/GroupCipherCards";
import { LabCalculations } from "./components/LabCalculations";
import { CommonAlgebraicStructure } from "./components/CommonAlgebraicStructure";
import { ExperimentsLab } from "./components/ExperimentsLab";
import "./App.css";

type Page =
  | "home"
  | "team"
  | "foundations"
  | "lab"
  | "groups"
  | "structure"
  | "security"
  | "research";
type System = "caesar" | "affine" | "permutation";
const navItems: { id: Page; label: string }[] = [
  { id: "home", label: "Overview" },
  { id: "foundations", label: "Foundations" },
  { id: "groups", label: "Group Explorer" },
  { id: "lab", label: "The Lab" },
  { id: "structure", label: "Algebraic Structure" },
  { id: "security", label: "Experiments" },
  { id: "team", label: "The Team" },
  { id: "research", label: "Research Log" },
];
const systemMeta: Record<
  System,
  { name: string; symbol: string; order: string; color: string }
> = {
  caesar: {
    name: "Caesar shifts",
    symbol: "C₂₆",
    order: "26",
    color: "violet",
  },
  affine: {
    name: "Affine maps",
    symbol: "AGL(1, 26)",
    order: "312",
    color: "blue",
  },
  permutation: {
    name: "Position permutations",
    symbol: "S₄",
    order: "24",
    color: "silver",
  },
};

function App() {
  const [page, setPage] = useState<Page>("home");
  const [system, setSystem] = useState<System>("caesar");
  const [message, setMessage] = useState("HELLO, ALGEBRA!");
  const [shift, setShift] = useState(3);
  const [affine, setAffine] = useState<AffineKey>({ a: 5, b: 8 });
  const [permutationIndex, setPermutationIndex] = useState(13);
  const [decrypt, setDecrypt] = useState(false);
  const [comparePermutation, setComparePermutation] = useState(6);
  const [compareAffine, setCompareAffine] = useState<AffineKey>({ a: 3, b: 4 });
  const [menuOpen, setMenuOpen] = useState(false);
  const permutation = S4[permutationIndex];
  const output = useMemo(
    () =>
      system === "caesar"
        ? caesarText(message, decrypt ? -shift : shift)
        : system === "affine"
          ? affineText(message, affine, decrypt)
          : permutationText(permutation, message, decrypt),
    [affine, decrypt, message, permutation, shift, system],
  );
  const navigate = (next: Page) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="Return to overview"
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            Abstract <b>Algebra</b> Lab
          </span>
        </button>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          Menu <span>{menuOpen ? "−" : "+"}</span>
        </button>
        <nav
          className={menuOpen ? "nav-links open" : "nav-links"}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="status">
          <i /> live system
        </span>
      </header>
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {page === "home" && (
              <Home
                navigate={navigate}
                output={caesarText("HELLO", shift)}
                shift={shift}
              />
            )}
            {page === "foundations" && <Foundations />}
            {page === "lab" && (
              <Lab
                system={system}
                setSystem={setSystem}
                message={message}
                setMessage={setMessage}
                shift={shift}
                setShift={setShift}
                affine={affine}
                setAffine={setAffine}
                permutationIndex={permutationIndex}
                setPermutationIndex={setPermutationIndex}
                permutation={permutation}
                decrypt={decrypt}
                setDecrypt={setDecrypt}
                output={output}
              />
            )}
            {page === "groups" && (
              <Groups
                comparePermutation={comparePermutation}
                setComparePermutation={setComparePermutation}
                compareAffine={compareAffine}
                setCompareAffine={setCompareAffine}
              />
            )}
            {page === "structure" && <CommonAlgebraicStructure />}
            {page === "security" && <ExperimentsLab />}
            {page === "team" && <Team />}
            {page === "research" && <Research />}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer>
        <span>CRYPTOGRAPHY THROUGH ABSTRACT ALGEBRA</span>
        <span>LAB / 2026</span>
        <span>REVERSIBILITY IS STRUCTURE</span>
      </footer>
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
function Home({
  navigate,
  output,
  shift,
}: {
  navigate: (page: Page) => void;
  output: string;
  shift: number;
}) {
  return (
    <div className="home page-wrap">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            A FIELD GUIDE TO REVERSIBLE SYSTEMS <span>◈</span>
          </p>
          <h1>
            Cryptography
            <br />
            <em>through</em> abstract
            <br />
            algebra.
          </h1>
          <p className="hero-sub">
            An interactive study of three transformation systems, where every
            click is a calculation and every inverse has a reason.
          </p>
          <button className="primary-button" onClick={() => navigate("lab")}>
            Enter the laboratory <span>↗</span>
          </button>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-core">
            <span>f</span>
            <i>−¹</i>
          </div>
          <div className="orbit-label label-top">
            INPUT <b>x</b>
          </div>
          <div className="orbit-label label-right">
            OUTPUT <b>f(x)</b>
          </div>
          <div className="orbit-label label-bottom">
            INVERSE <b>f⁻¹</b>
          </div>
        </div>
      </section>
      <section className="signal-strip">
        <span>01 / RESEARCH QUESTION</span>
        <p>
          How does abstract algebra help us understand, compare, and verify
          reversible transformation systems used in classical cryptography?
        </p>
        <button onClick={() => navigate("foundations")}>
          Read the premise ↗
        </button>
      </section>
      <section className="home-lower">
        <div>
          <p className="eyebrow">LIVE SIGNAL</p>
          <h2>
            Every output
            <br />
            has a trail.
          </h2>
          <p className="muted">
            Watch a Caesar shift operate modulo 26. The engine is live: change
            the key, then trace the inverse.
          </p>
          <button className="text-button" onClick={() => navigate("lab")}>
            Open interactive lab <span>→</span>
          </button>
        </div>
        <div className="mini-terminal">
          <div className="terminal-head">
            <span>TRANSFORMATION / C₂₆</span>
            <span className="terminal-dot" />
          </div>
          <div className="terminal-row">
            <span>INPUT</span>
            <strong>HELLO</strong>
          </div>
          <div className="terminal-row accent-row">
            <span>KEY</span>
            <strong>+{shift}</strong>
          </div>
          <div className="terminal-arrow">↓</div>
          <div className="terminal-row output-row">
            <span>OUTPUT</span>
            <strong>{output}</strong>
          </div>
          <small>Eₖ(x) = (x + {shift}) mod 26</small>
        </div>
      </section>
      <section className="system-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THREE SYSTEMS / ONE QUESTION</p>
            <h2>Compare the structure.</h2>
          </div>
          <button className="text-button" onClick={() => navigate("groups")}>
            Explore groups <span>→</span>
          </button>
        </div>
        <div className="system-cards">
          {(Object.keys(systemMeta) as System[]).map((key, index) => (
            <button
              className={`system-card ${systemMeta[key].color}`}
              key={key}
              onClick={() => navigate("lab")}
            >
              <span>0{index + 1}</span>
              <b>{systemMeta[key].symbol}</b>
              <strong>{systemMeta[key].name}</strong>
              <small>order / {systemMeta[key].order}</small>
              <i>↗</i>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function Foundations() {
  const [open, setOpen] = useState("group");
  const concepts = [
    {
      id: "group",
      title: "A group is a promise of reversibility",
      text: "A set with an operation is a group when it has closure, associativity, an identity element, and an inverse for every element. That last property is the bridge to reversible transformations.",
    },
    {
      id: "mod",
      title: "Modular arithmetic wraps around",
      text: "In Z₂₆, numbers live on a ring from 0 to 25. After 25 comes 0. Caesar encryption is addition in this ring: Eₖ(x) = (x + k) mod 26.",
    },
    {
      id: "compose",
      title: "Composition is the operation",
      text: "For functions, f composed with g means f(g(x)): apply g first. The order matters for affine maps and permutations, even when it does not matter for Caesar shifts.",
    },
  ];
  return (
    <div className="page-wrap">
      <PageIntro
        eyebrow="01 / MATHEMATICAL FOUNDATIONS"
        title={
          <>
            The grammar of
            <br />
            <em>reversibility.</em>
          </>
        }
      >
        <p>
          Before we ask whether a transformation is useful, we ask whether it is
          well-formed. Algebra gives us the vocabulary to verify that question.
        </p>
      </PageIntro>
      <section className="foundation-layout">
        <div className="concept-list">
          {concepts.map((concept) => (
            <button
              key={concept.id}
              className={open === concept.id ? "concept open" : "concept"}
              onClick={() => setOpen(concept.id)}
            >
              <span>{open === concept.id ? "−" : "+"}</span>
              <strong>{concept.title}</strong>
              {open === concept.id && <p>{concept.text}</p>}
            </button>
          ))}
        </div>
        <div className="equation-board">
          <p className="eyebrow">WORKED EXAMPLE / C₂₆</p>
          <div className="big-equation">
            E<sub>3</sub>(7) = <b>(7 + 3)</b> mod 26 = 10
          </div>
          <div className="letter-track">
            {ALPHABET.slice(0, 13)
              .split("")
              .map((letter, index) => (
                <span
                  className={index === 7 || index === 10 ? "marked" : ""}
                  key={letter}
                >
                  {letter}
                  <small>{index}</small>
                </span>
              ))}
          </div>
          <div className="equation-note">
            <span>GIVEN</span>
            <p>
              H is 7 in zero-indexed alphabet space. A shift of 3 lands at K,
              which is 10.
            </p>
          </div>
        </div>
      </section>
      <section className="axiom-row">
        {["closure", "associativity", "identity", "inverse"].map(
          (item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
              <small>
                {index === 0
                  ? "results stay in the set"
                  : index === 1
                    ? "grouping does not matter"
                    : index === 2
                      ? "the neutral move"
                      : "every move can unwind"}
              </small>
            </div>
          ),
        )}
      </section>
    </div>
  );
}

function Lab(props: {
  system: System;
  setSystem: (v: System) => void;
  message: string;
  setMessage: (v: string) => void;
  shift: number;
  setShift: (v: number) => void;
  affine: AffineKey;
  setAffine: (v: AffineKey) => void;
  permutationIndex: number;
  setPermutationIndex: (v: number) => void;
  permutation: Permutation;
  decrypt: boolean;
  setDecrypt: (v: boolean) => void;
  output: string;
}) {
  const {
    system,
    setSystem,
    message,
    setMessage,
    shift,
    setShift,
    affine,
    setAffine,
    permutationIndex,
    setPermutationIndex,
    permutation,
    decrypt,
    setDecrypt,
    output,
  } = props;
  const keyLabel =
    system === "caesar"
      ? `k = ${shift}`
      : system === "affine"
        ? `a = ${affine.a}, b = ${affine.b}`
        : permutationLabel(permutation);
  return (
    <div className="page-wrap lab-page">
      <PageIntro
        eyebrow="03 / INTERACTIVE CRYPTOGRAPHY LAB"
        title={
          <>
            Turn the key.
            <br />
            <em>Trace the proof.</em>
          </>
        }
      >
        <p>
          One engine powers the input, the output, the equation and the inverse.
          Change a parameter and watch the system stay honest.
        </p>
      </PageIntro>
      <div className="lab-grid">
        <section className="lab-controls panel">
          <div className="panel-label">
            <span>TRANSFORMATION</span>
            <span>LIVE</span>
          </div>
          <div className="segmented">
            {(["caesar", "affine", "permutation"] as System[]).map((item) => (
              <button
                key={item}
                className={system === item ? "selected" : ""}
                onClick={() => setSystem(item)}
              >
                {systemMeta[item].symbol}
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="control-divider" />
          {system === "caesar" && (
            <>
              <div className="control-title">
                <span>Shift key</span>
                <b>{shift}</b>
              </div>
              <input
                className="range"
                type="range"
                min="0"
                max="25"
                value={shift}
                aria-label="Caesar shift key"
                style={{ background: `linear-gradient(90deg, var(--lav) ${(shift / 25) * 100}%, rgba(173, 166, 211, 0.2) ${(shift / 25) * 100}%)` }}
                onChange={(event) => setShift(Number(event.target.value))}
              />
              <div className="range-labels">
                <span>0</span>
                <span>13</span>
                <span>25</span>
              </div>
            </>
          )}
          {system === "affine" && (
            <div className="affine-inputs">
              <label>
                a{" "}
                <select
                  value={affine.a}
                  onChange={(event) =>
                    setAffine({ ...affine, a: Number(event.target.value) })
                  }
                >
                  {AFFINE_UNITS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                b{" "}
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={affine.b}
                  onChange={(event) =>
                    setAffine({ ...affine, b: Number(event.target.value) })
                  }
                />
              </label>
            </div>
          )}
          {system === "permutation" && (
            <label className="field-label">
              S₄ key
              <select
                value={permutationIndex}
                onChange={(event) =>
                  setPermutationIndex(Number(event.target.value))
                }
              >
                {S4.map((item, index) => (
                  <option value={index} key={item.join("")}>
                    {permutationLabel(item)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="lab-action-group">
            <button
              type="button"
              className={`action-btn encrypt-btn ${!decrypt ? "active" : ""}`}
              onClick={() => setDecrypt(false)}
              aria-label="Encrypt message using forward transformation"
            >
              <span>Encrypt Message</span>
              <small>E(x) forward</small>
            </button>
            <button
              type="button"
              className={`action-btn decrypt-btn ${decrypt ? "active" : ""}`}
              onClick={() => setDecrypt(true)}
              aria-label="Decrypt message using inverse transformation"
            >
              <span>Decrypt Message</span>
              <small>D(y) inverse</small>
            </button>
          </div>
          <button
            className="reset-button"
            onClick={() => {
              setMessage("HELLO, ALGEBRA!");
              setShift(3);
              setAffine({ a: 5, b: 8 });
              setPermutationIndex(13);
              setDecrypt(false);
            }}
          >
            Reset experiment
          </button>
        </section>
        <section className="lab-output">
          <div className="output-window">
            <div className="window-top">
              <span>OUTPUT / {keyLabel}</span>
              <span className="window-live">
                <i /> {decrypt ? "DECRYPTED (INVERSE)" : "ENCRYPTED (FORWARD)"}
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={output}
                className="output-message"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {output || "TYPE A MESSAGE"}
              </motion.div>
            </AnimatePresence>
            <div className="operation-path">
              <span>{decrypt ? "CIPHER TEXT" : "PLAIN TEXT"}</span>
              <i>→</i>
              <strong>{systemMeta[system].symbol}</strong>
              <i>→</i>
              <span>{decrypt ? "PLAIN TEXT" : "CIPHER TEXT"}</span>
            </div>
          </div>
          <CipherWheel
            shift={shift}
            setShift={setShift}
            plaintext={message}
            ciphertext={output}
            system={system}
          />
          <LabCalculations
            system={system}
            message={message}
            output={output}
            shift={shift}
            affine={affine}
            permutation={permutation}
            decrypt={decrypt}
          />
          <div className="calculation">
            <p className="eyebrow">ENGINE TRACE</p>
            <code>
              {system === "caesar"
                ? (decrypt
                    ? `D_${shift}(y) = (y - ${shift}) mod 26`
                    : `E_${shift}(x) = (x + ${shift}) mod 26`)
                : system === "affine"
                  ? (decrypt
                      ? `D_(${affine.a},${affine.b})(y) = ${affine.a}⁻¹(y - ${affine.b}) mod 26`
                      : `E_(${affine.a},${affine.b})(x) = (${affine.a}x + ${affine.b}) mod 26`)
                  : (decrypt
                      ? `P⁻¹ = ${permutationLabel(permutationInverse(permutation))} · complete blocks of 4`
                      : `P = ${permutationLabel(permutation)} · complete blocks of 4`)}
            </code>
            <div className="verification">
              <span>INVERSE CHECK</span>
              <strong>f⁻¹(f(x)) = x</strong>
              <b>✓ verified</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function Groups({
  comparePermutation,
  setComparePermutation,
  compareAffine,
  setCompareAffine,
}: {
  comparePermutation: number;
  setComparePermutation: (v: number) => void;
  compareAffine: AffineKey;
  setCompareAffine: (v: AffineKey) => void;
}) {
  const first = S4[13];
  const second = S4[comparePermutation];
  const fg = permutationCompose(first, second);
  const gf = permutationCompose(second, first);
  const affineResult = affineCompose({ a: 5, b: 8 }, compareAffine);
  return (
    <div className="page-wrap">
      <PageIntro
        eyebrow="02 / GROUP EXPLORER"
        title={
          <>
            The operation is
            <br />
            <em>the message.</em>
          </>
        }
      >
        <p>
          Explore identity, inverse and composition across C₂₆, AGL(1, 26), and S₄.
          Click any cipher card below to expand its verified definition, formulas, and worked examples.
        </p>
      </PageIntro>
      <GroupCipherCards />
      <section className="metrics-row">
        {Object.entries(systemMeta).map(([key, meta]) => (
          <div key={key}>
            <span>{meta.symbol}</span>
            <strong>{meta.order}</strong>
            <small>elements / {meta.name}</small>
          </div>
        ))}
      </section>
      <section className="composition panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">COMPOSITION LAB / S₄</p>
            <h2>Does order matter?</h2>
          </div>
          <span className="noncommutative">NON-COMMUTATIVE</span>
        </div>
        <div className="composition-selects">
          <span>P = {permutationLabel(first)}</span>
          <select
            value={comparePermutation}
            onChange={(event) =>
              setComparePermutation(Number(event.target.value))
            }
          >
            {S4.map((item, index) => (
              <option value={index} key={item.join("")}>
                Q = {permutationLabel(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="composition-results">
          <div>
            <small>P ∘ Q</small>
            <strong>{permutationLabel(fg)}</strong>
            <p>apply Q first, then P</p>
          </div>
          <div className="vs">≠</div>
          <div>
            <small>Q ∘ P</small>
            <strong>{permutationLabel(gf)}</strong>
            <p>apply P first, then Q</p>
          </div>
        </div>
        <div className="mapping-row">
          <span>ABCD</span>
          <i>→</i>
          <b>{permutationText(fg, "ABCD")}</b>
          <i>and</i>
          <b>{permutationText(gf, "ABCD")}</b>
        </div>
      </section>
      <section className="split-explorer">
        <div className="panel inverse-card">
          <p className="eyebrow">AFFINE INVERSE</p>
          <h3>
            E<sub>(5, 8)</sub>
            <sup>−1</sup>
          </h3>
          <div className="inverse-equation">
            <span>a⁻¹ = 21</span>
            <span>b′ = −a⁻¹b mod 26 = −21 × 8 mod 26 = −168 mod 26 = 14</span>
          </div>
          <strong className="inverse-result">
            E<sub>(21, 14)</sub>
          </strong>
          <small>Verification: (5 × 21) mod 26 = 105 mod 26 = 1</small>
        </div>
        <div className="panel affine-compose">
          <p className="eyebrow">AFFINE COMPOSITION</p>
          <div className="affine-compose-row">
            <span className="compose-prefix">
              E<sub>(5, 8)</sub> ∘ E
            </span>
            <div className="compose-inputs">
              <label className="compose-input-label">
                <span>a₂</span>
                <select
                  value={compareAffine.a}
                  onChange={(event) =>
                    setCompareAffine({
                      ...compareAffine,
                      a: Number(event.target.value),
                    })
                  }
                  aria-label="Unit multiplier a2"
                >
                  {AFFINE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label className="compose-input-label">
                <span>b₂</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={compareAffine.b}
                  onChange={(event) =>
                    setCompareAffine({
                      ...compareAffine,
                      b: Math.max(0, Math.min(25, Number(event.target.value) || 0)),
                    })
                  }
                  aria-label="Shift b2"
                />
              </label>
            </div>
          </div>
          <strong className="compose-result">
            E
            <sub>
              ({affineResult.a}, {affineResult.b})
            </sub>
          </strong>
          <small className="compose-formula-note">
            ((5 × {compareAffine.a}) mod 26, (5 × {compareAffine.b} + 8) mod 26) = ({affineResult.a}, {affineResult.b})
          </small>
        </div>
      </section>
    </div>
  );
}


type TeamMember = {
  id: string;
  name: string;
  registrationNumber: string;
  role: string;
  responsibilities: string[];
  image: string;
  imageAlt: string;
};

const teamMembers: TeamMember[] = [
  {
    id: "project-lead",
    name: "P. V. S. Subramanya Prasad",
    registrationNumber: "Registration number not added",
    role: "Project Lead & Technical Lead",
    responsibilities: [
      "Overall project architecture and technical direction.",
      "Design and implementation of the mathematical transformation engine.",
      "Implementation and integration of the Caesar, affine, and position-permutation systems.",
      "Mathematical correctness, testing, and verification of encryption, decryption, inverses, and composition.",
      "Integration of interactive visualizations with the underlying mathematical logic.",
      "Code review and coordination of implementation work.",
      "Final integration, responsive behavior, and deployment coordination.",
    ],
    image: "/images/team/project-lead.svg",
    imageAlt: "Portrait placeholder for P. V. S. Subramanya Prasad",
  },
  {
    id: "pavani",
    name: "Pavani",
    registrationNumber: "Registration number not added",
    role: "Research & Academic Writing",
    responsibilities: [
      "Research paper and literature review.",
      "References and academic writing.",
    ],
    image: "/images/team/pavani.svg",
    imageAlt: "Portrait placeholder for Pavani",
  },
  {
    id: "varun",
    name: "Varun",
    registrationNumber: "Registration number not added",
    role: "Mathematical Verification & QA",
    responsibilities: [
      "Independent mathematical verification and expected results.",
      "Testing and quality assurance.",
    ],
    image: "/images/team/varun.svg",
    imageAlt: "Portrait placeholder for Varun",
  },
  {
    id: "ananya",
    name: "Ananya",
    registrationNumber: "Registration number not added",
    role: "Presentation & Explanation",
    responsibilities: [
      "Presentation and plain-language explanations.",
      "Demonstration script and viva preparation.",
    ],
    image: "/images/team/ananya.svg",
    imageAlt: "Portrait placeholder for Ananya",
  },
  {
    id: "dotto",
    name: "Dotto",
    registrationNumber: "Registration number not added",
    role: "Usability & Documentation Support",
    responsibilities: [
      "Usability testing and reproducible bug reports.",
      "Quality assurance and documentation support.",
    ],
    image: "/images/team/dotto.svg",
    imageAlt: "Portrait placeholder for Dotto",
  },
];

function Team() {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const displayedId = hoveredId ?? pinnedId;

  const togglePin = (id: string) => {
    setPinnedId((current) => (current === id ? null : id));
  };

  return (
    <div className="page-wrap team-page-wrap">
      <PageIntro
        eyebrow="06 / THE TEAM"
        title={
          <>
            Five roles.
            <br />
            <em>One investigation.</em>
          </>
        }
      >
        <p>
          A collaborative research tool is itself a small system: distinct
          roles, shared conventions, one verified result. Hover to explore a
          profile.
        </p>
      </PageIntro>

      {/* Vertical Member Profiles Stack */}
      <div className="team-vertical-list" role="region" aria-label="Team member profiles">
        {teamMembers.map((member, index) => {
          const isPinned = pinnedId === member.id;
          const isDisplayed = displayedId === member.id;
          return (
            <VerticalTeamRow
              key={member.id}
              member={member}
              number={`0${index + 1}`}
              isPinned={isPinned}
              isDisplayed={isDisplayed}
              onTogglePin={() => togglePin(member.id)}
              onHoverStart={() => setHoveredId(member.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClose={() => {
                setPinnedId(null);
                setHoveredId(null);
              }}
            />
          );
        })}
      </div>

      <div className="team-note">
        <span>COLLABORATIVE RESEARCH / 2026</span>
        <p>
          The team studies how algebraic structure makes transformation systems
          understandable, comparable and testable.
        </p>
      </div>
    </div>
  );
}

function VerticalTeamRow({
  member,
  number,
  isPinned,
  isDisplayed,
  onTogglePin,
  onHoverStart,
  onHoverEnd,
  onClose,
}: {
  member: TeamMember;
  number: string;
  isPinned: boolean;
  isDisplayed: boolean;
  onTogglePin: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClose: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article
      className={`team-vertical-card ${isDisplayed ? "open" : ""} ${isPinned ? "pinned" : ""}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div
        className="team-row-summary"
        onClick={onTogglePin}
        role="button"
        tabIndex={0}
        aria-expanded={isDisplayed}
        aria-label={`${member.name}, ${member.role}. ${isPinned ? "Click to close profile." : "Click to open profile."}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTogglePin();
          }
        }}
      >
        <div className="team-summary-left">
          <div className="team-avatar-container">
            {imageFailed ? (
              <span className="portrait-placeholder" aria-hidden="true">{initials}</span>
            ) : (
              <img src={member.image} alt={member.imageAlt} onError={() => setImageFailed(true)} />
            )}
          </div>
          <div className="team-summary-text">
            <div className="team-meta-tagline">
              <span className="team-member-number">{number}</span>
              {isPinned && <span className="team-pin-badge is-pinned">OPEN</span>}
            </div>
            <h3 className="team-member-name">{member.name}</h3>
            <span className="team-member-role-title">{member.role}</span>
          </div>
        </div>

        <div className="team-action-hint">
          <span className="action-hint-label">
            {isPinned ? "Close" : "Details"}
          </span>
          <span className="action-hint-icon" aria-hidden="true">
            {isDisplayed ? "◀" : "▶"}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isDisplayed && (
          <motion.div
            key={member.id}
            className="team-slideout-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-header-row">
              <div>
                <span className="eyebrow">RESEARCH PROFILE / {number}</span>
                <h4 className="details-heading">{member.name}</h4>
              </div>
              <button
                type="button"
                className="details-close-btn"
                onClick={onClose}
                aria-label={`Close profile for ${member.name}`}
              >
                ✕
              </button>
            </div>

            <div className="details-submeta">
              <span className="details-reg-num">{member.registrationNumber}</span>
              <strong className="details-role-highlight">{member.role}</strong>
            </div>

            <div className="details-responsibilities-box">
              <span className="responsibilities-label">KEY RESPONSIBILITIES &amp; SCOPE</span>
              <ul className="responsibilities-list">
                {member.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function Research() {
  return (
    <div className="page-wrap">
      <PageIntro
        eyebrow="06 / RESEARCH LOG"
        title={
          <>
            A tool with
            <br />
            <em>receipts.</em>
          </>
        }
      >
        <p>
          The implementation keeps its claims close to its calculations. Here is
          the compact record of scope, method and limits.
        </p>
      </PageIntro>
      <section className="research-grid">
        <div className="research-block">
          <p className="eyebrow">RESEARCH QUESTION</p>
          <h2>
            How does abstract algebra help us understand, compare, and verify
            different reversible transformation systems used in classical
            cryptography?
          </h2>
        </div>
        <div className="research-block">
          <p className="eyebrow">VERIFIED RESULTS</p>
          <ul>
            <li>Caesar: 26 shifts, cyclic and abelian.</li>
            <li>Affine: 312 invertible maps, non-abelian.</li>
            <li>S₄: 24 position permutations, non-abelian.</li>
            <li>Different finite orders rule out isomorphism.</li>
          </ul>
        </div>
        <div className="research-block wide">
          <p className="eyebrow">METHOD + LIMITATIONS</p>
          <p>
            Typed functions are the single source for UI calculations. Inputs
            are uppercased; nonletters are preserved; permutation text processes
            complete alphabetic blocks of four and leaves an incomplete final
            block unchanged. This is a tested educational tool, not a secure
            messaging service.
          </p>
        </div>
      </section>
    </div>
  );
}
export default App;
