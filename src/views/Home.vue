<script setup lang="ts">
import { useAppTheme } from '@/modules/profile/composables/useAppTheme';

const { isDark, toggleTheme } = useAppTheme();
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>AIPlan</v-app-bar-title>

      <template #append>
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-lightbulb-on-outline'"
          @click="toggleTheme"
        />
        <v-btn icon="mdi-account-circle" />
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
