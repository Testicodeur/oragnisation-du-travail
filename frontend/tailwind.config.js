/***** @type {import('tailwindcss').Config} *****/
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0e',
        surface: '#121317',
        accent: '#8b5cf6', // Violet au lieu du bleu
        muted: '#9aa0a6',
        offwhite: '#f3f4f6',
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.35)'
      }
    },
  },
  plugins: [],
}
