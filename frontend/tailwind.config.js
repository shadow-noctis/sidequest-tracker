/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0d0b1e',
        surface: '#1a1633',
        accent: '#8e7cc3',
        accentAlt: '#d9b3ff',
        text: '#eae6ff',
        muted: '#73648a',
        success: '#9bd7b7',
        error: '#ef5350'
      },
      fontFamily: {
        'fell-english': ['"IM Fell English"']
      },
    },
  },
  plugins: [],
};