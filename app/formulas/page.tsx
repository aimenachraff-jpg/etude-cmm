'use client'

import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'

const formulaCategories = [
  {
    id: 'audio',
    label: 'Audio — Numérisation',
    icon: '🎵',
    color: 'audio',
    formulas: [
      { name: 'Période d\'échantillonnage', formula: 'Te = 1 / Fe', unit: 's' },
      { name: 'Fréquence (Hz)', formula: 'f = 1 / T', unit: 'Hz' },
      { name: 'Nyquist (fréquence min)', formula: 'Fe_min = 2 × fmax', unit: 'Hz' },
      { name: 'Niveaux de quantification', formula: '2^B', unit: 'niveaux' },
      { name: 'Pas de quantification', formula: 'Q = (Vmax − Vmin) / 2^B', unit: 'V' },
      { name: 'SNR (Signal-to-Noise Ratio)', formula: 'SNR ≈ 6.02 × B + 1.25', unit: 'dB' },
      { name: 'Débit binaire audio', formula: 'D = Fe × B × C', unit: 'bit/s' },
      { name: 'Taille fichier audio', formula: 'S = D × t / 8', unit: 'octets' },
      { name: 'Durée d\'une trame audio', formula: 't = échantillons / Fe', unit: 'ms' },
      { name: 'Débit CD audio', formula: '44 100 × 16 × 2 = 1 411 200 bit/s', unit: 'bit/s' },
    ]
  },
  {
    id: 'image',
    label: 'Image — Représentation & Compression',
    icon: '🖼️',
    color: 'image',
    formulas: [
      { name: 'Image B/N (1 bit)', formula: 'Taille = L × H / 8', unit: 'octets' },
      { name: 'Niveaux de gris (8 bits)', formula: 'Taille = L × H', unit: 'octets' },
      { name: 'RGB (24 bits)', formula: 'Taille = L × H × 3', unit: 'octets' },
      { name: 'RGBA (32 bits)', formula: 'Taille = L × H × 4', unit: 'octets' },
      { name: 'YCbCr (BT.601)', formula: 'Y = 0.299R + 0.587G + 0.114B', unit: '' },
      { name: '', formula: 'Cb = 128 − 0.1687R − 0.3313G + 0.5B', unit: '' },
      { name: '', formula: 'Cr = 128 + 0.5R − 0.4187G − 0.0813B', unit: '' },
      { name: 'Inverse YCbCr→RGB', formula: 'R = Y + 1.402(Cr−128)', unit: '' },
      { name: '', formula: 'G = Y − 0.344136(Cb−128) − 0.714136(Cr−128)', unit: '' },
      { name: '', formula: 'B = Y + 1.772(Cb−128)', unit: '' },
      { name: 'Droite (vectoriel)', formula: 'P = P0 + t(P1 − P0), t ∈ [0,1]', unit: '' },
      { name: 'Bézier cubique', formula: 'B(t) = (1−t)³P0 + 3(1−t)²tP1 + 3(1−t)t²P2 + t³P3', unit: '' },
      { name: 'DCT 8×8', formula: 'Transformation spatial → fréquentiel (1 DC + 63 AC)', unit: '' },
      { name: 'SAD (estimation mouvement)', formula: 'SAD = Σ |I_courant(i,j) − I_référence(i,j)|', unit: '' },
      { name: 'Résidu', formula: 'Résidu = Bloc réel − Bloc prédit', unit: '' },
    ]
  },
  {
    id: 'video',
    label: 'Vidéo',
    icon: '🎬',
    color: 'video',
    formulas: [
      { name: 'Débit vidéo brut', formula: 'D = L × H × bpp × fps', unit: 'bit/s' },
      { name: 'Taille vidéo brute', formula: 'Taille = Résolution × fps × Profondeur × Durée', unit: 'octets' },
      { name: 'Durée d\'une image vidéo', formula: 't = 1 / fps', unit: 's' },
      { name: 'PSNR (qualité)', formula: 'PSNR = 10·log₁₀(MAX² / MSE)', unit: 'dB' },
      { name: 'SSIM', formula: '0 à 1 (1 = identique)', unit: '' },
      { name: 'Compression H.264', formula: '≈ 100:1', unit: '' },
    ]
  },
  {
    id: 'transmission',
    label: 'Transmission & Réseau',
    icon: '📡',
    color: 'network',
    formulas: [
      { name: 'Capacité de canal (Shannon-Hartley)', formula: 'C = B × log₂(1 + SNR)', unit: 'bit/s' },
      { name: 'Latence bout-en-bout', formula: 'L = capture + encodage + réseau + jitter + décodage', unit: 'ms' },
      { name: 'Gigue', formula: 'Variation du délai de transmission', unit: 'ms' },
      { name: 'Buffer de gigue', formula: '≈ gigue + durée d\'une image', unit: 'ms' },
    ]
  },
  {
    id: 'haptique',
    label: 'Haptique',
    icon: '🤲',
    color: 'video',
    formulas: [
      { name: 'Loi de Hooke', formula: 'F = k × x', unit: 'N' },
      { name: 'Impédance', formula: 'F = K·x + B·v (K=raideur, B=amortissement)', unit: 'N' },
      { name: 'PSNR haptique', formula: '10·log₁₀(P_signal / P_erreur)', unit: 'dB' },
      { name: 'Loi de Weber (JND)', formula: 'Différence perceptible si > 7-10% de la force', unit: '%' },
      { name: 'Loi de Stevens', formula: 'Perception ≈ Intensité^α', unit: '' },
      { name: 'Fréquence haptique', formula: '1000 Hz (boucle fermée)', unit: 'Hz' },
      { name: 'Latence haptique', formula: '< 30 ms (tolérance), <1 ms (kinesthésique)', unit: 'ms' },
    ]
  },
  {
    id: 'qos',
    label: 'QoS — Débits recommandés',
    icon: '📊',
    color: 'network',
    formulas: [
      { name: 'Streaming SD', formula: '3-5 Mbit/s', unit: '' },
      { name: 'Streaming HD (1080p)', formula: '5-10 Mbit/s', unit: '' },
      { name: 'Streaming 4K UHD', formula: '25-50 Mbit/s', unit: '' },
      { name: 'Visioconférence HD', formula: '1-3 Mbit/s', unit: '' },
      { name: 'VoIP (G.711)', formula: '~64 kbit/s', unit: '' },
      { name: 'Gaming en ligne', formula: '3-5 Mbit/s', unit: '' },
      { name: 'Latence temps réel', formula: '< 150-200 ms', unit: 'ms' },
      { name: 'Perte tolérée (VoIP)', formula: '< 1%', unit: '' },
      { name: 'Perte tolérée (vidéo)', formula: '< 0.1%', unit: '' },
    ]
  },
] as const

export default function FormulasPage() {
  const [openCategory, setOpenCategory] = useState<string | null>('audio')

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">📐 Formulaire — Toutes les règles du cours</h1>
          <p className="text-text-muted">Toutes les formules organisées par domaine. Cliquez sur une catégorie pour développer.</p>
        </div>

        <div className="space-y-4">
          {formulaCategories.map((cat) => (
            <details
              key={cat.id}
              className="card group"
              open={openCategory === cat.id}
              onToggle={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
            >
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <span className={cn('text-2xl', `text-${cat.color}`)}>{cat.icon}</span>
                <h3 className="font-semibold text-text flex-1">{cat.label}</h3>
                <span className={cn('text-caption', `text-${cat.color}`)}>⌄</span>
              </summary>
              <div className="px-4 pb-6 animate-slide-down">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="w-1/2">Grandeur</th>
                        <th className="w-1/3">Formule</th>
                        <th>Unité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.formulas.map((f, i) => (
                        <tr key={i} className="group hover:bg-card-secondary/50">
                          <td className="font-medium text-text">{f.name}</td>
                          <td className="font-mono text-accent">{f.formula}</td>
                          <td className="text-text-muted text-caption">{f.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 card p-6">
          <h3 className="font-semibold text-text mb-4">🔑 Raccourcis clavier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-card-secondary rounded-xl">
              <kbd className="px-2 py-1 bg-card rounded text-text">Ctrl/Cmd + K</kbd>
              <span className="ml-2 text-text-muted">Ouvrir la palette de commandes</span>
            </div>
            <div className="p-3 bg-card-secondary rounded-xl">
              <kbd className="px-2 py-1 bg-card rounded text-text">Espace</kbd>
              <span className="ml-2 text-text-muted">Retourner la flashcard</span>
            </div>
            <div className="p-3 bg-card-secondary rounded-xl">
              <kbd className="px-2 py-1 bg-card rounded text-text">← / →</kbd>
              <span className="ml-2 text-text-muted">Flashcard précédente/suivante</span>
            </div>
            <div className="p-3 bg-card-secondary rounded-xl">
              <kbd className="px-2 py-1 bg-card rounded text-text">1 / 2</kbd>
              <span className="ml-2 text-text-muted">Je maîtrise / À revoir</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}