# Malay Trainer

A static, offline-capable web app for learning **Bahasa Melayu**, from absolute beginner
(CEFR A1) to advanced (C2). No backend, no runtime AI — every question *and its feedback*
lives in a data file, so the whole app is a free static site.

## Structure

The app has four tabs:

- **Home** — at-a-glance overview: streak, daily goal, what's due for review, a
  "continue learning" shortcut, course progress and a grammar cheat-sheet.
- **Learn** — the course map: chapters → lessons. Each lesson teaches first
  (a grammar / intro card) then runs ~12–25 questions, ending in a completion screen.
- **Review** — spaced repetition. Only questions you've already learned resurface here,
  scheduled by a Leitner algorithm.
- **Grammar** — browse every grammar note directly.

## How content works

| Layer | Where | Edited by |
|---|---|---|
| Question bank | `content/bank/*.csv` (one CSV per level) | you, in Excel / Sheets |
| Course outline | `content/lessons.csv` (chapters & lessons) | you, in Excel / Sheets |
| Grammar notes | `content/grammar/*.md` (Markdown + frontmatter) | you, in any editor |
| Build step | `scripts/build-bank.mjs` | compiles all of the above to `public/data/` |
| Answer grading | `src/lib/checkAnswer.ts` | the single checker every question routes through |

Everything in `public/data/` is **generated** — the CSVs and Markdown are the source of truth.

## Develop

```bash
npm install
npm run dev      # builds content, then starts Vite
```

## Add a question

Open `content/bank/a1.csv` (etc.). Key columns:

- `id, level, skill, lesson, type, prompt` — `lesson` must match a `lesson_id` in `lessons.csv`.
- **Multiple choice** (`type` = `mcq`): fill `opt_a..opt_d`, set one `opt_*_correct` to `true`,
  and write each `opt_*_why` — the feedback shown when that choice is picked.
- **Typed answer** (`type` = `text`, `fill_blank`, `word_order`): leave the options blank and
  fill `accepted` — pipe-separate alternatives, e.g. `ibu|emak`.
- `explanation` — the general "why", always shown after answering.
- `grammar_note`, `tags` — optional.

## Add a lesson or chapter

Edit `content/lessons.csv`. One row per lesson:

```
chapter,lesson_id,lesson_title,level,grammar_note,intro
First Words,greetings,Greetings & polite words,A1,greetings,"A short intro line."
```

Rows sharing a `chapter` value are grouped into that chapter, in file order.
`grammar_note` (optional) is the id of a file in `content/grammar/`, shown as the
lesson's teaching card. A question joins a lesson via its `lesson` column.

## Add a grammar note

Create `content/grammar/<id>.md` with frontmatter (`id, title, level, tags`), then
reference its `id` from a lesson or a question. Tables and other GitHub-flavored
Markdown are supported.

## Test & deploy

```bash
npm test         # vitest — covers the answer checker and the SRS scheduler
```

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to
GitHub Pages (`https://<user>.github.io/malay-trainer/`). One-time setup:
**Settings → Pages → Source: GitHub Actions**. If you rename the repo, update `base`
in `vite.config.ts`.
