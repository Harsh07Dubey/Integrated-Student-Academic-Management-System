/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F3EFFE',
          100: '#E0D4FD',
          200: '#C1A9FB',
          300: '#A17EF9',
          400: '#8253F7',
          500: '#7849F0',
          600: '#6C3FEE',
          700: '#5A2ED4',
          800: '#4823AA',
          900: '#361A80',
        },
        sidebar: {
          DEFAULT: '#1E1B4B',
          dark: '#161340',
          light: '#2D2A5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
