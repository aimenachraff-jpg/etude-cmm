#!/usr/bin/env tsx
/**
 * Content validation script
 * Validates all content files for required fields, consistency, and correctness.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { z } from 'zod'

// ============================================================================
// Schemas - Updated to match course-map.json structure (metadata only)
// ============================================================================

const ExerciseQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  type: z.enum(['numeric', 'text', 'choice', 'ordering']),
  tolerance: z.number().optional(),
  unit: z.string().optional(),
  choices: z.array(z.string()).optional(),
  correctIndex: z.number().optional(),
})

const SolutionStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  formula: z.string().optional(),
  substitution: z.string().optional(),
  result: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  note: z.string().optional(),
})

const ExerciseSolutionSchema = z.object({
  steps: z.array(SolutionStepSchema),
  finalAnswer: z.string().min(1),
  explanation: z.string().min(1),
  confidence: z.enum(['high', 'medium', 'low']),
  conventionNote: z.string().optional(),
})

const ExerciseMetaSchema = z.object({
  id: z.string(),
  num: z.number().int().positive(),
  topic: z.string().min(1),
  formulas: z.array(z.string()),
  type: z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
  source: z.string().min(1),
  priority: z.enum(['H', 'M', 'L']),
  solutionStatus: z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
  confidence: z.enum(['high', 'medium', 'low']),
  convention: z.enum(['decimal', 'binary']).optional(),
  needsTeacherVerification: z.boolean().optional(),
  verificationNote: z.string().optional(),
  approximationNote: z.string().optional(),
  golden: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

const ExerciseSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  num: z.union([z.number().int().positive(), z.string()]),
  topic: z.string(),
  formulas: z.array(z.string()),
  type: z.string(),
  difficulty: z.union([z.number(), z.string()]),
  status: z.string(),
  source: z.string(),
  priority: z.string(),
  solutionStatus: z.string().optional(),
  solution_status: z.string().optional(),
  confidence: z.string(),
  convention: z.string().optional(),
  needsTeacherVerification: z.boolean().optional(),
  verificationNote: z.string().optional(),
  approximationNote: z.string().optional(),
  golden: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

const TDSchema = z.object({
  id: z.string(),
  title: z.string(),
  exercises: z.array(ExerciseSchema),
})

const CourseMapSchema = z.object({
  version: z.string(),
  source: z.string(),
  source_note: z.string().optional(),
  solution_policy: z.string().optional(),
  golden_tests_note: z.string().optional(),
  tds: z.array(TDSchema),
  course_chapters: z.object({
    Ch1_Representation: z.object({
      topics: z.array(z.object({
        topic: z.string(),
        status: z.string(),
        note: z.string().optional(),
      })),
    }),
    Ch2_Transmission: z.object({
      topics: z.array(z.object({
        topic: z.string(),
        status: z.string(),
      })),
    }),
  }),
  unit_conventions: z.record(z.string()),
  content_defects: z.array(z.object({
    id: z.string(),
    defect: z.string(),
    resolution: z.string(),
    reference: z.string(),
  })),
  generator_families: z.number(),
  flashcard_target: z.number(),
  quiz_targets: z.object({
    QCM: z.number(),
    conceptuel: z.number(),
    design: z.number(),
    calc_families: z.number(),
  }),
  statistics: z.object({}).passthrough(),
})

// Full exercise content schema (for future content/tds/*.json files)
const ExerciseContentSchema = z.object({
  id: z.string(),
  td: z.string(),
  num: z.number().int().positive(),
  topic: z.string().min(1),
  formulas: z.array(z.string()),
  type: z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
  source: z.string().min(1),
  priority: z.enum(['H', 'M', 'L']),
  solutionStatus: z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
  confidence: z.enum(['high', 'medium', 'low']),
  convention: z.enum(['decimal', 'binary']).optional(),
  needsTeacherVerification: z.boolean().optional(),
  verificationNote: z.string().optional(),
  approximationNote: z.string().optional(),
  enonce: z.string().min(1),
  questions: z.array(ExerciseQuestionSchema).min(1),
  solution: ExerciseSolutionSchema,
})

// ============================================================================
// Validation Functions
// ============================================================================

interface ValidationResult {
  file: string
  valid: boolean
  errors: Array<{ path: string; message: string; code: string }>
  warnings: Array<{ path: string; message: string; code: string }>
}

function validateFile(filePath: string, schema: z.ZodSchema): ValidationResult {
  const content = readFileSync(filePath, 'utf-8')
  let data: unknown

  try {
    data = JSON.parse(content)
  } catch (e) {
    return {
      file: filePath,
      valid: false,
      errors: [{ path: filePath, message: `Invalid JSON: ${e}`, code: 'INVALID_JSON' }],
      warnings: [],
    }
  }

  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      file: filePath,
      valid: false,
      errors: result.error.issues.map(issue => ({
        path: `${filePath}:${issue.path.join('.')}`,
        message: issue.message,
        code: issue.code,
      })),
      warnings: [],
    }
  }

  // Additional custom validations
  const warnings: Array<{ path: string; message: string; code: string }> = []

  if (filePath.includes('course-map.json')) {
    const courseMap = data as any

    // Check for duplicate exercise IDs
    const allIds = new Set<string>()
    const duplicates: string[] = []
    for (const td of courseMap.tds) {
      for (const ex of td.exercises) {
        if (allIds.has(ex.id)) {
          duplicates.push(ex.id)
        }
        allIds.add(ex.id)
      }
    }
    if (duplicates.length > 0) {
      warnings.push({ path: filePath, message: `Duplicate exercise IDs: ${duplicates.join(', ')}`, code: 'DUPLICATE_IDS' })
    }

    // Check all exercises have source field
    for (const td of courseMap.tds) {
      for (const ex of td.exercises) {
        if (!ex.source || ex.source.trim() === '') {
          warnings.push({ path: filePath, message: `Exercise ${ex.id} missing source`, code: 'MISSING_SOURCE' })
        }
        if (!ex.solutionStatus) {
          warnings.push({ path: filePath, message: `Exercise ${ex.id} missing solutionStatus`, code: 'MISSING_SOLUTION_STATUS' })
        }
        if (!ex.confidence) {
          warnings.push({ path: filePath, message: `Exercise ${ex.id} missing confidence`, code: 'MISSING_CONFIDENCE' })
        }
      }
    }
  }

  return {
    file: filePath,
    valid: true,
    errors: [],
    warnings,
  }
}

function validateDirectory(dirPath: string, schema: z.ZodSchema, extension = '.json'): ValidationResult[] {
  const results: ValidationResult[] = []

  if (!statSync(dirPath).isDirectory()) {
    return [{ file: dirPath, valid: false, errors: [{ path: dirPath, message: 'Not a directory', code: 'NOT_DIR' }], warnings: [] }]
  }

  const files = readdirSync(dirPath).filter(f => extname(f) === extension)

  for (const file of files) {
    const filePath = join(dirPath, file)
    const result = validateFile(filePath, schema)
    results.push(result)
  }

  return results
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🔍 Validating content files...\n')

  const contentDir = join(process.cwd(), 'content')
  const results: ValidationResult[] = []

  // Validate course-map.json
  const courseMapPath = join(contentDir, 'course-map.json')
  if (statSync(courseMapPath).isFile()) {
    results.push(validateFile(courseMapPath, CourseMapSchema))
  }

  // Validate TD content files (if any) - using ExerciseContentSchema
  const tdsDir = join(contentDir, 'tds')
  if (statSync(tdsDir).isDirectory()) {
    results.push(...validateDirectory(tdsDir, ExerciseContentSchema))
  }

  // Print results
  let totalErrors = 0
  let totalWarnings = 0
  let validFiles = 0
  let invalidFiles = 0

  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.file}`)
      validFiles++
    } else {
      console.log(`❌ ${result.file}`)
      invalidFiles++
    }

    for (const error of result.errors) {
      console.log(`  🔴 ERROR: ${error.path} - ${error.message} [${error.code}]`)
      totalErrors++
    }

    for (const warning of result.warnings) {
      console.log(`  🟡 WARN: ${warning.path} - ${warning.message} [${warning.code}]`)
      totalWarnings++
    }
  }

  console.log('\n📊 Summary:')
  console.log(`  Files: ${validFiles} valid, ${invalidFiles} invalid`)
  console.log(`  Errors: ${totalErrors}`)
  console.log(`  Warnings: ${totalWarnings}`)

  if (totalErrors > 0) {
    console.log('\n❌ Validation FAILED')
    process.exit(1)
  } else {
    console.log('\n✅ Validation PASSED')
    if (totalWarnings > 0) {
      console.log(`⚠️  ${totalWarnings} warnings - review recommended`)
    }
  }
}

main().catch(console.error)