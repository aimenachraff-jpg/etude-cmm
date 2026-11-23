import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Étude CMM — Communication Multimédia Master 2 IAA',
    template: '%s | Étude CMM',
  },
  description: 'Plateforme de révision et préparation aux examens pour le module Communication Multimédia (Master 2 IAA, USTO-MB, Dr. BELHERAZEM.A)',
  keywords: ['communication multimédia', 'master 2 IAA', 'USTO-MB', 'révision', 'examen', 'TD', 'audio', 'vidéo', 'streaming', 'réseau'],
  authors: [{ name: 'Équipe Master 2 IAA' }],
  creator: 'Étude CMM',
  publisher: 'USTO-MB',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://etude-cmm.vercel.app',
    title: 'Étude CMM — Communication Multimédia',
    description: 'Plateforme de révision complète pour le module Communication Multimédia',
    siteName: 'Étude CMM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Étude CMM',
    description: 'Préparation aux examens Communication Multimédia Master 2 IAA',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}