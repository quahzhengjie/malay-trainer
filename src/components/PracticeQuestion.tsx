import { useState } from 'react';
import type { CheckResult, Exercise } from '../types';
import { checkAnswer } from '../lib/checkAnswer';
import { QuestionCard } from './QuestionCard';
import { Feedback } from './Feedback';

interface Props {
  exercise: Exercise;
  /** Called once, when the question is first answered. */
  onResult: (result: CheckResult) => void;
  /** Called when the user dismisses the feedback to move on. */
  onNext: () => void;
  onOpenGrammar: (id: string) => void;
}

/**
 * One question + its feedback. Shared by lessons and review so grading and
 * feedback behave identically everywhere. Give it a `key` per question to reset.
 */
export function PracticeQuestion({ exercise, onResult, onNext, onOpenGrammar }: Props) {
  const [result, setResult] = useState<CheckResult | null>(null);

  function answer(input: string | number) {
    if (result) return;
    const r = checkAnswer(exercise, input);
    setResult(r);
    onResult(r);
  }

  return (
    <>
      <QuestionCard exercise={exercise} locked={result !== null} onAnswer={answer} />
      {result && (
        <Feedback
          result={result}
          exercise={exercise}
          onNext={onNext}
          onOpenGrammar={onOpenGrammar}
        />
      )}
    </>
  );
}
