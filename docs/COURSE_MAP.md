# Course Map — Communication Multimédia (Master 2 IAA, USTO-MB)

**⚠ CRITICAL**: **No official corrections exist in the source materials.** The `/tds/` directory contains exercise statements only. All solutions are independently derived from course theory and labeled with confidence status.

**Sources**:
- `tds/Fiches_TD_Communication_Multimedia_TD1-TD6_corrige_graphique.md` — Exercise statements (TD1–TD6)
- `tds/tds_multimedia_v4(1).html` — Jupyter export: statements + partial Python code
- `tds/CM_CHAPITRE1 (2).pdf` & `CM_CHAPITRE2 (2).pdf` — Course theory
- `etude-cmm.html` — Current site (reference implementation, unverified)

**Confidence Labels** (applied to every solution):
- `independently-derived` — Calculated from course formulas (numerical exercises)
- `suggested-answer` — Reasoned model answer (conceptual/design questions)
- `needs-teacher-verification` — Ambiguous, multiple valid answers, or source conflicts
- `reference-implementation` — From current site only (unverified)

**Golden Tests** verify **internal mathematical consistency only** — not external truth.

---

## Legend

- **Status**: `etudié` (appears in TDs) | `hors-cours` (extra from course chapters) | `needs-teacher-verification` (uncertain)
- **Type**: `calc` (parametrised computation) | `concept` (short answer) | `design` (design case) | `qcm` | `lab` (Audacity/manipulation)
- **Priority**: `H` (exam-critical, in TDs) | `M` (supporting) | `L` (extra context)
- **Confidence**: `high` | `medium` | `low` (per solution)

---

## TD1 — Audio Numérisation & Compression (16 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | Débit, taille, SNR, codecs (CD 1 min) | D=Fe×B×C, S=D×t/8, SNR≈6.02B+1.25, FLAC 50%, MP3 128k ~91% | calc | ★★☆ | etudié | TD1 Ex1 | H | high |
| 2 | Nyquist voix (100–3400 Hz) | Fe_min = 2×fmax | calc | ★☆☆ | etudié | TD1 Ex2 | H | high |
| 3 | Numérisation v(t) fe=20Hz, B=5bits | Te=1/fe, Q=(Vmax-Vmin)/2^B, codes binaires, erreur e | calc+lab | ★★★ | etudié | TD1 Ex3 | H | high |
| 4 | Taille fichier stéréo 4min15s, 100Hz, 16bits | S = Fe×B×C×t/8 | calc | ★★☆ | etudié | TD1 Ex4 | H | high |
| 5 | Fe inverse: taille 290Mo, 3min30s, 16bits, stéréo | Fe = (Taille×8)/(B×C×t) | calc | ★★☆ | etudié | TD1 Ex5 | H | high |
| 6 | Fe inverse: taille 325Mo, 10min, 8bits, mono | Fe = (Taille×8)/(B×C×t) | calc | ★★☆ | etudié | TD1 Ex6 | H | high |
| 7 | Durée inverse: 300Mo, CD stéréo | t = (Taille×8)/(Fe×B×C) | calc | ★★☆ | etudié | TD1 Ex7 | H | high |
| 8 | Durée inverse: 200Mo, 96kHz, 16bits, stéréo | t = (Taille×8)/(Fe×B×C) | calc | ★★☆ | etudié | TD1 Ex8 | H | high |
| 9 | Taille 1h20min CD stéréo | S = Fe×B×C×t/8 | calc | ★★☆ | etudié | TD1 Ex9 | H | high |
| 10 | Résolution à partir débit: 256kbps, 44.1kHz, mono, 600Mo | N = Débit/(Fe×C) → non-entier (compressé) | calc+concept | ★★★ | etudié | TD1 Ex10 | H | high |
| 11 | Combos CBR 512kbps | Fe×B×C = 512000 | calc | ★★☆ | etudié | TD1 Ex11 | H | high |
| 12 | VBR vs CBR 5min, 128/16kbps, silence 90s | VBR = 128×210 + 16×90; CBR = 128×300 | calc | ★★☆ | etudié | TD1 Ex12 | H | high |
| 13 | Audacity: WAV→256k→8k→256k | Perte irréversible compression avec perte | lab | ★★★ | etudié | TD1 Ex13 | M | medium |
| 14 | Comparatif 8 vs 32 bits WAV | SNR, dynamique, taille ×4 | lab | ★★☆ | etudié | TD1 Ex14 | M | medium |
| 15 | Codecs: WAV 512k, MP3 96k, GSM 13k | Tableau qualité/taille | lab | ★★☆ | etudié | TD1 Ex15 | M | medium |
| 16 | QCM: Taille CD 15min (binaire) | 44100×16×2×900/8 = 158,760,000 B / 1024² = 151.4 Mo | qcm | ★★☆ | etudié | TD1 Ex16 | H | high |

**TD1 Summary**: 16 exercises (10 calc, 3 inverse calc, 3 lab, 1 QCM). All `etudié`. Solutions: 13 `independently-derived`, 3 `suggested-answer`.

---

## TD2 — Image & Vidéo (7 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | Huffman probabilités (21,95,169,243 ; 3/8,1/8,1/8,3/8) | Arbre binaire, codes variables, entropy | calc | ★★★ | etudié | TD2 Ex1 | H | high |
| 2 | Huffman sur matrice 8×8 (niveaux 0,63,127,255) | Fréquences, arbre, codage, remplacement | calc | ★★★ | etudié | TD2 Ex2 | H | high |
| 3 | Débit vidéo brut Full HD 1080p 30fps 24bpp | D = L×H×bpp×fps | calc | ★★☆ | etudié | TD2 Ex3 | H | high |
| 4 | Format TV HD 1280×720 25fps, Y=8b, C=4b | 12 bits/pixel → D = 1280×720×12×25 | calc | ★★☆ | etudié | TD2 Ex4 | H | high |
| 5 | Compression MPEG-1 GOP IBBPBBIBBP (2min, 60Mo) | GOP=10, I=2, P=2, B=6, poids=4.2, ratio=0.42 → 25.2Mo | calc | ★★★ | etudié | TD2 Ex5 | H | high |
| 6 | Tableau résolutions 24fps 24bpp (144p…1080p) | Binary convention (MiB/GiB), bitrate, taille/min | calc+table | ★★★ | etudié | TD2 Ex6 | H | high |
| 7 | QCM: Inconvénient maximiser B-frames | B. Problème FF/FR + latence décodage | qcm | ★★☆ | etudié | TD2 Ex7 | H | medium |

**TD2 Summary**: 7 exercises (site had only 5, missing Ex6 & Ex7). Ex6 uses binary convention. Ex7 answer is B (`suggested-answer`, medium confidence).

---

## TD3 — Streaming & Transport (4 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | Couche PTS/DTS, protocoles VOD vs temps réel | PES layer, TCP (VOD), UDP/RTP (temps réel) | concept | ★★☆ | etudié | TD3 Ex1 | H | medium |
| 2 | Ordre décodage/affichage PTS/DTS | DTS: I(0)→P(40)→B(80); PTS: B(0)→P(40)→I(80) | concept+ordering | ★★★ | etudié | TD3 Ex2 | H | medium |
| 3 | Topologies Broadcast/Multicast/Unicast (3 cas) | Cas1: Broadcast, Cas2: Multicast (500 not 300), Cas3: Unicast | design | ★★☆ | etudié | TD3 Ex3 | H | medium |
| 4 | Netflix vs Meet design + latence | TCP/20s/fMP4/Retrans vs UDP/150ms/RTP/FEC; Latence=170ms | design+calc | ★★★ | etudié | TD3 Ex4 | H | high |

**TD3 Notes**:
- Ex1 has parts a) and d) only in source (b, c missing from sheet) — `needs-teacher-verification`
- Ex3 Cas2: source says 500 students, site says 300 → **corrected to 500**
- Ex2: B-frame DTS=80 > PTS=0 is physically impossible (real: PTS≥DTS). Teach expected answer + add "Piège: PTS≥DTS réel" — `needs-teacher-verification`

---

## TD4 — Vidéo & Streaming (6 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | Débit Full HD brut + H.264 100:1 + ADSL 8M | 1492.99 Mbps → 14.93 Mbps (non sur ADSL 8M) | calc | ★★☆ | etudié | TD4 Ex1 | H | high |
| 2 | Buffer drain: 5Mbps sur 4Mbps, buffer 10s | 50Mbit buffer / 1Mbps deficit = 50s | calc | ★★☆ | etudié | TD4 Ex2 | H | high |
| 3 | Timestamps RTP audio 48kHz / vidéo 90kHz | Audio frame: 1024/48000=21.33ms; Video: 1/25=40ms; aligned at 1s | calc+concept | ★★★ | etudié | TD4 Ex3 | H | high |
| 4 | Jitter buffer: gigue 100ms, 25fps | Buffer ≈ gigue + 1 frame = 140ms | calc | ★★☆ | etudié | TD4 Ex4 | H | high |
| 5 | Encapsulation ES→PES→MP4/TS | Timing, sync, multiplexage, résilience | concept | ★★☆ | etudié | TD4 Ex5 | H | medium |
| 6 | Taille film 1h 1080p24: brut + YouTube 4.5M+128k | Brut ≈ 537.5 GB; Compressed ≈ 2.08 GB | calc | ★★☆ | etudié | TD4 Ex6 | H | high |

**TD4 Notes**: Ex3 timestamps aligned (both 1.000s). Include frame durations (21.33ms, 40ms). Ex6 uses decimal convention.

---

## TD5 — VoIP, RTP, SFU, DASH, Design (8 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | Latence VoIP G.711: 20+20+80+40+20 = 180ms | G.114: 150ms optimal, 400ms acceptable → acceptable | calc | ★★☆ | etudié | TD5 Ex1 | H | high |
| 2 | Gigue RTP: délais 20,35,22,60,25,80ms | Multiple definitions: max-min=60ms, MAD≈19.8, mean|Δ|=31.2, RFC3550≈8.97 | calc | ★★★ | etudié | TD5 Ex2 | H | medium |
| 3 | SFU 12 participants: 2.5Mbps+64kbps each | Up: 2.564; Down: 11×2.564=28.204; SFU in: 30.768, out: 338.448; vs MCU | calc+design | ★★★ | etudié | TD5 Ex3 | H | high |
| 4 | ABR DASH: 5→1→0.3→4 Mbps, 3 rendus | Descendre/remonter qualité; 1080p@0.3M → freeze/rebuffer | design | ★★☆ | etudié | TD5 Ex4 | H | medium |
| 5 | Perte I dans MPEG GOP 12 (IBBPBBPBBPBB) | B: 1 frame; P: jusqu'au prochain I; I: tout GOP corrompu | concept | ★★☆ | etudié | TD5 Ex5 | H | medium |
| 6 | Désync A/V: H.264 120ms vs Opus 20ms = 100ms | RTCP SR + NTP pour resync | calc+concept | ★★☆ | etudié | TD5 Ex6 | H | high |
| 7 | Multi-site visio: 40, 100, 180ms | Bufferiser à latence max (180ms) ou MCU horloge commune | design | ★★☆ | etudié | TD5 Ex7 | H | medium |
| 8 | Télémédecine Oran: 20×2.564=51.28Mbps sur 100M | Codecs H.264/HEVC+Opus+JPEG; WebRTC/SRTP; QoS priorité; TLS/SRTP; SFU | design | ★★★ | etudié | TD5 Ex8 | H | medium |

**TD5 Notes**: Ex2 jitter has multiple definitions — show all, mark max-min=60ms as "attendu (définition cours)", flag `needs-teacher-verification`. Ex3 server totals completed.

---

## TD6 — Télécom, PCM, E1, MCU/SFU, DVI (7 exercises)

| Ex | Topic | Formulas Used | Type | Difficulty | Status | Source | Priority | Confidence |
|----|-------|---------------|------|------------|--------|--------|----------|------------|
| 1 | PCM G.711 64kbps: voix 4kHz → Fe=8kHz, 8bits | 8000×8=64kbps | calc+concept | ★★☆ | etudié | TD6 Ex1 | H | high |
| 2 | Dimensionnement E1: 2000 abonnés, 10%, E1=30 canaux | 200 appels → 7 E1 (210 canaux); 1 transit (20 E1 max) | calc | ★★☆ | etudié | TD6 Ex2 | H | high |
| 3 | Codecs voix: 50 appels G.711 87.2k vs Opus 40k (overhead) | G.711: 4.36Mbps; Opus: 2.0Mbps; Interne=G.711, Externe=Opus | calc+design | ★★☆ | etudié | TD6 Ex3 | H | high |
| 4 | MCU vs SFU 6 participants | SFU: 6 up + 30 down; MCU: 6 up + 6 down mais CPU élevé | calc+design | ★★☆ | etudié | TD6 Ex4 | H | medium |
| 5 | DVI-D/A/I, Single/Dual Link, max Single | DVI-D num, DVI-A ana, DVI-I les deux; Single 1920×1200@60; Dual 2560×1600@60 | concept | ★★☆ | etudié | TD6 Ex5 | H | medium |
| 6 | DVI-D → VGA adaptateur passif impossible | DVI-D pas d'analogique → faut DVI-I ou convertisseur actif | concept | ★★☆ | etudié | TD6 Ex6 | H | medium |
| 7 | 1080i60 vs 1080p30: interlacé avantage 2000 | Bande passante économisée même fluidité; aujourd'hui progressif (qualité, pas peigne, écrans progressifs) | concept | ★★☆ | etudié | TD6 Ex7 | H | medium |

**TD6 Summary**: All 7 exercises `etudié`. Mix of `independently-derived` (calc) and `suggested-answer` (concept).

---

## Course Chapters (Ch.1 Représentation, Ch.2 Transmission) — Extra Context

| Topic | Source | Status | Notes |
|-------|--------|--------|-------|
| Psychoacoustique (Fletcher-Munson, masquage freq/temp, ITD/ILD/HRTF) | CM_CHAPITRE1 | hors-cours | Not in TDs |
| Modèles couleur (RGB, CMJN, YUV/YCbCr, HSV) | CM_CHAPITRE1 | hors-cours | YCbCr formulas in TD2 implicitly |
| Estimation mouvement (macroblocs 16×16, SAD, vecteurs) | CM_CHAPITRE1 | hors-cours | Underpins TD2/TD4 |
| Décompression vidéo (CABAC, IDCT, deblocking, sync) | CM_CHAPITRE1 | hors-cours | |
| PSNR/SSIM qualité | CM_CHAPITRE1 | hors-cours | Referenced in TD4 |
| Haptique (IEEE 1918.1.1, 1000Hz, passivité, JND 7-10%) | CM_CHAPITRE1 | hors-cours | New in course |
| Classification protocoles (temps réel, HTTP-based, signalisation, transport) | CM_CHAPITRE2 | hors-cours | TD3 covers subset |
| RTSP, SIP, HLS vs DASH, WebRTC, SRT, RTMP, HTTP/2, QUIC | CM_CHAPITRE2 | hors-cours | Extra protocols |
| IntServ/DiffServ, MOS/PSNR/SSIM métriques | CM_CHAPITRE2 | hors-cours | QoS depth |
| SVC (Scalable Video Coding) | CM_CHAPITRE2 | hors-cours | |

---

## Convention d'Unités — Per-Exercise Tagging + Global Toggle

| Exercise | Site Value | Convention Used | Independently Derived Convention | Notes |
|----------|------------|-----------------|----------------------------------|-------|
| TD1 Ex1 (1 min CD) | 10.58 Mo | Decimal (10^6) | **Decimal** | 10.584 MB |
| TD1 Ex16 (15 min CD) | 151.4 Mo | Binary (1024²) | **Binary** | 151.4 MiB |
| TD1 Ex12 (VBR 5 min) | 3.46 Mo | Mixed | **Decimal** | 28,320 kbit = 3.46 MB |
| TD2 Ex6 (resolution table) | 316.35 Mo/min (240p) | Binary (2^20) | **Binary** | MiB/GiB confirmed by reverse-engineering |
| TD4 Ex6b (1h YouTube) | 2.03 Go | Mixed | **Decimal** | 2.08 GB |
| TD1 Ex7 (300Mo CD) | ~28min | Decimal | **Decimal** | 1700.6s ≈ 28min21s |

**Rule**: Global "Convention d'unités" toggle (Décimal / Binaire). Tag each exercise with `convention: "decimal" | "binary" | "mixed"`. Display both where they differ. Engine returns both.

**Defaults per TD** (independently derived, needs teacher verification):
- TD1: Mixed — tag each exercise individually
- TD2: Binary
- TD3: Decimal (network bitrates)
- TD4: Decimal
- TD5: Decimal
- TD6: Decimal

---

## Content Defects Found (vs. Independently Derived Solutions)

| ID | Defect | Resolution |
|----|--------|------------|
| a | TD2 missing Ex6 (table) & Ex7 (QCM B-frames) | Add both, Ex7 answer = B (`suggested-answer`) |
| b | TD3 Ex3 Cas2: 300 vs 500 students | Correct to 500 (from Jupyter source) |
| c | TD3 Ex1 missing parts b) & c) | Flag `needs-teacher-verification`; implement common variants |
| d | Unit convention inconsistency | Global toggle + per-exercise tagging + dual display |
| e | TD3 Ex2: B frame DTS=80 > PTS=0 impossible | Teach expected answer + add "Piège: PTS≥DTS réel" (`needs-teacher-verification`) |
| f | TD4 Ex3: timestamps aligned at 1s | Include frame durations (21.33ms, 40ms) |
| g | TD5 Ex2: multiple jitter definitions | Show all, mark max-min=60ms as "attendu", flag `needs-teacher-verification` |
| h | TD5 Ex3: SFU totals unquantified | Complete: up 2.564, down 28.204, SFU in 30.768, out 338.448 Mbps |
| i | TD1 Ex10: 5.8 bits non-integer | Present inconsistency + derived duration 18750s |
| j | TD1 Ex3: v(t) digitisation from spline points | Implement interactive digitiser with reconstructed curve (approximation noted) |
| k | Quiz counts: header 20 vs section 30 | Rebuild banks properly |
| l | Barème +1/-0.5/0 configurable | Keep as default, make configurable |

---

## Exercise Generator Families (25 minimum)

| Family ID | TD Mapping | Parameters | Internal Consistency Test |
|-----------|------------|------------|---------------------------|
| AUD-SIZE-DEBIT | TD1 Ex1,4,9,16 | Fe, B, C, t | Ex1: 1411.2 kbps, 10.584 MB (decimal) |
| AUD-INVERSE-FE | TD1 Ex5,7,8 | taille, B, C, t | Ex5: 345238 Hz |
| AUD-INVERSE-DUREE | TD1 Ex7,8 | taille, Fe, B, C | Ex7: 1700.6 s |
| AUD-BITS | TD1 Ex10 | débit, Fe, C, taille | 5.8 bits (non-int) + duration 18750s |
| AUD-CBR-COMBOS | TD1 Ex11 | target bitrate | 3 valid combos |
| AUD-VBR-VS-CBR | TD1 Ex12 | durée, BR_appel, BR_silence, t_silence | VBR 28320kbit vs CBR 38400 |
| SNR | TD1 Ex1.3 | B | 8b:49.41, 16b:97.57, 24b:145.73 |
| NYQUIST | TD1 Ex2, TD6 Ex1 | fmax | 3400Hz→6800Hz (pratique 8000) |
| HUFFMAN-PROBS | TD2 Ex1 | symboles, probas | Valid prefix codes, avg ≥ entropy |
| HUFFMAN-MATRIX | TD2 Ex2 | matrice 8×8 | freq: 0:20, 63:24, 127:28, 255:8 |
| VID-RAW | TD2 Ex3, TD4 Ex1, Ex6a | L, H, bpp, fps | 1492.99 Mbps |
| VID-YC-BPP | TD2 Ex4 | L, H, Y_bits, C_bits, fps | 276.48 Mbps |
| GOP-SIZE | TD2 Ex5 | durée, fps, pattern, I/P/B sizes | GOP=10, 25.2Mo |
| RES-TABLE | TD2 Ex6 | résolutions, fps, bpp, convention | 240p: 316.35MiB/min (binary) |
| PTS-DTS-ORDER | TD3 Ex2 | 3 frames with DTS/PTS | Decode I→P→B, Display B→P→I |
| TOPOLOGY | TD3 Ex3 | 3 scenarios | Broadcast, Multicast, Unicast |
| BUFFER-DRAIN | TD4 Ex2 | Dv, Dr, buffer_init | 50s |
| RTP-TIMESTAMP | TD4 Ex3 | Fe_audio, Fe_video, ts values | 21.33ms, 40ms, aligned at 1s |
| JITTER-BUFFER | TD4 Ex4, TD5 Ex2 | gigue, fps | 140ms; max-min=60ms |
| LATENCY-BUDGET | TD3 Ex4, TD5 Ex1, Ex6 | composants | 170ms (Meet), 180ms (VoIP) |
| FILM-SIZE | TD4 Ex6 | durée, res, fps, bpp, codec BR | Brut 537.5GB, YT 2.08GB |
| SFU-MCU-BW | TD5 Ex3, TD6 Ex4 | N, video_br, audio_br | 12 parts: up 2.564, down 28.204 |
| ABR-DECISION | TD5 Ex4 | bande passante timeline, rendus | Switches at thresholds |
| E1-DIM | TD6 Ex2 | abonnés, simultanéité, E1_canaux | 7 E1, 1 transit |
| VOIP-BW | TD6 Ex3 | appels, BR_with_overhead | G.711 4.36M, Opus 2.0M |
| DVI-CONCEPT | TD6 Ex5-7 | variant, question | Single max 1920×1200@60 |

---

## Flashcard Targets (≥120)

- Formulas (30): each formula as Q/A
- Definitions (25): Nyquist, SNR, GOP, PTS/DTS, jitter, etc.
- Comparisons (20): CBR/VBR, MCU/SFU, TCP/UDP, DVI variants, I/P/B, etc.
- Traps (25): ×2 stereo, /8 bits→bytes, 1000 vs 1024, minutes→seconds, etc.
- Confusion pairs (20): PTS/DTS, jitter/latence, MCU/SFU, SNR/PSNR, etc.

---

## Quiz Bank Targets

| Type | Minimum | Source |
|------|---------|--------|
| QCM | 150 | TDs + course chapters |
| Short conceptual | 40 | TD concept questions |
| Design cases | 4 | TD3 Ex4, TD5 Ex8, TD3 Ex3, TD6 Ex3-4 |
| Calculation (generator) | 25 families | All TD calc exercises |

---

## Statistics

- **Total TD exercises**: 48 (16+7+4+6+8+7)
- **Exercise types**: ~38 calc, 5 concept, 4 design, 2 QCM, 3 lab
- **Exam priority (étudié)**: 48/48 = 100% of TDs
- **Extra course content (hors-cours)**: ~15 topics
- **Generator families**: 25
- **Flashcards**: ≥120
- **QCM bank**: ≥150
- **Solution confidence**: 38 `independently-derived`, 8 `suggested-answer`, 2 `needs-teacher-verification`

---

*See `docs/SOURCE_STATUS.md` for full source status and confidence labeling policy.*