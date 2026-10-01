import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1D2939",
        slate: "#475467",
        "work-blue": "#1F4E79",
        paper: "#F8FAFC",
        line: "#D0D5DD"
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;

