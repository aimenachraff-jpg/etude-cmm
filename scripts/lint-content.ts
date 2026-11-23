#!/usr/bin/env tsx
/**
 * Content linting script
 * Checks for style consistency, naming conventions, and best practices.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface LintIssue {
  file: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'info'
  rule: string
  message: string
}

function lintJsonFile(filePath: string): LintIssue[] {
  const issues: LintIssue[] = []
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  try {
    JSON.parse(content)
  } catch (e) {
    issues.push({
      file: filePath,
      line: 0,
      column: 0,
      severity: 'error',
      rule: 'valid-json',
      message: `Invalid JSON: ${e}`,
    })
    return issues
  }

  // Check for trailing commas
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.endsWith(',}') || trimmed.endsWith(',]')) {
      issues.push({
        file: filePath,
        line: i + 1,
        column: line.length,
        severity: 'warning',
        rule: 'trailing-comma',
        message: 'Trailing comma before closing brace/bracket',
      })
    }
  })

  // Check for consistent indentation (2 spaces)
  lines.forEach((line, i) => {
    const match = line.match(/^(\s+)/)
    if (match && match[1].length % 2 !== 0) {
      issues.push({
        file: filePath,
        line: i + 1,
        column: 1,
        severity: 'warning',
        rule: 'indentation',
        message: 'Indentation should be multiple of 2 spaces',
      })
    }
  })

  // Check for trailing whitespace
  lines.forEach((line, i) => {
    if (line !== line.trimEnd()) {
      issues.push({
        file: filePath,
        line: i + 1,
        column: line.length,
        severity: 'warning',
        rule: 'trailing-whitespace',
        message: 'Trailing whitespace',
      })
    }
  })

  // Check for max line length
  lines.forEach((line, i) => {
    if (line.length > 120) {
      issues.push({
        file: filePath,
        line: i + 1,
        column: 120,
        severity: 'warning',
        rule: 'line-length',
        message: `Line exceeds 120 characters (${line.length})`,
      })
    }
  })

  return issues
}

function lintDirectory(dirPath: string, extension = '.json'): LintIssue[] {
  const issues: LintIssue[] = []

  if (!statSync(dirPath).isDirectory()) return issues

  const files = readdirSync(dirPath).filter(f => extname(f) === extension)

  for (const file of files) {
    const filePath = join(dirPath, file)
    issues.push(...lintJsonFile(filePath))
  }

  return issues
}

function main() {
  console.log('🔍 Linting content files...\n')

  const contentDir = join(process.cwd(), 'content')
  const allIssues: LintIssue[] = []

  // Lint course-map.json
  const courseMapPath = join(contentDir, 'course-map.json')
  if (statSync(courseMapPath).isFile()) {
    allIssues.push(...lintJsonFile(courseMapPath))
  }

  // Lint TD content files
  const tdsDir = join(contentDir, 'tds')
  if (statSync(tdsDir).isDirectory()) {
    allIssues.push(...lintDirectory(tdsDir))
  }

  // Print results
  const errors = allIssues.filter(i => i.severity === 'error')
  const warnings = allIssues.filter(i => i.severity === 'warning')
  const infos = allIssues.filter(i => i.severity === 'info')

  if (allIssues.length === 0) {
    console.log('✅ No lint issues found!')
    return
  }

  for (const issue of allIssues) {
    const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'
    console.log(`${icon} ${issue.file}:${issue.line}:${issue.column} [${issue.rule}] ${issue.message}`)
  }

  console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} infos`)

  if (errors.length > 0) {
    console.log('\n❌ Lint FAILED')
    process.exit(1)
  } else {
    console.log('\n✅ Lint PASSED (warnings only)')
  }
}

main()