# Malay Trainer — Project Notes

A living reference for the project: current state, decisions, history and roadmap.
For *how to develop and add content*, see `README.md`.

_Last updated: 2026-05-22._

## What it is

A static, offline-capable PWA for learning **Bahasa Melayu** from absolute beginner
(CEFR A1) to advanced (C2). No backend, no runtime AI — every question and its
feedback lives in a data file, so the whole app is a free static site on GitHub Pages.

- **Repo:** github.com/quahzhengjie/malay-trainer (public)
- **Live:** https://quahzhengjie.github.io/malay-trainer/
- **Local dev:** `npm run dev` → http://localhost:5173/malay-trainer/

## Current state

- **741 questions · 36 lessons · 13 chapters** (A1–C2, plus an A2 "Everyday
  Situations" survival chapter) · 28 grammar notes.
- **4 tabs:** Home (default) · Learn · Review · Grammar.
- Builds clean; 11/11 unit tests pass.

## Architecture

```
content/bank/*.csv      question banks  ─┐
content/lessons.csv     course outline   ├─ scripts/build-bank.mjs ─→ public/data/*.json
content/grammar/*.md    grammar notes   ─┘                            (generated, gitignored)
                                                                            │
src/  React + Vite + TypeScript SPA  ◄──────────── fetches the JSON ────────┘
```

- **Content is the source of truth** — CSV + Markdown, hand/AI-editable. `build-bank.mjs`
  compiles and validates it (column count, one-correct-MCQ, valid level/skill/type,
  known lesson refs). `scripts/check-csv.mjs` reports CSV field-count errors.
- `src/lib/checkAnswer.ts` — the single answer-checker every question type routes through.
- `src/lib/srs.ts` — Leitner spaced repetition. `src/lib/userStats.ts` — streak / XP /
  daily goal. `src/lib/storage.ts` — progress, onboarding flag.
- Progress is per-device in `localStorage` (keys: `…:progress:v1`, `…:stats:v1`,
  `…:theme`, `…:onboarded`). No accounts, no sync — deliberate.
- Deploy: push to `main` → `.github/workflows/deploy.yml` builds and publishes to Pages.

## Build history (milestones)

1. Scaffold — static React/Vite SPA, CSV bank + centralized checker, PWA, Pages deploy.
2. Course restructure — Course → Chapters → Lessons; tabbed navigation; teach-then-quiz.
3. Content to 670 questions across all six CEFR levels; light/dark theme; SVG icons
   (no emoji).
4. Quality passes — Malay-expert review per level; accessibility + code-quality fix
   pass; SRS bug fix (box-0 interval).
5. Home tab — overview dashboard, streak / XP / daily goal, grammar cheat-sheet.
6. Functional content — 5 A2 survival lessons (time, dates, money, ordering food,
   weather) → 741 questions.
7. Friction + audio — lessons split into rounds; first-run onboarding with
   self-placement; speech-synthesis pronunciation on typed-answer feedback.

## Reviews completed

Independent agent reviews have been run and acted on:

- **Code review** — bugs/quality; led to build-time validation, length-scaled typo
  tolerance, theme-toggle sync, memoised review count.
- **UX / accessibility review** — led to the modal/focus fixes, `aria-live` feedback,
  contrast fix, and the Home tab.
- **Malay-expert review (per CEFR level)** — corrected a handful of genuine content
  errors; the bank is otherwise sound.
- **Content / pedagogy review** — flagged the curriculum gaps below.

## Roadmap (not yet done)

From the content/pedagogy review, in priority order:

1. **Listening question type** — hear a Malay phrase, pick the meaning. Needs a new
   question `type` and a Malay-text field in the schema. (The current audio only
   pronounces typed-answer feedback.)
2. **Reading-comprehension passages** at B1+ — nothing longer than one sentence exists.
3. **Rebalance toward production** — still recognition-heavy ("what does X mean?").
4. **Bridge the A2→B1 jump** — an intermediate-communication chapter (narrating
   past/future, making plans, opinions) before the affix-heavy B1 block.
5. **Missing grammar notes** — classifiers/counting words, negation in depth,
   prepositions, demonstratives, `ada`, number formation/ordinals.
6. **More vocabulary domains** — jobs, health/body, house, clothing, hobbies, emotions.
7. **Settings screen** — move "Reset progress" off the Learn tab; add export/import
   of progress as a JSON file (the only backup possible without a backend).
8. **Real PNG PWA icons** — currently SVG only (fine on Android/desktop; iOS prefers PNG).

## Known limitations / notes

- **Content is AI-generated and AI-audited, not reviewed by a fluent Malay speaker.**
  The per-level expert pass caught real errors, but flag anything that looks off.
- Progress is single-device; iOS Safari can evict `localStorage` after ~7 days unused.
- `deploy.yml` uses Node-20-era GitHub Actions — a harmless deprecation warning;
  bump the action versions before mid-2026.
- Generated `public/data/` is gitignored — never hand-edit it; edit the CSV/Markdown.
- Maven/Java note does not apply — this project is pure Node/React.

## Conventions

- One commit per logical change; pushes auto-deploy. Branch: `main`.
- Quote every text field in the question CSVs — unquoted commas are the most common
  break. Run `node scripts/check-csv.mjs` after bulk edits.
