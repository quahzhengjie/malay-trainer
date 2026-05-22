import { useEffect, useMemo, useState } from 'react';
import type { Course, Exercise, Lesson } from './types';
import { loadCourse, loadExercises } from './lib/bank';
import { loadProgress, saveProgress, getCard, clearProgress } from './lib/storage';
import { loadStats, saveStats, clearStats, recordAnswer, setDailyGoal } from './lib/userStats';
import { review } from './lib/srs';
import { dueExercises } from './lib/stats';
import { HomeView } from './components/HomeView';
import { CourseMap } from './components/CourseMap';
import { LessonView } from './components/LessonView';
import { ReviewTab } from './components/ReviewTab';
import { GrammarList } from './components/GrammarList';
import { GrammarView } from './components/GrammarView';
import { TabBar } from './components/TabBar';
import type { Tab } from './components/TabBar';
import { ThemeToggle } from './components/ThemeToggle';

const GOAL_OPTIONS = [10, 20, 30, 40];

function findLesson(course: Course, id: string): Lesson | undefined {
  for (const chapter of course.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

function lessonAfter(course: Course, id: string): Lesson | undefined {
  const all = course.chapters.flatMap((c) => c.lessons);
  const i = all.findIndex((l) => l.id === id);
  return i >= 0 ? all[i + 1] : undefined;
}

export default function App() {
  const [course, setCourse] = useState<Course | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(() => loadProgress());
  const [stats, setStats] = useState(() => loadStats());

  const [tab, setTab] = useState<Tab>('home');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [grammarId, setGrammarId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadCourse(), loadExercises()])
      .then(([c, ex]) => {
        setCourse(c);
        setExercises(ex);
      })
      .catch((e) => {
        console.error(e);
        setError(String(e.message ?? e));
      });
  }, []);

  const byId = useMemo(() => new Map(exercises.map((ex) => [ex.id, ex])), [exercises]);
  const reviewDue = useMemo(
    () => dueExercises(exercises, progress).length,
    [exercises, progress],
  );

  function grade(exerciseId: string, correct: boolean) {
    setProgress((prev) => {
      const next = { ...prev, [exerciseId]: review(getCard(prev, exerciseId), correct) };
      saveProgress(next);
      return next;
    });
    setStats((prev) => {
      const next = recordAnswer(prev, correct);
      saveStats(next);
      return next;
    });
  }

  function cycleDailyGoal() {
    setStats((prev) => {
      const i = GOAL_OPTIONS.indexOf(prev.dailyGoal);
      const next = setDailyGoal(prev, GOAL_OPTIONS[(i + 1) % GOAL_OPTIONS.length]);
      saveStats(next);
      return next;
    });
  }

  function resetProgress() {
    if (!window.confirm('Reset all your progress? This cannot be undone.')) return;
    clearProgress();
    clearStats();
    setProgress({});
    setStats(loadStats());
  }

  if (error) {
    return (
      <div className="centered" role="alert">
        <p>Sorry — the app could not load its content.</p>
        <button type="button" className="primary" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
    );
  }
  if (!course) return <div className="centered" role="status">Loading…</div>;

  const activeLesson = lessonId ? findLesson(course, lessonId) : undefined;
  const nextLesson = activeLesson ? lessonAfter(course, activeLesson.id) : undefined;

  return (
    <div className="app">
      {activeLesson ? (
        <LessonView
          key={activeLesson.id}
          lesson={activeLesson}
          exercises={activeLesson.exerciseIds
            .map((id) => byId.get(id))
            .filter((ex): ex is Exercise => Boolean(ex))}
          onGrade={grade}
          onClose={() => setLessonId(null)}
          onOpenGrammar={setGrammarId}
          onNextLesson={nextLesson ? () => setLessonId(nextLesson.id) : undefined}
        />
      ) : (
        <>
          <header className="topbar">
            <span className="brand">
              <span className="brand-mark">BM</span>
              Malay Trainer
            </span>
            <ThemeToggle />
          </header>
          <main>
            {tab === 'home' && (
              <HomeView
                course={course}
                byId={byId}
                progress={progress}
                stats={stats}
                reviewDue={reviewDue}
                onOpenLesson={setLessonId}
                onGoReview={() => setTab('review')}
                onOpenGrammar={setGrammarId}
                onCycleGoal={cycleDailyGoal}
              />
            )}
            {tab === 'learn' && (
              <CourseMap
                course={course}
                byId={byId}
                progress={progress}
                onOpenLesson={setLessonId}
                onResetProgress={resetProgress}
              />
            )}
            {tab === 'review' && (
              <ReviewTab
                exercises={exercises}
                progress={progress}
                onGrade={grade}
                onOpenGrammar={setGrammarId}
              />
            )}
            {tab === 'grammar' && <GrammarList onOpen={setGrammarId} />}
          </main>
          <TabBar tab={tab} onChange={setTab} reviewDue={reviewDue} />
        </>
      )}

      {grammarId && <GrammarView id={grammarId} onClose={() => setGrammarId(null)} />}
    </div>
  );
}
