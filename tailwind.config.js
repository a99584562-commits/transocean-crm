/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Трансоушен — marine ocean blue
        brand: {
          50: '#ecf5ff',
          100: '#d4e8ff',
          200: '#aed5ff',
          300: '#79bbff',
          400: '#3f97ff',
          500: '#1a78f0',
          600: '#0b60d8',
          700: '#0c4eb0',
          800: '#0f418c',
          900: '#123363',
        },
        // secondary marine accent
        teal: {
          50: '#e6f7f6',
          100: '#c5ecea',
          200: '#8fd9d6',
          300: '#54c2be',
          400: '#27a8a3',
          500: '#0f8d89',
          600: '#0a7370',
          700: '#0a5c5a',
        },
        // kept for subtle cool fills used across modules
        navy: {
          50: '#eef3f8',
          100: '#dce7f1',
          200: '#b0c6dd',
          300: '#7e9ec0',
          400: '#4e739b',
          500: '#2e5680',
          600: '#1c3f66',
          700: '#133252',
          800: '#0e2640',
          900: '#0a1f33',
        },
        ink: {
          DEFAULT: '#0d1326',
          900: '#0d1326',
          700: '#2a3145',
          500: '#5b6479',
          400: '#838ca0',
          300: '#aab2c4',
          soft: '#2a3145',
          muted: '#5b6479',
        },
        canvas: '#f5f7fb',
        surface: '#ffffff',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,28,64,0.04), 0 8px 24px -12px rgba(16,28,64,0.12)',
        'soft-lg': '0 2px 4px rgba(16,28,64,0.05), 0 18px 40px -16px rgba(16,28,64,0.22)',
        lift: '0 2px 4px rgba(16,28,64,0.05), 0 18px 40px -16px rgba(16,28,64,0.22)',
        glow: '0 10px 36px -12px rgba(11,96,216,0.5)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
        xl2: '1.25rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.32,0.72,0,1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.32,0.72,0,1) both',
        'slide-in': 'slide-in 0.45s cubic-bezier(0.32,0.72,0,1) both',
      },
    },
  },
  plugins: [],
}
