/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        opacityFadeIn: {
          "0%": { opacity: "0.0" },
          "100%": { opacity: "1.0" },
        },
        fontFamily: {
          Harabara: "Harabara",
          Satoshi: "Satoshi",
        },
      },
    },
  },
  plugins: [],
};
