import { motion } from 'motion/react'
import { ALPHABET } from '../math/engine'

type CipherWheelProps = {
  shift: number
  setShift: (value: number) => void
  plaintext: string
  ciphertext: string
  system: 'caesar' | 'affine' | 'permutation'
}

const wheelGeometry = {
  center: 150,
  alphabetRadius: 128,
  guideRadius: 94,
  centerRadius: 48,
} as const
const { center, alphabetRadius, guideRadius, centerRadius } = wheelGeometry
const step = (Math.PI * 2) / ALPHABET.length
const pairPalette = ['#B8A7FF', '#8EDCFF', '#FFD76A', '#FF9D8F', '#F3B6D2', '#A9E6D1', '#C3C8FF']

function pointAt(radius: number, index: number) {
  const angle = -Math.PI / 2 + index * step
  return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius }
}

export function CipherWheel({ shift, setShift, plaintext, ciphertext, system }: CipherWheelProps) {
  const plaintextCharacters = [...plaintext.toUpperCase()].filter((letter) => ALPHABET.includes(letter))
  const ciphertextCharacters = [...ciphertext.toUpperCase()].filter((letter) => ALPHABET.includes(letter))
  const pairMap = new Map<number, { ciphertextIndex: number; color: string }>()
  plaintextCharacters.forEach((letter, occurrence) => {
    const plaintextIndex = ALPHABET.indexOf(letter)
    const ciphertextIndex = ALPHABET.indexOf(ciphertextCharacters[occurrence] ?? '')
    if (plaintextIndex >= 0 && ciphertextIndex >= 0 && !pairMap.has(plaintextIndex)) {
      pairMap.set(plaintextIndex, { ciphertextIndex, color: pairPalette[plaintextIndex % pairPalette.length] })
    }
  })
  const pairs = [...pairMap.entries()].map(([plaintextIndex, pair]) => ({ plaintextIndex, ...pair }))
  const angle = shift * (360 / ALPHABET.length)

  const changeShift = (delta: number) => setShift((shift + delta + ALPHABET.length) % ALPHABET.length)

  return (
    <div className="wheel-wrap">
      <div className="wheel-heading">
        <span>CIPHER WHEEL / C₂₆</span>
        <small>{system === 'caesar' ? 'use arrows or the key slider' : 'caesar reference instrument'}</small>
      </div>
      <div
        className="wheel-stage"
        tabIndex={0}
        role="slider"
        aria-label="Caesar shift wheel"
        aria-valuemin={0}
        aria-valuemax={25}
        aria-valuenow={shift}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') changeShift(1)
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') changeShift(-1)
        }}
      >
        <svg className="wheel-svg" viewBox="0 0 300 300" aria-label={`Caesar shift ${shift}`} role="img">
          <defs>
            <filter id="wheel-selected-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.1" result="blur" />
              <feFlood floodColor="currentColor" floodOpacity="0.82" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="halo" />
              <feMerge><feMergeNode in="halo" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="wheel-cipher-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.7" result="blur" />
              <feFlood floodColor="currentColor" floodOpacity="0.7" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="halo" />
              <feMerge><feMergeNode in="halo" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle className="wheel-orbit outer" cx={center} cy={center} r={alphabetRadius} />
          <circle className="wheel-orbit inner" cx={center} cy={center} r={guideRadius} />
          <circle className="wheel-spoke" cx={center} cy={center} r="54" />
          <motion.g
            animate={{ rotate: angle }}
            style={{ transformOrigin: `${center}px ${center}px` }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.55 }}
          >
            {pairs.map(({ plaintextIndex, color }) => {
              const point = pointAt(alphabetRadius, plaintextIndex)
              return <motion.circle key={`plaintext-halo-${plaintextIndex}`} className="wheel-selected-halo" style={{ color }} cx={point.x} cy={point.y} r="8" initial={{ opacity: 0 }} animate={{ opacity: 0.88 }} transition={{ duration: 0.22 }} />
            })}
            {ALPHABET.split('').map((letter, index) => {
              const outer = pointAt(alphabetRadius, index)
              const pair = pairMap.get(index)
              return (
                <g key={letter}>
                  <text className={pair ? 'wheel-letter pair-plaintext' : 'wheel-letter'} style={pair ? { color: pair.color } : undefined} x={outer.x} y={outer.y} textAnchor="middle" dominantBaseline="middle">{letter}</text>
                </g>
              )
            })}
          </motion.g>
          {pairs.map(({ ciphertextIndex, color, plaintextIndex }) => {
            const point = pointAt(guideRadius, ciphertextIndex)
            return <motion.circle key={`cipher-halo-${plaintextIndex}-${ciphertextIndex}`} className="wheel-cipher-halo" style={{ color }} cx={point.x} cy={point.y} r="7" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.22 }} />
          })}
          {ALPHABET.split('').map((letter, index) => {
            const inner = pointAt(guideRadius, index)
            const pair = pairs.find(({ ciphertextIndex }) => ciphertextIndex === index)
            return <text key={`inner-${letter}`} className={pair ? 'wheel-letter pair-ciphertext' : 'wheel-letter inner-letter'} style={pair ? { color: pair.color } : undefined} x={inner.x} y={inner.y} textAnchor="middle" dominantBaseline="middle">{letter}</text>
          })}
          <path className="wheel-pointer" d="M150 15 L143 29 L157 29 Z" />
          <circle className="wheel-center-ring" cx={center} cy={center} r={centerRadius} />
          <text className="wheel-key" x={center} y="147" textAnchor="middle" dominantBaseline="middle">+{shift}</text>
          <text className="wheel-key-label" x={center} y="166" textAnchor="middle" dominantBaseline="middle">KEY</text>
        </svg>
        <div className="wheel-actions">
          <button type="button" aria-label="Decrease Caesar shift" onClick={() => changeShift(-1)}>−</button>
          <button type="button" aria-label="Increase Caesar shift" onClick={() => changeShift(1)}>+</button>
        </div>
      </div>
    </div>
  )
}
