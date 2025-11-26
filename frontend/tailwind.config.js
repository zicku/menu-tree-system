/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          primary: "#253BFF",
          hover: "#1a2bbf",
        },
        gray: {
          bg: "#F9FAFB",
          item: "#101828",
          text: "#475467",
        },
      },
    },
  },
  plugins: [],
};
