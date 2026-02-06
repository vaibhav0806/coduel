export type Tier = "bronze" | "silver" | "gold" | "diamond";

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

interface RatingChangeParams {
  winnerRating: number;
  loserRating: number;
  isComeback: boolean;
  isRanked: boolean;
}

export function calculateRatingChange({
  winnerRating,
  loserRating,
  isComeback,
  isRanked,
}: RatingChangeParams): { winnerDelta: number; loserDelta: number } {
  if (!isRanked) {
    return { winnerDelta: 0, loserDelta: 0 };
  }

  const baseWin = 25;
  const baseLoss = 15;

  // Adjust by rating difference: beating a stronger opponent gives more
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
  // Silver floor: can't drop below 950 if currently at 1000+
  if (currentRating >= 1000 && newRating < 950) return 950;
  // Gold floor: can't drop below 1450 if currently at 1500+
  if (currentRating >= 1500 && newRating < 1450) return 1450;
  // Diamond floor: can't drop below 1950 if currently at 2000+
  if (currentRating >= 2000 && newRating < 1950) return 1950;

  return Math.max(0, newRating);
}
