import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream:    '#FFF8F5',
          rose:     '#E8B4C8',
          deeprose: '#D4698A',
          dark:     '#2C1810',
          gold:     '#C9A84C',
          blush:    '#F9EAF0',
          muted:    '#9B7B85',
          border:   '#F0DDE6',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'nav': '64px',
      },
      boxShadow: {
        'card':  '0 2px 16px rgba(44, 24, 16, 0.08)',
        'card-hover': '0 8px 32px rgba(44, 24, 16, 0.15)',
        'nav':   '0 -1px 20px rgba(44, 24, 16, 0.08)',
      },
      borderRadius: {
        'card': '16px',
        'btn':  '12px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
