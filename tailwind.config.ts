import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

export default <Partial<Config>> {
  content: [
    './assets/styles/*.css',
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
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
