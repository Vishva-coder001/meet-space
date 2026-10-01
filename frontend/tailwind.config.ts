import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1D2939",
          50: "#F8FAFC",
          100: "#EAECF0",
          200: "#D0D5DD",
          300: "#98A2B3",
          400: "#667085",
          500: "#475467",
          600: "#344054",
          700: "#1D2939",
          800: "#101828",
          900: "#0C111D",
        },
        slate: {
          DEFAULT: "#475467",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475467",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        "work-blue": {
          DEFAULT: "#1F4E79",
          50: "#F0F7FD",
          100: "#E0EFFB",
          200: "#B9DCF6",
          300: "#7DC0EE",
          400: "#3B9FE3",
          500: "#1F4E79",
          600: "#184064",
          700: "#143350",
          800: "#112940",
          900: "#0E2133",
        },
        paper: {
          DEFAULT: "#F8FAFC",
          light: "#FFFFFF",
          subtle: "#F4F7FB",
          dark: "#EEF2F6",
        },
        line: {
          DEFAULT: "#D0D5DD",
          subtle: "#EAECF0",
          strong: "#98A2B3",
        },
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        "subtle-sm": "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        subtle: "0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.05)",
        "subtle-md": "0 4px 12px -2px rgba(16, 24, 40, 0.06), 0 2px 6px -2px rgba(16, 24, 40, 0.04)",
        "subtle-lg": "0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 4px 8px -2px rgba(16, 24, 40, 0.03)",
        "brand-glow": "0 0 20px -3px rgba(31, 78, 121, 0.18)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
