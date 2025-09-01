/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "blue-dark": "#2E3DA3",
        "gray-200": "#1E2024",
        "gray-300": "#535964",
        "gray-400": "#858B99",
        "gray-500": "#E3E5E8",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
