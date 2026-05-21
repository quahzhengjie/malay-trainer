import type { BankIndex, Exercise, GrammarNote } from '../types';

// All content is fetched as static JSON built by scripts/build-bank.mjs.
// BASE_URL keeps paths correct under the GitHub Pages sub-path.
const BASE = import.meta.env.BASE_URL;

export async function loadBankIndex(): Promise<BankIndex> {
  const res = await fetch(`${BASE}bank/index.json`);
  if (!res.ok) throw new Error('Could not load the question bank index.');
  return res.json();
}

export async function loadLevel(file: string): Promise<Exercise[]> {
  const res = await fetch(`${BASE}bank/${file}`);
  if (!res.ok) throw new Error(`Could not load ${file}.`);
  return res.json();
}

export async function loadAllExercises(): Promise<Exercise[]> {
  const index = await loadBankIndex();
  const groups = await Promise.all(index.levels.map((l) => loadLevel(l.file)));
  return groups.flat();
}

export async function loadGrammarNote(id: string): Promise<GrammarNote> {
  const res = await fetch(`${BASE}grammar/${id}.json`);
  if (!res.ok) throw new Error(`Could not load grammar note "${id}".`);
  return res.json();
}
