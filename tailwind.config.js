/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pastel color palette as CSS variables
        primary: {
          50: '#fcfaff',
          100: '#f8f4ff',
          200: '#f1e9ff',
          300: '#e8dffb',
          400: '#dacbf5',
          500: '#c8a2e8',
          600: '#b57ad8',
          700: '#9d55bd',
          800: '#80459c',
          900: '#6a3a7d',
          950: '#4c255a',
        },
        // Soft lavender as primary
        primaryPastel: '#E8DFF5',
        // Mint as first accent
        accentMint: '#D8F3DC',
        // Peach as second accent
        accentPeach: '#FFE5D9',
        // Additional soft colors
        softLavender: '#E8DFF5',
        softMint: '#D8F3DC',
        softPeach: '#FFE5D9',
        softSky: '#DCEEFB',
        accentCoral: '#FFADAD',
      }
    },
  },
  plugins: [],
}