<script setup lang="ts"></script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>AIPlan</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-lightbulb-on-outline" />
        <v-btn icon="mdi-account-circle" />
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
