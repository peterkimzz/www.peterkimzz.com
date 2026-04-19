export default defineNuxtConfig({
  compatibilityDate: '2025-02-20',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/content',
  ],
  css: ['~/assets/css/main.css'],
  nitro: {
    prerender: {
      failOnError: true,
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.peterkimzz.com',
    },
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 3,
        },
      },
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.peterkimzz.com',
    name: 'peterkimzz',
  },
})
