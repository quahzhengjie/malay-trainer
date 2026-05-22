import { useEffect, useRef, useState } from 'react';
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
  /** Opens the next lesson — absent on the final lesson of the course. */
  onNextLesson?: () => void;
}

// 'intro' = teaching card; a number = that question index; 'done' = completion screen.
type Step = 'intro' | 'done' | number;

// Long lessons are split into rounds, with a breather screen between them.
const ROUND_SIZE = 8;

export function LessonView({
  lesson,
  exercises,
  onGrade,
  onClose,
  onOpenGrammar,
  onNextLesson,
}: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [note, setNote] = useState<GrammarNote | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [paused, setPaused] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the lesson when it opens.
  useEffect(() => {
    backRef.current?.focus();
  }, []);

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
    setPaused(false);
    setStep('intro');
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="link" onClick={onClose} ref={backRef}>
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

        {typeof step === 'number' && exercises[step] && !paused && (
          <>
            <div className="lesson-progress">
              <span>
                Question {step + 1} of {exercises.length}
              </span>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${((step + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>
            <PracticeQuestion
              key={exercises[step].id}
              exercise={exercises[step]}
              onResult={(r) => handleResult(r, exercises[step].id)}
              onNext={() => {
                const ni = step + 1;
                if (ni >= exercises.length) {
                  setStep('done');
                } else {
                  setStep(ni);
                  if (ni % ROUND_SIZE === 0) setPaused(true);
                }
              }}
              onOpenGrammar={onOpenGrammar}
            />
          </>
        )}

        {typeof step === 'number' && paused && (
          <section className="card centered-card">
            <h2>Round {step / ROUND_SIZE} done</h2>
            <p className="big-score">
              {step} / {exercises.length}
            </p>
            <p className="explain">
              Nice pace — {exercises.length - step} to go. Take a breath, then keep
              going.
            </p>
            <button
              type="button"
              className="primary block"
              autoFocus
              onClick={() => setPaused(false)}
            >
              Continue
            </button>
          </section>
        )}

        {step === 'done' && (
          <section className="card centered-card">
            <h2>Lesson complete</h2>
            <p className="big-score">
              {correct} / {answered} correct
            </p>
            <p className="explain">
              +{correct * 10 + (answered - correct) * 2} XP earned. These questions are
              now in your Review pool — spaced repetition will bring them back to lock
              them in.
            </p>
            <div className="feedback-actions">
              <button type="button" className="link" onClick={restart}>
                Practice again
              </button>
              {onNextLesson ? (
                <button type="button" className="primary" onClick={onNextLesson}>
                  Next lesson →
                </button>
              ) : (
                <button type="button" className="primary" onClick={onClose}>
                  Back to lessons →
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
