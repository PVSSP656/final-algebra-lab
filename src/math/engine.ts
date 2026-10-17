export const MODULUS = 26
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const AFFINE_UNITS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25] as const
export type AffineKey = { a: number; b: number }
export type Permutation = [number, number, number, number]

export const S4: Permutation[] = [
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1],
  [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
  [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
  [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0],
  [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1],
  [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0],
]

export function mod(value: number, modulus = MODULUS): number {
  return ((value % modulus) + modulus) % modulus
}

export function gcd(left: number, right: number): number {
  let a = Math.abs(left)
  let b = Math.abs(right)
  while (b) [a, b] = [b, a % b]
  return a
}

export function modularInverse(value: number, modulus = MODULUS): number {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (mod(value * candidate, modulus) === 1) return candidate
  }
  throw new Error(`${value} has no inverse modulo ${modulus}.`)
}

export function caesarValue(value: number, shift: number): number {
  return mod(value + shift)
}

export function caesarText(text: string, shift: number): string {
  return [...text.toUpperCase()].map((character) => {
    const value = character.charCodeAt(0) - 65
    return value >= 0 && value < MODULUS ? ALPHABET[caesarValue(value, shift)] : character
  }).join('')
}

export function affineValue(value: number, key: AffineKey): number {
  if (!AFFINE_UNITS.includes(key.a as (typeof AFFINE_UNITS)[number])) {
    throw new Error(`a = ${key.a} is invalid: gcd(a, 26) must equal 1.`)
  }
  return mod(key.a * value + key.b)
}

export function affineText(text: string, key: AffineKey, decrypt = false): string {
  const operation = decrypt ? affineInverse(key) : key
  return [...text.toUpperCase()].map((character) => {
    const value = character.charCodeAt(0) - 65
    return value >= 0 && value < MODULUS ? ALPHABET[affineValue(value, operation)] : character
  }).join('')
}

/**
 * Composes two affine transformations: computes (first o second)(x) = first(second(x)).
 * Here, `second` is applied first (inner), and `first` is applied second (outer).
 * Formula: a_comp = (first.a * second.a) mod 26
 *          b_comp = (first.a * second.b + first.b) mod 26
 */
export function affineCompose(first: AffineKey, second: AffineKey): AffineKey {
  return { a: mod(first.a * second.a), b: mod(first.a * second.b + first.b) }
}

export function affineInverse(key: AffineKey): AffineKey {
  const inverseA = modularInverse(key.a)
  return { a: inverseA, b: mod(-inverseA * key.b) }
}

export function permutationApply(permutation: Permutation, block: string): string {
  return permutation.map((index) => block[index] ?? '').join('')
}

/**
 * Composes two permutations: computes (first o second)(x) = first(second(x)).
 * Here, `second` is applied first (inner), and `first` is applied second (outer).
 */
export function permutationCompose(first: Permutation, second: Permutation): Permutation {
  return first.map((index) => second[index]) as Permutation
}

export function permutationInverse(permutation: Permutation): Permutation {
  const inverse = [0, 0, 0, 0] as Permutation
  permutation.forEach((value, index) => { inverse[value] = index })
  return inverse
}

export function permutationText(permutation: Permutation, text: string, decrypt = false): string {
  const operation = decrypt ? permutationInverse(permutation) : permutation
  const chars = [...text.toUpperCase()]
  const positions = chars.flatMap((character, index) => /^[A-Z]$/.test(character) ? [index] : [])
  const letters = positions.map((index) => chars[index])
  for (let start = 0; start + 3 < letters.length; start += 4) {
    const transformed = permutationApply(operation, letters.slice(start, start + 4).join(''))
    transformed.split('').forEach((character, offset) => { letters[start + offset] = character })
  }
  positions.forEach((position, index) => { chars[position] = letters[index] })
  return chars.join('')
}

export function permutationLabel(permutation: Permutation): string {
  return `[${permutation.map((value) => value + 1).join(', ')}]`
}

export function permutationIsValid(permutation: number[]): permutation is Permutation {
  return permutation.length === 4 && new Set(permutation).size === 4 && permutation.every((value) => value >= 0 && value < 4)
}

export function transformationOrder(apply: (value: number) => number, size: number): number {
  let current = Array.from({ length: size }, (_, index) => index)
  const identity = current.join(',')
  for (let order = 1; order <= 1000; order += 1) {
    current = current.map(apply)
    if (current.join(',') === identity) return order
  }
  return 0
}

export type CaesarTraceStep = {
  inputChar: string
  inputValue: number
  shift: number
  formula: string
  outputValue: number
  outputChar: string
  isDecryption: boolean
}

export function getCaesarTrace(text: string, shift: number, decrypt = false): CaesarTraceStep[] {
  const steps: CaesarTraceStep[] = []
  const k = mod(shift, MODULUS)
  for (const character of text.toUpperCase()) {
    const value = character.charCodeAt(0) - 65
    if (value >= 0 && value < MODULUS) {
      if (!decrypt) {
        const y = caesarValue(value, k)
        steps.push({
          inputChar: character,
          inputValue: value,
          shift: k,
          formula: `(${value} + ${k}) mod 26 = ${value + k} mod 26`,
          outputValue: y,
          outputChar: ALPHABET[y],
          isDecryption: false,
        })
      } else {
        const x = caesarValue(value, -k)
        const diff = value - k
        steps.push({
          inputChar: character,
          inputValue: value,
          shift: k,
          formula: `(${value} - ${k}) mod 26 = ${diff} mod 26`,
          outputValue: x,
          outputChar: ALPHABET[x],
          isDecryption: true,
        })
      }
    }
  }
  return steps
}

export type AffineTraceStep = {
  inputChar: string
  inputValue: number
  a: number
  b: number
  aInv: number
  formula: string
  outputValue: number
  outputChar: string
  isDecryption: boolean
}

export function getAffineTrace(text: string, key: AffineKey, decrypt = false): AffineTraceStep[] {
  if (!AFFINE_UNITS.includes(key.a as (typeof AFFINE_UNITS)[number])) {
    throw new Error(`a = ${key.a} is invalid: gcd(a, 26) must equal 1.`)
  }
  const steps: AffineTraceStep[] = []
  const aInv = modularInverse(key.a)
  const b = mod(key.b, MODULUS)
  for (const character of text.toUpperCase()) {
    const value = character.charCodeAt(0) - 65
    if (value >= 0 && value < MODULUS) {
      if (!decrypt) {
        const raw = key.a * value + b
        const y = mod(raw)
        steps.push({
          inputChar: character,
          inputValue: value,
          a: key.a,
          b,
          aInv,
          formula: `(${key.a} × ${value} + ${b}) mod 26 = ${raw} mod 26`,
          outputValue: y,
          outputChar: ALPHABET[y],
          isDecryption: false,
        })
      } else {
        const diff = value - b
        const raw = aInv * diff
        const x = mod(raw)
        steps.push({
          inputChar: character,
          inputValue: value,
          a: key.a,
          b,
          aInv,
          formula: `${aInv} × (${value} - ${b}) mod 26 = ${aInv} × (${diff}) mod 26 = ${raw} mod 26`,
          outputValue: x,
          outputChar: ALPHABET[x],
          isDecryption: true,
        })
      }
    }
  }
  return steps
}

export type PermutationMapping = {
  outputPosition: number
  sourcePosition: number
  letter: string
}

export type PermutationBlockTrace = {
  blockIndex: number
  inputBlock: string
  key: Permutation
  inverseKey: Permutation
  mappings: PermutationMapping[]
  outputBlock: string
  isDecryption: boolean
}

export type PermutationTraceResult = {
  blocks: PermutationBlockTrace[]
  leftoverLetters: string
  fullOutput: string
}

export function getPermutationTrace(permutation: Permutation, text: string, decrypt = false): PermutationTraceResult {
  const chars = [...text.toUpperCase()]
  const letters = chars.filter((character) => /^[A-Z]$/.test(character))
  const inv = permutationInverse(permutation)
  const activePerm = decrypt ? inv : permutation
  const blocks: PermutationBlockTrace[] = []

  let blockIndex = 1
  for (let start = 0; start + 3 < letters.length; start += 4) {
    const blockChars = letters.slice(start, start + 4).join('')
    const outputBlock = permutationApply(activePerm, blockChars)
    const mappings: PermutationMapping[] = []

    for (let outIdx = 0; outIdx < 4; outIdx += 1) {
      const srcIdx = activePerm[outIdx]
      mappings.push({
        outputPosition: outIdx + 1,
        sourcePosition: srcIdx + 1,
        letter: blockChars[srcIdx] ?? '',
      })
    }

    blocks.push({
      blockIndex,
      inputBlock: blockChars,
      key: permutation,
      inverseKey: inv,
      mappings,
      outputBlock,
      isDecryption: decrypt,
    })
    blockIndex += 1
  }

  const completeCount = blocks.length * 4
  const leftoverLetters = letters.slice(completeCount).join('')
  const fullOutput = permutationText(permutation, text, decrypt)

  return {
    blocks,
    leftoverLetters,
    fullOutput,
  }
}

export type LetterFrequency = {
  letter: string
  count: number
  percentage: number
}

export type FrequencyAnalysisResult = {
  totalAlphabetic: number
  frequencies: LetterFrequency[]
  maxPercentage: number
  maxCount: number
}

/**
 * Computes exact counts and percentages for all A-Z characters in text.
 * Excludes spaces, punctuation, digits, and non-ASCII characters.
 * Percentage formula: f(c) = (count(c) / totalAlphabetic) * 100%.
 */
export function computeLetterFrequencies(text: string): FrequencyAnalysisResult {
  const counts = new Map<string, number>()
  for (const char of ALPHABET) {
    counts.set(char, 0)
  }
  let totalAlphabetic = 0
  for (const char of text.toUpperCase()) {
    if (counts.has(char)) {
      counts.set(char, (counts.get(char) ?? 0) + 1)
      totalAlphabetic += 1
    }
  }
  let maxPercentage = 0
  let maxCount = 0
  const frequencies: LetterFrequency[] = ALPHABET.split('').map((letter) => {
    const count = counts.get(letter) ?? 0
    if (count > maxCount) maxCount = count
    const percentage = totalAlphabetic > 0 ? (count / totalAlphabetic) * 100 : 0
    if (percentage > maxPercentage) maxPercentage = percentage
    return {
      letter,
      count,
      percentage: Number(percentage.toFixed(2)),
    }
  })
  return {
    totalAlphabetic,
    frequencies,
    maxPercentage,
    maxCount,
  }
}