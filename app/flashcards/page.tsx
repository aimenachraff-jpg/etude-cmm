'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { CircularProgress } from '@/components/layout/ProgressBar'
import flashcardsData from '@/content/flashcards.json'

const flashcards = flashcardsData as any

export default function FlashcardsPage() {
  const { user } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mastered, setMastered] = useState<Set<number>>(new Set())
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [filter, setFilter] = useState<'all' | 'formula' | 'definition' | 'comparison' | 'concept'>('all')
  const [mode, setMode] = useState<'review' | 'cram'>('review')

  const filteredIndices = useCallback(() => {
    if (filter === 'all') return shuffledIndices.length > 0 ? shuffledIndices : Array.from({ length: flashcards.length }, (_, i) => i)
    return (shuffledIndices.length > 0 ? shuffledIndices : Array.from({ length: flashcards.length }, (_, i) => i))
      .filter(i => flashcards[i].category === filter)
  }, [filter, shuffledIndices])

  const indices = filteredIndices()
  const currentCard = indices.length > 0 ? indices[currentIndex] : -1
  const card = currentCard >= 0 ? flashcards[currentCard] : null

  // Load mastered from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('etude-cmm-mastered')
    if (saved) {
      try { setMastered(new Set(JSON.parse(saved))) } catch {}
    }
  }, [])

  // Save mastered to localStorage
  useEffect(() => {
    localStorage.setItem('etude-cmm-mastered', JSON.stringify([...mastered]))
  }, [mastered])

  // Shuffle
  useEffect(() => {
    const indices = Array.from({ length: flashcards.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    setShuffledIndices(indices)
    setCurrentIndex(0)
  }, [filter])

  const handleFlip = useCallback(() => setFlipped(f => !f), [])
  const handleNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredIndices().length)
    setFlipped(false)
  }, [])
  const handlePrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + filteredIndices().length) % filteredIndices().length)
    setFlipped(false)
  }, [])
  const handleMark = useCallback((type: 'ok' | 'again') => {
    if (type === 'ok') {
      setMastered(prev => new Set([...prev, currentCard]))
    }
    handleNext()
  }, [currentCard])

  const progress = flashcards.length > 0 ? Math.round((mastered.size / flashcards.length) * 100) : 0
  const dueCount = flashcards.length - mastered.size

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.code) {
        case 'Space': e.preventDefault(); handleFlip(); break
        case 'ArrowRight': handleNext(); break
        case 'ArrowLeft': handlePrev(); break
        case 'Digit1': handleMark('ok'); break
        case 'Digit2': handleMark('again'); break
        case 'KeyF': e.preventDefault(); setFlipped(f => !f); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Flashcards — Répétition espacée</h1>
              <p className="text-text-muted">Espace = retourner · ←/→ = naviguer · 1 = Je maîtrise · 2 = À revoir</p>
            </div>
            <div className="flex items-center gap-4">
              <CircularProgress value={progress} size={56} strokeWidth={6} className="text-accent">
                <span className="text-caption font-mono text-text-muted">{progress}%</span>
              </CircularProgress>
              <div className="text-right">
                <p className="font-bold text-text">{mastered.size} / {flashcards.length}</p>
                <p className="text-caption text-text-muted">{dueCount} dues</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'formula', 'definition', 'comparison', 'concept'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setCurrentIndex(0) }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-caption font-medium transition-all',
                  filter === f
                    ? 'bg-gradient-to-r from-audio to-image text-white'
                    : 'bg-card-secondary text-text-muted hover:bg-card hover:text-text'
                )}
              >
                {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Flashcard */}
          <div className="flashcard-3d mb-6">
            <div
              className="flashcard-3d-inner w-full max-w-2xl mx-auto h-[320px] sm:h-[380px] cursor-pointer"
              style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip() } }}
              aria-label={flipped ? 'Retour au recto' : 'Voir le verso'}
            >
              {/* Front */}
              <div className="flashcard-3d-face flashcard-3d-front">
                {card && (
                  <>
                    <span className="badge badge-calc mb-3">{card.category}</span>
                    <p className="text-lg sm:text-xl text-text leading-relaxed whitespace-pre-wrap">{card.front}</p>
                    <div className="mt-6 text-text-muted text-sm">Cliquez ou Espace pour retourner</div>
                  </>
                )}
                {!card && <div className="text-text-muted">Aucune carte pour ce filtre</div>}
              </div>

              {/* Back */}
              <div className="flashcard-3d-face flashcard-3d-back">
                {card && (
                  <>
                    <span className="badge badge-ok mb-3">RÉPONSE</span>
                    <p className="text-lg sm:text-xl text-text leading-relaxed whitespace-pre-wrap">{card.back}</p>
                    <div className="mt-6 flex gap-2">
                      <span className="badge badge-calc text-xs">{card.tags.join(' · ')}</span>
                    </div>
                  </>
                )}
                {!card && <div className="text-text-muted">Aucune carte pour ce filtre</div>}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button onClick={handlePrev} className="btn btn-secondary" disabled={filteredIndices().length <= 1}>
              ◀ Précédente
            </button>
            <button onClick={handleFlip} className="btn btn-primary px-8 py-3 text-lg">
              🔄 Retourner
            </button>
            <button onClick={handleNext} className="btn btn-secondary" disabled={filteredIndices().length <= 1}>
              Suivante ▶
            </button>
          </div>

          {/* Mastery buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <button onClick={() => handleMark('again')} className="btn btn-domain-video px-6 py-2 mastery-btn">
              🔁 À revoir
            </button>
            <button onClick={() => handleMark('ok')} className="btn btn-domain-network px-6 py-2 mastery-btn">
              ✅ Je maîtrise
            </button>
          </div>

          {/* Progress */}
          <div className="card p-4">
            <h3 className="font-semibold text-text mb-4">Progression globale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <CircularProgress value={progress} size={70} strokeWidth={6} className="text-accent mx-auto">
                  <span className="text-xl font-bold font-mono">{progress}%</span>
                </CircularProgress>
                <p className="text-caption text-text-muted mt-2">Maîtrise globale</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono tabular-nums text-text">{mastered.size}</p>
                <p className="text-caption text-text-muted">Maîtrisées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono tabular-nums text-warn">{dueCount}</p>
                <p className="text-caption text-text-muted">À réviser</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono tabular-nums text-text">{flashcards.length}</p>
                <p className="text-caption text-text-muted">Total</p>
              </div>
            </div>
          </div>

          {/* Shuffle / Reset */}
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => {
              const indices = Array.from({ length: flashcards.length }, (_, i) => i)
              for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[indices[i], indices[j]] = [indices[j], indices[i]]
              }
              setShuffledIndices(indices)
              setCurrentIndex(0)
            }} className="btn btn-ghost">
              🔀 Mélanger
            </button>
            <button onClick={() => { setMastered(new Set()); localStorage.removeItem('etude-cmm-mastered') }} className="btn btn-danger">
              🔄 Reset progression
            </button>
          </div>
        </div>
        </main>
      </div>
  )
}