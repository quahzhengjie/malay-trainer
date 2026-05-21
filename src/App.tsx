import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CheckResult, Exercise } from './types';
import { loadAllExercises } from './lib/bank';
import { loadProgress, saveProgress, getCard } from './lib/storage';
import { review, isDue } from './lib/srs';
import { checkAnswer } from './lib/checkAnswer';
import { QuestionCard } from './components/QuestionCard';
import { Feedback } from './components/Feedback';
import { GrammarView } from './components/GrammarView';

type Status = 'loading' | 'ready' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState(() => loadProgress());
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [grammarId, setGrammarId] = useState<string | null>(null);
  const [doneThisSession, setDoneThisSession] = useState(0);

  useEffect(() => {
    loadAllExercises()
      .then((all) => {
        setExercises(all);
        setStatus('ready');
      })
      .catch((e) => {
        setError(String(e.message ?? e));
        setStatus('error');
      });
  }, []);

  // The study queue, fixed at load time: due reviews first (oldest first),
  // then never-seen questions, then everything else. Re-sorting mid-session
  // would feel chaotic, so progress changes don't reshuffle it.
  const queue = useMemo(() => {
    const now = Date.now();
    return exercises
      .map((ex) => {
        const card = getCard(progress, ex.id);
        const bucket = card.seen === 0 ? 1 : isDue(card, now) ? 0 : 2;
        return { ex, bucket, due: card.due };
      })
      .sort((a, b) => a.bucket - b.bucket || a.due - b.due)
      .map((s) => s.ex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises]);

  const current: Exercise | undefined = queue[cursor];

  const dueCount = useMemo(
    () =>
      queue.filter((ex) => {
        const c = getCard(progress, ex.id);
        return c.seen === 0 || isDue(c);
      }).length,
    [queue, progress],
  );

  function handleAnswer(answer: string | number) {
    if (!current || result) return;
    const r = checkAnswer(current, answer);
    setResult(r);
    const updated = {
      ...progress,
      [current.id]: review(getCard(progress, current.id), r.correct),
    };
    setProgress(updated);
    saveProgress(updated);
    setDoneThisSession((n) => n + 1);
  }

  function next() {
    setResult(null);
    setCursor((c) => (queue.length ? (c + 1) % queue.length : 0));
  }

  if (status === 'loading') return <Centered>Loading question bank…</Centered>;
  if (status === 'error') {
    return (
      <Centered>
        ⚠️ {error}
        <br />
        <small>
          Run <code>npm run build:bank</code>, then reload.
        </small>
      </Centered>
    );
  }
  if (grammarId) return <GrammarView id={grammarId} onClose={() => setGrammarId(null)} />;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">🇲🇾 Malay Trainer</span>
        <span className="stat">
          {dueCount} to review · {doneThisSession} done
        </span>
      </header>
      <main>
        {current ? (
          <>
            <QuestionCard
              key={current.id + cursor}
              exercise={current}
              locked={result !== null}
              onAnswer={handleAnswer}
            />
            {result && (
              <Feedback
                result={result}
                exercise={current}
                onNext={next}
                onOpenGrammar={setGrammarId}
              />
            )}
          </>
        ) : (
          <Centered>
            No questions yet — add rows to <code>content/bank/*.csv</code>.
          </Centered>
        )}
      </main>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="centered">{children}</div>;
}
