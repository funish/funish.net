<script setup lang="ts">
import type { Locale } from "@nuxt/ui";
import { en, zh_cn } from "@nuxt/ui/locale";
const { t, setLocale } = useI18n();

const navItems = computed(() => [
  { label: t("nav.home"), to: "/" },
  { label: t("nav.explore"), to: "/explore" },
]);

const footerItems = computed(() => [
  { label: "Nexus", to: "https://nexus.funish.net", target: "_blank" },
]);

const locale = ref("en");

const locales = ref<Locale<any>[]>([
  { code: "en", name: "English", dir: "ltr", messages: en },
  { code: "zh_cn", name: "简体中文", dir: "ltr", messages: zh_cn },
]);
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <UHeader :ui="{ container: 'max-w-7xl' }">
      <template #title>
        <span class="text-lg font-bold">Funish</span>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <UButton
          icon="i-lucide-search"
          variant="ghost"
          :aria-label="t('nav.search')"
          to="/search"
        />
        <ULocaleSelect
          v-model="locale"
          :locales="locales"
          @update:model-value="setLocale($event as 'en' | 'zh_cn')"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <USeparator />

    <UFooter :ui="{ container: 'max-w-7xl' }">
      <template #left>
        <span class="text-muted text-sm"> &copy; {{ new Date().getFullYear() }} Funish </span>
      </template>

      <UNavigationMenu :items="footerItems" variant="link" />

      <template #right>
        <UButton
          to="https://github.com/funish"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
