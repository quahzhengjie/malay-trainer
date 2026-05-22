import type { Course, Exercise } from '../types';
import type { Progress } from '../lib/storage';
import { lessonStats } from '../lib/stats';

interface Props {
  course: Course;
  byId: Map<string, Exercise>;
  progress: Progress;
  onOpenLesson: (id: string) => void;
  onResetProgress: () => void;
}

export function CourseMap({
  course,
  byId,
  progress,
  onOpenLesson,
  onResetProgress,
}: Props) {
  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const doneCount = allLessons.filter(
    (l) => lessonStats(l, byId, progress).done,
  ).length;
  const pct = allLessons.length ? Math.round((100 * doneCount) / allLessons.length) : 0;

  return (
    <div className="course">
      <div className="progress-banner">
        <h1>Your progress</h1>
        <p className="sub">
          {doneCount} of {allLessons.length} lessons complete
        </p>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="reset-btn" onClick={onResetProgress}>
          Reset progress
        </button>
      </div>

      {course.chapters.map((chapter) => (
        <section key={chapter.id} className="chapter">
          <div className="chapter-head">
            <h2 className="chapter-title">{chapter.title}</h2>
            {chapter.lessons[0]?.level && (
              <span className="chapter-level">{chapter.lessons[0].level}</span>
            )}
          </div>
          <div className="lesson-list">
            {chapter.lessons.map((lesson) => {
              const s = lessonStats(lesson, byId, progress);
              const lessonPct = s.total ? (100 * s.practiced) / s.total : 0;
              const state = s.done
                ? 'Completed'
                : s.practiced > 0
                  ? 'In progress'
                  : 'Not started';
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className={`lesson-card${s.done ? ' lesson-done' : ''}`}
                  onClick={() => onOpenLesson(lesson.id)}
                >
                  <div className="lesson-card-top">
                    <span className="lesson-name">{lesson.title}</span>
                    <span className="lesson-badge">
                      {s.done ? '✓' : `${s.practiced}/${s.total}`}
                    </span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${lessonPct}%` }} />
                  </div>
                  <span className="lesson-sub">
                    {state}
                    {s.due > 0 && ` · ${s.due} to review`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
