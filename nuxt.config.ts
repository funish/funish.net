import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: false,

  future: {
    compatibilityVersion: 5,
  },

  experimental: {
    payloadExtraction: true,
  },

  compatibilityDate: "2026-03-28",

  nitro: {
    future: {
      nativeSWR: true,
    },
  },

  routeRules: {
    "/": { prerender: true },
  },

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  modules: ["@nuxt/ui", "@vueuse/nuxt", "@nuxtjs/i18n"],

  css: ["~/assets/css/main.css"],

  i18n: {
    defaultLocale: "en",
    langDir: "locales",
    locales: [
      {
        code: "en",
        language: "en",
        file: "en.json",
        name: "English",
      },
      {
        code: "zh_cn",
        language: "zh_cn",
        file: "zh_cn.json",
        name: "简体中文",
      },
    ],
    detectBrowserLanguage: {
      cookieCrossOrigin: true,
    },
    strategy: "no_prefix",
    skipSettingLocaleOnNavigate: false,
    differentDomains: false,
  },

  ui: {
    mdc: true,
    experimental: {
      componentDetection: true,
    },
  },
});
