import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zemin: "#F5F7F7",
        yuzey: "#FFFFFF",
        metin: "#12212B",
        soguk: {
          DEFAULT: "#0E7C86",
          dim: "#0B646C",
          light: "#E4F3F2",
        },
        sicak: {
          DEFAULT: "#E8734A",
          dim: "#C75E39",
          light: "#FCEBE2",
        },
        hat: "#D7E0E1",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
