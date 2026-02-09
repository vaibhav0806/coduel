export interface StreakState {
  current_streak: number;
  best_streak: number;
  last_battle_date: string | null;
  streak_freezes: number;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + "T00:00:00");
  const dateB = new Date(b + "T00:00:00");
  const diffMs = Math.abs(dateB.getTime() - dateA.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateStreakUpdate(state: StreakState): StreakState {
  const today = getLocalDateString();
  const { last_battle_date, streak_freezes } = state;
  let currentStreak = state.current_streak ?? 0;
  let bestStreak = state.best_streak ?? 0;
  let freezes = streak_freezes ?? 0;

  if (!last_battle_date) {
    // First ever battle
    currentStreak = 1;
  } else {
    const lastDate = getLocalDateString(new Date(last_battle_date));
    const gap = daysBetween(lastDate, today);

    if (gap === 0) {
      // Already played today — no streak change
    } else if (gap === 1) {
      // Consecutive day — streak continues
      currentStreak += 1;
    } else {
      // 2+ days gap
      const missedDays = gap - 1;
      if (freezes >= missedDays) {
        freezes -= missedDays;
        currentStreak += 1;
      } else {
        currentStreak = 1;
        // freezes unchanged on reset
      }
    }
  }

  bestStreak = Math.max(currentStreak, bestStreak);

  return {
    current_streak: currentStreak,
    best_streak: bestStreak,
    last_battle_date: today,
    streak_freezes: freezes,
  };
}

export const STREAK_MILESTONES = [
  { days: 3,   title: "Getting Started",  subtitle: "3-day streak!",    icon: "flame" as const,   color: "#FF6B35" },
  { days: 7,   title: "One Week",         subtitle: "7-day streak!",    icon: "flame" as const,   color: "#FF6B35" },
  { days: 14,  title: "Two Weeks",        subtitle: "14-day streak!",   icon: "rocket" as const,  color: "#3B82F6" },
  { days: 30,  title: "Monthly Master",   subtitle: "30-day streak!",   icon: "trophy" as const,  color: "#F59E0B" },
  { days: 50,  title: "Unstoppable",      subtitle: "50-day streak!",   icon: "diamond" as const, color: "#8B5CF6" },
  { days: 100, title: "Centurion",        subtitle: "100-day streak!",  icon: "star" as const,    color: "#39FF14" },
  { days: 365, title: "Legendary",        subtitle: "365-day streak!",  icon: "trophy" as const,  color: "#FFD700" },
];

export function getStreakMilestone(oldStreak: number, newStreak: number) {
  return STREAK_MILESTONES.find(m => newStreak >= m.days && oldStreak < m.days) ?? null;
}
