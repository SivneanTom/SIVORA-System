export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"','Georgia','serif'],
        sans: ['"Inter"','system-ui','sans-serif'],
      },
      colors: {
        cream: '#F7F4EF',
        sand: '#E8E0D5',
        stone: '#B8A99A',
        espresso: '#2C2018',
        charcoal: '#1A1A1A',
      },
    },
  },
  plugins: [],
}
