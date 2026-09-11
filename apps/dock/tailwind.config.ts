import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dock: {
          bg: "rgba(18, 18, 20, 0.82)",
          border: "rgba(255, 255, 255, 0.08)",
          card: "rgba(255, 255, 255, 0.04)",
        },
      },
      boxShadow: {
        dock: "0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        dock: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
