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
        brand: {
          50: "#f0faf6",
          100: "#d8f3e8",
          200: "#b3e6d3",
          300: "#7fd2b6",
          400: "#42b694",
          500: "#1d9675",
          600: "#12785d",
          700: "#0f5f4b",
          800: "#0f4c3c",
          900: "#0c3e32",
          950: "#06241c",
        },
        gold: {
          50: "#fffdf5",
          100: "#fef8e1",
          200: "#fcf0c2",
          300: "#f8e396",
          400: "#f1d063",
          500: "#dfb738",
          600: "#c39626",
          700: "#9e711d",
          800: "#825b1e",
          900: "#6e4c1d",
          950: "#40280b",
        },
        phflag: {
          blue: "#0038a8",
          red: "#ce1126",
          yellow: "#fcd116",
        }
      },
    },
  },
  plugins: [],
};
export default config;
