import type { Course, Exercise } from '../types';
import type { Progress } from '../lib/storage';
import { lessonStats } from '../lib/stats';

interface Props {
  course: Course;
  byId: Map<string, Exercise>;
  progress: Progress;
  onOpenLesson: (id: string) => void;
}

export function CourseMap({ course, byId, progress, onOpenLesson }: Props) {
  return (
    <div className="course">
      {course.chapters.map((chapter) => (
        <section key={chapter.id} className="chapter">
          <h2 className="chapter-title">{chapter.title}</h2>
          <div className="lesson-list">
            {chapter.lessons.map((lesson) => {
              const s = lessonStats(lesson, byId, progress);
              const pct = s.total ? (100 * s.practiced) / s.total : 0;
              const state = s.done ? 'Completed' : s.practiced > 0 ? 'In progress' : 'Not started';
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className="lesson-card"
                  onClick={() => onOpenLesson(lesson.id)}
                >
                  <div className="lesson-card-top">
                    <span className="lesson-name">{lesson.title}</span>
                    <span className="lesson-badge">
                      {s.done ? '✓' : `${s.practiced}/${s.total}`}
                    </span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
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
