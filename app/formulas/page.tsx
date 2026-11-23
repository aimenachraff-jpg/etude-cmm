'use client'

import { useState } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import formulasContent from '@/content/formulas-content.json'

export default function FormulasPage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">📐 Formules — Référence</h1>
          <p className="text-text-muted">Toutes les formules du module Communication Multimédia.</p>
        </div>
        <div className="card">
          <TDContent html={(formulasContent as any).html || ''} />
        </div>
      </main>
    </div>
  )
}
