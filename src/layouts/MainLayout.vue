<template>
  <v-app>
    <MainHeader />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import MainHeader from '@/components/headers/MainHeader.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const { setBreadcrumbs, addBreadcrumb, reset } = useBreadcrumbs()

// Временный пример заполенения крошек, не факт что будем наполнять крошки в компонентах
onMounted(() => {
  setBreadcrumbs([{ title: 'Моё пространство', to: '/', icon: 'home' }])
  addBreadcrumb({ title: 'Проект', to: '/' })
  addBreadcrumb({ title: 'Задача-123' })
})

onBeforeUnmount(() => {
  reset()
})
</script>
