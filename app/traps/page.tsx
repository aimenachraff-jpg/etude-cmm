'use client'

import { useState } from 'react'

import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'

const traps = [
  {
    id: 'stereo',
    title: 'Oublier le facteur ×2 pour le stéréo',
    wrong: 'D = Fe × B = 44100 × 16 = 705.6 kbit/s',
    right: 'D = Fe × B × 2 = 44100 × 16 × 2 = 1411.2 kbit/s',
    explanation: 'Le stéréo a 2 canaux (gauche + droit). Toujours multiplier par le nombre de canaux C.',
    category: 'audio',
  },
  {
    id: 'bits-to-bytes',
    title: 'Oublier la division par 8 (bits → octets)',
    wrong: 'Taille = 1 411 200 × 60 = 84 672 000 octets',
    right: 'Taille = 1 411 200 × 60 / 8 = 10 584 000 octets',
    explanation: 'Le débit est en bits/seconde, la taille de fichier en octets. Toujours diviser par 8.',
    category: 'audio',
  },
  {
    id: 'decimal-binary',
    title: 'Confusion 1000 vs 1024 (décimal vs binaire)',
    wrong: '15 min CD = 151.4 Mo (en divisant par 1000²)',
    right: '15 min CD = 151.4 MiB (en divisant par 1024² = 1 048 576)',
    explanation: 'En informatique, les tailles de fichier sont souvent en binaire (MiB = 1024²). Les débits réseau sont en décimal (kbit/s = 1000). Vérifier la convention attendue.',
    category: 'general',
  },
  {
    id: 'minutes-seconds',
    title: 'Minutes non converties en secondes',
    wrong: 'Taille = 44100 × 16 × 2 × 4min15s / 8 = 44100 × 16 × 2 × 4.15 / 8',
    right: 'Taille = 44100 × 16 × 2 × 255s / 8 = 44100 × 16 × 2 × (4×60+15) / 8',
    explanation: 'Toutes les formules de débit/taille utilisent des secondes. Convertir min → s (×60) et h → s (×3600).',
    category: 'general',
  },
  {
    id: 'nyquist',
    title: 'Nyquist : oublier le facteur 2',
    wrong: 'Voix max 3400 Hz → Fe = 3400 Hz',
    right: 'Voix max 3400 Hz → Fe_min = 2 × 3400 = 6800 Hz (pratique 8000 Hz)',
    explanation: 'Théorème de Nyquist-Shannon : Fe ≥ 2 × fmax. Le facteur 2 est obligatoire.',
    category: 'audio',
  },
  {
    id: 'gop-count',
    title: 'Compter incorrectement les I, P, B dans un GOP',
    wrong: 'GOP IBBPBBIBBP → 8 images (I=1, P=2, B=5)',
    right: 'GOP IBBPBBIBBP → 10 images (I=2, P=2, B=6). Compter chaque lettre.',
    explanation: 'Chaque lettre du pattern = 1 image. I=référence, P=prédite, B=bidirectionnelle. Compter exactement.',
    category: 'video',
  },
  {
    id: 'pts-dts',
    title: 'Confusion PTS (affichage) vs DTS (décodage)',
    wrong: 'Image B : DTS=0, PTS=80 → décodée avant I',
    right: 'Image B : DTS=80, PTS=0 → décodée APRÈS I et P, mais affichée AVANT',
    explanation: 'DTS = ordre de décodage (croissant). PTS = ordre d\'affichage (croissant). Pour les B-frames : DTS > PTS car elles dépendent d\'images futures.',
    category: 'video',
  },
  {
    id: 'ms-vs-s',
    title: 'Confusion millisecondes / secondes',
    wrong: 'Latence = 20 + 30 + 40 + 60 + 20 = 170 s',
    right: 'Latence = 20 + 30 + 40 + 60 + 20 = 170 ms',
    explanation: 'Tous les composants de latence sont en millisecondes. Ne pas confondre avec les secondes.',
    category: 'general',
  },
  {
    id: 'jitter-definition',
    title: 'Gigue : mauvaise définition',
    wrong: 'Gigue = perte de paquets',
    right: 'Gigue = variation du délai de transmission (écart-type ou max-min des délais)',
    explanation: 'La gigue (jitter) est la variation du délai, pas la perte. La perte se mesure en % de paquets perdus.',
    category: 'network',
  },
  {
    id: 'buffer-sizing',
    title: 'Taille buffer de gigue mal calculée',
    wrong: 'Buffer = gigue seulement (ex: 100 ms)',
    right: 'Buffer ≈ gigue + durée d\'une image (ex: 100 + 40 = 140 ms pour 25 fps)',
    explanation: 'Le buffer doit absorber la gigue ET contenir au moins une image complète pour le décodage.',
    category: 'video',
  },
  {
    id: 'tcp-udp',
    title: 'TCP vs UDP : mauvais choix',
    wrong: 'Visio temps réel sur TCP (fiable)',
    right: 'Visio temps réel sur UDP (rapide, pas de retransmission). VOD sur TCP (buffer).',
    explanation: 'TCP = fiable mais lent (HoL blocking) → VOD. UDP = rapide, best-effort → temps réel. RTP/RTCP sur UDP.',
    category: 'network',
  },
  {
    id: 'unicast-multicast',
    title: 'Broadcast / Multicast / Unicast : confusion',
    wrong: '5000 étudiants en amphi → Unicast',
    right: '5000 étudiants en amphi → Broadcast. 500 en fibre IPTV → Multicast. 50000 en 4G → Unicast (ABR).',
    explanation: 'Broadcast = un→tous (TNT). Multicast = un→groupe géré (IPTV). Unicast = un→un (Netflix, 4G).',
    category: 'network',
  },
  {
    id: 'cbr-vbr',
    title: 'CBR vs VBR : confusion',
    wrong: 'VBR = débit constant, CBR = variable',
    right: 'CBR = Constant Bit Rate (débit constant). VBR = Variable Bit Rate (débit variable, économise ~30%).',
    explanation: 'CBR = Constant Bit Rate. VBR = Variable Bit Rate. Le VBR adapte le débit à la complexité du signal.',
    category: 'audio',
  },
  {
    id: 'mcu-sfu',
    title: 'MCU vs SFU : confusion',
    wrong: 'SFU = mixe les flux, MCU = relaie',
    right: 'MCU = Multipoint Control Unit (mixe, CPU élevé, bande client faible). SFU = Selective Forwarding Unit (relaie, CPU faible, bande serveur élevée).',
    explanation: 'MCU = mixage centralisé (transcodage). SFU = relayage sélectif (pas de transcodage).',
    category: 'network',
  },
  {
    id: 'snr-psnr',
    title: 'SNR (audio) vs PSNR (vidéo) : confusion',
    wrong: 'PSNR audio = 97 dB pour 16 bits',
    right: 'SNR audio = 6.02×B+1.25 dB. PSNR vidéo = 10·log₁₀(MAX²/MSE) dB. Différents domaines, différentes formules.',
    explanation: 'SNR = Signal-to-Noise Ratio (audio, théorique). PSNR = Peak Signal-to-Noise Ratio (vidéo, mesuré).',
    category: 'general',
  },
  {
    id: 'dvi-d-vga',
    title: 'DVI-D → VGA avec adaptateur passif',
    wrong: 'DVI-D → adaptateur passif → VGA = OK',
    right: 'Impossible. DVI-D n\'a pas de signal analogique. Faut DVI-I (qui a l\'analogique) ou convertisseur actif.',
    explanation: 'DVI-D = numérique seul. DVI-A = analogique seul. DVI-I = les deux. Passif ne convertit pas numérique→analogique.',
    category: 'telecom',
  },
  {
    id: 'interlaced-progressive',
    title: '1080i60 vs 1080p30 : même débit ?',
    wrong: '1080i60 et 1080p30 ont le même débit brut',
    right: '1080i60 = 1920×1080×24×30 fps (champs) ≈ 1.49 Gbit/s. 1080p30 = même résolution mais 30 images complètes.',
    explanation: 'L\'entrelacé envoie 60 demi-images (champs) par seconde. Le progressif 30 images complètes. Même résolution, même débit brut, mais qualité différente.',
    category: 'video',
  },
  {
    id: 'h264-compression',
    title: 'Taux de compression H.264 surestimé',
    wrong: 'H.264 = 1000:1',
    right: 'H.264 ≈ 100:1 typique. HEVC ≈ 200:1. AV1 ≈ 300:1. Ne pas confondre avec les ratios théoriques max.',
    explanation: 'Le 100:1 est une moyenne réaliste pour H.264. Les ratios varient selon le contenu et la qualité visée.',
    category: 'video',
  },
  {
    id: 'rtp-rtcp',
    title: 'RTP vs RTCP : confusion',
    wrong: 'RTCP transporte les données média',
    right: 'RTP = transporte les données (N° séquence + timestamp). RTCP = canal de contrôle (feedback QoS: perte, gigue, stats).',
    explanation: 'RTP = Real-time Transport Protocol (données). RTCP = RTP Control Protocol (contrôle). Ports pairs/impairs.',
    category: 'network',
  },
  {
    id: 'srt-rtmp',
    title: 'SRT vs RTMP : confusion',
    wrong: 'SRT = pour l\'ingestion OBS',
    right: 'RTMP = ingestion (OBS→serveur). SRT = transport fiable bas latence sur réseaux non fiables (contribution→CDN).',
    explanation: 'RTMP = legacy Flash/ingestion. SRT = moderne, chiffré, correction d\'erreurs (ARQ), adaptation bande passante.',
    category: 'network',
  },
  {
    id: 'h264-hevc',
    title: 'H.264 vs HEVC : même performance',
    wrong: 'HEVC = juste le nouveau nom de H.264',
    right: 'HEVC (H.265) = successeur de H.264. ~2× plus efficace. Même qualité à moitié débit, ou double qualité au même débit.',
    explanation: 'HEVC = High Efficiency Video Coding. Outils améliorés : CTU 64×64, prédiction intra 35 modes, motion vector precision, etc.',
    category: 'video',
  },
  {
    id: 'abr-ladder',
    title: 'ABR : mauvais seuils de bascule',
    wrong: 'Bande passante 1.5 Mbps → rester en 1080p@3M (marge)',
    right: '1.5 Mbps < 3M → basculer en 720p@1.5M. Marge de sécurité recommandée (ex: basculer à 80% du débit).',
    explanation: 'L\'ABR doit basculer AVANT la saturation. Garder une marge (ex: 20%) évite les freezes et rebuffering.',
    category: 'network',
  },
  {
    id: 'fec-retransmission',
    title: 'FEC vs Retransmission : confusion',
    wrong: 'FEC = retransmission des paquets perdus',
    right: 'FEC = Forward Error Correction (correction sans retransmission, redondance). Retransmission = TCP/ARQ (demande de renvoi).',
    explanation: 'FEC = redondance proactive (ex: Reed-Solomon). Retransmission = réactive (NACK/ACK). Temps réel = FEC (pas de round-trip).',
    category: 'network',
  },
  {
    id: 'mo-psnr',
    title: 'MOS vs PSNR : confusion',
    wrong: 'MOS = calcul mathématique automatique',
    right: 'MOS = Mean Opinion Score (note 1-5 par humains). PSNR = métrique objective mathématique. MOS = subjectif, PSNR = objectif.',
    explanation: 'MOS nécessite des tests subjectifs (ITU-T P.800). PSNR = 10·log₁₀(MAX²/MSE). Corrélation imparfaite.',
    category: 'video',
  },
  {
    id: 'shannon',
    title: 'Shannon-Hartley : confusion B vs bande passante',
    wrong: 'C = B × log₂(1+SNR) où B = débit binaire',
    right: 'C = B × log₂(1+SNR) où B = bande passante en Hz (largeur spectrale), pas le débit.',
    explanation: 'B = bande passante du canal (Hz). SNR = rapport signal/bruit (linéaire, pas dB). C = capacité max (bit/s).',
    category: 'network',
  },
  {
    id: 'haptique-frequency',
    title: 'Fréquence haptique : confusion avec audio',
    wrong: 'Boucle haptique = 44.1 kHz (comme audio CD)',
    right: 'Boucle haptique = 1000 Hz minimum (perception jusqu\'à 500 Hz). Audio = 44.1 kHz. Ordres de grandeur différents.',
    explanation: 'Le toucher perçoit jusqu\'à ~500 Hz. La boucle de contrôle haptique doit tourner à ≥ 1000 Hz pour stabilité (passivité).',
    category: 'haptique',
  },
  {
    id: 'deadband',
    title: 'Deadband haptique : pas de compression',
    wrong: 'On envoie toutes les valeurs de force',
    right: 'Deadband = on supprime les variations < JND (7-10%). Économie bande passante significative.',
    explanation: 'La loi de Weber : différence perceptible si > 7-10% de la force. En dessous → imperceptible → compressible (deadband).',
    category: 'haptique',
  },
  {
    id: 'pcm-g711',
    title: 'PCM G.711 : 64 kbit/s d\'où ça vient ?',
    wrong: 'G.711 = 8 kHz × 4 bits = 32 kbit/s',
    right: 'G.711 = 8 kHz × 8 bits = 64 kbit/s. Voix max 4 kHz → Nyquist Fe = 8 kHz. Quantification 8 bits (loi A/μ).',
    explanation: 'Téléphonie : bande passante 300-3400 Hz → fmax ≈ 4 kHz → Fe = 8 kHz. 8 bits (loi A en Europe, loi μ aux US).',
    category: 'telecom',
  },
  {
    id: 'e1-channels',
    title: 'E1 : 30 ou 31 canaux ?',
    wrong: 'E1 = 31 canaux voix',
    right: 'E1 = 30 canaux voix + 1 signalisation + 1 synchronisation = 32 timeslots. 2.048 Mbit/s total.',
    explanation: 'E1 européen = 32 TS × 64 kbit/s = 2.048 Mbit/s. TS0 = sync, TS16 = signalisation. 30 TS pour la voix.',
    category: 'telecom',
  },
  {
    id: 'opus-bitrate',
    title: 'Opus : plage de débits',
    wrong: 'Opus = 128 kbit/s fixe',
    right: 'Opus = 6 à 510 kbit/s adaptatif. Latence 5 ms (VoIP) à 26.5 ms (musique). CBR/VBR supporté.',
    explanation: 'Opus = SILK (parole) + CELT (audio). Adaptatif temps réel. Standard IETF RFC 6716. Utilisé par Discord, WhatsApp, WebRTC.',
    category: 'audio',
  },
  {
    id: 'aac-mp3',
    title: 'AAC vs MP3 : même qualité à même débit',
    wrong: '128 kbit/s AAC = 128 kbit/s MP3',
    right: 'AAC ≈ +30% efficace vs MP3. 128 kbit/s AAC ≈ 192 kbit/s MP3. MDCT 1024 bandes vs 576 pour MP3.',
    explanation: 'AAC = Advanced Audio Coding. MDCT 1024 bandes vs 576 pour MP3. Meilleur traitement fréquences hautes. Standard MPEG-2/4.',
    category: 'audio',
  },
  {
    id: 'rtsp-sip',
    title: 'RTSP vs SIP : confusion',
    wrong: 'RTSP = signalisation VoIP',
    right: 'SIP = Session Initiation Protocol (signalisation VoIP: INVITE, REGISTER). RTSP = Real-Time Streaming Protocol (contrôle streaming: SETUP, PLAY, PAUSE).',
    explanation: 'SIP = signalisation appels (VoIP, visio). RTSP = contrôle lecture streaming (VOD, live). Composants SIP: UAC, UAS, Proxy, Registrar.',
    category: 'network',
  },
  {
    id: 'webrtc-stack',
    title: 'WebRTC : stack protocolaire',
    wrong: 'WebRTC = juste RTP',
    right: 'WebRTC = RTP + SRTP (chiffré) + RTCP + ICE (NAT traversal) + DTLS + SDP. Stack complète P2P.',
    explanation: 'WebRTC n\'est pas un protocole unique mais une stack. ICE/STUN/TURN pour NAT. DTLS pour clé. SRTP pour média. DataChannel = SCTP over DTLS.',
    category: 'network',
  },
  {
    id: 'scalable-video',
    title: 'SVC : couches',
    wrong: 'SVC = juste H.264 avec un nom différent',
    right: 'SVC = Scalable Video Coding. Couche de base (base layer) + couches d\'amélioration (enhancement layers) : spatial / temporel / qualité (SNR). Décodage partiel possible.',
    explanation: 'SVC = H.264/AVC Annexe G. Permet adaptation sans re-transcodage. Utile pour ABR, multicast, hétérogénéité terminaux.',
    category: 'video',
  },
  {
    id: 'dash-hls',
    title: 'DASH vs HLS',
    wrong: 'DASH = HLS sous un autre nom',
    right: 'HLS = Apple (.m3u8, segments .ts ou fMP4). DASH = MPEG standard (.mpd, segments fMP4). Les deux font ABR. DASH = standard ouvert, HLS = propriétaire Apple.',
    explanation: 'HLS = HTTP Live Streaming (Apple). DASH = Dynamic Adaptive Streaming over HTTP (MPEG-DASH). DASH supporte multi-DRM, sous-titres, multi-audio nativement.',
    category: 'network',
  },
] as const

export default function TrapsPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all')

  const categories = [...new Set(traps.map(t => t.category))].sort()

  const filteredTraps = traps.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                         t.wrong.toLowerCase().includes(search.toLowerCase()) ||
                         t.explanation.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">⚠️ Pièges classiques — 25+ erreurs à éviter</h1>
          <p className="text-text-muted">Chaque piège montre l'erreur fréquente, la bonne méthode et l'explication. Mémorisez-les pour l'examen.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher un piège..."
              className="input"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-auto min-w-[180px]"
          >
            <option value="all">Toutes les catégories</option>
            {['all', 'audio', 'video', 'network', 'telecom', 'haptique', 'general'].map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Toutes' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredTraps.map((trap, i) => (
            <details
              key={trap.id}
              className="card group"
            >
              <summary className="flex items-start gap-3 p-4 cursor-pointer list-none">
                <span className={cn('text-xl', `text-${trap.category}`)}>⚠️</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{trap.title}</h3>
                  <span className={cn('badge text-xs', `badge-${trap.category}`)}>{trap.category}</span>
                </div>
                <span className="text-accent">▼</span>
              </summary>
              <div className="px-4 pb-6 animate-slide-down space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-err/5 border border-err/20 rounded-xl">
                    <p className="font-medium text-err mb-2">❌ Erreur fréquente</p>
                    <p className="font-mono text-sm text-text">{trap.wrong}</p>
                  </div>
                  <div className="p-4 bg-ok/5 border border-ok/20 rounded-xl">
                    <p className="font-medium text-ok mb-2">✅ Bonne méthode</p>
                    <p className="font-mono text-sm text-text">{trap.right}</p>
                  </div>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <p className="font-medium text-accent mb-2">💡 Explication</p>
                  <p className="text-text-muted">{trap.explanation}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  )
}