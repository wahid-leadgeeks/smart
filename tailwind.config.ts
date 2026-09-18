import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#FBFBF9",
          card: "#FFFFFF",
          hover: "#F7F6F2",
          border: "#E7E5E0",
          "border-strong": "#D1CFC7",
        },
        ink: {
          primary: "#1C1917",
          secondary: "#57534E",
          muted: "#A8A29E",
        },
        badge: {
          completed: "#15803D",
          "completed-bg": "#F0FDF4",
          "completed-border": "#BBF7D0",
          progress: "#C2410C",
          "progress-bg": "#FFF7ED",
          "progress-border": "#FED7AA",
          notstarted: "#475569",
          "notstarted-bg": "#F8FAFC",
          "notstarted-border": "#E2E8F0",
        },
        accent: {
          breakthrough: "#4338CA",
          "breakthrough-bg": "#EEF2FF",
          improvement: "#0F766E",
          "improvement-bg": "#F0FDFA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        drawer: "0 25px 50px -12px rgba(28, 25, 23, 0.15)",
        subtle: "0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        card: "0 1px 4px 0 rgba(28, 25, 23, 0.06), 0 4px 10px -2px rgba(28, 25, 23, 0.03)",
        elevated: "0 10px 25px -5px rgba(28, 25, 23, 0.08), 0 8px 10px -6px rgba(28, 25, 23, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
