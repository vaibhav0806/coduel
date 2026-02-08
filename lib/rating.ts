import { Tier } from "@/types/database";

export function getTierForRating(rating: number): Tier {
  if (rating >= 2000) return "diamond";
  if (rating >= 1500) return "gold";
  if (rating >= 1000) return "silver";
  return "bronze";
}

export function getDifficultyForRating(rating: number): number {
  const tier = getTierForRating(rating);
  switch (tier) {
    case "diamond":
      return 4;
    case "gold":
      return 3;
    case "silver":
      return 2;
    case "bronze":
    default:
      return 1;
  }
}

export function calculateRatingChange(
  winnerRating: number,
  loserRating: number,
  isComeback: boolean
): { winnerDelta: number; loserDelta: number } {
  const baseWin = 25;
  const baseLoss = 15;
  const ratingDiff = loserRating - winnerRating;
  const adjustment = Math.round(ratingDiff / 50);

  let winnerDelta = Math.max(5, baseWin + adjustment);
  let loserDelta = Math.max(5, baseLoss - adjustment);

  if (isComeback) {
    winnerDelta += 5;
  }

  return { winnerDelta, loserDelta: -loserDelta };
}

export interface TierConfig {
  label: string;
  colors: [string, string];
  floor: number;
  ceiling: number;
  progress: number;
}

export function getTierConfig(rating: number): TierConfig {
  const tiers: { label: string; colors: [string, string]; floor: number; ceiling: number }[] = [
    { label: "Diamond", colors: ["#B9F2FF", "#4169E1"], floor: 2000, ceiling: 2000 },
    { label: "Gold", colors: ["#FFD700", "#DAA520"], floor: 1500, ceiling: 2000 },
    { label: "Silver", colors: ["#C0C0C0", "#808080"], floor: 1000, ceiling: 1500 },
    { label: "Bronze", colors: ["#CD7F32", "#8B4513"], floor: 0, ceiling: 1000 },
  ];

  for (const t of tiers) {
    if (rating >= t.floor) {
      const range = t.ceiling - t.floor;
      const progress = range > 0 ? Math.min(1, (rating - t.floor) / range) : 1;
      return { label: t.label, colors: t.colors, floor: t.floor, ceiling: t.ceiling, progress };
    }
  }

  const bronze = tiers[tiers.length - 1];
  return { ...bronze, progress: 0 };
}

export function applyFloorProtection(
  currentRating: number,
  newRating: number
): number {
  // Floor protection: once you reach a tier, you can't drop below its floor
  const floors = [
    { threshold: 2000, floor: 1950 }, // Diamond
    { threshold: 1500, floor: 1450 }, // Gold
    { threshold: 1000, floor: 950 },  // Silver
  ];

  for (const { threshold, floor } of floors) {
    if (currentRating >= threshold && newRating < floor) {
      return floor;
    }
  }

  return Math.max(0, newRating);
}
