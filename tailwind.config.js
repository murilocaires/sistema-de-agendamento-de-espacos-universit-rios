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
        "gray-400": "#6B7280",
        "gray-500": "#374151",
        "gray-600": "#1F2937",
        "gray-700": "#111827",
        "gray-800": "#0F172A",
        "gray-900": "#0A0E1A",
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
