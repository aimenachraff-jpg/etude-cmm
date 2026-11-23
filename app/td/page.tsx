'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'
import { useEngine } from '@/hooks/useEngine'
import { TDContent } from '@/components/TDContent'
import tdContent from '@/content/td-content.json'

const tdData = [
  { id: 'TD1', title: 'TD1 — Audio (16 exercices)', color: 'audio', exercises: 16 },
  { id: 'TD2', title: 'TD2 — Image & Vidéo (5 exercices)', color: 'image', exercises: 5 },
  { id: 'TD3', title: 'TD3 — Streaming & Transport (4 exercices)', color: 'network', exercises: 4 },
  { id: 'TD4', title: 'TD4 — Vidéo & Streaming (6 exercices)', color: 'video', exercises: 6 },
  { id: 'TD5', title: 'TD5 — VoIP, RTP, SFU, DASH (8 exercices)', color: 'network', exercises: 8 },
  { id: 'TD6', title: 'TD6 — Télécom & DVI (7 exercices)', color: 'network', exercises: 7 },
] as const

const exerciseDetails: Record<string, Array<{ num: number; title: string; type: string; difficulty: number; formulas: string[] }>> = {
  TD1: [
    { num: 1, title: 'Débit, taille, SNR, codecs (CD 1 min)', type: 'calc', difficulty: 2, formulas: ['D=Fe×B×C', 'S=D×t/8', 'SNR≈6.02B+1.25'] },
    { num: 2, title: 'Nyquist voix (100–3400 Hz)', type: 'calc', difficulty: 1, formulas: ['Fe_min = 2×fmax'] },
    { num: 3, title: 'Numérisation v(t) fe=20Hz, B=5bits', type: 'calc', difficulty: 3, formulas: ['Te=1/fe', 'Q=(Vmax-Vmin)/2^B'] },
    { num: 4, title: 'Taille fichier stéréo 4min15s, 100Hz, 16bits', type: 'calc', difficulty: 2, formulas: ['S = Fe×B×C×t/8'] },
    { num: 5, title: 'Fe inverse: taille 290Mo, 3min30s, 16bits, stéréo', type: 'calc', difficulty: 2, formulas: ['Fe = (Taille×8)/(B×C×t)'] },
    { num: 6, title: 'Fe inverse: taille 325Mo, 10min, 8bits, mono', type: 'calc', difficulty: 2, formulas: ['Fe = (Taille×8)/(B×C×t)'] },
    { num: 7, title: 'Durée inverse: 300Mo, CD stéréo', type: 'calc', difficulty: 2, formulas: ['t = (Taille×8)/(Fe×B×C)'] },
    { num: 8, title: 'Durée inverse: 200Mo, 96kHz, 16bits, stéréo', type: 'calc', difficulty: 2, formulas: ['t = (Taille×8)/(Fe×B×C)'] },
    { num: 9, title: 'Taille 1h20min CD stéréo', type: 'calc', difficulty: 2, formulas: ['S = Fe×B×C×t/8'] },
    { num: 10, title: 'Résolution à partir débit: 256kbps, 44.1kHz, mono, 600Mo', type: 'calc', difficulty: 3, formulas: ['N = Débit/(Fe×C)'] },
    { num: 11, title: 'Combos CBR 512kbps', type: 'calc', difficulty: 2, formulas: ['Fe×B×C = 512000'] },
    { num: 12, title: 'VBR vs CBR 5min, 128/16kbps, silence 90s', type: 'calc', difficulty: 2, formulas: ['VBR = BR_appel×t_parole + BR_silence×t_silence'] },
    { num: 13, title: 'Audacity: WAV→256k→8k→256k', type: 'lab', difficulty: 3, formulas: [] },
    { num: 14, title: 'Comparatif 8 vs 32 bits WAV', type: 'lab', difficulty: 2, formulas: [] },
    { num: 15, title: 'Codecs: WAV 512k, MP3 96k, GSM 13k', type: 'lab', difficulty: 2, formulas: [] },
    { num: 16, title: 'QCM: Taille CD 15min (binaire)', type: 'qcm', difficulty: 2, formulas: ['S = Fe×B×C×t/8 / 1024²'] },
  ],
  TD2: [
    { num: 1, title: 'Huffman probabilités (21,95,169,243 ; 3/8,1/8,1/8,3/8)', type: 'calc', difficulty: 3, formulas: ['Arbre binaire', 'Codes variables', 'Entropie'] },
    { num: 2, title: 'Huffman sur matrice 8×8 (niveaux 0,63,127,255)', type: 'calc', difficulty: 3, formulas: ['Fréquences', 'Arbre', 'Codage', 'Remplacement'] },
    { num: 3, title: 'Débit vidéo brut Full HD 1080p 30fps 24bpp', type: 'calc', difficulty: 2, formulas: ['D = L×H×bpp×fps'] },
    { num: 4, title: 'Format TV HD 1280×720 25fps, Y=8b, C=4b', type: 'calc', difficulty: 2, formulas: ['12 bits/pixel'] },
    { num: 5, title: 'Compression MPEG-1 GOP IBBPBBIBBP (2min, 60Mo)', type: 'calc', difficulty: 3, formulas: ['GOP=10', 'Poids=4.2', 'Moyenne=0.42'] },
    { num: 6, title: 'Tableau résolutions 24fps 24bpp (144p…1080p)', type: 'calc', difficulty: 3, formulas: ['Convention binaire (MiB/GiB)'] },
    { num: 7, title: 'QCM: Inconvénient maximiser B-frames', type: 'qcm', difficulty: 2, formulas: [] },
  ],
  TD3: [
    { num: 1, title: 'Couche PTS/DTS, protocoles VOD vs temps réel', type: 'concept', difficulty: 2, formulas: [] },
    { num: 2, title: 'Ordre décodage/affichage PTS/DTS', type: 'concept', difficulty: 3, formulas: [] },
    { num: 3, title: 'Topologies Broadcast/Multicast/Unicast (3 cas)', type: 'design', difficulty: 2, formulas: [] },
    { num: 4, title: 'Netflix vs Meet design + latence', type: 'design', difficulty: 3, formulas: ['Latence = Σ composants'] },
  ],
  TD4: [
    { num: 1, title: 'Débit Full HD brut + H.264 100:1 + ADSL 8M', type: 'calc', difficulty: 2, formulas: ['D = L×H×bpp×fps', 'D_comp = D/100'] },
    { num: 2, title: 'Buffer drain: 5Mbps sur 4Mbps, buffer 10s', type: 'calc', difficulty: 2, formulas: ['Buffer = Dv×t_init', 'Déficit = Dv-Dr', 't_freeze = Buffer/Déficit'] },
    { num: 3, title: 'Timestamps RTP audio 48kHz / vidéo 90kHz', type: 'calc', difficulty: 3, formulas: ['t_audio = samples/Fe', 't_video = 1/fps'] },
    { num: 4, title: 'Jitter buffer: gigue 100ms, 25fps', type: 'calc', difficulty: 2, formulas: ['Buffer ≈ gigue + 1 frame'] },
    { num: 5, title: 'Encapsulation ES→PES→MP4/TS', type: 'concept', difficulty: 2, formulas: [] },
    { num: 6, title: 'Taille film 1h 1080p24: brut + YouTube 4.5M+128k', type: 'calc', difficulty: 2, formulas: ['Brut = L×H×3×fps×3600', 'Compressé = (BR_vid+BR_aud)×3600/8'] },
  ],
  TD5: [
    { num: 1, title: 'Latence VoIP G.711: 20+20+80+40+20 = 180ms', type: 'calc', difficulty: 2, formulas: ['Latence = Σ composants', 'G.114: ≤150 optimal, ≤400 acceptable'] },
    { num: 2, title: 'Gigue RTP: délais 20,35,22,60,25,80ms', type: 'calc', difficulty: 3, formulas: ['max-min', 'MAD', 'mean|Δ|', 'RFC3550'] },
    { num: 3, title: 'SFU 12 participants: 2.5Mbps+64kbps each', type: 'calc', difficulty: 3, formulas: ['Up = V+A', 'Down = (N-1)×(V+A)', 'SFU_in = N×(V+A)', 'SFU_out = N×(N-1)×(V+A)'] },
    { num: 4, title: 'ABR DASH: 5→1→0.3→4 Mbps, 3 rendus', type: 'design', difficulty: 2, formulas: [] },
    { num: 5, title: 'Perte I dans MPEG GOP 12 (IBBPBBPBBPBB)', type: 'concept', difficulty: 2, formulas: [] },
    { num: 6, title: 'Désync A/V: H.264 120ms vs Opus 20ms = 100ms', type: 'calc', difficulty: 2, formulas: ['Décalage = enc_vid - enc_aud'] },
    { num: 7, title: 'Multi-site visio: 40, 100, 180ms', type: 'design', difficulty: 2, formulas: [] },
    { num: 8, title: 'Télémédecine Oran: 20×2.564=51.28Mbps sur 100M', type: 'design', difficulty: 3, formulas: ['Bande = N × (V+A)'] },
  ],
  TD6: [
    { num: 1, title: 'PCM G.711 64kbps: voix 4kHz → Fe=8kHz, 8bits', type: 'calc', difficulty: 2, formulas: ['Fe = 2×fmax = 8kHz', 'Débit = Fe × bits = 64kbps'] },
    { num: 2, title: 'Dimensionnement E1: 2000 abonnés, 10%, E1=30 canaux', type: 'calc', difficulty: 2, formulas: ['Appels = Abonnés × Taux', 'E1 = ceil(Appels/30)', 'Transits = ceil(E1/20)'] },
    { num: 3, title: 'Codecs voix: 50 appels G.711 87.2k vs Opus 40k', type: 'calc', difficulty: 2, formulas: ['Bande = N × BR_overhead'] },
    { num: 4, title: 'MCU vs SFU 6 participants', type: 'calc', difficulty: 2, formulas: ['SFU: N up + N(N-1) down', 'MCU: 1 flux/client'] },
    { num: 5, title: 'DVI-D/A/I, Single/Dual Link, max Single', type: 'concept', difficulty: 2, formulas: [] },
    { num: 6, title: 'DVI-D → VGA adaptateur passif impossible', type: 'concept', difficulty: 2, formulas: [] },
    { num: 7, title: '1080i60 vs 1080p30: interlacé avantage 2000', type: 'concept', difficulty: 2, formulas: [] },
  ],
}

const typeBadges = {
  calc: 'badge-calc',
  concept: 'badge-concept',
  design: 'badge-design',
  qcm: 'badge-qcm',
  lab: 'badge-lab',
}

const typeLabels = {
  calc: 'Calcul',
  concept: 'Concept',
  design: 'Design',
  qcm: 'QCM',
  lab: 'Labo',
}

export default function TDPage() {
  const [selectedTD, setSelectedTD] = useState<string>('TD1')
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({})
  const { getForTD } = useEngine()

  const exercises = exerciseDetails[selectedTD] || []

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">TD Explorer</h1>
          <p className="text-text-muted">Tous les exercices des TD1–TD6 avec énoncés, solutions détaillées et générateur de variantes.</p>
        </div>

        {/* TD Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tdData.map((td) => (
            <button
              key={td.id}
              onClick={() => setSelectedTD(td.id)}
              className={cn(
                'px-4 py-2 rounded-xl font-medium transition-all duration-150',
                selectedTD === td.id
                  ? `bg-gradient-to-r from-${td.color} to-${td.color}/80 text-white shadow-lg`
                  : 'bg-card-secondary text-text-muted hover:bg-card hover:text-text'
              )}
            >
              {td.title}
            </button>
          ))}
        </div>

        {/* Exercise Content */}
        <div className="card">
          <TDContent html={(tdContent as any)[selectedTD] || ''} />
        </div>
      </main>
    </div>
  )
}

function ExerciseCard({ tdId, exercise, isExpanded, onToggle }: {
  tdId: string
  exercise: { num: number; title: string; type: string; difficulty: number; formulas: string[] }
  isExpanded: boolean
  onToggle: () => void
}) {
  const typeClass = typeBadges[exercise.type as keyof typeof typeBadges] || 'badge-calc'
  const typeLabel = typeLabels[exercise.type as keyof typeof typeLabels] || exercise.type

  return (
    <div className="card-interactive group">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 p-4"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn('badge font-mono', typeClass)}>{typeLabel}</span>
            <span className="text-caption text-text-muted">Exercice {exercise.num}</span>
            <div className="flex gap-1">
              {Array.from({ length: exercise.difficulty }, (_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-accent/50" />
              ))}
            </div>
          </div>
          <h3 className="font-medium text-text pr-4">{exercise.title}</h3>
          {exercise.formulas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {exercise.formulas.map((f, i) => (
                <span key={i} className="badge badge-calc text-xs font-mono">{f}</span>
              ))}
            </div>
          )}
        </div>
        <button
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-card transition-colors shrink-0"
          aria-label={isExpanded ? 'Masquer la solution' : 'Voir la solution'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </button>

      {isExpanded ? (
        <div className="border-t border-border px-4 pb-4 animate-slide-down">
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              <Link href={`/training?td=${tdId}&ex=${exercise.num}`} className="btn btn-primary text-sm">
                🏋️ S'entraîner (générateur)
              </Link>
              <Link href={`/exam-page?td=${tdId}&ex=${exercise.num}`} className="btn btn-secondary text-sm">
                📝 Examen ciblé
              </Link>
              <button className="btn btn-ghost text-sm">📋 Copier l'énoncé</button>
            </div>

            <div className="prose prose-invert max-w-none text-sm">
              <h4 className="font-semibold text-text mb-2">Énoncé complet</h4>
              <p className="text-text-muted mb-4">L'énoncé complet de l'exercice {exercise.num} du {tdId}...</p>

              <h4 className="font-semibold text-text mb-2 mt-4">Solution détaillée</h4>
              <div className="space-y-3 text-text-muted">
                <p><strong>Étape 1 :</strong> Identifier les données et la formule appropriée.</p>
                <p><strong>Étape 2 :</strong> Convertir les unités si nécessaire (minutes → secondes, kbit → bit, etc.).</p>
                <p><strong>Étape 3 :</strong> Appliquer la formule avec les valeurs numériques.</p>
                <p><strong>Étape 4 :</strong> Vérifier l'unité du résultat et l'ordre de grandeur.</p>
                <p><strong>Résultat :</strong> Voir la solution complète dans le générateur.</p>
              </div>

              <h4 className="font-semibold text-text mb-2 mt-4">💡 Pièges à éviter</h4>
              <ul className="list-disc list-inside space-y-1 text-text-muted">
                <li>Ne pas oublier le facteur ×2 pour le stéréo</li>
                <li>Convertir les minutes en secondes (×60)</li>
                <li>Attention : 1 Mo = 10⁶ octets (décimal) vs 1 MiB = 2²⁰ octets (binaire)</li>
                <li>Nyquist : Fe ≥ 2 × fmax (pas Fe ≥ fmax)</li>
                <li>Compter correctement les I, P, B dans un GOP</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}