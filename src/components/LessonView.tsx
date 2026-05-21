import { useEffect, useState } from 'react';
import type { CheckResult, Exercise, GrammarNote, Lesson } from '../types';
import { loadGrammarNote } from '../lib/bank';
import { MarkdownNote } from './MarkdownNote';
import { PracticeQuestion } from './PracticeQuestion';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  lesson: Lesson;
  exercises: Exercise[];
  onGrade: (exerciseId: string, correct: boolean) => void;
  onClose: () => void;
  onOpenGrammar: (id: string) => void;
}

// 'intro' = teaching card; a number = that question index; 'done' = completion screen.
type Step = 'intro' | 'done' | number;

export function LessonView({ lesson, exercises, onGrade, onClose, onOpenGrammar }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [note, setNote] = useState<GrammarNote | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    if (!lesson.grammarNote) {
      setNote(null);
      return;
    }
    let active = true;
    loadGrammarNote(lesson.grammarNote)
      .then((n) => active && setNote(n))
      .catch(() => active && setNote(null));
    return () => {
      active = false;
    };
  }, [lesson.grammarNote]);

  function handleResult(result: CheckResult, exerciseId: string) {
    onGrade(exerciseId, result.correct);
    setAnswered((n) => n + 1);
    if (result.correct) setCorrect((n) => n + 1);
  }

  function restart() {
    setCorrect(0);
    setAnswered(0);
    setStep('intro');
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="link" onClick={onClose}>
          ← Lessons
        </button>
        <div className="topbar-right">
          <span className="stat">{lesson.title}</span>
          <ThemeToggle />
        </div>
      </header>
      <main>
        {step === 'intro' && (
          <section className="card">
            <div className="meta">
              <span className="pill">{lesson.level}</span>
            </div>
            <h2 className="prompt">{lesson.title}</h2>
            {lesson.intro && <p className="explain">{lesson.intro}</p>}
            {note && (
              <div className="grammar lesson-grammar">
                <MarkdownNote body={note.body} />
              </div>
            )}
            <button type="button" className="primary block" onClick={() => setStep(0)}>
              {note ? 'Got it — start practice' : 'Start practice'} ({exercises.length} questions)
            </button>
          </section>
        )}

        {typeof step === 'number' && exercises[step] && (
          <>
            <div className="lesson-progress">
              <span>
                Question {step + 1} of {exercises.length}
              </span>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${(step / exercises.length) * 100}%` }}
                />
              </div>
            </div>
            <PracticeQuestion
              key={exercises[step].id}
              exercise={exercises[step]}
              onResult={(r) => handleResult(r, exercises[step].id)}
              onNext={() => setStep(step + 1 < exercises.length ? step + 1 : 'done')}
              onOpenGrammar={onOpenGrammar}
            />
          </>
        )}

        {step === 'done' && (
          <section className="card centered-card">
            <h2>Lesson complete</h2>
            <p className="big-score">
              {correct} / {answered} correct
            </p>
            <p className="explain">
              These questions are now in your Review pool — spaced repetition will bring
              them back at the right time to lock them in.
            </p>
            <div className="feedback-actions">
              <button type="button" className="link" onClick={restart}>
                Practice again
              </button>
              <button type="button" className="primary" onClick={onClose}>
                Back to lessons →
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
