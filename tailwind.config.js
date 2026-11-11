/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        telegram: '#2AABEE',
        'telegram-dark': '#229ED9',
      },
    },
  },
  plugins: [],
};
