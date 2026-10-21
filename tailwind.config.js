/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFEDB",
        foreground: "#383939",
        card: "#ffffff",
        "card-foreground": "#383939",
        primary: "#149C68",
        "primary-foreground": "#ffffff",
        secondary: "#AEE637",
        "secondary-foreground": "#383939",
        muted: "#f0f5e8",
        "muted-foreground": "#5a6b5a",
        accent: "#38C958",
        "accent-foreground": "#ffffff",
        border: "rgba(56,57,57,0.15)",
      },
    },
  },
  plugins: [],
};
