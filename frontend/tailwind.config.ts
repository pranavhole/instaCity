import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#050712",
        graphite: "#1a1d33",
        signal: "#ff2f87",
        coral: "#ff7a45",
        skyline: "#7c2be8",
        "brand-panel": "#111326",
        "brand-muted": "#d9d8e8",
        amethyst: "#b238d8"
      },
      boxShadow: {
        glow: "0 0 42px rgba(255, 47, 135, 0.24)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #ff7a45 0%, #ff2f87 52%, #7c2be8 100%)",
        "brand-radial": "radial-gradient(circle at 50% 0%, rgba(255, 122, 69, 0.2), rgba(255, 47, 135, 0.12) 35%, rgba(5, 7, 18, 0) 70%)"
      }
    }
  },
  plugins: []
};

export default config;
