/**
 * Core calculation formulas for Communication Multimédia.
 * Pure functions, independently verifiable, unit-testable.
 */

import { UnitConvention, UnitConventionResult } from './types'
import * as Units from './units'

// ============================================================================
// Audio Formulas
// ============================================================================

/** Sampling period from frequency */
export function samplingPeriod(fe: number): number {
  return 1 / fe
}

/** Nyquist minimum sampling frequency */
export function nyquistFrequency(fmax: number): number {
  return 2 * fmax
}

/** Quantization levels from bits */
export function quantizationLevels(bits: number): number {
  return Math.pow(2, bits)
}

/** Quantization step size */
export function quantizationStep(vmax: number, vmin: number, bits: number): number {
  return (vmax - vmin) / Math.pow(2, bits)
}

/** Signal-to-Noise Ratio (theoretical) */
export function snr(bits: number): number {
  return 6.02 * bits + 1.25
}

/** Audio bitrate = Fe × bits × channels */
export function audioBitrate(fe: number, bits: number, channels: number): number {
  return fe * bits * channels
}

/** Audio file size = bitrate × duration / 8 */
export function audioFileSize(bitrate: number, durationSeconds: number): number {
  return (bitrate * durationSeconds) / 8
}

/** Audio duration from file size */
export function audioDuration(fileSizeBytes: number, bitrate: number): number {
  return (fileSizeBytes * 8) / bitrate
}

/** Sampling frequency from file size */
export function samplingFrequencyFromSize(
  fileSizeBytes: number,
  bits: number,
  channels: number,
  durationSeconds: number
): number {
  return (fileSizeBytes * 8) / (bits * channels * durationSeconds)
}

/** Complete audio calculation with both conventions */
export function calculateAudioComplete(params: {
  fe: number
  bits: number
  channels: number
  durationSeconds: number
  convention?: UnitConvention
}): {
  bitrate: number
  bitrateFormatted: string
  fileSizeBytes: number
  fileSize: UnitConventionResult
  snr: number
  quantizationLevels: number
} {
  const bitrate = audioBitrate(params.fe, params.bits, params.channels)
  const fileSizeBytes = audioFileSize(bitrate, params.durationSeconds)
  const convention = params.convention ?? 'decimal'

  return {
    bitrate,
    bitrateFormatted: Units.formatBits(bitrate),
    fileSizeBytes,
    fileSize: {
      decimal: fileSizeBytes / 1_000_000,
      binary: fileSizeBytes / 1_048_576,
      decimalFormatted: Units.formatBytes(fileSizeBytes, 'decimal'),
      binaryFormatted: Units.formatBytes(fileSizeBytes, 'binary'),
      convention,
    },
    snr: snr(params.bits),
    quantizationLevels: quantizationLevels(params.bits),
  }
}

// ============================================================================
// Video Formulas
// ============================================================================

/** Raw video bitrate = Width × Height × bpp × fps */
export function videoBitrateRaw(
  width: number,
  height: number,
  bpp: number,
  fps: number
): number {
  return width * height * bpp * fps
}

/** Video frame duration */
export function videoFrameDuration(fps: number): number {
  return 1000 / fps // ms
}

/** Raw video file size */
export function videoFileSizeRaw(
  width: number,
  height: number,
  bpp: number,
  fps: number,
  durationSeconds: number
): number {
  return (videoBitrateRaw(width, height, bpp, fps) * durationSeconds) / 8
}

/** Compressed video size with ratio */
export function videoFileSizeCompressed(
  rawSizeBytes: number,
  compressionRatio: number
): number {
  return rawSizeBytes / compressionRatio
}

/** GOP average weight calculation */
export function gopAverageWeight(
  iCount: number,
  pCount: number,
  bCount: number,
  iWeight: number, // percentage of I-frame (100 = reference)
  pWeight: number, // percentage of I-frame
  bWeight: number  // percentage of I-frame
): number {
  const totalFrames = iCount + pCount + bCount
  const totalWeight = iCount * iWeight + pCount * pWeight + bCount * bWeight
  return totalWeight / (totalFrames * 100)
}

/** Compressed video size from GOP structure */
export function videoSizeFromGOP(
  originalSize: number, // MB
  iCount: number,
  pCount: number,
  bCount: number,
  iWeightPct: number,
  pWeightPct: number,
  bWeightPct: number
): number {
  const avgWeight = gopAverageWeight(iCount, pCount, bCount, iWeightPct, pWeightPct, bWeightPct)
  return originalSize * avgWeight
}

// ============================================================================
// Image Formulas
// ============================================================================

/** Raw image size in bytes */
export function imageSizeRaw(
  width: number,
  height: number,
  bitsPerPixel: number
): number {
  return (width * height * bitsPerPixel) / 8
}

/** JPEG compressed size estimation */
export function imageSizeJPEG(
  width: number,
  height: number,
  bitsPerPixel: number,
  compressionPercent: number // e.g., 10 for 10%
): number {
  return imageSizeRaw(width, height, bitsPerPixel) * (compressionPercent / 100)
}

/** YCbCr conversion (BT.601) */
export function rgbToYCbCr(r: number, g: number, b: number): { y: number; cb: number; cr: number } {
  return {
    y: 0.299 * r + 0.587 * g + 0.114 * b,
    cb: 128 - 0.1687 * r - 0.3313 * g + 0.5 * b,
    cr: 128 + 0.5 * r - 0.4187 * g - 0.0813 * b,
  }
}

/** Inverse YCbCr to RGB */
export function yCbCrToRgb(y: number, cb: number, cr: number): { r: number; g: number; b: number } {
  return {
    r: y + 1.402 * (cr - 128),
    g: y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128),
    b: y + 1.772 * (cb - 128),
  }
}

// ============================================================================
// Huffman Coding
// ============================================================================

export interface HuffmanNode {
  symbol: string | string[]
  frequency: number
  left?: HuffmanNode
  right?: HuffmanNode
  code?: string
}

export interface HuffmanResult {
  codes: Record<string, string>
  tree: HuffmanNode
  averageLength: number
  entropy: number
  efficiency: number
  encodedBits: number
  originalBits: number
  compressionRatio: number
}

/** Build Huffman tree and codes from symbols and frequencies */
export function buildHuffman(
  symbols: string[],
  frequencies: number[]
): HuffmanResult {
  if (symbols.length !== frequencies.length || symbols.length === 0) {
    throw new Error('Invalid input: symbols and frequencies must have same non-zero length')
  }

  // Create leaf nodes
  let nodes: HuffmanNode[] = symbols.map((s, i) => ({
    symbol: s,
    frequency: frequencies[i],
  }))

  // Build tree by combining lowest frequency nodes
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency)
    const left = nodes.shift()!
    const right = nodes.shift()!
    nodes.push({
      symbol: [...(Array.isArray(left.symbol) ? left.symbol : [left.symbol]),
        ...(Array.isArray(right.symbol) ? right.symbol : [right.symbol])],
      frequency: left.frequency + right.frequency,
      left,
      right,
    })
  }

  const root = nodes[0]
  const codes: Record<string, string> = {}

  // Generate codes by traversing tree
  function traverse(node: HuffmanNode, prefix: string = '') {
    if (!node.left && !node.right) {
      const sym = Array.isArray(node.symbol) ? node.symbol[0] : node.symbol
      codes[sym] = prefix || '0'
      return
    }
    if (node.left) traverse(node.left, prefix + '0')
    if (node.right) traverse(node.right, prefix + '1')
  }
  traverse(root)

  // Calculate metrics
  const totalFreq = frequencies.reduce((a, b) => a + b, 0)
  let entropy = 0
  let avgLength = 0
  let encodedBits = 0
  let originalBits = 0

  symbols.forEach((s, i) => {
    const p = frequencies[i] / totalFreq
    const codeLen = codes[s].length
    entropy -= p * Math.log2(p)
    avgLength += p * codeLen
    encodedBits += frequencies[i] * codeLen
    originalBits += frequencies[i] * Math.ceil(Math.log2(symbols.length))
  })

  return {
    codes,
    tree: root,
    averageLength: avgLength,
    entropy,
    efficiency: entropy / avgLength,
    encodedBits,
    originalBits,
    compressionRatio: originalBits / encodedBits,
  }
}

// ============================================================================
// Network/Transport Formulas
// ============================================================================

/** Shannon-Hartley channel capacity */
export function shannonCapacity(bandwidth: number, snr: number): number {
  return bandwidth * Math.log2(1 + snr)
}

/** End-to-end latency budget */
export function latencyBudget(components: {
  capture: number
  encoding: number
  network: number
  jitter: number
  decoding: number
}): number {
  return components.capture + components.encoding + components.network + components.jitter + components.decoding
}

/** ITU-T G.114 classification */
export function g114Classification(latencyMs: number): 'optimal' | 'acceptable' | 'unacceptable' {
  if (latencyMs <= 150) return 'optimal'
  if (latencyMs <= 400) return 'acceptable'
  return 'unacceptable'
}

/** Buffer drain time */
export function bufferDrainTime(
  videoBitrate: number, // bit/s
  networkBitrate: number, // bit/s
  initialBufferSeconds: number
): number {
  const bufferBits = videoBitrate * initialBufferSeconds
  const deficit = videoBitrate - networkBitrate
  if (deficit <= 0) return Infinity // Buffer never drains
  return bufferBits / deficit
}

/** Jitter buffer sizing */
export function jitterBufferSize(jitterMs: number, frameDurationMs: number): number {
  return jitterMs + frameDurationMs
}

/** RTP timestamp to time conversion */
export function rtpTimestampToTime(timestamp: number, clockRate: number): number {
  return (timestamp / clockRate) * 1000 // ms
}

/** Audio frame duration */
export function audioFrameDuration(samplesPerFrame: number, sampleRate: number): number {
  return (samplesPerFrame / sampleRate) * 1000 // ms
}

// ============================================================================
// VoIP / Conference Formulas
// ============================================================================

/** Per-client upstream bandwidth */
export function clientUpstream(videoBitrate: number, audioBitrate: number): number {
  return videoBitrate + audioBitrate
}

/** Per-client downstream bandwidth (SFU) */
export function clientDownstreamSFU(
  participantCount: number,
  videoBitrate: number,
  audioBitrate: number
): number {
  return (participantCount - 1) * (videoBitrate + audioBitrate)
}

/** SFU server load */
export function sfuServerLoad(
  participantCount: number,
  videoBitrate: number,
  audioBitrate: number
): { inbound: number; outbound: number } {
  const perClient = videoBitrate + audioBitrate
  return {
    inbound: participantCount * perClient,
    outbound: participantCount * (participantCount - 1) * perClient,
  }
}

/** MCU server load (simplified) */
export function mcuServerLoad(
  participantCount: number,
  outputBitrate: number
): { inbound: number; outbound: number; cpuLoad: 'high' | 'medium' | 'low' } {
  return {
    inbound: participantCount * outputBitrate,
    outbound: participantCount * outputBitrate,
    cpuLoad: 'high',
  }
}

/** E1 dimensioning */
export function e1Dimensioning(
  subscribers: number,
  simultaneityRate: number, // 0-1
  e1Channels: number = 30
): { e1Count: number; transits: number } {
  const simultaneousCalls = Math.ceil(subscribers * simultaneityRate)
  const e1Count = Math.ceil(simultaneousCalls / e1Channels)
  const transits = Math.ceil(e1Count / 20) // 20 E1 per transit
  return { e1Count, transits }
}

/** VoIP bandwidth with overhead */
export function voipBandwidth(
  callCount: number,
  bitratePerCallWithOverhead: number
): number {
  return callCount * bitratePerCallWithOverhead
}

// ============================================================================
// DVI / Display Formulas
// ============================================================================

/** Single Link max bandwidth = 3.96 Gbit/s (1920×1200@60Hz 24bpp) */
export const DVI_SINGLE_LINK_MAX_BPS = 3.96e9
export const DVI_DUAL_LINK_MAX_BPS = 7.92e9

export function dviMaxResolution(singleLink: boolean): { width: number; height: number; refresh: number } {
  return singleLink
    ? { width: 1920, height: 1200, refresh: 60 }
    : { width: 2560, height: 1600, refresh: 60 }
}

// ============================================================================
// Resolution Table (TD2 Ex6) - Binary Convention
// ============================================================================

export interface ResolutionEntry {
  label: string
  width: number
  height: number
  bitrateMbps: number
  sizePerMinuteMiB: number
}

export const RESOLUTION_TABLE_BINARY: ResolutionEntry[] = [
  {
    label: '144p',
    width: 256,
    height: 144,
    bitrateMbps: 31.64,
    sizePerMinuteMiB: 237.0,
  },
  {
    label: '240p',
    width: 426,
    height: 240,
    bitrateMbps: 98.30,
    sizePerMinuteMiB: 316.35,
  },
  {
    label: '360p',
    width: 640,
    height: 360,
    bitrateMbps: 196.61,
    sizePerMinuteMiB: 94.92, // This is actually MiB but labeled as "Mbps" in source
  },
  {
    label: '480p',
    width: 854,
    height: 480,
    bitrateMbps: 392.58,
    sizePerMinuteMiB: 1640 / 1024, // ~1.6 GiB for 10 min = 1.64 GiB
  },
  {
    label: '720p',
    width: 1280,
    height: 720,
    bitrateMbps: 530.84,
    sizePerMinuteMiB: 2980 / 1024, // ~2.9 GiB for 10 min
  },
  {
    label: '1080p',
    width: 1920,
    height: 1080,
    bitrateMbps: 1492.99,
    sizePerMinuteMiB: 8340 / 1024, // ~8.1 GiB for 10 min
  },
]

// ============================================================================
// Utility: Step-by-step trace generation
// ============================================================================

export interface CalculationStep {
  description: string
  formula?: string
  substitution?: string
  result: string | number
  unit?: string
  note?: string
}

export function createStep(
  description: string,
  formula: string,
  substitution: string,
  result: string | number,
  unit?: string,
  note?: string
): CalculationStep {
  return { description, formula, substitution, result, unit, note }
}

export function formatStep(step: CalculationStep): string {
  let out = `**${step.description}**`
  if (step.formula) out += `\nFormula: ${step.formula}`
  if (step.substitution) out += `\nSubstitution: ${step.substitution}`
  out += `\nResult: **${step.result}**${step.unit ? ` ${step.unit}` : ''}`
  if (step.note) out += `\n*Note: ${step.note}*`
  return out
}