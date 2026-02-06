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
