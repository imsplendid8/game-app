import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        app: "430px",
      },
      colors: {
        // 아이돌 키우기 감성: 파스텔 핑크·퍼플·스카이
        ink: "#2b2440",
        subtle: "#8a80a6",
        line: "#f0e6f4",
        bg: "#fff4fb",
        card: "#ffffff",
        brand: {
          DEFAULT: "#ff6f9c",
          deep: "#e84f83",
          soft: "#ffe3ee",
        },
        grape: {
          DEFAULT: "#9b7cf6",
          soft: "#efe8ff",
        },
        sky: {
          DEFAULT: "#5cb8f5",
          soft: "#e3f2ff",
        },
        stat: {
          sense: "#9b7cf6",
          work: "#38c6a4",
          mental: "#ffb454",
          favor: "#ff6f9c",
          leave: "#5cb8f5",
        },
        result: {
          great: "#ff6f9c",
          safe: "#5cb8f5",
          awkward: "#ffb454",
          risky: "#8a80a6",
        },
      },
      boxShadow: {
        glossy: "0 10px 30px -12px rgba(255,111,156,0.45)",
        card: "0 8px 24px -14px rgba(155,124,246,0.35)",
      },
      backgroundImage: {
        "idol-gradient":
          "linear-gradient(160deg,#ffd9ec 0%,#f0e0ff 45%,#dcefff 100%)",
        "brand-gradient": "linear-gradient(135deg,#ff8fb8 0%,#9b7cf6 100%)",
        "shine":
          "linear-gradient(120deg,rgba(255,255,255,0) 30%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0) 70%)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        pop: "pop 0.25s ease-out",
        float: "float 3.5s ease-in-out infinite",
        twinkle: "twinkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
