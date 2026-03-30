/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f5f0', 100: '#c5e7d8', 200: '#9dd5be',
          300: '#6fc0a0', 400: '#4aae88', 500: '#2d9c72',
          600: '#1a5f4a', 700: '#155040', 800: '#0f3d30',
          900: '#082a20',
        },
        accent: { DEFAULT: '#f4a261', light: '#fff4ea' },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
