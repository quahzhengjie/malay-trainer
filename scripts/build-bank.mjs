// Compiles the human-edited content/ sources into JSON the app fetches at runtime.
//   content/bank/*.csv   + content/lessons.csv  -> public/data/exercises.json + course.json
//   content/grammar/*.md                        -> public/data/grammar/<id>.json + index.json
// CSV and Markdown are the source of truth; everything in public/data/ is generated.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import Papa from 'papaparse';
import matter from 'gray-matter';

const ROOT = join(import.meta.dirname, '..');
const BANK_SRC = join(ROOT, 'content', 'bank');
const GRAMMAR_SRC = join(ROOT, 'content', 'grammar');
const LESSONS_CSV = join(ROOT, 'content', 'lessons.csv');
const OUT = join(ROOT, 'public', 'data');
const GRAMMAR_OUT = join(OUT, 'grammar');

const splitList = (v) => (v || '').split('|').map((s) => s.trim()).filter(Boolean);
const isTrue = (v) => ['true', '1', 'yes', 'x'].includes(String(v).trim().toLowerCase());
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function fail(msg) {
  console.error(`\n  build-bank: ${msg}\n`);
  process.exit(1);
}

function parseCsv(path, name) {
  const result = Papa.parse(readFileSync(path, 'utf8'), { header: true, skipEmptyLines: true });
  if (result.errors.length) fail(`CSV error in ${name}: ${JSON.stringify(result.errors[0])}`);
  return result.data;
}

function rowToExercise(row, file, lineNo) {
  const id = (row.id || '').trim();
  if (!id) fail(`${file} line ${lineNo}: missing id`);
  const type = (row.type || '').trim();
  const ex = {
    id,
    level: (row.level || '').trim(),
    skill: (row.skill || '').trim(),
    lesson: (row.lesson || '').trim(),
    type,
    prompt: (row.prompt || '').trim(),
    explanation: (row.explanation || '').trim(),
    tags: splitList(row.tags),
  };
  if (!ex.lesson) fail(`${file} line ${lineNo} (${id}): missing lesson`);
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

// Start clean so deleted content never lingers.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(GRAMMAR_OUT, { recursive: true });

// ---- exercises ----
const exercises = [];
const csvFiles = existsSync(BANK_SRC)
  ? readdirSync(BANK_SRC).filter((f) => f.endsWith('.csv')).sort()
  : [];
for (const file of csvFiles) {
  parseCsv(join(BANK_SRC, file), file).forEach((row, i) =>
    exercises.push(rowToExercise(row, file, i + 2)),
  );
}
const ids = new Set();
for (const ex of exercises) {
  if (ids.has(ex.id)) fail(`duplicate exercise id "${ex.id}"`);
  ids.add(ex.id);
}

// ---- course structure (chapters -> lessons) ----
if (!existsSync(LESSONS_CSV)) fail('content/lessons.csv is missing');
const chapters = [];
const lessonById = new Map();
parseCsv(LESSONS_CSV, 'lessons.csv').forEach((row, i) => {
  const lessonId = (row.lesson_id || '').trim();
  if (!lessonId) fail(`lessons.csv line ${i + 2}: missing lesson_id`);
  if (lessonById.has(lessonId)) fail(`lessons.csv: duplicate lesson_id "${lessonId}"`);
  const chapterTitle = (row.chapter || '').trim() || 'Lessons';
  let chapter = chapters.find((c) => c.title === chapterTitle);
  if (!chapter) {
    chapter = { id: slug(chapterTitle), title: chapterTitle, lessons: [] };
    chapters.push(chapter);
  }
  const lesson = {
    id: lessonId,
    title: (row.lesson_title || lessonId).trim(),
    level: (row.level || '').trim(),
    intro: (row.intro || '').trim(),
    exerciseIds: [],
  };
  const note = (row.grammar_note || '').trim();
  if (note) lesson.grammarNote = note;
  chapter.lessons.push(lesson);
  lessonById.set(lessonId, lesson);
});

// Attach each exercise to its lesson, preserving bank order.
for (const ex of exercises) {
  const lesson = lessonById.get(ex.lesson);
  if (!lesson) fail(`exercise "${ex.id}" references unknown lesson "${ex.lesson}"`);
  lesson.exerciseIds.push(ex.id);
}
for (const chapter of chapters) {
  for (const lesson of chapter.lessons) {
    if (lesson.exerciseIds.length === 0)
      console.warn(`  warning: lesson "${lesson.id}" has no exercises`);
  }
}

writeFileSync(join(OUT, 'exercises.json'), JSON.stringify(exercises));
writeFileSync(join(OUT, 'course.json'), JSON.stringify({ chapters }, null, 2));

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
}
writeFileSync(join(GRAMMAR_OUT, 'index.json'), JSON.stringify({ notes }, null, 2));

const lessonCount = chapters.reduce((n, c) => n + c.lessons.length, 0);
console.log(
  `  Built ${exercises.length} exercises, ${lessonCount} lessons in ${chapters.length} chapters, ${notes.length} grammar notes.`,
);
