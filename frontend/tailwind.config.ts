import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#101820",
        graphite: "#1f2937",
        signal: "#19c2a0",
        coral: "#ff6b6b",
        skyline: "#6ea8fe"
      },
      boxShadow: {
        glow: "0 0 40px rgba(25, 194, 160, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
