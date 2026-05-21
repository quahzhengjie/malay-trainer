import { useState } from 'react';
import type { Exercise } from '../types';
import type { Progress } from '../lib/storage';
import { dueExercises } from '../lib/stats';
import { PracticeQuestion } from './PracticeQuestion';

interface Props {
  exercises: Exercise[];
  progress: Progress;
  onGrade: (exerciseId: string, correct: boolean) => void;
  onOpenGrammar: (id: string) => void;
}

export function ReviewTab({ exercises, progress, onGrade, onOpenGrammar }: Props) {
  // Snapshot the due queue when the tab opens so grading doesn't reshuffle it mid-session.
  const [queue] = useState<Exercise[]>(() => dueExercises(exercises, progress));
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (queue.length === 0) {
    return (
      <div className="centered">
        All caught up.
        <br />
        <small>Nothing is due for review. Complete a lesson to add cards here.</small>
      </div>
    );
  }

  if (index >= queue.length) {
    return (
      <div className="centered">
        Review complete — {correct}/{queue.length} correct.
        <br />
        <small>Come back later as more cards fall due.</small>
      </div>
    );
  }

  return (
    <div className="course">
      <p className="review-count">
        {index + 1} of {queue.length} due
      </p>
      <PracticeQuestion
        key={queue[index].id}
        exercise={queue[index]}
        onResult={(r) => {
          onGrade(queue[index].id, r.correct);
          if (r.correct) setCorrect((n) => n + 1);
        }}
        onNext={() => setIndex((n) => n + 1)}
        onOpenGrammar={onOpenGrammar}
      />
    </div>
  );
}
