'use client'

import { useState } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import mementoContent from '@/content/memento-content.json'

export default function MementoPage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🔖 Mémento — Aide-mémoire</h1>
          <p className="text-text-muted">Fiches de révision rapides pour l'examen.</p>
        </div>
        <div className="card">
          <TDContent html={(mementoContent as any).html || ''} />
        </div>
      </main>
    </div>
  )
}
