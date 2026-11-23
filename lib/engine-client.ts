/**
 * Client-safe engine wrapper
 * Re-exports engine functions that are safe to use in browser/client components
 */

export {
  engine,
  createEngine,
  randomExerciseFromTD,
  generateExam,
  runGoldenTests,
} from '@/engine'

export type {
  Engine,
  ExerciseInstance,
  ExerciseSolution,
  GeneratorParams,
  AnswerValidation,
  ErrorClassification,
} from '@/engine'
