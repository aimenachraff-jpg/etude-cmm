'use client'

import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import coursContent from '@/content/cours-content.json'

export default function CoursPage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">📖 Cours — Communication Multimédia</h1>
          <p className="text-text-muted">Chapitres 1 & 2: Représentation des données multimédia et transmission.</p>
        </div>
        <div className="card">
          <TDContent html={(coursContent as any).html || ''} />
        </div>
      </main>
    </div>
  )
}
