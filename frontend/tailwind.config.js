/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme colours come from CSS variables (see src/index.css) so light/dark both work
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        accent2: "rgb(var(--accent2-rgb) / <alpha-value>)",
        accent3: "rgb(var(--accent3-rgb) / <alpha-value>)",
      },
      borderRadius: {
        lg: "0.875rem",
      },
    },
  },
  plugins: [],
};
