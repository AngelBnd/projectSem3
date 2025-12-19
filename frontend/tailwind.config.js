/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slowSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "slow-spin": "slowSpin 2.5s ease-in-out infinite",
      },
      fontFamily: {
        lato: ['"Lato"', "sans-serif"],
        nunito: ['"Nunito Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
