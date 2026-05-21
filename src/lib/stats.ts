import type { Exercise, Lesson } from '../types';
import type { Progress } from './storage';
import { getCard } from './storage';
import { isDue } from './srs';

export interface LessonStats {
  total: number;
  /** Questions attempted at least once. */
  practiced: number;
  /** Practiced questions currently due for review. */
  due: number;
  done: boolean;
}

export function lessonStats(
  lesson: Lesson,
  byId: Map<string, Exercise>,
  progress: Progress,
): LessonStats {
  const now = Date.now();
  let practiced = 0;
  let due = 0;
  for (const id of lesson.exerciseIds) {
    if (!byId.has(id)) continue;
    const card = getCard(progress, id);
    if (card.seen > 0) {
      practiced++;
      if (isDue(card, now)) due++;
    }
  }
  const total = lesson.exerciseIds.length;
  return { total, practiced, due, done: total > 0 && practiced === total };
}

/** Every learned (seen) question that is currently due, across the whole course. */
export function dueExercises(exercises: Exercise[], progress: Progress): Exercise[] {
  const now = Date.now();
  return exercises
    .filter((ex) => {
      const card = getCard(progress, ex.id);
      return card.seen > 0 && isDue(card, now);
    })
    .sort((a, b) => getCard(progress, a.id).due - getCard(progress, b.id).due);
}
