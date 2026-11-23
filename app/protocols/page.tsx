'use client'

import { MainNav } from '@/components/layout/MainNav'
import { cn } from '@/lib/utils'

const protocols = [
  {
    category: 'Temps réel',
    color: 'network',
    protocols: [
      { name: 'RTP', full: 'Real-time Transport Protocol', port: 'Dynamique (pair)', desc: 'Transport temps réel sur UDP. Champs: N° séquence, timestamp, SSRC, payload type.', features: ['N° séquence', 'Timestamp', 'SSRC', 'Payload type'] },
      { name: 'RTCP', full: 'RTP Control Protocol', port: 'RTP port + 1', desc: 'Canal de contrôle QoS. Rapports SR/RR: perte, gigue, délai aller-retour. Permet adaptation débit.', features: ['SR/RR reports', 'QoS feedback', 'Synchronisation NTP'] },
      { name: 'RTSP', full: 'Real-Time Streaming Protocol', port: '554', desc: 'Protocole de contrôle (SETUP, PLAY, PAUSE, TEARDOWN, SEEK). Ne transporte pas les données (utilise RTP). VCR-like.', features: ['Control only', 'VCR commands', 'Session management'] },
      { name: 'WebRTC', full: 'Web Real-Time Communication', port: 'Dynamique (ICE)', desc: 'P2P dans navigateur. Stack: RTP+SRTP+RTCP+ICE+DTLS+SDP. Latence <150ms. Meet, Zoom, Teams.', features: ['SRTP encryption', 'ICE/STUN/TURN', 'DataChannels (SCTP)'] },
      { name: 'SRT', full: 'Secure Reliable Transport', port: 'Dynamique', desc: 'Streaming faible latence sur réseaux non fiables. Chiffrement AES, correction ARQ, adaptation BP. Idéal contribution→CDN.', features: ['AES encryption', 'ARQ', 'Bandwidth adaptation'] },
      { name: 'RTMP', full: 'Real-Time Messaging Protocol', port: '1935', desc: 'Protocole Adobe (Flash). Faible latence, encore utilisé pour ingestion (OBS→serveur). RTMPS = TLS.', features: ['Low latency', 'Ingestion', 'Legacy'] },
    ]
  },
  {
    category: 'HTTP-based (ABR)',
    color: 'video',
    protocols: [
      { name: 'HLS', full: 'HTTP Live Streaming', port: '80/443', desc: 'Apple. Manifeste .m3u8, segments .ts ou fMP4. ABR natif. LL-HLS ≈ 2-3s latence.', features: ['.m3u8 manifest', '.ts/.fMP4 segments', 'ABR', 'Apple ecosystem'] },
      { name: 'DASH', full: 'Dynamic Adaptive Streaming over HTTP', port: '80/443', desc: 'Standard MPEG. Manifeste .mpd, segments fMP4. ABR. Standard ouvert, multi-DRM.', features: ['.mpd manifest', 'fMP4 segments', 'ABR', 'Standard MPEG'] },
      { name: 'MSS', full: 'Microsoft Smooth Streaming', port: '80/443', desc: 'Microsoft. Fragments ISMV. ABR. Hérité, remplacé par DASH/HLS.', features: ['ISMV', 'Legacy', 'Microsoft'] },
    ]
  },
  {
    category: 'Signalisation',
    color: 'telecom',
    protocols: [
      { name: 'SIP', full: 'Session Initiation Protocol', port: '5060/5061', desc: 'Signalisation VoIP/visio. INVITE, REGISTER, BYE, ACK, CANCEL. UAC/UAS, Proxy, Registrar.', features: ['INVITE/REGISTER', 'UAC/UAS', 'Proxy/Registrar', 'SDP for media'] },
      { name: 'H.323', full: 'H.323', port: '1720', desc: 'Ancêtre SIP. Signalisation visioconférence. Gatekeeper, MCU. Hérité, remplacé par SIP.', features: ['Gatekeeper', 'Legacy', 'Complex'] },
      { name: 'SDP', full: 'Session Description Protocol', port: 'N/A (dans SIP/RTSP)', desc: 'Décrit session média: codecs, IPs, ports, bande passante. Format texte. Utilisé par SIP, RTSP, WebRTC.', features: ['Media description', 'Codec negotiation', 'Text format'] },
      { name: 'MGCP', full: 'Media Gateway Control Protocol', port: '2427/2727', desc: 'Contrôle passerelles média. Centralisé (Call Agent). Hérité, remplacé par SIP/H.248.', features: ['Centralized', 'Gateway control', 'Legacy'] },
    ]
  },
  {
    category: 'Transport',
    color: 'telecom',
    protocols: [
      { name: 'TCP', full: 'Transmission Control Protocol', port: 'N/A', desc: 'Fiable, ordonné, contrôle flux/congestion. HoL blocking. VOD, HTTP, WebSockets.', features: ['Reliable', 'Ordered', 'Flow control', 'HoL blocking'] },
      { name: 'UDP', full: 'User Datagram Protocol', port: 'N/A', desc: 'Best-effort, non ordonné, pas de contrôle flux. Temps réel, DNS, DHCP, RTP.', features: ['Best-effort', 'No ordering', 'Low latency', 'No congestion control'] },
      { name: 'QUIC', full: 'Quick UDP Internet Connections', port: '443', desc: 'UDP + TLS 1.3 + multiplexage. Résout HoL blocking TCP. 0-RTT. Base HTTP/3.', features: ['UDP-based', 'TLS 1.3', 'Multiplexing', '0-RTT', 'HTTP/3'] },
    ]
  },
] as const

export default function ProtocolsPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-bg">
      <MainNav />
      <main className="container py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">🌐 Protocoles multimédia — Référence complète</h1>
          <p className="text-text-muted">Classification, ports, caractéristiques et usage. Cliquez pour développer.</p>
        </div>

        <div className="space-y-4">
          {protocols.map((cat) => (
            <details
              key={cat.category}
              className="card group"
              open={openCategory === cat.category}
              onToggle={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
            >
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <span className={cn('text-2xl', `text-${cat.color}`)}>📡</span>
                <h3 className="font-semibold text-text flex-1">{cat.category}</h3>
                <span className={cn('text-caption', `text-${cat.color}`)}>⌄</span>
              </summary>
              <div className="px-4 pb-6 animate-slide-down">
                <div className="space-y-4">
                  {cat.protocols.map((proto) => (
                    <div key={proto.name} className="p-4 bg-card-secondary/50 rounded-xl border border-border/50 hover:border-accent/30 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-semibold text-text flex items-center gap-2">
                            {proto.name}
                            <span className="text-caption text-text-muted">({proto.full})</span>
                          </h4>
                          <p className="text-text-muted text-sm mt-1">{proto.desc}</p>
                        </div>
                        <span className={cn('px-2 py-1 rounded-full text-caption font-mono', `bg-${cat.color}/20 text-${cat.color}`)}>
                          Port: {proto.port}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proto.features.map((f, i) => (
                          <span key={i} className={cn('px-2 py-1 rounded-full text-caption', `bg-${cat.color}/20 text-${cat.color} border border-${cat.color}/30`)}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 card p-6 bg-gradient-to-r from-audio/10 to-image/10 border-audio/20">
          <h3 className="font-semibold text-text mb-4">📋 Matrice de décision rapide</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Scénario</th>
                  <th>Protocole transport</th>
                  <th>Encapsulation</th>
                  <th>Buffer</th>
                  <th>Perte</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">VOD (Netflix)</td>
                  <td>TCP (HTTP/2, QUIC)</td>
                  <td>fMP4 / HLS / DASH</td>
                  <td>20-30 s</td>
                  <td>Retransmission</td>
                </tr>
                <tr>
                  <td className="font-medium">Live streaming (Twitch)</td>
                  <td>TCP (HLS/DASH) ou UDP (SRT)</td>
                  <td>fMP4 / TS</td>
                  <td>2-10 s</td>
                  <td>Retransmission / FEC</td>
                </tr>
                <tr>
                  <td className="font-medium">Visio temps réel (Meet/Zoom)</td>
                  <td>UDP (WebRTC/SRTP)</td>
                  <td>RTP</td>
                  <td>100-200 ms</td>
                  <td>FEC / PLC / NACK</td>
                </tr>
                <tr>
                  <td className="font-medium">VoIP (SIP)</td>
                  <td>UDP (RTP/SRTP)</td>
                  <td>RTP</td>
                  <td>50-150 ms</td>
                  <td>FEC / PLC</td>
                </tr>
                <tr>
                  <td className="font-medium">IPTV (Multicast)</td>
                  <td>UDP (RTP)</td>
                  <td>MPEG-TS</td>
                  <td>100-500 ms</td>
                  <td>FEC / Redondance</td>
                </tr>
                <tr>
                  <td className="font-medium">Gaming temps réel</td>
                  <td>UDP (QUIC, custom)</td>
                  <td>Custom / Protobuf</td>
                  <td>< 50 ms</td>
                  <td>Prediction / Rollback</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}