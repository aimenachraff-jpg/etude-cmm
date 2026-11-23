'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useEngine } from '@/hooks/useEngine'
import { useStore } from '@/lib/store'
import { CircularProgress } from '@/components/layout/ProgressBar'
import { formatDuration } from '@/lib/utils'

const examPresets = [
  { id: 'eclair', label: 'Éclair 15 min', duration: 15, questions: 10, mix: { qcm: 7, calc: 2, concept: 1, design: 0 }, description: '10 QCM + 1 calcul rapide' },
  { id: 'standard', label: 'Standard 60 min', duration: 60, questions: 30, mix: { qcm: 6, calc: 15, concept: 6, design: 3 }, description: 'Mix miroir des proportions TD' },
  { id: 'marathon', label: 'Marathon 120 min', duration: 120, questions: 60, mix: { qcm: 12, calc: 30, concept: 12, design: 6 }, description: 'Simulation complète' },
  { id: 'td1', label: 'TD1 seulement', duration: 45, questions: 20, mix: { qcm: 2, calc: 14, concept: 2, design: 2 }, tdScope: ['TD1'] },
  { id: 'td2', label: 'TD2 seulement', duration: 30, questions: 15, mix: { qcm: 2, calc: 10, concept: 2, design: 1 }, tdScope: ['TD2'] },
  { id: 'td3', label: 'TD3 seulement', duration: 30, questions: 15, mix: { qcm: 2, calc: 8, concept: 3, design: 2 }, tdScope: ['TD3'] },
  { id: 'td4', label: 'TD4 seulement', duration: 30, questions: 15, mix: { qcm: 2, calc: 10, concept: 2, design: 1 }, tdScope: ['TD4'] },
  { id: 'td5', label: 'TD5 seulement', duration: 40, questions: 20, mix: { qcm: 2, calc: 12, concept: 3, design: 3 }, tdScope: ['TD5'] },
  { id: 'td6', label: 'TD6 seulement', duration: 30, questions: 15, mix: { qcm: 2, calc: 10, concept: 2, design: 1 }, tdScope: ['TD6'] },
  { id: 'weakness', label: 'Ciblé faiblesses', duration: 40, questions: 20, mix: { qcm: 4, calc: 10, concept: 4, design: 2 }, description: 'Basé sur votre profil d\'erreurs' },
  { id: 'surprise', label: 'Examen surprise', duration: 50, questions: 25, mix: { qcm: 5, calc: 12, concept: 5, design: 3 }, description: 'Aléatoire complet' },
] as const

const questionTypes = [
  { id: 'qcm', label: 'QCM', color: 'badge-qcm' },
  { id: 'calc', label: 'Calcul', color: 'badge-calc' },
  { id: 'concept', label: 'Concept', color: 'badge-concept' },
  { id: 'design', label: 'Design', color: 'badge-design' },
] as const

export default function ExamPage() {
  const { user, skillReadiness, examHistory, addExamAttempt, recordError } = useStore()
  const { generateExam } = useEngine()
  const [selectedPreset, setSelectedPreset] = useState<string>('standard')
  const [examConfig, setExamConfig] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const preset = examPresets.find(p => p.id === selectedPreset) || examPresets[1]
  const questions = examConfig?.questions || []

  // Timer
  useEffect(() => {
    if (!startTime || paused || showResults) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, timeRemaining - elapsed)
      setTimeRemaining(remaining)
      if (remaining <= 0) {
        handleFinish()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, paused, showResults, timeRemaining])

  const handleStart = useCallback(() => {
    const config = {
      durationMinutes: preset.duration,
      questionCount: preset.questions,
      tdScope: preset.tdScope || ['TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6'],
      difficultyMix: preset.mix,
      typeMix: { qcm: preset.mix.qcm / preset.questions, calc: preset.mix.calc / preset.questions, concept: preset.mix.concept / preset.questions, design: preset.mix.design / preset.questions },
      allowPause: false,
      bareme: user?.settings.bareme || { correct: 1, incorrect: -0.5, unanswered: 0 },
    }
    setExamConfig(config)
    const exam = generateExam({
      tdScope: config.tdScope,
      questionCount: config.questionCount,
      seed: Math.floor(Math.random() * 0xffffffff),
      convention: user?.settings.unitConvention || 'decimal',
    })
    setExamConfig(prev => ({ ...prev, questions: exam }))
    setStartTime(Date.now())
    setTimeRemaining(preset.duration * 60 * 1000)
  }, [preset, user, generateExam])

  const handleAnswer = (questionId: string, answer: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleFlag = (index: number) => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(c => c - 1)
    }
  }

  const handleFinish = useCallback(() => {
    setEndTime(Date.now())
    setShowResults(true)
    setPaused(true)
  }, [])

  const handlePause = () => {
    setPaused(p => !p)
  }

  const calculateScore = () => {
    if (!examConfig) return { score: 0, breakdown: {} }
    const bareme = examConfig.bareme
    let score = 0
    const breakdown: Record<string, number> = {}

    examConfig.questions.forEach((q: any, i: number) => {
      const answer = answers[q.id]
      const isCorrect = q.type === 'choice' ? answer === q.correctIndex :
                        q.type === 'numeric' ? Math.abs(Number(answer) - Number(q.correctAnswer)) < (q.tolerance || 0.01) :
                        q.type === 'ordering' ? JSON.stringify(answer) === JSON.stringify(q.correctOrder) :
                        false

      if (isCorrect) {
        score += bareme.correct
        breakdown[q.category] = (breakdown[q.category] || 0) + bareme.correct
      } else if (answer !== undefined) {
        score += bareme.incorrect
        breakdown[q.category] = (breakdown[q.category] || 0) + bareme.incorrect
      } else {
        score += bareme.unanswered
      }
    })

    return { score: Math.max(0, score), breakdown }
  }

  const { score, breakdown } = calculateScore()
  const maxScore = examConfig?.questions.length * (examConfig?.bareme.correct || 1)
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  const formatTime = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000))
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      {showResults ? (
        <ExamResults
          preset={preset}
          score={score}
          maxScore={maxScore}
          percentage={percentage}
          breakdown={breakdown}
          examConfig={examConfig}
          answers={answers}
          startTime={startTime}
          endTime={endTime}
          onRestart={() => { setShowResults(false); setStartTime(null); setAnswers({}); setFlagged(new Set()); setCurrentQuestion(0); }}
          onNewExam={() => { setShowResults(false); setStartTime(null); setAnswers({}); setFlagged(new Set()); setCurrentQuestion(0); }}
        />
      ) : (
        <div className="min-h-screen bg-bg">
          <MainNav />
          <main className="container py-4 sm:py-6">
            {/* Exam Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text">{preset.label}</h1>
                <p className="text-text-muted text-sm">{preset.description}</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={cn('px-4 py-2 rounded-xl font-mono text-lg font-bold tabular-nums', timeRemaining > 60000 ? 'text-text' : timeRemaining > 10000 ? 'text-warn' : 'text-err animate-pulse')}>
                  {formatTime(timeRemaining)}
                </div>
                <button onClick={handlePause} className="btn btn-ghost text-sm">
                  {paused ? '▶️ Reprendre' : '⏸️ Pause'}
                </button>
                {startTime && !showResults && (
                  <button onClick={handleFinish} className="btn btn-danger text-sm">
                    ✅ Terminer l'examen
                  </button>
                )}
              </div>
            </div>

            {/* Progress & Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text">Question {currentQuestion + 1} / {questions.length}</span>
                <span className="text-text-muted text-sm">
                  {Object.keys(answers).length} répondu{e}s • {flagged.size} marqué{e}s
                </span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {questions.map((q: any, i: number) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(i)}
                    className={cn(
                      'w-8 h-8 rounded-lg font-medium text-caption transition-colors shrink-0',
                      i === currentQuestion ? 'bg-accent text-bg' :
                      flagged.has(i) ? 'bg-warn/20 text-warn border border-warn' :
                      answers[q.id] !== undefined ? 'bg-ok/20 text-ok border border-ok' :
                      'bg-card-secondary text-text-muted hover:bg-card'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Card */}
            {questions.length > 0 ? (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn('badge', questionTypes.find(t => t.id === questions[currentQuestion]?.type)?.color || 'badge-calc')}>
                    {questionTypes.find(t => t.id === questions[currentQuestion]?.type)?.label || questions[currentQuestion]?.type}
                  </span>
                  <span className="text-caption text-text-muted">{questions[currentQuestion]?.category || 'Général'}</span>
                  {questions[currentQuestion]?.difficulty && (
                    <span className="ml-auto badge badge-calc">
                      {Array.from({ length: questions[currentQuestion].difficulty }, () => '★').join('')}
                    )}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-text">{questions[currentQuestion]?.text || 'Question en chargement...'}</p>
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  {questions[currentQuestion]?.type === 'numeric' && (
                    <div>
                      <label className="label">Votre réponse</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={answers[questions[currentQuestion].id] ?? ''}
                          onChange={(e) => handleAnswer(questions[currentQuestion].id, e.target.value)}
                          className="input w-64 font-mono"
                          placeholder={questions[currentQuestion].unit || 'Réponse numérique'}
                          autoFocus
                        />
                        <span className="text-text-muted">{questions[currentQuestion].unit || ''}</span>
                      </div>
                      {questions[currentQuestion].tolerance && (
                        <p className="text-caption text-text-muted mt-1">Tolérance: ±{questions[currentQuestion].tolerance} {questions[currentQuestion].unit || ''}</p>
                      )}
                    </div>
                  )}

                  {questions[currentQuestion]?.type === 'choice' && questions[currentQuestion].choices && (
                    <div className="space-y-2">
                      {questions[currentQuestion].choices.map((choice: string, ci: number) => (
                        <label
                          key={ci}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border',
                            answers[questions[currentQuestion].id] === ci
                              ? 'bg-accent/10 border-accent/30'
                              : 'bg-card-secondary border-border hover:bg-card'
                          )}
                        >
                          <input
                            type="radio"
                            name={questions[currentQuestion].id}
                            value={ci}
                            checked={answers[questions[currentQuestion].id] === ci}
                            onChange={() => handleAnswer(questions[currentQuestion].id, ci)}
                            className="w-4 h-4 text-audio border-border focus:ring-audio"
                          />
                          <span className="text-text">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {questions[currentQuestion]?.type === 'ordering' && (
                    <div className="space-y-2">
                      <p className="text-text-muted text-sm mb-2">Glissez pour ordonner (ou cliquez sur les flèches)</p>
                      {(answers[questions[currentQuestion].id] as number[] || questions[currentQuestion].items.map((_: any, i: number) => i)).map((itemIndex: number, displayIndex: number) => (
                        <div key={displayIndex} className="flex items-center gap-3 p-3 bg-card-secondary rounded-xl">
                          <button onClick={() => moveItem(displayIndex, -1)} disabled={displayIndex === 0} className="p-1 rounded text-text-muted hover:text-text disabled:opacity-30">▲</button>
                          <span className="flex-1 font-medium text-text">{questions[currentQuestion].items[itemIndex]}</span>
                          <button onClick={() => moveItem(displayIndex, 1)} disabled={displayIndex === (answers[questions[currentQuestion].id] as number[])?.length - 1 || displayIndex === questions[currentQuestion].items.length - 1} className="p-1 rounded text-text-muted hover:text-text disabled:opacity-30">▼</button>
                          <span className="w-8 text-center font-mono text-accent">{displayIndex + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {questions[currentQuestion]?.type === 'concept' && (
                    <div>
                      <label className="label">Votre réponse (texte libre)</label>
                      <textarea
                        value={answers[questions[currentQuestion].id] ?? ''}
                        onChange={(e) => handleAnswer(questions[currentQuestion].id, e.target.value)}
                        className="input min-h-[120px] font-mono text-sm"
                        placeholder="Expliquez votre raisonnement..."
                        rows={6}
                      />
                    </div>
                  )}

                  {questions[currentQuestion]?.type === 'design' && (
                    <div className="space-y-4">
                      <p className="text-text-muted">Répondez structuré : 1) Codecs 2) Protocoles 3) Transport 4) Buffer 5) QoS 6) Chiffrement 7) Bande passante 8) Architecture</p>
                      <textarea
                        value={answers[questions[currentQuestion].id] ?? ''}
                        onChange={(e) => handleAnswer(questions[currentQuestion].id, e.target.value)}
                        className="input min-h-[200px] font-mono text-sm"
                        placeholder="Votre proposition d'architecture..."
                        rows={12}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
                  <button onClick={handlePrev} disabled={currentQuestion === 0} className="btn btn-secondary">
                    ← Précédente
                  </button>
                  <button onClick={handleFlag(currentQuestion)} className={cn('btn', flagged.has(currentQuestion) ? 'btn-warning' : 'btn-ghost')}>
                    {flagged.has(currentQuestion) ? '🚩 Marqué' : '🚩 Marquer'}
                  </span>
                  <button onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="btn btn-primary ml-auto">
                    Suivante →
                  </button>
                </div>
              </div>
            ) : (
              !startTime ? (
                <div className="card p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold text-text mb-2">Prêt pour l'examen ?</h2>
                  <p className="text-text-muted mb-6 max-w-md mx-auto">Choisissez un mode d'examen ci-dessous, puis lancez-vous. Vous ne pourrez pas mettre en pause (sauf si activé).</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {examPresets.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPreset(p.id)}
                        className={cn(
                          'p-4 rounded-xl text-left transition-all',
                          selectedPreset === p.id
                            ? 'bg-gradient-to-br from-audio/10 to-image/10 border-2 border-audio'
                            : 'bg-card-secondary border-border hover:bg-card'
                        )}
                      >
                        <div className="font-semibold text-text">{p.label}</div>
                        <div className="text-caption text-text-muted mt-1">{p.duration} min • {p.questions} q</div>
                        <div className="text-caption text-text-muted mt-1">{p.description}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button onClick={handleStart} className="btn btn-primary text-lg px-8 py-3">
                      🚀 Lancer l'examen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <div className="text-4xl mb-2">⚠️</div>
                  <h3 className="text-xl font-bold text-text mb-2">Aucune question générée</h3>
                  <p className="text-text-muted">Réessayez avec un autre preset.</p>
                </div>
              )}
          </main>
        </div>
      )}
    </div>
  )
}

function ExamResults({ preset, score, maxScore, percentage, breakdown, examConfig, answers, startTime, endTime, onRestart, onNewExam }: any) {
  const duration = endTime && startTime ? formatDuration((endTime - startTime) / 1000) : '—'
  const passed = percentage >= 60

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8 text-center">
          <div className={cn('inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg', passed ? 'bg-ok/20 text-ok border border-ok/30' : 'bg-err/20 text-err border border-err/30')}>
            {passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mt-4">{preset.label}</h1>
          <p className="text-text-muted mt-1">{preset.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <CircularProgress value={percentage} size={100} strokeWidth={8} className={percentage >= 60 ? 'text-ok' : 'text-err'}>
              <span className="text-2xl font-bold font-mono tabular-nums">{percentage}%</span>
            </CircularProgress>
            <p className="text-caption text-text-muted mt-2">Score global</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-bold font-mono tabular-nums text-text">{score.toFixed(1)} / {maxScore}</p>
            <p className="text-caption text-text-muted mt-1">Points bruts</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-bold font-mono tabular-nums text-text">{formatDuration((endTime! - startTime!) / 1000)}</p>
            <p className="text-caption text-text-muted mt-1">Durée</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4">Détail par compétence</h3>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([skill, points]) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-card-secondary rounded-xl">
                  <span className="font-medium text-text capitalize">{skill.replace(/-/g, ' ')}</span>
                  <span className="font-mono font-bold tabular-nums text-accent">{points > 0 ? '+' : ''}{points.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4">Analyse des erreurs</h3>
            <div className="space-y-2">
              {Object.entries(answers).filter(([qId, ans]) => {
                const q = examConfig?.questions?.find((qq: any) => qq.id === qId)
                if (!q || ans === undefined) return false
                const isCorrect = q.type === 'choice' ? ans === q.correctIndex :
                                  q.type === 'numeric' ? Math.abs(Number(ans) - Number(q.correctAnswer)) < (q.tolerance || 0.01) : false
                return !isCorrect
              }).slice(0, 10).map(([qId, ans]) => {
                const q = examConfig?.questions?.find((qq: any) => qq.id === qId)
                return (
                  <div key={qId} className="p-3 bg-err/5 border border-err/20 rounded-xl">
                    <p className="font-medium text-text">{q?.text?.slice(0, 80)}…</p>
                    <p className="text-sm text-text-muted">Votre réponse: <code className="font-mono">{ans}</code> | Correct: <code className="font-mono">{q?.correctAnswer ?? q?.correctIndex}</code></p>
                  </div>
                ))}
              {Object.entries(answers).filter(([qId, ans]) => {
                const q = examConfig?.questions?.find((qq: any) => qq.id === qId)
                if (!q || ans === undefined) return false
                const isCorrect = q.type === 'choice' ? ans === q.correctIndex :
                                  q.type === 'numeric' ? Math.abs(Number(ans) - Number(q.correctAnswer)) < (q.tolerance || 0.01) : false
                return !isCorrect
              }).length === 0 && <p className="text-text-muted text-center py-8">Aucune erreur ! 🎉</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button onClick={onRestart} className="btn btn-primary text-lg px-8 py-3">
            🔁 Refaire cet examen
          </button>
          <button onClick={onNewExam} className="btn btn-secondary text-lg px-8 py-3">
            🎲 Nouvel examen
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost text-lg px-8 py-3">
            🖨️ Imprimer / PDF
          </button>
          <Link href="/dashboard" className="btn btn-ghost text-lg px-8 py-3">
            🏠 Tableau de bord
          </Link>
        </div>
      </main>
    </div>
  )
}