'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { CircularProgress } from '@/components/layout/ProgressBar'

const flashcards = [
  { front: "Formule débit audio", back: "D = Fe × B × canaux (bit/s). Ex: CD = 44100×16×2 = 1.41 Mbit/s.", tags: ['audio', 'formule'], category: 'formula' },
  { front: "Formule taille fichier audio", back: "S = D × durée / 8 (octets). Ex: 1 min CD = 10.58 Mo.", tags: ['audio', 'formule'], category: 'formula' },
  { front: "SNR pour B bits", back: "SNR ≈ 6.02×B + 1.25 dB. 16 bits → 97.57 dB.", tags: ['audio', 'formule'], category: 'formula' },
  { front: "Condition de Nyquist", back: "Fe ≥ 2 × fmax. Voix (4 kHz) → 8 kHz. CD (20 kHz) → 44.1 kHz.", tags: ['audio', 'formule'], category: 'formula' },
  { front: "Niveaux de quantification", back: "2^B niveaux. 8 bits = 256, 16 bits = 65 536.", tags: ['audio', 'formule'], category: 'formula' },
  { front: "Masquage fréquentiel", back: "Un son fort masque un son faible proche en fréquence. Base du MP3.", tags: ['audio', 'concept'], category: 'definition' },
  { front: "Différence CBR/VBR", back: "CBR = débit constant. VBR = débit variable, économise ~30%.", tags: ['audio', 'concept'], category: 'comparison' },
  { front: "Image I en MPEG", back: "Image complète de référence (intra). Permet le seek.", tags: ['video', 'definition'], category: 'definition' },
  { front: "Image P en MPEG", back: "Prédite depuis l'image précédente (vecteurs de mouvement + résidu).", tags: ['video', 'definition'], category: 'definition' },
  { front: "Image B en MPEG", back: "Bidirectionnelle (avant+après). La plus légère mais nécessite un buffer.", tags: ['video', 'definition'], category: 'definition' },
  { front: "GOP (Group of Pictures)", back: "Séquence d'images entre deux I (ex: IBBPBBIBBP = 10).", tags: ['video', 'definition'], category: 'definition' },
  { front: "PTS (Presentation Time Stamp)", back: "Instant d'affichage.", tags: ['video', 'definition'], category: 'definition' },
  { front: "DTS (Decoding Time Stamp)", back: "Instant de décodage. Pour B: DTS > PTS.", tags: ['video', 'definition'], category: 'definition' },
  { front: "Topologie IPTV", back: "Multicast (un flux par groupe via IGMP).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Topologie Netflix", back: "Unicast (un flux par client, ABR).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Topologie TNT", back: "Broadcast (un vers tous).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "DASH", back: "Dynamic Adaptive Streaming: adaptation du débit selon la bande passante.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Gigue (jitter)", back: "Variation du délai de transmission. Compensée par un buffer de jitter.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Débit Full HD brut", back: "1920×1080×24×30 = 1.49 Gbit/s.", tags: ['video', 'formule'], category: 'formula' },
  { front: "Taux compression H.264", back: "≈ 100:1.", tags: ['video', 'formule'], category: 'formula' },
  { front: "Chaîne JPEG", back: "RGB→YCbCr→sous-éch. 4:2:0→DCT 8×8→quantification→zigzag→RLE→Huffman.", tags: ['image', 'concept'], category: 'concept' },
  { front: "DCT produit", back: "1 coefficient DC (moyenne) + 63 coefficients AC (détails).", tags: ['image', 'definition'], category: 'definition' },
  { front: "SAD (Sum of Absolute Differences)", back: "Somme des différences absolues: trouve le meilleur match pour l'estimation de mouvement.", tags: ['video', 'definition'], category: 'definition' },
  { front: "PSNR (Peak Signal-to-Noise Ratio)", back: ">40 dB excellent, 30-40 bon, <30 dégradé.", tags: ['video', 'definition'], category: 'definition' },
  { front: "Fréquence boucle haptique", back: "1000 Hz minimum (perception jusqu'à 500 Hz).", tags: ['haptique', 'formule'], category: 'formula' },
  { front: "Passivité en haptique", back: "Le système ne génère pas d'énergie: Re(Z) ≥ 0.", tags: ['haptique', 'concept'], category: 'concept' },
  { front: "Formule Shannon-Hartley", back: "C = B × log₂(1 + SNR) (capacité max d'un canal).", tags: ['reseau', 'formule'], category: 'formula' },
  { front: "MCU (Multipoint Control Unit)", back: "Mixe les flux (CPU élevé, bande faible).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "SFU (Selective Forwarding Unit)", back: "Relaye les flux (CPU faible, bande élevée).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Débit G.711", back: "64 kbit/s (8 kHz, 8 bits).", tags: ['telecom', 'formule'], category: 'formula' },
  { front: "Débits Opus", back: "6 à 510 kbit/s, latence 5 ms (VoIP).", tags: ['telecom', 'formule'], category: 'formula' },
  { front: "Pourquoi AAC > MP3", back: "MDCT 1024 bandes: +30% d'efficacité. 128 kbit/s AAC ≈ 192 kbit/s MP3.", tags: ['audio', 'concept'], category: 'comparison' },
  { front: "Taille paquet MPEG-2 TS", back: "188 octets (4 header + 184 charge utile).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "RTP", back: "Real-time Transport Protocol: N° séquence + timestamp sur UDP.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "RTCP", back: "Feedback de qualité: perte, gigue, statistiques.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "WebRTC", back: "RTP + SRTP + RTCP + ICE (visio P2P).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "SVC (Scalable Video Coding)", back: "Couches de base + amélioration (spatial/temporel/qualité).", tags: ['video', 'definition'], category: 'definition' },
  { front: "FEC (Forward Error Correction)", back: "Correction d'erreurs sans retransmission.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Deadband haptique", back: "Compression: on supprime les variations < JND (7-10%).", tags: ['haptique', 'concept'], category: 'concept' },
  { front: "Latence typique visio", back: "170 ms (capture 20 + encodage 30 + réseau 40 + jitter 60 + décodage 20).", tags: ['reseau', 'formule'], category: 'formula' },
  { front: "RTSP", back: "Protocole de contrôle (SETUP, PLAY, PAUSE, TEARDOWN). Ne transporte pas les données (utilise RTP).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "SIP", back: "Signalisation VoIP: INVITE, REGISTER, BYE. Composants: UAC, UAS, Proxy, Registrar.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "HLS vs DASH", back: "HLS: .m3u8/.ts (Apple). DASH: .mpd/fMP4 (standard MPEG). Les deux font de l'ABR.", tags: ['reseau', 'comparison'], category: 'comparison' },
  { front: "SRT (Secure Reliable Transport)", back: "Streaming faible latence sur réseaux non fiables (chiffré, ARQ).", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "RTMP", back: "Protocole Adobe pour l'ingestion (OBS→serveur). Faible latence. RTMPS = chiffré.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "QUIC", back: "Transport sur UDP: résout le HoL blocking, 0-RTT, chiffrement intégré. Base de HTTP/3.", tags: ['reseau', 'definition'], category: 'definition' },
  { front: "Types applications multimédia", back: "Stocké (VoD, TCP), Live (streaming, 2-30s), Temps réel interactif (<150 ms, UDP).", tags: ['reseau', 'concept'], category: 'concept' },
  { front: "MOS (Mean Opinion Score)", back: "Note de 1 à 5 donnée par des humains.", tags: ['reseau', 'definition'], category: 'definition' },
] as const

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

  const currentCard = filteredIndices()[currentIndex]
  const card = flashcards[currentCard]

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
          <div className="perspective-1000 mb-6">
            <div
              className={cn(
                'relative w-full max-w-2xl mx-auto h-[320px] sm:h-[380px] cursor-pointer',
                flipped && 'rotate-y-180'
              )}
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip() } }}
              aria-label={flipped ? 'Retour au recto' : 'Voir le verso'}
            >
              {/* Front */}
              <div className="absolute inset-0 w-full h-full rotate-y-0 backface-hidden rounded-2xl bg-gradient-to-br from-card to-card-secondary border border-border shadow-xl flex flex-col items-center justify-center p-8 text-center">
                <span className="badge badge-calc mb-3">{flashcards[currentCard].category}</span>
                <p className="text-lg sm:text-xl text-text leading-relaxed whitespace-pre-wrap">{flashcards[currentCard].front}</p>
                <div className="mt-6 text-text-muted text-sm">Cliquez ou Espace pour retourner</div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-xl flex flex-col items-center justify-center p-8 text-center">
                <span className="badge badge-ok mb-3">RÉPONSE</span>
                <p className="text-lg sm:text-xl text-text leading-relaxed whitespace-pre-wrap">{flashcards[currentCard].back}</p>
                <div className="mt-6 flex gap-2">
                  <span className="badge badge-calc text-xs">{flashcards[currentCard].tags.join(' · ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button onClick={handlePrev} className="btn btn-secondary" disabled={filteredIndices().length <= 1}>
              ◀ Précédente
            </button>
            <button onClick={handleFlip} className="btn btn-primary px-8 py-3 text-lg">
              {flashcards[currentCard] ? '🔄 Retourner' : '🔄'}
            </button>
            <button onClick={() => { setFilteredIndices => handleNext() }} className="btn btn-secondary" disabled={filteredIndices().length <= 1}>
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
        </main>
      </div>
    </div>
  )
}