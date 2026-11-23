# Source Status & Confidence Levels

**Project**: Étude CMM — Exam Preparation Platform  
**Date**: 2026-11-23  
**Principle**: Never present independently derived solutions as official corrections.

---

## Available Sources

| Source File | Content Type | Has Official Corrections? | Status |
|-------------|--------------|---------------------------|--------|
| `tds/Fiches_TD_Communication_Multimedia_TD1-TD6_corrige_graphique.md` | TD exercise statements (1-6) | **No** — name misleading, contains only statements | Exercise statements only |
| `tds/tds_multimedia_v4(1).html` | Jupyter notebook export: statements + some Python code (signal reconstruction, Huffman matrix) | **No** | Exercise statements + partial code |
| `tds/CM_CHAPITRE1 (2).pdf` | Course Chapter 1: Représentation des données multimédia | N/A | Course theory |
| `tds/CM_CHAPITRE2 (2).pdf` | Course Chapter 2: Transmission multimédia | N/A | Course theory |
| `etude-cmm.html` | Current deployed site (single-page app) | **No** — contains proposed solutions of unknown origin | Reference implementation (unverified) |

**Conclusion**: **No official corrections exist in the source materials.** All solutions must be independently derived from course theory.

---

## Confidence Labels (apply to every solution)

| Label | Meaning | When to Use |
|-------|---------|-------------|
| `official` | Directly from a teacher-provided correction document | **Never** — no such document exists |
| `independently-derived` | Calculated/verified from course formulas and theory | Numerical exercises with clear formulas |
| `suggested-answer` | Reasoned model answer for conceptual/design questions | Conceptual, design, short-answer questions |
| `needs-teacher-verification` | Ambiguous, multiple valid answers, or source conflict | TD3 Ex1 missing parts, TD5 Ex2 jitter definition, etc. |
| `reference-implementation` | From `etude-cmm.html` — unverified, may contain errors | Only as comparison, never as truth |

---

## Solution Status per Exercise Category

### Numerical Exercises (Calculation)
**Method**: Implement engine with seeded PRNG → `solve()` returns full step trace → automated golden tests verify internal consistency.

| TD | Exercise | Confidence | Notes |
|----|----------|------------|-------|
| TD1 Ex1 | Débit, taille, SNR, codecs | `independently-derived` | Formulas from course: D=Fe×B×C, S=D×t/8, SNR=6.02B+1.25 |
| TD1 Ex2 | Nyquist voix | `independently-derived` | Fe_min = 2×fmax = 6800 Hz |
| TD1 Ex3 | Numérisation v(t) | `independently-derived` | Te=0.05s, Q=2/32=0.0625, spline-reconstructed curve |
| TD1 Ex4 | Taille 4min15s | `independently-derived` | Direct formula application |
| TD1 Ex5 | Fe inverse 290Mo | `independently-derived` | Fe = (Taille×8)/(B×C×t) |
| TD1 Ex6 | Fe inverse 325Mo mono | `independently-derived` | Same formula |
| TD1 Ex7 | Durée inverse 300Mo | `independently-derived` | t = (Taille×8)/(Fe×B×C) |
| TD1 Ex8 | Durée inverse 200Mo 96kHz | `independently-derived` | Same formula |
| TD1 Ex9 | Taille 1h20min CD | `independently-derived` | Direct formula |
| TD1 Ex10 | Résolution 256kbps | `independently-derived` | N = 5.8 bits (non-integer → compressed) + derived duration |
| TD1 Ex11 | CBR combos 512kbps | `independently-derived` | Fe×B×C = 512000 |
| TD1 Ex12 | VBR vs CBR | `independently-derived` | VBR = 128×210 + 16×90 |
| TD2 Ex1 | Huffman probabilités | `independently-derived` | Standard Huffman algorithm |
| TD2 Ex2 | Huffman matrice 8×8 | `independently-derived` | Count frequencies from matrix |
| TD2 Ex3 | Débit Full HD brut | `independently-derived` | D = 1920×1080×24×30 |
| TD2 Ex4 | Format TV HD 1280×720 | `independently-derived` | 12 bits/pixel |
| TD2 Ex5 | MPEG-1 GOP compression | `independently-derived` | GOP=10, I=2, P=2, B=6, weights |
| TD2 Ex6 | Tableau résolutions | `independently-derived` | Binary convention (reverse-engineered) |
| TD3 Ex4 | Latence Meet | `independently-derived` | 20+30+40+60+20 = 170ms |
| TD4 Ex1 | Débit Full HD + H.264 | `independently-derived` | 1492.99 / 100 = 14.93 Mbps |
| TD4 Ex2 | Buffer drain 50s | `independently-derived` | 50 Mbit / 1 Mbps |
| TD4 Ex3 | RTP timestamps | `independently-derived` | Audio 21.33ms, Video 40ms, aligned at 1s |
| TD4 Ex4 | Jitter buffer 140ms | `independently-derived` | 100ms + 40ms |
| TD4 Ex6 | Film 1h taille | `independently-derived` | Brut 537.5 GB, YouTube 2.08 GB |
| TD5 Ex1 | Latence VoIP 180ms | `independently-derived` | Sum components, G.114 classification |
| TD5 Ex2 | Jitter 60ms (max-min) | `suggested-answer` | Multiple definitions exist — flag |
| TD5 Ex3 | SFU bandwidth | `independently-derived` | Up 2.564, Down 28.204, Server 338.448 Mbps |
| TD5 Ex6 | Désync A/V 100ms | `independently-derived` | 120-20 = 100ms |
| TD6 Ex1 | PCM G.711 64kbps | `independently-derived` | 8kHz × 8 bits |
| TD6 Ex2 | E1 dimensioning | `independently-derived` | 200 appels → 7 E1 → 1 transit |
| TD6 Ex3 | Codecs 50 appels | `independently-derived` | 4.36 vs 2.0 Mbps |

### Conceptual / Short-Answer Exercises
**Method**: Provide reasoned model answer based on course theory. Label `suggested-answer`.

| TD | Exercise | Confidence | Notes |
|----|----------|------------|-------|
| TD1 Ex13 | Audacity conversions | `suggested-answer` | Irreversible lossy compression |
| TD1 Ex14 | 8 vs 32 bits WAV | `suggested-answer` | SNR, dynamic range, size ×4 |
| TD1 Ex15 | Codecs comparison | `suggested-answer` | WAV > MP3 > GSM quality/size tradeoff |
| TD2 Ex7 | B-frames drawback | `suggested-answer` | Answer B: FF/FR seek + decode latency |
| TD3 Ex1 | PTS/DTS layer, protocols | `suggested-answer` | PES layer, TCP (VOD), UDP (temps réel) |
| TD3 Ex2 | PTS/DTS ordering | `suggested-answer` + `needs-teacher-verification` | Teach expected + add "Piège: PTS≥DTS réel" |
| TD3 Ex3 | Broadcast/Multicast/Unicast | `suggested-answer` | Cas1: Broadcast, Cas2: Multicast (500), Cas3: Unicast |
| TD4 Ex5 | Encapsulation ES→PES→TS/MP4 | `suggested-answer` | Timing, sync, multiplexing, resilience |
| TD5 Ex4 | ABR DASH behavior | `suggested-answer` | Switch quality down/up |
| TD5 Ex5 | Perte I/P/B in MPEG | `suggested-answer` | B: 1 frame, P: until next I, I: whole GOP |
| TD5 Ex6 | RTCP SR + NTP resync | `suggested-answer` | NTP timestamps align RTP clocks |
| TD5 Ex7 | Multi-site sync | `suggested-answer` | Buffer to max latency (180ms) or MCU |
| TD6 Ex4 | MCU vs SFU 6 participants | `suggested-answer` | SFU: relay, MCU: mix (CPU) |
| TD6 Ex5 | DVI variants | `suggested-answer` | DVI-D/A/I, Single/Dual Link |
| TD6 Ex6 | DVI-D → VGA passive | `suggested-answer` | Impossible, need DVI-I or active converter |
| TD6 Ex7 | 1080i60 vs 1080p30 | `suggested-answer` | Bandwidth economy 2000, progressive now |

### Design Cases
**Method**: Structured answer with reasoning. Label `suggested-answer`.

| TD | Exercise | Confidence | Notes |
|----|----------|------------|-------|
| TD3 Ex4 | Netflix vs Meet | `suggested-answer` | Full comparison matrix + 170ms latency |
| TD5 Ex8 | Télémédecine Oran | `suggested-answer` | 51.28 Mbps, codecs, protocols, QoS, crypto, architecture |

---

## Content Architecture: Source & Confidence Tracking

Every content item in `/content/` must carry:

```json
{
  "id": "TD1_Ex1",
  "source": "tds/Fiches_TD_Communication_Multimedia_TD1-TD6_corrige_graphique.md",
  "source_type": "exercise_statement",
  "has_official_correction": false,
  "solution": {
    "status": "independently-derived",
    "confidence": "high",
    "method": "Course formulas: D=Fe×B×C, S=D×t/8, SNR=6.02B+1.25",
    "verification": "Automated golden test in engine test suite",
    "notes": "Unit convention: decimal for this exercise (tagged per-exercise)"
  }
}
```

```json
{
  "id": "TD3_Ex2",
  "source": "tds/tds_multimedia_v4(1).html",
  "source_type": "exercise_statement",
  "has_official_correction": false,
  "solution": {
    "status": "suggested-answer",
    "confidence": "medium",
    "method": "Standard MPEG decode/display order theory",
    "verification": "None — pedagogical answer",
    "notes": "⚠ Source data has B-frame with DTS=80 > PTS=0 (physically impossible). Teach expected answer + add 'Piège: Dans les vrais flux, PTS ≥ DTS toujours.'"
  }
}
```

---

## Golden Tests: Internal Consistency Only

Since no official corrections exist, **golden tests verify internal consistency**, not external truth:

| Test | What It Verifies |
|------|------------------|
| `AUD-SIZE-DEBIT` with TD1 Ex1 params | Engine returns 1411.2 kbps, 10.584 MB (decimal), SNR values match formula |
| `HUFFMAN-PROBS` with TD2 Ex1 probs | Engine produces valid prefix codes, avg length ≥ entropy |
| `VID-RAW` with TD2 Ex3 params | Engine returns 1492.99 Mbps |
| `GOP-SIZE` with TD2 Ex5 params | Engine returns GOP=10, compressed=25.2 MB |
| `LATENCY-BUDGET` with TD3 Ex4 params | Engine returns 170ms |
| `SFU-MCU-BW` with TD5 Ex3 params | Engine returns up=2.564, down=28.204, server_in=30.768, server_out=338.448 |

**Rule**: Golden tests ensure the engine is mathematically self-consistent. They do NOT prove the answer matches a teacher's correction.

---

## Documentation Updates Required

| Doc | Change |
|-----|--------|
| `COURSE_MAP.md` | Replace "golden values the engine MUST reproduce" with "internal consistency verification values". Add confidence labels to every exercise. |
| `AUDIT.md` | Clarify: current site solutions are `reference-implementation` (unverified). Content defects are discrepancies between site and independently derived solutions. |
| `OPEN_QUESTIONS.md` | All questions now explicitly about teacher expectations, not correction verification. |
| `DECISIONS.md` | Record: "No official corrections available. All solutions independently derived from course theory. Confidence labels applied throughout." |

---

## Implementation Workflow Adjustment

1. **Extract** exercise statements from `/tds/` sources (faithful to original French)
2. **Derive** solutions independently using course formulas/theory
3. **Implement** engine with `solve()` returning full step trace
4. **Test** internal consistency via golden tests
5. **Label** every solution with confidence status
6. **Present** to user as: *"Solution proposée (dérivée indépendamment du cours) — non confirmée par l'enseignant"*
7. **Flag** `needs-teacher-verification` items prominently
8. **Never** use `etude-cmm.html` solutions as ground truth

---

## User-Facing Presentation

In the UI, every solution shows a badge:

| Badge | Text | Color |
|-------|------|-------|
| `independently-derived` | "Calculé à partir des formules du cours" | Blue |
| `suggested-answer` | "Réponse suggérée (non confirmée)" | Amber |
| `needs-teacher-verification` | "⚠ À confirmer par l'enseignant" | Red |
| `reference-implementation` | "Du site actuel (non vérifié)" | Gray |

**Example**:
> **Exercice 1 — Débit, taille, SNR**
> 
> *Solution proposée (dérivée indépendamment du cours)*:
> 1. Débit = 44 100 × 16 × 2 = **1 411 200 bit/s = 1411.2 kbit/s**
> 2. Taille = 1 411 200 × 60 / 8 = **10 584 000 octets = 10.58 Mo (décimal) / 10.09 MiB (binaire)**
> 3. SNR 8b: 49.41 dB, 16b: 97.57 dB, 24b: 145.73 dB
> 4. FLAC (~50%): 5.29 Mo | MP3 128k (~91%): 0.95 Mo
> 
> *Convention d'unités: décimale pour cet exercice (taggé).*

---

*This document governs all content generation. No solution shall be presented as "official correction" without an actual teacher-provided correction document.*