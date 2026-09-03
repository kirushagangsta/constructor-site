import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

export default <Partial<Config>> {
  content: [
    './assets/styles/*.css',
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './constants/**/*.ts',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    // Значения ссылаются на css-переменные из assets/scss/_tokens.scss —
    // редизайн делается там, классы в компонентах остаются прежними
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-accent': 'var(--color-bg-accent)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        primary: 'var(--color-primary)',
        'primary-strong': 'var(--color-primary-strong)',
        'primary-soft': 'var(--color-primary-soft)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        border: 'var(--color-border)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        pop: 'var(--shadow-pop)'
      }
    },
    screens: {
      xxs: '376px',
      xs: '576px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1440px'
    },
    fontFamily: {
      lora: ['Lora', 'serif'],
      main: 'var(--font-main)',
      mono: ['Consolas', 'Menlo', 'monospace']
    }
  },
  corePlugins: {
    container: false
  },
  plugins: [
    plugin(({ addComponents }) => {
      addComponents({
        '.container': {
          position: 'relative',
          maxWidth: '100%',
          width: '100%',
          flex: '1 0 auto',
          margin: '0 auto',
          '@screen xs': {
            maxWidth: '576px'
          },
          '@screen sm': {
            maxWidth: '768px'
          },
          '@screen md': {
            maxWidth: '992px'
          },
          '@screen lg': {
            maxWidth: '1200px'
          },
          '@screen xl': {
            maxWidth: '1440px'
          }
        }
      })
    })
  ]
}
