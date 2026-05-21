import type { CheckResult, Exercise } from '../types';
import { BookIcon, CheckIcon, CrossIcon } from './icons';

interface Props {
  result: CheckResult;
  exercise: Exercise;
  onNext: () => void;
  onOpenGrammar: (id: string) => void;
}

export function Feedback({ result, exercise, onNext, onOpenGrammar }: Props) {
  const tone = result.correct ? 'ok' : result.closeMiss ? 'near' : 'bad';
  const heading = result.correct ? 'Betul!' : result.closeMiss ? 'So close' : 'Belum betul';

  return (
    <section className={`feedback feedback-${tone}`}>
      <div className="feedback-head">
        {result.correct ? <CheckIcon size={20} /> : <CrossIcon size={20} />}
        <h3>{heading}</h3>
      </div>
      <p>{result.feedback}</p>

      {/* On a wrong MCQ, show every option's rationale — feedback authored into the bank. */}
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
            className="link link-icon"
            onClick={() => onOpenGrammar(exercise.grammarNote!)}
          >
            <BookIcon size={16} /> Learn the rule
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
