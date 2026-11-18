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
          50: '#eaf5f2',
          100: '#d6ece6',
          200: '#b4ded3',
          300: '#7bcbba',
          400: '#43ad97',
          500: '#168573',
          600: '#086759',
          700: '#07594d',
          800: '#064a40',
          900: '#073b35',
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
