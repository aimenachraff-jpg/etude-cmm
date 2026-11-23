# Decisions Log

**Project**: Étude CMM — Exam Preparation Platform  
**Date**: 2026-11-23  
**Principle**: Record every significant decision with rationale. Update as project evolves.

---

## 2026-11-23: Source Status & Solution Philosophy

**Decision**: No official corrections exist in `/tds/`. All solutions will be independently derived from course theory and clearly labeled with confidence status.

**Rationale**: The file `Fiches_TD_Communication_Multimedia_TD1-TD6_corrige_graphique.md` contains only exercise statements despite "corrige" in the name. The Jupyter export `tds_multimedia_v4(1).html` also contains only statements + partial code. The current site `etude-cmm.html` has unverified solutions.

**Implementation**:
- Every solution carries `status`: `independently-derived` | `suggested-answer` | `needs-teacher-verification` | `reference-implementation`
- Golden tests verify internal mathematical consistency only
- UI shows confidence badges on every solution
- Never present derived solutions as "official corrections"

**Recorded in**: `docs/SOURCE_STATUS.md`

---

## 2026-11-23: Unit Convention — Per-Exercise Tagging + Global Toggle

**Decision**: Implement a global "Convention d'unités" toggle (Décimal / Binaire) with per-exercise tagging. Display both results where they differ.

**Rationale**: Analysis shows inconsistent conventions across TDs:
- TD1 Ex1: Decimal (10.58 Mo)
- TD1 Ex16: Binary (151.4 MiB)
- TD2 Ex6: Binary (MiB/GiB)
- TD4 Ex6: Decimal (GB)

**Defaults per TD** (independently derived, needs teacher verification):
- TD1: Mixed — tag each exercise individually
- TD2: Binary (confirmed by reverse-engineering Ex6 table)
- TD3: Decimal (network bitrates)
- TD4: Decimal
- TD5: Decimal
- TD6: Decimal

**Implementation**: 
- Engine `solve()` returns both decimal and binary results
- Content JSON carries `convention: "decimal" | "binary" | "mixed"` per exercise
- UI toggle switches display, shows both when different

---

## 2026-11-23: TD3 Ex2 — B-Frame DTS > PTS Physical Impossibility

**Decision**: Teach the expected exam answer (decode I→P→B, display B→P→I) AND add explicit "Piège" note: "Dans les vrais flux MPEG, PTS ≥ DTS toujours. Cet exercice utilise des valeurs pédagogiques impossibles pour tester la compréhension de l'ordre."

**Rationale**: Source data has B-frame with DTS=80ms > PTS=0ms, which violates MPEG spec. The expected pedagogical answer is well-defined. Students must know both the exam answer and the real-world constraint.

**Implementation**: Solution marked `suggested-answer` + `needs-teacher-verification`. UI shows both the answer and the warning note prominently.

---

## 2026-11-23: TD5 Ex2 — Jitter Definition (Multiple Definitions)

**Decision**: Show all four definitions with labels. Mark **max-min = 60 ms** as "attendu (définition cours)" since it's simplest and matches buffer sizing formula. Flag as `needs-teacher-verification`.

**Definitions**:
1. Max-min = 60 ms (simplest, common in courses)
2. MAD ≈ 19.8 ms
3. Mean |Δ consecutive| = 31.2 ms
4. RFC 3550 smoothed ≈ 8.97 ms

**Rationale**: No single definition is universally standard in this course context. Max-min aligns with buffer = jitter + 1 frame teaching.

---

## 2026-11-23: TD2 Ex7 — QCM B-Frames Drawback

**Decision**: Answer **B** (Problème FF/FR + latence décodage). Add explanation: "B-frames need both past and future references → longer decode dependency chain → seek/FF/FR requires decoding more frames → latency increases."

**Confidence**: `suggested-answer` (high confidence, but not teacher-confirmed)

---

## 2026-11-23: TD3 Ex3 Cas2 — Student Count

**Decision**: Use **500 étudiants** (from Jupyter source), not 300 (from current site).

**Rationale**: Jupyter export is closer to original source material.

---

## 2026-11-23: TD3 Ex1 — Missing Parts b) & c)

**Decision**: Flag as `needs-teacher-verification`. Implement common variants as alternative exercises:
- b) À quoi servent le PTS et le DTS respectivement ?
- c) Pourquoi le DTS peut-il être supérieur au PTS pour les images B ?

**Rationale**: Source sheet only has parts a) and d). Common pedagogical follow-ups identified.

---

## 2026-11-23: TD1 Ex3 — v(t) Curve Reconstruction

**Decision**: Use cubic spline reconstruction from notebook's 16 control points (x_grid 0..16 over 2s, y_grid/8). State clearly: "La courbe est reconstruite à partir des points du notebook (16 subdivisions sur 2s, spline cubique naturelle). C'est une approximation ; les valeurs exactes dépendent du graphique original."

**Implementation**: Interactive digitiser in Lab with reconstructed curve. Solution marked `independently-derived` with approximation note.

---

## 2026-11-23: TD5 Ex3 — SFU Server Totals

**Decision**: Calculate and include server totals:
- Up/client: 2.564 Mbps
- Down/client (11 flux): 28.204 Mbps
- SFU IN: 12 × 2.564 = 30.768 Mbps
- SFU OUT: 12 × 28.204 = 338.448 Mbps
- MCU comparison: MCU transcodes to 1 flux/client → server CPU high, client bandwidth low

**Confidence**: `independently-derived`

---

## 2026-11-23: TD4 Ex3 — RTP Timestamp Alignment

**Decision**: Include explicit alignment note: Audio ts=48000 @48kHz = 1.000s, Video ts=90000 @90kHz = 1.000s → perfectly aligned. Include frame durations: audio 21.33ms (1024/48000), video 40ms (1/25).

**Confidence**: `independently-derived`

---

## 2026-11-23: TD1 Ex10 — Non-Integer Bits (5.8)

**Decision**: Present the inconsistency honestly: "N = 256000 / 44100 ≈ 5.8 bits (non-entier → fichier compressé, pas du PCM brut)." Also give derived duration: 600e6×8/256000 = 18 750 s.

**Confidence**: `independently-derived`

---

## 2026-11-23: Haptique — Examinable Status

**Decision**: Tag as `hors-cours` (appears in Ch1 but not in any TD). Include in course chapter view (filterable "Montrer seulement ce qui tombe aux TDs"). Add 5 flashcards + 3 QCM for completeness, but exclude from exams by default.

**Rationale**: No TD exercises on haptique. Unknown if examinable.

---

## 2026-11-23: Exam Format Defaults

**Decision** (independently derived from TD proportions):
- Barème: **+1 / −0.5 / 0** (configurable)
- Partial credit: **Yes** — 4 steps × 0.25pts each (setup, conversion, result, unit)
- Duration presets: **15 min** (éclair), **60 min** (standard), **120 min** (marathon)
- Question mix: ~50% calc, 20% QCM, 20% concept, 10% design
- Materials: **Formula sheet provided** (printable A4 generator)

**Recorded in**: `OPEN_QUESTIONS.md` — needs teacher confirmation

---

## 2026-11-23: Flashcard Algorithm — SM-2

**Decision**: Implement simplified **SM-2** (SuperMemo 2) — better for long-term retention, standard in Anki.

**Parameters**: Ease factor 2.5, intervals: 1m, 10m, 1d, 3d, 7d, 14d, 30d... Store in IndexedDB (Dexie).

---

## 2026-11-23: Tier 2 Backend — Supabase

**Decision**: Use **Supabase** (Postgres + Auth + Realtime + Edge Functions) for Tier 2 team features.

**Rationale**: Best DX for relational data (teams, notes, scores), Realtime for presence-free async, generous free tier (500MB DB, 2GB bandwidth), native Vercel integration.

**Implementation**: Behind storage adapter + feature flag. Only activate if env vars configured. Tier 1 (local-first) always works.

---

## 2026-11-23: Shared Challenge Code Format

**Decision**: Human-readable code `CMM-<8chars>` (e.g., `CMM-A7K9M2P4`). Seed = first 8 chars of SHA256(code). Config embedded via base32.

**Rationale**: Easy to share verbally, short, deterministic.

---

## 2026-11-23: Error Classification Taxonomy

**Decision**: 10-class taxonomy + `autre`:
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

**Implementation**: Engine classifies wrong answers, logs to error profile, shows in correction: "Cette réponse correspond à l'erreur type: **oubli_x2_stereo**."

---

## 2026-11-23: Printable "Fiche de révision" — Print CSS Only

**Decision**: Generate via `@media print` CSS, no heavy PDF library. User selects topics via checklist.

**Sections**: Formules, Pièges (25+), Mémento, QCM clés (top 20), Tables référence, Custom TD selection.

---

## 2026-11-23: Accessibility — Timer Announcements

**Decision**: Live region (`aria-live="polite"`) updated every 30s + last 60s every 10s + last 10s every second. `role="timer"`. Pause button accessible (Space) but disabled by default in exam mode. Visual + optional auditory warnings at 5min, 1min, 30s (respects `prefers-reduced-motion`).

---

## 2026-11-23: Performance Budget

**Decision**: ≤150 KB gzipped JS per route (excluding shared chunks). Acceptable deps:
- `katex` ~40 KB
- `dexie` ~15 KB
- `zustand` ~1 KB
- `lucide-react` tree-shaken ~5 KB
- `date-fns` tree-shaken ~5 KB
- No charting lib — custom SVG/Canvas

**Monitoring**: `next-bundle-analyzer` in CI.

---

## 2026-11-23: Visual Design — Domain Accent Colours

**Decision**: Four domain colours used consistently for tags, charts, progress:
- **Audio**: Cyan/Blue family (e.g., `#06b6d4`)
- **Image**: Purple/Violet family (e.g., `#a855f7`)
- **Video**: Orange/Amber family (e.g., `#f59e0b`)
- **Réseau/Transport**: Green/Emerald family (e.g., `#10b981`)

**Rationale**: Not generic purple gradient. Editorial-meets-instrument aesthetic suited to signal/media topics. Strong typographic hierarchy (quality text face + mono face for numbers/bitstreams).

---

## 2026-11-23: Tech Stack — Next.js App Router + TypeScript + Tailwind

**Decision**: Next.js 14+ (App Router), TypeScript strict, Tailwind CSS. Content in typed JSON/MDX under `/content`. Engine in `/engine` as pure TS (zero UI imports). State: Zustand + IndexedDB (Dexie). Testing: Vitest (engine), Playwright (E2E).

**Rationale**: Statically generated for Vercel, excellent DX, matches Vercel agent-skills best practices.

---

*End of Decisions Log. Update as new decisions are made.*