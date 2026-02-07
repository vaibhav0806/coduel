/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors - Neon Green theme
        primary: {
          DEFAULT: "#39FF14", // Neon Green
          dark: "#32E012",
          light: "#5FFF42",
        },
        secondary: {
          DEFAULT: "#8B5CF6", // Purple
          dark: "#7C3AED",
          light: "#A78BFA",
        },
        accent: {
          DEFAULT: "#FF6B35", // Orange (for streaks, highlights)
          dark: "#E85A2A",
          light: "#FF8F66",
        },
        // Battle colors
        win: "#10B981", // Green
        lose: "#EF4444", // Red
        draw: "#6B7280", // Gray
        // Background - Near black
        dark: {
          DEFAULT: "#050508",
          card: "#0A0A0F",
          border: "#1A1A24",
          elevated: "#0F0F14",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
