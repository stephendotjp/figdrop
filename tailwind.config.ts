import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        card: "#F5F5F5",
        ink: "#111111",
        dim: "#666666",
        line: "#E5E5E5",
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
