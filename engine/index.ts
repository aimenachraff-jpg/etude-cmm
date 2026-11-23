/**
 * Engine main export - pure TypeScript calculation/generation engine
 */

export * from './types'
export * from './rng'
export * from './units'
export * from './formulas'
export * from './generators'

import { GENERATOR_FAMILIES, getFamilyById, getFamiliesByTD } from './generators'
import { ExerciseInstance, ExerciseSolution, GeneratorParams, AnswerValidation, ErrorClassification } from './types'

// ============================================================================
// High-level Engine API
// ============================================================================

export interface Engine {
  /** Generate an exercise instance from a family */
  generate(familyId: string, params: GeneratorParams): ExerciseInstance

  /** Solve an exercise instance (returns step-by-step solution) */
  solve(instance: ExerciseInstance): ExerciseSolution

  /** Validate a user answer */
  validate(instance: ExerciseInstance, answer: unknown): AnswerValidation

  /** Classify an error */
  classifyError(instance: ExerciseInstance, answer: unknown): ErrorClassification

  /** List all generator families */
  listFamilies(): readonly GeneratorFamily[]

  /** Get families for a specific TD */
  getFamiliesForTD(td: string): GeneratorFamily[]

  /** Get a specific family */
  getFamily(id: string): GeneratorFamily | undefined
}

// Singleton engine instance
let engineInstance: Engine | null = null

export function createEngine(): Engine {
  if (engineInstance) return engineInstance

  engineInstance = {
    generate: (familyId: string, params: GeneratorParams) => {
      const family = GENERATOR_FAMILIES.find(f => f.id === familyId)
      if (!family) throw new Error(`Family not found: ${familyId}`)
      return family.generate(params)
    },

    solve: (instance: ExerciseInstance) => {
      const family = GENERATOR_FAMILIES.find(f => f.id === instance.familyId)
      if (!family) throw new Error(`Family not found for instance: ${instance.familyId}`)
      return family.solve(instance)
    },

    validate: (instance: ExerciseInstance, answer: unknown) => {
      const family = GENERATOR_FAMILIES.find(f => f.id === instance.familyId)
      if (!family) throw new Error(`Family not found for instance: ${instance.familyId}`)
      return family.validateAnswer(instance, answer)
    },

    classifyError: (instance: ExerciseInstance, answer: unknown) => {
      const family = GENERATOR_FAMILIES.find(f => f.id === instance.familyId)
      if (!family) throw new Error(`Family not found for instance: ${instance.familyId}`)
      return family.classifyError(instance, answer)
    },

    listFamilies: () => GENERATOR_FAMILIES,

    getFamiliesForTD: (td: string) => GENERATOR_FAMILIES.filter(f => f.tdMapping.some(m => m.startsWith(td))),

    getFamily: (id: string) => GENERATOR_FAMILIES.find(f => f.id === id),
  }

  return engineInstance
}

export const engine = createEngine()

// ============================================================================
// Convenience functions for common operations
// ============================================================================

/** Generate a random exercise from a TD */
export function randomExerciseFromTD(td: string, seed?: number): ExerciseInstance {
  const families = getFamiliesByTD(td)
  if (families.length === 0) throw new Error(`No families for TD: ${td}`)
  const family = families[Math.floor(Math.random() * families.length)]
  const rngSeed = seed ?? Math.floor(Math.random() * 0xffffffff)
  return engine.generate(family.id, { seed: rngSeed, convention: 'decimal' })
}

/** Generate a full exam from multiple TDs */
export function generateExam(
  config: {
    tdScope: string[]
    questionCount: number
    seed: number
    convention: 'decimal' | 'binary'
  }
): ExerciseInstance[] {
  const allFamilies = config.tdScope.flatMap(td => getFamiliesByTD(td))
  if (allFamilies.length === 0) throw new Error('No families for selected TDs')

  const questions: ExerciseInstance[] = []
  const { SeededRNG } = require('./rng')
  const rng = new SeededRNG(config.seed)

  for (let i = 0; i < config.questionCount; i++) {
    const family = rng.nextChoice(allFamilies)
    const instance = engine.generate(family.id, {
      seed: rng.nextInt(0, 0xffffffff),
      convention: config.convention,
    })
    questions.push(instance)
  }

  return questions
}

/** Run internal consistency tests (golden tests) */
export async function runGoldenTests(): Promise<{ passed: number; failed: number; results: Array<{ family: string; test: string; passed: boolean; expected: unknown; actual: unknown }> }> {
  const results: Array<{ family: string; test: string; passed: boolean; expected: unknown; actual: unknown }> = []

  for (const family of GENERATOR_FAMILIES) {
    try {
      // Generate with a fixed seed
      const instance = engine.generate(family.id, { seed: 12345, convention: 'decimal' })
      const solution = engine.solve(instance)

      // Test that solve() returns valid structure
      if (!solution.steps || solution.steps.length === 0) {
        results.push({ family: family.id, test: 'solve-structure', passed: false, expected: 'steps[]', actual: solution.steps })
        continue
      }

      if (!solution.finalAnswer) {
        results.push({ family: family.id, test: 'final-answer', passed: false, expected: 'string', actual: solution.finalAnswer })
        continue
      }

      // Family-specific golden value checks
      if (family.id === 'AUD-SIZE-DEBIT') {
        // TD1 Ex1: 44100, 16, stereo, 60s
        const testInstance = engine.generate(family.id, { seed: 42, convention: 'decimal' })
        const testParams = testInstance.params as any
        if (testParams.fe === 44100 && testParams.bits === 16 && testParams.channels === 2 && testParams.duration === 60) {
          const sol = engine.solve(testInstance)
          // Check bitrate ≈ 1411.2 kbit/s
          const bitrateMatch = sol.finalAnswer.includes('1411.2') || sol.finalAnswer.includes('1411')
          results.push({ family: family.id, test: 'TD1-Ex1-bitrate', passed: bitrateMatch, expected: '1411.2 kbit/s', actual: sol.finalAnswer })
        }
      }

      if (family.id === 'VID-RAW') {
        // TD2 Ex3: 1920x1080x24x30 = 1492.99 Mbps
        const testInstance = engine.generate(family.id, { seed: 999, convention: 'decimal' })
        const testParams = testInstance.params as any
        if (testParams.width === 1920 && testParams.height === 1080 && testParams.bpp === 24 && testParams.fps === 30) {
          const sol = engine.solve(testInstance)
          const bitrateMatch = sol.finalAnswer.includes('1492.99') || sol.finalAnswer.includes('1493')
          results.push({ family: family.id, test: 'TD2-Ex3-bitrate', passed: bitrateMatch, expected: '1492.99 Mbit/s', actual: sol.finalAnswer })
        }
      }

      if (family.id === 'GOP-SIZE') {
        // TD2 Ex5: GOP=10, 25.2 Mo
        const testInstance = engine.generate(family.id, { seed: 777, convention: 'decimal' })
        const sol = engine.solve(testInstance)
        const gopMatch = sol.finalAnswer.includes('10') && (sol.finalAnswer.includes('25.2') || sol.finalAnswer.includes('25.20'))
        results.push({ family: family.id, test: 'TD2-Ex5-gop-size', passed: gopMatch, expected: 'GOP=10, 25.2 Mo', actual: sol.finalAnswer })
      }

      if (family.id === 'LATENCY-BUDGET') {
        // TD3 Ex4: 170ms
        const testInstance = engine.generate(family.id, { seed: 888, convention: 'decimal' })
        const sol = engine.solve(testInstance)
        const latencyMatch = sol.finalAnswer.includes('170')
        results.push({ family: family.id, test: 'TD3-Ex4-latency', passed: latencyMatch, expected: '170 ms', actual: sol.finalAnswer })
      }

      if (family.id === 'BUFFER-DRAIN') {
        // TD4 Ex2: Dv=5, Dr=4, buffer=10s -> 50s
        const family = GENERATOR_FAMILIES.find(f => f.id === 'BUFFER-DRAIN')!
        const testInstance = {
          id: 'BUFFER-DRAIN-TD4-Ex2',
          familyId: 'BUFFER-DRAIN',
          seed: 0,
          params: { dv: 5, dr: 4, bufferSec: 10 },
          meta: family.generate({ seed: 0, convention: 'decimal' }).meta,
          questions: family.generate({ seed: 0, convention: 'decimal' }).questions,
        }
        const sol = engine.solve(testInstance)
        const timeMatch = sol.finalAnswer.includes('50')
        results.push({ family: family.id, test: 'TD4-Ex2-freeze-time', passed: timeMatch, expected: '50 s', actual: sol.finalAnswer })
      }

      if (family.id === 'SFU-MCU-BW') {
        // TD5 Ex3: 12 participants, 2.5 Mbps video + 64 kbps audio
        const family = GENERATOR_FAMILIES.find(f => f.id === 'SFU-MCU-BW')!
        const testInstance = {
          id: 'SFU-MCU-BW-TD5-Ex3',
          familyId: 'SFU-MCU-BW',
          seed: 0,
          params: { participants: 12, videoBR: 2.5, audioBR: 64 },
          meta: family.generate({ seed: 0, convention: 'decimal' }).meta,
          questions: family.generate({ seed: 0, convention: 'decimal' }).questions,
        }
        const sol = engine.solve(testInstance)
        const sfuMatch = sol.finalAnswer.includes('338.448') || sol.finalAnswer.includes('338.45')
        results.push({ family: family.id, test: 'TD5-Ex3-sfu-out', passed: sfuMatch, expected: '338.448 Mbit/s out', actual: sol.finalAnswer })
      }

      results.push({ family: family.id, test: 'basic-structure', passed: true, expected: 'ok', actual: 'ok' })
    } catch (e) {
      results.push({ family: family.id, test: 'execution', passed: false, expected: 'no error', actual: String(e) })
    }
  }

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  return { passed, failed, results }
}