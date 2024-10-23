/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',  // For files in the "pages" directory
    './components/**/*.{js,ts,jsx,tsx}', // For files in the "components" directory
    './app/**/*.{js,ts,jsx,tsx}', // For Next.js 13+ "app" directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
