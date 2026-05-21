import { describe, it, expect } from 'vitest';
import { checkAnswer, normalize, editDistance } from './checkAnswer';
import type { Exercise } from '../types';

const mcq: Exercise = {
  id: 't-mcq',
  level: 'A1',
  skill: 'vocab',
  type: 'mcq',
  prompt: 'Pick the morning greeting',
  options: [
    { text: 'Selamat pagi', correct: true, rationale: 'Correct — pagi means morning.' },
    { text: 'Terima kasih', correct: false, rationale: 'That means thank you.' },
  ],
  explanation: 'Selamat pagi = good morning.',
  tags: [],
};

const text: Exercise = {
  id: 't-text',
  level: 'A1',
  skill: 'translation',
  type: 'text',
  prompt: 'Translate: I eat rice',
  accepted: ['saya makan nasi', 'aku makan nasi'],
  explanation: 'saya/aku = I, makan = eat, nasi = rice.',
  tags: [],
};

const order: Exercise = {
  id: 't-order',
  level: 'A1',
  skill: 'grammar',
  type: 'word_order',
  prompt: 'Order: makan / saya / nasi',
  accepted: ['saya makan nasi'],
  explanation: 'Word order is subject-verb-object.',
  tags: [],
};

describe('normalize', () => {
  it('lowercases, trims and strips punctuation', () => {
    expect(normalize('  Saya, Makan!  ')).toBe('saya makan');
  });
});

describe('editDistance', () => {
  it('counts single-character edits', () => {
    expect(editDistance('nasi', 'nasi')).toBe(0);
    expect(editDistance('nasi', 'nase')).toBe(1);
  });
});

describe('checkAnswer — mcq', () => {
  it('accepts the correct option index', () => {
    expect(checkAnswer(mcq, 0).correct).toBe(true);
  });
  it('rejects a wrong option and returns its rationale', () => {
    const r = checkAnswer(mcq, 1);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain('thank you');
  });
});

describe('checkAnswer — typed answers', () => {
  it('accepts any registered answer regardless of case/punctuation', () => {
    expect(checkAnswer(text, 'Aku Makan Nasi.').correct).toBe(true);
  });
  it('flags a near-miss as a spelling slip', () => {
    const r = checkAnswer(text, 'saya makan nase');
    expect(r.correct).toBe(false);
    expect(r.closeMiss).toBe('spelling');
  });
  it('rejects a clearly wrong answer', () => {
    expect(checkAnswer(text, 'selamat pagi').correct).toBe(false);
  });
  it('detects right-words-wrong-order for word_order', () => {
    const r = checkAnswer(order, 'makan saya nasi');
    expect(r.correct).toBe(false);
    expect(r.closeMiss).toBe('word_order');
  });
});
