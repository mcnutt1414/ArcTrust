import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        arc: {
          bg: "#0A0B0F",
          surface: "#12141B",
          border: "#1F222C",
          glow: "#7C5CFF",
          accent: "#00E0B0",
          text: "#E6E8EE",
          muted: "#8B90A0",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "arc-gradient":
          "radial-gradient(ellipse at top, rgba(124,92,255,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,224,176,0.10), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
