'use client'

import { useState } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useEngine } from '@/hooks/useEngine'
import { ProgressBar } from '@/components/layout/ProgressBar'

const labs = [
  {
    id: 'audio-bitrate',
    title: '1. Audio — Débit & Taille',
    description: 'Calcule débit binaire, taille fichier, durée inverse, Fe inverse.',
    familyId: 'AUD-SIZE-DEBIT',
    params: ['fe', 'bits', 'channels', 'duration'],
    defaults: { fe: 44100, bits: 16, channels: 2, duration: 60 },
  },
  {
    id: 'audio-snr',
    title: '2. Audio — SNR & Nyquist',
    description: 'SNR théorique selon bits, fréquence d\'échantillonnage minimale.',
    familyId: 'SNR',
    params: ['bits'],
    defaults: { bits: 16 },
  },
  {
    id: 'audio-quant',
    title: '3. Audio — Quantification',
    description: 'Niveaux, pas de quantification, SNR.',
    familyId: 'AUD-SIZE-DEBIT',
    params: ['bits', 'vmax', 'vmin'],
    defaults: { bits: 8, vmax: 1, vmin: -1 },
  },
  {
    id: 'video-bitrate',
    title: '4. Vidéo — Débit brut',
    description: 'Débit vidéo non compressé selon résolution, bpp, fps.',
    familyId: 'VID-RAW',
    params: ['width', 'height', 'bpp', 'fps'],
    defaults: { width: 1920, height: 1080, bpp: 24, fps: 30 },
  },
  {
    id: 'image-size',
    title: '5. Image — Taille brute',
    description: 'Taille image selon mode (B/N, gris, RGB, RGBA) + compression JPEG.',
    familyId: 'VID-RAW',
    params: ['width', 'height', 'mode', 'compression'],
    defaults: { width: 1920, height: 1080, mode: '24', compression: 10 },
  },
  {
    id: 'mpeg-gop',
    title: '6. MPEG — Taille compressée (GOP)',
    description: 'Taille compressée selon pattern GOP et poids I/P/B.',
    familyId: 'GOP-SIZE',
    params: ['originalMB', 'iWeight', 'pWeight', 'bWeight', 'nI', 'nP', 'nB'],
    defaults: { originalMB: 60, iWeight: 100, pWeight: 50, bWeight: 20, nI: 2, nP: 2, nB: 6 },
  },
  {
    id: 'latency-budget',
    title: '7. Latence bout-en-bout',
    description: 'Budget latence = capture + encodage + réseau + jitter + décodage. Verdict G.114.',
    familyId: 'LATENCY-BUDGET',
    params: ['capture', 'encoding', 'network', 'jitter', 'decoding'],
    defaults: { capture: 20, encoding: 30, network: 40, jitter: 60, decoding: 20 },
  },
  {
    id: 'voip-bandwidth',
    title: '8. VoIP — Bande passante',
    description: 'Bande totale pour N appels avec overhead.',
    familyId: 'VOIP-BW',
    params: ['calls', 'bitratePerCall'],
    defaults: { calls: 50, bitratePerCall: 87.2 },
  },
] as const

export default function LabPage() {
  const { generate, solve } = useEngine()
  const [activeLab, setActiveLab] = useState<string>('audio-bitrate')
  const [params, setParams] = useState<Record<string, number | string>>({})
  const [solution, setSolution] = useState<any>(null)
  const [convention, setConvention] = useState<'decimal' | 'binary'>('decimal')
  const [isCalculating, setIsCalculating] = useState(false)

  const activeLabConfig = labs.find(l => l.id === activeLab) || labs[0]

  // Initialize params when lab changes
  useEffect(() => {
    setParams(activeLabConfig.defaults)
    setSolution(null)
  }, [activeLab])

  const handleCalculate = useCallback(async () => {
    const familyId = activeLabConfig.familyId
    setIsCalculating(true)
    try {
      const instance = await generate(familyId, { seed: 0, convention, ...params })
      const sol = await solve(instance)
      setSolution(sol)
      setIsCalculating(false)
    } catch (e) {
      console.error(e)
      setIsCalculating(false)
    }
  }, [activeLab, params, convention])

  // Auto-calculate on param change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeLab) handleCalculate()
    }, 300)
    return () => clearTimeout(timer)
  }, [params, convention, activeLab])

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🔬 Lab — Calculateurs interactifs</h1>
          <p className="text-text-muted">Tous les calculs montrent les étapes. Changez les paramètres pour voir les résultats en temps réel.</p>
        </div>

        {/* Lab Selector */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {labs.map(lab => (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
                  activeLab === lab.id
                    ? 'bg-gradient-to-r from-audio to-image text-white shadow-lg'
                    : 'bg-card-secondary text-text-muted hover:bg-card hover:text-text'
                )}
              >
                {lab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Lab Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameters */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-text mb-4">Paramètres</h3>
              <div className="space-y-4">
                {labs.find(l => l.id === activeLab)?.params.map((key, i) => {
                  const defaultValue = labs.find(l => l.id === activeLab)?.defaults[key]
                  return (
                    <div key={key} className="sm:col-span-1">
                      <label className="label capitalize">{key}</label>
                      {typeof (activeLabConfig.defaults[key]) === 'number' ? (
                        <input
                          type="number"
                          value={params[key] ?? activeLabConfig.defaults[key]}
                          onChange={(e) => setParams(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="input"
                        />
                      ) : (
                        <input
                          type="text"
                          value={params[key] ?? activeLabConfig.defaults[key]}
                          onChange={(e) => setParams(prev => ({ ...prev, [key]: e.target.value }))}
                          className="input font-mono text-sm"
                        />
                      )}
                    </div>
                  )}
                )}
              </div>
            </div>

            {/* Convention */}
            <div className="card p-4">
              <h3 className="font-semibold text-text mb-3">Convention d'unités</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="decimal"
                    checked={convention === 'decimal'}
                    onChange={() => setConvention('decimal')}
                    className="w-4 h-4 text-audio border-border focus:ring-audio"
                  />
                  <span className="text-text">Décimal (10³)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="binary"
                    checked={convention === 'binary'}
                    onChange={() => setConvention('binary')}
                    className="w-4 h-4 text-image border-border focus:ring-image"
                  />
                  <span className="text-text">Binaire (2¹⁰)</span>
                </label>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button onClick={() => setParams(labs.find(l => l.id === activeLab)?.defaults || {})} className="btn btn-secondary w-full">
                🔄 Réinitialiser
              </button>
              <button
                onClick={() => {
                  const sol = labs.find(l => l.id === activeLab)?.familyId
                  // Just trigger recalculation
                }}
                className="btn btn-primary w-full"
              >
                🧮 Calculer
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text">{labs.find(l => l.id === activeLab)?.title}</h2>
                <span className={cn('badge', `badge-${labs.find(l => l.id === activeLab)?.id.split('-')[0]}`)}>
                  {labs.find(l => l.id === activeLab)?.title.split('—')[1]?.trim() || 'Lab'}
                </span>
              </div>

              <div className="prose prose-invert max-w-none mb-6 text-text-muted">
                <p>{labs.find(l => l.id === activeLab)?.description}</p>
              </div>

              {/* Input Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-card-secondary rounded-xl">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-caption text-text-muted capitalize">{key}</p>
                    <p className="font-mono font-bold text-text">{value}</p>
                  </div>
                ))}
              </div>

              {/* Results */}
              {solution && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-text">Résultats</h3>
                  <div className="space-y-3">
                    {solution.steps.map((step: any, i: number) => (
                      <div key={i} className="p-4 bg-card-secondary rounded-xl border border-border/50">
                        <p className="font-medium text-text">{step.description}</p>
                        {step.formula && <p className="font-mono text-sm text-accent mt-1">{step.formula}</p>}
                        {step.substitution && <p className="font-mono text-sm text-text-muted mt-1">{step.substitution}</p>}
                        <p className="font-bold text-text mt-1">= {step.result} {step.unit || ''}</p>
                        {step.note && <p className="text-sm text-warn mt-1">⚠ {step.note}</p>}
                      </div>
                    ))}
                  <div className="pt-4 border-t border-border/50">
                    <p className="font-semibold text-text">{solution.finalAnswer}</p>
                    <p className="text-text-muted mt-1">{solution.explanation}</p>
                    {solution.conventionNote && <p className="text-sm text-warn mt-2">📐 {solution.conventionNote}</p>}
                  </div>
                </div>
              )}

              {/* Unit Convention Display */}
              <div className="card p-4 mt-4 bg-gradient-to-r from-warn/5 to-warn/10 border-warn/20">
                <h4 className="font-semibold text-warn mb-2">📐 Convention d'unités appliquée</h4>
                <p className="text-text-muted text-sm">
                  {convention === 'decimal'
                    ? 'Décimale (puissances de 10) : 1 kB = 1000 B, 1 MB = 1 000 000 B, 1 GB = 10⁹ B. Débits en kbit/s = 1000 bit/s.'
                    : 'Binaire (puissances de 2) : 1 KiB = 1024 B, 1 MiB = 1024² B, 1 GiB = 1024³ B. Débits réseau restent en décimal.'}
                </p>
                <p className="text-caption text-text-muted mt-2">Les deux résultats sont affichés dans les détails quand ils diffèrent significativement.</              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}