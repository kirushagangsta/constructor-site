// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  app: {
    head: {
      link: [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '@/assets/scss/tailwind.scss',
    viewer: false
  },

  css: [
    '@/assets/scss/main.scss'
  ],

  devtools: { enabled: true },
})
