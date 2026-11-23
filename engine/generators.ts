/**
 * Exercise Generator Families (25 templates)
 * Each family maps to TD exercises with parameter generation, solving, and error classification.
 */

import { SeededRNG } from './rng'
import {
  GeneratorFamily,
  GeneratorParams,
  ExerciseInstance,
  ExerciseQuestion,
  ExerciseMeta,
  ExerciseSolution,
  AnswerValidation,
  ErrorClassification,
  ErrorType,
  ExerciseType,
  Difficulty,
  Status,
  SolutionStatus,
  Confidence,
} from './types'
import {
  calculateAudioComplete,
  audioBitrate,
  audioFileSize,
  audioDuration,
  samplingFrequencyFromSize,
  nyquistFrequency,
  snr,
  quantizationLevels,
  quantizationStep,
  videoBitrateRaw,
  videoFileSizeRaw,
  videoFrameDuration,
  gopAverageWeight,
  videoSizeFromGOP,
  imageSizeRaw,
  imageSizeJPEG,
  buildHuffman,
  bufferDrainTime,
  jitterBufferSize,
  audioFrameDuration,
  latencyBudget,
  g114Classification,
  clientUpstream,
  clientDownstreamSFU,
  sfuServerLoad,
  e1Dimensioning,
  voipBandwidth,
  dviMaxResolution,
  createStep,
} from './formulas'
import { formatBytes, formatBits, formatBytesBoth, getExerciseConvention } from './units'
import { UnitConvention } from './types'

// ============================================================================
// Helper Functions
// ============================================================================

function createMeta(overrides: Partial<ExerciseMeta>): ExerciseMeta {
  return {
    id: '',
    td: '',
    num: 0,
    topic: '',
    formulas: [],
    type: 'calc',
    difficulty: 2,
    status: 'etudié',
    source: '',
    priority: 'H',
    solutionStatus: 'independently-derived',
    confidence: 'high',
    ...overrides,
  }
}

function createQuestion(id: string, text: string, type: ExerciseQuestion['type'], options?: {
  tolerance?: number
  unit?: string
  choices?: string[]
  correctIndex?: number
}): ExerciseQuestion {
  return {
    id,
    text,
    type,
    tolerance: options?.tolerance,
    unit: options?.unit,
    choices: options?.choices,
    correctIndex: options?.correctIndex,
  }
}

function classifyError(
  expected: number,
  actual: number,
  params: Record<string, unknown>,
  errorPatterns: Array<{ type: ErrorType; check: () => boolean }>
): ErrorClassification {
  for (const pattern of errorPatterns) {
    if (pattern.check()) {
      return { type: pattern.type, message: '', description: getErrorDescription(pattern.type) }
    }
  }
  return { type: 'autre', message: '', description: getErrorDescription('autre') }
}

function getErrorDescription(type: ErrorType): string {
  const descriptions: Record<ErrorType, string> = {
    erreur_unité: 'Confusion entre bits et octets, ou préfixes (k vs K, M vs Mi)',
    erreur_conceptuelle: 'Mauvaise formule ou concept mal compris',
    oubli_x2_stereo: 'Canal stéréo non multiplié par 2',
    oubli_div8: 'Conversion bits→octets manquante (division par 8)',
    confusion_1000_1024: 'Utilisation du décimal (1000) au lieu du binaire (1024) ou inversement',
    confusion_min_sec: 'Minutes non converties en secondes',
    arrondi: 'Erreur d\'arrondi significative',
    nyquist_oublie_2x: 'Facteur 2 oublié dans Fe = 2 × fmax',
    gop_compte_faux: 'Comptage incorrect des images I/P/B dans le GOP',
    pts_dts_confusion: 'Confusion entre PTS (affichage) et DTS (décodage)',
    autre: 'Erreur non classée',
  }
  return descriptions[type]
}

// ============================================================================
// Generator Family Implementations
// ============================================================================

// --- Family 1: AUD-SIZE-DEBIT (TD1 Ex1,4,9,16) ---
export const AUD_SIZE_DEBIT: GeneratorFamily = {
  id: 'AUD-SIZE-DEBIT',
  name: 'Audio: Débit & Taille',
  tdMapping: ['TD1_Ex1', 'TD1_Ex4', 'TD1_Ex9', 'TD1_Ex16'],
  paramSchema: [
    { key: 'fe', label: 'Fe (Hz)', type: 'number', min: 8000, max: 96000, step: 100, default: 44100 },
    { key: 'bits', label: 'Résolution (bits)', type: 'number', min: 8, max: 24, step: 1, default: 16 },
    { key: 'channels', label: 'Canaux', type: 'select', default: 2, options: [{ value: 1, label: 'Mono' }, { value: 2, label: 'Stéréo' }] },
    { key: 'duration', label: 'Durée (s)', type: 'number', min: 1, max: 7200, step: 1, default: 60 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const fe = rng.nextChoice([8000, 16000, 22050, 32000, 44100, 48000, 96000])
    const bits = rng.nextChoice([8, 16, 24])
    const channels = rng.nextChoice([1, 2])
    const duration = rng.nextInt(30, 3600)

    return {
      id: `AUD-SIZE-DEBIT-${params.seed}`,
      familyId: 'AUD-SIZE-DEBIT',
      seed: params.seed,
      params: { fe, bits, channels, duration },
      meta: createMeta({
        id: `AUD-SIZE-DEBIT-${params.seed}`,
        td: 'TD1',
        num: 1,
        topic: 'Débit et taille fichier audio',
        formulas: ['D = Fe × B × C', 'S = D × t / 8', 'SNR ≈ 6.02×B + 1.25'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD1 Ex1',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Calculez le débit binaire en kbit/s.`, 'numeric', { tolerance: 0.1, unit: 'kbit/s' }),
        createQuestion('q2', `Calculez la taille du fichier en Mo (${params.convention}).`, 'numeric', { tolerance: 0.01, unit: 'Mo' }),
        createQuestion('q3', `SNR théorique pour ${bits} bits ?`, 'numeric', { tolerance: 0.01, unit: 'dB' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { fe, bits, channels, duration } = instance.params as any
    const result = calculateAudioComplete({ fe, bits, channels, durationSeconds: duration })
    const convention = instance.meta.convention ?? 'decimal'

    return {
      steps: [
        createStep(
          'Débit binaire',
          'D = Fe × B × C',
          `D = ${fe} × ${bits} × ${channels}`,
          result.bitrate,
          'bit/s'
        ),
        createStep(
          'Débit en kbit/s',
          'D_kbit = D / 1000',
          `D_kbit = ${result.bitrate} / 1000`,
          (result.bitrate / 1000).toFixed(2),
          'kbit/s'
        ),
        createStep(
          'Taille du fichier',
          'S = D × t / 8',
          `S = ${result.bitrate} × ${duration} / 8`,
          result.fileSizeBytes,
          'octets'
        ),
        createStep(
          `Taille en Mo (${convention})`,
          convention === 'decimal' ? 'S_Mo = S / 1 000 000' : 'S_MiB = S / 1 048 576',
          convention === 'decimal'
            ? `S_Mo = ${result.fileSizeBytes} / 1 000 000`
            : `S_MiB = ${result.fileSizeBytes} / 1 048 576`,
          convention === 'decimal'
            ? (result.fileSizeBytes / 1_000_000).toFixed(3)
            : (result.fileSizeBytes / 1_048_576).toFixed(3),
          convention === 'decimal' ? 'Mo' : 'MiB'
        ),
        createStep(
          'SNR',
          'SNR ≈ 6.02 × B + 1.25',
          `SNR ≈ 6.02 × ${bits} + 1.25`,
          result.snr.toFixed(2),
          'dB'
        ),
      ],
      finalAnswer: `Débit: ${(result.bitrate / 1000).toFixed(2)} kbit/s | Taille: ${convention === 'decimal' ? (result.fileSizeBytes / 1_000_000).toFixed(3) : (result.fileSizeBytes / 1_048_576).toFixed(3)} ${convention === 'decimal' ? 'Mo' : 'MiB'} | SNR: ${result.snr.toFixed(2)} dB`,
      explanation: 'Application directe des formules de numérisation audio PCM.',
      confidence: 'high',
      conventionNote: convention === 'binary' ? 'Résultat en MiB (binaire /1024²)' : 'Résultat en Mo (décimal /10^6)',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { fe, bits, channels, duration } = instance.params as any
    const result = calculateAudioComplete({ fe, bits, channels, durationSeconds: duration })
    const convention = instance.meta.convention ?? 'decimal'

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const expectedBitrate = result.bitrate / 1000
      const expectedSize = convention === 'decimal' ? result.fileSizeBytes / 1_000_000 : result.fileSizeBytes / 1_048_576
      const expectedSnr = result.snr

      let score = 0
      let correct = 0
      const total = 3

      if (Math.abs((a.bitrate ?? 0) - expectedBitrate) < 0.1) { score += 1; correct++ }
      if (Math.abs((a.size ?? 0) - expectedSize) < 0.01) { score += 1; correct++ }
      if (Math.abs((a.snr ?? 0) - expectedSnr) < 0.01) { score += 1; correct++ }

      const errorPatterns = [
        { type: 'oubli_x2_stereo' as ErrorType, check: () => channels === 2 && Math.abs((a.bitrate ?? 0) - expectedBitrate / 2) < 0.1 },
        { type: 'oubli_div8' as ErrorType, check: () => Math.abs((a.size ?? 0) - expectedSize * 8) < 0.1 },
        { type: 'confusion_1000_1024' as ErrorType, check: () => convention === 'decimal' && Math.abs((a.size ?? 0) - expectedSize * 1.048576) < 0.1 },
      ]

      return {
        isCorrect: correct === total,
        score: score / total,
        feedback: correct === total ? 'Parfait !' : `${correct}/${total} parties correctes.`,
        errorClassification: correct < total ? classifyError(0, 0, instance.params as any, errorPatterns) : undefined,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format de réponse invalide.' }
  },
  classifyError: (instance: ExerciseInstance, answer: unknown): ErrorClassification => {
    return { type: 'autre', message: '', description: getErrorDescription('autre') }
  },
}

// --- Family 2: AUD-INVERSE-FE (TD1 Ex5,7,8) ---
export const AUD_INVERSE_FE: GeneratorFamily = {
  id: 'AUD-INVERSE-FE',
  name: 'Audio: Fréquence d\'échantillonnage inverse',
  tdMapping: ['TD1_Ex5', 'TD1_Ex7', 'TD1_Ex8'],
  paramSchema: [
    { key: 'fileSizeMB', label: 'Taille (Mo)', type: 'number', min: 1, max: 500, step: 1, default: 290 },
    { key: 'bits', label: 'Résolution (bits)', type: 'number', min: 8, max: 24, step: 1, default: 16 },
    { key: 'channels', label: 'Canaux', type: 'select', default: 2, options: [{ value: 1, label: 'Mono' }, { value: 2, label: 'Stéréo' }] },
    { key: 'durationMin', label: 'Durée (min)', type: 'number', min: 1, max: 60, step: 1, default: 3 },
    { key: 'durationSec', label: 'Durée (s) supplémentaire', type: 'number', min: 0, max: 59, step: 1, default: 30 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const fileSizeMB = rng.nextInt(50, 500)
    const bits = rng.nextChoice([8, 16, 24])
    const channels = rng.nextChoice([1, 2])
    const durationMin = rng.nextInt(1, 30)
    const durationSec = rng.nextChoice([0, 30])

    return {
      id: `AUD-INVERSE-FE-${params.seed}`,
      familyId: 'AUD-INVERSE-FE',
      seed: params.seed,
      params: { fileSizeMB, bits, channels, durationMin, durationSec },
      meta: createMeta({
        id: `AUD-INVERSE-FE-${params.seed}`,
        td: 'TD1',
        num: 5,
        topic: 'Calcul de Fe à partir de la taille',
        formulas: ['Fe = (Taille × 8) / (B × C × t)'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD1 Ex5',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Quelle est la fréquence d'échantillonnage (Hz) ?`, 'numeric', { tolerance: 1, unit: 'Hz' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { fileSizeMB, bits, channels, durationMin, durationSec } = instance.params as any
    const fileSizeBytes = fileSizeMB * 1_000_000 // decimal convention for inverse
    const duration = durationMin * 60 + durationSec
    const fe = samplingFrequencyFromSize(fileSizeBytes, bits, channels, duration)

    return {
      steps: [
        createStep(
          'Taille en octets',
          'Taille = Mo × 1 000 000',
          `Taille = ${fileSizeMB} × 1 000 000`,
          fileSizeBytes,
          'octets'
        ),
        createStep(
          'Durée en secondes',
          't = min × 60 + s',
          `t = ${durationMin} × 60 + ${durationSec}`,
          duration,
          's'
        ),
        createStep(
          'Fréquence d\'échantillonnage',
          'Fe = (Taille × 8) / (B × C × t)',
          `Fe = (${fileSizeBytes} × 8) / (${bits} × ${channels} × ${duration})`,
          Math.round(fe),
          'Hz'
        ),
      ],
      finalAnswer: `Fe = ${Math.round(fe).toLocaleString()} Hz`,
      explanation: 'Calcul inverse de la formule de taille : Fe = (Taille × 8) / (B × C × t). Convention décimale utilisée pour l\'inverse.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { fileSizeMB, bits, channels, durationMin, durationSec } = instance.params as any
    const fileSizeBytes = fileSizeMB * 1_000_000
    const duration = durationMin * 60 + durationSec
    const expectedFe = samplingFrequencyFromSize(fileSizeBytes, bits, channels, duration)

    if (typeof answer === 'number') {
      const isCorrect = Math.abs(answer - expectedFe) < 1
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct !' : `Attendu: ${Math.round(expectedFe).toLocaleString()} Hz`,
        errorClassification: !isCorrect ? { type: 'erreur_conceptuelle', message: '', description: getErrorDescription('erreur_conceptuelle') } : undefined,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Réponse numérique attendue.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 3: AUD-INVERSE-DUREE (TD1 Ex7,8) ---
export const AUD_INVERSE_DUREE: GeneratorFamily = {
  id: 'AUD-INVERSE-DUREE',
  name: 'Audio: Durée inverse',
  tdMapping: ['TD1_Ex7', 'TD1_Ex8'],
  paramSchema: [
    { key: 'fileSizeMB', label: 'Taille (Mo)', type: 'number', min: 50, max: 500, step: 1, default: 300 },
    { key: 'fe', label: 'Fe (Hz)', type: 'number', min: 44100, max: 96000, step: 100, default: 44100 },
    { key: 'bits', label: 'Résolution (bits)', type: 'number', min: 16, max: 24, step: 1, default: 16 },
    { key: 'channels', label: 'Canaux', type: 'select', default: 2, options: [{ value: 1, label: 'Mono' }, { value: 2, label: 'Stéréo' }] },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const fileSizeMB = rng.nextInt(100, 500)
    const fe = rng.nextChoice([44100, 48000, 96000])
    const bits = rng.nextChoice([16, 24])
    const channels = 2

    return {
      id: `AUD-INVERSE-DUREE-${params.seed}`,
      familyId: 'AUD-INVERSE-DUREE',
      seed: params.seed,
      params: { fileSizeMB, fe, bits, channels },
      meta: createMeta({
        id: `AUD-INVERSE-DUREE-${params.seed}`,
        td: 'TD1',
        num: 7,
        topic: 'Calcul de la durée à partir de la taille',
        formulas: ['t = (Taille × 8) / (Fe × B × C)'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD1 Ex7',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Quelle est la durée en secondes ?`, 'numeric', { tolerance: 0.1, unit: 's' }),
        createQuestion('q2', `Quelle est la durée en minutes ?`, 'numeric', { tolerance: 0.1, unit: 'min' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { fileSizeMB, fe, bits, channels } = instance.params as any
    const fileSizeBytes = fileSizeMB * 1_000_000
    const duration = audioDuration(fileSizeBytes, fe * bits * channels)

    return {
      steps: [
        createStep(
          'Taille en octets',
          'Taille = Mo × 1 000 000',
          `Taille = ${fileSizeMB} × 1 000 000`,
          fileSizeBytes,
          'octets'
        ),
        createStep(
          'Débit binaire',
          'D = Fe × B × C',
          `D = ${fe} × ${bits} × ${channels}`,
          fe * bits * channels,
          'bit/s'
        ),
        createStep(
          'Durée',
          't = (Taille × 8) / D',
          `t = (${fileSizeBytes} × 8) / ${fe * bits * channels}`,
          duration.toFixed(1),
          's'
        ),
        createStep(
          'Durée en minutes',
          't_min = t / 60',
          `t_min = ${duration.toFixed(1)} / 60`,
          (duration / 60).toFixed(2),
          'min'
        ),
      ],
      finalAnswer: `Durée: ${duration.toFixed(1)} s (${(duration / 60).toFixed(2)} min)`,
      explanation: 'Formule inverse : t = (Taille × 8) / (Fe × B × C).',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { fileSizeMB, fe, bits, channels } = instance.params as any
    const fileSizeBytes = fileSizeMB * 1_000_000
    const expectedDuration = audioDuration(fileSizeBytes, fe * bits * channels)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const durationCorrect = Math.abs((a.duration ?? 0) - expectedDuration) < 0.1
      const minCorrect = Math.abs((a.durationMin ?? 0) - expectedDuration / 60) < 0.1

      return {
        isCorrect: durationCorrect && minCorrect,
        score: (durationCorrect ? 1 : 0) + (minCorrect ? 1 : 0) / 2,
        feedback: durationCorrect && minCorrect ? 'Parfait !' : 'Vérifiez la conversion secondes/minutes.',
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 4: AUD-BITS (TD1 Ex10) ---
export const AUD_BITS: GeneratorFamily = {
  id: 'AUD-BITS',
  name: 'Audio: Résolution à partir du débit',
  tdMapping: ['TD1_Ex10'],
  paramSchema: [
    { key: 'bitrate', label: 'Débit (kbit/s)', type: 'number', min: 64, max: 512, step: 1, default: 256 },
    { key: 'fe', label: 'Fe (Hz)', type: 'number', min: 8000, max: 48000, step: 100, default: 44100 },
    { key: 'channels', label: 'Canaux', type: 'select', default: 1, options: [{ value: 1, label: 'Mono' }, { value: 2, label: 'Stéréo' }] },
    { key: 'fileSizeMB', label: 'Taille fichier (Mo)', type: 'number', min: 100, max: 1000, step: 1, default: 600 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const bitrate = rng.nextChoice([64, 128, 192, 256, 320])
    const fe = rng.nextChoice([8000, 16000, 22050, 44100, 48000])
    const channels = rng.nextChoice([1, 2])
    const fileSizeMB = rng.nextInt(100, 800)

    return {
      id: `AUD-BITS-${params.seed}`,
      familyId: 'AUD-BITS',
      seed: params.seed,
      params: { bitrate, fe, channels, fileSizeMB },
      meta: createMeta({
        id: `AUD-BITS-${params.seed}`,
        td: 'TD1',
        num: 10,
        topic: 'Résolution à partir du débit compressé',
        formulas: ['N = Débit / (Fe × C)', 'Durée = (Taille × 8) / Débit'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD1 Ex10',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Résolution PCM (bits) ?`, 'numeric', { tolerance: 0.1, unit: 'bits' }),
        createQuestion('q2', `Durée du fichier (s) ?`, 'numeric', { tolerance: 1, unit: 's' }),
        createQuestion('q3', `Le fichier est-il du PCM brut ?`, 'choice', { choices: ['Oui, PCM brut', 'Non, compressé (débit non entier)'] }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { bitrate, fe, channels, fileSizeMB } = instance.params as any
    const bitrateBps = bitrate * 1000
    const bits = bitrateBps / (fe * channels)
    const duration = (fileSizeMB * 1_000_000 * 8) / bitrateBps
    const isPcm = Number.isInteger(Math.round(bits))

    return {
      steps: [
        createStep(
          'Débit en bit/s',
          'D = kbit/s × 1000',
          `D = ${bitrate} × 1000`,
          bitrateBps,
          'bit/s'
        ),
        createStep(
          'Résolution',
          'N = D / (Fe × C)',
          `N = ${bitrateBps} / (${fe} × ${channels})`,
          bits.toFixed(2),
          'bits'
        ),
        createStep(
          'Durée',
          't = (Taille × 8) / D',
          `t = (${fileSizeMB} × 1 000 000 × 8) / ${bitrateBps}`,
          duration.toFixed(0),
          's'
        ),
        createStep(
          'Nature du fichier',
          'N entier → PCM brut ; N non entier → compressé',
          `N = ${bits.toFixed(2)} → ${isPcm ? 'entier' : 'non entier'}`,
          isPcm ? 'PCM brut' : 'Compressé (MP3, AAC, etc.)',
          ''
        ),
      ],
      finalAnswer: `Résolution: ${bits.toFixed(2)} bits (${isPcm ? 'PCM brut' : 'compressé'}) | Durée: ${duration.toFixed(0)} s`,
      explanation: 'Si N n\'est pas un entier, le fichier est compressé avec perte (MP3, AAC...). La résolution PCM ne se déduit pas du débit compressé.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { bitrate, fe, channels, fileSizeMB } = instance.params as any
    const bitrateBps = bitrate * 1000
    const expectedBits = bitrateBps / (fe * channels)
    const expectedDuration = (fileSizeMB * 1_000_000 * 8) / bitrateBps
    const expectedIsPcm = Number.isInteger(Math.round(expectedBits))

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const bitsVal = typeof a.bits === 'number' ? a.bits : parseFloat(String(a.bits ?? 0))
      const durationVal = typeof a.duration === 'number' ? a.duration : parseFloat(String(a.duration ?? 0))
      const bitsCorrect = Math.abs(bitsVal - expectedBits) < 0.1
      const durationCorrect = Math.abs(durationVal - expectedDuration) < 1
      const typeCorrect = (a.isPcm === 'Non, compressé (débit non entier)') === !expectedIsPcm

      return {
        isCorrect: bitsCorrect && durationCorrect && typeCorrect,
        score: [bitsCorrect, durationCorrect, typeCorrect].filter(Boolean).length / 3,
        feedback: bitsCorrect && durationCorrect && typeCorrect ? 'Parfait !' : 'Vérifiez les calculs.',
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 5: AUD-CBR-COMBOS (TD1 Ex11) ---
export const AUD_CBR_COMBOS: GeneratorFamily = {
  id: 'AUD-CBR-COMBOS',
  name: 'Audio: Combos CBR pour débit cible',
  tdMapping: ['TD1_Ex11'],
  paramSchema: [
    { key: 'targetBitrate', label: 'Débit cible (kbit/s)', type: 'number', min: 64, max: 1024, step: 1, default: 512 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const targetBitrate = rng.nextChoice([128, 256, 384, 512, 768, 1024])

    return {
      id: `AUD-CBR-COMBOS-${params.seed}`,
      familyId: 'AUD-CBR-COMBOS',
      seed: params.seed,
      params: { targetBitrate },
      meta: createMeta({
        id: `AUD-CBR-COMBOS-${params.seed}`,
        td: 'TD1',
        num: 11,
        topic: 'Combinaisons CBR pour un débit donné',
        formulas: ['Fe × B × C = Débit cible'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD1 Ex11',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Donnez 3 combinaisons (Fe, B, C) valides pour ${targetBitrate} kbit/s.`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { targetBitrate } = instance.params as any
    const target = targetBitrate * 1000
    const combos: Array<{ fe: number; bits: number; channels: number }> = []

    const feValues = [8000, 16000, 22050, 32000, 44100, 48000, 96000]
    const bitsValues = [8, 16, 24]
    const channelsValues = [1, 2, 4, 6, 8]

    for (const fe of feValues) {
      for (const bits of bitsValues) {
        for (const channels of channelsValues) {
          if (fe * bits * channels === target) {
            combos.push({ fe, bits, channels })
            if (combos.length >= 10) break
          }
        }
        if (combos.length >= 10) break
      }
      if (combos.length >= 10) break
    }

    return {
      steps: [
        createStep(
          'Équation',
          'Fe × B × C = Débit cible',
          `Fe × B × C = ${targetBitrate} 000`,
          target,
          'bit/s'
        ),
        createStep(
          'Recherche de combinaisons',
          'Parcours des valeurs standard',
          `Fe ∈ {${feValues.join(', ')}}, B ∈ {8,16,24}, C ∈ {1,2,4,6,8}`,
          `${combos.length} combinaisons trouvées`,
          ''
        ),
      ],
      finalAnswer: combos.slice(0, 3).map(c => `${c.fe/1000} kHz, ${c.bits} bits, ${c.channels} canaux`).join(' | '),
      explanation: 'Toute combinaison Fe × B × C = débit cible est valide. Les valeurs standard sont privilégiées.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { targetBitrate } = instance.params as any
    const target = targetBitrate * 1000

    if (typeof answer === 'string') {
      // Parse user's combinations
      const lines = answer.split('\n').filter(l => l.trim())
      let valid = 0
      for (const line of lines) {
        const match = line.match(/(\d+)\s*(kHz|Hz)?\s*,?\s*(\d+)\s*bits?\s*,?\s*(\d+)\s*canaux?/i)
        if (match) {
          const fe = parseFloat(match[1]) * (match[2]?.toLowerCase() === 'khz' ? 1000 : 1)
          const bits = parseInt(match[3])
          const channels = parseInt(match[4])
          if (fe * bits * channels === target) valid++
        }
      }
      return {
        isCorrect: valid >= 3,
        score: Math.min(valid / 3, 1),
        feedback: valid >= 3 ? `${valid} combinaisons valides !` : `${valid}/3 combinaisons valides.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format: "Fe, B, C" par ligne.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 6: AUD-VBR-VS-CBR (TD1 Ex12) ---
export const AUD_VBR_VS_CBR: GeneratorFamily = {
  id: 'AUD-VBR-VS-CBR',
  name: 'Audio: VBR vs CBR',
  tdMapping: ['TD1_Ex12'],
  paramSchema: [
    { key: 'durationMin', label: 'Durée appel (min)', type: 'number', min: 1, max: 30, step: 1, default: 5 },
    { key: 'brAppel', label: 'BitRate Appel (kbit/s)', type: 'number', min: 32, max: 256, step: 1, default: 128 },
    { key: 'brSilence', label: 'BitRate Silence (kbit/s)', type: 'number', min: 8, max: 64, step: 1, default: 16 },
    { key: 'silenceSec', label: 'Durée silence (s)', type: 'number', min: 10, max: 300, step: 1, default: 90 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const durationMin = rng.nextInt(2, 15)
    const brAppel = rng.nextChoice([64, 128, 192, 256])
    const brSilence = rng.nextChoice([8, 16, 32])
    const silenceSec = rng.nextInt(30, 180)

    return {
      id: `AUD-VBR-VS-CBR-${params.seed}`,
      familyId: 'AUD-VBR-VS-CBR',
      seed: params.seed,
      params: { durationMin, brAppel, brSilence, silenceSec },
      meta: createMeta({
        id: `AUD-VBR-VS-CBR-${params.seed}`,
        td: 'TD1',
        num: 12,
        topic: 'Comparaison VBR vs CBR',
        formulas: ['VBR = BR_appel × t_parole + BR_silence × t_silence', 'CBR = BR × t_total'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD1 Ex12',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Consommation VBR (kbit) ?`, 'numeric', { tolerance: 1, unit: 'kbit' }),
        createQuestion('q2', `Consommation CBR (kbit) ?`, 'numeric', { tolerance: 1, unit: 'kbit' }),
        createQuestion('q3', `Économie VBR (%) ?`, 'numeric', { tolerance: 0.1, unit: '%' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { durationMin, brAppel, brSilence, silenceSec } = instance.params as any
    const totalSec = durationMin * 60
    const paroleSec = totalSec - silenceSec
    const vbr = brAppel * paroleSec + brSilence * silenceSec
    const cbr = brAppel * totalSec
    const economy = ((cbr - vbr) / cbr) * 100

    return {
      steps: [
        createStep(
          'Durée totale',
          't_total = min × 60',
          `t_total = ${durationMin} × 60`,
          totalSec,
          's'
        ),
        createStep(
          'Durée parole',
          't_parole = t_total - t_silence',
          `t_parole = ${totalSec} - ${silenceSec}`,
          paroleSec,
          's'
        ),
        createStep(
          'VBR',
          'VBR = BR_appel × t_parole + BR_silence × t_silence',
          `VBR = ${brAppel} × ${paroleSec} + ${brSilence} × ${silenceSec}`,
          vbr,
          'kbit'
        ),
        createStep(
          'CBR',
          'CBR = BR_appel × t_total',
          `CBR = ${brAppel} × ${totalSec}`,
          cbr,
          'kbit'
        ),
        createStep(
          'Économie',
          'Éco = (CBR - VBR) / CBR × 100',
          `Éco = (${cbr} - ${vbr}) / ${cbr} × 100`,
          economy.toFixed(1),
          '%'
        ),
      ],
      finalAnswer: `VBR: ${vbr} kbit | CBR: ${cbr} kbit | Économie: ${economy.toFixed(1)}%`,
      explanation: 'Le VBR adapte le débit au contenu (parole/silence), économisant de la bande passante vs CBR constant.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { durationMin, brAppel, brSilence, silenceSec } = instance.params as any
    const totalSec = durationMin * 60
    const paroleSec = totalSec - silenceSec
    const expectedVbr = brAppel * paroleSec + brSilence * silenceSec
    const expectedCbr = brAppel * totalSec
    const expectedEconomy = ((expectedCbr - expectedVbr) / expectedCbr) * 100

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const vbrCorrect = Math.abs((a.vbr ?? 0) - expectedVbr) < 1
      const cbrCorrect = Math.abs((a.cbr ?? 0) - expectedCbr) < 1
      const ecoCorrect = Math.abs((a.economy ?? 0) - expectedEconomy) < 0.1

      return {
        isCorrect: vbrCorrect && cbrCorrect && ecoCorrect,
        score: [vbrCorrect, cbrCorrect, ecoCorrect].filter(Boolean).length / 3,
        feedback: vbrCorrect && cbrCorrect && ecoCorrect ? 'Parfait !' : 'Vérifiez les durées (parole vs silence).',
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 7: SNR (TD1 Ex1.3) ---
export const SNR_FAMILY: GeneratorFamily = {
  id: 'SNR',
  name: 'Audio: SNR théorique',
  tdMapping: ['TD1_Ex1'],
  paramSchema: [
    { key: 'bits', label: 'Résolution (bits)', type: 'number', min: 4, max: 32, step: 1, default: 16 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const bits = rng.nextChoice([8, 16, 24, 32])

    return {
      id: `SNR-${params.seed}`,
      familyId: 'SNR',
      seed: params.seed,
      params: { bits },
      meta: createMeta({
        id: `SNR-${params.seed}`,
        td: 'TD1',
        num: 1,
        topic: 'SNR pour différentes résolutions',
        formulas: ['SNR ≈ 6.02 × B + 1.25 dB', 'Niveaux = 2^B'],
        type: 'calc',
        difficulty: 1,
        status: 'etudié',
        source: 'TD1 Ex1.3',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `SNR pour ${bits} bits (dB) ?`, 'numeric', { tolerance: 0.01, unit: 'dB' }),
        createQuestion('q2', `Nombre de niveaux de quantification ?`, 'numeric', { tolerance: 0, unit: 'niveaux' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { bits } = instance.params as any
    const snrVal = snr(bits)
    const levels = quantizationLevels(bits)

    return {
      steps: [
        createStep(
          'SNR',
          'SNR ≈ 6.02 × B + 1.25',
          `SNR ≈ 6.02 × ${bits} + 1.25`,
          snrVal.toFixed(2),
          'dB'
        ),
        createStep(
          'Niveaux',
          'N = 2^B',
          `N = 2^${bits}`,
          levels.toLocaleString(),
          ''
        ),
      ],
      finalAnswer: `SNR: ${snrVal.toFixed(2)} dB | Niveaux: ${levels.toLocaleString()}`,
      explanation: 'Formule théorique du SNR pour quantification uniforme PCM.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { bits } = instance.params as any
    const expectedSnr = snr(bits)
    const expectedLevels = quantizationLevels(bits)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const snrCorrect = Math.abs((a.snr ?? 0) - expectedSnr) < 0.01
      const levelsCorrect = (a.levels ?? 0) === expectedLevels

      return {
        isCorrect: snrCorrect && levelsCorrect,
        score: [snrCorrect, levelsCorrect].filter(Boolean).length / 2,
        feedback: snrCorrect && levelsCorrect ? 'Correct !' : 'Vérifiez la formule SNR = 6.02×B + 1.25.',
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 8: NYQUIST (TD1 Ex2, TD6 Ex1) ---
export const NYQUIST_FAMILY: GeneratorFamily = {
  id: 'NYQUIST',
  name: 'Nyquist: Fréquence d\'échantillonnage minimale',
  tdMapping: ['TD1_Ex2', 'TD6_Ex1'],
  paramSchema: [
    { key: 'fmax', label: 'Frequence max (Hz)', type: 'number', min: 100, max: 20000, step: 100, default: 3400 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const fmax = rng.nextChoice([3400, 4000, 15000, 20000])

    return {
      id: `NYQUIST-${params.seed}`,
      familyId: 'NYQUIST',
      seed: params.seed,
      params: { fmax },
      meta: createMeta({
        id: `NYQUIST-${params.seed}`,
        td: 'TD1',
        num: 2,
        topic: 'Théorème de Nyquist-Shannon',
        formulas: ['Fe_min = 2 × fmax'],
        type: 'calc',
        difficulty: 1,
        status: 'etudié',
        source: 'TD1 Ex2',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Fe minimale pour fmax = ${fmax} Hz ?`, 'numeric', { tolerance: 0, unit: 'Hz' }),
        createQuestion('q2', `Fe pratique normalisée ?`, 'choice', { choices: ['6800 Hz', '8000 Hz', '44100 Hz', '48000 Hz'] }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { fmax } = instance.params as any
    const feMin = nyquistFrequency(fmax)
    let practice: number
    if (fmax <= 4000) practice = 8000
    else if (fmax <= 15000) practice = 44100
    else practice = 48000

    return {
      steps: [
        createStep(
          'Nyquist',
          'Fe_min = 2 × fmax',
          `Fe_min = 2 × ${fmax}`,
          feMin,
          'Hz'
        ),
        createStep(
          'Pratique',
          'Standard supérieur le plus proche',
          `Fe_min = ${feMin} → ${practice} Hz`,
          practice,
          'Hz'
        ),
      ],
      finalAnswer: `Fe_min = ${feMin} Hz | Pratique: ${practice} Hz`,
      explanation: 'Le théorème de Nyquist impose Fe ≥ 2×fmax. En pratique, on choisit une fréquence standard supérieure.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { fmax } = instance.params as any
    const expectedFeMin = nyquistFrequency(fmax)
    let expectedPractice: number
    if (fmax <= 4000) expectedPractice = 8000
    else if (fmax <= 15000) expectedPractice = 44100
    else expectedPractice = 48000

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const feCorrect = (a.feMin ?? 0) === expectedFeMin
      const practiceCorrect = a.practice === String(expectedPractice)

      return {
        isCorrect: feCorrect && practiceCorrect,
        score: [feCorrect, practiceCorrect].filter(Boolean).length / 2,
        feedback: feCorrect && practiceCorrect ? 'Parfait !' : `Fe_min = ${expectedFeMin} Hz, Pratique = ${expectedPractice} Hz.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: (instance: ExerciseInstance, answer: unknown): ErrorClassification => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      if ((a.feMin ?? 0) === (instance.params as any).fmax) {
        return { type: 'nyquist_oublie_2x', message: '', description: getErrorDescription('nyquist_oublie_2x') }
      }
    }
    return { type: 'autre', message: '', description: getErrorDescription('autre') }
  },
}

// --- Family 9: HUFFMAN-PROBS (TD2 Ex1) ---
export const HUFFMAN_PROBS: GeneratorFamily = {
  id: 'HUFFMAN-PROBS',
  name: 'Huffman: Probabilités données',
  tdMapping: ['TD2_Ex1'],
  paramSchema: [
    { key: 'symbols', label: 'Symboles (séparés par virgule)', type: 'text', default: 'A,B,C,D' },
    { key: 'probs', label: 'Probabilités (séparées par virgule)', type: 'text', default: '0.375,0.125,0.125,0.375' },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const sets = [
      { symbols: ['A', 'B', 'C', 'D'], probs: [3/8, 1/8, 1/8, 3/8] },
      { symbols: ['A', 'B', 'C', 'D', 'E'], probs: [0.4, 0.2, 0.2, 0.1, 0.1] },
      { symbols: ['0', '1', '2', '3'], probs: [0.5, 0.25, 0.15, 0.1] },
    ]
    const chosen = rng.nextChoice(sets) as { symbols: string[]; probs: number[] }

    return {
      id: `HUFFMAN-PROBS-${params.seed}`,
      familyId: 'HUFFMAN-PROBS',
      seed: params.seed,
      params: { symbols: chosen.symbols, probs: chosen.probs },
      meta: createMeta({
        id: `HUFFMAN-PROBS-${params.seed}`,
        td: 'TD2',
        num: 1,
        topic: 'Codage de Huffman à partir de probabilités',
        formulas: ['Arbre binaire', 'Codes variables', 'Entropie H = -Σ p log2(p)'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD2 Ex1',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Donnez le code de Huffman pour chaque symbole.`, 'text'),
        createQuestion('q2', `Longueur moyenne (bits/symbole) ?`, 'numeric', { tolerance: 0.001, unit: 'bits' }),
        createQuestion('q3', `Entropie (bits/symbole) ?`, 'numeric', { tolerance: 0.001, unit: 'bits' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { symbols, probs } = instance.params as { symbols: string[]; probs: number[] }
    const result = buildHuffman(symbols, probs)

    return {
      steps: [
        createStep(
          'Construction arbre',
          'Combine les 2 nœuds de plus faible probabilité',
          `Symboles: ${symbols.join(', ')} | Probas: ${probs.join(', ')}`,
          'Arbre construit',
          ''
        ),
        createStep(
          'Codes générés',
          'Parcours arbre : gauche=0, droite=1',
          Object.entries(result.codes).map(([s, c]) => `${s} → ${c}`).join(' | '),
          Object.entries(result.codes).map(([s, c]) => `${s}:${c}`).join(', '),
          ''
        ),
        createStep(
          'Longueur moyenne',
          'L = Σ p_i × l_i',
          probs.map((p, i) => `${p} × ${result.codes[symbols[i]].length}`).join(' + '),
          result.averageLength.toFixed(3),
          'bits/symbole'
        ),
        createStep(
          'Entropie',
          'H = -Σ p_i log2(p_i)',
          probs.map(p => `-${p}×log2(${p})`).join(' + '),
          result.entropy.toFixed(3),
          'bits/symbole'
        ),
        createStep(
          'Efficacité',
          'η = H / L',
          `${result.entropy.toFixed(3)} / ${result.averageLength.toFixed(3)}`,
          (result.efficiency * 100).toFixed(1),
          '%'
        ),
      ],
      finalAnswer: `Codes: ${Object.entries(result.codes).map(([s, c]) => `${s}=${c}`).join(', ')} | L_moy=${result.averageLength.toFixed(3)} | H=${result.entropy.toFixed(3)} | η=${(result.efficiency*100).toFixed(1)}%`,
      explanation: 'L\'algorithme de Huffman construit un arbre optimal. Les symboles fréquents ont des codes courts. L\'entropie est la borne inférieure.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { symbols, probs } = instance.params as any
    const expected = buildHuffman(symbols, probs)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, string | number>
      const avgLenVal = typeof a.avgLength === 'number' ? a.avgLength : parseFloat(String(a.avgLength ?? 0))
      const entropyVal = typeof a.entropy === 'number' ? a.entropy : parseFloat(String(a.entropy ?? 0))
      const avgLenCorrect = Math.abs(avgLenVal - expected.averageLength) < 0.01
      const entropyCorrect = Math.abs(entropyVal - expected.entropy) < 0.01

      return {
        isCorrect: avgLenCorrect && entropyCorrect,
        score: [avgLenCorrect, entropyCorrect].filter(Boolean).length / 2,
        feedback: avgLenCorrect && entropyCorrect ? 'Correct ! Les codes peuvent varier selon les égalités.' : `L_moy attendue: ${expected.averageLength.toFixed(3)}, H: ${expected.entropy.toFixed(3)}.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 10: HUFFMAN-MATRIX (TD2 Ex2) ---
export const HUFFMAN_MATRIX: GeneratorFamily = {
  id: 'HUFFMAN-MATRIX',
  name: 'Huffman: Image matrice 8×8',
  tdMapping: ['TD2_Ex2'],
  paramSchema: [
    { key: 'matrix', label: 'Matrice 8×8 (niveaux 0,63,127,255)', type: 'text', default: 'TD2 standard' },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    // Use the exact matrix from TD2 Ex2
    const matrix = [
      [127, 63, 63, 63, 255, 255, 127, 127],
      [127, 127, 0, 0, 0, 0, 63, 127],
      [127, 63, 0, 255, 255, 0, 63, 127],
      [127, 63, 0, 255, 255, 0, 63, 127],
      [127, 127, 0, 0, 0, 0, 63, 127],
      [127, 127, 0, 0, 0, 0, 63, 127],
      [127, 63, 63, 63, 63, 63, 127, 127],
      [127, 63, 63, 63, 127, 127, 127, 127],
    ]

    const flat = matrix.flat()
    const symbols = [...new Set(flat)].sort((a, b) => a - b)
    const frequencies = symbols.map(s => flat.filter(v => v === s).length)
    const probs = frequencies.map(f => f / flat.length)

    return {
      id: `HUFFMAN-MATRIX-${params.seed}`,
      familyId: 'HUFFMAN-MATRIX',
      seed: params.seed,
      params: { matrix: 'TD2_Ex2_standard', symbols, frequencies, probs },
      meta: createMeta({
        id: `HUFFMAN-MATRIX-${params.seed}`,
        td: 'TD2',
        num: 2,
        topic: 'Huffman sur image 8×8 (niveaux 0,63,127,255)',
        formulas: ['Fréquences', 'Arbre de Huffman', 'Codage', 'Remplacement'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD2 Ex2',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Fréquences des 4 niveaux ?`, 'text'),
        createQuestion('q2', `Codes de Huffman pour chaque niveau ?`, 'text'),
        createQuestion('q3', `Longueur moyenne vs longueur fixe (2 bits) ?`, 'numeric', { tolerance: 0.01, unit: 'bits' }),
        createQuestion('q4', `Taux de compression ?`, 'numeric', { tolerance: 0.01, unit: '%' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { symbols, frequencies } = instance.params as any
    const result = buildHuffman(symbols.map(String), frequencies)

    return {
      steps: [
        createStep(
          'Comptage fréquences',
          'Parcours matrice 8×8 = 64 pixels',
          symbols.map((s, i) => `${s}: ${frequencies[i]}`).join(', '),
          `Total: ${frequencies.reduce((a, b) => a + b, 0)} pixels`,
          ''
        ),
        createStep(
          'Arbre de Huffman',
          'Combine 2 moins fréquents itérativement',
          'Niveaux: 0(20), 63(24), 127(28), 255(8) → 255+0=28, 63+28=91, 91+127=218',
          'Arbre construit',
          ''
        ),
        createStep(
          'Codes (exemple valide)',
          'Plus fréquent → code court',
          '127:0, 63:10, 255:110, 0:111 (ou variantes équivalentes)',
          'Codes assignés',
          ''
        ),
        createStep(
          'Longueur moyenne',
          'L = Σ (freq/64) × len(code)',
          'Calcul pondéré',
          result.averageLength.toFixed(3),
          'bits/pixel'
        ),
        createStep(
          'Compression vs fixe (2 bits)',
          'Taux = (2 - L_moy) / 2 × 100',
          `Taux = (2 - ${result.averageLength.toFixed(3)}) / 2`,
          ((2 - result.averageLength) / 2 * 100).toFixed(1),
          '%'
        ),
      ],
      finalAnswer: `Fréq: 0=20, 63=24, 127=28, 255=8 | Codes ex: 127=0, 63=10, 255=110, 0=111 | L_moy=${result.averageLength.toFixed(3)} bits | Compression ${((2-result.averageLength)/2*100).toFixed(1)}%`,
      explanation: 'La matrice TD2 a 4 niveaux. Le plus fréquent (127) reçoit le code le plus court. Longueur fixe = 2 bits (4 niveaux = 2^2).',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { symbols, frequencies } = instance.params as any
    const expected = buildHuffman(symbols.map(String), frequencies)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const avgLenCorrect = Math.abs((a.avgLength ?? 0) - expected.averageLength) < 0.01
      const compressionCorrect = Math.abs((a.compression ?? 0) - ((2 - expected.averageLength) / 2 * 100)) < 0.1

      return {
        isCorrect: avgLenCorrect && compressionCorrect,
        score: [avgLenCorrect, compressionCorrect].filter(Boolean).length / 2,
        feedback: avgLenCorrect && compressionCorrect ? 'Correct !' : `L_moy: ${expected.averageLength.toFixed(3)}, Compression: ${((2-expected.averageLength)/2*100).toFixed(1)}%.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 11: VID-RAW (TD2 Ex3, TD4 Ex1, Ex6a) ---
export const VID_RAW: GeneratorFamily = {
  id: 'VID-RAW',
  name: 'Vidéo: Débit brut',
  tdMapping: ['TD2_Ex3', 'TD4_Ex1', 'TD4_Ex6a'],
  paramSchema: [
    { key: 'width', label: 'Largeur', type: 'number', min: 1280, max: 3840, step: 1, default: 1920 },
    { key: 'height', label: 'Hauteur', type: 'number', min: 720, max: 2160, step: 1, default: 1080 },
    { key: 'bpp', label: 'Bits/pixel', type: 'number', min: 12, max: 32, step: 1, default: 24 },
    { key: 'fps', label: 'Images/s', type: 'number', min: 24, max: 60, step: 1, default: 30 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const presets = [
      { width: 1920, height: 1080, bpp: 24, fps: 30 },
      { width: 1280, height: 720, bpp: 24, fps: 25 },
      { width: 1920, height: 1080, bpp: 24, fps: 24 },
      { width: 3840, height: 2160, bpp: 24, fps: 30 },
    ]
    const p = rng.nextChoice(presets)

    return {
      id: `VID-RAW-${params.seed}`,
      familyId: 'VID-RAW',
      seed: params.seed,
      params: p,
      meta: createMeta({
        id: `VID-RAW-${params.seed}`,
        td: 'TD2',
        num: 3,
        topic: 'Débit vidéo brut non compressé',
        formulas: ['D = L × H × bpp × fps'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD2 Ex3',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Débit brut (Mbit/s) ?`, 'numeric', { tolerance: 0.01, unit: 'Mbit/s' }),
        createQuestion('q2', `Débit brut (Gbit/s) ?`, 'numeric', { tolerance: 0.001, unit: 'Gbit/s' }),
        createQuestion('q3', `Avec compression H.264 100:1 (Mbit/s) ?`, 'numeric', { tolerance: 0.01, unit: 'Mbit/s' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { width, height, bpp, fps } = instance.params as any
    const bitrate = videoBitrateRaw(width, height, bpp, fps)
    const compressed = bitrate / 100

    return {
      steps: [
        createStep(
          'Débit brut',
          'D = L × H × bpp × fps',
          `D = ${width} × ${height} × ${bpp} × ${fps}`,
          bitrate,
          'bit/s'
        ),
        createStep(
          'En Mbit/s',
          'D_Mbps = D / 1 000 000',
          `D_Mbps = ${bitrate} / 1 000 000`,
          (bitrate / 1_000_000).toFixed(2),
          'Mbit/s'
        ),
        createStep(
          'En Gbit/s',
          'D_Gbps = D / 1 000 000 000',
          `D_Gbps = ${bitrate} / 1 000 000 000`,
          (bitrate / 1_000_000_000).toFixed(3),
          'Gbit/s'
        ),
        createStep(
          'Compressé H.264 (100:1)',
          'D_comp = D / 100',
          `D_comp = ${(bitrate / 1_000_000).toFixed(2)} / 100`,
          (bitrate / 100 / 1_000_000).toFixed(2),
          'Mbit/s'
        ),
      ],
      finalAnswer: `Brut: ${(bitrate/1e6).toFixed(2)} Mbit/s (${(bitrate/1e9).toFixed(3)} Gbit/s) | H.264 100:1: ${(bitrate/100/1e6).toFixed(2)} Mbit/s`,
      explanation: 'Formule fondamentale du débit vidéo brut. La compression H.264 typique ~100:1.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { width, height, bpp, fps } = instance.params as any
    const expectedBitrate = videoBitrateRaw(width, height, bpp, fps)
    const expectedCompressed = expectedBitrate / 100

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const rawCorrect = Math.abs((a.rawMbps ?? 0) - expectedBitrate / 1e6) < 0.01
      const compCorrect = Math.abs((a.compressedMbps ?? 0) - expectedCompressed / 1e6) < 0.01

      return {
        isCorrect: rawCorrect && compCorrect,
        score: [rawCorrect, compCorrect].filter(Boolean).length / 2,
        feedback: rawCorrect && compCorrect ? 'Parfait !' : `Brut: ${(expectedBitrate/1e6).toFixed(2)} Mbit/s.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 12: VID-YC-BPP (TD2 Ex4) ---
export const VID_YC_BPP: GeneratorFamily = {
  id: 'VID-YC-BPP',
  name: 'Vidéo: Format YC (luminance + chrominance)',
  tdMapping: ['TD2_Ex4'],
  paramSchema: [
    { key: 'width', label: 'Largeur', type: 'number', min: 640, max: 1920, step: 1, default: 1280 },
    { key: 'height', label: 'Hauteur', type: 'number', min: 480, max: 1080, step: 1, default: 720 },
    { key: 'yBits', label: 'Bits luminance (Y)', type: 'number', min: 4, max: 10, step: 1, default: 8 },
    { key: 'cBits', label: 'Bits chrominance (C)', type: 'number', min: 2, max: 8, step: 1, default: 4 },
    { key: 'fps', label: 'Images/s', type: 'number', min: 24, max: 60, step: 1, default: 25 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    return {
      id: `VID-YC-BPP-${params.seed}`,
      familyId: 'VID-YC-BPP',
      seed: params.seed,
      params: { width: 1280, height: 720, yBits: 8, cBits: 4, fps: 25 },
      meta: createMeta({
        id: `VID-YC-BPP-${params.seed}`,
        td: 'TD2',
        num: 4,
        topic: 'Format TV HD: Y 8 bits + C 4 bits',
        formulas: ['Bits/pixel = Y + C', 'D = L × H × (Y+C) × fps'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD2 Ex4',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Débit avant compression (Mbit/s) ?`, 'numeric', { tolerance: 0.01, unit: 'Mbit/s' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { width, height, yBits, cBits, fps } = instance.params as any
    const bpp = yBits + cBits
    const bitrate = videoBitrateRaw(width, height, bpp, fps)

    return {
      steps: [
        createStep(
          'Bits par pixel',
          'bpp = Y + C',
          `bpp = ${yBits} + ${cBits} = ${bpp}`,
          bpp,
          'bits'
        ),
        createStep(
          'Débit brut',
          'D = L × H × bpp × fps',
          `D = ${width} × ${height} × ${bpp} × ${fps}`,
          bitrate,
          'bit/s'
        ),
        createStep(
          'En Mbit/s',
          'D_Mbps = D / 1 000 000',
          `D_Mbps = ${bitrate} / 1 000 000`,
          (bitrate / 1_000_000).toFixed(2),
          'Mbit/s'
        ),
      ],
      finalAnswer: `Débit: ${(bitrate/1e6).toFixed(2)} Mbit/s`,
      explanation: 'Format TV HD: luminance 8 bits + chrominance 4 bits = 12 bits/pixel (vs 24 bits RGB). Économie 2×.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { width, height, yBits, cBits, fps } = instance.params as any
    const expectedBitrate = videoBitrateRaw(width, height, yBits + cBits, fps)

    if (typeof answer === 'number') {
      const correct = Math.abs(answer - expectedBitrate / 1e6) < 0.01
      return { isCorrect: correct, score: correct ? 1 : 0, feedback: correct ? 'Correct !' : `Attendu: ${(expectedBitrate/1e6).toFixed(2)} Mbit/s` }
    }
    return { isCorrect: false, score: 0, feedback: 'Nombre attendu.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 13: GOP-SIZE (TD2 Ex5) ---
export const GOP_SIZE: GeneratorFamily = {
  id: 'GOP-SIZE',
  name: 'Vidéo: Taille GOP et compression MPEG',
  tdMapping: ['TD2_Ex5'],
  paramSchema: [
    { key: 'durationMin', label: 'Durée vidéo (min)', type: 'number', min: 1, max: 10, step: 1, default: 2 },
    { key: 'originalMB', label: 'Taille originale (Mo)', type: 'number', min: 10, max: 200, step: 1, default: 60 },
    { key: 'fps', label: 'Images/s', type: 'number', min: 24, max: 30, step: 1, default: 25 },
    { key: 'pattern', label: 'Pattern GOP', type: 'text', default: 'IBBPBBIBBP' },
    { key: 'iWeight', label: 'Poids I (%)', type: 'number', min: 50, max: 150, step: 1, default: 100 },
    { key: 'pWeight', label: 'Poids P (%)', type: 'number', min: 20, max: 80, step: 1, default: 50 },
    { key: 'bWeight', label: 'Poids B (%)', type: 'number', min: 10, max: 40, step: 1, default: 20 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `GOP-SIZE-${params.seed}`,
      familyId: 'GOP-SIZE',
      seed: params.seed,
      params: { durationMin: 2, originalMB: 60, fps: 25, pattern: 'IBBPBBIBBP', iWeight: 100, pWeight: 50, bWeight: 20 },
      meta: createMeta({
        id: `GOP-SIZE-${params.seed}`,
        td: 'TD2',
        num: 5,
        topic: 'Compression MPEG-1: GOP IBBPBBIBBP',
        formulas: ['GOP = longueur pattern', 'Poids = Σ count × weight%', 'Moyenne = Poids / Nb frames'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD2 Ex5',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Taille du GOP (nb images) ?`, 'numeric', { tolerance: 0, unit: 'images' }),
        createQuestion('q2', `Taille compressée (Mo) ?`, 'numeric', { tolerance: 0.1, unit: 'Mo' }),
        createQuestion('q3', `Ratio de compression ?`, 'numeric', { tolerance: 0.1, unit: 'x' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { durationMin, originalMB, fps, pattern, iWeight, pWeight, bWeight } = instance.params as any
    const gopSize = pattern.length
    const iCount = (pattern.match(/I/g) || []).length
    const pCount = (pattern.match(/P/g) || []).length
    const bCount = (pattern.match(/B/g) || []).length

    const compressedMB = videoSizeFromGOP(originalMB, iCount, pCount, bCount, iWeight, pWeight, bWeight)
    const ratio = originalMB / compressedMB

    return {
      steps: [
        createStep(
          'Analyse GOP',
          'Comptage I, P, B dans pattern',
          `Pattern: ${pattern} | I=${iCount}, P=${pCount}, B=${bCount}`,
          `GOP = ${gopSize} images`,
          ''
        ),
        createStep(
          'Poids GOP',
          'Poids = I×I% + P×P% + B×B%',
          `Poids = ${iCount}×${iWeight}% + ${pCount}×${pWeight}% + ${bCount}×${bWeight}% = ${(iCount*iWeight/100 + pCount*pWeight/100 + bCount*bWeight/100).toFixed(1)}`,
          (iCount*iWeight/100 + pCount*pWeight/100 + bCount*bWeight/100).toFixed(2),
          'unités image'
        ),
        createStep(
          'Moyenne par image',
          'Moyenne = Poids / Nb images GOP',
          `Moyenne = ${(iCount*iWeight/100 + pCount*pWeight/100 + bCount*bWeight/100).toFixed(2)} / ${gopSize}`,
          (iCount*iWeight/100 + pCount*pWeight/100 + bCount*bWeight/100) / gopSize,
          ''
        ),
        createStep(
          'Taille compressée',
          'Taille = Originale × Moyenne',
          `Taille = ${originalMB} × ${((iCount*iWeight/100 + pCount*pWeight/100 + bCount*bWeight/100) / gopSize).toFixed(4)}`,
          compressedMB.toFixed(2),
          'Mo'
        ),
        createStep(
          'Ratio',
          'Ratio = Originale / Compressée',
          `Ratio = ${originalMB} / ${compressedMB.toFixed(2)}`,
          ratio.toFixed(2),
          'x'
        ),
      ],
      finalAnswer: `GOP: ${gopSize} images | Compressé: ${compressedMB.toFixed(2)} Mo | Ratio: ${ratio.toFixed(2)}:1`,
      explanation: 'Le pattern GOP détermine le ratio. I=référence (100%), P=prédite (~50%), B=bidirectionnelle (~20%).',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { pattern, iWeight, pWeight, bWeight, originalMB } = instance.params as any
    const iCount = (pattern.match(/I/g) || []).length
    const pCount = (pattern.match(/P/g) || []).length
    const bCount = (pattern.match(/B/g) || []).length
    const expectedCompressed = videoSizeFromGOP(originalMB, iCount, pCount, bCount, iWeight, pWeight, bWeight)
    const expectedRatio = originalMB / expectedCompressed

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const gopCorrect = (a.gopSize ?? 0) === pattern.length
      const compCorrect = Math.abs((a.compressed ?? 0) - expectedCompressed) < 0.1
      const ratioCorrect = Math.abs((a.ratio ?? 0) - expectedRatio) < 0.1

      return {
        isCorrect: gopCorrect && compCorrect && ratioCorrect,
        score: [gopCorrect, compCorrect, ratioCorrect].filter(Boolean).length / 3,
        feedback: gopCorrect && compCorrect && ratioCorrect ? 'Parfait !' : `Compressé: ${expectedCompressed.toFixed(2)} Mo.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: (instance: ExerciseInstance, answer: unknown): ErrorClassification => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      if ((a.gopSize ?? 0) !== (instance.params as any).pattern.length) {
        return { type: 'gop_compte_faux', message: '', description: getErrorDescription('gop_compte_faux') }
      }
    }
    return { type: 'autre', message: '', description: getErrorDescription('autre') }
  },
}

// --- Family 14: RES-TABLE (TD2 Ex6) ---
export const RES_TABLE: GeneratorFamily = {
  id: 'RES-TABLE',
  name: 'Vidéo: Tableau résolutions (convention binaire)',
  tdMapping: ['TD2_Ex6'],
  paramSchema: [
    { key: 'fps', label: 'Images/s', type: 'number', min: 24, max: 30, step: 1, default: 24 },
    { key: 'bpp', label: 'Bits/pixel', type: 'number', min: 24, max: 24, step: 1, default: 24 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `RES-TABLE-${params.seed}`,
      familyId: 'RES-TABLE',
      seed: params.seed,
      params: { fps: 24, bpp: 24 },
      meta: createMeta({
        id: `RES-TABLE-${params.seed}`,
        td: 'TD2',
        num: 6,
        topic: 'Tableau débits/tailles résolutions standard',
        formulas: ['D = L×H×bpp×fps', 'Convention binaire (MiB/GiB)'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD2 Ex6',
        priority: 'H',
        convention: 'binary',
      }),
      questions: [
        createQuestion('q1', `Complétez le tableau pour 144p, 240p, 360p, 480p, 720p, 1080p`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { fps, bpp } = instance.params as any
    const resolutions = [
      { label: '144p', w: 256, h: 144 },
      { label: '240p', w: 426, h: 240 },
      { label: '360p', w: 640, h: 360 },
      { label: '480p', w: 854, h: 480 },
      { label: '720p', w: 1280, h: 720 },
      { label: '1080p', w: 1920, h: 1080 },
    ]

    const results = resolutions.map(r => {
      const bitrate = videoBitrateRaw(r.w, r.h, bpp, fps)
      const sizePerMinBytes = (bitrate * 60) / 8
      const sizePerMinMiB = sizePerMinBytes / 1_048_576
      return { ...r, bitrateMbps: bitrate / 1e6, sizePerMinMiB: sizePerMinMiB.toFixed(2) }
    })

    return {
      steps: [
        createStep(
          'Formule',
          'D = L × H × bpp × fps (convention binaire pour tailles)',
          `bpp = ${bpp}, fps = ${fps}`,
          'Calcul par résolution',
          ''
        ),
        createStep(
          'Résultats (convention binaire: MiB/min)',
          results.map(r => `${r.label} (${r.w}×${r.h}): ${r.bitrateMbps.toFixed(1)} Mbit/s, ${r.sizePerMinMiB} MiB/min`).join('\n'),
          'Voir détail',
          ''
        ),
      ],
      finalAnswer: results.map(r => `${r.label}: ${r.bitrateMbps.toFixed(1)} Mbit/s, ${r.sizePerMinMiB} MiB/min`).join(' | '),
      explanation: 'Convention binaire (MiB = /1024², GiB = /1024³) utilisée pour ce tableau TD2. Débits en Mbit/s (décimal).',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    // Simplified validation
    return { isCorrect: true, score: 1, feedback: 'Validation manuelle requise pour le tableau complet.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 15: PTS-DTS-ORDER (TD3 Ex2) ---
export const PTS_DTS_ORDER: GeneratorFamily = {
  id: 'PTS-DTS-ORDER',
  name: 'Transport: Ordre PTS/DTS',
  tdMapping: ['TD3_Ex2'],
  paramSchema: [
    { key: 'frames', label: 'Frames (type:DTS:PTS)', type: 'text', default: 'I:0:80,P:40:40,B:80:0' },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `PTS-DTS-ORDER-${params.seed}`,
      familyId: 'PTS-DTS-ORDER',
      seed: params.seed,
      params: { frames: 'I:0:80,P:40:40,B:80:0' },
      meta: createMeta({
        id: `PTS-DTS-ORDER-${params.seed}`,
        td: 'TD3',
        num: 2,
        topic: 'Ordre de décodage vs affichage (PTS/DTS)',
        formulas: ['Décodage: DTS croissant', 'Affichage: PTS croissant'],
        type: 'concept',
        difficulty: 3,
        status: 'etudié',
        source: 'TD3 Ex2',
        priority: 'H',
        needsTeacherVerification: true,
        verificationNote: 'B-frame DTS>PTS impossible en réel (PTS≥DTS). Piège pédagogique.',
      }),
      questions: [
        createQuestion('q1', `Ordre de décodage (par DTS) ?`, 'ordering', { choices: ['I', 'P', 'B'] }),
        createQuestion('q2', `Ordre d'affichage (par PTS) ?`, 'ordering', { choices: ['I', 'P', 'B'] }),
        createQuestion('q3', `Audio PTS=0,40,80: quel vidéo avec quel audio ?`, 'text'),
        createQuestion('q4', `Pourquoi DTS(B) > PTS(B) ?`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    return {
      steps: [
        createStep(
          'Données',
          'Frames reçues: I(DTS=0,PTS=80), P(DTS=40,PTS=40), B(DTS=80,PTS=0)',
          'Tri par DTS pour décodage, par PTS pour affichage',
          'Prêt à analyser',
          ''
        ),
        createStep(
          'Ordre de décodage',
          'DTS croissant: I(0) → P(40) → B(80)',
          'DTS: 0, 40, 80',
          'I → P → B',
          ''
        ),
        createStep(
          'Ordre d\'affichage',
          'PTS croissant: B(0) → P(40) → I(80)',
          'PTS: 0, 40, 80',
          'B → P → I',
          ''
        ),
        createStep(
          'Synchronisation audio',
          'Audio PTS=0,40,80 ms',
          'Audio 0ms ↔ Video B(PTS=0)\nAudio 40ms ↔ Video P(PTS=40)\nAudio 80ms ↔ Video I(PTS=80)',
          'Lip-sync assuré par PTS',
          ''
        ),
        createStep(
          'Pourquoi DTS(B) > PTS(B) ?',
          'B dépend de I et P pour sa prédiction bidirectionnelle',
          'B doit être décodé APRÈS I et P, mais affiché AVANT eux',
          'DTS(B)=80 > PTS(B)=0 (valeurs pédagogiques impossibles en réel: PTS≥DTS)',
          '⚠ Piège: Dans les vrais flux MPEG, PTS ≥ DTS toujours !'
        ),
      ],
      finalAnswer: `Décodage: I→P→B | Affichage: B→P→I | Sync: Audio0↔B, Audio40↔P, Audio80↔I | ⚠ DTS>PTS impossible réel`,
      explanation: 'Les B-frames nécessitent les références I et P avant d\'être décodées, mais s\'affichent avant elles. En réalité, PTS ≥ DTS toujours.',
      confidence: 'medium',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, string | string[]>
      let score = 0
      const decode = ['I', 'P', 'B']
      const display = ['B', 'P', 'I']

      if (Array.isArray(a.decode) && JSON.stringify(a.decode) === JSON.stringify(decode)) score++
      if (Array.isArray(a.display) && JSON.stringify(a.display) === JSON.stringify(display)) score++
      if (a.sync && a.sync.includes('Audio 0') && a.sync.includes('B')) score++
      if (a.why && a.why.includes('bidirectionnel')) score++

      return {
        isCorrect: score === 4,
        score: score / 4,
        feedback: score === 4 ? 'Parfait !' : `${score}/4 points.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: (instance: ExerciseInstance, answer: unknown): ErrorClassification => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, string[]>
      if (Array.isArray(a.decode) && JSON.stringify(a.decode) === JSON.stringify(['B', 'P', 'I'])) {
        return { type: 'pts_dts_confusion', message: '', description: getErrorDescription('pts_dts_confusion') }
      }
    }
    return { type: 'autre', message: '', description: getErrorDescription('autre') }
  },
}

// --- Family 16: TOPOLOGY (TD3 Ex3) ---
export const TOPOLOGY_FAMILY: GeneratorFamily = {
  id: 'TOPOLOGY',
  name: 'Réseau: Choix topologie (Broadcast/Multicast/Unicast)',
  tdMapping: ['TD3_Ex3'],
  paramSchema: [
    { key: 'scenarios', label: 'Scénarios', type: 'text', default: '3 cas standard' },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const scenarios = [
      { desc: '5000 étudiants dans 1 amphi avec TNT interne', answer: 'Broadcast', justification: 'Diffusion massive un-vers-tous, pas de retour' },
      { desc: '500 étudiants en fibre à travers l\'Algérie avec box IPTV', answer: 'Multicast', justification: 'Un flux par groupe via IGMP, économie bande passante' },
      { desc: '50 000 étudiants sur internet mobile 4G', answer: 'Unicast', justification: 'ABR/CDN, flux personnalisé par client' },
    ]

    return {
      id: `TOPOLOGY-${params.seed}`,
      familyId: 'TOPOLOGY',
      seed: params.seed,
      params: { scenarios },
      meta: createMeta({
        id: `TOPOLOGY-${params.seed}`,
        td: 'TD3',
        num: 3,
        topic: 'Topologies de diffusion selon le scénario',
        formulas: [],
        type: 'design',
        difficulty: 2,
        status: 'etudié',
        source: 'TD3 Ex3',
        priority: 'H',
      }),
      questions: scenarios.map((s, i) =>
        createQuestion(`q${i+1}`, `${s.desc} → Topologie ?`, 'choice', {
          choices: ['Broadcast', 'Multicast', 'Unicast'],
          correctIndex: ['Broadcast', 'Multicast', 'Unicast'].indexOf(s.answer),
        })
      ),
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    return {
      steps: [
        createStep(
          'Cas 1: 5000 étudiants amphi TNT',
          'Broadcast = un vers tous',
          'Pas d\'interaction, même contenu pour tous',
          'Broadcast',
          'Diffusion massive, pas de retour'
        ),
        createStep(
          'Cas 2: 500 étudiants fibre IPTV',
          'Multicast = un vers groupe (IGMP)',
          'Réseau géré, abonnés box IPTV',
          'Multicast',
          'Un flux par groupe, économie bande'
        ),
        createStep(
          'Cas 3: 50000 étudiants 4G mobile',
          'Unicast = un vers un (ABR/CDN)',
          'Réseau non géré, clients mobiles hétérogènes',
          'Unicast',
          'Personnalisable, ABR, CDN'
        ),
      ],
      finalAnswer: `Cas1: Broadcast | Cas2: Multicast (500 étudiants) | Cas3: Unicast`,
      explanation: 'Broadcast pour TNT/TV hertzienne, Multicast pour IPTV gérée, Unicast pour Internet/OTT/ABR.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, string>
      const expected = { q1: 'Broadcast', q2: 'Multicast', q3: 'Unicast' }
      let correct = 0
      if (a.q1 === expected.q1) correct++
      if (a.q2 === expected.q2) correct++
      if (a.q3 === expected.q3) correct++

      return {
        isCorrect: correct === 3,
        score: correct / 3,
        feedback: correct === 3 ? 'Parfait !' : `${correct}/3 corrects. Cas 2: 500 étudiants (pas 300).`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 17: BUFFER-DRAIN (TD4 Ex2) ---
export const BUFFER_DRAIN: GeneratorFamily = {
  id: 'BUFFER-DRAIN',
  name: 'Streaming: Vidage buffer / Freeze',
  tdMapping: ['TD4_Ex2'],
  paramSchema: [
    { key: 'dv', label: 'Débit vidéo (Mbit/s)', type: 'number', min: 1, max: 20, step: 1, default: 5 },
    { key: 'dr', label: 'Débit réseau moyen (Mbit/s)', type: 'number', min: 1, max: 20, step: 1, default: 4 },
    { key: 'bufferSec', label: 'Buffer initial (s)', type: 'number', min: 1, max: 60, step: 1, default: 10 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const dv = rng.nextInt(3, 15)
    const dr = rng.nextInt(1, dv - 1)
    const bufferSec = rng.nextInt(5, 30)

    return {
      id: `BUFFER-DRAIN-${params.seed}`,
      familyId: 'BUFFER-DRAIN',
      seed: params.seed,
      params: { dv, dr, bufferSec },
      meta: createMeta({
        id: `BUFFER-DRAIN-${params.seed}`,
        td: 'TD4',
        num: 2,
        topic: 'Buffer drain: quand la vidéo freeze ?',
        formulas: ['Buffer = Dv × t_init', 'Déficit = Dv - Dr', 't_freeze = Buffer / Déficit'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD4 Ex2',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Temps avant freeze (s) ?`, 'numeric', { tolerance: 1, unit: 's' }),
        createQuestion('q2', `Solution DASH ?`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { dv, dr, bufferSec } = instance.params as any
    const dvBps = dv * 1_000_000
    const drBps = dr * 1_000_000
    const bufferBits = dvBps * bufferSec
    const deficit = dvBps - drBps
    const freezeTime = bufferBits / deficit

    return {
      steps: [
        createStep(
          'Buffer initial (bits)',
          'Buffer = Dv × t_init',
          `Buffer = ${dv} × 10^6 × ${bufferSec}`,
          bufferBits,
          'bits'
        ),
        createStep(
          'Déficit (bits/s)',
          'Déficit = Dv - Dr',
          `Déficit = ${dv} - ${dr} = ${dv - dr} Mbit/s`,
          (dv - dr) * 1_000_000,
          'bits/s'
        ),
        createStep(
          'Temps avant freeze',
          't = Buffer / Déficit',
          `t = ${bufferBits} / ${deficit * 1_000_000}`,
          freezeTime.toFixed(0),
          's'
        ),
        createStep(
          'Solution DASH',
          'Adaptation dynamique du débit (ABR)',
          'Baisse qualité quand bande passante insuffisante',
          'DASH: adaptation dynamique du débit',
          ''
        ),
      ],
      finalAnswer: `Freeze après ${freezeTime.toFixed(0)} s | DASH: adaptation dynamique du débit`,
      explanation: 'Le buffer se vide au rythme du déficit. DASH évite le freeze en baissant la qualité.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { dv, dr, bufferSec } = instance.params as any
    const dvBps = dv * 1_000_000
    const drBps = dr * 1_000_000
    const expectedFreeze = (dvBps * bufferSec) / (dvBps - drBps)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const timeCorrect = Math.abs((a.time ?? 0) - expectedFreeze) < 1
      return {
        isCorrect: timeCorrect,
        score: timeCorrect ? 1 : 0,
        feedback: timeCorrect ? 'Correct !' : `Attendu: ${expectedFreeze.toFixed(0)} s`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 18: RTP-TIMESTAMP (TD4 Ex3) ---
export const RTP_TIMESTAMP: GeneratorFamily = {
  id: 'RTP-TIMESTAMP',
  name: 'RTP: Timestamps audio/vidéo',
  tdMapping: ['TD4_Ex3'],
  paramSchema: [
    { key: 'audioSampleRate', label: 'Fe audio (Hz)', type: 'number', min: 8000, max: 48000, step: 1000, default: 48000 },
    { key: 'videoFps', label: 'FPS vidéo', type: 'number', min: 24, max: 60, step: 1, default: 25 },
    { key: 'audioSamplesPerFrame', label: 'Échantillons/frame audio', type: 'number', min: 512, max: 2048, step: 128, default: 1024 },
    { key: 'videoClockRate', label: 'Horloge vidéo (Hz)', type: 'number', min: 90000, max: 90000, step: 1, default: 90000 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `RTP-TIMESTAMP-${params.seed}`,
      familyId: 'RTP-TIMESTAMP',
      seed: params.seed,
      params: { audioSampleRate: 48000, videoFps: 25, audioSamplesPerFrame: 1024, videoClockRate: 90000 },
      meta: createMeta({
        id: `RTP-TIMESTAMP-${params.seed}`,
        td: 'TD4',
        num: 3,
        topic: 'Timestamps RTP audio/vidéo et synchronisation',
        formulas: ['t_audio = samples/Fe', 't_video = 1/fps', 'Timestamp = t × clockRate'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD4 Ex3',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Durée frame audio (ms) ?`, 'numeric', { tolerance: 0.01, unit: 'ms' }),
        createQuestion('q2', `Durée frame vidéo (ms) ?`, 'numeric', { tolerance: 0.01, unit: 'ms' }),
        createQuestion('q3', `Audio ts=48000 @48kHz, Video ts=90000 @90kHz → alignés ?`, 'choice', { choices: ['Oui, alignés à 1s', 'Non, décalés'] }),
        createQuestion('q4', `Si audio 80ms retard → perçu ?`, 'choice', { choices: ['Désynchronisation perceptible', 'Imperceptible', 'Inaudible'] }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { audioSampleRate, videoFps, audioSamplesPerFrame, videoClockRate } = instance.params as any
    const audioFrameMs = audioFrameDuration(audioSamplesPerFrame, audioSampleRate)
    const videoFrameMs = videoFrameDuration(videoFps)
    const audioTsPerSec = audioSampleRate
    const videoTsPerSec = videoClockRate
    const aligned = Math.abs(audioTsPerSec - videoTsPerSec) < 1 // both = 1s worth

    return {
      steps: [
        createStep(
          'Durée frame audio',
          't_audio = échantillons / Fe',
          `t_audio = ${audioSamplesPerFrame} / ${audioSampleRate}`,
          audioFrameMs.toFixed(2),
          'ms'
        ),
        createStep(
          'Durée frame vidéo',
          't_video = 1 / fps',
          `t_video = 1 / ${videoFps}`,
          videoFrameMs.toFixed(2),
          'ms'
        ),
        createStep(
          'Timestamps RTP',
          'Audio: 1s = 48000 @48kHz | Vidéo: 1s = 90000 @90kHz',
          'Audio ts=48000 → 1.000s | Vidéo ts=90000 → 1.000s',
          aligned ? 'ALIGNÉS à 1s' : 'DÉCALÉS',
          ''
        ),
        createStep(
          'Retard audio 80ms',
          'Limite lip-sync ≈ 40-80ms',
          '80ms > limite → désynchronisation visible',
          'Désynchronisation perceptible (limite ~40-80ms)',
          ''
        ),
      ],
      finalAnswer: `Audio: ${audioFrameMs.toFixed(2)}ms | Vidéo: ${videoFrameMs.toFixed(2)}ms | Alignés à 1s | 80ms retard = perceptible`,
      explanation: 'Timestamps RTP normalisés par leur clock rate. Audio 48kHz et vidéo 90kHz donnent tous deux 1s pour les valeurs données. Lip-sync limite ~80ms.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { audioSampleRate, videoFps, audioSamplesPerFrame } = instance.params as any
    const expectedAudioMs = audioFrameDuration(audioSamplesPerFrame, audioSampleRate)
    const expectedVideoMs = videoFrameDuration(videoFps)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const audioCorrect = Math.abs((a.audioMs ?? 0) - expectedAudioMs) < 0.01
      const videoCorrect = Math.abs((a.videoMs ?? 0) - expectedVideoMs) < 0.01
      const alignedCorrect = a.aligned === 'Oui, alignés à 1s'
      const syncCorrect = a.sync === 'Désynchronisation perceptible'

      return {
        isCorrect: audioCorrect && videoCorrect && alignedCorrect && syncCorrect,
        score: [audioCorrect, videoCorrect, alignedCorrect, syncCorrect].filter(Boolean).length / 4,
        feedback: audioCorrect && videoCorrect && alignedCorrect && syncCorrect ? 'Parfait !' : `Audio: ${expectedAudioMs.toFixed(2)}ms, Vidéo: ${expectedVideoMs.toFixed(2)}ms.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 19: JITTER-BUFFER (TD4 Ex4, TD5 Ex2) ---
export const JITTER_BUFFER: GeneratorFamily = {
  id: 'JITTER-BUFFER',
  name: 'RTP: Taille buffer de gigue',
  tdMapping: ['TD4_Ex4', 'TD5_Ex2'],
  paramSchema: [
    { key: 'jitterMs', label: 'Gigue (ms)', type: 'number', min: 10, max: 200, step: 1, default: 100 },
    { key: 'fps', label: 'FPS vidéo', type: 'number', min: 24, max: 60, step: 1, default: 25 },
    { key: 'delays', label: 'Délais paquets (ms, séparés par virgule)', type: 'text', default: '20,35,22,60,25,80' },
    { key: 'bufferFixed', label: 'Buffer fixe (ms)', type: 'number', min: 10, max: 200, step: 1, default: 50 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const jitterMs = rng.nextInt(50, 150)
    const fps = 25
    const delays = [20, 35, 22, 60, 25, 80]
    const bufferFixed = rng.nextInt(30, 80)

    return {
      id: `JITTER-BUFFER-${params.seed}`,
      familyId: 'JITTER-BUFFER',
      seed: params.seed,
      params: { jitterMs, fps, delays, bufferFixed },
      meta: createMeta({
        id: `JITTER-BUFFER-${params.seed}`,
        td: 'TD4',
        num: 4,
        topic: 'Buffer de gigue et pertes',
        formulas: ['Buffer ≈ gigue + 1 frame', 'Perte si délai > buffer'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD4 Ex4 / TD5 Ex2',
        priority: 'H',
        needsTeacherVerification: true,
        verificationNote: 'TD5 Ex2: plusieurs définitions de gigue (max-min=60, MAD≈19.8, mean|Δ|=31.2, RFC3550≈8.97). Marquer max-min comme "attendu".',
      }),
      questions: [
        createQuestion('q1', `Taille buffer recommandée (ms) ?`, 'numeric', { tolerance: 1, unit: 'ms' }),
        createQuestion('q2', `Paquets perdus avec buffer ${bufferFixed}ms ?`, 'numeric', { tolerance: 0, unit: 'paquets' }),
        createQuestion('q3', `Gigue max-min (ms) ?`, 'numeric', { tolerance: 1, unit: 'ms' }),
        createQuestion('q4', `Pourquoi buffer adaptatif meilleur ?`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { jitterMs, fps, delays, bufferFixed } = instance.params as any
    const frameMs = videoFrameDuration(fps)
    const recommendedBuffer = jitterMs + frameMs
    const maxDelay = Math.max(...delays)
    const minDelay = Math.min(...delays)
    const jitterMaxMin = maxDelay - minDelay
    const lost = delays.filter((d: number) => d > bufferFixed).length

    return {
      steps: [
        createStep(
          'Durée frame',
          't = 1 / fps',
          `t = 1 / ${fps}`,
          frameMs.toFixed(1),
          'ms'
        ),
        createStep(
          'Buffer recommandé',
          'Buffer ≈ gigue + 1 frame',
          `Buffer = ${jitterMs} + ${frameMs.toFixed(1)}`,
          recommendedBuffer.toFixed(0),
          'ms'
        ),
        createStep(
          'Gigue (max-min)',
          'Jitter = max(délais) - min(délais)',
          `Jitter = ${maxDelay} - ${minDelay}`,
          jitterMaxMin,
          'ms'
        ),
        createStep(
          'Paquets perdus (buffer fixe)',
          'Perdu si délai > buffer',
          `Délais: [${delays.join(', ')}] | Buffer: ${bufferFixed}ms`,
          lost,
          'paquets'
        ),
        createStep(
          'Buffer adaptatif',
          'S\'ajuste aux conditions réseau',
          'Moins de latence inutile, moins de pertes',
          'Meilleur compromise latence/pertes',
          ''
        ),
      ],
      finalAnswer: `Buffer: ${recommendedBuffer.toFixed(0)}ms | Gigue max-min: ${jitterMaxMin}ms | Perdus @${bufferFixed}ms: ${lost} | Adaptatif: s'ajuste dynamiquement`,
      explanation: 'Buffer = gigue + 1 frame. Buffer fixe perd les paquets au-delà. Buffer adaptatif (RFC3550) optimise latence/pertes. ⚠ Gigue a plusieurs définitions.',
      confidence: 'medium',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { jitterMs, fps, delays, bufferFixed } = instance.params as any
    const frameMs = videoFrameDuration(fps)
    const expectedBuffer = jitterMs + frameMs
    const expectedJitter = Math.max(...delays) - Math.min(...delays)
    const expectedLost = delays.filter((d: number) => d > bufferFixed).length

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const bufferCorrect = Math.abs((a.buffer ?? 0) - expectedBuffer) < 1
      const jitterCorrect = (a.jitter ?? 0) === expectedJitter
      const lostCorrect = (a.lost ?? 0) === expectedLost

      return {
        isCorrect: bufferCorrect && jitterCorrect && lostCorrect,
        score: [bufferCorrect, jitterCorrect, lostCorrect].filter(Boolean).length / 3,
        feedback: bufferCorrect && jitterCorrect && lostCorrect ? 'Parfait !' : `Buffer: ${expectedBuffer.toFixed(0)}ms, Jitter: ${expectedJitter}ms, Perdus: ${expectedLost}.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 20: LATENCY-BUDGET (TD3 Ex4, TD5 Ex1, Ex6) ---
export const LATENCY_BUDGET: GeneratorFamily = {
  id: 'LATENCY-BUDGET',
  name: 'Latence bout-en-bout et G.114',
  tdMapping: ['TD3_Ex4', 'TD5_Ex1', 'TD5_Ex6'],
  paramSchema: [
    { key: 'capture', label: 'Capture (ms)', type: 'number', min: 5, max: 50, step: 1, default: 20 },
    { key: 'encoding', label: 'Encodage (ms)', type: 'number', min: 10, max: 100, step: 1, default: 30 },
    { key: 'network', label: 'Réseau (ms)', type: 'number', min: 10, max: 200, step: 1, default: 40 },
    { key: 'jitter', label: 'Jitter buffer (ms)', type: 'number', min: 10, max: 100, step: 1, default: 60 },
    { key: 'decoding', label: 'Décodage (ms)', type: 'number', min: 5, max: 50, step: 1, default: 20 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    return {
      id: `LATENCY-BUDGET-${params.seed}`,
      familyId: 'LATENCY-BUDGET',
      seed: params.seed,
      params: { capture: 20, encoding: 30, network: 40, jitter: 60, decoding: 20 },
      meta: createMeta({
        id: `LATENCY-BUDGET-${params.seed}`,
        td: 'TD3',
        num: 4,
        topic: 'Budget de latence et classification G.114',
        formulas: ['Latence = Σ composants', 'G.114: ≤150 optimal, ≤400 acceptable'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD3 Ex4 / TD5 Ex1',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Latence totale (ms) ?`, 'numeric', { tolerance: 1, unit: 'ms' }),
        createQuestion('q2', `Classification G.114 ?`, 'choice', { choices: ['Optimal (≤150ms)', 'Acceptable (≤400ms)', 'Inacceptable (>400ms)'] }),
        createQuestion('q3', `Si réseau = 120ms, 3 actions pour <200ms ?`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { capture, encoding, network, jitter, decoding } = instance.params as any
    const total = latencyBudget({ capture, encoding, network, jitter, decoding })
    const classification = g114Classification(total)

    return {
      steps: [
        createStep(
          'Somme composants',
          'L = capture + encodage + réseau + jitter + décodage',
          `L = ${capture} + ${encoding} + ${network} + ${jitter} + ${decoding}`,
          total,
          'ms'
        ),
        createStep(
          'Classification G.114',
          '≤150 optimal | ≤400 acceptable | >400 inacceptable',
          `Total = ${total} ms`,
          classification,
          ''
        ),
        createStep(
          'Actions si réseau dégrade (ex: 120ms)',
          '1. QoS priorité voix\n2. Réduire jitter buffer\n3. Codec plus efficace (Opus 10ms)\n4. Serveur plus proche',
          'Nouveau réseau = 120ms → Total = 220ms',
          'QoS, buffer↓, Opus, serveur proche',
          ''
        ),
      ],
      finalAnswer: `Latence: ${total} ms (${classification}) | Actions: QoS, buffer↓, Opus, serveur proche`,
      explanation: 'Budget latence = somme de tous les composants. G.114 donne les seuils. Pour réduire: QoS, jitter buffer adaptatif, codec bas délai, géographie.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { capture, encoding, network, jitter, decoding } = instance.params as any
    const expectedTotal = latencyBudget({ capture, encoding, network, jitter, decoding })
    const expectedClass = g114Classification(expectedTotal)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const totalCorrect = Math.abs((a.total ?? 0) - expectedTotal) < 1
      const classCorrect = a.classification === expectedClass

      return {
        isCorrect: totalCorrect && classCorrect,
        score: [totalCorrect, classCorrect].filter(Boolean).length / 2,
        feedback: totalCorrect && classCorrect ? 'Parfait !' : `Total: ${expectedTotal}ms (${expectedClass}).`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 21: FILM-SIZE (TD4 Ex6) ---
export const FILM_SIZE: GeneratorFamily = {
  id: 'FILM-SIZE',
  name: 'Vidéo: Taille film 1h (brut vs YouTube)',
  tdMapping: ['TD4_Ex6'],
  paramSchema: [
    { key: 'durationHours', label: 'Durée (h)', type: 'number', min: 1, max: 3, step: 1, default: 1 },
    { key: 'width', label: 'Largeur', type: 'number', min: 1920, max: 1920, step: 1, default: 1920 },
    { key: 'height', label: 'Hauteur', type: 'number', min: 1080, max: 1080, step: 1, default: 1080 },
    { key: 'fps', label: 'FPS', type: 'number', min: 24, max: 30, step: 1, default: 24 },
    { key: 'bpp', label: 'Bits/pixel', type: 'number', min: 24, max: 24, step: 1, default: 24 },
    { key: 'videoBR', label: 'Débit vidéo YouTube (Mbit/s)', type: 'number', min: 1, max: 10, step: 0.5, default: 4.5 },
    { key: 'audioBR', label: 'Débit audio AAC (kbit/s)', type: 'number', min: 64, max: 256, step: 32, default: 128 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `FILM-SIZE-${params.seed}`,
      familyId: 'FILM-SIZE',
      seed: params.seed,
      params: { durationHours: 1, width: 1920, height: 1080, fps: 24, bpp: 24, videoBR: 4.5, audioBR: 128 },
      meta: createMeta({
        id: `FILM-SIZE-${params.seed}`,
        td: 'TD4',
        num: 6,
        topic: 'Taille film 1h 1080p24: brut vs YouTube',
        formulas: ['Brut = L×H×3×fps×3600', 'Compressé = (BR_vid + BR_aud) × 3600 / 8'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD4 Ex6',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Taille brute (Go) ?`, 'numeric', { tolerance: 0.1, unit: 'Go' }),
        createQuestion('q2', `Taille YouTube 4.5M+128k (Go) ?`, 'numeric', { tolerance: 0.01, unit: 'Go' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { durationHours, width, height, fps, bpp, videoBR, audioBR } = instance.params as any
    const rawBytes = videoFileSizeRaw(width, height, bpp, fps, durationHours * 3600)
    const rawGB = rawBytes / 1e9
    const compressedBits = (videoBR * 1e6 + audioBR * 1e3) * durationHours * 3600
    const compressedGB = compressedBits / 8 / 1e9

    return {
      steps: [
        createStep(
          'Taille brute (octets)',
          'Brut = L × H × 3 × fps × 3600 × durée_h',
          `Brut = ${width} × ${height} × 3 × ${fps} × 3600 × ${durationHours}`,
          rawBytes,
          'octets'
        ),
        createStep(
          'Taille brute (Go décimal)',
          'Go = octets / 10^9',
          `Go = ${rawBytes} / 1 000 000 000`,
          rawGB.toFixed(1),
          'Go'
        ),
        createStep(
          'Taille compressée (bits)',
          'Bits = (BR_vid + BR_aud) × 3600 × h',
          `Bits = (${videoBR}×10^6 + ${audioBR}×10^3) × 3600 × ${durationHours}`,
          compressedBits,
          'bits'
        ),
        createStep(
          'Taille compressée (Go)',
          'Go = bits / 8 / 10^9',
          `Go = ${compressedBits} / 8 / 10^9`,
          compressedGB.toFixed(2),
          'Go'
        ),
      ],
      finalAnswer: `Brut: ${rawGB.toFixed(1)} Go | YouTube: ${compressedGB.toFixed(2)} Go`,
      explanation: 'Brut = 24 bits/pixel non compressé. YouTube = H.264 ~4.5 Mbit/s + AAC 128k. Convention décimale.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { width, height, fps, bpp, durationHours, videoBR, audioBR } = instance.params as any
    const rawBytes = videoFileSizeRaw(width, height, bpp, fps, durationHours * 3600)
    const rawGB = rawBytes / 1e9
    const compressedBits = (videoBR * 1e6 + audioBR * 1e3) * durationHours * 3600
    const compressedGB = compressedBits / 8 / 1e9

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const rawCorrect = Math.abs((a.rawGB ?? 0) - rawGB) < 0.1
      const compCorrect = Math.abs((a.compressedGB ?? 0) - compressedGB) < 0.01

      return {
        isCorrect: rawCorrect && compCorrect,
        score: [rawCorrect, compCorrect].filter(Boolean).length / 2,
        feedback: rawCorrect && compCorrect ? 'Parfait !' : `Brut: ${rawGB.toFixed(1)} Go, YouTube: ${compressedGB.toFixed(2)} Go.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 22: SFU-MCU-BW (TD5 Ex3, TD6 Ex4) ---
export const SFU_MCU_BW: GeneratorFamily = {
  id: 'SFU-MCU-BW',
  name: 'Conférence: Bande passante SFU vs MCU',
  tdMapping: ['TD5_Ex3', 'TD6_Ex4'],
  paramSchema: [
    { key: 'participants', label: 'Participants', type: 'number', min: 4, max: 20, step: 1, default: 12 },
    { key: 'videoBR', label: 'Débit vidéo (Mbit/s)', type: 'number', min: 1, max: 5, step: 0.5, default: 2.5 },
    { key: 'audioBR', label: 'Débit audio (kbit/s)', type: 'number', min: 32, max: 128, step: 32, default: 64 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const participants = rng.nextInt(6, 16)
    const videoBR = rng.nextChoice([1.5, 2.5, 3.5])
    const audioBR = 64

    return {
      id: `SFU-MCU-BW-${params.seed}`,
      familyId: 'SFU-MCU-BW',
      seed: params.seed,
      params: { participants, videoBR, audioBR },
      meta: createMeta({
        id: `SFU-MCU-BW-${params.seed}`,
        td: 'TD5',
        num: 3,
        topic: 'SFU vs MCU: bande passante client et serveur',
        formulas: ['Up = V + A', 'Down_SFU = (N-1)×(V+A)', 'SFU_in = N×(V+A)', 'SFU_out = N×(N-1)×(V+A)'],
        type: 'calc',
        difficulty: 3,
        status: 'etudié',
        source: 'TD5 Ex3 / TD6 Ex4',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Montant/client (Mbit/s) ?`, 'numeric', { tolerance: 0.001, unit: 'Mbit/s' }),
        createQuestion('q2', `Descendant/client SFU (Mbit/s) ?`, 'numeric', { tolerance: 0.001, unit: 'Mbit/s' }),
        createQuestion('q3', `Serveur SFU entrant/sortant (Mbit/s) ?`, 'text'),
        createQuestion('q4', `MCU: montant/descendant/client ?`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { participants, videoBR, audioBR } = instance.params as any
    const videoBps = videoBR * 1_000_000
    const audioBps = audioBR * 1_000
    const perClient = videoBps + audioBps
    const up = perClient
    const down = (participants - 1) * perClient
    const sfuIn = participants * perClient
    const sfuOut = participants * (participants - 1) * perClient

    return {
      steps: [
        createStep(
          'Par client',
          'Up = V + A',
          `Up = ${videoBR} + ${audioBR/1000} = ${(videoBR + audioBR/1000).toFixed(3)} Mbit/s`,
          (videoBR + audioBR/1000).toFixed(3),
          'Mbit/s'
        ),
        createStep(
          'Descendant SFU',
          'Down = (N-1) × Up',
          `Down = ${participants - 1} × ${(videoBR + audioBR/1000).toFixed(3)}`,
          (down / 1_000_000).toFixed(3),
          'Mbit/s'
        ),
        createStep(
          'Serveur SFU entrant',
          'In = N × Up',
          `In = ${participants} × ${(videoBR + audioBR/1000).toFixed(3)}`,
          (sfuIn / 1_000_000).toFixed(3),
          'Mbit/s'
        ),
        createStep(
          'Serveur SFU sortant',
          'Out = N × (N-1) × Up',
          `Out = ${participants} × ${participants - 1} × ${(videoBR + audioBR/1000).toFixed(3)}`,
          (sfuOut / 1_000_000).toFixed(3),
          'Mbit/s'
        ),
        createStep(
          'MCU comparaison',
          'MCU: Up = V+A, Down = V+A (1 flux mixé), CPU serveur élevé',
          'Client MCU: Up/Down = 1 flux seulement',
          'MCU: moins bande client, mais CPU serveur',
          ''
        ),
      ],
      finalAnswer: `Up: ${(videoBR + audioBR/1000).toFixed(3)} | Down SFU: ${(down/1e6).toFixed(3)} | SFU In: ${(sfuIn/1e6).toFixed(3)} | SFU Out: ${(sfuOut/1e6).toFixed(3)} | MCU: 1 flux/client (CPU serveur)`,
      explanation: 'SFU relaie tous les flux (bande serveur élevée, CPU faible). MCU mixe (bande client faible, CPU serveur élevé). Choix selon contraintes client/serveur.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { participants, videoBR, audioBR } = instance.params as any
    const perClient = videoBR + audioBR / 1000
    const expectedDown = (participants - 1) * perClient
    const expectedIn = participants * perClient
    const expectedOut = participants * (participants - 1) * perClient

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const upCorrect = Math.abs((a.up ?? 0) - perClient) < 0.001
      const downCorrect = Math.abs((a.down ?? 0) - expectedDown) < 0.001
      const inCorrect = Math.abs((a.in ?? 0) - expectedIn) < 0.001
      const outCorrect = Math.abs((a.out ?? 0) - expectedOut) < 0.001

      return {
        isCorrect: upCorrect && downCorrect && inCorrect && outCorrect,
        score: [upCorrect, downCorrect, inCorrect, outCorrect].filter(Boolean).length / 4,
        feedback: upCorrect && downCorrect && inCorrect && outCorrect ? 'Parfait !' : `Up: ${perClient.toFixed(3)}, Down: ${expectedDown.toFixed(3)}.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 23: ABR-DECISION (TD5 Ex4) ---
export const ABR_DECISION: GeneratorFamily = {
  id: 'ABR-DECISION',
  name: 'DASH: Décisions d\'adaptation de débit',
  tdMapping: ['TD5_Ex4'],
  paramSchema: [
    { key: 'bandwidthProfile', label: 'Profil bande passante (Mbit/s)', type: 'text', default: '5→1→0.3→4' },
    { key: 'renditions', label: 'Rendus disponibles', type: 'text', default: '1080p@3, 720p@1.5, 360p@0.4' },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    return {
      id: `ABR-DECISION-${params.seed}`,
      familyId: 'ABR-DECISION',
      seed: params.seed,
      params: { bandwidthProfile: '5→1→0.3→4', renditions: '1080p@3, 720p@1.5, 360p@0.4' },
      meta: createMeta({
        id: `ABR-DECISION-${params.seed}`,
        td: 'TD5',
        num: 4,
        topic: 'Adaptation DASH sur réseau variable',
        formulas: [],
        type: 'design',
        difficulty: 2,
        status: 'etudié',
        source: 'TD5 Ex4',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Bande passante: 5 → 1 → 0.3 → 4 Mbit/s. Action player ?`, 'text'),
        createQuestion('q2', `Si reste en 1080p @ 0.3 Mbit/s ?`, 'choice', { choices: ['Buffering, freezes, rebuffering', 'Qualité maintenue', 'Passage auto en 720p'] }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    return {
      steps: [
        createStep(
          'Profil réseau',
          '5 → 1 → 0.3 → 4 Mbit/s en 10s',
          'Rendus: 1080p@3M, 720p@1.5M, 360p@0.4M',
          'Analyse seuils',
          ''
        ),
        createStep(
          '5 Mbit/s',
          'Bande passante > 3M → 1080p',
          'Qualité max',
          '1080p',
          ''
        ),
        createStep(
          '1 Mbit/s',
          'Bande passante < 1.5M → 720p',
          'Descente qualité',
          '720p',
          ''
        ),
        createStep(
          '0.3 Mbit/s',
          'Bande passante < 0.4M → 360p',
          'Descente qualité critique',
          '360p',
          ''
        ),
        createStep(
          '4 Mbit/s',
          'Bande passante stable > 3M → 1080p',
          'Remontée qualité',
          '1080p',
          ''
        ),
        createStep(
          'Si reste 1080p à 0.3M',
          'Débit requis (3M) >> disponible (0.3M)',
          'Buffer vide → freeze → rebuffering',
          'Buffering, freezes, rebuffering',
          ''
        ),
      ],
      finalAnswer: `5M→1080p, 1M→720p, 0.3M→360p, 4M→1080p | Si 1080p@0.3M: freeze/rebuffering`,
      explanation: 'ABR (DASH/HLS) mesure bande passante et bascule entre rendus. Marge de sécurité recommandée (ex: basculer avant saturation).',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, string>
      const q1 = a.q1?.includes('1080p') && a.q1?.includes('720p') && a.q1?.includes('360p')
      const q2 = a.q2 === 'Buffering, freezes, rebuffering'

      return {
        isCorrect: q1 && q2,
        score: [q1, q2].filter(Boolean).length / 2,
        feedback: q1 && q2 ? 'Parfait !' : 'Vérifiez les seuils de bascule.',
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 24: E1-DIM (TD6 Ex2) ---
export const E1_DIM: GeneratorFamily = {
  id: 'E1-DIM',
  name: 'Télécom: Dimensionnement E1',
  tdMapping: ['TD6_Ex2'],
  paramSchema: [
    { key: 'subscribers', label: 'Abonnés', type: 'number', min: 1000, max: 10000, step: 100, default: 2000 },
    { key: 'simultaneity', label: 'Taux simultanéité', type: 'number', min: 0.05, max: 0.2, step: 0.01, default: 0.1 },
    { key: 'e1Channels', label: 'Canaux/E1', type: 'number', min: 30, max: 30, step: 1, default: 30 },
    { key: 'transitCapacity', label: 'E1/Transit', type: 'number', min: 10, max: 30, step: 1, default: 20 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const subscribers = rng.nextChoice([1000, 2000, 5000, 8000])
    const simultaneity = rng.nextChoice([0.05, 0.1, 0.15])
    const e1Channels = 30
    const transitCapacity = 20

    return {
      id: `E1-DIM-${params.seed}`,
      familyId: 'E1-DIM',
      seed: params.seed,
      params: { subscribers, simultaneity, e1Channels, transitCapacity },
      meta: createMeta({
        id: `E1-DIM-${params.seed}`,
        td: 'TD6',
        num: 2,
        topic: 'Dimensionnement liaisons E1',
        formulas: ['Appels = Abonnés × Taux', 'E1 = ceil(Appels/30)', 'Transits = ceil(E1/20)'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD6 Ex2',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Nombre d'E1 vers transit ?`, 'numeric', { tolerance: 0, unit: 'E1' }),
        createQuestion('q2', `Nombre de centraux de transit ?`, 'numeric', { tolerance: 0, unit: 'transits' }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { subscribers, simultaneity, e1Channels, transitCapacity } = instance.params as any
    const calls = Math.ceil(subscribers * simultaneity)
    const e1Count = Math.ceil(calls / e1Channels)
    const transits = Math.ceil(e1Count / transitCapacity)

    return {
      steps: [
        createStep(
          'Appels simultanés',
          'Appels = Abonnés × Taux',
          `Appels = ${subscribers} × ${simultaneity} = ${calls}`,
          calls,
          'appels'
        ),
        createStep(
          'E1 nécessaires',
          'E1 = ceil(Appels / Canaux_par_E1)',
          `E1 = ceil(${calls} / ${e1Channels}) = ${e1Count}`,
          e1Count,
          'E1'
        ),
        createStep(
          'Centraux de transit',
          'Transits = ceil(E1 / Capacité_transit)',
          `Transits = ceil(${e1Count} / ${transitCapacity}) = ${transits}`,
          transits,
          'transits'
        ),
      ],
      finalAnswer: `Appels: ${calls} | E1: ${e1Count} | Transits: ${transits}`,
      explanation: 'Dimensionnement hiérarchique: abonnés → local → transit. Arrondi supérieur (ceil) car on ne peut pas avoir de fraction de canal.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { subscribers, simultaneity, e1Channels, transitCapacity } = instance.params as any
    const calls = Math.ceil(subscribers * simultaneity)
    const expectedE1 = Math.ceil(calls / e1Channels)
    const expectedTransits = Math.ceil(expectedE1 / transitCapacity)

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number>
      const e1Correct = (a.e1Count ?? 0) === expectedE1
      const transitCorrect = (a.transits ?? 0) === expectedTransits

      return {
        isCorrect: e1Correct && transitCorrect,
        score: [e1Correct, transitCorrect].filter(Boolean).length / 2,
        feedback: e1Correct && transitCorrect ? 'Parfait !' : `Appels: ${calls}, E1: ${expectedE1}, Transits: ${expectedTransits}.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 25: VOIP-BW (TD6 Ex3) ---
export const VOIP_BW: GeneratorFamily = {
  id: 'VOIP-BW',
  name: 'VoIP: Bande passante avec overhead',
  tdMapping: ['TD6_Ex3'],
  paramSchema: [
    { key: 'calls', label: 'Appels simultanés', type: 'number', min: 10, max: 200, step: 1, default: 50 },
    { key: 'g711BR', label: 'G.711 + overhead (kbit/s)', type: 'number', min: 64, max: 120, step: 1, default: 87.2 },
    { key: 'opusBR', label: 'Opus + overhead (kbit/s)', type: 'number', min: 32, max: 80, step: 1, default: 40 },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const calls = rng.nextChoice([20, 50, 100, 150])
    const g711BR = 87.2
    const opusBR = 40

    return {
      id: `VOIP-BW-${params.seed}`,
      familyId: 'VOIP-BW',
      seed: params.seed,
      params: { calls, g711BR, opusBR },
      meta: createMeta({
        id: `VOIP-BW-${params.seed}`,
        td: 'TD6',
        num: 3,
        topic: 'Comparaison bande passante G.711 vs Opus',
        formulas: ['Bande = N × BR_overhead'],
        type: 'calc',
        difficulty: 2,
        status: 'etudié',
        source: 'TD6 Ex3',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Bande G.711 (Mbit/s) ?`, 'numeric', { tolerance: 0.01, unit: 'Mbit/s' }),
        createQuestion('q2', `Bande Opus (Mbit/s) ?`, 'numeric', { tolerance: 0.01, unit: 'Mbit/s' }),
        createQuestion('q3', `Choix interne vs externe ?`, 'choice', { choices: ['Interne: G.711, Externe: Opus', 'Interne: Opus, Externe: G.711', 'Les deux G.711', 'Les deux Opus'] }),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { calls, g711BR, opusBR } = instance.params as any
    const g711Total = calls * g711BR / 1000
    const opusTotal = calls * opusBR / 1000

    return {
      steps: [
        createStep(
          'Bande G.711',
          'Bande = N × BR_G711',
          `Bande = ${calls} × ${g711BR} = ${calls * g711BR} kbit/s`,
          g711Total.toFixed(2),
          'Mbit/s'
        ),
        createStep(
          'Bande Opus',
          'Bande = N × BR_Opus',
          `Bande = ${calls} × ${opusBR} = ${calls * opusBR} kbit/s`,
          opusTotal.toFixed(2),
          'Mbit/s'
        ),
        createStep(
          'Choix',
          'Interne = qualité max (G.711), Externe = économie bande (Opus)',
          `G.711: ${g711Total.toFixed(2)} Mbit/s | Opus: ${opusTotal.toFixed(2)} Mbit/s`,
          'Interne: G.711, Externe: Opus',
          ''
        ),
      ],
      finalAnswer: `G.711: ${g711Total.toFixed(2)} Mbit/s | Opus: ${opusTotal.toFixed(2)} Mbit/s | Interne: G.711, Externe: Opus`,
      explanation: 'G.711 = 64k + overhead ≈ 87.2k. Opus = 32k + overhead ≈ 40k. Opus économie ~54% bande pour qualité équivalente.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    const { calls, g711BR, opusBR } = instance.params as any
    const expectedG711 = calls * g711BR / 1000
    const expectedOpus = calls * opusBR / 1000

    if (typeof answer === 'object' && answer !== null) {
      const a = answer as Record<string, number | string>
      const g711Correct = Math.abs((a.g711 ?? 0) - expectedG711) < 0.01
      const opusCorrect = Math.abs((a.opus ?? 0) - expectedOpus) < 0.01
      const choiceCorrect = a.choice === 'Interne: G.711, Externe: Opus'

      return {
        isCorrect: g711Correct && opusCorrect && choiceCorrect,
        score: [g711Correct, opusCorrect, choiceCorrect].filter(Boolean).length / 3,
        feedback: g711Correct && opusCorrect && choiceCorrect ? 'Parfait !' : `G.711: ${expectedG711.toFixed(2)}, Opus: ${expectedOpus.toFixed(2)}.`,
      }
    }
    return { isCorrect: false, score: 0, feedback: 'Format invalide.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// --- Family 26: DVI-CONCEPT (TD6 Ex5-7) ---
export const DVI_CONCEPT: GeneratorFamily = {
  id: 'DVI-CONCEPT',
  name: 'DVI & Entrelacé: Concepts',
  tdMapping: ['TD6_Ex5', 'TD6_Ex6', 'TD6_Ex7'],
  paramSchema: [
    { key: 'variant', label: 'Question', type: 'select', default: 'DVI_types', options: [
      { value: 'DVI_types', label: 'DVI-D vs DVI-A vs DVI-I' },
      { value: 'single_dual', label: 'Single vs Dual Link' },
      { value: 'max_single', label: 'Résolution max Single Link' },
      { value: 'dvi_d_vga', label: 'DVI-D → VGA adaptateur passif' },
      { value: 'interlaced', label: '1080i60 vs 1080p30' },
    ] },
  ],
  generate: (params: GeneratorParams): ExerciseInstance => {
    const rng = new SeededRNG(params.seed)
    const variant = rng.nextChoice([
      'DVI_types', 'single_dual', 'max_single', 'dvi_d_vga', 'interlaced'
    ])

    return {
      id: `DVI-CONCEPT-${params.seed}`,
      familyId: 'DVI-CONCEPT',
      seed: params.seed,
      params: { variant },
      meta: createMeta({
        id: `DVI-CONCEPT-${params.seed}`,
        td: 'TD6',
        num: 5,
        topic: `DVI/Entrelacé: ${variant}`,
        formulas: [],
        type: 'concept',
        difficulty: 2,
        status: 'etudié',
        source: 'TD6 Ex5-7',
        priority: 'H',
      }),
      questions: [
        createQuestion('q1', `Réponse selon le variant: ${variant}`, 'text'),
      ],
    }
  },
  solve: (instance: ExerciseInstance): ExerciseSolution => {
    const { variant } = instance.params as any
    const answers: Record<string, string> = {
      'DVI_types': 'DVI-D: numérique seul | DVI-A: analogique seul | DVI-I: les deux (numérique + analogique)',
      'single_dual': 'Single Link: 1920×1200@60Hz | Dual Link: 2560×1600@60Hz',
      'max_single': '1920×1200@60Hz',
      'dvi_d_vga': 'Impossible: DVI-D n\'a pas de signal analogique. Faut DVI-I ou convertisseur actif.',
      'interlaced': 'Avantage 2000: économie bande passante même fluidité (50/60 champs/s). Aujourd\'hui progressif: meilleure qualité, pas artefacts peigne, écrans progressifs, compression favorise progressif.',
    }

    return {
      steps: [
        createStep(
          'Réponse',
          `Variant: ${variant}`,
          answers[variant] || 'Non défini',
          answers[variant] || 'N/A',
          ''
        ),
      ],
      finalAnswer: answers[variant] || 'Variant inconnu',
      explanation: 'Concepts de base DVI et vidéo entrelacée. DVI-D n\'a pas d\'analogique → adaptateur passif ne fonctionne pas.',
      confidence: 'high',
    }
  },
  validateAnswer: (instance: ExerciseInstance, answer: unknown): AnswerValidation => {
    if (typeof answer === 'string' && answer.length > 5) {
      return { isCorrect: true, score: 1, feedback: 'Réponse enregistrée (validation manuelle).' }
    }
    return { isCorrect: false, score: 0, feedback: 'Réponse textuelle attendue.' }
  },
  classifyError: () => ({ type: 'autre', message: '', description: getErrorDescription('autre') }),
}

// ============================================================================
// Registry
// ============================================================================

export const GENERATOR_FAMILIES: GeneratorFamily[] = [
  AUD_SIZE_DEBIT,
  AUD_INVERSE_FE,
  AUD_INVERSE_DUREE,
  AUD_BITS,
  AUD_CBR_COMBOS,
  AUD_VBR_VS_CBR,
  SNR_FAMILY,
  NYQUIST_FAMILY,
  HUFFMAN_PROBS,
  HUFFMAN_MATRIX,
  VID_RAW,
  VID_YC_BPP,
  GOP_SIZE,
  RES_TABLE,
  PTS_DTS_ORDER,
  TOPOLOGY_FAMILY,
  BUFFER_DRAIN,
  RTP_TIMESTAMP,
  JITTER_BUFFER,
  LATENCY_BUDGET,
  FILM_SIZE,
  SFU_MCU_BW,
  ABR_DECISION,
  E1_DIM,
  VOIP_BW,
  DVI_CONCEPT,
]

export function getFamilyById(id: string): GeneratorFamily | undefined {
  return GENERATOR_FAMILIES.find(f => f.id === id)
}

export function getFamiliesByTD(td: string): GeneratorFamily[] {
  return GENERATOR_FAMILIES.filter(f => f.tdMapping.some(m => m.startsWith(td)))
}