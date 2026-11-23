'use client'

import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import huffContent from '@/content/huff-content.json'

export default function HuffmanPage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🌳 Huffman — Calculateur</h1>
          <p className="text-text-muted">Calculateur d'arbre de Huffman pour la compression.</p>
        </div>
        <div className="card">
          <TDContent html={(huffContent as any).html || ''} loadScript={() => import('@/content/huff-script').then(m => m.huffScript)} />
        </div>
      </main>
    </div>
  )
}
