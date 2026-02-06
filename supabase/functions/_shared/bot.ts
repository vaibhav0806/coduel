const adjectives = [
  "Swift", "Clever", "Quiet", "Bold", "Lazy", "Sharp", "Quick", "Witty",
  "Sneaky", "Bright", "Chill", "Funky", "Dusty", "Lucky", "Rusty", "Zippy",
  "Crispy", "Frosty", "Stormy", "Pixel",
];

const nouns = [
  "Coder", "Hacker", "Panda", "Fox", "Ninja", "Wizard", "Tiger", "Eagle",
  "Otter", "Wolf", "Phoenix", "Falcon", "Cobra", "Raven", "Byte", "Node",
  "Stack", "Loop", "Debug", "Kernel",
];

export function generateBotName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

export function generateBotRating(userRating: number): number {
  const offset = Math.floor(Math.random() * 101) - 50; // -50 to +50
  return Math.max(0, userRating + offset);
}

interface BotConfig {
  accuracy: number; // 0.0 - 1.0
  minTimeMs: number;
  maxTimeMs: number;
}

export function getBotConfigForDifficulty(difficulty: number): BotConfig {
  switch (difficulty) {
    case 1:
      return { accuracy: 0.87, minTimeMs: 2000, maxTimeMs: 5000 };
    case 2:
      return { accuracy: 0.82, minTimeMs: 3000, maxTimeMs: 7000 };
    case 3:
      return { accuracy: 0.77, minTimeMs: 4000, maxTimeMs: 9000 };
    case 4:
      return { accuracy: 0.72, minTimeMs: 5000, maxTimeMs: 11000 };
    default:
      return { accuracy: 0.80, minTimeMs: 3000, maxTimeMs: 8000 };
  }
}

export function generateBotAnswer(
  correctAnswer: number,
  totalOptions: number,
  config: BotConfig
): { answer: number; timeMs: number } {
  const isCorrect = Math.random() < config.accuracy;
  let answer: number;

  if (isCorrect) {
    answer = correctAnswer;
  } else {
    // Pick a wrong answer randomly
    do {
      answer = Math.floor(Math.random() * totalOptions);
    } while (answer === correctAnswer);
  }

  const timeMs =
    config.minTimeMs +
    Math.floor(Math.random() * (config.maxTimeMs - config.minTimeMs));

  return { answer, timeMs };
}
