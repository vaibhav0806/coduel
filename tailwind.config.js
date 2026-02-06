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
        // Brand colors
        primary: {
          DEFAULT: "#6366F1", // Indigo
          dark: "#4F46E5",
          light: "#818CF8",
        },
        secondary: {
          DEFAULT: "#06B6D4", // Cyan
          dark: "#0891B2",
          light: "#22D3EE",
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber (for streaks, highlights)
          dark: "#D97706",
          light: "#FBBF24",
        },
        // Battle colors
        win: "#10B981", // Green
        lose: "#EF4444", // Red
        draw: "#6B7280", // Gray
        // Background
        dark: {
          DEFAULT: "#0F0F1A",
          card: "#1A1A2E",
          border: "#2D2D44",
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
