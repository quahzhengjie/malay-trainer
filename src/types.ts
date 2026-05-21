// Shared data model. The shape an Exercise takes here is exactly what
// scripts/build-bank.mjs emits from the CSV question bank.

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Skill =
  | 'vocab'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'translation'
  | 'affix';
export type QType = 'mcq' | 'text' | 'fill_blank' | 'word_order' | 'match';

/** One choice in a multiple-choice question. `rationale` is the feedback shown for picking it. */
export interface Option {
  text: string;
  correct: boolean;
  rationale: string;
}

export interface Exercise {
  id: string;
  level: Level;
  skill: Skill;
  type: QType;
  prompt: string;
  /** Present for `mcq`. */
  options?: Option[];
  /** Present for typed-answer types. Any one is accepted (case/punctuation-insensitive). */
  accepted?: string[];
  /** The general "why" — always shown after answering. */
  explanation: string;
  /** id of a grammar note in content/grammar/. */
  grammarNote?: string;
  tags: string[];
}

export type CloseMiss = 'spelling' | 'register' | 'word_order';

export interface CheckResult {
  correct: boolean;
  feedback: string;
  /** Set when the answer was wrong but recognisably close. */
  closeMiss?: CloseMiss;
}

export interface BankIndex {
  levels: { level: string; file: string; count: number }[];
  total: number;
}

export interface GrammarNote {
  id: string;
  title: string;
  level: string;
  tags: string[];
  body: string;
}
