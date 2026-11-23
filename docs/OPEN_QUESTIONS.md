# Open Questions for Teacher Confirmation

**Project**: Étude CMM — Exam Preparation Platform  
**Date**: 2026-11-23  
**Status**: All questions block content accuracy. Pick sensible defaults, record in DECISIONS.md, continue.

---

## 1. TD3 Ex1 — Missing Parts b) & c)

**Source**: `tds_multimedia_v4(1).html` shows only parts a) and d):
- a) À quelle couche ajoute-t-on le PTS/DTS ?
- d) Cite 1 protocole de transport pour VOD et 1 pour temps réel interactif.

Parts b) and c) are absent from the Jupyter export sheet.

**Question**: What were the original parts b) and c)?

**Default assumption**: Common follow-ups for this topic:
- b) À quoi servent le PTS et le DTS respectivement ?
- c) Pourquoi le DTS peut-il être supérieur au PTS pour les images B ?

**Action**: Flag as `needs-teacher-check` in content. Implement both common variants as alternative exercises.

---

## 2. TD3 Ex2 — B-frame DTS > PTS Physical Impossibility

**Source data**:
- PES 1: DTS=0ms, PTS=80ms, Type=I
- PES 2: DTS=40ms, PTS=40ms, Type=P
- PES 3: DTS=80ms, PTS=0ms, Type=B

**Problem**: In real MPEG streams, **PTS ≥ DTS always** (presentation cannot precede decoding). A B-frame with DTS=80ms > PTS=0ms is physically impossible.

**Expected exam answer** (from source corrections):
- Décodage: I(0) → P(40) → B(80) [par DTS croissant]
- Affichage: B(0) → P(40) → I(80) [par PTS croissant]
- Sync audio: audio PTS=0 avec video B, etc.
- DTS de B après son PTS car B dépend de I et P (décodé après, affiché avant)

**Question**: Should we teach the "expected" answer AND add a "Piège / Remarque" explaining real PTS≥DTS reordering, or only teach the expected answer?

**Default**: Teach expected answer + add explicit "⚠ Piège: Dans les vrais flux, PTS ≥ DTS toujours. Cet exercice utilise des valeurs pédagogiques impossibles pour tester la compréhension de l'ordre."

---

## 3. TD5 Ex2 — Jitter Definition (Multiple Definitions)

**Source data**: Packet arrival delays: 20, 35, 22, 60, 25, 80 ms

**Possible definitions**:
1. **Max-min** = 80 - 20 = **60 ms** (simplest, used in many courses)
2. **Mean Absolute Deviation (MAD)** = mean(|xi - mean|) ≈ **19.8 ms**
3. **Mean |Δ consecutive|** = mean(|35-20|, |22-35|, |60-22|, |25-60|, |80-25|) = **31.2 ms**
4. **RFC 3550 smoothed jitter** (exponential moving average) ≈ **8.97 ms**

**Question**: Which definition is "attendu" (expected) in the official correction?

**Default**: Show all four with labels. Mark **max-min = 60 ms** as "attendu (définition cours)" since it's simplest and matches buffer sizing (buffer = jitter + 1 frame). Flag as `needs-teacher-check`.

---

## 4. TD2 Ex7 — QCM: Maximising B-frames Drawback

**Options**:
- A. Taille de fichier compressé importante
- B. Problème d'interaction FastForward/FastReward (FF/FR)
- C. Les images ne peuvent pas être reçues par les destinataires
- D. La compression ne peut pas se faire

**Analysis**: More B-frames → higher compression (smaller files), so A is wrong. C and D are false. B is correct: B-frames require forward/backward references, making random access (seek, FF/FR) slower and increasing decode latency.

**Question**: Confirm answer **B**?

**Default**: Answer B. Add explanation: "B-frames need both past and future references → decode dependency chain longer → seek/FF/FR requires decoding more frames → latency increases."

---

## 5. Unit Convention per TD — Decimal vs Binary

**Observed inconsistencies**:
| Exercise | Site Value | Apparent Convention |
|----------|------------|---------------------|
| TD1 Ex1 (1 min CD) | 10.58 Mo | Decimal (10^6) |
| TD1 Ex16 (15 min CD) | 151.4 Mo | Binary (/1024²) |
| TD1 Ex12 (VBR 5 min) | 3.46 Mo | Mixed |
| TD2 Ex6 (240p) | 316.35 Mo/min | Binary (2^20) |
| TD4 Ex6b (1h YouTube) | 2.03 Go | Mixed (~2.08 GB decimal) |

**Question**: For each TD, what is the **official convention** used in corrections?

**Default**: 
- TD1: **Mixed** — Ex1 decimal, Ex16 binary. Tag each exercise individually.
- TD2: **Binary** (MiB/GiB) — confirmed by reverse-engineering Ex6 table.
- TD3: **Decimal** — network bitrates typically decimal.
- TD4: **Decimal** — Ex6 uses decimal (537.5 GB, 2.08 GB).
- TD5: **Decimal** — bitrates in Mbps/kbps (decimal).
- TD6: **Decimal** — E1 = 2.048 Mbps (decimal), PCM = 64 kbps (decimal).

**Implement**: Global toggle (Décimal/Binaire) + per-exercise `convention` tag + dual display where they differ.

---

## 6. Exam Format Details

**Unknowns**:
1. **Barème**: +1 / −0.5 / 0 confirmed? (Site uses this)
2. **Partial credit**: For calculation questions, credit by step (setup, conversion, result, unit)?
3. **Duration**: 60 min? 90 min? 120 min?
4. **Number of questions**: ~30? Mix ratio?
5. **Question types**: QCM only? Calculations? Short answers? Design cases?
6. **Authorized materials**: Calculator? Formula sheet? Nothing?

**Default assumptions** (from TD proportions):
- Barème: **+1 / −0.5 / 0** (configurable)
- Partial credit: **Yes** — 4 steps × 0.25pts each
- Duration: **60 min** (standard) + 120 min marathon option
- Questions: **25-30** — ~50% calc, 20% QCM, 20% concept, 10% design
- Types: **All four** (calc, QCM, concept, design)
- Materials: **Formula sheet provided** (build printable A4)

---

## 7. TD1 Ex3 — v(t) Digitisation Curve Reconstruction

**Source**: Jupyter notebook contains spline control points:
- 16 subdivisions over 2 seconds (x_grid = 0..16 × 2/16 = 0.125s steps)
- y_grid values: [1.5, 2.8, 3.0, 2.2, 5.5, 4.5, 7.8, 4.0, 0.0, -4.5, -5.0, -7.5, -6.5, -2.0, 5.5, 7.5, 0.0] / 8.0
- Cubic spline interpolation (natural boundary)

**Question**: Is this reconstructed curve acceptable as the "official" v(t) for the exercise?

**Default**: Yes — state clearly: *"La courbe est reconstruite à partir des points du notebook (16 subdivisions sur 2s, spline cubique naturelle). C'est une approximation ; les valeurs exactes dépendent du graphique original."* Implement interactive digitiser with this curve.

---

## 8. Haptique — Examinable?

**Source**: CM_CHAPITRE1 (Chapter 1) includes haptique section (IEEE 1918.1.1, 1000Hz, passivité, JND 7-10%). **Not in any TD.**

**Question**: Is haptique examinable? If yes, what depth (definitions only? formulas? calculations?)

**Default**: Tag as `hors-cours`. Include in course chapter view (filterable "Montrer seulement ce qui tombe aux TDs"). Add 5 flashcards + 3 QCM for completeness, but exclude from exams by default.

---

## 9. TD3 Ex3 Cas2 — Student Count

**Source**: "500 étudiants en fibre à travers l'Algérie avec box IPTV"
**Current site**: "300 étudiants"

**Question**: Confirm **500**?

**Default**: 500 (from source). Corrected in COURSE_MAP.

---

## 10. TD5 Ex3 — SFU Server Totals

**Source**: Only gives per-client up/down. Server totals left unquantified.

**Calculated**:
- Up/client: 2.5 + 0.064 = **2.564 Mbps**
- Down/client (11 flux): 11 × 2.564 = **28.204 Mbps**
- SFU server IN: 12 × 2.564 = **30.768 Mbps**
- SFU server OUT: 12 × 28.204 = **338.448 Mbps**
- MCU comparison: MCU transcodes to 1 flux/client → server CPU high, client bandwidth low (2.564 down)

**Question**: Confirm these totals?

**Default**: Use calculated values. Add to content.

---

## 11. TD4 Ex3 — RTP Timestamp Alignment

**Source**: Audio ts=48000 @48kHz = 1.000s; Video ts=90000 @90kHz = 1.000s → **perfectly aligned**.

**Current site**: Doesn't mention alignment or frame durations.

**Question**: Should we include frame durations (audio 21.33ms = 1024/48000, video 40ms = 1/25) and explicit alignment note?

**Default**: Yes — include both. Add to Lab tool "RTP Timestamp Visualiser".

---

## 12. Quiz Bank — Source of Questions

**Current site**: 30 questions (mixed categories), but header says "20 QCM", section says "30 questions".

**Question**: Should we rebuild from scratch using only TD/course content?

**Default**: Yes. Targets:
- ≥150 QCM (from TDs + course chapters)
- ≥40 short conceptual (from TD concept questions)
- ≥4 design cases (TD3 Ex4, TD5 Ex8, TD3 Ex3, TD6 Ex3-4)
- 25 generator families for calculations
- All tagged with `source` (TDn.Exm / Cours Ch.x / added) and `status` (étudié / hors-cours)

---

## 13. Flashcard Algorithm — SM-2 vs Leitner

**Options**:
- **SM-2** (SuperMemo 2): Intervals based on ease factor, more precise
- **Leitner** (box-based): Simpler, 5 boxes, fixed intervals

**Question**: Which to implement?

**Default**: **SM-2** — better for long-term retention, standard in Anki. Implement simplified version (ease factor 2.5, intervals: 1m, 10m, 1d, 3d, 7d, 14d, 30d...). Store in IndexedDB.

---

## 14. Tier 2 Backend — Supabase vs Vercel Postgres vs Redis

**Requirements**: Team rooms, leaderboard, shared notes, error wall. Managed, low cost, easy deploy.

**Options**:
- **Supabase**: Postgres + Auth + Realtime + Edge Functions. Free tier generous (500MB DB, 2GB bandwidth).
- **Vercel Postgres**: Native Vercel integration. Free tier (256MB).
- **Upstash Redis**: Serverless Redis. Free tier (10K requests/day).

**Default**: **Supabase** — best DX for this use case (Postgres for relational data, Realtime for presence-free async, Auth optional). Justify in DECISIONS.md.

---

## 15. Design Case — Oran Telemedicine (TD5 Ex8) Details

**Source constraints**:
- 20 consultations simultanées
- 1080p visio, JPEG/DICOM partage, enregistrement
- Latence <150ms, perte <0.5%
- Bande 100 Mbps symétrique
- Sécurité HIPAA
- Codecs, protocoles, QoS, chiffrement, dimensionnement, architecture

**Calculated**: 20 × 2.564 = **51.28 Mbps** (well under 100)

**Question**: Any missing constraints or expected details?

**Default**: Use calculated. Propose:
- Codecs: H.264/HEVC + Opus + JPEG
- Protocoles: WebRTC/SRTP (visio), HTTPS (DICOM)
- QoS: Priorité médicale (DiffServ EF)
- Chiffrement: TLS 1.3 + SRTP (DTLS-SRTP)
- Architecture: SFU (mesh pour 20) avec fallback MCU, liens redondants
- Monitoring: RTCP XR, alerting latence/perte

---

## 16. Printable "Fiche de révision" — Content Selection

**Question**: What should the user be able to select for the printable A4 cheat sheet?

**Default**: Checklist by topic:
- [ ] Formules (audio, image, vidéo, réseau, haptique)
- [ ] Pièges classiques (25+)
- [ ] Mémento (16 items)
- [ ] QCM clés (top 20)
- [ ] Tables de référence (résolutions, débits, QoS)
- [ ] Custom: user picks specific TDs/topics

Generate via print CSS (@media print), no heavy PDF library.

---

## 17. Shared Challenge Code — Format

**Requirement**: Short code deterministically regenerates same exam for teammates.

**Options**:
- Base64(seed + config) → ~20 chars
- Human-readable: `CMM-XXXX-XXXX` (12 chars)
- URL with params: `/exam?seed=...&config=...`

**Default**: **Human-readable code** `CMM-<8chars>` (e.g., `CMM-A7K9M2P4`). Seed = first 8 chars of SHA256(code). Config embedded in code via base32. Share via copy button + "Mon plan partagé" link.

---

## 18. Error Classification — Taxonomy

**Current site**: No error classification.

**Proposed taxonomy** (from mission §2):
1. `erreur_unité` — bits vs octets, k vs K, ms vs s
2. `erreur_conceptuelle` — wrong formula, misunderstood concept
3. `oubli_x2_stereo` — forgot ×2 channels
4. `oubli_div8` — bits→bytes missing /8
5. `confusion_1000_1024` — decimal vs binary
6. `confusion_min_sec` — minutes not converted to seconds
7. `arrondi` — rounding error
8. `nyquist_oublie_2x` — forgot 2×fmax
9. `gop_compte_faux` — I/P/B count wrong
10. `pts_dts_confusion` — PTS vs DTS mixup

**Question**: Approve taxonomy? Add more?

**Default**: Use above 10 + `autre`. Log to error profile per user. Show in correction: *"Cette réponse correspond à l'erreur type: **oubli_x2_stereo** (canaux stéréo non multipliés par 2)."*

---

## 19. Accessibility — Timer Announcements

**Requirement**: WCAG 2.2 AA for timed exams.

**Question**: How to announce time remaining to screen readers without disruption?

**Default**: 
- Live region (`aria-live="polite"`) updated every 30s + last 60s every 10s + last 10s every second
- `role="timer"` with `aria-label="Temps restant"`
- Pause button accessible (Space), but disabled by default in exam mode
- Visual + auditory warning at 5min, 1min, 30s (optional sound, respects `prefers-reduced-motion`)

---

## 20. Performance Budget — JS Bundle Size

**Target**: ≤150 KB gzipped per route (excluding shared chunks)

**Question**: Acceptable dependencies?
- `katex` (math): ~40 KB gzipped
- `dexie` (IndexedDB): ~15 KB
- `zustand` (state): ~1 KB
- `lucide-react` (icons): tree-shaken, ~5 KB
- `date-fns` (dates): tree-shaken, ~5 KB
- No heavy charting lib — custom SVG/Canvas

**Default**: Accept above. Budget leaves ~80 KB for app code. Monitor with `next-bundle-analyzer`.

---

*End of Open Questions. All defaults recorded in DECISIONS.md.*