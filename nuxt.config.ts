import process from "node:process";

const siteUrl =
  process.env.NUXT_PUBLIC_SITE_URL || "https://www.peterkimzz.com";
const studioModerator = "peterkimzz69@gmail.com";

if (
  process.env.VERCEL &&
  process.env.STUDIO_GITHUB_MODERATORS !== studioModerator
) {
  throw new Error(
    `STUDIO_GITHUB_MODERATORS must be set to ${studioModerator} on Vercel.`,
  );
}

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
    "nuxt-studio",
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
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/**": {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
    "/admin": {
      isr: false,
      headers: {
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
    },
    "/admin/**": {
      isr: false,
      headers: {
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
    },
    "/__nuxt_studio/**": {
      isr: false,
      headers: {
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
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
  studio: {
    route: "/admin",
    repository: {
      provider: "github",
      owner: "peterkimzz",
      repo: "www.peterkimzz.com",
      branch: "main",
      rootDir: "",
      private: false,
    },
    i18n: {
      defaultLocale: "ko",
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
      "/admin",
      "/admin/**",
      "/api/__sitemap__/**",
      "/__nuxt_content/**",
      "/__nuxt_studio/**",
    ],
  },
});
