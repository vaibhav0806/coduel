// XP System Configuration
// 10 XP per game played, +5 bonus for wins

export const XP_CONFIG = {
  GAME_PLAYED: 10,
  WIN_BONUS: 5,
} as const;

// Level thresholds
// Level 1->2: 10 XP
// Level 2->3: 100 XP
// Level 3->4: 200 XP
// Level 4->5: 300 XP (increases by 100 each level)

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 10;
  // For level 3+, it's 100 + 100*(level-3) = 100*(level-2)
  return 100 * (level - 2);
}

export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

export function getLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  let level = 1;
  let xpRemaining = totalXP;

  // Level 1->2 requires 10 XP
  if (xpRemaining < 10) {
    return {
      level: 1,
      currentLevelXP: xpRemaining,
      xpForNextLevel: 10,
      progress: xpRemaining / 10,
    };
  }

  xpRemaining -= 10;
  level = 2;

  // Each subsequent level requires 100*(level-2) XP
  while (true) {
    const xpNeeded = 100 * (level - 1); // level 2->3 needs 100, 3->4 needs 200, etc.
    if (xpRemaining < xpNeeded) {
      return {
        level,
        currentLevelXP: xpRemaining,
        xpForNextLevel: xpNeeded,
        progress: xpRemaining / xpNeeded,
      };
    }
    xpRemaining -= xpNeeded;
    level++;
  }
}

export function calculateMatchXP(isWin: boolean): {
  baseXP: number;
  bonusXP: number;
  totalXP: number
} {
  const baseXP = XP_CONFIG.GAME_PLAYED;
  const bonusXP = isWin ? XP_CONFIG.WIN_BONUS : 0;
  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
  };
}
