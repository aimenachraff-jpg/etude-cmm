'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { MainNav } from '@/components/layout/MainNav'
import { ProgressBar, CircularProgress } from '@/components/layout/ProgressBar'
import { cn, formatDuration } from '@/lib/utils'
import { useEngine } from '@/hooks/useEngine'

const skills = [
  { id: 'audio-numerisation', label: 'Audio: Numérisation', icon: '🎵', domain: 'audio' },
  { id: 'audio-taille-debit', label: 'Audio: Taille/Débit', icon: '📊', domain: 'audio' },
  { id: 'image-huffman', label: 'Image: Huffman', icon: '🖼️', domain: 'image' },
  { id: 'video-gop', label: 'Vidéo: GOP', icon: '🎬', domain: 'video' },
  { id: 'transport-pts-dts', label: 'Transport: PTS/DTS', icon: '📦', domain: 'network' },
  { id: 'qos-latence-gigue', label: 'QoS: Latence/Gigue', icon: '⚡', domain: 'network' },
  { id: 'conference-sfu-mcu', label: 'Conférence: SFU/MCU', icon: '👥', domain: 'network' },
  { id: 'telecom-e1-dvi', label: 'Télécom: E1/DVI', icon: '📡', domain: 'network' },
] as const

const domainColors = {
  audio: 'bg-audio/20 text-audio border-audio/30',
  image: 'bg-image/20 text-image border-image/30',
  video: 'bg-video/20 text-video border-video/30',
  network: 'bg-network/20 text-network border-network/30',
}

const quickActions = [
  { href: '/exam-page', label: 'Lancer un examen blanc', icon: '📝', variant: 'primary' },
  { href: '/training', label: 'S\'entraîner (générateur)', icon: '🏋️', variant: 'secondary' },
  { href: '/flashcards', label: 'Flashcards (révision)', icon: '🃏', variant: 'secondary' },
  { href: '/td', label: 'Explorer les TD', icon: '📚', variant: 'ghost' },
] as const

export default function DashboardPage() {
  const { user, skillReadiness, streak, lastActive, examHistory, skillReadiness: readiness } = useStore()
  const [mountDate, setMountDate] = useState<Date>(new Date())
  const [countdown, setCountdown] = useState<string>('—')
  const { generateExam } = useEngine()

  useEffect(() => {
    if (!user) return
    const updateCountdown = () => {
      if (user.testDate) {
        const diff = user.testDate - Date.now()
        if (diff <= 0) {
          setCountdown('EXAMEN AUJOURD\'HUI !')
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          setCountdown(`${days}j ${hours}h`)
        }
      } else {
        setCountdown('Date non définie')
      }
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [user])

  const avgReadiness = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + (readiness[s.id] || 0), 0) / skills.length)
    : 0

  const weakestSkill = skills.reduce((min, s) => (readiness[s.id] || 0) < (readiness[min.id] || 100) ? s : min, skills[0])

  const lastExam = examHistory[0]
  const lastScore = lastExam ? `${lastExam.score?.toFixed(1) || '—'} / ${lastExam.config?.questionCount || '—'}` : '—'

  const dueCount = 42 // Would come from SRS in real implementation

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Bonjour, {user?.displayName || 'Étudiant'}</h1>
              <p className="text-text-muted mt-1">Prêt pour l'examen ? Votre progression : <span className="font-bold text-accent">{avgReadiness}%</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-caption text-text-muted">Prochain examen</span>
                <span className="font-mono text-lg font-bold text-accent">{countdown}</span>
              </div>
              <Link href="/settings" className="btn btn-ghost">⚙️ Réglages</Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-text-muted">Score global</p>
                  <p className="text-3xl font-bold font-mono tabular-nums text-text">{avgReadiness}%</p>
                </div>
                <CircularProgress value={avgReadiness} size={56} strokeWidth={6} className="text-accent">
                  <span className="text-caption font-mono text-text-muted">{avgReadiness}%</span>
                </CircularProgress>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-text-muted">Série actuelle</p>
                  <p className="text-3xl font-bold font-mono tabular-nums text-text">{streak}j</p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-text-muted">Dernier examen</p>
                  <p className="text-3xl font-bold font-mono tabular-nums text-text">{lastScore}</p>
                </div>
                <span className="text-4xl">📝</span>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-text-muted">Cartes dues</p>
                  <p className="text-3xl font-bold font-mono tabular-nums text-warn">{dueCount}</p>
                </div>
                <span className="text-4xl">🃏</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`card-interactive flex flex-col items-center gap-2 p-4 text-center ${action.variant === 'primary' ? 'bg-gradient-to-br from-audio/10 to-image/10 border-audio/20' : action.variant === 'secondary' ? 'bg-card-secondary/50' : 'hover:bg-card'}`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium text-text">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Readiness breakdown */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Compétences — Niveau de préparation</h2>
            <Link href="/skills" className="btn btn-ghost text-caption">Voir détail</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {skills.map((skill) => {
              const score = readiness[skill.id] || 0
              const color = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'
              return (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className={`card-interactive p-4 flex items-center gap-3 group ${domainColors[skill.domain]}`}
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{skill.label}</p>
                    <ProgressBar value={score} color={color === 'success' ? 'success' : color === 'warning' ? 'warning' : 'error'} className="mt-1.5 h-1.5" />
                    <p className="text-caption text-text-muted mt-1">{score}% — {score >= 70 ? 'Solide' : score >= 40 ? 'À travailler' : 'Critique'}</p>
                  </div>
                  <CircularProgress value={score} size={44} strokeWidth={5} className="text-accent">
                    <span className="text-caption font-mono font-bold">{score}%</span>
                  </CircularProgress>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Weakness focus */}
        <section className="mb-8">
          <div className="card bg-warn/10 border-warn/30 p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">🎯</span>
              <div className="flex-1">
                <h3 className="font-semibold text-text">Point faible détecté : {weakestSkill.label}</h3>
                <p className="text-text-muted mt-1">Votre score : {readiness[weakestSkill.id] || 0}%. C'est votre compétence la plus faible.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link href={`/training?skill=${weakestSkill.id}`} className="btn btn-domain-audio text-sm">S'entraîner sur ce type</Link>
                  <Link href={`/td?skill=${weakestSkill.id}`} className="btn btn-secondary text-sm">Voir les TD liés</Link>
                  <Link href={`/exam-page?focus=${weakestSkill.id}`} className="btn btn-ghost text-sm">Examen ciblé</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-lg font-semibold text-text mb-4">Dernière activité</h2>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Sujet</th>
                    <th>Score</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                    {examHistory.slice(0, 5).length > 0 ? (
                      examHistory.slice(0, 5).map((exam, i) => (
                        <tr key={i}>
                          <td className="font-mono text-caption">{new Date(exam.startTime).toLocaleDateString('fr-FR')}</td>
                          <td><span className="badge badge-qcm">Examen</span></td>
                          <td className="text-text">{exam.config?.tdScope?.join(', ') || 'Mixte'}</td>
                          <td className="font-mono font-medium">{exam.score?.toFixed(1) || '—'} / {exam.config?.questionCount || '—'}</td>
                          <td className="text-text-muted">{exam.endTime ? Math.round((exam.endTime - exam.startTime) / 60000) + ' min' : '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-text-muted">Aucun examen passé encore. Lancez votre premier examen blanc !</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </main>
    </div>
  )
}