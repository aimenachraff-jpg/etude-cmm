# Audit of Current Site (etude-cmm.html)

**Source**: https://deploy-xi-five-19.vercel.app/  
**Date**: 2026-11-23  
**Reference**: `/tds/` exercise statements, `tds_multimedia_v4(1).html`, course PDFs, independently derived solutions

---

## Executive Summary

The current site is a **single-page HTML app** (~1,468 lines) containing all course content, TD solutions, 8 calculators, Huffman builder, 30-question quiz, and 50 flashcards. It works offline and requires no build step. However, it has **critical gaps** for exam preparation: no test mode, no exercise generator, no progress tracking, no spaced repetition, content defects vs. independently derived solutions, and UX/accessibility issues.

**⚠ Critical**: The current site's solutions are `reference-implementation` only — unverified, of unknown origin, and **not official corrections**. No official corrections exist in the source materials.

---

## 1. Content Gaps & Errors (vs. Independently Derived Solutions)

### Missing Exercises (Critical)
| TD | Missing | Impact |
|----|---------|--------|
| TD2 | Ex6 (resolution/bitrate table 144p–1080p, binary convention) | Students cannot practise this calculation type |
| TD2 | Ex7 (QCM: B-frame maximisation drawback → answer B) | Missing exam-style question |

### Incorrect Data vs. Independent Derivation
| Location | Current Site | Independently Derived | Severity |
|----------|-------------|----------------------|----------|
| TD3 Ex3 Cas2 | 300 étudiants | 500 étudiants (from Jupyter) | High — wrong scenario |
| TD3 Ex1 | Only parts a) & d) shown | Parts b) & c) missing from source sheet | Medium — flag `needs-teacher-verification` |
| TD1 Ex10 | Shows "incohérent pour du PCM" without derived duration | Add: durée = 18,750s (5h12m) | Medium |
| TD5 Ex3 SFU | Server totals unquantified | Up: 2.564, Down: 28.204, SFU in: 30.768, Out: 338.448 Mbps | High |

### Unit Convention Inconsistency (Critical)
| Exercise | Site Convention | Independent Derivation | Problem |
|----------|-----------------|------------------------|---------|
| TD1 Ex1 (1 min CD) | Decimal (10.58 Mo) | Decimal | OK |
| TD1 Ex16 (15 min CD) | Binary (151.4 MiB) | Binary | **Different from Ex1!** |
| TD1 Ex12 (VBR 5 min) | Mixed | Decimal | Inconsistent |
| TD2 Ex6 (resolution table) | Binary (MiB/GiB) | Binary | Consistent within TD2 but different from TD1 |
| TD4 Ex6b (1h YouTube) | 2.03 Go (mixed) | Decimal (2.08 GB) | Site slightly off |

**No global toggle**, no per-exercise tagging, no dual display.

### Pedagogical Issues
| Issue | Detail |
|-------|--------|
| TD3 Ex2 (PTS/DTS) | B frame with DTS=80 > PTS=0 is **physically impossible** (real: PTS≥DTS). Site teaches expected answer but **no warning note** about real stream behavior. |
| TD1 Ex3 (v(t) digitisation) | Solution says "exercice graphique" — no interactive digitiser, no reconstructed curve from spline points. |
| TD4 Ex3 | Timestamps aligned (both 1.000s) — should show frame durations: audio 21.33ms, video 40ms. |
| TD5 Ex2 (jitter) | Only shows max-min=60ms. Multiple definitions exist (MAD≈19.8, mean|Δ|=31.2, RFC3550≈8.97). No mention. |
| Quiz counts | Header: "20 QCM", Section: "30 questions" — inconsistent. Actual: 30 in code. |
| No "Pièges" page | Classic traps (×2 stéréo, /8, 1000 vs 1024, min→s, Nyquist 2×fmax, GOP counting, ms vs s) not collected. |

---

## 2. Missing Exam-Preparation Features (Critical)

| Feature | Current | Needed |
|---------|---------|--------|
| **Test/Exam mode** | None | Timed mock exams (15/60/120 min), configurable scope, pause-disabled timer, flag-for-review, auto-save |
| **Exercise generator** | None | Seeded PRNG, 25+ families, tolerance, unit-trap detection, error classification, "refaire mes erreurs" |
| **Spaced repetition** | Basic flashcards (50, no SM-2) | SM-2/Leitner, ≥120 cards, confusion pairs, error-profile auto-cards |
| **Progress tracking** | Quiz score only | Readiness per skill (8 domains), streak, due cards, weakness-based plan, test date countdown |
| **Shared exams** | None | Short challenge codes (seeded), score-code comparison, team Tier 1 |
| **Print/export** | None | Printable A4 "Fiche de révision", exam+corrigé PDF/print |
| **Design cases** | None | Netflix vs Meet, Oran telemedicine, live lecture 3 scenarios, VoIP capacity |

---

## 3. UX & Accessibility Issues

| Category | Issues |
|----------|--------|
| **Mobile** | Sticky nav overflows on <360px; calculators not touch-friendly; flashcard swipe not implemented |
| **Keyboard** | No shortcuts (Space=flip, Arrows=nav, 1-4=grade); quiz not fully keyboard operable |
| **Screen readers** | No ARIA on timer, quiz status, progress; flashcard flip not announced; calculator outputs not live regions |
| **Contrast** | Muted text (#94a3b8) on dark bg (#0a0f1e) = 3.2:1 (fail AA 4.5:1); focus outlines weak |
| **Motion** | No `prefers-reduced-motion` respect; transitions on nav, cards, progress |
| **Focus management** | Section switch doesn't move focus; modal solutions don't trap focus |
| **Language** | `lang="fr"` correct but no `lang` on English code snippets |

---

## 4. Performance Issues

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **HTML size** | ~120 KB (single file) | <50 KB per route (code-split) | Large |
| **JS** | Embedded, no code-split | ≤150 KB gzipped per route | No splitting |
| **CSS** | Embedded, ~15 KB | Critical CSS inline, rest async | OK |
| **Fonts** | System font stack (Inter) | Self-hosted, preload | OK |
| **Math** | KaTeX not used (plain text formulas) | KaTeX self-hosted | Missing |
| **PWA** | No manifest, no SW | Installable, offline-first | Missing |
| **Lighthouse est.** | ~60/100 | ≥90 all categories | Large |

---

## 5. Architecture & Maintainability

| Issue | Detail |
|-------|--------|
| **Single file** | 1,468 lines HTML+CSS+JS — hard to maintain, test, review |
| **No tests** | Zero unit/integration/E2E tests; golden values not verified |
| **Content mixed with logic** | Exercise data, solutions, calculators all in HTML |
| **No TypeScript** | No type safety for calculator engine, generator, content |
| **No content validation** | Missing `source`, `status`, explanations; QCM without verified correct answer |
| **LocalStorage only** | Progress in localStorage (5MB limit), no IndexedDB, no migration |
| **No CSP/security headers** | Inline scripts/styles, no nonce, no CSP via Vercel config |

---

## 6. Visual Design Issues

| Issue | Detail |
|-------|--------|
| **Generic purple-gradient** | Hero, buttons, accents all same purple — no domain differentiation |
| **No domain colours** | Audio, Image, Video, Network should have distinct accents for tags/charts/progress |
| **Typography** | Single font (Inter); no mono font for numbers/bitstreams/formulas |
| **Spacing** | Dense cards, inconsistent padding; no vertical rhythm |
| **Motion** | Decorative only (fade-in); no explanatory motion (waveforms, frame reorder, buffer fill) |
| **Dark mode only** | No light/auto theme; no print stylesheet |
| **Micro-interactions** | Answer checking: no correct/near-miss/mistake animations |

---

## 7. Security & Privacy

| Issue | Detail |
|-------|--------|
| **No CSP** | Inline scripts/styles execute freely |
| **No sanitization** | If Tier 2 backend added: user notes/names rendered without escaping |
| **No rate limiting** | API endpoints (if any) unprotected |
| **No secrets management** | `.env.example` missing for Tier 2 variables |

---

## 8. Priority Fix List

| Phase | Fixes |
|-------|-------|
| **0 (Now)** | COURSE_MAP, AUDIT, SPEC, PLAN, DECISIONS, SOURCE_STATUS docs; verify all TD content against `/tds/` statements |
| **1** | Scaffold Next.js+TS+Tailwind; design system; engine + internal consistency tests; migrate ALL 48 TD exercises with fixes; TD Explorer; formula/mémento/pièges pages |
| **2** | Lab tools (8 calculators + 8 interactive); generator 25 families; Entraînement mode |
| **3** | TEST/EXAMEN section (timed, presets, QCM+calc+concept+design, correction/analysis, print, shared codes) |
| **4** | Flashcards SM-2, dashboard/plan, search, PWA, Tier 1 team |
| **5** | Tier 2 backend (adapter+flag), perf/a11y review, Strix scan, Playwright, preview deploy |

---

## 9. Teacher Confirmation Needed (`OPEN_QUESTIONS.md`)

1. **TD3 Ex1 parts b) & c)**: Missing from source sheet — what were they?
2. **TD3 Ex2 B-frame DTS>PTS**: Confirm expected exam answer is decode I→P→B, display B→P→I despite physical impossibility?
3. **TD5 Ex2 jitter definition**: Which definition is "attendu" (max-min=60, MAD≈19.8, mean|Δ|=31.2, RFC3550≈8.97)?
4. **TD2 Ex7 QCM**: Confirm answer B (FF/FR seek + decode latency)?
5. **Unit convention**: For each TD, which convention (decimal/binary) is officially used in corrections?
6. **Exam format**: Barème +1/-0.5/0 confirmed? Partial credit for calculation steps? Duration? Number of questions?
7. **TD1 Ex3 v(t) curve**: Is the spline reconstruction from notebook points acceptable as "official" curve?
8. **Haptique**: Is it examinable? (Appears in Ch1 but not in TDs)

---

## 10. Metrics Summary

| Metric | Current | Target |
|--------|---------|--------|
| TD exercises covered | 46/48 (96%) | 48/48 (100%) |
| Content defects vs. independent derivation | 12 known | 0 |
| Quiz questions | 30 (inconsistent count) | ≥150 QCM + 40 concept + 4 design |
| Flashcards | 50 (no SRS) | ≥120 (SM-2) |
| Exercise generator | 0 | 25 families |
| Test modes | 0 | 6 presets + custom |
| Progress tracking | Quiz score only | 8-skill readiness + streak + plan |
| Offline support | Partial (HTML only) | Full (PWA + IndexedDB) |
| Lighthouse | ~60 | ≥90 all |
| WCAG | ~AA fail | 2.2 AA pass |
| Unit convention | Inconsistent | Global toggle + per-ex tag |
| Solution confidence | Unknown origin | Labeled: derived/suggested/needs-verification |

---

*End of Audit*