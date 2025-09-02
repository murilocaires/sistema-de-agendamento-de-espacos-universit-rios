/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "blue-dark": "#2E3DA3",
        "blue-base": "#5165E1",
        "blue-light": "#8996EB",
        "gray-100": "#151619",
        "gray-200": "#1E2024",
        "gray-300": "#535964",
        "gray-400": "#858B99",
        "gray-500": "#E3E5E8",
        "gray-600": "#F9FAFA",
        "feedback-danger": "#D03E3E",
        "feedback-open": "#CC3D6A",
        "feedback-progress": "#355EC5",
        "feedback-done": "#508B26",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
