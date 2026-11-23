#!/usr/bin/env tsx
/**
 * Test script for the engine's golden tests
 */

import { runGoldenTests } from '../engine/index.ts'

async function main() {
  console.log('🧪 Running engine golden tests...\n')
  const results = await runGoldenTests()
  
  console.log(`\n📊 Results: ${results.passed} passed, ${results.failed} failed`)
  
  for (const r of results.results) {
    if (!r.passed) {
      console.log(`❌ FAIL: ${r.family} - ${r.test}`)
      console.log(`   Expected: ${JSON.stringify(r.expected)}`)
      console.log(`   Actual:   ${JSON.stringify(r.actual)}`)
    } else {
      console.log(`✅ PASS: ${r.family} - ${r.test}`)
    }
  }
  
  if (results.failed > 0) {
    process.exit(1)
  }
}

main().catch(console.error)