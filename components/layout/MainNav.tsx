import React from 'react'
import Link from 'next/link'

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 p-4 bg-bg-secondary border-b border-border flex-wrap">
      <Link href="/" className="font-bold text-accent">🏠 Accueil</Link>
      <Link href="/dashboard" className="text-text hover:text-accent">📊 Dashboard</Link>
      <Link href="/cours" className="text-text hover:text-accent">📖 Cours</Link>
      <Link href="/td" className="text-text hover:text-accent">📚 TD</Link>
      <Link href="/lab" className="text-text hover:text-accent">🔬 Lab</Link>
      <Link href="/training" className="text-text hover:text-accent">🏋️ Training</Link>
      <Link href="/exam-page" className="text-text hover:text-accent">📝 Exam</Link>
      <Link href="/flashcards" className="text-text hover:text-accent">🃏 Flashcards</Link>
      <Link href="/formulas" className="text-text hover:text-accent">📐 Formules</Link>
      <Link href="/memento" className="text-text hover:text-accent">🔖 Mémento</Link>
      <Link href="/protocols" className="text-text hover:text-accent">🌐 Protocoles</Link>
      <Link href="/traps" className="text-text hover:text-accent">⚠️ Pièges</Link>
      <Link href="/huffman" className="text-text hover:text-accent">🌳 Huffman</Link>
    </nav>
  )
}
