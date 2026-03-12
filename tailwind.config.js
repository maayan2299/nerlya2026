/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['David Libre', 'serif'],
        sans: ['Assistant', 'system-ui', 'sans-serif'],
        hebrew: ['Assistant', 'system-ui', 'sans-serif'],
        brand: ['David Libre', 'serif'],
        store: ['David Libre', 'serif'],
        heading: ['Assistant', 'sans-serif'],
        body: ['Assistant', 'sans-serif'],
      },
      colors: {
        neutral: {
          bg: '#F5F5F0',
          text: '#2C2C2C',
          'text-secondary': '#8B8680',
        },
        gold: {
          50: '#fef9e7',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        luxury: {
          gold: '#d4af37',
          'gold-dark': '#b8941f',
          black: '#1a1a1a',
          'black-light': '#2d2d2d',
        }
      },
    },
  },
  plugins: [],
}