# Abstract Algebra Lab

**Cryptography Through Abstract Algebra** is an interactive study of three reversible transformation systems:

- Caesar shifts modulo 26 (`C26`)
- Invertible affine maps modulo 26 (`AGL(1, 26)`)
- Position permutations in `S4`

The app is a tested educational tool, not a secure messaging service. It demonstrates encryption/decryption, inverses, composition, identity, order, commutativity and structural comparison.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Checks

```bash
npm run build
npm run lint
npm run verify
```

`src/math/engine.ts` is the shared typed calculation layer used by the UI. `scripts/verify_math.py` independently checks the approved conventions, counts, inverses, composition laws and representative message behavior.

## Input conventions

Text is uppercased while nonletters are preserved. S4 permutations operate on complete alphabetic blocks of four; a final incomplete block is left unchanged. For functions, `f composed with g` means apply `g` first.
