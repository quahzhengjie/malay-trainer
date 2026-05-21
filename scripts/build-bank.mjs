// Compiles the human-edited content/ sources into JSON the app fetches at runtime.
//   content/bank/*.csv     -> public/bank/<LEVEL>.json  + public/bank/index.json
//   content/grammar/*.md   -> public/grammar/<id>.json  + public/grammar/index.json
// CSV and Markdown are the source of truth; the JSON in public/ is generated (gitignored).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import Papa from 'papaparse';
import matter from 'gray-matter';

const ROOT = join(import.meta.dirname, '..');
const BANK_SRC = join(ROOT, 'content', 'bank');
const GRAMMAR_SRC = join(ROOT, 'content', 'grammar');
const BANK_OUT = join(ROOT, 'public', 'bank');
const GRAMMAR_OUT = join(ROOT, 'public', 'grammar');

mkdirSync(BANK_OUT, { recursive: true });
mkdirSync(GRAMMAR_OUT, { recursive: true });

const splitList = (v) => (v || '').split('|').map((s) => s.trim()).filter(Boolean);
const isTrue = (v) => ['true', '1', 'yes', 'x'].includes(String(v).trim().toLowerCase());

function fail(msg) {
  console.error(`\n  build-bank: ${msg}\n`);
  process.exit(1);
}

function rowToExercise(row, file, lineNo) {
  const id = (row.id || '').trim();
  if (!id) fail(`${file} line ${lineNo}: missing id`);
  const type = (row.type || '').trim();
  const ex = {
    id,
    level: (row.level || '').trim(),
    skill: (row.skill || '').trim(),
    type,
    prompt: (row.prompt || '').trim(),
    explanation: (row.explanation || '').trim(),
    tags: splitList(row.tags),
  };
  const note = (row.grammar_note || '').trim();
  if (note) ex.grammarNote = note;

  if (type === 'mcq') {
    const options = [];
    for (const k of ['a', 'b', 'c', 'd']) {
      const text = (row[`opt_${k}`] || '').trim();
      if (!text) continue;
      options.push({
        text,
        correct: isTrue(row[`opt_${k}_correct`]),
        rationale: (row[`opt_${k}_why`] || '').trim(),
      });
    }
    if (options.length < 2) fail(`${file} line ${lineNo} (${id}): mcq needs at least 2 options`);
    if (options.filter((o) => o.correct).length !== 1)
      fail(`${file} line ${lineNo} (${id}): mcq must have exactly one correct option`);
    ex.options = options;
  } else {
    ex.accepted = splitList(row.accepted);
    if (ex.accepted.length === 0)
      fail(`${file} line ${lineNo} (${id}): "${type}" needs at least one accepted answer`);
  }
  return ex;
}

// ---- question banks ----
const levels = [];
let total = 0;
const csvFiles = existsSync(BANK_SRC)
  ? readdirSync(BANK_SRC).filter((f) => f.endsWith('.csv')).sort()
  : [];

for (const file of csvFiles) {
  const text = readFileSync(join(BANK_SRC, file), 'utf8');
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) fail(`CSV error in ${file}: ${JSON.stringify(parsed.errors[0])}`);

  const exercises = parsed.data.map((row, i) => rowToExercise(row, file, i + 2));
  const seen = new Set();
  for (const ex of exercises) {
    if (seen.has(ex.id)) fail(`duplicate id "${ex.id}" in ${file}`);
    seen.add(ex.id);
  }
  const level = basename(file, '.csv').toUpperCase();
  writeFileSync(join(BANK_OUT, `${level}.json`), JSON.stringify(exercises));
  levels.push({ level, file: `${level}.json`, count: exercises.length });
  total += exercises.length;
  console.log(`  ${file} -> bank/${level}.json (${exercises.length} exercises)`);
}
writeFileSync(join(BANK_OUT, 'index.json'), JSON.stringify({ levels, total }, null, 2));

// ---- grammar notes ----
const notes = [];
const mdFiles = existsSync(GRAMMAR_SRC)
  ? readdirSync(GRAMMAR_SRC).filter((f) => f.endsWith('.md')).sort()
  : [];

for (const file of mdFiles) {
  const { data, content } = matter(readFileSync(join(GRAMMAR_SRC, file), 'utf8'));
  const id = String(data.id || basename(file, '.md')).trim();
  const note = {
    id,
    title: String(data.title || id),
    level: String(data.level || ''),
    tags: Array.isArray(data.tags) ? data.tags : splitList(data.tags),
    body: content.trim(),
  };
  writeFileSync(join(GRAMMAR_OUT, `${id}.json`), JSON.stringify(note));
  notes.push({ id, title: note.title, level: note.level });
  console.log(`  ${file} -> grammar/${id}.json`);
}
writeFileSync(join(GRAMMAR_OUT, 'index.json'), JSON.stringify({ notes }, null, 2));

console.log(`\n  Done: ${total} exercises in ${levels.length} level(s), ${notes.length} grammar note(s).\n`);
