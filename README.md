# Malay Trainer

A static, offline-capable web app for learning **Bahasa Melayu**, from absolute beginner
(CEFR A1) to advanced (C2). No backend, no runtime AI — every question *and its feedback*
lives in a data file, so the whole app is a free static site.

## How it works

| Layer | Where | Edited by |
|---|---|---|
| Question bank | `content/bank/*.csv` (one CSV per level) | you, in Excel / Google Sheets |
| Course content | `content/grammar/*.md` (Markdown + frontmatter) | you, in any editor |
| Build step | `scripts/build-bank.mjs` | — compiles both to JSON in `public/` |
| Answer grading | `src/lib/checkAnswer.ts` | the single checker every question routes through |
| Scheduling | `src/lib/srs.ts` | Leitner spaced-repetition; progress saved in the browser |

`public/bank/` and `public/grammar/` are **generated** — CSV and Markdown are the source of truth.

## Develop

```bash
npm install
npm run dev      # builds the bank, then starts Vite
```

## Add questions

Open `content/bank/a1.csv` (etc.). Columns:

- `id, level, skill, type, prompt`
- **Multiple choice** (`type` = `mcq`): fill `opt_a..opt_d`, set one `opt_*_correct` to `true`,
  and write each `opt_*_why` — the feedback shown when that choice is picked.
- **Typed answer** (`type` = `text`, `fill_blank`, `word_order`): leave the options blank and
  fill `accepted` — pipe-separate alternatives, e.g. `ibu|emak`.
- `explanation` — the general "why", always shown after answering.
- `grammar_note` — id of a file in `content/grammar/` (optional).
- `tags` — pipe-separated (optional).

Then run `npm run build:bank` (or just `npm run dev`).

## Add a grammar lesson

Create `content/grammar/<id>.md`:

```markdown
---
id: my-topic
title: My topic
level: A2
tags: [grammar]
---
Lesson body in Markdown...
```

Link a question to it via the `grammar_note` column.

## Test

```bash
npm test         # vitest — covers the answer checker
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to
GitHub Pages. One-time setup: in the repo, **Settings → Pages → Source: GitHub Actions**.

The app lives at `https://<user>.github.io/malay-trainer/`. If you rename the repo,
update `base` in `vite.config.ts` to match.
