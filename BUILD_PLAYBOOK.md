# Building a Language-Learning App — Playbook

Distilled from building **Malay Trainer**. Read this before starting the next one
(e.g. a Japanese version) so you don't restart from scratch.

## The stack that worked

- **React + Vite + TypeScript**, a static single-page app. No backend.
- **Content as data** — CSV question banks + Markdown notes + a build script that
  compiles them to static JSON.
- **PWA**, hosted free on **GitHub Pages**, deployed by a **GitHub Actions** workflow.
- Progress in **localStorage** — single-device, no accounts. Deliberate: keeps it
  free, static and private.

Why it worked: zero runtime cost, free hosting, content editable without touching
code, and it scaled from 30 to 740+ questions with no re-architecting.

## Core design decisions (reuse all of these)

1. **Content is data, not code.** A `build-*.mjs` script compiles CSV + Markdown to
   JSON and **validates hard** — fail the build on bad data.
2. **One centralized answer-checker.** Every question type routes through a single
   pure function. Easy to unit-test; grading rules live in exactly one place.
3. **Feedback authored into the content.** Every wrong multiple-choice option carries
   its own "why". Good feedback with no runtime AI.
4. **Course → Chapters → Lessons → Questions.** A lesson teaches first (a note),
   then quizzes.
5. **Spaced repetition (Leitner).** ~40 lines. It is what lets one bank serve a
   beginner and an advanced learner.
6. **A Home/overview screen + streak / XP / daily goal.** The quiz engine alone is
   not a product — orientation and motivation are half of what makes people return.

## The build sequence that worked

Structure before content. Engine before polish. Reviews in the middle, not the end.

1. Scaffold + the data schema + the answer-checker (with tests).
2. The course structure (chapters / lessons / tabs) — get navigation right while
   there is little content.
3. Bulk content generation.
4. Theme, icons, visual polish.
5. **Independent reviews** (code / UX / content) — act on them; they change direction.
6. Motivation layer (Home, streak, onboarding).
7. Functional / communicative content + friction fixes.

## Pitfalls & lessons learnt (the expensive ones)

- **Build-time validation pays for itself.** Fail the build on duplicate ids,
  malformed rows, invalid enums, unknown references. It caught dozens of errors.
- **AI-generated structured data is fragile.** CSV comma-quoting broke nearly every
  generated batch. You need a validator *and* a fix loop — "mostly right" is not right.
- **Bugs hide until someone uses it.** A spaced-repetition interval-of-zero bug (the
  review count never cleared) was invisible to code review; only real use found it.
  Dogfood early.
- **Independent reviews change direction.** "This teaches *about* the language more
  than it teaches the language" reframed the whole content plan. Get fresh eyes
  mid-build, not at the end.
- **A quiz engine is not a product.** A home screen, streak, daily goal and onboarding
  are the half that creates daily pull.
- **AI-generated content still needs a human native speaker.** An AI audit catches a
  lot, not everything. Plan a human review for anything people learn from.
- **Keep generated artifacts out of git.** The compiled JSON is generated — gitignore
  it, edit the source.
- **Parallelise content generation** — one agent per level/topic, then validate centrally.
- **Quote every free-text CSV field.** One stray comma corrupts a row.

## What transfers to a new language — and what doesn't

**Transfers as-is:** the entire architecture — stack, build pipeline, spaced
repetition, the course/lesson model, Home/streak/XP, theme, PWA, deploy workflow,
the component structure. Fork the repo, swap the content.

**Language-specific — the real work:**

- **The answer-checker / `normalize()`.** Malay is plain Latin script, so
  normalization is trivial (lowercase, strip punctuation). Other languages need their
  own rules.
- **What "levels" and "lessons" mean** — Malay used CEFR; another language may use a
  different framework.
- **The writing system.** Malay has none beyond Latin. For many languages this is the
  single biggest piece of new work.

## Planned: the Japanese app

Decisions made (2026-05-22) — to be built in a later session:

- **Separate app.** A new repo, `japanese-trainer`, forking Malay Trainer's structure
  (`src/`, `scripts/`, `content/`, deploy workflow). Malay Trainer stays untouched.
  If a third language is ever added, extract a shared core *then* — not before.
- **Input model: accept both romaji and kana.** The learner may type Latin letters
  (`sushi`) or kana (`すし`); both are accepted for the same answer.
- **Levels: JLPT N5 → N1** (instead of CEFR).

The one piece that does **not** transfer — and the main build work — is the
**answer-checker**:

- Canonical comparison form = **hiragana**. `normalize()` converts the learner's
  input to hiragana first: katakana → hiragana is a simple code-point shift;
  romaji → hiragana is a fixed syllable lookup table (handle long vowels, small tsu,
  ん).
- Author `accepted` answers in **kana**. For kanji questions, accept the kanji *and*
  its kana reading (pipe-separated) so kanji / kana / romaji all match.
- The rest of `checkAnswer` (multiple-choice, near-miss, etc.) carries over.

Curriculum progression: **hiragana → katakana → kanji + vocabulary + grammar**.
Plan for later: furigana, politeness levels (plain / -masu / keigo), particles,
counters, pitch accent.

Everything else — architecture, build pipeline, spaced repetition, course/lesson
model, Home / streak / XP, theme, PWA, deploy — copies straight over from Malay
Trainer. When ready, follow "The build sequence" above; the first real task is the
romaji↔kana answer-checker.

## Checklist to start the next app

- [ ] New repo; fork the Malay Trainer structure (`src/`, `scripts/`, `content/`).
- [ ] Decide the answer-input / writing-system model before anything else.
- [ ] Adapt `normalize()` and `checkAnswer` for the language.
- [ ] Define the level framework and the chapter/lesson outline.
- [ ] Keep build-time validation; write the `check-csv` helper.
- [ ] Generate content per level in parallel, validate, then human-review.
- [ ] Reuse Home / SRS / theme / PWA / deploy wholesale.
