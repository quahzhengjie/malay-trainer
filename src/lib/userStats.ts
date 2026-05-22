// Gamification / daily-progress stats: streak, XP, daily goal.
// Stored separately from per-card SRS progress (storage.ts).

const KEY = 'malay-trainer:stats:v1';
const DEFAULT_GOAL = 20;
const DAY_MS = 86_400_000;

export interface UserStats {
  xp: number;
  streakDays: number;
  longestStreak: number;
  /** YYYY-MM-DD (local) of the last day a question was answered. */
  lastActiveDay: string;
  dailyGoal: number;
  /** Questions answered on `todayDay`. */
  todayCount: number;
  todayDay: string;
}

function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function freshStats(): UserStats {
  return {
    xp: 0,
    streakDays: 0,
    longestStreak: 0,
    lastActiveDay: '',
    dailyGoal: DEFAULT_GOAL,
    todayCount: 0,
    todayDay: dayKey(),
  };
}

export function loadStats(): UserStats {
  let stats: UserStats;
  try {
    const raw = localStorage.getItem(KEY);
    stats = raw
      ? { ...freshStats(), ...(JSON.parse(raw) as Partial<UserStats>) }
      : freshStats();
  } catch {
    stats = freshStats();
  }
  // Roll the daily counter over if the stored day is no longer today.
  const today = dayKey();
  if (stats.todayDay !== today) {
    stats.todayDay = today;
    stats.todayCount = 0;
  }
  return stats;
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // localStorage unavailable — stats just won't persist.
  }
}

export function clearStats(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // localStorage unavailable — nothing to clear.
  }
}

/** Record one answered question: updates XP, the daily counter and the streak. */
export function recordAnswer(stats: UserStats, correct: boolean): UserStats {
  const today = dayKey();
  const yesterday = dayKey(new Date(Date.now() - DAY_MS));

  let streakDays = stats.streakDays;
  if (stats.lastActiveDay === today) {
    // already practised today — streak unchanged
  } else if (stats.lastActiveDay === yesterday) {
    streakDays += 1;
  } else {
    streakDays = 1;
  }

  const sameDay = stats.todayDay === today;
  return {
    ...stats,
    xp: stats.xp + (correct ? 10 : 2),
    streakDays,
    longestStreak: Math.max(stats.longestStreak, streakDays),
    lastActiveDay: today,
    todayDay: today,
    todayCount: (sameDay ? stats.todayCount : 0) + 1,
  };
}

export function setDailyGoal(stats: UserStats, goal: number): UserStats {
  return { ...stats, dailyGoal: goal };
}
