import { useState } from 'react';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  /** True once the question has been answered — inputs lock until the user moves on. */
  locked: boolean;
  onAnswer: (answer: string | number) => void;
}

export function QuestionCard({ exercise, locked, onAnswer }: Props) {
  const [text, setText] = useState('');
  const isMcq = exercise.type === 'mcq';

  return (
    <section className="card">
      <div className="meta">
        <span className="pill">{exercise.level}</span>
        <span className="pill pill-soft">{exercise.skill}</span>
      </div>
      <h2 className="prompt">{exercise.prompt}</h2>

      {isMcq ? (
        <div className="options">
          {(exercise.options ?? []).map((opt, i) => (
            <button
              key={i}
              type="button"
              className="option"
              disabled={locked}
              onClick={() => onAnswer(i)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="text-answer"
          onSubmit={(e) => {
            e.preventDefault();
            if (!locked && text.trim()) onAnswer(text);
          }}
        >
          <input
            autoFocus
            value={text}
            disabled={locked}
            placeholder="Type your answer in Malay…"
            onChange={(e) => setText(e.target.value)}
            aria-label="Your answer"
          />
          <button type="submit" disabled={locked || !text.trim()}>
            Check
          </button>
        </form>
      )}
    </section>
  );
}
