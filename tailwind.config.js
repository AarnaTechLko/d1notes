/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',  // For files in the "pages" directory
    './components/**/*.{js,ts,jsx,tsx}', // For files in the "components" directory
    './app/**/*.{js,ts,jsx,tsx}', // For Next.js 13+ "app" directory
  ],
  theme: {
    extend: {
      colors: {
        customBlue: 'rgb(156, 185, 231)',
      },
      keyframes: {
        'bounce-continuous': {
          '0%, 100%': {
            transform: 'translateY(0)', // At start and end, no movement
          },
          '50%': {
            transform: 'translateY(-15px)', // Midway, character jumps up
          },
        },
      },
      animation: {
        'bounce-continuous': 'bounce-continuous 1s ease-in-out infinite', // Infinite bounce animation
      },
    },
  },
  plugins: [],
};
