import type { Course, Exercise, GrammarIndex, GrammarNote } from '../types';

// All content is fetched as static JSON built by scripts/build-bank.mjs into public/data/.
// BASE_URL keeps paths correct under the GitHub Pages sub-path.
const BASE = `${import.meta.env.BASE_URL}data/`;

async function getJson<T>(path: string, what: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Could not load ${what}. Run "npm run build:bank".`);
  return res.json() as Promise<T>;
}

export function loadCourse(): Promise<Course> {
  return getJson<Course>('course.json', 'the course');
}

export function loadExercises(): Promise<Exercise[]> {
  return getJson<Exercise[]>('exercises.json', 'the question bank');
}

export function loadGrammarIndex(): Promise<GrammarIndex> {
  return getJson<GrammarIndex>('grammar/index.json', 'the grammar index');
}

export function loadGrammarNote(id: string): Promise<GrammarNote> {
  return getJson<GrammarNote>(`grammar/${id}.json`, `grammar note "${id}"`);
}
