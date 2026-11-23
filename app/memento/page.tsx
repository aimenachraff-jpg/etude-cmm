'use client'

import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'

const mementos = [
  { title: 'Multimédia', content: 'Intégration texte/image/son/vidéo/interactivité synchronisée.', category: 'general' },
  { title: 'Média discret vs continu', content: 'Discret = indépendant du temps (texte, image fixe). Continu = dépendant du temps (audio, vidéo).', category: 'general' },
  { title: 'Fichier vs Flux', content: 'Fichier = taille connue, accès aléatoire. Flux = temps réel, buffer, ABR.', category: 'general' },
  { title: 'Échantillonnage', content: 'Découpage temporel. Fe = 1/Te. Fe ≥ 2×fmax (Nyquist). Aliasing si Fe < 2×fmax.', category: 'audio' },
  { title: 'Quantification', content: 'Amplitude sur B bits. 2^B niveaux. Pas Q = (Vmax−Vmin)/2^B. SNR ≈ 6.02B+1.25 dB.', category: 'audio' },
  { title: 'Psychoacoustique', content: 'Masquage fréquentiel (son fort masque son faible proche). Masquage temporel (5ms avant, 100ms après). Courbes Fletcher-Munson.', category: 'audio' },
  { title: 'Codage audio', back: 'Sans perte: FLAC/ALAC ~50%. Avec perte: MP3 (32 sous-bandes), AAC (+30% vs MP3), Opus (6-510 kbit/s, 5ms).', category: 'audio' },
  { title: 'Huffman', content: 'Code à longueur variable. Fréquents → codes courts. Optimal pour distribution donnée. Entropie H = -Σ p log₂ p.', category: 'image' },
  { title: 'DCT', content: 'Spatial → fréquentiel. 8×8 blocs. 1 DC (moyenne) + 63 AC (détails). Base JPEG/MPEG.', category: 'image' },
  { title: 'JPEG (chaîne)', content: 'RGB→YCbCr→sous-échant. 4:2:0→DCT 8×8→Quantification→Zigzag→RLE→Huffman. DC différentiel, AC en (zéros, valeur), EOB.', category: 'image' },
  { title: 'Sous-échantillonnage 4:2:0', content: 'Y pleine résolution, Cb/Cr ÷2 horiz. et vert. → −50% taille. JPEG, H.264, YouTube, Netflix.', category: 'image' },
  { title: 'Images I, P, B', content: 'I = intra (complète, référence). P = prédite (précédente). B = bidirectionnelle (avant+après, buffer).', category: 'video' },
  { title: 'GOP', content: 'Group of Pictures = séquence entre deux I. Ex: IBBPBBIBBP = 10 images (I=2, P=2, B=6). Poids: I=100%, P=50%, B=20%.', category: 'video' },
  { title: 'PTS vs DTS', content: 'PTS = Presentation Time Stamp (affichage). DTS = Decoding Time Stamp (décodage). B: DTS > PTS. Lip-sync via PTS.', category: 'video' },
  { title: 'Estimation mouvement', content: 'Macroblocs 16×16. Recherche meilleur match (SAD = Σ|diff|). Vecteur (dx,dy). Résidu = réel − prédit → DCT+quantif+Huffman.', category: 'video' },
  { title: 'Compression H.264/HEVC', content: 'H.264 ≈ 100:1. HEVC (H.265) ≈ 2× mieux. AV1 ≈ 3×. SVC = couches scalables (spatial/temporel/qualité).', category: 'video' },
  { title: 'PSNR / SSIM', content: 'PSNR = 10·log₁₀(MAX²/MSE) dB. >40 excellent, 30-40 bon, <30 dégradé. SSIM: 0-1 (1=identique).', category: 'video' },
  { title: 'Transport (TCP/UDP)', content: 'TCP = fiable, lent (HoL blocking) → VOD. UDP = rapide, best-effort → temps réel. RTP/RTCP sur UDP.', category: 'network' },
  { title: 'RTP / RTCP', content: 'RTP = transport temps réel (N° séquence + timestamp + SSRC + payload type). RTCP = feedback QoS (perte, gigue, RTT).', category: 'network' },
  { title: 'PTS/DTS pour lip-sync', content: 'RTCP Sender Report avec timestamps NTP aligne horloges RTP audio/vidéo. Tolérance lip-sync ~40-80ms.', category: 'network' },
  { title: 'Modes diffusion', content: 'Broadcast (un→tous, TNT). Multicast (un→groupe, IGMP, IPTV). Unicast (un→un, Netflix, 4G, ABR).', category: 'network' },
  { title: 'ABR / DASH', content: 'Adaptation débit dynamique. Serveur encode N qualités. Client mesure BP et bascule (ex: 4K→480p si BP chute).', category: 'network' },
  { title: 'QoS', content: 'Débit (SD 3-5, HD 5-10, 4K 25-50 Mbit/s). Latence (temps réel <150ms). Gigue (buffer). Perte (VoIP <1%, vidéo <0.1%). MOS 1-5.', category: 'network' },
  { title: 'DiffServ / IntServ', content: 'IntServ = réservation ressources (RSVP). DiffServ = priorisation paquets (classes de service, DSCP).', category: 'network' },
  { title: 'MCU vs SFU', content: 'MCU = mixe flux (CPU élevé, bande client faible). SFU = relaie flux (CPU faible, bande serveur élevée).', category: 'network' },
  { title: 'Haptique', content: 'Boucle 1000 Hz. Latence <30ms (tolérance), <1ms (kinesthésique). Passivité: Re(Z)≥0. JND 7-10% (Weber). Deadband compression.', category: 'haptique' },
  { title: 'PCM G.711', content: 'Voix 4kHz max → Fe=8kHz (Nyquist). 8 bits (loi A/μ). Débit = 64 kbit/s. Standard téléphonique.', category: 'telecom' },
  { title: 'E1', content: '2.048 Mbit/s = 32 TS × 64 kbit/s. TS0=sync, TS16=signalisation. 30 canaux voix. 2000 abonnés ×10% = 200 appels → 7 E1.', category: 'telecom' },
  { title: 'DVI', content: 'DVI-D=numérique, DVI-A=analogique, DVI-I=les deux. Single Link max 1920×1200@60Hz. Dual Link 2560×1600@60Hz.', category: 'telecom' },
  { title: 'Interlacé vs Progressif', content: '1080i60 = 60 champs/s (entrelacé). 1080p30 = 30 images/s (progressif). Interlacé: économie bande passante 2000. Aujourd\'hui progressif (qualité, pas peigne).', category: 'video' },
] as const

export default function MementoPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all')

  const categories = [...new Set(mementos.map(m => m.category))].sort()

  const filtered = mementos.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                         m.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🔖 Mémento — Fiches de révision rapides</h1>
          <p className="text-text-muted">L'essentiel à retenir pour l'examen. Chaque fiche = 1 concept clé.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..."
              className="input"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-auto min-w-[180px]"
          >
            <option value="all">Toutes</option>
            {['all', 'audio', 'video', 'image', 'network', 'telecom', 'haptique', 'general'].map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Toutes' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <div key={i} className={cn('card p-4 hover:shadow-lg transition-shadow', `border-l-4 border-${m.category}`)}>
              <div className="flex items-start gap-3">
                <span className={cn('text-xl', `text-${m.category}`)}>📌</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-text mb-1">{m.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            Aucun résultat pour « {search} » dans la catégorie {filterCategory}
          </div>
        )}

        <div className="mt-8 card p-6 bg-gradient-to-r from-audio/10 to-image/10 border-audio/20">
          <h3 className="font-semibold text-text mb-3">🖨️ Générer une fiche de révision imprimable (A4)</h3>
          <p className="text-text-muted mb-4">Cochez les thèmes à inclure, puis imprimez (Ctrl+P).</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {['audio', 'video', 'image', 'network', 'telecom', 'haptique', 'general'].map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-audio border-border focus:ring-audio" />
                <span className="text-sm text-text capitalize">{cat}</span>
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Imprimer / Sauvegarder en PDF
          </button>
        </div>
      </main>
    </div>
  )
}