import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        card: "#F2F2F2",
        ink: "#F5F5F5",
        dim: "#8E8E93",
        line: "#262628",
        panel: "#161618",
        accent: "#FF1A1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "screen-sm": "440px",
      },
    },
  },
  plugins: [],
};

export default config;
