/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        roller: {
          10: '#011840',
          30: '#033180',
          50: '#0960F6',
          90: '#CEDFFD',
          95: '#EBF2FE',
        },
      },
      fontFamily: {
        sans: ['"Proxima Nova"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
