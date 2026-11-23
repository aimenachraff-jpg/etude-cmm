'use client'

import { MainNav } from '@/components/layout/MainNav'
import { TDContent } from '@/components/TDContent'
import homeContent from '@/content/home-content.json'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <TDContent html={(homeContent as any).html || ''} />
      </main>
    </div>
  )
}
