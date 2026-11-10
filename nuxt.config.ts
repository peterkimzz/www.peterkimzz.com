import process from "node:process";

const siteUrl =
  process.env.NUXT_PUBLIC_SITE_URL || "https://www.peterkimzz.com";
export default defineNuxtConfig({
  compatibilityDate: "2025-02-20",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxtjs/sitemap",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/content",
  ],
  css: [
    "@fontsource/pretendard/400.css",
    "@fontsource/pretendard/500.css",
    "@fontsource/pretendard/600.css",
    "@fontsource/pretendard/700.css",
    "@fontsource/pretendard/800.css",
    "@fontsource/jetbrains-mono/400.css",
    "@fontsource/jetbrains-mono/500.css",
    "@fontsource/jetbrains-mono/600.css",
    "@fontsource/jetbrains-mono/700.css",
    "~/assets/css/main.css",
  ],
  ui: {
    fonts: false,
  },
  nitro: {
    prerender: {
      failOnError: true,
      // /foo 를 foo.html 로 만든다. Cloudflare Pages 가 /foo -> /foo/ 리다이렉트를 하지 않게 한다.
      autoSubfolderIndex: false,
    },
  },
  runtimeConfig: {
    public: {
      siteUrl,
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
    url: siteUrl,
    name: "peterkimzz",
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
    exclude: [
      "/200",
      "/404",
      "/_payload.json",
      "/api/__sitemap__/**",
      "/__nuxt_content/**",
    ],
  },
});
