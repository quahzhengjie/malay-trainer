import type { CheckResult, Exercise } from '../types';

interface Props {
  result: CheckResult;
  exercise: Exercise;
  onNext: () => void;
  onOpenGrammar: (id: string) => void;
}

export function Feedback({ result, exercise, onNext, onOpenGrammar }: Props) {
  const tone = result.correct ? 'ok' : result.closeMiss ? 'near' : 'bad';
  const heading = result.correct
    ? 'Betul! ✅'
    : result.closeMiss
      ? 'So close…'
      : 'Belum betul ❌';

  return (
    <section className={`feedback feedback-${tone}`}>
      <h3>{heading}</h3>
      <p>{result.feedback}</p>

      {/* On a wrong MCQ, show every option's rationale — the whole point of authoring feedback into the bank. */}
      {!result.correct && exercise.type === 'mcq' && (
        <ul className="rationales">
          {(exercise.options ?? []).map((o, i) => (
            <li key={i} className={o.correct ? 'r-correct' : 'r-wrong'}>
              <strong>{o.text}</strong> — {o.rationale}
            </li>
          ))}
        </ul>
      )}

      {!result.correct && exercise.explanation && (
        <p className="explain">{exercise.explanation}</p>
      )}

      <div className="feedback-actions">
        {exercise.grammarNote ? (
          <button
            type="button"
            className="link"
            onClick={() => onOpenGrammar(exercise.grammarNote!)}
          >
            📖 Learn the rule
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="primary" autoFocus onClick={onNext}>
          Next →
        </button>
      </div>
    </section>
  );
}
