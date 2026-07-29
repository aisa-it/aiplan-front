<template>
  <v-app>
    <MainHeader />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import MainHeader from '@/components/headers/MainHeader.vue'
</script>
