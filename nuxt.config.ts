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
    preset: process.env.NITRO_PRESET || 'cloudflare_pages',
  },
  routeRules: {
    '/admin/**': { ssr: true },
    '/api/**': { cors: false },
  },
  runtimeConfig: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubAllowedLogin: process.env.GITHUB_ALLOWED_LOGIN || 'peterkimzz',
    githubRepoOwner: process.env.GITHUB_REPO_OWNER || 'peterkimzz',
    githubRepoName: process.env.GITHUB_REPO_NAME || 'www.peterkimzz.com',
    githubRepoBranch: process.env.GITHUB_REPO_BRANCH || 'main',
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.peterkimzz.com',
      githubAllowedLogin: process.env.GITHUB_ALLOWED_LOGIN || 'peterkimzz',
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
