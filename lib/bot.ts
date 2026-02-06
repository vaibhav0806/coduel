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
  const offset = Math.floor(Math.random() * 101) - 50;
  return Math.max(0, userRating + offset);
}
