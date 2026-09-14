/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05070d',
          900: '#0a0e17',
          800: '#0f1420',
          700: '#161d2e',
          600: '#1f293d',
          500: '#2b3752',
        },
        accent: {
          DEFAULT: '#BEF264',
          50: '#FDFFF9',
          100: '#FAFFEF',
          200: '#F7FEE7',
          300: '#ECFCCB',
          400: '#D9F99D',
          500: '#BEF264',
          600: '#A3E635',
          700: '#84CC16',
          800: '#65A30D',
          900: '#4D7C0F',
        },
        app: 'rgb(var(--c-app) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        danger: {
          soft: 'rgb(var(--c-danger-soft) / <alpha-value>)',
          text: 'rgb(var(--c-danger-text) / <alpha-value>)',
          line: 'rgb(var(--c-danger-line) / <alpha-value>)',
        },
        success: {
          soft: 'rgb(var(--c-success-soft) / <alpha-value>)',
          text: 'rgb(var(--c-success-text) / <alpha-value>)',
          line: 'rgb(var(--c-success-line) / <alpha-value>)',
        },
        info: {
          soft: 'rgb(var(--c-info-soft) / <alpha-value>)',
          text: 'rgb(var(--c-info-text) / <alpha-value>)',
          line: 'rgb(var(--c-info-line) / <alpha-value>)',
        },
        warning: {
          soft: 'rgb(var(--c-warning-soft) / <alpha-value>)',
          text: 'rgb(var(--c-warning-text) / <alpha-value>)',
          line: 'rgb(var(--c-warning-line) / <alpha-value>)',
        },
        neutral: {
          soft: 'rgb(var(--c-neutral-soft) / <alpha-value>)',
          text: 'rgb(var(--c-neutral-text) / <alpha-value>)',
          line: 'rgb(var(--c-neutral-line) / <alpha-value>)',
        },
        brand: 'rgb(var(--c-brand-text) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(190,242,100,0.2), 0 8px 30px -8px rgba(190,242,100,0.32)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
