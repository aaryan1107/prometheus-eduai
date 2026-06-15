/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        edu: {
          ink: "#102033",
          muted: "#687588",
          blue: "#2f76e8",
          green: "#1f9d7a",
          cream: "#f7fbff",
          line: "#dce6f2",
          lavender: "#ece9ff",
          rose: "#ffe5e5",
          gold: "#fff4cf"
        }
      },
      boxShadow: {
        soft: "0 22px 60px rgba(30, 71, 121, 0.12)"
      }
    }
  },
  plugins: []
};
