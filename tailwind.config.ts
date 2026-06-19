import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0F",
        card: "#12121A",
        panel: "#1A1A28",
        gold: "#F0C060",
        pink: "#E8629A",
        teal: "#3DE8C8",
        purple: "#9B6FE8",
        ink: "#F0EFF8",
        dim: "#8885A8",
        muted: "#4A4870",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "screen-sm": "430px",
      },
    },
  },
  plugins: [],
};

export default config;
