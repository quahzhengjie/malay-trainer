// Leitner spaced-repetition scheduler.
// Box 0 = new or just-lapsed; higher boxes are reviewed less often; MAX_BOX = mastered.
// This is what lets one question bank serve a beginner and an advanced learner equally well:
// mastered items quietly drop out of rotation, weak ones keep coming back.

// Days until a card is next due, indexed by box. Box 0 (new / just-lapsed) is
// 1 day, never 0 — so a card you just answered leaves the "due" pool, and a
// review session you finish today correctly clears the count to zero.
const INTERVALS_DAYS = [1, 1, 3, 7, 16, 35];
export const MAX_BOX = INTERVALS_DAYS.length - 1;
const DAY_MS = 86_400_000;

export interface CardState {
  box: number;
  /** Epoch ms when this card is next due. */
  due: number;
  /** Total attempts. */
  seen: number;
  /** Total correct attempts. */
  correct: number;
}

export function newCard(): CardState {
  return { box: 0, due: Date.now(), seen: 0, correct: 0 };
}

/** Record a review outcome and return the updated card. */
export function review(card: CardState, wasCorrect: boolean): CardState {
  const box = wasCorrect ? Math.min(card.box + 1, MAX_BOX) : 0;
  return {
    box,
    due: Date.now() + INTERVALS_DAYS[box] * DAY_MS,
    seen: card.seen + 1,
    correct: card.correct + (wasCorrect ? 1 : 0),
  };
}

export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.due <= now;
}
