import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5F0", // 燕麦色/极浅暖灰
        foreground: "#3A3A3A", // 深炭灰
        primary: {
          DEFAULT: "#BCAAA4", // 柔和的陶土色/低饱和度
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D7CCC8", // 浅灰褐色
          foreground: "#3A3A3A",
        },
        accent: {
          DEFAULT: "#A1887F", // 深一点的灰褐
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#EFEBE9", // 非常浅的灰褐
          foreground: "#757575",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#3A3A3A",
        },
        border: "#D7CCC8",
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', "serif"], // 优雅衬线
        sans: ['"Lato"', '"Noto Sans SC"', "sans-serif"], // 无衬线
        liuye: ["LiuYe", "serif"], // 也子工厂柳叶体
        youyou: ["YouYou", "serif"], // 又又意宋
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
export default config;
