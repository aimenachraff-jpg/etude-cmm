/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 * Deterministic, fast, good distribution for exercise generation.
 */

export class SeededRNG {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** Returns next random float in [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Returns random integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  /** Returns random element from array */
  nextChoice<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  /** Returns random boolean with given probability */
  nextBool(probability = 0.5): boolean {
    return this.next() < probability
  }

  /** Returns random float in [min, max] */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Shuffles array in-place (Fisher-Yates) */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  /** Returns current state for serialization */
  getState(): number {
    return this.state
  }

  /** Creates a child RNG with derived seed */
  fork(): SeededRNG {
    return new SeededRNG(this.nextInt(0, 0xffffffff))
  }
}

/**
 * Creates a deterministic seed from a string (e.g., challenge code)
 */
export function seedFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Creates a seed from exam config + user + date for shared challenges
 */
export function createChallengeSeed(
  baseSeed: number,
  configHash: string,
  userId: string
): number {
  const combined = `${baseSeed}-${configHash}-${userId}`
  return seedFromString(combined)
}