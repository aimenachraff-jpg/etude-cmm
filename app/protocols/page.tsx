'use client'

import { useState } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import protocolsContent from '@/content/protocols-content.json'

export default function ProtocolsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🌐 Protocoles multimédia</h1>
          <p className="text-text-muted">Référence complète des protocoles de communication multimédia.</p>
        </div>
        <div className="card">
          <TDContent html={(protocolsContent as any).html || ''} />
        </div>
      </main>
    </div>
  )
}
