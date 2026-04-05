import { defineNuxtConfig } from "nuxt/config";
import type { BundledLanguage } from "shiki";
import { bundledLanguagesInfo } from "shiki/bundle/full";

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
    experimental: {
      wasm: true,
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
        "@shikijs/core",
        "@shikijs/engine-javascript",
        "@shikijs/engine-oniguruma",
        "@shikijs/langs/*",
        "@shikijs/themes/material-theme-lighter",
        "@shikijs/themes/material-theme-palenight",
        "@shikijs/themes/material-theme",
        "@shikijs/transformers",
        "shiki/wasm",
      ],
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
  },

  mdc: {
    highlight: {
      langs: bundledLanguagesInfo.map((lang) => lang.id as BundledLanguage),
    },
  },
});
