import { Ionicons } from "@expo/vector-icons";

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const TOPICS: Topic[] = [
  {
    id: "interview",
    name: "Interview Prep",
    description: "Data structures, algorithms & patterns for coding interviews",
    icon: "briefcase",
    color: "#F59E0B",
  },
  {
    id: "fundamentals",
    name: "Fundamentals",
    description: "Core syntax, types, and essential language concepts",
    icon: "school",
    color: "#10B981",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Modern features, complex patterns & deep language knowledge",
    icon: "rocket",
    color: "#8B5CF6",
  },
  {
    id: "fun",
    name: "Fun & Tricky",
    description: "Brain teasers, edge cases & quirky language behaviors",
    icon: "game-controller",
    color: "#EC4899",
  },
];

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function getTopicColor(id: string): string {
  return getTopicById(id)?.color ?? "#6B7280";
}
