import type { Course, Exercise } from '../types';
import type { Progress } from '../lib/storage';
import type { UserStats } from '../lib/userStats';
import { getCard } from '../lib/storage';
import { lessonStats } from '../lib/stats';
import { FlameIcon } from './icons';

interface CheatItem {
  title: string;
  lines: string[];
  /** id of the grammar note this card opens. */
  note: string;
}

// A condensed, at-a-glance reference. Each card deep-links to its full grammar note.
const CHEAT_SHEET: CheatItem[] = [
  { title: 'Pronouns', lines: ['saya · awak · dia', 'kita (incl.) ≠ kami (excl.)'], note: 'pronouns' },
  { title: 'Word order', lines: ['Subject – Verb – Object', 'adjective after the noun'], note: 'word-order' },
  { title: 'Aspect markers', lines: ['sudah · sedang', 'akan · belum'], note: 'aspect-markers' },
  { title: 'Question words', lines: ['apa · siapa · mana', 'bila · kenapa · berapa'], note: 'question-words' },
  { title: 'Affixes', lines: ['ber- (intransitive)', 'meN- · -kan · -i'], note: 'prefix-me' },
  { title: 'Greetings', lines: ['selamat pagi / petang', 'terima kasih · maaf'], note: 'greetings' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat tengah hari';
  if (h < 19) return 'Selamat petang';
  return 'Selamat malam';
}

interface Props {
  course: Course;
  byId: Map<string, Exercise>;
  progress: Progress;
  stats: UserStats;
  reviewDue: number;
  onOpenLesson: (id: string) => void;
  onGoReview: () => void;
  onOpenGrammar: (id: string) => void;
  onCycleGoal: () => void;
}

export function HomeView({
  course,
  byId,
  progress,
  stats,
  reviewDue,
  onOpenLesson,
  onGoReview,
  onOpenGrammar,
  onCycleGoal,
}: Props) {
  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const scored = allLessons.map((lesson) => ({
    lesson,
    stat: lessonStats(lesson, byId, progress),
  }));
  const doneCount = scored.filter((x) => x.stat.done).length;
  const coursePct = allLessons.length
    ? Math.round((100 * doneCount) / allLessons.length)
    : 0;

  // "Continue" = the first lesson not yet completed, in course order.
  const next = scored.find((x) => !x.stat.done);
  const nextChapter = next
    ? course.chapters.find((c) => c.lessons.some((l) => l.id === next.lesson.id))
    : undefined;

  // Lifetime accuracy across every card the learner has seen.
  let seen = 0;
  let correct = 0;
  for (const ex of byId.values()) {
    const card = getCard(progress, ex.id);
    seen += card.seen;
    correct += card.correct;
  }
  const accuracy = seen > 0 ? Math.round((100 * correct) / seen) : 0;

  const goalPct = stats.dailyGoal
    ? Math.min(100, Math.round((100 * stats.todayCount) / stats.dailyGoal))
    : 0;
  const goalMet = stats.todayCount >= stats.dailyGoal;

  return (
    <div className="home">
      <div className="home-greet">
        <h1>{greeting()}</h1>
        <span className="streak" title={`${stats.streakDays}-day streak`}>
          <FlameIcon size={17} />
          {stats.streakDays}
        </span>
      </div>

      <section className="card">
        <div className="home-section-head">
          <span className="chapter-title">Today</span>
          <button type="button" className="goal-btn" onClick={onCycleGoal}>
            Goal: {stats.dailyGoal}
          </button>
        </div>
        <p className="sub">
          {stats.todayCount} / {stats.dailyGoal} questions
          {goalMet ? ' · goal met' : ''}
        </p>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <button type="button" className="primary block" onClick={onGoReview}>
          {reviewDue > 0
            ? `Review ${reviewDue} card${reviewDue === 1 ? '' : 's'} due`
            : 'Review — all caught up'}
        </button>
      </section>

      {next && (
        <section>
          <span className="chapter-title">Continue learning</span>
          <button
            type="button"
            className="lesson-card"
            onClick={() => onOpenLesson(next.lesson.id)}
          >
            <div className="lesson-card-top">
              <span className="lesson-name">{next.lesson.title}</span>
              <span className="lesson-badge">{next.lesson.level}</span>
            </div>
            <div className="bar">
              <div
                className="bar-fill"
                style={{
                  width: `${
                    next.stat.total
                      ? (100 * next.stat.practiced) / next.stat.total
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="lesson-sub">
              {nextChapter ? `${nextChapter.title} · ` : ''}
              {next.stat.practiced > 0
                ? `${next.stat.practiced}/${next.stat.total} done — resume`
                : 'Start this lesson'}
            </span>
          </button>
        </section>
      )}

      <section>
        <span className="chapter-title">Your course</span>
        <p className="sub">{doneCount} of {allLessons.length} lessons complete</p>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${coursePct}%` }} />
        </div>
      </section>

      <section>
        <span className="chapter-title">Cheat-sheet</span>
        <div className="cheat-grid">
          {CHEAT_SHEET.map((item) => (
            <button
              key={item.note}
              type="button"
              className="cheat-card"
              onClick={() => onOpenGrammar(item.note)}
            >
              <span className="cheat-title">{item.title}</span>
              {item.lines.map((line, i) => (
                <span key={i} className="cheat-line" lang="ms">
                  {line}
                </span>
              ))}
            </button>
          ))}
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-box">
          <span className="stat-num">{stats.xp}</span>
          <span className="stat-label">XP</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{accuracy}%</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{stats.longestStreak}</span>
          <span className="stat-label">best streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{doneCount}</span>
          <span className="stat-label">lessons</span>
        </div>
      </div>
    </div>
  );
}
