// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  nitro: {
    publicAssets: [
      { baseURL: 'uploads', dir: './uploads' }
    ]
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
