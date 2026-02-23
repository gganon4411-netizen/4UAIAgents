/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0A0A0F',
          800: '#12121A',
          700: '#1A1A25',
          600: '#222230',
          500: '#2A2A3A',
          400: '#3A3A4A',
          300: '#4A4A5A',
          200: '#6A6A7A',
          100: '#8A8A9A',
        },
        violet: {
          DEFAULT: '#7B2FFF',
          light: '#9B5FFF',
          dark: '#5A1FCC',
          glow: 'rgba(123, 47, 255, 0.15)',
        },
        acid: {
          DEFAULT: '#00FF88',
          light: '#33FFAA',
          dark: '#00CC6A',
          glow: 'rgba(0, 255, 136, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
