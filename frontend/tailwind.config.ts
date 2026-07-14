import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          base: "#08090d",
          raised: "#11131a",
          subtle: "#171a23",
          border: "#242833",
        },
        brand: {
          DEFAULT: "#f4f1e8",
          muted: "#a7a29a",
        },
        accent: {
          green: "#7ee787",
          amber: "#f2cc60",
          red: "#ff7b72",
          blue: "#79c0ff",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.35)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
