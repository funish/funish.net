import { defineNuxtConfig } from "nuxt/config";
import type { BundledLanguage } from "shiki";
import { bundledLanguagesInfo } from "shiki/bundle/full";

export default defineNuxtConfig({
  ssr: false,

  future: {
    compatibilityVersion: 5,
  },

  experimental: {
    payloadExtraction: "client",
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
      include: [
        "@nuxt/ui/locale",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "@tanstack/vue-table",
        "shiki",
      ],
    },
  },

  modules: ["@nuxt/ui", "@nuxtjs/mdc", "@nuxtjs/i18n", "@vueuse/nuxt"],

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
  },

  mdc: {
    highlight: {
      shikiEngine: "javascript",
      langs: bundledLanguagesInfo.map((lang) => lang.id as BundledLanguage),
    },
  },
});
