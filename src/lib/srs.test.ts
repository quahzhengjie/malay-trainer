import { describe, it, expect } from 'vitest';
import { newCard, review, isDue } from './srs';

describe('srs scheduler', () => {
  it('a correct answer advances the box and schedules into the future', () => {
    const card = review(newCard(), true);
    expect(card.box).toBe(1);
    expect(card.seen).toBe(1);
    expect(card.correct).toBe(1);
    expect(isDue(card)).toBe(false);
  });

  it('a wrong answer resets to box 0 but is NOT due again immediately', () => {
    // Regression guard: box 0 once had a 0-day interval, so a missed card was
    // due instantly and the Review count could never reach zero.
    const card = review({ box: 3, due: Date.now(), seen: 5, correct: 4 }, false);
    expect(card.box).toBe(0);
    expect(isDue(card)).toBe(false);
  });

  it('isDue becomes true once the due time has passed', () => {
    expect(isDue({ box: 1, due: Date.now() - 1000, seen: 1, correct: 1 })).toBe(true);
  });
});
