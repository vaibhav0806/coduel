import { useRef, useCallback, useState } from "react";
import { Profile } from "@/types/database";

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

type ProfileSnapshot = Pick<Profile, "wins" | "current_streak" | "best_streak" | "level">;

const STREAK_THRESHOLDS = [20, 15, 10, 5, 3] as const;
const WINS_THRESHOLDS = [100, 50, 25, 10] as const;

function pick(p: Profile): ProfileSnapshot {
  return {
    wins: p.wins,
    current_streak: p.current_streak,
    best_streak: p.best_streak,
    level: p.level,
  };
}

function snapshotsEqual(a: ProfileSnapshot, b: ProfileSnapshot): boolean {
  return (
    a.wins === b.wins &&
    a.current_streak === b.current_streak &&
    a.best_streak === b.best_streak &&
    a.level === b.level
  );
}

function detectMilestones(prev: ProfileSnapshot, curr: ProfileSnapshot): Milestone[] {
  const milestones: Milestone[] = [];

  // First Victory
  if (prev.wins === 0 && curr.wins === 1) {
    milestones.push({
      id: "first_victory",
      title: "First Victory!",
      subtitle: "Your journey begins",
      icon: "🏆",
      color: "#FFD700",
    });
  }

  // Streak milestones — only highest crossed threshold
  let streakFired = false;
  for (const n of STREAK_THRESHOLDS) {
    if (prev.current_streak < n && curr.current_streak >= n) {
      milestones.push({
        id: `streak_${n}`,
        title: `${n} Win Streak!`,
        subtitle: "You're unstoppable",
        icon: "🔥",
        color: "#FF6B35",
      });
      streakFired = true;
      break;
    }
  }

  // Total wins milestones — only highest crossed threshold
  // Skip if first victory already fired
  if (prev.wins !== 0 || curr.wins !== 1) {
    for (const n of WINS_THRESHOLDS) {
      if (prev.wins < n && curr.wins >= n) {
        milestones.push({
          id: `wins_${n}`,
          title: `${n} Wins!`,
          subtitle: "A true competitor",
          icon: "⭐",
          color: "#39FF14",
        });
        break;
      }
    }
  }

  // New best streak — skip if streak milestone already fired
  if (
    !streakFired &&
    curr.best_streak > prev.best_streak &&
    prev.best_streak > 0
  ) {
    milestones.push({
      id: "new_best_streak",
      title: "New Best Streak!",
      subtitle: `${curr.best_streak} wins in a row`,
      icon: "📈",
      color: "#FF6B35",
    });
  }

  // Level up
  if (curr.level > prev.level) {
    milestones.push({
      id: `level_${curr.level}`,
      title: `Level ${curr.level}!`,
      subtitle: "Keep climbing",
      icon: "🎯",
      color: "#8B5CF6",
    });
  }

  return milestones;
}

export function useMilestones() {
  const prevProfileRef = useRef<ProfileSnapshot | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const checkMilestones = useCallback((profile: Profile | null) => {
    if (!profile) return;

    const curr = pick(profile);

    // First load — store snapshot, emit nothing
    if (prevProfileRef.current === null) {
      prevProfileRef.current = curr;
      return;
    }

    const prev = prevProfileRef.current;

    // Skip if nothing relevant changed
    if (snapshotsEqual(prev, curr)) return;

    const detected = detectMilestones(prev, curr);
    prevProfileRef.current = curr;

    if (detected.length > 0) {
      setMilestones(detected);
    }
  }, []);

  const clearMilestones = useCallback(() => {
    setMilestones([]);
  }, []);

  return { milestones, checkMilestones, clearMilestones };
}
