/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ignite-orange': '#F07B2A',
        'ignite-orange-dark': '#D46A20',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        rammetto: ['"Rammetto One"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
