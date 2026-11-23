'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useEngine, useGeneratorFamily, useTDFamilies } from '@/hooks/useEngine'
import { useStore } from '@/lib/store'
import { CircularProgress } from '@/components/layout/ProgressBar'
import { TDContent } from '@/components/TDContent'
import quizContent from '@/content/quiz-content.json'

export default function TrainingPage() {
  const { user, recordError } = useStore()
  const { generate, solve, validate, classify, families, getForTD, randomFromTD } = useEngine()
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('')
  const [params, setParams] = useState<Record<string, number | string>>({})
  const [convention, setConvention] = useState<'decimal' | 'binary'>('decimal')
  const [instance, setInstance] = useState<any>(null)
  const [solution, setSolution] = useState<any>(null)
  const [userAnswer, setUserAnswer] = useState<Record<string, unknown>>({})
  const [validation, setValidation] = useState<any>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [history, setHistory] = useState<Array<{ instance: any; answer: any; validation: any }>>([])
  const [errorCount, setErrorCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [currentTD, setCurrentTD] = useState<string>('TD1')
  const [isGenerating, setIsGenerating] = useState(false)

  // Load TD families when TD changes
  const tdFamilies = useEngine().getForTD(currentTD)

  // Generate new exercise
  const handleGenerate = useCallback(async () => {
    if (!selectedFamilyId) return
    setIsGenerating(true)
    try {
      const family = families.find(f => f.id === selectedFamilyId)
      if (!family) return

      // Use TD-specific defaults for params
      const defaultParams = getDefaultParams(selectedFamilyId, currentTD)
      const newParams = { ...defaultParams, ...params }
      const newInstance = generate(selectedFamilyId, { seed: Math.floor(Math.random() * 0xffffffff), convention, ...newParams })
      setInstance(newInstance)
      setSolution(null)
      setUserAnswer({})
      setValidation(null)
      setShowSolution(false)
      setIsGenerating(false)
    } catch (e) {
      console.error(e)
      setIsGenerating(false)
    }
  }, [selectedFamilyId, params, convention, currentTD, generate])

  // Get default params for a family
  function getDefaultParams(familyId: string, td: string): Record<string, number | string> {
    const defaults: Record<string, Record<string, number | string>> = {
      'AUD-SIZE-DEBIT': { fe: 44100, bits: 16, channels: 2, duration: 60 },
      'AUD-INVERSE-FE': { fileSizeMB: 290, bits: 16, channels: 2, durationMin: 3, durationSec: 30 },
      'AUD-INVERSE-DUREE': { fileSizeMB: 300, fe: 44100, bits: 16, channels: 2 },
      'AUD-BITS': { bitrate: 256, fe: 44100, channels: 1, fileSizeMB: 600 },
      'AUD-CBR-COMBOS': { targetBitrate: 512 },
      'AUD-VBR-VS-CBR': { durationMin: 5, brAppel: 128, brSilence: 16, silenceSec: 90 },
      SNR: { bits: 16 },
      NYQUIST: { fmax: 3400 },
      'HUFFMAN-PROBS': { symbols: 'A,B,C,D', probs: '0.375,0.125,0.125,0.375' },
      'HUFFMAN-MATRIX': { matrix: 'TD2_Ex2_standard' },
      'VID-RAW': { width: 1920, height: 1080, bpp: 24, fps: 30 },
      'VID-YC-BPP': { width: 1280, height: 720, yBits: 8, cBits: 4, fps: 25 },
      'GOP-SIZE': { durationMin: 2, originalMB: 60, fps: 25, pattern: 'IBBPBBIBBP', iWeight: 100, pWeight: 50, bWeight: 20 },
      'RES-TABLE': { fps: 24, bpp: 24 },
      'PTS-DTS-ORDER': { frames: 'I:0:80,P:40:40,B:80:0' },
      TOPOLOGY: { scenarios: '3 cas standard' },
      'BUFFER-DRAIN': { dv: 5, dr: 4, bufferSec: 10 },
      'RTP-TIMESTAMP': { audioSampleRate: 48000, videoFps: 25, audioSamplesPerFrame: 1024, videoClockRate: 90000 },
      'JITTER-BUFFER': { jitterMs: 100, fps: 25, delays: '20,35,22,60,25,80', bufferFixed: 50 },
      'LATENCY-BUDGET': { capture: 20, encoding: 30, network: 40, jitter: 60, decoding: 20 },
      'FILM-SIZE': { durationHours: 1, width: 1920, height: 1080, fps: 24, bpp: 24, videoBR: 4.5, audioBR: 128 },
      'SFU-MCU-BW': { participants: 12, videoBR: 2.5, audioBR: 64 },
      'ABR-DECISION': { bandwidthProfile: '5→1→0.3→4', renditions: '1080p@3, 720p@1.5, 360p@0.4' },
      'E1-DIM': { subscribers: 2000, simultaneity: 0.1, e1Channels: 30, transitCapacity: 20 },
      'VOIP-BW': { calls: 50, g711BR: 87.2, opusBR: 40 },
      'DVI-CONCEPT': { variant: 'DVI_types' },
    }
    return defaults[familyId] || {}
  }

  const handleValidate = useCallback(async () => {
    if (!instance) return
    const val = validate(instance, userAnswer)
    setValidation(val)
    if (val.isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setErrorCount(c => c + 1)
      if (val.errorClassification) {
        recordError(val.errorClassification.type)
      }
    }
    setHistory(prev => [...prev, { instance, answer: userAnswer, validation: val }])
  }, [instance, userAnswer, validate, recordError])

  const handleSolve = useCallback(() => {
    if (!instance) return
    const sol = solve(instance)
    setSolution(sol)
    setShowSolution(true)
  }, [instance, solve])

  const handleNewExercise = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleParamChange = (key: string, value: number | string) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const currentFamily = families.find(f => f.id === selectedFamilyId)

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Entraînement — Générateur d'exercices</h1>
          <p className="text-text-muted">Générez des variantes infinies des exercices types des TD. Répondez, validez, apprenez de vos erreurs.</p>
        </div>

        {/* TD Selector + Family Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card p-4">
            <label className="label">TD</label>
            <select
              value={currentTD}
              onChange={(e) => setCurrentTD(e.target.value)}
              className="input w-full mt-1"
            >
              <option value="TD1">TD1 — Audio (16 ex)</option>
              <option value="TD2">TD2 — Image & Vidéo (7 ex)</option>
              <option value="TD3">TD3 — Streaming & Transport (4 ex)</option>
              <option value="TD4">TD4 — Vidéo & Streaming (6 ex)</option>
              <option value="TD5">TD5 — VoIP, RTP, SFU, DASH (8 ex)</option>
              <option value="TD6">TD6 — Télécom & DVI (7 ex)</option>
            </select>
          </div>

          <div className="card p-4">
            <label className="label">Type d'exercice</label>
            <select
              value={selectedFamilyId}
              onChange={(e) => setSelectedFamilyId(e.target.value)}
              className="input w-full mt-1"
              disabled={tdFamilies.length === 0}
            >
              <option value="">— Choisir un type —</option>
              {tdFamilies.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {tdFamilies.length === 0 && <p className="text-caption text-warn mt-2">Sélectionnez un TD d'abord</p>}
          </div>

          <div className="card p-4">
            <label className="label">Convention d'unités</label>
            <div className="flex gap-4 mt-1">
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
        </div>

        {/* Parameters */}
        {selectedFamilyId && (
          <div className="card p-4 mb-6">
            <h3 className="font-semibold text-text mb-4">Paramètres</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(getDefaultParams(selectedFamilyId, currentTD)).map(([key, defaultValue]) => (
                <div key={key} className="sm:col-span-1">
                  <label className="label capitalize">{key}</label>
                  {typeof defaultValue === 'number' ? (
                    <input
                      type="number"
                      value={params[key] ?? defaultValue}
                      onChange={(e) => handleParamChange(key, Number(e.target.value))}
                      className="input mt-1"
                    />
                  ) : (
                    <input
                      type="text"
                      value={params[key] ?? defaultValue}
                      onChange={(e) => handleParamChange(key, e.target.value)}
                      className="input mt-1 font-mono text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Exercise Card */}
            <div className="card p-6">
              {instance ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="badge badge-calc text-sm">Exercice généré</span>
                      <span className="text-caption text-text-muted ml-2">Seed: {instance.seed} | Convention: {instance.meta?.convention || 'decimal'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleNewExercise} disabled={isGenerating} className="btn btn-secondary text-sm">
                        {isGenerating ? '⏳ Nouveau...' : '🎲 Nouvel exercice'}
                      </button>
                      <button onClick={handleSolve} className="btn btn-primary text-sm">🔍 Voir la solution</button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-text mb-4">{instance.meta.topic}</p>
                    {instance.questions.map((q: any, i: number) => (
                      <div key={i} className="mb-4 p-4 bg-card-secondary rounded-xl">
                        <p className="font-medium text-text mb-2">{i + 1}. {q.text}</p>
                        {q.type === 'numeric' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={userAnswer[q.id] ?? ''}
                              onChange={(e) => setUserAnswer(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="input w-48 font-mono"
                              placeholder={q.unit || 'Réponse'}
                            />
                            <span className="text-text-muted">{q.unit || ''}</span>
                          </div>
                        )}
                        {q.type === 'choice' && q.choices && (
                          <div className="flex flex-col gap-2">
                            {q.choices.map((choice: string, ci: number) => (
                              <label key={ci} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-card transition-colors">
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={ci}
                                  checked={userAnswer[q.id] === ci}
                                  onChange={() => setUserAnswer(prev => ({ ...prev, [q.id]: ci }))}
                                  className="w-4 h-4 text-audio border-border focus:ring-audio"
                                />
                                <span className="text-text">{choice}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'text' && (
                          <textarea
                            value={userAnswer[q.id] ?? ''}
                            onChange={(e) => setUserAnswer(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="input w-full min-h-[80px] font-mono text-sm"
                            placeholder="Votre réponse..."
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={handleValidate} className="btn btn-primary" disabled={!instance}>
                      ✅ Valider ma réponse
                    </button>
                    <button onClick={() => { setShowSolution(false); setValidation(null); }} className="btn btn-ghost">
                      🔄 Réessayer
                    </button>
                  </div>

                  {/* Validation Result */}
                  {validation && (
                    <div className={cn('p-4 rounded-xl mb-4', validation.isCorrect ? 'bg-ok/10 border border-ok/30' : 'bg-err/10 border border-err/30')}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={validation.isCorrect ? 'text-ok' : 'text-err'}>{validation.isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
                        <span className="text-caption text-text-muted">Score: {validation.score ? Math.round(validation.score * 100) + '%' : '—'}</span>
                      </div>
                      <p className="text-text-muted">{validation.feedback}</p>
                      {validation.errorClassification && (
                        <div className="mt-2 p-3 bg-warn/10 border border-warn/30 rounded-lg">
                          <p className="font-medium text-warn">🎯 Erreur typique détectée :</p>
                          <p className="text-sm text-text-muted mt-1">{validation.errorClassification.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solution */}
                  {showSolution && solution && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mt-4 animate-slide-down">
                      <h4 className="font-semibold text-text mb-4">📋 Solution détaillée</h4>
                      <div className="space-y-3 text-text-muted">
                        {solution.steps.map((step: any, i: number) => (
                          <div key={i} className="p-3 bg-card-secondary rounded-lg">
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
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎲</div>
                  <h3 className="text-xl font-semibold text-text mb-2">Sélectionnez un type d'exercice</h3>
                  <p className="text-text-muted mb-4">Choisissez un TD et un type d'exercice, puis cliquez sur "Générer"</p>
                  <button 
                    onClick={handleGenerate} 
                    disabled={!selectedFamilyId || isGenerating} 
                    className="btn btn-primary text-lg px-8 py-3"
                  >
                    {isGenerating ? '⏳ Génération...' : '🎲 Générer un exercice'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="card p-4">
              <h4 className="font-semibold text-text mb-4">Statistiques de session</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <CircularProgress value={correctCount + errorCount > 0 ? (correctCount / (correctCount + errorCount)) * 100 : 0} size={60} strokeWidth={6} className="text-accent mx-auto">
                    <span className="text-caption font-mono text-text-muted">{correctCount + errorCount > 0 ? Math.round((correctCount / (correctCount + errorCount)) * 100) : 0}%</span>
                  </CircularProgress>
                  <p className="text-caption text-text-muted mt-1">Taux de réussite</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono tabular-nums text-ok">{correctCount}</p>
                  <p className="text-caption text-text-muted">Correctes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono tabular-nums text-err">{errorCount}</p>
                  <p className="text-caption text-text-muted">Erreurs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            {/* History */}
            <div className="card p-4">
              <h4 className="font-semibold text-text mb-4">Historique</h4>
              {history.length === 0 ? (
                <p className="text-text-muted text-center py-8">Aucun exercice joué yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.slice().reverse().map((h, i) => (
                    <div key={i} className="p-3 rounded-lg bg-card-secondary flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{h.instance?.meta?.topic || 'Exercice'}</p>
                        <p className="text-caption text-text-muted">{h.instance?.familyId}</p>
                      </div>
                      <span className={cn('px-2 py-1 rounded-full text-caption font-medium', h.validation?.isCorrect ? 'bg-ok/20 text-ok' : 'bg-err/20 text-err')}>
                        {h.validation?.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Profile */}
            {errorCount > 0 && (
              <div className="card p-4">
                <h4 className="font-semibold text-text mb-4">Profil d'erreurs</h4>
                <div className="space-y-2">
                  {Object.entries(useStore.getState().user?.errorProfile || {}).slice(0, 5).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-err/5 rounded-lg">
                      <span className="text-sm text-text">{type.replace(/_/g, ' ')}</span>
                      <span className="font-mono font-bold text-err">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      {/* Quiz from original site */}
      <div className="card mt-6">
        <TDContent html={(quizContent as any).html || ''} loadScript={() => import('@/content/quiz-script').then(m => m.quizScript)} />
      </div>
      </main>
    </div>
  )
}