import { useEffect, useMemo, useState } from 'react';
import type { Course, Exercise, Lesson } from './types';
import { loadCourse, loadExercises } from './lib/bank';
import { loadProgress, saveProgress, getCard } from './lib/storage';
import { review } from './lib/srs';
import { dueExercises } from './lib/stats';
import { CourseMap } from './components/CourseMap';
import { LessonView } from './components/LessonView';
import { ReviewTab } from './components/ReviewTab';
import { GrammarList } from './components/GrammarList';
import { GrammarView } from './components/GrammarView';
import { TabBar } from './components/TabBar';
import type { Tab } from './components/TabBar';
import { ThemeToggle } from './components/ThemeToggle';

function findLesson(course: Course, id: string): Lesson | undefined {
  for (const chapter of course.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export default function App() {
  const [course, setCourse] = useState<Course | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(() => loadProgress());

  const [tab, setTab] = useState<Tab>('learn');
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

  return (
    <div className="app">
      {activeLesson ? (
        <LessonView
          lesson={activeLesson}
          exercises={activeLesson.exerciseIds
            .map((id) => byId.get(id))
            .filter((ex): ex is Exercise => Boolean(ex))}
          onGrade={grade}
          onClose={() => setLessonId(null)}
          onOpenGrammar={setGrammarId}
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
            {tab === 'learn' && (
              <CourseMap
                course={course}
                byId={byId}
                progress={progress}
                onOpenLesson={setLessonId}
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
