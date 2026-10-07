/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(255 255 255 / <alpha-value>)",
        foreground: "rgb(9 9 9 / <alpha-value>)",
        card: "rgb(255 255 255 / <alpha-value>)",
        "card-foreground": "rgb(9 9 9 / <alpha-value>)",
        primary: "rgb(9 9 9 / <alpha-value>)",
        "primary-foreground": "rgb(255 255 255 / <alpha-value>)",
        secondary: "rgb(245 245 245 / <alpha-value>)",
        "secondary-foreground": "rgb(9 9 9 / <alpha-value>)",
        accent: "rgb(255 140 66 / <alpha-value>)",
        "accent-foreground": "rgb(255 255 255 / <alpha-value>)",
        muted: "rgb(245 245 245 / <alpha-value>)",
        "muted-foreground": "rgb(115 115 115 / <alpha-value>)",
        border: "rgb(229 229 229 / <alpha-value>)",
        input: "rgb(229 229 229 / <alpha-value>)",
      },
      lineClamp: {
        2: "2",
      },
    },
  },
  darkMode: "class",
}
