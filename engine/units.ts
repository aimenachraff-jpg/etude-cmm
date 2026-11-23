/**
 * Unit convention utilities for decimal vs binary calculations.
 * Supports global toggle and per-exercise tagging.
 */

import { UnitConvention, UnitConventionResult } from './types'

// ============================================================================
// Constants
// ============================================================================

export const BYTES_PER_KB_DECIMAL = 1000
export const BYTES_PER_KB_BINARY = 1024
export const BYTES_PER_MB_DECIMAL = 1_000_000
export const BYTES_PER_MB_BINARY = 1_048_576
export const BYTES_PER_GB_DECIMAL = 1_000_000_000
export const BYTES_PER_GB_BINARY = 1_073_741_824

// ============================================================================
// Core Conversion Functions
// ============================================================================

/** Convert bytes to target unit with given convention */
export function bytesToUnit(
  bytes: number,
  unit: 'KB' | 'MB' | 'GB' | 'TB',
  convention: UnitConvention
): number {
  const divisor = getDivisor(unit, convention)
  return bytes / divisor
}

/** Get divisor for unit + convention */
export function getDivisor(unit: 'KB' | 'MB' | 'GB' | 'TB', convention: UnitConvention): number {
  const base = convention === 'decimal' ? 1000 : 1024
  switch (unit) {
    case 'KB': return base
    case 'MB': return base ** 2
    case 'GB': return base ** 3
    case 'TB': return base ** 4
    default: return 1
  }
}

/** Format bytes with appropriate unit and convention */
export function formatBytes(
  bytes: number,
  convention: UnitConvention = 'decimal',
  decimals = 2
): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const base = convention === 'decimal' ? 1000 : 1024

  if (bytes === 0) return '0 B'

  const i = Math.floor(Math.log(bytes) / Math.log(base))
  const value = bytes / Math.pow(base, i)
  return `${value.toFixed(decimals)} ${units[i]}`
}

/** Format bits with appropriate unit */
export function formatBits(
  bits: number,
  convention: UnitConvention = 'decimal',
  decimals = 2
): string {
  const units = ['bit/s', 'kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s']
  const base = 1000 // bits always decimal

  if (bits === 0) return '0 bit/s'

  const i = Math.floor(Math.log(bits) / Math.log(base))
  const value = bits / Math.pow(base, i)
  return `${value.toFixed(decimals)} ${units[i]}`
}

/** Get both decimal and binary representations */
export function getBothConventions(bytes: number): UnitConventionResult {
  const decimal = bytes / BYTES_PER_MB_DECIMAL
  const binary = bytes / BYTES_PER_MB_BINARY

  return {
    decimal,
    binary,
    decimalFormatted: `${decimal.toFixed(2)} MB`,
    binaryFormatted: `${binary.toFixed(2)} MiB`,
    convention: 'decimal', // default
  }
}

/** Convert with automatic unit selection for both conventions */
export function formatBytesBoth(bytes: number, decimals = 2): {
  decimal: string
  binary: string
} {
  return {
    decimal: formatBytes(bytes, 'decimal', decimals),
    binary: formatBytes(bytes, 'binary', decimals),
  }
}

/** Parse human-readable size string to bytes */
export function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.]+)\s*([KMGT]?i?B)/i)
  if (!match) throw new Error(`Invalid size format: ${sizeStr}`)

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  const isBinary = unit.includes('I') || (!unit.includes('I') && unit.length === 2)
  const base = isBinary ? 1024 : 1000

  const unitMap: Record<string, number> = {
    B: 1,
    KB: base,
    MB: base ** 2,
    GB: base ** 3,
    TB: base ** 4,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
    TIB: 1024 ** 4,
  }

  const multiplier = unitMap[unit] || 1
  return Math.round(value * multiplier)
}

/** Convert bits to bytes with convention-aware display */
export function bitsToBytesDisplay(bits: number, convention: UnitConvention): {
  bytes: number
  display: string
} {
  const bytes = bits / 8
  return {
    bytes,
    display: formatBytes(bytes, convention),
  }
}

/** Calculate file size from audio/video parameters */
export function calculateMediaSize(params: {
  bitrate: number // bit/s
  duration: number // seconds
  overhead?: number // percentage (0-100)
}): { bits: number; bytes: number; convention: { decimal: string; binary: string } } {
  let bits = params.bitrate * params.duration
  if (params.overhead) {
    bits *= (1 + params.overhead / 100)
  }
  const bytes = bits / 8
  return {
    bits,
    bytes,
    convention: formatBytesBoth(bytes),
  }
}

/** Convention-aware bitrate display */
export function formatBitrateBoth(bitrate: number): { decimal: string; binary: string } {
  // Bitrate is always decimal in networking, but we show both for consistency
  return {
    decimal: formatBits(bitrate, 'decimal'),
    binary: formatBits(bitrate, 'binary'), // Same calculation, different label
  }
}

// ============================================================================
// Exercise-specific convention tagging
// ============================================================================

export const EXERCISE_CONVENTIONS: Record<string, UnitConvention> = {
  // TD1 - Mixed
  'TD1_Ex1': 'decimal',
  'TD1_Ex2': 'decimal',
  'TD1_Ex3': 'decimal',
  'TD1_Ex4': 'decimal',
  'TD1_Ex5': 'decimal',
  'TD1_Ex6': 'decimal',
  'TD1_Ex7': 'decimal',
  'TD1_Ex8': 'decimal',
  'TD1_Ex9': 'decimal',
  'TD1_Ex10': 'decimal',
  'TD1_Ex11': 'decimal',
  'TD1_Ex12': 'decimal',
  'TD1_Ex16': 'binary', // QCM uses binary

  // TD2 - Binary
  'TD2_Ex1': 'decimal', // Huffman is unitless
  'TD2_Ex2': 'decimal',
  'TD2_Ex3': 'decimal',
  'TD2_Ex4': 'decimal',
  'TD2_Ex5': 'decimal',
  'TD2_Ex6': 'binary', // Resolution table uses MiB/GiB
  'TD2_Ex7': 'decimal',

  // TD3 - Decimal (network)
  'TD3_Ex1': 'decimal',
  'TD3_Ex2': 'decimal',
  'TD3_Ex3': 'decimal',
  'TD3_Ex4': 'decimal',

  // TD4 - Decimal
  'TD4_Ex1': 'decimal',
  'TD4_Ex2': 'decimal',
  'TD4_Ex3': 'decimal',
  'TD4_Ex4': 'decimal',
  'TD4_Ex5': 'decimal',
  'TD4_Ex6': 'decimal',

  // TD5 - Decimal
  'TD5_Ex1': 'decimal',
  'TD5_Ex2': 'decimal',
  'TD5_Ex3': 'decimal',
  'TD5_Ex4': 'decimal',
  'TD5_Ex5': 'decimal',
  'TD5_Ex6': 'decimal',
  'TD5_Ex7': 'decimal',
  'TD5_Ex8': 'decimal',

  // TD6 - Decimal
  'TD6_Ex1': 'decimal',
  'TD6_Ex2': 'decimal',
  'TD6_Ex3': 'decimal',
  'TD6_Ex4': 'decimal',
  'TD6_Ex5': 'decimal',
  'TD6_Ex6': 'decimal',
  'TD6_Ex7': 'decimal',
}

/** Get convention for exercise, with fallback */
export function getExerciseConvention(exerciseId: string): UnitConvention {
  return EXERCISE_CONVENTIONS[exerciseId] ?? 'decimal'
}