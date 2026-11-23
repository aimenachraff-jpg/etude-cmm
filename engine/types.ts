/**
 * Core engine types for the Étude CMM calculation/generator engine.
 * Pure TypeScript, zero UI dependencies.
 */

// ============================================================================
// Unit Convention System
// ============================================================================

export type UnitConvention = 'decimal' | 'binary'

export interface UnitConventionResult {
  decimal: number
  binary: number
  decimalFormatted: string
  binaryFormatted: string
  convention: UnitConvention
}

// ============================================================================
// Exercise Metadata
// ============================================================================

export type ExerciseType = 'calc' | 'concept' | 'design' | 'qcm' | 'lab'
export type Difficulty = 1 | 2 | 3
export type Status = 'etudié' | 'hors-cours' | 'needs-teacher-verification'
export type SolutionStatus = 'independently-derived' | 'suggested-answer' | 'needs-teacher-verification' | 'reference-implementation'
export type Confidence = 'high' | 'medium' | 'low'

export interface ExerciseMeta {
  id: string
  td: string
  num: number
  topic: string
  formulas: string[]
  type: ExerciseType
  difficulty: Difficulty
  status: Status
  source: string
  priority: 'H' | 'M' | 'L'
  solutionStatus: SolutionStatus
  confidence: Confidence
  convention?: UnitConvention
  needsTeacherVerification?: boolean
  verificationNote?: string
  approximationNote?: string
}

export interface ExerciseContent extends ExerciseMeta {
  enonce: string
  questions: ExerciseQuestion[]
  solution: ExerciseSolution
}

export interface ExerciseQuestion {
  id: string
  text: string
  type: 'numeric' | 'text' | 'choice' | 'ordering'
  tolerance?: number
  unit?: string
  choices?: string[]
  correctIndex?: number
}

export interface ExerciseSolution {
  steps: SolutionStep[]
  finalAnswer: string
  explanation: string
  confidence: Confidence
  conventionNote?: string
}

export interface SolutionStep {
  id?: string
  description: string
  formula?: string
  substitution?: string
  result: string | number
  unit?: string
  note?: string
}

// ============================================================================
// Generator Engine Types
// ============================================================================

export interface GeneratorParams {
  seed: number
  convention: UnitConvention
  [key: string]: unknown
}

export interface GeneratorFamily {
  id: string
  name: string
  tdMapping: string[]
  paramSchema: ParamSchema[]
  generate: (params: GeneratorParams) => ExerciseInstance
  solve: (instance: ExerciseInstance) => ExerciseSolution
  validateAnswer: (instance: ExerciseInstance, answer: unknown) => AnswerValidation
  classifyError: (instance: ExerciseInstance, answer: unknown) => ErrorClassification
}

export interface ParamSchema {
  key: string
  label: string
  type: 'number' | 'select' | 'range' | 'text'
  min?: number
  max?: number
  step?: number
  default: number | string
  options?: { value: string | number; label: string }[]
}

export interface ExerciseInstance {
  id: string
  familyId: string
  seed: number
  params: Record<string, unknown>
  questions: ExerciseQuestion[]
  meta: ExerciseMeta
}

export interface AnswerValidation {
  isCorrect: boolean
  score: number // 0-1
  partialScores?: Record<string, number>
  feedback: string
  errorClassification?: ErrorClassification
}

export interface ErrorClassification {
  type: ErrorType
  message: string
  description: string
}

export type ErrorType =
  | 'erreur_unité'
  | 'erreur_conceptuelle'
  | 'oubli_x2_stereo'
  | 'oubli_div8'
  | 'confusion_1000_1024'
  | 'confusion_min_sec'
  | 'arrondi'
  | 'nyquist_oublie_2x'
  | 'gop_compte_faux'
  | 'pts_dts_confusion'
  | 'autre'

// ============================================================================
// Quiz & Exam Types
// ============================================================================

export interface QuizQuestion {
  id: string
  type: 'qcm' | 'numeric' | 'concept' | 'design' | 'ordering'
  category: string
  difficulty: Difficulty
  question: string
  choices?: string[]
  correctIndex?: number
  tolerance?: number
  unit?: string
  explanation: string
  source: string
  status: Status
  points: number
  negativePoints: number
}

export interface ExamConfig {
  durationMinutes: number
  questionCount: number
  tdScope: string[]
  difficultyMix: Record<Difficulty, number>
  typeMix: Record<string, number>
  allowPause: boolean
  barème: { correct: number; incorrect: number; unanswered: number }
}

export interface ExamAttempt {
  id: string
  config: ExamConfig
  seed: number
  questions: QuizQuestion[]
  answers: Record<string, unknown>
  startTime: number
  endTime?: number
  score?: number
  breakdown: SkillBreakdown
}

export interface SkillBreakdown {
  'audio-numerisation': number
  'audio-taille-debit': number
  'image-huffman': number
  'video-gop': number
  'transport-pts-dts': number
  'qos-latence-gigue': number
  'conference-sfu-mcu': number
  'telecom-e1-dvi': number
}

// ============================================================================
// Flashcard / SRS Types
// ============================================================================

export interface Flashcard {
  id: string
  front: string
  back: string
  tags: string[]
  category: 'formula' | 'definition' | 'comparison' | 'trap' | 'confusion-pair'
  source: string
  status: Status
}

export interface SRSState {
  cardId: string
  easeFactor: number
  interval: number // days
  repetitions: number
  nextReview: number // timestamp
  lastReviewed: number
  grade: 0 | 1 | 2 | 3 | 4 | 5 // SM-2 grade
}

export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5

// ============================================================================
// Progress & User Types
// ============================================================================

export interface UserProgress {
  userId: string
  displayName: string
  testDate?: number
  examHistory: ExamAttempt[]
  srsStates: Record<string, SRSState>
  errorProfile: Record<ErrorType, number>
  skillReadiness: Record<string, number>
  streak: number
  lastActive: number
  settings: UserSettings
}

export interface UserSettings {
  unitConvention: UnitConvention
  theme: 'dark' | 'light' | 'auto'
  barème: { correct: number; incorrect: number; unanswered: number }
  examDefaults: Partial<ExamConfig>
  notifications: boolean
  reducedMotion: boolean
}

// ============================================================================
// Content Validation
// ============================================================================

export interface ContentValidationResult {
  valid: boolean
  errors: ContentValidationError[]
  warnings: ContentValidationWarning[]
}

export interface ContentValidationError {
  path: string
  message: string
  code: string
}

export interface ContentValidationWarning {
  path: string
  message: string
  code: string
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}