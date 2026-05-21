import type { CardState } from './srs';
import { newCard } from './srs';

// Per-question progress, persisted in the browser. Single-device by design —
// no account, no server. Bump the key version if the CardState shape changes.
const KEY = 'malay-trainer:progress:v1';

export type Progress = Record<string, CardState>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable — progress simply won't persist this session.
  }
}

export function getCard(progress: Progress, id: string): CardState {
  return progress[id] ?? newCard();
}
