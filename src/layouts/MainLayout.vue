<template>
  <v-app>
    <MainHeader @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
    <MainSidebar v-model:mobile-open="mobileMenuOpen" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MainHeader from '@/components/headers/MainHeader.vue'
import MainSidebar from '@/components/sidebar/MainSidebar.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const { setBreadcrumbs, addBreadcrumb, reset } = useBreadcrumbs()
const mobileMenuOpen = ref(false)

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
