#!/usr/bin/env tsx
"use strict";
/**
 * Content validation script
 * Validates all content files for required fields, consistency, and correctness.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const zod_1 = require("zod");
// ============================================================================
// Schemas - Updated to match course-map.json structure (metadata only)
// ============================================================================
const ExerciseQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string().min(1),
    type: zod_1.z.enum(['numeric', 'text', 'choice', 'ordering']),
    tolerance: zod_1.z.number().optional(),
    unit: zod_1.z.string().optional(),
    choices: zod_1.z.array(zod_1.z.string()).optional(),
    correctIndex: zod_1.z.number().optional(),
});
const SolutionStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    formula: zod_1.z.string().optional(),
    substitution: zod_1.z.string().optional(),
    result: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    unit: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
});
const ExerciseSolutionSchema = zod_1.z.object({
    steps: zod_1.z.array(SolutionStepSchema),
    finalAnswer: zod_1.z.string().min(1),
    explanation: zod_1.z.string().min(1),
    confidence: zod_1.z.enum(['high', 'medium', 'low']),
    conventionNote: zod_1.z.string().optional(),
});
const ExerciseMetaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    num: zod_1.z.number().int().positive(),
    topic: zod_1.z.string().min(1),
    formulas: zod_1.z.array(zod_1.z.string()),
    type: zod_1.z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
    difficulty: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
    status: zod_1.z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
    source: zod_1.z.string().min(1),
    priority: zod_1.z.enum(['H', 'M', 'L']),
    solutionStatus: zod_1.z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
    confidence: zod_1.z.enum(['high', 'medium', 'low']),
    convention: zod_1.z.enum(['decimal', 'binary']).optional(),
    needsTeacherVerification: zod_1.z.boolean().optional(),
    verificationNote: zod_1.z.string().optional(),
    approximationNote: zod_1.z.string().optional(),
    golden: zod_1.z.record(zod_1.z.unknown()).optional(),
    notes: zod_1.z.string().optional(),
});
const TDSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    exercises: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        num: zod_1.z.number().int().positive(),
        topic: zod_1.z.string().min(1),
        formulas: zod_1.z.array(zod_1.z.string()),
        type: zod_1.z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
        difficulty: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
        status: zod_1.z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
        source: zod_1.z.string().min(1),
        priority: zod_1.z.enum(['H', 'M', 'L']),
        solutionStatus: zod_1.z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
        confidence: zod_1.z.enum(['high', 'medium', 'low']),
        convention: zod_1.z.enum(['decimal', 'binary']).optional(),
        needsTeacherVerification: zod_1.z.boolean().optional(),
        verificationNote: zod_1.z.string().optional(),
        approximationNote: zod_1.z.string().optional(),
        golden: zod_1.z.record(zod_1.z.unknown()).optional(),
        notes: zod_1.z.string().optional(),
    })),
});
const CourseMapSchema = zod_1.z.object({
    version: zod_1.z.string(),
    source: zod_1.z.string(),
    source_note: zod_1.z.string().optional(),
    solution_policy: zod_1.z.string().optional(),
    golden_tests_note: zod_1.z.string().optional(),
    tds: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        exercises: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            num: zod_1.z.number().int().positive(),
            topic: zod_1.z.string().min(1),
            formulas: zod_1.z.array(zod_1.z.string()),
            type: zod_1.z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
            difficulty: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
            status: zod_1.z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
            source: zod_1.z.string().min(1),
            priority: zod_1.z.enum(['H', 'M', 'L']),
            solutionStatus: zod_1.z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
            confidence: zod_1.z.enum(['high', 'medium', 'low']),
            convention: zod_1.z.enum(['decimal', 'binary']).optional(),
            needsTeacherVerification: zod_1.z.boolean().optional(),
            verificationNote: zod_1.z.string().optional(),
            approximationNote: zod_1.z.string().optional(),
            golden: zod_1.z.record(zod_1.z.unknown()).optional(),
            notes: zod_1.z.string().optional(),
        })),
    }), course_chapters, zod_1.z.object({
        Ch1_Representation: zod_1.z.object({
            topics: zod_1.z.array(zod_1.z.object({
                topic: zod_1.z.string(),
                status: zod_1.z.string(),
                note: zod_1.z.string().optional(),
            })),
        }),
        Ch2_Transmission: zod_1.z.object({
            topics: zod_1.z.array(zod_1.z.object({
                topic: zod_1.z.string(),
                status: zod_1.z.string(),
            })),
        }),
    }), unit_conventions, zod_1.z.record(zod_1.z.string()), content_defects, zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        defect: zod_1.z.string(),
        resolution: zod_1.z.string(),
        reference: zod_1.z.string(),
    })), generator_families, zod_1.z.number(), flashcard_target, zod_1.z.number(), quiz_targets, zod_1.z.object({
        QCM: zod_1.z.number(),
        conceptuel: zod_1.z.number(),
        design: zod_1.z.number(),
        calc_families: zod_1.z.number(),
    }), statistics, zod_1.z.object({}).passthrough())
});
// Full exercise content schema (for future content/tds/*.json files)
const ExerciseQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string().min(1),
    type: zod_1.z.enum(['numeric', 'text', 'choice', 'ordering']),
    tolerance: zod_1.z.number().optional(),
    unit: zod_1.z.string().optional(),
    choices: zod_1.z.array(zod_1.z.string()).optional(),
    correctIndex: zod_1.z.number().optional(),
});
const SolutionStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    formula: zod_1.z.string().optional(),
    substitution: zod_1.z.string().optional(),
    result: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    unit: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
});
const ExerciseSolutionSchema = zod_1.z.object({
    steps: zod_1.z.array(SolutionStepSchema),
    finalAnswer: zod_1.z.string().min(1),
    explanation: zod_1.z.string().min(1),
    confidence: zod_1.z.enum(['high', 'medium', 'low']),
    conventionNote: zod_1.z.string().optional(),
});
const ExerciseContentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    td: zod_1.z.string(),
    num: zod_1.z.number().int().positive(),
    topic: zod_1.z.string().min(1),
    formulas: zod_1.z.array(zod_1.z.string()),
    type: zod_1.z.enum(['calc', 'concept', 'design', 'qcm', 'lab']),
    difficulty: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
    status: zod_1.z.enum(['etudié', 'hors-cours', 'needs-teacher-verification']),
    source: zod_1.z.string().min(1),
    priority: zod_1.z.enum(['H', 'M', 'L']),
    solutionStatus: zod_1.z.enum(['independently-derived', 'suggested-answer', 'needs-teacher-verification', 'reference-implementation']),
    confidence: zod_1.z.enum(['high', 'medium', 'low']),
    convention: zod_1.z.enum(['decimal', 'binary']).optional(),
    needsTeacherVerification: zod_1.z.boolean().optional(),
    verificationNote: zod_1.z.string().optional(),
    approximationNote: zod_1.z.string().optional(),
    enonce: zod_1.z.string().min(1),
    questions: zod_1.z.array(ExerciseQuestionSchema).min(1),
    solution: ExerciseSolutionSchema,
});
function validateFile(filePath, schema) {
    const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    }
    catch (e) {
        return {
            file: filePath,
            valid: false,
            errors: [{ path: filePath, message: `Invalid JSON: ${e}`, code: 'INVALID_JSON' }],
            warnings: [],
        };
    }
    const result = schema.safeParse(data);
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
        };
    }
    // Additional custom validations
    const warnings = [];
    if (filePath.includes('course-map.json')) {
        const courseMap = data;
        // Check for duplicate exercise IDs
        const allIds = new Set();
        const duplicates = [];
        for (const td of courseMap.tds) {
            for (const ex of td.exercises) {
                if (allIds.has(ex.id)) {
                    duplicates.push(ex.id);
                }
                allIds.add(ex.id);
            }
        }
        if (duplicates.length > 0) {
            warnings.push({ path: filePath, message: `Duplicate exercise IDs: ${duplicates.join(', ')}`, code: 'DUPLICATE_IDS' });
        }
        // Check all exercises have source field
        for (const td of courseMap.tds) {
            for (const ex of td.exercises) {
                if (!ex.source || ex.source.trim() === '') {
                    warnings.push({ path: filePath, message: `Exercise ${ex.id} missing source`, code: 'MISSING_SOURCE' });
                }
                if (!ex.solutionStatus) {
                    warnings.push({ path: filePath, message: `Exercise ${ex.id} missing solutionStatus`, code: 'MISSING_SOLUTION_STATUS' });
                }
                if (!ex.confidence) {
                    warnings.push({ path: filePath, message: `Exercise ${ex.id} missing confidence`, code: 'MISSING_CONFIDENCE' });
                }
            }
        }
    }
    return {
        file: filePath,
        valid: true,
        errors: [],
        warnings,
    };
}
function validateDirectory(dirPath, schema, extension = '.json') {
    const results = [];
    if (!(0, fs_1.statSync)(dirPath).isDirectory()) {
        return [{ file: dirPath, valid: false, errors: [{ path: dirPath, message: 'Not a directory', code: 'NOT_DIR' }], warnings: [] }];
    }
    const files = (0, fs_1.readdirSync)(dirPath).filter(f => (0, path_1.extname)(f) === extension);
    for (const file of files) {
        const filePath = (0, path_1.join)(dirPath, file);
        const result = validateFile(filePath, schema);
        results.push(result);
    }
    return results;
}
// ============================================================================
// Main
// ============================================================================
async function main() {
    console.log('🔍 Validating content files...\n');
    const contentDir = (0, path_1.join)(process.cwd(), 'content');
    const results = [];
    // Validate course-map.json
    const courseMapPath = (0, path_1.join)(contentDir, 'course-map.json');
    if ((0, fs_1.statSync)(courseMapPath).isFile()) {
        results.push(validateFile(courseMapPath, CourseMapSchema));
    }
    // Validate TD content files (if any) - using ExerciseContentSchema
    const tdsDir = (0, path_1.join)(contentDir, 'tds');
    if ((0, fs_1.statSync)(tdsDir).isDirectory()) {
        results.push(...validateDirectory(tdsDir, ExerciseContentSchema));
    }
    // Print results
    let totalErrors = 0;
    let totalWarnings = 0;
    let validFiles = 0;
    let invalidFiles = 0;
    for (const result of results) {
        if (result.valid) {
            console.log(`✅ ${result.file}`);
            validFiles++;
        }
        else {
            console.log(`❌ ${result.file}`);
            invalidFiles++;
        }
        for (const error of result.errors) {
            console.log(`  🔴 ERROR: ${error.path} - ${error.message} [${error.code}]`);
            totalErrors++;
        }
        for (const warning of result.warnings) {
            console.log(`  🟡 WARN: ${warning.path} - ${warning.message} [${warning.code}]`);
            totalWarnings++;
        }
    }
    console.log('\n📊 Summary:');
    console.log(`  Files: ${validFiles} valid, ${invalidFiles} invalid`);
    console.log(`  Errors: ${totalErrors}`);
    console.log(`  Warnings: ${totalWarnings}`);
    if (totalErrors > 0) {
        console.log('\n❌ Validation FAILED');
        process.exit(1);
    }
    else {
        console.log('\n✅ Validation PASSED');
        if (totalWarnings > 0) {
            console.log(`⚠️  ${totalWarnings} warnings - review recommended`);
        }
    }
}
main().catch(console.error);
