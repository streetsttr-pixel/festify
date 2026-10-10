/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf2ff',
          100: '#f9e3ff',
          200: '#f2c6ff',
          300: '#e899ff',
          400: '#d95cff',
          500: '#c42ef5',
          600: '#a815d6',
          700: '#8c12b0',
          800: '#73138f',
          900: '#5f1475',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -6px rgba(16,24,40,.10)',
        glow: '0 10px 40px -10px rgba(196,46,245,.55)',
      },
      keyframes: {
        'toast-in': {
          '0%': { opacity: 0, transform: 'translate(-50%, 16px) scale(.96)' },
          '100%': { opacity: 1, transform: 'translate(-50%, 0) scale(1)' },
        },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'pop-in': {
          '0%': { opacity: 0, transform: 'translateY(12px) scale(.97)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        'highlight': {
          '0%': { backgroundColor: 'rgba(196,46,245,.18)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'toast-in': 'toast-in .28s cubic-bezier(.2,.9,.3,1.2) both',
        'fade-in': 'fade-in .2s ease-out both',
        'pop-in': 'pop-in .3s cubic-bezier(.2,.9,.3,1.1) both',
        'highlight': 'highlight 2.4s ease-out both',
      },
    },
  },
  plugins: [],
}
