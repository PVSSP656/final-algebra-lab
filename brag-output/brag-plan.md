# Brag Plan: Abstract Algebra Lab

## What is this app?
Abstract Algebra Lab is an interactive undergraduate mathematics laboratory that investigates classical cryptography through the rigorous lens of group theory, modular arithmetic, and permutation symmetries across three distinct transformation systems: the Caesar Cipher ($C_{26}$), the Affine Cipher ($G_{\text{aff}}$), and $S_4$ Position Permutations.

## The angle
A cinematic, scientific product film with the aesthetic precision of a high-end mathematics documentary and the elegance of an Apple launch film. Set against a luminous ivory-white canvas with architectural mathematical grids, restrained cobalt-blue and violet accents, and pure typographic hierarchy. It connects classical cryptography directly to abstract algebraic structures—proving that every encryption is a group action and every decryption is an inverse element.

## Hook (first 2-3 seconds)
A pristine, museum-grade white canvas emerges with fine mathematical coordinate grids. Pure typographic typography: "ALGEBRAIC FOUNDATIONS OF CIPHERS". Group axioms $(G, \star)$ illuminate in fine cobalt and violet glyphs: Closure, Associativity, Identity $e$, Inverses $g^{-1}$. Core thesis: *"Every reversible transformation is an element of an algebraic group."*

## Key moments (the middle)
- **4–8s — Caesar Cipher & Cyclic Group $\mathbb{Z}_{26}$:** Concentric circular coordinate rings smoothly rotate by $+3$. The modular map $E_k(x) = (x + k) \bmod 26$ shifts plaintext $A \to D$ while displaying the generator $\langle 1 \rangle$ and order $|C_{26}| = 26$.
- **8–12s — Affine Cipher & Units $\mathbb{Z}_{26}^\times$:** The linear congruence $E_{(a,b)}(x) = (ax + b) \bmod 26$ reveals the coprimality constraint $\gcd(a, 26) = 1$. A live calculation displays $a=5 \implies a^{-1}=21$, verifying $(5 \times 21) \equiv 1 \pmod{26}$ and formulating the exact inverse $D_{(a,b)}(y) = a^{-1}(y - b) \bmod 26$.
- **12–16s — Permutations & Symmetric Group $S_4$:** Four geometric permutation nodes braid through mapping $\sigma = [3, 1, 4, 2]$. Position inversion reverses $CADB \xrightarrow{\sigma^{-1}} ABCD$. Clearly establishes $S_4$ with order $4! = 24$ as a non-abelian position-symmetry group, not a standard standalone cipher.

## Project reveal (16-21 seconds)
The camera transitions smoothly into the interactive Abstract Algebra Lab application. A refined laboratory workstation window showcases the live interactive Cipher Wheel, modular calculator cards, and group axioms comparison tables.
Complete title displays with editorial authority:
**ABSTRACT ALGEBRA LAB**
*Cryptography Through Abstract Algebra: An Interactive Study of Three Transformation Systems*
*"Where every click is a calculation and every inverse has a reason."*

## Outro / punchline (21-26 seconds)
The screen transitions to an elegant gallery honoring the **RESEARCH TEAM**:
- **P.V.S. Subramanya Prasad** — 24MMI0011 (Project Lead & Technical Lead)
- **Ananya Anand** — 24MMI0010 (Presentation & Explanation)
- **Aditya Datta** — 24MMI0013 (Usability & Documentation Support)
- **Varun Raaj** — 24MMI0009 (Mathematical Verification & QA)
- **Pavani Durga C** — 24MMI0020 (Literature Review & Academic Research Support)

Ending with the resonant scientific credo:
**MATHEMATICS. STRUCTURE. INTERACTION.**

## User flow worth showing
1. Entry: Select algebraic transformation system (Caesar $\to$ Affine $\to$ Permutations).
2. Key action: Manipulate key parameters (modular shift $k$, unit multiplier $a$, permutation array $\sigma$).
3. Result: Real-time wheel rotation, mathematical inverse derivation, and formal group axiom verification.

## Tone
- Preset: `cinematic`
- Creative direction: Premium scientific product documentary, Apple-like light theme, mathematical precision
- Interpretation: Restrained, elegant motion, spacious layouts, razor-sharp typography, zero clutter or dark hacker cliches.

## Format: landscape — 1920x1080 (30 fps)
## Duration: 26.0 seconds

## Visual identity (from the project)
- Background: `#fcfbfa` (pure ivory-white) and `#f4f3f0` (soft warm card surface)
- Primary Text: `#0f172a` (deep obsidian black)
- Secondary Text: `#475569` / `#64748b` (slate grey)
- Mathematical Accents: `#2563eb` (cobalt blue) and `#7c3aed` (academic violet)
- Borders & Grids: `#e2e0d8` / `rgba(37, 99, 235, 0.08)`
- Typography: Inter, SF Pro, system-ui, with KaTeX/Cambria Math mathematical serif styling

## Share copy (draft)
What happens when you decode classical cryptography through pure abstract algebra? Presenting Abstract Algebra Lab — an interactive undergraduate research project exploring modular arithmetic, affine groups, and symmetric permutations.

## Audio direction
- Role: Cinematic electronic research bed, restrained sound design
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (instrumental, refined mid-tempo electronic pulse)
- Music treatment: Low volume fade-in at 0s, steady energetic rhythm through cipher demonstrations, subtle volume ducking under project title, graceful fade out at 25.5s.
- SFX posture: Sparse, subtle, high-frequency-clean UI clicks and switch cues matching major scene transitions and modular rotations.

## Storyboard

### Scene 1 — The Mathematical World (0.0s – 4.0s)
Pristine white canvas with subtle geometric grid lines. Group axioms $(G, \star)$ fade in. Central typography introduces the algebraic foundation of ciphers.
- Visual: Fine coordinate grid, floating mathematical symbols $(\mathbb{Z}_n, \star, e, g^{-1})$, geometric symmetry glyph.
- Text: "ALGEBRAIC FOUNDATIONS OF CIPHERS" / "Every reversible transformation is an element of an algebraic group."
- Audio: Soft ambient riser, crisp switch hit at 1.6s.
- Transition: Clean camera push-in $\to$ Scene 2.

### Scene 2 — Caesar Cipher: Additive Cyclic Group $\mathbb{Z}_{26}$ (4.0s – 8.0s)
Concentric circular alphabet rings appear with crisp tick marks. Ring animates a rotation of $+3$.
- Visual: Dual concentric letter rings. Plaintext letter $A$ aligns with Ciphertext $D$. Group identity card: $(\mathbb{Z}_{26}, +) \cong C_{26}$.
- Formula: $E_k(x) = (x + k) \bmod 26 \quad\Longleftrightarrow\quad D_k(y) = (y - k) \bmod 26$
- Audio: Soft mechanical tick SFX on rotation settle at 5.8s.
- Transition: Smooth slide wipe $\to$ Scene 3.

### Scene 3 — Affine Cipher: The Affine Group $\operatorname{Aff}(\mathbb{Z}_{26})$ (8.0s – 12.0s)
Dual-parameter matrix transformation card appears. Multiplier $a=5$ and shift $b=8$.
- Visual: Interactive parameter controls, modular inverse derivation panel.
- Formula: $E_{(a,b)}(x) = (ax + b) \bmod 26$ with $\gcd(a, 26) = 1$.
- Live proof: $a = 5 \implies a^{-1} = 21 \quad (5 \times 21 = 105 \equiv 1 \bmod 26)$.
- Audio: Light switch click on inverse calculation at 9.5s.
- Transition: Smooth lateral pan $\to$ Scene 4.

### Scene 4 — Permutations & Symmetry: The Symmetric Group $S_4$ (12.0s – 16.0s)
Position braid diagram showcasing 4 elements $[1, 2, 3, 4] \xrightarrow{\sigma} [3, 1, 4, 2]$.
- Visual: 4-element block transformation card. Block text $CADB \xrightarrow{\sigma^{-1}} ABCD$.
- Group notation: Symmetric Group $S_4$, $|S_4| = 4! = 24$.
- Callout: "A study of position permutations and non-abelian symmetry, not standard standalone encryption."
- Audio: Swift mechanical click on permutation snap at 13.7s.
- Transition: Architectural zoom out into application viewport $\to$ Scene 5.

### Scene 5 — The Project Reveal: Abstract Algebra Lab (16.0s – 21.0s)
The full interactive web application is presented in an elevated studio workstation frame.
- Visual: The real lab interface with navigation header, interactive Cipher Wheel, live math calculators, and comparative group cards.
- Title overlay:
  **ABSTRACT ALGEBRA LAB**
  *Cryptography Through Abstract Algebra: An Interactive Study of Three Transformation Systems*
- Copy: *"Where every click is a calculation and every inverse has a reason."*
- Audio: Musical swell and rhythmic beat support at 17.9s.
- Transition: Elegant fade through warm white $\to$ Scene 6.

### Scene 6 — Research Team & Credo (21.0s – 26.0s)
Refined editorial team showcase featuring all five researchers with photos, names, registration numbers, and research roles.
- Heading: **RESEARCH TEAM**
- Cards:
  1. P.V.S. Subramanya Prasad (24MMI0011) — Project Lead & Technical Lead
  2. Ananya Anand (24MMI0010) — Presentation & Explanation
  3. Aditya Datta (24MMI0013) — Usability & Documentation Support
  4. Varun Raaj (24MMI0009) — Mathematical Verification & QA
  5. Pavani Durga C (24MMI0020) — Literature Review & Academic Research Support
- Final beat at 24.5s – 26.0s:
  **MATHEMATICS. STRUCTURE. INTERACTION.**
- Audio: Music resolves into gentle decay and clean final fade.

