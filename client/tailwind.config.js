/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: ['hover:bg-brand-dark', 'bg-brand-dark'],
  theme: {
    extend: {
      colors: {
        page: '#F7F6F2',
        surface: '#FFFFFF',
        ink: '#252923',
        muted: '#6B7068',
        brand: '#526B55',
        'brand-dark': '#405541',
        line: '#E5E5DC'
      }
    }
  },
  plugins: []
};
