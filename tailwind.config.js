/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Marine light palette
        ink: {
          DEFAULT: '#0A1F33',
          soft: '#33506B',
          muted: '#6B819A',
        },
        navy: {
          50: '#EEF3F8',
          100: '#D8E3EF',
          200: '#B0C6DD',
          300: '#7E9EC0',
          400: '#4E739B',
          500: '#2E5680',
          600: '#1C3F66',
          700: '#133252',
          800: '#0E2640',
          900: '#0A1F33',
        },
        teal: {
          50: '#E6F7F6',
          100: '#C5ECEA',
          200: '#8FD9D6',
          300: '#54C2BE',
          400: '#27A8A3',
          500: '#0F8D89',
          600: '#0A7370',
          700: '#0A5C5A',
        },
        canvas: '#F1F5F9',
        surface: '#FFFFFF',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10,31,51,0.04), 0 10px 28px -12px rgba(10,31,51,0.14)',
        'soft-lg': '0 2px 4px rgba(10,31,51,0.05), 0 24px 56px -24px rgba(10,31,51,0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.32,0.72,0,1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.32,0.72,0,1) both',
      },
    },
  },
  plugins: [],
}
