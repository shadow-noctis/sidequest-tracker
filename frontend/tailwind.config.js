/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0a0920',   // deeper cosmic blue-purple base
        surface: '#151232',      // surface panels – soft indigo twilight
        accent: '#7a63d1',       // mystical violet (main highlight)
        accentAlt: '#bfa7ff',    // moonlight glow for headings & borders
        text: '#e8e6ff',         // gentle off-white text for contrast
        muted: '#665a8c',        // subdued violet-gray for secondary text
        success: '#7edfb5',      // soft aurora green
        error: '#f76d6d',        // warmer, glowing red for contrast
      },
      fontFamily: {
        'fell-english': ['"IM Fell English"']
      },
    },
  },
  plugins: [],
};